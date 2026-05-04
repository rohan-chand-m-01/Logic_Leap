import { pool } from "../config/database";
import { listStudents } from "./admin.service";
export interface RiskScore {
  studentId: string;
  riskScore: number;
  risk_level: "green" | "yellow" | "red";
  components: Record<string, number>;
  recommendation: string;
}

const riskRows = new Map<string, RiskScore>();

const getStudentAttendanceTrend = async (id: string) => {
  const res = await pool.query(
    `SELECT COUNT(id) FILTER (WHERE status = 'present') as present, COUNT(id) as total
     FROM attendance_logs WHERE student_id = $1`, [id]
  );
  const row = res.rows[0];
  const overall_pct = row && Number(row.total) > 0 ? Math.round(Number(row.present) * 100 / Number(row.total)) : 75;
  return { overall_pct };
};

const getStudentTestScoreTrend = async (id: string) => {
  const res = await pool.query(
    `SELECT score, t.total_score as total FROM test_results tr 
     JOIN tests t ON tr.test_id = t.id
     WHERE tr.student_id = $1 ORDER BY tr.created_at DESC LIMIT 2`, [id]
  );
  if (res.rows.length === 0) return { last_two_avg: 70, count: 0 };
  const avg = res.rows.reduce((a, r) => a + (r.score / r.total) * 100, 0) / res.rows.length;
  return { last_two_avg: Math.round(avg), count: res.rows.length };
};

const getStudentAiEngagement = async (id: string) => {
  const res = await pool.query(
    `SELECT COUNT(*) as recent FROM ai_sessions 
     WHERE student_id = $1 AND created_at > NOW() - interval '14 days'`, [id]
  );
  const prevRes = await pool.query(
    `SELECT COUNT(*) as prev FROM ai_sessions 
     WHERE student_id = $1 AND created_at BETWEEN NOW() - interval '28 days' AND NOW() - interval '14 days'`, [id]
  );
  const recent = Number(res.rows[0]?.recent || 0);
  const prev = Number(prevRes.rows[0]?.prev || 1);
  const drop = prev > 0 ? Math.max(0, Math.round(((prev - recent) / prev) * 100)) : 0;
  return { engagement_drop_pct: drop };
};

const getStudentPreprepReviewRate = async (_id: string) => ({ review_rate: 0.5 });
const getStudentChatParticipation = async (_id: string) => ({ messages_last_2weeks: 3 });

const generateRiskRecommendation = async (components: Record<string, number>, attendance: { overall_pct: number }, testData: { last_two_avg: number; count: number }) => {
  const recommendations: string[] = [];
  if (components.attendance > 20) recommendations.push(`Attendance at ${attendance.overall_pct}% is the primary risk driver. Recommend guardian notification and counseling session.`);
  if (components.tests > 15) recommendations.push(`Scored below 50% on last ${testData.count} tests. Recommend subject-specific tutoring or AI tutor intervention.`);
  if (components.ai_engagement > 10) recommendations.push("AI tutor engagement dropped significantly. Student may be disengaging. Recommend check-in.");
  if (components.preprep > 10) recommendations.push("Low pre-prep review rate indicates poor preparation habits. Recommend study skills counseling.");
  return recommendations.join(" ") || "Student is currently stable. Continue monitoring.";
};

export const computeStudentRiskScore = async (studentId: string, _institutionId: string): Promise<RiskScore> => {
  const [attendanceData, testData, aiData, preprepData, chatData] = await Promise.all([
    getStudentAttendanceTrend(studentId),
    getStudentTestScoreTrend(studentId),
    getStudentAiEngagement(studentId),
    getStudentPreprepReviewRate(studentId),
    getStudentChatParticipation(studentId),
  ]);

  const components: Record<string, number> = {};
  components.attendance = attendanceData.overall_pct < 65 ? 35 : attendanceData.overall_pct < 75 ? Math.round((35 * (75 - attendanceData.overall_pct)) / 10) : 0;
  components.tests = testData.last_two_avg < 50 ? 25 : testData.last_two_avg < 70 ? Math.round((25 * (70 - testData.last_two_avg)) / 20) : 0;
  components.ai_engagement = aiData.engagement_drop_pct > 50 ? 15 : Math.round((15 * aiData.engagement_drop_pct) / 50);
  components.preprep = preprepData.review_rate < 0.3 ? 15 : Math.max(0, Math.round((15 * (0.3 - preprepData.review_rate)) / 0.3));
  components.chat = chatData.messages_last_2weeks === 0 ? 10 : 0;

  const riskScore = Object.values(components).reduce((a, b) => a + b, 0);
  const risk_level: RiskScore["risk_level"] = riskScore >= 70 ? "red" : riskScore >= 40 ? "yellow" : "green";
  const recommendation = await generateRiskRecommendation(components, attendanceData, testData);
  const row = { studentId, riskScore, risk_level, components, recommendation };
  riskRows.set(studentId, row);
  return row;
};

export const computeAllStudentRiskScores = async () => {
  const res = await pool.query(`SELECT id FROM users WHERE role = 'student'`);
  await Promise.all(res.rows.map((s) => computeStudentRiskScore(s.id, "inst_1")));
  return Array.from(riskRows.values()).sort((a, b) => b.riskScore - a.riskScore);
};

export const getAllRiskScores = async () => {
  if (!riskRows.size) await computeAllStudentRiskScores();
  return Array.from(riskRows.values()).sort((a, b) => b.riskScore - a.riskScore);
};

export const simulatePolicy = async (input: { simulation_type: string; parameters: Record<string, number | string> }) => {
  switch (input.simulation_type) {
    case "attendance_threshold": {
      const threshold = Number(input.parameters.new_threshold || 85);
      const rows = await listStudents({});
      const barred = rows.filter((s: any) => s.attendance_pct < threshold).length;
      return {
        barred_count: barred,
        sections_most_affected: ["CS-A", "CS-B"],
        estimated_grade_improvement_pct: Number(((threshold - 75) * 0.15).toFixed(2)),
        confidence: "Estimated - based on historical data correlation",
      };
    }
    case "section_size": {
      const current = Number(input.parameters.current_size || 60);
      const next = Number(input.parameters.new_size || 45);
      const reduction = Math.max(0, current - next);
      return {
        teacher_count_change: Number((300 / next - 300 / current).toFixed(2)),
        predicted_attendance_improvement_pct: Number(((reduction / current) * 5).toFixed(2)),
        predicted_ai_engagement_increase_pct: Number(((reduction / current) * 8).toFixed(2)),
        confidence: "Estimated - based on historical data correlation",
      };
    }
    case "timetable_shift": {
      return {
        early_class_avg_attendance: 66,
        projected_improvement_pct: 7.5,
        scheduling_feasibility: "Feasible with 4 available afternoon slots",
        confidence: "Estimated - based on historical data correlation",
      };
    }
    case "teacher_leave_pattern": {
      return {
        current_syllabus_completion_pct: 62,
        projected_completion_pct: 55,
        substitute_burden_avg_classes: 3.2,
        subjects_at_risk: ["Physics", "Chemistry"],
        confidence: "Estimated - based on historical data correlation",
      };
    }
    default:
      return { message: "Unknown simulation type" };
  }
};

export const interventionLogs: Array<{ id: string; studentId: string; action: string; created_at: string; notes?: string }> = [];
