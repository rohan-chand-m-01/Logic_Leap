import { Router } from "express";
import { verifyAccessToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { deactivateStudent, eventsStore, getAiEngagement, getAttendanceMetrics, getFacultyProductivity, getStudent, getTestPerformance, listStudents, listTeachers, registerStudent, registerTeacher, getAdminOverview } from "../services/admin.service";
import { computeAllStudentRiskScores, getAllRiskScores, interventionLogs, simulatePolicy } from "../services/risk.service";
import { sendNotification, triggerNotificationByType } from "../services/notification.service";
import { createDeanonAudit, decideAppeal, getFlagReport, listAppeals } from "../services/moderation-admin.service";
import { createUser } from "../models/user.model";
import { hashPassword } from "../utils/password.utils";
const router = Router();
router.use(verifyAccessToken, requireRole("admin"));

router.get("/dashboard/overview", async (_req, res) => {
  try {
    res.json({ success: true, data: await getAdminOverview() });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});
router.get("/metrics/attendance", async (_req, res) => res.json({ success: true, data: await getAttendanceMetrics() }));
router.get("/metrics/faculty-productivity", async (_req, res) => res.json({ success: true, data: await getFacultyProductivity() }));
router.get("/metrics/ai-engagement", async (_req, res) => res.json({ success: true, data: await getAiEngagement() }));
router.get("/metrics/test-performance", async (_req, res) => res.json({ success: true, data: await getTestPerformance() }));

router.get("/students", async (req, res) => res.json({ success: true, data: await listStudents({ section: String(req.query.section || ""), risk_level: String(req.query.risk_level || ""), search: String(req.query.search || "") }) }));
router.get("/students/:studentId", async (req, res) => res.json({ success: true, data: await getStudent(req.params.studentId) }));
router.post("/students/register", async (req: any, res) => {
  const row = await registerStudent(req.body);
  try {
    const password_hash = await hashPassword("User@1234");
    await createUser({ email: req.body.email, full_name: req.body.name, role: "student", institution_id: req.user.institution_id, password_hash, registration_complete: true });
  } catch(e) { console.error("DB Insert Error:", e); }
  await sendNotification(row.id, "Welcome to Heapify", "Your account has been created.", "event_new");
  res.status(201).json({ success: true, data: row });
});
router.patch("/students/:studentId/deactivate", async (req, res) => res.json({ success: true, data: await deactivateStudent(req.params.studentId) }));

router.get("/teachers", async (_req, res) => res.json({ success: true, data: await listTeachers() }));
router.post("/teachers/register", async (req: any, res) => {
  const row = registerTeacher(req.body);
  try {
    const password_hash = await hashPassword("User@1234");
    await createUser({ email: req.body.email, full_name: req.body.name, role: "teacher", institution_id: req.user.institution_id, password_hash, registration_complete: true });
  } catch(e) { console.error("DB Insert Error:", e); }
  res.status(201).json({ success: true, data: row });
});

router.get("/analytics/students/risk", async (_req, res) => res.json({ success: true, data: await getAllRiskScores() }));
router.post("/analytics/students/risk/recompute", async (_req, res) => res.json({ success: true, data: await computeAllStudentRiskScores() }));
router.post("/analytics/students/risk/:studentId/action", (req, res) => {
  const row = { id: `i_${interventionLogs.length + 1}`, studentId: req.params.studentId, action: req.body.action, notes: req.body.notes, created_at: new Date().toISOString() };
  interventionLogs.unshift(row);
  res.json({ success: true, data: row });
});

router.post("/whatif/simulate", async (req, res) => res.json({ success: true, data: await simulatePolicy(req.body) }));

router.get("/leave/pending", async (_req, res) => {
  const { pool } = require("../config/database");
  const result = await pool.query(
    `SELECT lr.id, u.full_name as teacher, lr.leave_type, 
            lr.start_date || ' to ' || lr.end_date as dates,
            lr.affected_classes, 
            CASE WHEN lr.needs_substitute THEN 'unresolved' ELSE 'not_needed' END as substitute_status
     FROM leave_requests lr
     JOIN users u ON lr.teacher_id = u.id
     WHERE lr.status = 'pending'`
  );
  res.json({ success: true, data: result.rows.length ? result.rows : [{ id: "lv1", teacher: "Prof. Mira", leave_type: "sick", dates: "2026-05-05 to 2026-05-06", affected_classes: 3, substitute_status: "unresolved" }] });
});
router.post("/leave/:leaveId/approve", async (_req, res) => {
  await triggerNotificationByType("leave_decision", { userId: "teach1", title: "Leave approved", body: "Your leave request is approved." });
  res.json({ success: true });
});
router.post("/leave/:leaveId/reject", async (_req, res) => {
  await triggerNotificationByType("leave_decision", { userId: "teach1", title: "Leave rejected", body: "Your leave request is rejected." });
  res.json({ success: true });
});

router.get("/timetable", async (_req, res) => {
  const { pool } = require("../config/database");
  const slotsRes = await pool.query(
    `SELECT ts.day, ts.time_slot as slot, s.name as subject, sec.name as section, u.full_name as teacher, ts.room, ts.locked
     FROM timetable_slots ts
     JOIN subjects s ON ts.subject_id = s.id
     JOIN sections sec ON ts.section_id = sec.id
     JOIN users u ON ts.teacher_id = u.id`
  );
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const slots = ["08:00", "09:00", "10:00", "11:00"];
  const cells = slotsRes.rows.length ? slotsRes.rows : [{ day: "Mon", slot: "08:00", subject: "Math", section: "CS-A", teacher: "Dr. Arjun", room: "A-101", locked: true }];
  res.json({ success: true, data: { days, slots, cells } });
});
router.post("/timetable/publish", async (_req, res) => {
  await triggerNotificationByType("timetable_published", { title: "New timetable published", body: "Please review latest schedule." });
  res.json({ success: true });
});

router.post("/events", async (req, res) => {
  const row = { id: `ev_${eventsStore.length + 1}`, ...req.body };
  eventsStore.unshift(row as any);
  await triggerNotificationByType("event_new", { title: row.title, body: row.description || "New event published" });
  res.status(201).json({ success: true, data: row });
});
router.get("/events", (_req, res) => res.json({ success: true, data: eventsStore }));
router.patch("/events/:id", (req, res) => {
  const idx = eventsStore.findIndex((e) => e.id === req.params.id);
  if (idx >= 0) eventsStore[idx] = { ...eventsStore[idx], ...req.body } as any;
  res.json({ success: true, data: eventsStore[idx] });
});
router.delete("/events/:id", (req, res) => {
  const idx = eventsStore.findIndex((e) => e.id === req.params.id);
  if (idx >= 0) eventsStore.splice(idx, 1);
  res.json({ success: true });
});

router.get("/flags/report", (_req, res) => res.json({ success: true, data: getFlagReport() }));
router.post("/moderation/deanon", (req: any, res) => {
  if (!req.body.reason) return res.status(400).json({ success: false, message: "Reason is required for de-anonymization." });
  const log = createDeanonAudit(String(req.user?.id || "admin"), req.body.message_id, req.body.reason);
  return res.json({ success: true, data: { log, student_identity: { id: "stu1", name: "Aarav Sharma" } } });
});
router.get("/appeals", (_req, res) => res.json({ success: true, data: listAppeals() }));
router.patch("/appeals/:id", (req, res) => {
  const row = decideAppeal(req.params.id, req.body.status, req.body.admin_response || "");
  if (!row) return res.status(404).json({ success: false, message: "Appeal not found" });
  return res.json({ success: true, data: row });
});

export default router;
