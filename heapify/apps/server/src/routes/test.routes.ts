import { Router } from "express";
import { verifyAccessToken } from "../middleware/auth.middleware";
import { getResult, getTestById, submitTest } from "../services/portal.service";

const router = Router();
router.use(verifyAccessToken);

router.get("/:testId", (req, res) => {
  const test = getTestById(req.params.testId);
  if (!test) return res.status(404).json({ success: false, message: "Test not found" });
  return res.json({ success: true, data: test });
});

router.post("/:testId/submit", (req, res) => {
  const result = submitTest(req.params.testId, req.body.answers || {}, Number(req.body.time_taken_seconds || 0));
  return res.json({ success: true, data: result });
});

router.get("/:testId/result", (req, res) => {
  const result = getResult(req.params.testId);
  if (!result) return res.status(404).json({ success: false, message: "Result not found" });
  return res.json({ success: true, data: result });
});

export default router;
