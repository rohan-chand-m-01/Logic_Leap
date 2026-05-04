import { Router } from "express";
import { verifyAccessToken } from "../middleware/auth.middleware";
import { getChatMessages, getChatRooms } from "../services/portal.service";
import { moderateMessage } from "../services/moderation.service";
import { sampleMessages } from "../services/mock-data";

const router = Router();
router.use(verifyAccessToken);
const cooldownMap = new Map<string, { until: string | null; flags: number }>();

router.get("/rooms", (_req, res) => res.json({ success: true, data: getChatRooms() }));
router.get("/:roomId/messages", (req, res) => res.json({ success: true, data: getChatMessages(req.params.roomId, Number(req.query.page || 1)) }));
router.post("/:roomId/messages", async (req: any, res) => {
  const key = `${req.user?.id || "student"}:${req.params.roomId}`;
  const state = cooldownMap.get(key) || { until: null, flags: 0 };
  if (state.until && new Date(state.until) > new Date()) return res.status(403).json({ success: false, message: `Cooldown until ${state.until}` });

  const moderation = await moderateMessage(String(req.body.content || ""), "General");
  if (!moderation.allowed) {
    state.flags += 1;
    if (state.flags >= 3) {
      state.until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      state.flags = 0;
    }
    cooldownMap.set(key, state);
    return res.status(400).json({ success: false, data: { blocked: true, reason: moderation.reason } });
  }

  const msg = { id: `m${sampleMessages.length + 1}`, roomId: req.params.roomId, senderId: String(req.user?.id || "student"), pseudonym: "Anonymous Falcon", content: String(req.body.content || ""), upvotes: 0, createdAt: new Date().toISOString() };
  sampleMessages.push(msg);
  return res.status(201).json({ success: true, data: msg });
});
router.post("/messages/:messageId/upvote", (req, res) => {
  const msg = sampleMessages.find((m) => m.id === req.params.messageId);
  if (!msg) return res.status(404).json({ success: false, message: "Message not found" });
  msg.upvotes += 1;
  return res.json({ success: true, data: msg });
});
router.get("/me/cooldown/:roomId", (req: any, res) => {
  const key = `${req.user?.id || "student"}:${req.params.roomId}`;
  const state = cooldownMap.get(key) || { until: null, flags: 0 };
  return res.json({ success: true, data: state });
});

export default router;
