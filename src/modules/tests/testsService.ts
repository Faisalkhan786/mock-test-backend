import { sequelize, Question, Test, TestQuestion, Attempt } from "../../models";
import { redis, cached } from "../../config/redis";
import { AppError } from "../../middlewares/error";
import { debitCredit } from "../wallet/walletService";

type Lang = "hi" | "en";

// MySQL JSON columns kabhi-kabhi array ke bajaye string ("[...]") wapas dete hain.
// Ye helper hamesha ek proper array deta hai — frontend .map safe rahe.
function toArr(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

// List tests for a class — optionally filtered by subject. Cached in Redis 5 min.
// Cache key includes subject so har subject ka apna cache ho.
export async function listTests(
  classLevel: number,
  type: "mock" | "pyq",
  lang: Lang,
  subject?: string
) {
  const key = `tests:${classLevel}:${type}:${lang}:${subject ?? "all"}`;
  return cached(key, 300, async () => {
    const tests = await Test.findAll({
      where: { classLevel, type, ...(subject ? { subject } : {}) },
      order: [["id", "DESC"]],
    });
    return tests.map((t) => ({
      id: t.id,
      title: lang === "hi" ? t.titleHi : t.titleEn,
      subject: t.subject,
      durationMin: t.durationMin,
      totalMarks: t.totalMarks,
      isFree: t.isFree,
    }));
  });
}

// Subject list with test count (Home page ke subject cards ke liye).
export async function listSubjects(classLevel: number, type: "mock" | "pyq") {
  return cached(`subjects:${classLevel}:${type}`, 300, async () => {
    const rows = await Test.findAll({
      where: { classLevel, type },
      attributes: [
        "subject",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["subject"],
      raw: true,
    });
    return (rows as unknown as { subject: string; count: number }[]).map((r) => ({
      subject: r.subject,
      count: Number(r.count),
    }));
  });
}

// Start a test: spend 1 credit (unless free), create an attempt, and return
// questions WITHOUT the correct answer. correctIndex never goes to the client.
export async function startTest(userId: number, testId: number, lang: Lang) {
  const test = await Test.findByPk(testId);
  if (!test) throw new AppError(404, "Test not found");

  if (!test.isFree) {
    await debitCredit(userId, `test:${testId}`);
  }

  const links = await TestQuestion.findAll({
    where: { testId },
    order: [["order", "ASC"]],
  });
  const questionIds = links.map((l) => l.questionId);
  const questions = await Question.findAll({ where: { id: questionIds } });
  const byId = new Map(questions.map((q) => [q.id, q]));

  const attempt = await Attempt.create({ userId, testId, status: "started" });

  const payload = questionIds
    .map((qid) => byId.get(qid))
    .filter((q): q is Question => !!q)
    .map((q) => ({
      id: q.id,
      question: lang === "hi" ? q.questionHi : q.questionEn,
      options: toArr(lang === "hi" ? q.optionsHi : q.optionsEn),
      // NOTE: no correctIndex here — anti-cheat.
    }));

  return {
    attemptId: attempt.id,
    durationMin: test.durationMin,
    negativeMarks: test.negativeMarks,
    questions: payload,
  };
}

// Submit answers: score on the server, save the attempt, update the leaderboard.
// answers = { [questionId]: chosenIndex }
export async function submitTest(
  userId: number,
  attemptId: number,
  answers: Record<number, number>,
  lang: Lang
) {
  const attempt = await Attempt.findByPk(attemptId);
  if (!attempt || attempt.userId !== userId) throw new AppError(404, "Attempt not found");
  if (attempt.status === "submitted") throw new AppError(409, "Already submitted");

  const test = await Test.findByPk(attempt.testId);
  if (!test) throw new AppError(404, "Test not found");

  const links = await TestQuestion.findAll({ where: { testId: attempt.testId } });
  const questions = await Question.findAll({ where: { id: links.map((l) => l.questionId) } });

  let correct = 0;
  let score = 0;
  const review = questions.map((q) => {
    const chosen = answers[q.id];
    const isCorrect = chosen === q.correctIndex;
    if (chosen === undefined || chosen === null) {
      // unattempted — no negative marking
    } else if (isCorrect) {
      correct += 1;
      score += 1;
    } else {
      score -= test.negativeMarks;
    }
    return {
      id: q.id,
      question: lang === "hi" ? q.questionHi : q.questionEn,
      options: toArr(lang === "hi" ? q.optionsHi : q.optionsEn),
      chosen: chosen ?? null,
      correctIndex: q.correctIndex, // safe now — test is over
      solution: lang === "hi" ? q.solutionHi : q.solutionEn,
      isCorrect,
    };
  });

  score = Math.max(0, Number(score.toFixed(2)));
  attempt.answers = answers;
  attempt.score = score;
  attempt.correctCount = correct;
  attempt.status = "submitted";
  attempt.submittedAt = new Date();
  await attempt.save();

  // Leaderboard via Redis sorted set — O(log n) rank, no heavy SQL.
  const lbKey = `lb:test:${attempt.testId}`;
  await redis.zadd(lbKey, score, String(userId));
  const rankFromTop = await redis.zrevrank(lbKey, String(userId));
  const rank = rankFromTop === null ? null : rankFromTop + 1;
  if (rank !== null) {
    attempt.rank = rank;
    await attempt.save();
  }

  return {
    attemptId: attempt.id,
    score,
    correctCount: correct,
    total: questions.length,
    rank,
    review,
  };
}
