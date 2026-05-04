import { Router } from "express";
import { verifyAccessToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { createDraftTimetable, listTimetableDrafts, publishDraftTimetable } from "../services/timetable.service";
import { triggerNotificationByType } from "../services/notification.service";

const router = Router();
router.use(verifyAccessToken, requireRole("admin"));

router.post("/generate", async (req, res) => {
  const draft = await createDraftTimetable(req.body);
  return res.status(201).json({ success: true, data: draft });
});

router.get("/drafts", (_req, res) => {
  return res.json({ success: true, data: listTimetableDrafts() });
});

router.patch("/:id/publish", async (req, res) => {
  const published = await publishDraftTimetable(req.params.id);
  if (!published) return res.status(404).json({ success: false, message: "Timetable draft not found" });
  await triggerNotificationByType("timetable_published", { title: "Timetable published", body: `Academic year ${published.input.academic_year} timetable is now live.` });
  return res.json({ success: true, data: published });
});

export default router;
