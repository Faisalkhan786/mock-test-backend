// Subject-wise demo tests seed karo (Class 10). Run: npm run seed
// Idempotent: purana demo data pehle clear karta hai (duplicate na banein).
import { connectDb } from "./config/db";
import { sequelize, Question, Test, TestQuestion } from "./models";
import { redis } from "./config/redis";

type Q = {
  hi: string;
  en: string;
  optsHi: string[];
  optsEn: string[];
  correct: number;
  solHi: string;
  solEn: string;
  chapter: string;
};

type Paper = { titleHi: string; titleEn: string; subject: string; questions: Q[] };

const papers: Paper[] = [
  {
    titleHi: "Maths — Mock Test 1",
    titleEn: "Maths — Mock Test 1",
    subject: "Maths",
    questions: [
      {
        hi: "2x + 3 = 7 ho to x kya hoga?",
        en: "If 2x + 3 = 7, what is x?",
        optsHi: ["1", "2", "3", "4"],
        optsEn: ["1", "2", "3", "4"],
        correct: 1,
        solHi: "2x = 4, isliye x = 2.",
        solEn: "2x = 4, so x = 2.",
        chapter: "Linear Equations",
      },
      {
        hi: "Ek tribhuj ke andar kono ka yog kitna hota hai?",
        en: "Sum of interior angles of a triangle?",
        optsHi: ["90°", "180°", "270°", "360°"],
        optsEn: ["90°", "180°", "270°", "360°"],
        correct: 1,
        solHi: "Tribhuj ke teeno kono ka yog hamesha 180° hota hai.",
        solEn: "The three interior angles add up to 180°.",
        chapter: "Triangles",
      },
      {
        hi: "√144 kitna hai?",
        en: "What is √144?",
        optsHi: ["10", "11", "12", "14"],
        optsEn: ["10", "11", "12", "14"],
        correct: 2,
        solHi: "12 × 12 = 144, isliye √144 = 12.",
        solEn: "12 × 12 = 144, so √144 = 12.",
        chapter: "Real Numbers",
      },
    ],
  },
  {
    titleHi: "Science — Mock Test 1",
    titleEn: "Science — Mock Test 1",
    subject: "Science",
    questions: [
      {
        hi: "Paani ka rasayanik sutra kya hai?",
        en: "Chemical formula of water?",
        optsHi: ["CO₂", "H₂O", "O₂", "NaCl"],
        optsEn: ["CO₂", "H₂O", "O₂", "NaCl"],
        correct: 1,
        solHi: "Paani = 2 hydrogen + 1 oxygen = H₂O.",
        solEn: "Water = 2 hydrogen + 1 oxygen = H₂O.",
        chapter: "Chemical Reactions",
      },
      {
        hi: "Cell ka 'powerhouse' kise kehte hain?",
        en: "Which is called the 'powerhouse' of the cell?",
        optsHi: ["Nucleus", "Mitochondria", "Ribosome", "Golgi body"],
        optsEn: ["Nucleus", "Mitochondria", "Ribosome", "Golgi body"],
        correct: 1,
        solHi: "Mitochondria energy (ATP) banata hai, isliye powerhouse.",
        solEn: "Mitochondria makes energy (ATP), so it's the powerhouse.",
        chapter: "Life Processes",
      },
      {
        hi: "Prakash ki chaal (vacuum me) lagbhag kitni hai?",
        en: "Approximate speed of light in vacuum?",
        optsHi: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10⁵ m/s", "3×10¹⁰ m/s"],
        optsEn: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10⁵ m/s", "3×10¹⁰ m/s"],
        correct: 0,
        solHi: "Prakash ki chaal ≈ 3×10⁸ meter/second.",
        solEn: "Speed of light ≈ 3×10⁸ metres/second.",
        chapter: "Light",
      },
    ],
  },
  {
    titleHi: "Social Science — Mock Test 1",
    titleEn: "Social Science — Mock Test 1",
    subject: "Social Science",
    questions: [
      {
        hi: "Bharat ki rajdhani kya hai?",
        en: "What is the capital of India?",
        optsHi: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
        optsEn: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
        correct: 1,
        solHi: "Bharat ki rajdhani New Delhi hai.",
        solEn: "The capital of India is New Delhi.",
        chapter: "Polity",
      },
      {
        hi: "'Quit India Movement' kis saal shuru hua?",
        en: "In which year did the Quit India Movement start?",
        optsHi: ["1942", "1930", "1947", "1919"],
        optsEn: ["1942", "1930", "1947", "1919"],
        correct: 0,
        solHi: "Quit India Movement 1942 me shuru hua tha.",
        solEn: "The Quit India Movement began in 1942.",
        chapter: "Nationalism in India",
      },
      {
        hi: "Bharat ki sabse lambi nadi kaunsi hai?",
        en: "Which is the longest river in India?",
        optsHi: ["Yamuna", "Ganga", "Godavari", "Narmada"],
        optsEn: ["Yamuna", "Ganga", "Godavari", "Narmada"],
        correct: 1,
        solHi: "Ganga Bharat ki sabse lambi nadi hai (~2525 km).",
        solEn: "The Ganga is India's longest river (~2525 km).",
        chapter: "Resources & Geography",
      },
    ],
  },
];

async function seed() {
  await connectDb();

  // Purana demo data hatao (idempotent seeding).
  await TestQuestion.destroy({ where: {} });
  await Test.destroy({ where: {} });
  await Question.destroy({ where: {} });

  for (const paper of papers) {
    const created = await Question.bulkCreate(
      paper.questions.map((q) => ({
        questionHi: q.hi,
        questionEn: q.en,
        optionsHi: q.optsHi,
        optionsEn: q.optsEn,
        correctIndex: q.correct,
        solutionHi: q.solHi,
        solutionEn: q.solEn,
        subject: paper.subject,
        chapter: q.chapter,
        classLevel: 10,
      }))
    );

    const test = await Test.create({
      titleHi: paper.titleHi,
      titleEn: paper.titleEn,
      type: "mock",
      classLevel: 10,
      subject: paper.subject,
      durationMin: 10,
      totalMarks: created.length,
      negativeMarks: 0.25,
      isFree: true, // free -> bina credit ke test karo
    });

    await TestQuestion.bulkCreate(
      created.map((q, i) => ({ testId: test.id, questionId: q.id, order: i + 1 }))
    );

    console.log(`✅ ${paper.subject}: test #${test.id} (${created.length} Q)`);
  }

  // Redis cache clear karo taaki app turant naya data dikhaye (5 min wait na ho).
  const stale = [...(await redis.keys("tests:*")), ...(await redis.keys("subjects:*"))];
  if (stale.length) await redis.del(...stale);

  console.log(`🎉 Seeded ${papers.length} subject-wise tests`);
  await redis.quit();
  await sequelize.close();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
