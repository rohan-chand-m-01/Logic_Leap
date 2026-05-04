/* Campus Day smoke runner
   Usage:
   npm run smoke:campus-day --workspace=apps/server
*/

const BASE = process.env.SMOKE_BASE_URL || "http://localhost:5000/api/v1";

type HttpMethod = "GET" | "POST" | "PATCH";

async function req(path: string, method: HttpMethod, body?: unknown, token?: string) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function run() {
  console.log("Smoke: starting Campus Day scenario");

  const adminEmail = `admin+${Date.now()}@heapify.edu`;
  await req("/auth/register-admin", "POST", {
    institutionName: "Demo University",
    institutionCode: `DU${Date.now().toString().slice(-5)}`,
    fullName: "Demo Admin",
    email: adminEmail,
    password: "AdminPass123",
  });

  const login = await req("/auth/login", "POST", { email: adminEmail, password: "AdminPass123" });
  const token = login.data.accessToken as string;

  const tt = await req("/timetable/generate", "POST", {
    institution_id: "inst_1",
    academic_year: "2026-27",
    working_days: [1,2,3,4,5],
    working_hours: { start: "08:00", end: "17:00" },
    period_duration_minutes: 60,
    locked_slots: [{ day: 1, period: 4, label: "Lunch" }],
    teacher_assignments: [
      { teacher_id: "teach1", teacher_name: "Dr. Arjun", weekly_hours: 24, subject_preferences: ["math","physics"] },
      { teacher_id: "teach2", teacher_name: "Prof. Mira", weekly_hours: 22, subject_preferences: ["physics"] },
    ],
    section_subject_requirements: [
      { section_id: "sec_a", section_name: "CS-A", required_subjects: [{ subject_id: "math", subject_name: "Math", periods_per_week: 5 }] },
    ],
    rooms: [{ id: "r1", name: "A-101", capacity: 60 }],
  }, token);

  await req(`/timetable/${tt.data.id}/publish`, "PATCH", {}, token);
  await req("/admin/dashboard/overview", "GET", undefined, token);
  await req("/admin/metrics/attendance", "GET", undefined, token);
  await req("/admin/analytics/students/risk", "GET", undefined, token);

  const leave = await req("/teacher/leave/request", "POST", {
    leave_type: "casual",
    start_date: "2026-05-10",
    end_date: "2026-05-11",
    reason: "Personal",
    needs_substitute: true,
  }, token);

  await req(`/admin/leave/${leave.data.id}/approve`, "POST", { comment: "Approved" }, token);

  const subReqs = await req("/teacher/substitute/requests", "GET", undefined, token);
  if (subReqs.data?.[0]?.id) {
    await req("/teacher/substitute/volunteer", "POST", { requestId: subReqs.data[0].id }, token);
    await req(`/teacher/substitute/${subReqs.data[0].id}/select`, "POST", {}, token);
  }

  await req("/teacher/resources/upload", "POST", { filename: "unit1.pdf", chapter: "Unit 1", topic: "Intro" }, token);
  await req("/teacher/preprep", "POST", { status: "published", topics: ["Topic 1", "Topic 2", "Topic 3"] }, token);
  const genTest = await req("/teacher/tests/generate", "POST", { title: "Smoke Test" }, token);
  await req(`/teacher/tests/${genTest.data.id}/publish`, "POST", {}, token);

  await req("/students/me/dashboard", "GET", undefined, token);
  await req("/students/me/preprep", "GET", undefined, token);
  const tests = await req("/students/me/tests", "GET", undefined, token);
  const available = tests.data.available?.[0];
  if (available) {
    await req(`/tests/${available.testId}`, "GET", undefined, token);
    await req(`/tests/${available.testId}/submit`, "POST", { answers: {}, time_taken_seconds: 120 }, token);
    await req(`/students/me/tests/${available.testId}/result`, "GET", undefined, token);
  }

  await req("/ai/chat", "POST", { sessionId: `sess_${Date.now()}`, message: "Explain Newton's laws", mode: "explain", subjectId: "sub_phy" }, token);
  await req("/chat/rooms", "GET", undefined, token);

  await req("/appeals", "POST", { message_id: "m1", reason: "Academic query" }, token);
  await req("/admin/flags/report", "GET", undefined, token);

  console.log("Smoke: Campus Day scenario completed successfully");
}

run().catch((e) => {
  console.error("Smoke failed:", e.message);
  process.exit(1);
});
