import { getSocketServer } from "../config/socket";

const notifications: Array<{ id: string; userId: string; title: string; body: string; type: string; referenceId?: string; referenceType?: string; created_at: string; is_read: boolean }> = [];

export const sendNotification = async (
  userId: string,
  title: string,
  body: string,
  type: string,
  referenceId?: string,
  referenceType?: string,
) => {
  const notification = { id: `n_${notifications.length + 1}`, userId, title, body, type, referenceId, referenceType, created_at: new Date().toISOString(), is_read: false };
  notifications.unshift(notification);

  const io = getSocketServer();
  if (io) io.to(`user:${userId}`).emit("notification:new", notification);

  return notification;
};

export const notifySection = async (_sectionId: string, title: string, body: string, type: string) => {
  await Promise.all(["stu1", "stu2", "stu3"].map((id) => sendNotification(id, title, body, type)));
};

export const notifyAllTeachers = async (_institutionId: string, title: string, body: string, type: string) => {
  await Promise.all(["teach1", "teach2", "teach3"].map((id) => sendNotification(id, title, body, type)));
};

export const getNotifications = (userId: string) => notifications.filter((n) => n.userId === userId);

export const markNotificationRead = (id: string) => {
  const target = notifications.find((n) => n.id === id);
  if (target) target.is_read = true;
  return target;
};

export const triggerNotificationByType = async (type: string, payload: Record<string, string>) => {
  switch (type) {
    case "attendance_alert":
    case "attendance_warning":
    case "chat_cooldown":
    case "appeal_decision":
      return sendNotification(payload.userId || "stu1", payload.title || type, payload.body || "", type);
    case "preprep_new":
    case "test_published":
    case "resource_new":
      return notifySection(payload.sectionId || "CS-A", payload.title || type, payload.body || "", type);
    case "leave_decision":
      return sendNotification(payload.userId || "teach1", payload.title || type, payload.body || "", type);
    case "substitute_request":
      return notifyAllTeachers(payload.institutionId || "inst_1", payload.title || type, payload.body || "", type);
    case "substitute_confirmed":
      await sendNotification(payload.absentTeacherId || "teach1", payload.title || type, payload.body || "", type);
      return notifySection(payload.sectionId || "CS-A", payload.title || type, payload.body || "", type);
    case "student_risk_alert":
      return sendNotification(payload.userId || "admin1", payload.title || type, payload.body || "", type);
    case "event_new":
    case "timetable_published":
      return Promise.all(["stu1", "teach1", "admin1"].map((id) => sendNotification(id, payload.title || type, payload.body || "", type)));
    default:
      return null;
  }
};
