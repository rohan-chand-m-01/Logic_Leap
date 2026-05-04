const deanonLogs: Array<{ id: string; admin_id: string; message_id: string; reason: string; created_at: string }> = [];
const appeals: Array<{ id: string; student_id: string; message_id: string; reason: string; status: "pending" | "upheld" | "reversed"; admin_response?: string; created_at: string }> = [];
const flags = [
  { room: "room_math_a", category: "off-topic", count: 4, trend_day: "2026-05-01" },
  { room: "room_math_a", category: "abusive", count: 1, trend_day: "2026-05-02" },
  { room: "room_phy_a", category: "off-topic", count: 2, trend_day: "2026-05-02" },
];

export const createDeanonAudit = (admin_id: string, message_id: string, reason: string) => {
  const log = { id: `deanon_${Date.now()}`, admin_id, message_id, reason, created_at: new Date().toISOString() };
  deanonLogs.unshift(log);
  return log;
};

export const submitAppeal = (student_id: string, message_id: string, reason: string) => {
  const row = { id: `appeal_${Date.now()}`, student_id, message_id, reason, status: "pending" as const, created_at: new Date().toISOString() };
  appeals.unshift(row);
  return row;
};

export const listAppeals = () => appeals;

export const decideAppeal = (appealId: string, status: "upheld" | "reversed", admin_response: string) => {
  const row = appeals.find((a) => a.id === appealId);
  if (!row) return null;
  row.status = status;
  row.admin_response = admin_response;
  return row;
};

export const getFlagReport = () => {
  const total_flags = flags.reduce((a, b) => a + b.count, 0);
  const by_category = Array.from(new Map(flags.map((f) => [f.category, flags.filter((x) => x.category === f.category).reduce((a, b) => a + b.count, 0)])).entries()).map(([category, count]) => ({ category, count }));
  const by_room = Array.from(new Map(flags.map((f) => [f.room, flags.filter((x) => x.room === f.room).reduce((a, b) => a + b.count, 0)])).entries()).map(([room, count]) => ({ room, count }));
  const trend = flags.map((f) => ({ day: f.trend_day, category: f.category, count: f.count }));
  const flagged_messages = flags.map((f, idx) => ({ content_hash: `hash_${idx + 1}`, room: f.room, category: f.category, count: f.count }));
  return { total_flags, by_category, by_room, trend, flagged_messages };
};
