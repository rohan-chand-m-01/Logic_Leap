import { Router } from "express";
import multer from "multer";
import { verifyAccessToken } from "../middleware/auth.middleware";
import { getAISessions, getSessionMessages, processAITutorMessage, transcribeVoice, updateCognitiveProfile } from "../services/ai-tutor.service";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
router.use(verifyAccessToken);

router.get("/sessions", (req, res) => res.json({ success: true, data: getAISessions(String((req as any).user?.id || "student")) }));
router.get("/sessions/:sessionId/messages", (req, res) => res.json({ success: true, data: getSessionMessages(req.params.sessionId) }));

router.post("/message", async (req, res) => {
  const studentId = String((req as any).user?.id || "student");
  const data = await processAITutorMessage({
    studentId,
    sessionId: req.body.sessionId,
    userMessage: req.body.message,
    mode: req.body.mode,
    subjectId: req.body.subjectId,
  });
  res.json({ success: true, data });
});
router.post("/chat", async (req, res) => {
  const studentId = String((req as any).user?.id || "student");
  const data = await processAITutorMessage({
    studentId,
    sessionId: req.body.sessionId,
    userMessage: req.body.message,
    mode: req.body.mode,
    subjectId: req.body.subjectId,
  });
  res.json({ success: true, data });
});

router.post("/session/:sessionId/complete", async (req, res) => {
  const studentId = String((req as any).user?.id || "student");
  const data = await updateCognitiveProfile(studentId, req.params.sessionId);
  res.json({ success: true, data });
});

router.post("/voice", upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "Audio required" });
  const text = await transcribeVoice(req.file.buffer, req.file.originalname || "voice.webm");
  res.json({ success: true, data: { transcription: text } });
});

export default router;
