import { pool } from "../config/database";

const submissions = new Map<string, { answers: Record<string, string>; submittedAt: string; score: number; total: number; timeTakenSeconds: number }>();

export const getStudentTests = async () => {
  const availableRes = await pool.query(
    `SELECT id as "testId", title, 'available' as status, total_score as total, 0 as score
     FROM tests WHERE status = 'published' OR status = 'available'`
  );
  const historyRes = await pool.query(
    `SELECT t.id as "testId", t.title, 'completed' as status, t.total_score as total, tr.score
     FROM tests t JOIN test_results tr ON tr.test_id = t.id`
  );

  const available = availableRes.rows;
  const history = historyRes.rows;

  if (available.length === 0 && history.length === 0) {
    // Fallback
    return {
      available: [{ testId: "t3", subject: "Physics", title: "Kinematics Weekly", score: 0, total: 50, status: "available" }],
      history: [
        { testId: "t1", subject: "Mathematics", title: "Algebra Formative", score: 34, total: 50, status: "completed" },
        { testId: "t2", subject: "Mathematics", title: "Quadratics Drill", score: 42, total: 50, status: "completed" },
      ],
    };
  }

  return { available, history };
};

export const getTestById = async (testId: string) => {
  const testRes = await pool.query(`SELECT id, title, total_score, status FROM tests WHERE id = $1`, [testId]);
  if (!testRes.rows[0]) return null;
  const test = testRes.rows[0];

  const questionsRes = await pool.query(
    `SELECT id, question_text, question_type, options, correct_answer, topic_tag, difficulty
     FROM test_questions WHERE test_id = $1`,
    [testId]
  );

  return { ...test, testId: test.id, questions: questionsRes.rows };
};

export const submitTest = async (testId: string, answers: Record<string, string>, timeTakenSeconds: number) => {
  const questionsRes = await pool.query(
    `SELECT id, correct_answer FROM test_questions WHERE test_id = $1`, [testId]
  );
  const questions = questionsRes.rows;
  const correct = questions.filter((q) => {
    const given = answers[q.id] || "";
    return given.trim().toLowerCase() === (q.correct_answer || "").trim().toLowerCase();
  }).length;
  const total = questions.length;
  const score = correct;
  submissions.set(testId, { answers, submittedAt: new Date().toISOString(), score, total, timeTakenSeconds });
  return submissions.get(testId)!;
};

export const getResult = async (testId: string) => {
  const s = submissions.get(testId);
  if (!s) return null;

  const questionsRes = await pool.query(
    `SELECT id, question_text, question_type, options, correct_answer, topic_tag, difficulty
     FROM test_questions WHERE test_id = $1`,
    [testId]
  );
  const questions = questionsRes.rows;

  const topicMap = new Map<string, { total: number; correct: number }>();
  questions.forEach((q) => {
    const tag = q.topic_tag || "General";
    const current = topicMap.get(tag) || { total: 0, correct: 0 };
    current.total += 1;
    const given = s.answers[q.id] || "";
    if (given.trim().toLowerCase() === (q.correct_answer || "").trim().toLowerCase()) current.correct += 1;
    topicMap.set(tag, current);
  });

  const topicBreakdown = Array.from(topicMap.entries()).map(([topic, v]) => ({ topic, percentage: Math.round((v.correct / v.total) * 100) }));
  const weakTopics = topicBreakdown.filter((t) => t.percentage < 60).map((t) => t.topic);

  return {
    score: s.score,
    total: s.total,
    percentile: 72,
    time_taken_seconds: s.timeTakenSeconds,
    topic_breakdown: topicBreakdown,
    question_review: questions.map((q) => ({ ...q, student_answer: s.answers[q.id] || "" })),
    trend: [],
    recommendation: weakTopics.length ? `You scored below 60% on ${weakTopics[0]}. Review chapter notes or ask AI tutor.` : "Great consistency across topics.",
    weak_topics: weakTopics,
  };
};

export const getTeacherDashboard = async (teacherId: string) => {
  const scheduleRes = await pool.query(
    `SELECT t.id as session_id, s.name as subject, sec.name as section, t.time_slot as start_time, 
     t.room, false as attendance_marked 
     FROM timetable_slots t 
     JOIN subjects s ON t.subject_id = s.id 
     JOIN sections sec ON t.section_id = sec.id 
     WHERE t.teacher_id = $1 AND t.day = trim(to_char(NOW(), 'Day'))`,
    [teacherId]
  );

  const leaveRes = await pool.query(
    `SELECT * FROM leave_requests WHERE teacher_id = $1 AND status = 'pending'`,
    [teacherId]
  );

  const subRes = await pool.query(
    `SELECT r.id, s.name as subject, sec.name as section, r.date, r.time_slot as time, true as is_free
     FROM substitute_requests r
     JOIN subjects s ON r.subject_id = s.id
     JOIN sections sec ON r.section_id = sec.id
     WHERE r.status = 'open'`
  );

  return {
    today_schedule: scheduleRes.rows.map(r => ({ ...r, end_time: r.start_time })),
    leave_balance: { casual_remaining: 8, sick_remaining: 7 },
    pending_leave_requests: leaveRes.rows,
    pending_substitute_requests: subRes.rows,
    unread_chat_summaries: 0,
    syllabus_progress: [
      { subject_id: "sub_math", name: "Mathematics", section_name: "CS-A", completed_pct: 62 },
      { subject_id: "sub_phy", name: "Physics", section_name: "CS-A", completed_pct: 48 },
    ],
  };
};

export const submitLeaveRequest = async (teacherId: string, payload: { leave_type: string; start_date: string; end_date: string; reason: string; needs_substitute: boolean }) => {
  const res = await pool.query(
    `INSERT INTO leave_requests (teacher_id, leave_type, start_date, end_date, reason, needs_substitute, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
    [teacherId, payload.leave_type, payload.start_date, payload.end_date, payload.reason, payload.needs_substitute]
  );
  return res.rows[0];
};

export const getLeaveRequests = async (teacherId: string) => {
  const res = await pool.query(`SELECT * FROM leave_requests WHERE teacher_id = $1 ORDER BY created_at DESC`, [teacherId]);
  return res.rows;
};

export const getChatRooms = async () => {
  // Return default rooms - chat rooms aren't in DB schema yet
  return [
    { id: "room_math_a", name: "Mathematics - CS A" },
    { id: "room_phy_a", name: "Physics - CS A" },
  ];
};

export const getChatMessages = (roomId: string, page = 1) => {
  // Chat messages are in-memory for now
  const pageSize = 20;
  const sampleMessages = [
    { id: "m1", roomId: "room_math_a", senderId: "u2", pseudonym: "Anonymous Tiger", content: "Can anyone explain completing square?", upvotes: 7, createdAt: new Date().toISOString(), isPinned: true },
    { id: "m2", roomId: "room_math_a", senderId: "u3", pseudonym: "Anonymous Dolphin", content: "Is discriminant always positive?", upvotes: 2, createdAt: new Date().toISOString(), isAnswered: true, answerText: "No, it can be negative as well." },
  ];
  const rows = sampleMessages
    .filter((m) => m.roomId === roomId)
    .sort((a, b) => {
      const upvoteA = a.upvotes > 5 ? 1 : 0;
      const upvoteB = b.upvotes > 5 ? 1 : 0;
      if (upvoteA !== upvoteB) return upvoteB - upvoteA;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  return { items: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length };
};
