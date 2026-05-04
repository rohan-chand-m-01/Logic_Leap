import { triggerNotificationByType } from "./notification.service";

interface SubstituteRequest {
  id: string;
  leave_id: string;
  session_id: string;
  subject: string;
  section: string;
  date: string;
  time: string;
  absent_teacher_id: string;
  status: "open" | "filled" | "cancelled";
  selected_teacher_id?: string;
}

interface Volunteer {
  request_id: string;
  teacher_id: string;
  created_at: string;
}

const substituteRequests: SubstituteRequest[] = [];
const volunteers: Volunteer[] = [];
const teacherCompletion: Record<string, number> = { teach1: 74, teach2: 52, teach3: 61, teach4: 48 };

export const createSubstituteRequestsForLeave = async (leaveId: string, absentTeacherId: string, sessions: Array<{ session_id: string; subject: string; section: string; date: string; time: string }>) => {
  const created = sessions.map((s, idx) => ({ id: `sr_${Date.now()}_${idx}`, leave_id: leaveId, session_id: s.session_id, subject: s.subject, section: s.section, date: s.date, time: s.time, absent_teacher_id: absentTeacherId, status: "open" as const }));
  substituteRequests.push(...created);
  await triggerNotificationByType("substitute_request", { institutionId: "inst_1", title: "Substitute required", body: "A class needs substitute coverage." });
  return created;
};

export const listSubstituteRequests = () => substituteRequests;

const hasScheduleConflict = (_teacherId: string, _request: SubstituteRequest) => false;

export const volunteerForSubstitute = async (requestId: string, teacherId: string) => {
  const request = substituteRequests.find((r) => r.id === requestId);
  if (!request) throw new Error("Request not found");
  if (hasScheduleConflict(teacherId, request)) throw new Error("You have a class at this time. Cannot volunteer.");
  if (!volunteers.some((v) => v.request_id === requestId && v.teacher_id === teacherId)) {
    volunteers.push({ request_id: requestId, teacher_id: teacherId, created_at: new Date().toISOString() });
  }
  return { volunteered: true };
};

const getTeacherOverallSyllabusCompletion = async (teacherId: string) => teacherCompletion[teacherId] ?? 60;

export const selectSubstitute = async (requestId: string) => {
  const request = substituteRequests.find((r) => r.id === requestId);
  if (!request) throw new Error("Request not found");
  const candidateVolunteers = volunteers.filter((v) => v.request_id === requestId);
  if (!candidateVolunteers.length) throw new Error("No volunteers available");

  const withCompletion = await Promise.all(candidateVolunteers.map(async (v) => ({ teacher_id: v.teacher_id, completion_pct: await getTeacherOverallSyllabusCompletion(v.teacher_id) })));
  withCompletion.sort((a, b) => a.completion_pct - b.completion_pct);
  const selectedTeacherId = withCompletion[0].teacher_id;

  request.selected_teacher_id = selectedTeacherId;
  request.status = "filled";

  await triggerNotificationByType("substitute_confirmed", {
    absentTeacherId: request.absent_teacher_id,
    sectionId: request.section,
    title: "Substitute assigned",
    body: `Your class ${request.subject} ${request.section} will be covered by ${selectedTeacherId}`,
  });

  await triggerNotificationByType("substitute_request", {
    institutionId: "inst_1",
    title: "Volunteer update",
    body: `Thank you, another teacher has been assigned for ${request.subject} ${request.section}.`,
  });

  return { request, selectedTeacherId };
};
