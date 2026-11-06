import { Router, Response } from "express";
import { z } from "zod";
import { AuthedRequest, auth } from "../../middlewares/auth";
import { wrap } from "../../middlewares/error";
import { User } from "../../models";
import { listTests, listSubjects, startTest, submitTest } from "./testsService";

const router = Router();

// Resolve the language for this request: query override else user's saved pref.
async function langOf(req: AuthedRequest): Promise<"hi" | "en"> {
  const q = req.query.lang;
  if (q === "hi" || q === "en") return q;
  const user = await User.findByPk(req.userId, { attributes: ["language"] });
  return (user?.language as "hi" | "en") ?? "hi";
}

// GET /tests/subjects?class=10&type=mock  -> [{ subject, count }]
router.get(
  "/subjects",
  auth,
  wrap(async (req: AuthedRequest, res: Response) => {
    const classLevel = Number(req.query.class ?? 10);
    const type = (req.query.type === "pyq" ? "pyq" : "mock") as "mock" | "pyq";
    const subjects = await listSubjects(classLevel, type);
    res.json({ subjects });
  })
);

// GET /tests?class=10&type=mock&lang=hi&subject=Maths
router.get(
  "/",
  auth,
  wrap(async (req: AuthedRequest, res: Response) => {
    const classLevel = Number(req.query.class ?? 10);
    const type = (req.query.type === "pyq" ? "pyq" : "mock") as "mock" | "pyq";
    const subject = typeof req.query.subject === "string" ? req.query.subject : undefined;
    const data = await listTests(classLevel, type, await langOf(req), subject);
    res.json({ tests: data });
  })
);

// POST /tests/:id/start
router.post(
  "/:id/start",
  auth,
  wrap(async (req: AuthedRequest, res: Response) => {
    const testId = Number(req.params.id);
    const data = await startTest(req.userId!, testId, await langOf(req));
    res.json(data);
  })
);

// POST /tests/attempt/:attemptId/submit  { answers: { qId: index } }
const submitSchema = z.object({
  answers: z.record(z.coerce.number(), z.number().int().min(0).max(3)),
});
router.post(
  "/attempt/:attemptId/submit",
  auth,
  wrap(async (req: AuthedRequest, res: Response) => {
    const attemptId = Number(req.params.attemptId);
    const { answers } = submitSchema.parse(req.body);
    const result = await submitTest(req.userId!, attemptId, answers as Record<number, number>, await langOf(req));
    res.json(result);
  })
);

export default router;
