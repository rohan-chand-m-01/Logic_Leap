import cron from "node-cron";
import { computeAllStudentRiskScores } from "../services/risk.service";
import { triggerNotificationByType } from "../services/notification.service";

const lockOverdueAttendanceSessions = async () => {};
const generatePendingChatSummaries = async () => {};
const sendAttendanceAlerts = async () => {
  await triggerNotificationByType("attendance_alert", { userId: "stu1", title: "Attendance below threshold", body: "Your attendance dropped below 75%." });
};
const sendChecklistReminders = async () => {
  await triggerNotificationByType("event_new", { title: "Checklist Reminder", body: "Please submit post-class checklist." });
};
const resetExpiredFlagCounts = async () => {};

export const startCronJobs = () => {
  cron.schedule("*/5 * * * *", async () => { await lockOverdueAttendanceSessions(); });
  cron.schedule("*/5 * * * *", async () => { await generatePendingChatSummaries(); });
  cron.schedule("0 2 * * *", async () => { await computeAllStudentRiskScores(); });
  cron.schedule("0 8 * * *", async () => { await sendAttendanceAlerts(); });
  cron.schedule("*/10 * * * *", async () => { await sendChecklistReminders(); });
  cron.schedule("0 0 * * *", async () => { await resetExpiredFlagCounts(); });
};
