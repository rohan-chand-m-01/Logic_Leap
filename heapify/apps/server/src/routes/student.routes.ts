import { Request, Response, Router } from "express";
import { verifyAccessToken } from "../middleware/auth.middleware";
import { getAttendanceLog, getAttendanceSummary, getStudentDashboard, getStudentPreprep } from "../services/student.service";
import { getResult, getStudentTests, getTestById, submitTest, getChatRooms, getChatMessages } from "../services/portal.service";
import { moderateMessage } from "../services/moderation.service";

const router = Router();
const reviewed = new Set<string>();
const cooldownMap = new Map<string, { until: string | null; flags: number; totalCooldowns: number }>();
const pseudonymMap = new Map<string, string>();
const notificationPrefs = new Map<string, Record<string, boolean>>();
const profileStore = new Map<string, { id: string; name: string; student_id: string; section: string; email: string; digest: "none" | "daily" | "weekly" }>();
const chatMessages: Array<{ id: string; roomId: string; senderId: string; pseudonym: string; content: string; upvotes: number; createdAt: string; isPinned?: boolean; isAnswered?: boolean; answerText?: string }> = [
  { id: "m1", roomId: "room_math_a", senderId: "u2", pseudonym: "Anonymous Tiger", content: "Can anyone explain completing square?", upvotes: 7, createdAt: new Date().toISOString(), isPinned: true },
  { id: "m2", roomId: "room_math_a", senderId: "u3", pseudonym: "Anonymous Dolphin", content: "Is discriminant always positive?", upvotes: 2, createdAt: new Date().toISOString(), isAnswered: true, answerText: "No, it can be negative as well." },
];
const ANIMALS = ["Tiger", "Dolphin", "Penguin", "Fox", "Wolf", "Falcon", "Otter", "Lynx", "Panther", "Eagle", "Hawk", "Owl", "Bear", "Jaguar", "Cheetah", "Leopard", "Lion", "Puma", "Bison", "Elk", "Moose", "Deer", "Rabbit", "Badger", "Weasel", "Mink", "Ferret", "Raccoon", "Skunk", "Opossum", "Armadillo", "Pangolin", "Aardvark", "Mongoose", "Meerkat", "Lemur", "Sloth", "Tapir", "Rhino", "Hippo", "Giraffe", "Zebra", "Wildebeest", "Gazelle", "Antelope", "Ibex", "Chamois", "Bongo", "Okapi", "Porcupine", "Capybara", "Platypus", "Echidna", "Wombat", "Koala", "Kangaroo", "Quokka", "Wallaby", "Bandicoot", "Numbat", "Quoll", "Dingo", "Tasmanian Devil", "Kookaburra", "Cassowary", "Emu", "Kiwi", "Tuatara", "Iguana", "Gecko", "Chameleon", "Axolotl", "Salamander", "Newt", "Toad", "Frog", "Crane", "Heron", "Flamingo", "Pelican", "Toucan", "Macaw", "Cockatoo", "Lorikeet", "Finch", "Sparrow", "Robin", "Wren", "Nuthatch", "Kingfisher", "Bee-eater", "Hornbill", "Hoopoe", "Lapwing", "Plover", "Sandpiper", "Curlew", "Godwit"];

router.use(verifyAccessToken);

router.get("/me/dashboard", async (req: any, res: Response) => {
  try {
    const data = await getStudentDashboard(req.user!.id);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});
router.get("/me/attendance", async (req: any, res: Response) => {
  try {
    const data = await getAttendanceSummary(req.user!.id);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});
router.get("/me/attendance/:subjectId", async (req, res) => {
  try {
    const data = await getAttendanceLog(req.params.subjectId);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/me/preprep", async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const search = String(req.query.search || "").toLowerCase();
    const filter = String(req.query.filter || "all");
    let rows = await getStudentPreprep();
    if (search) rows = rows.filter((p) => p.subject_name.toLowerCase().includes(search) || p.topics.some((t) => t.toLowerCase().includes(search)));
    if (filter === "pending") rows = rows.filter((p) => !reviewed.has(p.id) && !p.reviewed);
    if (filter === "reviewed") rows = rows.filter((p) => reviewed.has(p.id) || p.reviewed);
    const pageSize = 20;
    res.json({ success: true, data: { items: rows.slice((page - 1) * pageSize, page * pageSize).map((i) => ({ ...i, reviewed: reviewed.has(i.id) || i.reviewed })), total: rows.length } });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.patch("/preprep/:id/reviewed", (req, res) => {
  reviewed.add(req.params.id);
  res.json({ success: true, data: { id: req.params.id, reviewed: true, reviewed_at: new Date().toISOString() } });
});

router.get("/me/tests", async (_req, res) => {
  try {
    res.json({ success: true, data: await getStudentTests() });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});
router.get("/me/tests/:testId/result", async (req, res) => {
  try {
    res.json({ success: true, data: await getResult(req.params.testId) });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});
router.get("/me/notifications", (_req, res) => res.json({ success: true, data: [{ id: "n1", title: "Attendance warning", body: "You are close to threshold", is_read: false }] }));
router.get("/me/profile", (req: any, res) => {
  const id = String(req.user?.id || "student");
  if (!profileStore.has(id)) profileStore.set(id, { id, name: "Aarav Sharma", student_id: "CS101", section: "CS-A", email: "aarav@heapify.edu", digest: "daily" });
  return res.json({ success: true, data: { ...profileStore.get(id), notification_preferences: notificationPrefs.get(id) || { attendance_alert: true, test_published: true, preprep_new: true } } });
});
router.patch("/me/profile", (req: any, res) => {
  const id = String(req.user?.id || "student");
  const existing = profileStore.get(id) || { id, name: "Aarav Sharma", student_id: "CS101", section: "CS-A", email: "aarav@heapify.edu", digest: "daily" as const };
  const updated = { ...existing, ...req.body };
  profileStore.set(id, updated);
  if (req.body.notification_preferences) notificationPrefs.set(id, req.body.notification_preferences);
  return res.json({ success: true, data: updated });
});

router.get("/chat/rooms", async (_req, res) => {
  try {
    res.json({ success: true, data: await getChatRooms() });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});
router.get("/chat/:roomId/messages", (req, res) => res.json({ success: true, data: getChatMessages(req.params.roomId, Number(req.query.page || 1)) }));

router.get("/chat/me/cooldown/:roomId", (req, res) => {
  const key = `student:${req.params.roomId}`;
  const item = cooldownMap.get(key) || { until: null, flags: 0, totalCooldowns: 0 };
  res.json({ success: true, data: item });
});

router.post("/chat/:roomId/messages", async (req, res) => {
  const key = `student:${req.params.roomId}`;
  const state = cooldownMap.get(key) || { until: null, flags: 0, totalCooldowns: 0 };
  if (state.until && new Date(state.until) > new Date()) return res.status(403).json({ success: false, message: `Cooldown until ${state.until}` });

  const moderation = await moderateMessage(String(req.body.content || ""), "General");
  if (!moderation.allowed) {
    state.flags += 1;
    if (state.flags >= 3) {
      state.until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      state.flags = 0;
      state.totalCooldowns += 1;
    }
    cooldownMap.set(key, state);
    return res.status(400).json({ success: false, data: { blocked: true, reason: moderation.reason, cooldown_until: state.until } });
  }

  const pseudoKey = `student:${req.params.roomId}`;
  const pseudonym = pseudonymMap.get(pseudoKey) || `Anonymous ${ANIMALS[Math.floor(Math.random() * ANIMALS.length)]}`;
  pseudonymMap.set(pseudoKey, pseudonym);

  const msg = { id: `m${chatMessages.length + 1}`, roomId: req.params.roomId, senderId: "student", pseudonym, content: String(req.body.content || ""), upvotes: 0, createdAt: new Date().toISOString() };
  chatMessages.push(msg);
  res.json({ success: true, data: msg });
});

router.post("/chat/messages/:messageId/upvote", (req, res) => {
  const msg = chatMessages.find((m) => m.id === req.params.messageId);
  if (!msg) return res.status(404).json({ success: false, message: "Message not found" });
  msg.upvotes += 1;
  return res.json({ success: true, data: msg });
});

export default router;
