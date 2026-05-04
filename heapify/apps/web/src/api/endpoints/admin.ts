import { api } from "../client";

export const adminApi = {
  overview: async () => (await api.get("/api/v1/admin/dashboard/overview")).data.data,
  attendanceMetrics: async (params?: Record<string, string>) => (await api.get("/api/v1/admin/metrics/attendance", { params })).data.data,
  facultyProductivity: async () => (await api.get("/api/v1/admin/metrics/faculty-productivity")).data.data,
  aiEngagement: async () => (await api.get("/api/v1/admin/metrics/ai-engagement")).data.data,
  testPerformance: async () => (await api.get("/api/v1/admin/metrics/test-performance")).data.data,
  students: async (params?: Record<string, string>) => (await api.get("/api/v1/admin/students", { params })).data.data,
  student: async (studentId: string) => (await api.get(`/api/v1/admin/students/${studentId}`)).data.data,
  registerStudent: async (payload: Record<string, unknown>) => (await api.post("/api/v1/admin/students/register", payload)).data.data,
  deactivateStudent: async (studentId: string) => (await api.patch(`/api/v1/admin/students/${studentId}/deactivate`)).data.data,
  teachers: async () => (await api.get("/api/v1/admin/teachers")).data.data,
  registerTeacher: async (payload: Record<string, unknown>) => (await api.post("/api/v1/admin/teachers/register", payload)).data.data,
  risk: async () => (await api.get("/api/v1/admin/analytics/students/risk")).data.data,
  riskAction: async (studentId: string, action: string, notes?: string) => (await api.post(`/api/v1/admin/analytics/students/risk/${studentId}/action`, { action, notes })).data.data,
  simulate: async (payload: Record<string, unknown>) => (await api.post("/api/v1/admin/whatif/simulate", payload)).data.data,
  leavePending: async () => (await api.get("/api/v1/admin/leave/pending")).data.data,
  approveLeave: async (leaveId: string, comment?: string) => (await api.post(`/api/v1/admin/leave/${leaveId}/approve`, { comment })).data,
  rejectLeave: async (leaveId: string, comment?: string) => (await api.post(`/api/v1/admin/leave/${leaveId}/reject`, { comment })).data,
  timetable: async () => (await api.get("/api/v1/admin/timetable")).data.data,
  publishTimetable: async () => (await api.post("/api/v1/admin/timetable/publish", {})).data,
  generateTimetable: async (payload: Record<string, unknown>) => (await api.post("/api/v1/timetable/generate", payload)).data.data,
  publishDraftTimetable: async (id: string) => (await api.patch(`/api/v1/timetable/${id}/publish`, {})).data.data,
  timetableDrafts: async () => (await api.get("/api/v1/timetable/drafts")).data.data,
  events: async () => (await api.get("/api/v1/admin/events")).data.data,
  createEvent: async (payload: Record<string, unknown>) => (await api.post("/api/v1/admin/events", payload)).data.data,
  updateEvent: async (id: string, payload: Record<string, unknown>) => (await api.patch(`/api/v1/admin/events/${id}`, payload)).data.data,
  deleteEvent: async (id: string) => (await api.delete(`/api/v1/admin/events/${id}`)).data,
  flagsReport: async () => (await api.get("/api/v1/admin/flags/report")).data.data,
  deanon: async (payload: { message_id: string; reason: string }) => (await api.post("/api/v1/admin/moderation/deanon", payload)).data.data,
  appeals: async () => (await api.get("/api/v1/appeals")).data.data,
  decideAppeal: async (id: string, status: "upheld" | "reversed", admin_response: string) => (await api.patch(`/api/v1/appeals/${id}`, { status, admin_response })).data.data,
};

export const aiApi = {
  sessions: async () => (await api.get("/api/v1/ai/sessions")).data.data,
  sessionMessages: async (sessionId: string) => (await api.get(`/api/v1/ai/sessions/${sessionId}/messages`)).data.data,
  message: async (payload: { sessionId: string; message: string; mode: string; subjectId: string }) => (await api.post("/api/v1/ai/message", payload)).data.data,
  completeSession: async (sessionId: string) => (await api.post(`/api/v1/ai/session/${sessionId}/complete`, {})).data.data,
  voice: async (audio: Blob) => {
    const formData = new FormData();
    formData.append("audio", audio, "voice.webm");
    return (await api.post("/api/v1/ai/voice", formData, { headers: { "Content-Type": "multipart/form-data" } })).data.data;
  },
};
