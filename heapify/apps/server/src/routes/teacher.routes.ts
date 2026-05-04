import { Request, Response, Router } from "express";
import { verifyAccessToken } from "../middleware/auth.middleware";
import { getTeacherDashboard, getTestById, submitLeaveRequest, getLeaveRequests } from "../services/portal.service";
import { createSubstituteRequestsForLeave, listSubstituteRequests, selectSubstitute, volunteerForSubstitute } from "../services/substitute.service";

const router = Router();
const leaves: Array<{ id: string; type: string; start: string; end: string; reason: string; status: string; adminComment?: string; needsSubstitute: boolean }> = [];
const resources: Array<{ id: string; name: string; type: string; subject_id: string; section_id: string; chapter: string; topic: string; is_current_syllabus: boolean; indexed: boolean; created_at: string }> = [];
const tests: Array<{ id: string; title: string; status: string; questions: unknown[] }> = [];
const checklistMap = new Map<string, Array<{ id: string; topic: string; is_completed: boolean; queued_to_session_id?: string; completed_at?: string }>>();

router.use(verifyAccessToken);

router.get("/dashboard", async (req: any, res: Response) => {
  try {
    res.json({ success: true, data: await getTeacherDashboard(req.user!.id) });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});
router.get("/sessions/today", async (req: any, res: Response) => {
  try {
    const data = await getTeacherDashboard(req.user!.id);
    res.json({ success: true, data: data.today_schedule });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/sessions/:sessionId/roster", (req, res) => {
  res.json({ success: true, data: [
    { id: "stu1", name: "Aarav", student_id: "CS101", gps_verified: true, status: "present" },
    { id: "stu2", name: "Riya", student_id: "CS102", gps_verified: false, status: "present" },
  ], session_id: req.params.sessionId });
});
router.get("/sessions/:id/roster", (req, res) => {
  res.json({ success: true, data: [
    { id: "stu1", name: "Aarav", student_id: "CS101", gps_verified: true, status: "present" },
    { id: "stu2", name: "Riya", student_id: "CS102", gps_verified: false, status: "present" },
  ], session_id: req.params.id });
});

router.post("/attendance/mark", (req, res) => {
  const sessionStart = new Date(Date.now() - 10 * 60 * 1000);
  const locked = Date.now() > sessionStart.getTime() + 30 * 60 * 1000;
  if (locked) return res.status(400).json({ success: false, message: "Attendance window locked" });
  return res.json({ success: true, data: { submitted: true, count: (req.body.records || []).length } });
});
router.post("/mark", (req, res) => {
  const sessionStart = new Date(Date.now() - 10 * 60 * 1000);
  const locked = Date.now() > sessionStart.getTime() + 30 * 60 * 1000;
  if (locked) return res.status(400).json({ success: false, message: "Attendance window locked" });
  return res.json({ success: true, data: { submitted: true, count: (req.body.records || []).length } });
});

router.get("/attendance/reports", (_req, res) => res.json({ success: true, data: { sessions: [{ date: "2026-05-01", attendance_rate: 88 }, { date: "2026-05-02", attendance_rate: 81 }], students: [{ name: "Aarav", pct: 72, subject: "Mathematics" }] } }));
router.get("/attendance/defaulters", (_req, res) => res.json({ success: true, data: [{ name: "Aarav", attendance_pct: 72, subject: "Mathematics" }] }));

router.get("/leave/my-requests", async (req: any, res: Response) => {
  try {
    res.json({ success: true, data: await getLeaveRequests(req.user!.id) });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});
router.get("/leave/balance", (_req, res) => res.json({ success: true, data: { casual_remaining: 8, sick_remaining: 7, casual_total: 12, sick_total: 10 } }));
router.post("/leave/request", async (req: any, res: Response) => {
  try {
    const item = await submitLeaveRequest(req.user!.id, req.body);
    if (item.needs_substitute) {
      // Stub substitute creation for now to avoid breaking existing logic
      console.log("Would create sub requests for leave", item.id);
    }
    res.status(201).json({ success: true, data: item });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});
router.get("/my-requests", (_req, res) => res.json({ success: true, data: leaves }));
router.get("/balance", (_req, res) => res.json({ success: true, data: { casual_remaining: 8, sick_remaining: 7, casual_total: 12, sick_total: 10 } }));
router.post("/request", (req, res) => {
  const item = { id: `lv${leaves.length + 1}`, type: req.body.leave_type, start: req.body.start_date, end: req.body.end_date, reason: req.body.reason, status: "pending", needsSubstitute: Boolean(req.body.needs_substitute) };
  leaves.push(item);
  res.status(201).json({ success: true, data: item });
});
router.get("/sessions/in-daterange", (req, res) => {
  const start = String(req.query.start || "");
  const end = String(req.query.end || "");
  res.json({ success: true, data: { start, end, affected_classes: 3 } });
});

router.post("/resources/upload", (req, res) => {
  const id = `res${resources.length + 1}`;
  const item = { id, name: req.body.filename || "resource.pdf", type: req.body.resource_type || "pdf", subject_id: req.body.subject_id || "sub_math", section_id: req.body.section_id || "sec_a", chapter: req.body.chapter || "Chapter 1", topic: req.body.topic || "Topic", is_current_syllabus: Boolean(req.body.is_current_syllabus), indexed: false, created_at: new Date().toISOString() };
  resources.push(item);
  setTimeout(() => {
    const target = resources.find((r) => r.id === id);
    if (target) target.indexed = true;
  }, 300);
  res.status(201).json({ success: true, data: item });
});
router.post("/upload", (req, res) => {
  const id = `res${resources.length + 1}`;
  const item = { id, name: req.body.filename || "resource.pdf", type: req.body.resource_type || "pdf", subject_id: req.body.subject_id || "sub_math", section_id: req.body.section_id || "sec_a", chapter: req.body.chapter || "Chapter 1", topic: req.body.topic || "Topic", is_current_syllabus: Boolean(req.body.is_current_syllabus), indexed: false, created_at: new Date().toISOString() };
  resources.push(item);
  res.status(201).json({ success: true, data: item });
});
router.get("/resources", (req, res) => {
  const subject = String(req.query.subject_id || "");
  const section = String(req.query.section_id || "");
  let rows = resources;
  if (subject) rows = rows.filter((r) => r.subject_id === subject);
  if (section) rows = rows.filter((r) => r.section_id === section);
  res.json({ success: true, data: rows });
});
router.get("/", (req, res) => {
  const subject = String(req.query.subject_id || "");
  const section = String(req.query.section_id || "");
  let rows = resources;
  if (subject) rows = rows.filter((r) => r.subject_id === subject);
  if (section) rows = rows.filter((r) => r.section_id === section);
  res.json({ success: true, data: rows });
});
router.patch("/resources/:id/current-syllabus", (req, res) => {
  const item = resources.find((r) => r.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: "Resource not found" });
  item.is_current_syllabus = Boolean(req.body.value);
  return res.json({ success: true, data: item });
});
router.delete("/resources/:id", (req, res) => {
  const index = resources.findIndex((r) => r.id === req.params.id);
  if (index >= 0) resources.splice(index, 1);
  res.json({ success: true });
});

router.post("/preprep", (req, res) => {
  res.status(201).json({ success: true, data: { id: `plan_${Date.now()}`, ...req.body } });
});
router.post("/", (req, res) => {
  res.status(201).json({ success: true, data: { id: `plan_${Date.now()}`, ...req.body } });
});
router.get("/preprep", (_req, res) => res.json({ success: true, data: [{ id: "p1", subject: "Mathematics", section: "CS-A", status: "published", topics: ["Quadratics"] }] }));
router.get("/backlog", (_req, res) => res.json({ success: true, data: [{ topic: "Applications of derivatives", from_session: "2026-05-02" }] }));
router.get("/checklist/:sessionId", (req, res) => res.json({ success: true, data: checklistMap.get(req.params.sessionId) || [{ id: "c1", topic: "Quadratics basics", is_completed: false }] }));
router.post("/checklist/:sessionId/submit", (req, res) => {
  const rows = (req.body.items || []).map((item: { id: string; topic: string; is_completed: boolean }, i: number) => ({ ...item, queued_to_session_id: item.is_completed ? undefined : `next_${i + 1}`, completed_at: item.is_completed ? new Date().toISOString() : undefined }));
  checklistMap.set(req.params.sessionId, rows);
  res.json({ success: true, data: { updated: rows.length } });
});
router.post("/:sessionId/submit", (req, res) => {
  const rows = (req.body.items || []).map((item: { id: string; topic: string; is_completed: boolean }, i: number) => ({ ...item, queued_to_session_id: item.is_completed ? undefined : `next_${i + 1}`, completed_at: item.is_completed ? new Date().toISOString() : undefined }));
  checklistMap.set(req.params.sessionId, rows);
  res.json({ success: true, data: { updated: rows.length } });
});
router.get("/:sessionId", (req, res) => res.json({ success: true, data: checklistMap.get(req.params.sessionId) || [{ id: "c1", topic: "Quadratics basics", is_completed: false }] }));

router.post("/tests/generate", (req, res) => {
  const id = `tg${tests.length + 1}`;
  const questions = [
    { id: "g1", question_text: "Generated MCQ", question_type: "mcq", options: ["A", "B", "C", "D"], correct_answer: "A", explanation: "Generated by AI", topic_tag: "Topic", difficulty: "medium" },
  ];
  const item = { id, title: req.body.title || "Generated Test", status: "draft", questions };
  tests.push(item);
  res.json({ success: true, data: item });
});
router.get("/tests", (_req, res) => res.json({ success: true, data: tests }));
router.get("/tests/:testId", async (req, res) => res.json({ success: true, data: tests.find((t) => t.id === req.params.testId) || await getTestById(req.params.testId) }));
router.patch("/tests/:testId/questions/:questionId", (req, res) => {
  const test = tests.find((t) => t.id === req.params.testId);
  if (!test) return res.status(404).json({ success: false, message: "Test not found" });
  test.questions = (test.questions as Array<Record<string, unknown>>).map((q) => (q.id === req.params.questionId ? { ...q, ...req.body } : q));
  return res.json({ success: true, data: test });
});
router.post("/tests/:testId/publish", (req, res) => {
  const test = tests.find((t) => t.id === req.params.testId);
  if (!test) return res.status(404).json({ success: false, message: "Test not found" });
  test.status = "published";
  return res.json({ success: true, data: test });
});
router.get("/tests/:testId/analytics", (_req, res) => res.json({ success: true, data: { score_distribution: [{ range: "0-20", count: 2 }, { range: "21-40", count: 5 }, { range: "41-60", count: 8 }, { range: "61-80", count: 10 }, { range: "81-100", count: 4 }], topic_heatmap: [{ student: "Student 1", topic: "Quadratics", correct_pct: 40 }, { student: "Student 2", topic: "Quadratics", correct_pct: 80 }], hard_questions: [{ id: "g1", question: "Generated MCQ", correct_rate: 35 }], rankings: [{ student: "Student 1", score: 43 }, { student: "Student 2", score: 78 }] } }));

router.get("/chat/:roomId/summary", (req, res) => res.json({ success: true, data: { total_questions: 22, unique_participants: 11, top_topics: [{ topic: "Quadratics", count: 10, confusion_level: "high" }, { topic: "Roots", count: 6, confusion_level: "medium" }], deduplicated_questions: [{ canonical_question: "How to use discriminant for root type?", asked_count: 5 }], insights: "Students are confused about the relation between discriminant and nature of roots.", timeline_data: [{ t: "09:00", count: 2 }, { t: "09:05", count: 5 }, { t: "09:10", count: 8 }], flag_summary: [{ reason: "off-topic", count: 1 }] } }));

router.get("/substitute/requests", (_req, res) => res.json({ success: true, data: listSubstituteRequests() }));
router.post("/substitute/:requestId/volunteer", async (req: any, res) => {
  try {
    const data = await volunteerForSubstitute(req.params.requestId, String(req.user?.id || "teach2"));
    return res.json({ success: true, data });
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }
});
router.post("/substitute/volunteer", async (req: any, res) => {
  try {
    const data = await volunteerForSubstitute(String(req.body.requestId), String(req.user?.id || "teach2"));
    return res.json({ success: true, data });
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }
});
router.post("/volunteer", async (req: any, res) => {
  try {
    const data = await volunteerForSubstitute(String(req.body.requestId), String(req.user?.id || "teach2"));
    return res.json({ success: true, data });
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }
});
router.post("/substitute/:requestId/select", async (req, res) => {
  try {
    const data = await selectSubstitute(req.params.requestId);
    return res.json({ success: true, data });
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }
});
router.post("/absence/notify", (_req, res) => res.json({ success: true, data: { notified: true } }));
router.post("/notify", (_req, res) => res.json({ success: true, data: { notified: true } }));

export default router;
