import { Router } from "express";
import { verifyAccessToken } from "../middleware/auth.middleware";
import { decideAppeal, listAppeals, submitAppeal } from "../services/moderation-admin.service";

const router = Router();
router.use(verifyAccessToken);

router.post("/", (req: any, res) => {
  const row = submitAppeal(String(req.user?.id || "student"), req.body.message_id, req.body.reason);
  res.status(201).json({ success: true, data: row });
});

router.get("/", (_req, res) => res.json({ success: true, data: listAppeals() }));

router.patch("/:id", (req, res) => {
  const row = decideAppeal(req.params.id, req.body.status, req.body.admin_response || "");
  if (!row) return res.status(404).json({ success: false, message: "Appeal not found" });
  return res.json({ success: true, data: row });
});

export default router;
