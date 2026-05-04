import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { adminApi } from "../../api/endpoints/admin";
import { Users, UserCheck, Presentation, BrainCircuit, Bell, Clock, AlertTriangle } from "lucide-react";
export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  useEffect(() => {
    adminApi.overview().then(setOverview);
    const i = setInterval(() => adminApi.overview().then(setOverview), 60000);
    return () => clearInterval(i);
  }, []);
  if (!overview) return <div className="flex h-[50vh] items-center justify-center text-slate-400 font-medium animate-pulse">Loading admin overview...</div>;

  const alertText = `⚠️ ${overview.alerts.students_below_75pct.count} students below 75% attendance | ${overview.alerts.pending_leave_requests} pending leave requests | ${overview.alerts.classes_without_teacher_today.length} classes unassigned today`;

  return <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    {/* Premium Marquee */}
    <div className="bg-gradient-to-r from-red-600 to-rose-500 text-white p-3 rounded-xl shadow-lg shadow-red-500/20 overflow-hidden flex items-center gap-3">
      <AlertTriangle className="shrink-0 w-5 h-5 animate-pulse" />
      <div className="overflow-hidden whitespace-nowrap flex-1 relative">
        <div className="animate-[marquee_20s_linear_infinite] font-medium tracking-wide">{alertText}</div>
      </div>
    </div>

    {/* Metric Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[
        { label: "Active Students", value: overview.real_time.active_students, bg: "from-emerald-400 to-teal-600", shadow: "shadow-teal-500/30", Icon: Users },
        { label: "Teachers Present", value: overview.real_time.teachers_present, bg: "from-blue-400 to-indigo-600", shadow: "shadow-blue-500/30", Icon: UserCheck },
        { label: "Classes In Session", value: overview.real_time.classes_in_session, bg: "from-amber-400 to-orange-600", shadow: "shadow-orange-500/30", Icon: Presentation },
        { label: "AI Sessions", value: overview.real_time.ai_sessions_active, bg: "from-purple-400 to-fuchsia-600", shadow: "shadow-purple-500/30", Icon: BrainCircuit },
      ].map((card, i) => (
        <div key={card.label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bg} p-6 text-white shadow-xl ${card.shadow} transition-transform hover:-translate-y-1 hover:scale-[1.02] duration-300`}>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-white/80 text-sm font-medium tracking-wide uppercase mb-1">{card.label}</div>
              <div className="text-4xl font-bold tracking-tight">{card.value}</div>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <card.Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          {i === 0 && <span className="relative z-10 inline-flex items-center gap-1.5 text-xs font-medium bg-black/20 px-2 py-0.5 rounded-full mt-4 backdrop-blur-sm"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Live Sync</span>}
        </div>
      ))}
    </div>

    {/* Details Sections */}
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Attendance Alerts */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-80">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><AlertTriangle className="w-4 h-4" /></div> Attendance Alert</h3>
          <span className="bg-red-100 text-red-700 font-bold px-2.5 py-0.5 rounded-full text-xs">{overview.alerts.students_below_75pct.count}</span>
        </div>
        <div className="flex-1 overflow-auto space-y-3 pr-2 scrollbar-thin">
          {overview.alerts.students_below_75pct.students.map((s: any) => (
            <div key={s.id} className="group flex items-center justify-between bg-slate-50 hover:bg-red-50/50 p-3 rounded-xl transition-colors border border-transparent hover:border-red-100">
              <div>
                <div className="font-medium text-slate-800 text-sm">{s.name}</div>
                <div className="text-red-600 text-xs font-semibold">{s.pct}% Attendance</div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm border border-slate-200">Notify</button>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Requests */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-80">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Bell className="w-4 h-4" /></div> Leave Requests</h3>
          <span className="bg-amber-100 text-amber-700 font-bold px-2.5 py-0.5 rounded-full text-xs">{overview.alerts.pending_leave_requests}</span>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 text-slate-400 p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Bell className="w-8 h-8 mb-2 text-amber-300 opacity-50" />
          <p className="text-sm">You have {overview.alerts.pending_leave_requests} pending requests to review.</p>
          <div className="flex gap-3 mt-4">
             <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-500/20 font-medium text-sm hover:scale-105 transition-transform">Review All</button>
          </div>
        </div>
      </div>

      {/* Unassigned Classes */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-80">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Clock className="w-4 h-4" /></div> Unassigned Classes</h3>
          <span className="bg-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full text-xs">{overview.alerts.classes_without_teacher_today.length}</span>
        </div>
        <div className="flex-1 overflow-auto space-y-3 pr-2 scrollbar-thin">
          {overview.alerts.classes_without_teacher_today.map((c: any, idx: number) => (
            <div key={idx} className="flex flex-col bg-slate-50 hover:bg-indigo-50/30 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-slate-800 text-sm line-clamp-1">{c.subject}</span>
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md whitespace-nowrap ml-2">{c.time}</span>
              </div>
              <div className="text-xs text-slate-500 mb-3">Section: {c.section}</div>
              <button className="w-full py-2 bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-medium transition-colors shadow-sm">Assign Substitute</button>
            </div>
          ))}
          {overview.alerts.classes_without_teacher_today.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">All classes are assigned.</div>
          )}
        </div>
      </div>
    </div>
  </div>;
}

export function AdminAnalyticsPage() {
  const [tab, setTab] = useState<"attendance" | "faculty" | "ai" | "tests">("attendance");
  const [attendance, setAttendance] = useState<any>(null);
  const [faculty, setFaculty] = useState<any>(null);
  const [ai, setAi] = useState<any>(null);
  const [tests, setTests] = useState<any>(null);

  useEffect(() => { adminApi.attendanceMetrics().then(setAttendance); adminApi.facultyProductivity().then(setFaculty); adminApi.aiEngagement().then(setAi); adminApi.testPerformance().then(setTests); }, []);

  return <div className="space-y-3"><div className="flex gap-2">{[["attendance","Attendance"],["faculty","Faculty"],["ai","AI"],["tests","Tests"]].map(([id,label]) => <button key={id} onClick={() => setTab(id as any)} className={`px-3 py-2 rounded ${tab===id?"bg-blue text-white":"bg-white"}`}>{label}</button>)}</div>
    {tab === "attendance" && attendance && <div className="bg-white p-4 rounded space-y-3"><div className="h-64"><ResponsiveContainer><LineChart data={attendance.series}><XAxis dataKey="date" /><YAxis /><Tooltip /><Line dataKey="CS-A" stroke="#2E6DA4" /><Line dataKey="CS-B" stroke="#1A7A6E" /></LineChart></ResponsiveContainer></div><table className="w-full text-sm"><thead><tr><th>Section</th><th>Attendance %</th></tr></thead><tbody>{attendance.table.map((r: any) => <tr key={r.section} className="border-t"><td>{r.section}</td><td>{r.attendance_pct}</td></tr>)}</tbody></table></div>}
    {tab === "faculty" && faculty && <div className="bg-white p-4 rounded space-y-3"><div className="h-64"><ResponsiveContainer><BarChart data={faculty.chart}><XAxis dataKey="teacher" /><YAxis /><Tooltip /><Bar dataKey="completion">{faculty.chart.map((r: any, i: number) => <Cell key={i} fill={r.completion < 60 ? "#C0392B" : "#2E6DA4"} />)}</Bar></BarChart></ResponsiveContainer></div><table className="w-full text-sm"><thead><tr><th>Teacher</th><th>Subject</th><th>Section</th><th>Completion</th><th>Last Checklist</th></tr></thead><tbody>{faculty.table.map((r: any) => <tr key={r.teacher+r.subject} className="border-t"><td>{r.teacher}</td><td>{r.subject}</td><td>{r.section}</td><td>{r.completion}%</td><td>{r.last_checklist}</td></tr>)}</tbody></table></div>}
    {tab === "ai" && ai && <div className="bg-white p-4 rounded space-y-3"><div className="grid md:grid-cols-2 gap-3"><div className="h-56"><ResponsiveContainer><PieChart><Pie data={ai.pie} dataKey="sessions" nameKey="subject" label /></PieChart></ResponsiveContainer></div><div className="h-56"><ResponsiveContainer><LineChart data={ai.trend}><XAxis dataKey="day" /><YAxis /><Tooltip /><Line dataKey="sessions" stroke="#7E57C2" /></LineChart></ResponsiveContainer></div></div><div className="bg-indigo-50 border border-indigo-100 p-3 rounded">Subjects with highest AI usage indicate areas students find most challenging.</div></div>}
    {tab === "tests" && tests && <div className="bg-white p-4 rounded"><div className="grid md:grid-cols-3 gap-2">{tests.heatmap.map((h: any, i: number) => <div key={i} className={`p-3 rounded text-white ${h.correct_pct < 60 ? "bg-red-500" : "bg-green-600"}`}>{h.topic} ({h.section}) - {h.correct_pct}%</div>)}</div></div>}
  </div>;
}

export function AdminStudentsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const load = () => adminApi.students({ search }).then(setRows);
  useEffect(() => { load(); }, []);
  return <div className="space-y-3"><div className="flex gap-2"><input className="border rounded px-3 py-2 flex-1" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} /><button className="px-3 py-2 bg-blue text-white rounded" onClick={load}>Search</button><button className="px-3 py-2 bg-teal text-white rounded" onClick={() => adminApi.registerStudent({ name: "New Student", email: "new@heapify.edu", student_id: "CS999", section: "CS-A" }).then(load)}>Register Student</button></div><div className="bg-white rounded overflow-auto"><table className="w-full text-sm"><thead><tr><th>Name</th><th>Student ID</th><th>Section</th><th>Attendance</th><th>Last Test</th><th>Risk</th><th>Status</th></tr></thead><tbody>{rows.map((s) => <tr key={s.id} className="border-t cursor-pointer" onClick={() => setSelected(s)}><td>{s.name}</td><td>{s.student_id}</td><td>{s.section}</td><td>{s.attendance_pct}%</td><td>{s.last_test_score}</td><td><span className={`px-2 rounded ${s.risk_score>=70?"bg-red-100 text-red-700":s.risk_score>=40?"bg-amber-100 text-amber-700":"bg-green-100 text-green-700"}`}>{s.risk_score}</span></td><td>{s.status}</td></tr>)}</tbody></table></div>{selected && <div className="bg-white p-4 rounded"><h3 className="font-semibold">{selected.name}</h3><div className="flex gap-2 mt-2"><button className="px-2 py-1 bg-slate-200 rounded">Overview</button><button className="px-2 py-1 bg-slate-200 rounded">Attendance History</button><button className="px-2 py-1 bg-slate-200 rounded">Test History</button><button className="px-2 py-1 bg-slate-200 rounded">Risk Analysis</button><button className="px-2 py-1 bg-slate-200 rounded">AI Sessions</button><button className="px-2 py-1 bg-slate-200 rounded">Intervention Log</button></div></div>}</div>;
}

export function AdminTeachersPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { adminApi.teachers().then(setRows); }, []);
  return <div className="space-y-3"><button className="px-3 py-2 bg-blue text-white rounded" onClick={() => adminApi.registerTeacher({ name: "New Teacher", email: "new.teacher@heapify.edu", employee_id: "EMP999", subjects: ["Math"] }).then(() => adminApi.teachers().then(setRows))}>Register Teacher</button><div className="bg-white rounded overflow-auto"><table className="w-full text-sm"><thead><tr><th>Name</th><th>Employee ID</th><th>Subjects</th><th>Completion</th><th>Leave Balance</th><th>Status</th></tr></thead><tbody>{rows.map((t) => <tr key={t.id} className="border-t"><td>{t.name}</td><td>{t.employee_id}</td><td>{t.subjects.join(", ")}</td><td>{t.completion_pct}%</td><td>C:{t.leave_balance.casual} S:{t.leave_balance.sick}</td><td>{t.status}</td></tr>)}</tbody></table></div></div>;
}

export function AdminRiskEnginePage() {
  const [rows, setRows] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const load = () => adminApi.risk().then(setRows);
  useEffect(() => { load(); }, []);
  const columns = useMemo(() => ({ red: rows.filter((r) => r.risk_level === "red"), yellow: rows.filter((r) => r.risk_level === "yellow"), green: rows.filter((r) => r.risk_level === "green") }), [rows]);
  return <div className="grid md:grid-cols-3 gap-3">{(["red","yellow","green"] as const).map((level) => <div key={level} className="bg-white rounded p-3"><h3 className={`font-semibold ${level==="red"?"text-red-700":level==="yellow"?"text-amber-700":"text-green-700"}`}>{level.toUpperCase()}</h3><div className="space-y-2 mt-2">{columns[level].map((s: any) => <button key={s.studentId} onClick={() => setActive(s)} className="w-full text-left border rounded p-2"><div className="font-medium">{s.studentId}</div><div className="text-sm">Score {s.riskScore}</div><div className="text-xs line-clamp-2">{s.recommendation}</div></button>)}</div></div>)}{active && <div className="md:col-span-3 bg-white rounded p-4"><h3 className="font-semibold mb-2">Risk Profile: {active.studentId}</h3><div className="h-72"><ResponsiveContainer><RadarChart data={Object.entries(active.components).map(([k,v]) => ({ component: k, value: v as number }))}><PolarGrid /><PolarAngleAxis dataKey="component" /><PolarRadiusAxis /><Radar dataKey="value" stroke="#C0392B" fill="#C0392B" fillOpacity={0.4} /></RadarChart></ResponsiveContainer></div><p className="mt-2 text-sm">{active.recommendation}</p><div className="flex gap-2 mt-3"><button className="px-3 py-2 bg-blue text-white rounded" onClick={() => adminApi.riskAction(active.studentId, "notify_student").then(() => { alert("Notification Sent!"); setActive(null); load(); })}>Send Notification to Student</button><button className="px-3 py-2 bg-slate-900 text-white rounded" onClick={() => adminApi.riskAction(active.studentId, "assign_counselor").then(() => { alert("Assigned to Counselor!"); setActive(null); load(); })}>Assign to Counselor</button></div></div>}</div>;
}

export function AdminWhatIfSimulatorPage() {
  const [type, setType] = useState("attendance_threshold");
  const [params, setParams] = useState<Record<string, number | string>>({ new_threshold: 85, current_size: 60, new_size: 45, remove_classes_before_hour: 9, teacher_id: "t1", project_additional_leaves: 3 });
  const [result, setResult] = useState<any>(null);
  return <div className="space-y-3"><div className="grid md:grid-cols-4 gap-2">{[["attendance_threshold","Attendance Threshold"],["section_size","Section Size"],["timetable_shift","Timetable Shift"],["teacher_leave_pattern","Teacher Leave Pattern"]].map(([id,label]) => <button key={id} className={`p-3 rounded border ${type===id?"bg-blue text-white":"bg-white"}`} onClick={() => setType(id)}>{label}</button>)}</div><div className="bg-white p-4 rounded grid md:grid-cols-2 gap-2"><input className="border rounded p-2" type="number" placeholder="New threshold" value={Number(params.new_threshold)} onChange={(e) => setParams((p) => ({ ...p, new_threshold: Number(e.target.value) }))} /><input className="border rounded p-2" type="number" placeholder="Current size" value={Number(params.current_size)} onChange={(e) => setParams((p) => ({ ...p, current_size: Number(e.target.value) }))} /><input className="border rounded p-2" type="number" placeholder="New size" value={Number(params.new_size)} onChange={(e) => setParams((p) => ({ ...p, new_size: Number(e.target.value) }))} /><button className="px-3 py-2 bg-teal text-white rounded" onClick={async () => setResult(await adminApi.simulate({ simulation_type: type, parameters: params }))}>Run Simulation</button></div>{result && <div className="bg-white p-4 rounded"><h3 className="font-semibold">Simulation Result</h3><pre className="text-sm whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre><span className="inline-block mt-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">(Estimated — based on historical data correlation)</span></div>}</div>;
}

export function AdminLeavePage() {
  const [rows, setRows] = useState<any[]>([]);
  const load = () => adminApi.leavePending().then(setRows);
  useEffect(() => { load(); }, []);
  return <div className="space-y-3"><div className="flex gap-2"><button className="px-3 py-2 bg-blue text-white rounded">Pending</button><button className="px-3 py-2 bg-white rounded">History</button></div><div className="bg-white rounded overflow-auto"><table className="w-full text-sm"><thead><tr><th>Teacher</th><th>Type</th><th>Dates</th><th>Affected</th><th>Substitute</th><th>Actions</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id} className="border-t"><td>{r.teacher}</td><td>{r.leave_type}</td><td>{r.dates}</td><td>{r.affected_classes}</td><td>{r.substitute_status}</td><td><div className="flex gap-2"><button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => { adminApi.approveLeave(r.id); setRows(curr => curr.filter(x => x.id !== r.id)); }}>Approve</button><button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => { adminApi.rejectLeave(r.id); setRows(curr => curr.filter(x => x.id !== r.id)); }}>Reject</button></div></td></tr>)}</tbody></table></div></div>;
}

export function AdminTimetablePage() {
  const [data, setData] = useState<any>(null);
  const load = () => adminApi.timetable().then(setData);
  useEffect(() => { load(); }, []);
  if (!data) return <div>Loading timetable...</div>;
  return <div className="space-y-3"><div className="flex gap-2"><button className="px-3 py-2 bg-blue text-white rounded" onClick={() => { alert("AI is generating a new draft..."); setTimeout(() => alert("Draft generated successfully!"), 1000); }}>Generate New Timetable</button><button className="px-3 py-2 bg-teal text-white rounded" onClick={() => adminApi.publishTimetable().then(() => { alert("Timetable Published to all students & teachers!"); load(); })}>Publish Timetable</button><button className="px-3 py-2 bg-white rounded">Export PDF</button><button className="px-3 py-2 bg-white rounded">Export Excel</button></div><div className="bg-white p-4 rounded overflow-auto"><table className="w-full text-sm"><thead><tr><th>Time</th>{data.days.map((d: string) => <th key={d}>{d}</th>)}</tr></thead><tbody>{data.slots.map((slot: string) => <tr key={slot} className="border-t"><td>{slot}</td>{data.days.map((d: string) => { const c = data.cells.find((x: any) => x.day===d && x.slot===slot); return <td key={d+slot} className="p-2">{c ? <div className="rounded bg-slate-100 p-2 text-xs">{c.subject}<br/>{c.section}<br/>{c.teacher}<br/>{c.room} {c.locked?"🔒":""}</div> : "-"}</td>; })}</tr>)}</tbody></table></div></div>;
}

export function AdminEventsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [view, setView] = useState<"month"|"list">("month");
  const [form, setForm] = useState({ title: "", description: "", event_type: "Holiday", target: "Everyone", starts_at: "", ends_at: "" });
  const load = () => adminApi.events().then(setRows);
  useEffect(() => { load(); }, []);
  return <div className="space-y-3"><div className="flex gap-2"><button className={`px-3 py-2 rounded ${view==="month"?"bg-blue text-white":"bg-white"}`} onClick={() => setView("month")}>Month View</button><button className={`px-3 py-2 rounded ${view==="list"?"bg-blue text-white":"bg-white"}`} onClick={() => setView("list")}>List View</button></div><div className="bg-white p-4 rounded grid md:grid-cols-2 gap-2"><input className="border p-2 rounded" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /><input className="border p-2 rounded" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /><select className="border p-2 rounded" value={form.event_type} onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value }))}><option>Holiday</option><option>Exam</option><option>Cultural</option><option>Other</option></select><select className="border p-2 rounded" value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}><option>Everyone</option><option>Specific Section</option><option>Specific Teacher</option></select><input className="border p-2 rounded" type="datetime-local" value={form.starts_at} onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))} /><input className="border p-2 rounded" type="datetime-local" value={form.ends_at} onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))} /><button className="px-3 py-2 bg-teal text-white rounded" onClick={async () => { await adminApi.createEvent(form); load(); }}>Create Event</button></div><div className="bg-white p-4 rounded space-y-2">{rows.map((e) => <div key={e.id} className="border rounded p-2 flex justify-between items-center"><div><div className="font-medium">{e.title}</div><div className="text-xs text-slate-500">{e.event_type} • {e.target} • {new Date(e.starts_at).toLocaleString()}</div></div><div className="flex gap-2"><button className="px-2 py-1 bg-slate-200 rounded" onClick={() => adminApi.updateEvent(e.id, { title: `${e.title} (Updated)` }).then(load)}>Edit</button><button className="px-2 py-1 bg-red-100 text-red-700 rounded" onClick={() => adminApi.deleteEvent(e.id).then(load)}>Delete</button></div></div>)}</div></div>;
}
