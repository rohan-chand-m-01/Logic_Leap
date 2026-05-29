import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import { TrendingDown, TrendingUp, GraduationCap, CalendarDays, BrainCircuit, Activity, Clock, FileCheck, ArrowRight } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { studentApi } from "../../api/endpoints/student";
import { EmptyState, ErrorState } from "../../components/shared/States";
import toast from "react-hot-toast";

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    try {
      setError(null);
      setData(await studentApi.dashboard());
    } catch (e: any) {
      setError(e?.message || "Failed to load dashboard");
    }
  };
  useEffect(() => { load(); }, []);
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <div className="flex h-[50vh] items-center justify-center text-slate-400 font-medium animate-pulse">Loading dashboard...</div>;
  const ringData = [{ name: "present", value: data.attendance.overall_percentage }, { name: "remaining", value: 100 - data.attendance.overall_percentage }];
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Premium Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-xl shadow-purple-500/30 transition-transform hover:-translate-y-1 hover:scale-[1.02] duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="text-white/80 text-sm font-medium uppercase mb-1">Overall Attendance</div>
              <div className="text-4xl font-bold">{data.attendance.overall_percentage}%</div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"><Activity className="w-6 h-6 text-white" /></div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 p-6 text-white shadow-xl shadow-emerald-500/30 transition-transform hover:-translate-y-1 hover:scale-[1.02] duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="text-white/80 text-sm font-medium uppercase mb-1">Pre-Prep Pending</div>
              <div className="text-4xl font-bold">{data.pending_preprep_count}</div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"><FileCheck className="w-6 h-6 text-white" /></div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 p-6 text-white shadow-xl shadow-cyan-500/30 transition-transform hover:-translate-y-1 hover:scale-[1.02] duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="text-white/80 text-sm font-medium uppercase mb-1">Next Class</div>
              <div className="text-lg font-bold leading-tight">{data.next_class ? data.next_class.subject_name : "No Class"}</div>
              <div className="text-sm font-medium opacity-80 mt-1">{data.next_class ? new Date(data.next_class.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}</div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"><Clock className="w-6 h-6 text-white" /></div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Attendance Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-[400px]">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Activity className="w-4 h-4" /></div>
            Attendance Details
          </h3>
          <div className="h-32 mb-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ringData} dataKey="value" innerRadius={40} outerRadius={55} stroke="none">
                  {ringData.map((_: any, i: number) => <Cell key={i} fill={i === 0 ? (data.attendance.status === "green" ? "#10b981" : data.attendance.status === "yellow" ? "#f59e0b" : "#ef4444") : "#f1f5f9"} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">{data.attendance.overall_percentage}%</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto space-y-3 pr-2 scrollbar-thin">
            {data.attendance.subjects.map((s: any) => (
              <div key={s.subject_id}>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-700 truncate mr-2">{s.name}</span>
                  <span className={s.percentage >= 75 ? "text-emerald-600" : "text-red-500"}>{s.percentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${s.percentage >= 75 ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${s.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center (AI & Pre-prep) */}
        <div className="flex flex-col gap-6 h-[400px]">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 shadow-lg shadow-slate-900/20 text-white relative overflow-hidden flex-1 group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors" />
            <h3 className="font-semibold flex items-center gap-2 mb-2 relative z-10">
              <BrainCircuit className="w-5 h-5 text-purple-400" /> AI Tutor
            </h3>
            <p className="text-sm text-slate-300 mb-4 relative z-10 leading-relaxed">Stuck on {data.last_ai_topic ? <span className="text-white font-medium">"{data.last_ai_topic}"</span> : "a recent topic"}? Get instant, personalized help from your AI tutor.</p>
            <Link to="/student/ai-tutor" className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium text-sm transition-colors relative z-10 shadow-sm">
              Start Session <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex-1 flex flex-col justify-between group">
            <div>
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
                <FileCheck className="w-5 h-5 text-teal-500" /> Pre-Prep Assignments
              </h3>
              <p className="text-sm text-slate-500">You have <span className="font-bold text-slate-800">{data.pending_preprep_count}</span> pending topics to review before your next classes.</p>
            </div>
            <Link to="/student/preprep" className="mt-3 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-teal-700 font-medium text-sm transition-colors shadow-sm">
              Review Now
            </Link>
          </div>
        </div>

        {/* Tests & Events */}
        <div className="flex flex-col gap-6 h-[400px]">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex-1 overflow-auto pr-2 scrollbar-thin">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center"><GraduationCap className="w-4 h-4" /></div>
              Recent Tests
            </h3>
            <div className="space-y-3">
              {data.last_three_tests.map((t: any) => (
                <div key={t.title} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-sm font-medium text-slate-700 line-clamp-1 mr-2">{t.title}</span>
                  <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-100">
                    <span className="text-sm font-bold text-slate-800">{t.score}/{t.total}</span>
                    {t.trend === "up" ? <TrendingUp size={14} className="text-emerald-500" /> : t.trend === "down" ? <TrendingDown size={14} className="text-red-500" /> : <div className="w-3.5" />}
                  </div>
                </div>
              ))}
              {data.last_three_tests.length === 0 && <div className="text-sm text-slate-400 text-center py-4">No recent test scores.</div>}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex-1 overflow-auto pr-2 scrollbar-thin">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><CalendarDays className="w-4 h-4" /></div>
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {data.upcoming_events.map((e: any) => (
                <div key={e.id} className="relative pl-4 before:absolute before:left-0 before:top-1.5 before:bottom-0 before:w-0.5 before:bg-blue-400 before:rounded-full">
                  <div className="text-sm font-semibold text-slate-800">{e.title}</div>
                  <div className="text-xs font-medium text-blue-600 mt-0.5">{new Date(e.starts_at).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</div>
                </div>
              ))}
              {data.upcoming_events.length === 0 && <div className="text-sm text-slate-400 text-center py-4">No upcoming events.</div>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export function StudentAttendancePage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState<string>("");
  const [log, setLog] = useState<any>(null);
  useEffect(() => { studentApi.attendanceSummary().then((rows) => { setSubjects(rows); if (rows.length) setSubjectId(rows[0].subject_id); }).catch(() => toast.error("Failed to load attendance")); }, []);
  useEffect(() => { if (subjectId) studentApi.attendanceBySubject(subjectId).then(setLog); }, [subjectId]);
  const current = subjects.find((s) => s.subject_id === subjectId);
  const absencesAway = useMemo(() => current ? Math.max(0, Math.ceil((0.75 * current.total - current.present))) : 0, [current]);

  return <div className="space-y-4">
    {!subjects.length && <EmptyState message="No attendance subjects available yet." />}
    <div className="overflow-x-auto flex gap-2">{subjects.map((s) => <button key={s.subject_id} onClick={() => setSubjectId(s.subject_id)} className={`px-3 py-2 rounded ${s.subject_id === subjectId ? "bg-blue text-white" : "bg-white"}`}>{s.name}</button>)}</div>
    {current && <div className="bg-white rounded p-4"><div className="text-4xl font-bold">{current.percentage}%</div>{(current.percentage < 75 || absencesAway <= 2) && <div className="mt-3 bg-amber-100 text-amber-900 p-2 rounded">You are {absencesAway} absences away from the attendance limit for {current.name}</div>}</div>}
    <div className="bg-white rounded p-4"><h3 className="font-semibold mb-2">5-Month Heatmap</h3><div className="grid grid-cols-10 gap-1">{(log?.entries || []).slice(0, 50).map((e: any, i: number) => <div key={i} title={e.date} className={`h-6 rounded ${e.status === "present" ? "bg-green-500" : e.status === "absent" ? "bg-red-500" : e.status === "late" ? "bg-amber-500" : "bg-slate-200"}`} />)}</div></div>
    <div className="bg-white rounded p-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className="text-left">Date</th><th>Status</th><th>Teacher</th><th>Marked At</th></tr></thead><tbody>{(log?.entries || []).slice().sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((e: any, i: number) => <tr key={i} className="border-t"><td>{new Date(e.date).toLocaleDateString()}</td><td>{e.status}</td><td>{e.teacher}</td><td>{new Date(e.markedAt).toLocaleString()}</td></tr>)}</tbody></table></div>
  </div>;
}

export function StudentPrePrepPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: any[]; total: number }>({ items: [], total: 0 });
  useEffect(() => { studentApi.preprep({ page, search, filter }).then(setData).catch(() => toast.error("Failed to load pre-prep")); }, [page, search, filter]);
  return <div className="space-y-3">
    <div className="flex gap-2"><input className="border px-3 py-2 rounded w-full" placeholder="Search by subject or topic" value={search} onChange={(e) => setSearch(e.target.value)} />{(["all", "pending", "reviewed"] as const).map((f) => <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`px-3 rounded ${filter === f ? "bg-blue text-white" : "bg-white"}`}>{f}</button>)}</div>
    {data.items.map((item) => <div key={item.id} className="bg-white rounded p-4 shadow"><div className="flex justify-between"><div><p className="font-semibold">{item.subject_name}</p><p className="text-sm text-slate-500">{item.teacher_name} - {new Date(item.date).toLocaleDateString()}</p></div><button disabled={item.reviewed} onClick={async () => { await studentApi.markReviewed(item.id); setData((d) => ({ ...d, items: d.items.map((x) => x.id === item.id ? { ...x, reviewed: true, reviewed_at: new Date().toISOString() } : x) })); }} className={`px-3 py-1 rounded ${item.reviewed ? "bg-green-100 text-green-700" : "bg-teal text-white"}`}>{item.reviewed ? "Reviewed" : "Mark as Reviewed"}</button></div><ul className="list-disc pl-5 mt-2">{item.topics.map((t: string) => <li key={t}>{t}</li>)}</ul><div className="mt-2 text-sm">{item.resources.map((r: any) => <a key={r.id} className="text-blue underline mr-3" href={r.url} target="_blank">{r.title}</a>)}</div></div>)}
    <div className="flex justify-between"><button className="px-3 py-1 bg-white rounded" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button><span>Page {page}</span><button className="px-3 py-1 bg-white rounded" onClick={() => setPage((p) => p + 1)} disabled={page * 20 >= data.total}>Next</button></div>
  </div>;
}

export function StudentTestsPage() {
  const [tab, setTab] = useState<"available" | "history">("available");
  const [data, setData] = useState<any>({ available: [], history: [] });
  const navigate = useNavigate();
  useEffect(() => { studentApi.tests().then(setData).catch(() => toast.error("Failed to load tests")); }, []);
  const rows = tab === "available" ? data.available : data.history;
  return <div><div className="flex gap-2 mb-3"><button onClick={() => setTab("available")} className={`px-3 py-2 rounded ${tab === "available" ? "bg-blue text-white" : "bg-white"}`}>Available</button><button onClick={() => setTab("history")} className={`px-3 py-2 rounded ${tab === "history" ? "bg-blue text-white" : "bg-white"}`}>History</button></div><div className="grid md:grid-cols-2 gap-3">{rows.length ? rows.map((t: any) => <div key={t.testId} className="bg-white p-4 rounded"><p className="font-semibold">{t.title}</p><p className="text-sm text-slate-500">{t.subject} • {t.questionCount} questions • {t.timeLimitMin} min</p>{tab === "available" ? <button className="mt-3 bg-blue text-white px-3 py-2 rounded" onClick={() => navigate(`/student/tests/${t.testId}/take`)}>Start Test</button> : <button className="mt-3 bg-teal text-white px-3 py-2 rounded" onClick={() => navigate(`/student/tests/${t.testId}/result`)}>Review</button>}</div>) : <EmptyState message="No tests yet. Tests created by your teachers will appear here." />}</div></div>;
}

export function StudentTakeTestPage() {
  const { testId = "" } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => { studentApi.testDetails(testId).then((t) => { setTest(t); setSecondsLeft((t.timeLimitMin || 30) * 60); }); }, [testId]);
  useEffect(() => {
    if (!secondsLeft) return;
    const i = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(i);
  }, [secondsLeft]);
  useEffect(() => { if (secondsLeft === 0 && test) submit(); }, [secondsLeft]);

  const submit = async () => {
    await studentApi.submitTest(testId, answers, (test.timeLimitMin || 30) * 60 - secondsLeft);
    navigate(`/student/tests/${testId}/result`);
  };

  if (!test) return <div>Loading test...</div>;
  const q = test.questions[index];
  const unanswered = test.questions.filter((qq: any) => !answers[qq.id]).length;

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 p-4 overflow-auto">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">{test.title}</h2>
        <div className={`font-mono text-xl ${secondsLeft < 300 ? "text-red-600" : "text-slate-900"}`}>
          {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
        </div>
      </div>

      <div className="mt-4 grid md:grid-cols-[220px,1fr] gap-4">
        <div className="bg-white rounded p-3">
          <p className="font-medium">Questions</p>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {test.questions.map((qq: any, i: number) => (
              <button key={qq.id} onClick={() => setIndex(i)} className={`w-8 h-8 rounded-full ${answers[qq.id] ? "bg-teal text-white" : "bg-slate-200"}`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded p-4">
          <p className="font-medium">Q{index + 1}. {q.question_text}</p>

          {q.question_type === "mcq" && (
            <div className="mt-3 space-y-2">
              {q.options.map((opt: string) => (
                <label key={opt} className="block">
                  <input type="radio" name={q.id} checked={answers[q.id] === opt} onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))} />
                  <span className="ml-2">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {q.question_type === "true_false" && (
            <div className="mt-3 flex gap-2">
              <button className={`px-4 py-2 rounded ${answers[q.id] === "true" ? "bg-blue text-white" : "bg-slate-200"}`} onClick={() => setAnswers((a) => ({ ...a, [q.id]: "true" }))}>True</button>
              <button className={`px-4 py-2 rounded ${answers[q.id] === "false" ? "bg-blue text-white" : "bg-slate-200"}`} onClick={() => setAnswers((a) => ({ ...a, [q.id]: "false" }))}>False</button>
            </div>
          )}

          {q.question_type === "short_answer" && (
            <textarea className="mt-3 w-full border rounded p-2" maxLength={300} value={answers[q.id] || ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
          )}

          <div className="mt-4 flex justify-between">
            <button onClick={() => setIndex((i) => Math.max(0, i - 1))} className="px-3 py-2 rounded bg-slate-200">Previous</button>
            <button onClick={() => setIndex((i) => Math.min(test.questions.length - 1, i + 1))} className="px-3 py-2 rounded bg-slate-200">Next</button>
            <button
              onClick={() => {
                if (confirm(`Are you sure? You have ${unanswered} unanswered questions.`)) submit();
              }}
              className="px-3 py-2 rounded bg-red-600 text-white"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentResultPage() {
  const { testId = "" } = useParams();
  const [result, setResult] = useState<any>(null);
  useEffect(() => { studentApi.testResult(testId).then(setResult); }, [testId]);
  if (!result) return <div>Loading result...</div>;
  return <div className="space-y-4"><div className="bg-white p-4 rounded"><p className="text-3xl font-bold">{result.score}/{result.total}</p><p>Percentile: {result.percentile} • Time: {Math.round(result.time_taken_seconds / 60)} min</p></div>
    <div className="bg-white p-4 rounded h-64"><ResponsiveContainer><BarChart data={result.topic_breakdown}><XAxis dataKey="topic" /><YAxis /><Tooltip /><Bar dataKey="percentage" fill="#2E6DA4" /></BarChart></ResponsiveContainer></div>
    <div className="bg-white p-4 rounded">{result.question_review.map((q: any) => <details key={q.id} className="border rounded p-2 mb-2"><summary>{q.question_text}</summary><p className={q.student_answer?.toLowerCase() === q.correct_answer?.toLowerCase() ? "text-green-700" : "text-red-700"}>Your answer: {q.student_answer || "-"}</p><p>Correct: {q.correct_answer}</p><p className="text-sm text-slate-600">{q.explanation}</p></details>)}</div>
    <div className="bg-white p-4 rounded h-56"><ResponsiveContainer><LineChart data={result.trend}><XAxis dataKey="label" /><YAxis /><Tooltip /><Line type="monotone" dataKey="score" stroke="#1A7A6E" /></LineChart></ResponsiveContainer></div>
    <div className="bg-amber-50 border border-amber-200 p-4 rounded">{result.recommendation}</div>
  </div>;
}

export function StudentChatPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [cooldown, setCooldown] = useState<any>(null);

  const loadMessages = async (id: string) => {
    const data = await studentApi.roomMessages(id, 1);
    setMessages(data.items);
    setCooldown(await studentApi.cooldown(id));
  };

  useEffect(() => { studentApi.rooms().then((r) => { setRooms(r); if (r.length) setRoomId(r[0].id); }); }, []);
  useEffect(() => { if (roomId) loadMessages(roomId); }, [roomId]);

  const send = async () => {
    const res = await studentApi.sendMessage(roomId, content);
    if (res.success) { setMessages((m) => [...m, res.data]); setContent(""); toast.success("Message sent"); }
    else toast.error(`Your message was flagged: ${res.data?.reason || res.message}`);
  };

  return <div className="grid md:grid-cols-[280px,1fr] gap-3 h-[calc(100vh-140px)]"><div className="bg-white rounded p-3 overflow-auto"><h3 className="font-semibold mb-2">Rooms</h3>{rooms.map((r) => <button key={r.id} onClick={() => setRoomId(r.id)} className={`w-full text-left p-2 rounded ${roomId === r.id ? "bg-blue text-white" : "hover:bg-slate-100"}`}>{r.name}</button>)}</div><div className="bg-white rounded p-3 flex flex-col"><div className="mb-2">{messages.filter((m) => m.isPinned).map((m) => <div key={m.id} className="bg-amber-100 p-2 rounded mb-2">Pinned: {m.content}</div>)}</div>{cooldown?.until && new Date(cooldown.until) > new Date() && <div className="bg-amber-100 text-amber-900 p-2 rounded mb-2">You are in a chat cooldown until {new Date(cooldown.until).toLocaleString()}. This room is read-only for you.</div>}<div className="flex-1 overflow-auto space-y-2">{messages.map((m) => <div key={m.id} className={`max-w-[75%] p-2 rounded ${m.senderId === "student" ? "ml-auto bg-blue text-white" : "bg-slate-100"}`}><div className="text-xs opacity-75">{m.senderId === "student" ? "You" : m.pseudonym}</div><div>{m.content}</div>{m.isAnswered && <details><summary className="text-xs">Answered</summary><p className="text-xs">{m.answerText}</p></details>}<button className="text-xs mt-1 underline" onClick={async () => { await studentApi.upvote(m.id); loadMessages(roomId); }}>Upvote ({m.upvotes})</button></div>)}</div><div className="mt-2 flex gap-2"><input value={content} onChange={(e) => setContent(e.target.value)} className="flex-1 border rounded px-3 py-2" disabled={cooldown?.until && new Date(cooldown.until) > new Date()} /><button onClick={send} className="px-3 py-2 bg-blue text-white rounded" disabled={!content.trim()}>Send</button></div></div></div>;
}

export function StudentEventsPage() {
  const rows = [
    { id: 1, type: "Tests", title: "Physics Viva", date: "2026-05-06", description: "Lab viva preparation" },
    { id: 2, type: "Attendance", title: "Attendance Alert", date: "2026-05-07", description: "Math attendance below threshold" },
  ];
  const [tab, setTab] = useState("All");
  const filtered = tab === "All" ? rows : rows.filter((r) => r.type === tab);
  return <div><div className="flex gap-2 mb-3">{["All", "Tests", "Events", "Attendance", "Pre-Prep"].map((t) => <button key={t} className={`px-3 py-2 rounded ${tab === t ? "bg-blue text-white" : "bg-white"}`} onClick={() => setTab(t)}>{t}</button>)}</div><div className="space-y-2">{filtered.map((e) => <div key={e.id} className="bg-white p-4 rounded"><div className="flex justify-between"><p className="font-medium">{e.title}</p><span className="text-xs bg-slate-100 px-2 rounded">{e.type}</span></div><p className="text-sm text-slate-500">{e.date}</p><p className="text-sm">{e.description}</p></div>)}</div></div>;
}
