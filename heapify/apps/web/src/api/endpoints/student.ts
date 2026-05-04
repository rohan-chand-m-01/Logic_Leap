import { api } from "../client";

export const studentApi = {
  dashboard: async () => (await api.get("/api/v1/students/me/dashboard")).data.data,
  attendanceSummary: async () => (await api.get("/api/v1/students/me/attendance")).data.data,
  attendanceBySubject: async (subjectId: string) => (await api.get(`/api/v1/students/me/attendance/${subjectId}`)).data.data,
  preprep: async (params: { page: number; search: string; filter: "all" | "pending" | "reviewed" }) =>
    (await api.get("/api/v1/students/me/preprep", { params })).data.data,
  markReviewed: async (id: string) => (await api.patch(`/api/v1/students/preprep/${id}/reviewed`)).data.data,
  tests: async () => (await api.get("/api/v1/students/me/tests")).data.data,
  testDetails: async (testId: string) => (await api.get(`/api/v1/tests/${testId}`)).data.data,
  submitTest: async (testId: string, answers: Record<string, string>, timeTakenSeconds: number) =>
    (await api.post(`/api/v1/tests/${testId}/submit`, { answers, time_taken_seconds: timeTakenSeconds })).data.data,
  testResult: async (testId: string) => (await api.get(`/api/v1/students/me/tests/${testId}/result`)).data.data,
  notifications: async () => (await api.get("/api/v1/students/me/notifications")).data.data,
  profile: async () => (await api.get("/api/v1/students/me/profile")).data.data,
  updateProfile: async (payload: Record<string, unknown>) => (await api.patch("/api/v1/students/me/profile", payload)).data.data,
  submitAppeal: async (payload: { message_id: string; reason: string }) => (await api.post("/api/v1/appeals", payload)).data.data,
  rooms: async () => (await api.get("/api/v1/students/chat/rooms")).data.data,
  roomMessages: async (roomId: string, page = 1) => (await api.get(`/api/v1/students/chat/${roomId}/messages`, { params: { page } })).data.data,
  sendMessage: async (roomId: string, content: string) => (await api.post(`/api/v1/students/chat/${roomId}/messages`, { content })).data,
  upvote: async (messageId: string) => (await api.post(`/api/v1/students/chat/messages/${messageId}/upvote`)).data.data,
  cooldown: async (roomId: string) => (await api.get(`/api/v1/students/chat/me/cooldown/${roomId}`)).data.data,
};
