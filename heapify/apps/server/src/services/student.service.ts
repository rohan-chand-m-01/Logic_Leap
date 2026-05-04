import { pool } from "../config/database";

const pct = (present: number, total: number) => Number(((present / total) * 100).toFixed(1));
const statusFor = (v: number): "green" | "yellow" | "red" => (v >= 75 ? "green" : v >= 65 ? "yellow" : "red");

export const getStudentDashboard = async (studentId: string) => {
  const attendanceRes = await pool.query(
    `SELECT s.id as subject_id, s.name, 
            COUNT(l.id) FILTER (WHERE l.status = 'present') as present, 
            COUNT(l.id) as total 
     FROM subjects s 
     LEFT JOIN attendance_logs l ON l.subject_id = s.id AND l.student_id = $1 
     GROUP BY s.id`,
    [studentId]
  );
  
  const subjects = attendanceRes.rows.map((r) => ({ 
    subject_id: r.subject_id, 
    name: r.name, 
    percentage: pct(Number(r.present), Number(r.total) || 1), 
    present: Number(r.present), 
    total: Number(r.total) 
  }));
  const overall = subjects.length ? Number((subjects.reduce((a, s) => a + s.percentage, 0) / subjects.length).toFixed(1)) : 100;

  const eventsRes = await pool.query(`SELECT id, title, event_type, starts_at FROM events ORDER BY starts_at ASC LIMIT 3`);
  
  const testsRes = await pool.query(
    `SELECT t.title, r.score, t.total_score as total 
     FROM test_results r JOIN tests t ON r.test_id = t.id 
     WHERE r.student_id = $1 ORDER BY r.created_at DESC LIMIT 3`, 
    [studentId]
  );

  const aiRes = await pool.query(
    `SELECT topic FROM ai_sessions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [studentId]
  );

  return {
    attendance: { overall_percentage: overall, status: statusFor(overall), subjects },
    upcoming_events: eventsRes.rows,
    next_class: null,
    last_ai_topic: aiRes.rows[0]?.topic || null,
    last_three_tests: testsRes.rows.map(t => ({ title: t.title, score: t.score, total: t.total, trend: "same" })),
    pending_preprep_count: 0,
  };
};

export const getAttendanceSummary = async (studentId: string) => {
  const res = await pool.query(
    `SELECT s.id as subject_id, s.name, 
            COUNT(l.id) FILTER (WHERE l.status = 'present') as present, 
            COUNT(l.id) as total 
     FROM subjects s 
     LEFT JOIN attendance_logs l ON l.subject_id = s.id AND l.student_id = $1 
     GROUP BY s.id`,
    [studentId]
  );
  return res.rows.map(r => ({
    subject_id: r.subject_id,
    name: r.name,
    present: Number(r.present),
    total: Number(r.total),
    percentage: pct(Number(r.present), Number(r.total) || 1),
  }));
};

export const getAttendanceLog = async (subjectId: string) => {
  const res = await pool.query(
    `SELECT a.date, a.status, u.full_name as teacher, a.created_at as "markedAt"
     FROM attendance_logs a
     LEFT JOIN users u ON u.role = 'teacher'
     WHERE a.subject_id = $1
     ORDER BY a.date DESC`,
    [subjectId]
  );
  const subjectRes = await pool.query(`SELECT id, name FROM subjects WHERE id = $1`, [subjectId]);
  const subject = subjectRes.rows[0];
  if (!subject) return null;
  const present = res.rows.filter(r => r.status === 'present').length;
  return {
    subjectId: subject.id,
    name: subject.name,
    present,
    total: res.rows.length,
    entries: res.rows.map(r => ({
      date: r.date instanceof Date ? r.date.toISOString() : String(r.date),
      status: r.status,
      teacher: r.teacher || "Unknown",
      markedAt: r.markedAt instanceof Date ? r.markedAt.toISOString() : String(r.markedAt),
    })),
  };
};

export const getStudentPreprep = async () => {
  const res = await pool.query(
    `SELECT pa.id, s.name as subject_name, u.full_name as teacher_name, pa.created_at as date, pa.title, pa.status
     FROM preprep_assignments pa
     JOIN subjects s ON pa.subject_id = s.id
     JOIN users u ON pa.teacher_id = u.id
     ORDER BY pa.created_at DESC`
  );
  if (res.rows.length > 0) {
    return res.rows.map(r => ({
      id: r.id,
      subject_name: r.subject_name,
      teacher_name: r.teacher_name,
      date: r.date instanceof Date ? r.date.toISOString() : String(r.date),
      topics: [r.title || "General"],
      resources: [{ id: `r_${r.id}`, title: "Lecture Notes", url: "https://example.com/resource" }],
      reviewed: r.status === 'published',
      reviewed_at: r.status === 'published' ? new Date().toISOString() : null,
    }));
  }
  // Fallback mock data if no preprep assignments exist yet
  const now = new Date();
  return Array.from({ length: 5 }).map((_, i) => ({
    id: `pp${i + 1}`,
    subject_name: i % 2 ? "Mathematics" : "Physics",
    teacher_name: i % 2 ? "Dr. Arjun" : "Prof. Mira",
    date: new Date(now.getTime() - i * 86400000).toISOString(),
    topics: i % 2 ? ["Quadratics", "Discriminant"] : ["SUVAT", "Graphs"],
    resources: [{ id: `r${i}`, title: "Lecture Notes", url: "https://example.com/resource" }],
    reviewed: i % 3 === 0,
    reviewed_at: i % 3 === 0 ? new Date(now.getTime() - i * 3600000).toISOString() : null,
  }));
};
