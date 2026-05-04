import { useEffect, useMemo, useRef, useState } from "react";
import { aiApi } from "../../api/endpoints/admin";

const MODES = [
  { id: "summarize", label: "📝 Summarize" },
  { id: "explain", label: "💡 Explain" },
  { id: "quiz_me", label: "❓ Quiz Me" },
  { id: "mock_oral", label: "🎤 Mock Oral" },
  { id: "compare", label: "⚖️ Compare" },
  { id: "simplify", label: "🎯 Simplify" },
];

export default function AITutorPage() {
  const [subjectId, setSubjectId] = useState("sub_math");
  const [mode, setMode] = useState("explain");
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState(`ai_${Date.now()}`);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [ttsOn, setTtsOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const speak = (text: string) => {
    if (!ttsOn) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1;
    const v = speechSynthesis.getVoices().find((x) => x.lang.startsWith("en"));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  };

  const loadSessions = async () => setSessions(await aiApi.sessions());
  const loadMessages = async (id: string) => setMessages(await aiApi.sessionMessages(id));

  useEffect(() => { loadSessions(); }, []);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input, created_at: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    const res = await aiApi.message({ sessionId, message: input, mode, subjectId });
    const aiMsg = { role: "assistant", content: res.response, used_course_material: res.used_course_material };
    setMessages((m) => [...m, aiMsg]);
    setInput("");
    speak(res.response);
    loadSessions();
  };

  const startVoice = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    mediaRef.current = rec;
    chunksRef.current = [];
    rec.ondataavailable = (e) => chunksRef.current.push(e.data);
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const t = await aiApi.voice(blob);
      setInput(t.transcription);
      setTimeout(() => { setInput(t.transcription); }, 200);
      setTimeout(() => {
        setInput(t.transcription);
      }, 500);
      setTimeout(async () => {
        const text = t.transcription;
        if (!text) return;
        const res = await aiApi.message({ sessionId, message: text, mode, subjectId });
        setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: res.response, used_course_material: res.used_course_material }]);
        speak(res.response);
      }, 1000);
      setRecording(false);
    };
    rec.start();
    setRecording(true);
    setTimeout(() => { if (rec.state === "recording") rec.stop(); }, 1500);
  };

  const activeMode = useMemo(() => MODES.find((m) => m.id === mode)?.label, [mode]);

  return <div className="grid md:grid-cols-[280px,1fr] gap-3 h-[calc(100vh-140px)]">
    <aside className="bg-white rounded p-3 overflow-auto">
      <h3 className="font-semibold">AI Tutor</h3>
      <label className="block mt-3 text-sm">Subject</label>
      <select className="border rounded p-2 w-full" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}><option value="sub_math">Mathematics</option><option value="sub_phy">Physics</option></select>
      <label className="block mt-3 text-sm">Mode</label>
      <div className="grid grid-cols-2 gap-2 mt-2">{MODES.map((m) => <button key={m.id} className={`p-2 rounded text-xs border ${mode===m.id?"bg-blue text-white":"bg-white"}`} onClick={() => setMode(m.id)}>{m.label}</button>)}</div>
      <div className="mt-4 flex justify-between items-center"><h4 className="font-medium">Session History</h4><button className="text-blue text-sm" onClick={() => { const id = `ai_${Date.now()}`; setSessionId(id); setMessages([]); }}>New</button></div>
      <div className="mt-2 space-y-2">{sessions.map((s) => <button key={s.id} className="w-full text-left border rounded p-2 text-xs" onClick={() => { setSessionId(s.id); loadMessages(s.id); }}>{new Date(s.created_at).toLocaleDateString()} - {s.preview}</button>)}</div>
    </aside>

    <section className="bg-white rounded p-3 flex flex-col">
      <div className="flex justify-between items-center border-b pb-2"><div className="text-sm">Mode: <b>{activeMode}</b></div><div className="flex gap-2"><button className={`px-2 py-1 rounded ${ttsOn?"bg-teal text-white":"bg-slate-200"}`} onClick={() => setTtsOn((v) => !v)}>{ttsOn ? "TTS On" : "TTS Off"}</button><button className="px-2 py-1 rounded bg-slate-200" onClick={() => speechSynthesis.cancel()}>Stop Speaking</button></div></div>
      <div className="flex-1 overflow-auto py-3 space-y-3">{messages.map((m, i) => <div key={i} className={`max-w-[78%] rounded p-3 ${m.role === "user" ? "ml-auto bg-blue text-white" : "bg-slate-100"}`}><div className="text-xs opacity-70 mb-1">{m.role === "user" ? "You" : "Heapify AI"}</div><div className="whitespace-pre-wrap">{m.content}</div>{m.role === "assistant" && <details className="mt-2 text-xs"><summary>{m.used_course_material ? "📖 From your course material" : "[General Knowledge]"}</summary><p className="mt-1">Response grounding metadata.</p></details>}<button className="text-xs underline mt-1" onClick={() => navigator.clipboard.writeText(m.content)}>Copy</button></div>)}</div>
      <div className="border-t pt-2 flex gap-2 items-end"><textarea value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 border rounded p-2 min-h-[70px]" placeholder="Ask Heapify AI..." /><div className="flex flex-col gap-2"><button className="px-3 py-2 bg-blue text-white rounded" onClick={send}>Send</button><button className={`w-12 h-12 rounded-full ${recording?"bg-red-500 animate-pulse":"bg-teal"} text-white`} onClick={startVoice} title="Voice input">🎙️</button></div></div>
      {recording && <p className="text-sm text-teal mt-1">Listening...</p>}
    </section>
  </div>;
}
