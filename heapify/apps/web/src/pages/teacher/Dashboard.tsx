import { useEffect, useState } from "react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { teacherApi } from "../../api/endpoints/teacher";
import { EmptyState, ErrorState, SkeletonCard } from "../../components/shared/States";
import toast from "react-hot-toast";
import { Calendar, BookOpen, Clock, Users, Activity, CheckCircle, AlertCircle } from "lucide-react";

export default function TeacherDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    try {
      setError(null);
      setData(await teacherApi.dashboard());
    } catch (e: any) {
      setError(e?.message || "Failed to load teacher dashboard");
    }
  };
  useEffect(() => { load(); }, []);
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <div className="flex h-[50vh] items-center justify-center text-slate-400 font-medium animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Premium Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white shadow-xl shadow-blue-500/30">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="text-white/80 text-sm font-medium uppercase mb-1">Today's Classes</div>
              <div className="text-4xl font-bold">{data.today_schedule.length}</div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"><Calendar className="w-6 h-6 text-white" /></div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 p-6 text-white shadow-xl shadow-teal-500/30">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="text-white/80 text-sm font-medium uppercase mb-1">Leave Balance</div>
              <div className="text-4xl font-bold">{data.leave_balance.casual_remaining + data.leave_balance.sick_remaining}</div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"><Activity className="w-6 h-6 text-white" /></div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-white shadow-xl shadow-orange-500/30">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="text-white/80 text-sm font-medium uppercase mb-1">Substitute Req</div>
              <div className="text-4xl font-bold">{data.pending_substitute_requests.length}</div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"><Users className="w-6 h-6 text-white" /></div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-96">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Clock className="w-4 h-4" /></div>
            Today's Schedule
          </h3>
          <div className="flex-1 overflow-auto space-y-3 pr-2 scrollbar-thin">
            {data.today_schedule.length ? data.today_schedule.map((s: any) => (
              <div key={s.session_id} className="group border border-slate-100 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-100 transition-colors rounded-xl p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800 text-sm mb-1">{s.start_time} - {s.end_time}</div>
                  <div className="text-xs font-medium text-slate-500">{s.subject} • Section {s.section}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" /> Room {s.room}</div>
                </div>
                <button disabled={s.attendance_marked} onClick={() => { toast.success("Attendance marked!"); setData((d: any) => ({ ...d, today_schedule: d.today_schedule.map((x: any) => x.session_id === s.session_id ? { ...x, attendance_marked: true } : x) })); }} className="px-4 py-2 bg-white text-blue-600 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 shadow-sm rounded-lg text-xs font-medium transition-all group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">{s.attendance_marked ? "Marked" : "Mark Attendance"}</button>
              </div>
            )) : <EmptyState message="No classes in schedule for today." />}
          </div>
        </div>

        {/* Syllabus Progress & Substitute Requests */}
        <div className="flex flex-col gap-6 h-96">
          {/* Syllabus Progress */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex-1 overflow-auto pr-2 scrollbar-thin">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center"><BookOpen className="w-4 h-4" /></div>
              Syllabus Progress
            </h3>
            <div className="space-y-4">
              {data.syllabus_progress.map((s: any) => (
                <div key={s.subject_id}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-700">{s.name} ({s.section_name})</span>
                    <span className="text-teal-600">{s.completed_pct}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${s.completed_pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Substitute Requests */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex-1 overflow-auto pr-2 scrollbar-thin">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><AlertCircle className="w-4 h-4" /></div>
              Substitute Requests
            </h3>
            <div className="space-y-3">
              {data.pending_substitute_requests.length ? data.pending_substitute_requests.map((r: any) => (
                <div key={r.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <p className="text-sm text-slate-700 mb-1">Cover: <span className="font-semibold">{r.subject} {r.section}</span></p>
                  <p className="text-xs text-slate-500 mb-3">{r.date} at {r.time} • Your schedule: <span className={`font-semibold ${r.is_free ? 'text-green-600' : 'text-red-500'}`}>{r.is_free ? "FREE" : "BUSY"}</span></p>
                  <button disabled={!r.is_free} onClick={() => teacherApi.volunteerSubstitute(r.id).then(() => { toast.success("Volunteer response submitted"); setData((d: any) => ({ ...d, pending_substitute_requests: d.pending_substitute_requests.filter((x: any) => x.id !== r.id) })); }).catch(() => toast.error("Unable to volunteer"))} className="w-full py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/20 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none transition-all hover:scale-[1.02]">I'm Available</button>
                </div>
              )) : <div className="text-center text-sm text-slate-400 py-4">No substitute requests right now.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeacherAttendancePage() {
  const [tab, setTab] = useState<"mark" | "reports">("mark");
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [roster, setRoster] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);

  useEffect(() => { teacherApi.sessionsToday().then((rows) => { setSessions(rows); if (rows.length) setSessionId(rows[0].session_id); }); }, []);
  useEffect(() => { if (sessionId) teacherApi.roster(sessionId).then(setRoster); }, [sessionId]);
  useEffect(() => { if (tab === "reports") Promise.all([teacherApi.attendanceReports(), teacherApi.defaulters()]).then(([r, d]) => setReports({ ...r, defaulters: d })); }, [tab]);

  return <div>
    <div className="flex gap-2 mb-3"><button onClick={() => setTab("mark")} className={`px-3 py-2 rounded ${tab === "mark" ? "bg-blue text-white" : "bg-white"}`}>Mark Attendance</button><button onClick={() => setTab("reports")} className={`px-3 py-2 rounded ${tab === "reports" ? "bg-blue text-white" : "bg-white"}`}>Reports</button></div>
    {tab === "mark" && <div className="bg-white p-4 rounded"><select className="border rounded px-2 py-1" value={sessionId} onChange={(e) => setSessionId(e.target.value)}>{sessions.map((s) => <option key={s.session_id} value={s.session_id}>{s.subject} {s.section} ({s.start_time})</option>)}</select><div className="mt-3 flex gap-2"><button className="px-3 py-1 bg-slate-200 rounded" onClick={() => setRoster((rows) => rows.map((r) => ({ ...r, status: "present" })))}>Mark All Present</button><button className="px-3 py-1 bg-slate-200 rounded" onClick={() => setRoster((rows) => rows.map((r) => ({ ...r, status: "absent" })))}>Mark All Absent</button></div><table className="w-full mt-3 text-sm"><thead><tr><th>Name</th><th>ID</th><th>Status</th><th>GPS</th></tr></thead><tbody>{roster.map((r) => <tr key={r.id} className="border-t"><td>{r.name}</td><td>{r.student_id}</td><td><div className="flex gap-2">{["present", "absent", "late"].map((st) => <label key={st}><input type="radio" checked={r.status === st} onChange={() => setRoster((rows) => rows.map((x) => x.id === r.id ? { ...x, status: st } : x))} /> {st}</label>)}</div></td><td>{r.gps_verified ? "(GPS Verified)" : "-"}</td></tr>)}</tbody></table><button className="mt-3 bg-blue text-white px-3 py-2 rounded" onClick={() => teacherApi.markAttendance(sessionId, roster.map((r) => ({ student_id: r.id, status: r.status }))).then(() => toast.success("Attendance successfully recorded!"))}>Submit Attendance</button></div>}
    {tab === "reports" && reports && <div className="space-y-4"><div className="bg-white p-4 rounded"><h3 className="font-semibold">Defaulter list</h3><table className="w-full text-sm mt-2"><thead><tr><th>Name</th><th>%</th><th>Subject</th></tr></thead><tbody>{reports.defaulters.map((d: any, i: number) => <tr key={i} className="border-t"><td>{d.name}</td><td>{d.attendance_pct}</td><td>{d.subject}</td></tr>)}</tbody></table></div><div className="bg-white p-4 rounded h-56"><ResponsiveContainer><BarChart data={reports.sessions}><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="attendance_rate" fill="#2E6DA4" /></BarChart></ResponsiveContainer></div></div>}
  </div>;
}

export function TeacherLeavePage() {
  const [balance, setBalance] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [form, setForm] = useState({ leave_type: "casual", start_date: "", end_date: "", reason: "", needs_substitute: true });
  const [affected, setAffected] = useState(0);

  useEffect(() => { Promise.all([teacherApi.leaveBalance(), teacherApi.leaveRequests()]).then(([b, h]) => { setBalance(b); setHistory(h); }); }, []);
  useEffect(() => { if (form.start_date && form.end_date) teacherApi.affectedSessions(form.start_date, form.end_date).then((d) => setAffected(d.affected_classes)); }, [form.start_date, form.end_date]);

  return <div className="space-y-4"><div className="grid md:grid-cols-2 gap-3">{balance && <><div className="bg-white p-4 rounded">Casual ({balance.casual_remaining} remaining of 12)</div><div className="bg-white p-4 rounded">Sick ({balance.sick_remaining} remaining of 10)</div></>}</div><div className="bg-white p-4 rounded space-y-2"><h3 className="font-semibold">Request Leave</h3><div className="flex gap-3">{["sick", "casual", "emergency"].map((t) => <label key={t}><input type="radio" checked={form.leave_type === t} onChange={() => setForm((f) => ({ ...f, leave_type: t }))} /> {t}</label>)}</div><div className="grid md:grid-cols-2 gap-2"><input type="date" className="border rounded p-2" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} /><input type="date" className="border rounded p-2" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} /></div>{affected > 0 && <div className="bg-amber-100 p-2 rounded">{affected} classes will be affected</div>}<label><input type="checkbox" checked={form.needs_substitute} onChange={(e) => setForm((f) => ({ ...f, needs_substitute: e.target.checked }))} /> Needs Substitute</label><textarea className="w-full border rounded p-2" placeholder="Reason" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} /><button className="bg-blue text-white px-3 py-2 rounded" onClick={async () => { await teacherApi.submitLeave(form); setHistory(await teacherApi.leaveRequests()); }}>Submit</button><p className="text-sm text-slate-500">Emergency leave can be submitted same-day. A substitute search will start immediately upon submission.</p></div><div className="bg-white p-4 rounded"><h3 className="font-semibold">History</h3><table className="w-full text-sm mt-2"><thead><tr><th>Date Range</th><th>Type</th><th>Status</th><th>Admin Comment</th></tr></thead><tbody>{history.map((h) => <tr key={h.id} className="border-t"><td>{h.start} to {h.end}</td><td>{h.type}</td><td>{h.status}</td><td>{h.adminComment || "-"}</td></tr>)}</tbody></table></div></div>;
}

export function TeacherResourcesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ filename: "", resource_type: "pdf", chapter: "", topic: "", is_current_syllabus: false });
  const load = () => teacherApi.resources().then(setRows);
  useEffect(() => { load(); }, []);
  return <div className="space-y-4"><div className="bg-white p-4 rounded"><h3 className="font-semibold">Upload Resource</h3><div className="grid md:grid-cols-2 gap-2 mt-2"><input className="border p-2 rounded" placeholder="Filename" value={form.filename} onChange={(e) => setForm((f) => ({ ...f, filename: e.target.value }))} /><select className="border p-2 rounded" value={form.resource_type} onChange={(e) => setForm((f) => ({ ...f, resource_type: e.target.value }))}><option>pdf</option><option>ppt</option><option>doc</option><option>video_url</option><option>external_link</option></select><input className="border p-2 rounded" placeholder="Chapter" value={form.chapter} onChange={(e) => setForm((f) => ({ ...f, chapter: e.target.value }))} /><input className="border p-2 rounded" placeholder="Topic" value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} /></div><label className="block mt-2"><input type="checkbox" checked={form.is_current_syllabus} onChange={(e) => setForm((f) => ({ ...f, is_current_syllabus: e.target.checked }))} /> Mark as current syllabus</label><button className="mt-2 px-3 py-2 bg-blue text-white rounded" onClick={async () => { await teacherApi.uploadResource(form); load(); }}>Upload</button></div><div className="grid md:grid-cols-2 gap-3">{rows.map((r) => <div key={r.id} className="bg-white p-4 rounded"><p className="font-medium">{r.name}</p><p className="text-sm">{r.type} • {r.chapter} • {r.topic}</p><p className="text-xs">Indexing: {r.indexed ? "indexed" : "pending"}</p><div className="mt-2 flex gap-2"><button className="px-2 py-1 bg-slate-200 rounded" onClick={() => teacherApi.toggleCurrentSyllabus(r.id, !r.is_current_syllabus).then(load)}>{r.is_current_syllabus ? "Unset Current" : "Set Current"}</button><button className="px-2 py-1 bg-red-100 text-red-700 rounded" onClick={() => teacherApi.deleteResource(r.id).then(load)}>Delete</button></div></div>)}</div></div>;
}

export function TeacherPrePrepPage() {
  const [tab, setTab] = useState<"plan" | "checklist">("plan");
  const [topics, setTopics] = useState<Array<{ id: string; topic: string; subtopics: string; duration: number }>>([{ id: crypto.randomUUID(), topic: "", subtopics: "", duration: 30 }]);
  const [backlog, setBacklog] = useState<any[]>([]);
  const [checklist, setChecklist] = useState<any[]>([]);
  const sessionId = "s1";

  useEffect(() => { teacherApi.getBacklog().then(setBacklog); teacherApi.getChecklist(sessionId).then(setChecklist); }, []);

  return <div><div className="flex gap-2 mb-3"><button onClick={() => setTab("plan")} className={`px-3 py-2 rounded ${tab === "plan" ? "bg-blue text-white" : "bg-white"}`}>Plan Next Class</button><button onClick={() => setTab("checklist")} className={`px-3 py-2 rounded ${tab === "checklist" ? "bg-blue text-white" : "bg-white"}`}>Post-Class Checklist</button></div>{tab === "plan" ? <div className="space-y-3"><div className="bg-white p-4 rounded">{topics.map((t) => <div key={t.id} className="grid md:grid-cols-3 gap-2 mb-2"><input className="border p-2 rounded" placeholder="Topic" value={t.topic} onChange={(e) => setTopics((rows) => rows.map((x) => x.id === t.id ? { ...x, topic: e.target.value } : x))} /><input className="border p-2 rounded" placeholder="Subtopics" value={t.subtopics} onChange={(e) => setTopics((rows) => rows.map((x) => x.id === t.id ? { ...x, subtopics: e.target.value } : x))} /><input type="range" min={5} max={120} value={t.duration} onChange={(e) => setTopics((rows) => rows.map((x) => x.id === t.id ? { ...x, duration: Number(e.target.value) } : x))} /></div>)}<button className="px-3 py-2 bg-slate-200 rounded" onClick={() => setTopics((rows) => [...rows, { id: crypto.randomUUID(), topic: "", subtopics: "", duration: 30 }])}>Add Topic</button><div className="mt-3 flex gap-2"><button className="px-3 py-2 bg-slate-900 text-white rounded" onClick={() => teacherApi.createPreprep({ status: "draft", topics }).then(() => toast.success("Draft saved successfully"))}>Save Draft</button><button className="px-3 py-2 bg-teal text-white rounded" onClick={() => teacherApi.createPreprep({ status: "published", topics }).then(() => { toast.success("Published & notifications sent!"); setTopics([{ id: crypto.randomUUID(), topic: "", subtopics: "", duration: 30 }]); })}>Publish & Notify Students</button></div></div><div className="bg-white p-4 rounded"><h3 className="font-semibold">Backlog</h3>{backlog.map((b) => <div key={b.topic} className="flex justify-between border-t py-2"><span>{b.topic}</span><button className="text-blue underline" onClick={() => setTopics((rows) => [...rows, { id: crypto.randomUUID(), topic: b.topic, subtopics: "", duration: 20 }])}>Add to Plan</button></div>)}</div></div> : <div className="bg-white p-4 rounded"><h3 className="font-semibold">Checklist</h3>{checklist.map((c) => <label key={c.id} className="block border-t py-2"><input type="checkbox" checked={c.is_completed} onChange={(e) => setChecklist((rows) => rows.map((x) => x.id === c.id ? { ...x, is_completed: e.target.checked } : x))} /> <span className="ml-2">{c.topic}</span>{!c.is_completed && <span className="ml-2 text-amber-700">Will be queued to next session</span>}</label>)}<button className="mt-3 px-3 py-2 bg-blue text-white rounded" onClick={() => teacherApi.submitChecklist(sessionId, checklist).then(() => toast.success("Checklist submitted!"))}>Submit Checklist</button></div>}</div>;
}

export function TeacherTestsPage() {
  const [step, setStep] = useState(1);
  const [generated, setGenerated] = useState<any>(null);
  const [config, setConfig] = useState({ title: "", question_count: 10, easy: 30, medium: 50, hard: 20, mcq: 60, short_answer: 20, true_false: 20 });
  return <div className="space-y-3"><div className="bg-white p-4 rounded">Step {step} of 3</div>{step === 1 && <div className="bg-white p-4 rounded"><input className="border p-2 rounded w-full" placeholder="Test title" value={config.title} onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))} /><button className="mt-3 px-3 py-2 bg-blue text-white rounded" onClick={() => setStep(2)}>Next</button></div>}{step === 2 && <div className="bg-white p-4 rounded"><p>Difficulty and type distributions</p><button className="mt-3 px-3 py-2 bg-blue text-white rounded" onClick={() => setStep(3)}>Next</button></div>}{step === 3 && <div className="bg-white p-4 rounded"><button className="px-3 py-2 bg-teal text-white rounded" onClick={async () => setGenerated(await teacherApi.generateTest(config))}>Generate Questions</button>{generated && <div className="mt-3 space-y-2">{generated.questions.map((q: any) => <div key={q.id} className="border rounded p-2"><input className="w-full border p-1 rounded" value={q.question_text} onChange={(e) => setGenerated((g: any) => ({ ...g, questions: g.questions.map((x: any) => x.id === q.id ? { ...x, question_text: e.target.value } : x) }))} /></div>)}<button className="px-3 py-2 bg-blue text-white rounded" onClick={async () => { await teacherApi.publishTest(generated.id); toast.success("Test successfully published!"); setStep(1); setConfig({ title: "", question_count: 10, easy: 30, medium: 50, hard: 20, mcq: 60, short_answer: 20, true_false: 20 }); setGenerated(null); }}>Approve & Publish</button></div>}</div>}</div>;
}

export function TeacherTestAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { teacherApi.testAnalytics("tg1").then(setData); }, []);
  if (!data) return <div>Loading analytics...</div>;
  return <div className="space-y-4"><div className="bg-white p-4 rounded h-56"><ResponsiveContainer><BarChart data={data.score_distribution}><XAxis dataKey="range" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#2E6DA4" /></BarChart></ResponsiveContainer></div><div className="bg-white p-4 rounded h-64"><ResponsiveContainer><ScatterChart><XAxis type="category" dataKey="topic" name="Topic" /><YAxis type="category" dataKey="student" name="Student" /><Tooltip cursor={{ strokeDasharray: "3 3" }} /><Scatter data={data.topic_heatmap} fill="#1A7A6E" /></ScatterChart></ResponsiveContainer></div><div className="bg-white p-4 rounded"><button className="px-3 py-2 bg-slate-900 text-white rounded" onClick={() => window.print()}>Export PDF</button></div></div>;
}

export function TeacherChatPage() {
  const rooms = [{ id: "room_math_a", name: "Mathematics - CS A" }, { id: "room_phy_a", name: "Physics - CS A" }];
  const [roomId, setRoomId] = useState(rooms[0].id);
  const [summary, setSummary] = useState<any>(null);
  const [date] = useState(new Date().toISOString().slice(0, 10));
  return <div className="grid md:grid-cols-[260px,1fr] gap-3"><div className="bg-white p-3 rounded">{rooms.map((r) => <div key={r.id} className="border-b py-2"><button onClick={() => setRoomId(r.id)} className="text-left w-full">{r.name}</button><button onClick={async () => setSummary(await teacherApi.chatSummary(r.id, date))} className="mt-1 text-sm text-blue underline">Generate Summary</button></div>)}</div><div className="bg-white p-4 rounded">{summary ? <div className="space-y-3"><div className="grid grid-cols-2 md:grid-cols-4 gap-2"><div>Total Messages: {summary.total_questions}</div><div>Participants: {summary.unique_participants}</div><div>Session Date: {date}</div><div>Room: {roomId}</div></div><div className="h-56"><ResponsiveContainer><LineChart data={summary.timeline_data}><XAxis dataKey="t" /><YAxis /><Tooltip /><Line dataKey="count" stroke="#2E6DA4" /></LineChart></ResponsiveContainer></div><div>{summary.deduplicated_questions.map((q: any) => <div key={q.canonical_question} className="border rounded p-2">{q.canonical_question} <span className="text-xs bg-slate-100 px-2 rounded">Asked by {q.asked_count}</span></div>)}</div><div className="h-48"><ResponsiveContainer><BarChart data={summary.flag_summary}><XAxis dataKey="reason" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#C0392B" /></BarChart></ResponsiveContainer></div></div> : <div>Select room and generate summary.</div>}</div></div>;
}
