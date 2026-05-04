import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [counters, setCounters] = useState({ students: 0, ai: 0, attendance: 0 });
  const text = "Student: Explain binary search quickly.\nAI: Think of a dictionary - open middle first.";
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const t = setInterval(() => setCounters((c) => ({ students: Math.min(5000, c.students + 100), ai: Math.min(50000, c.ai + 1000), attendance: Math.min(200000, c.attendance + 4000) })), 30);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setTyped(text.slice(0, i++));
      if (i > text.length) clearInterval(t);
    }, 35);
    return () => clearInterval(t);
  }, []);

  return <div className="bg-navy text-white min-h-screen">
    <section className="min-h-screen flex flex-col items-center justify-center px-6 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]">
      <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-6xl font-bold bg-gradient-to-r from-blue-light via-teal-light to-blue bg-clip-text text-transparent">Heapify</motion.h1>
      <p className="mt-4 text-xl">The AI-Powered Campus Operating System</p>
      <div className="grid md:grid-cols-3 gap-4 mt-8 w-full max-w-4xl">{[{k:"Students Managed",v:counters.students},{k:"AI Interactions",v:counters.ai},{k:"Attendance Records",v:counters.attendance}].map((c)=><div key={c.k} className="backdrop-blur bg-white/10 border border-white/20 rounded-xl p-5"><p className="text-sm">{c.k}</p><p className="text-2xl font-semibold">{c.v.toLocaleString()}+</p></div>)}</div>
      <Link to="/login" className="mt-8 bg-blue hover:bg-blue-light px-6 py-3 rounded-lg">Login to Campus Portal</Link>
    </section>
    <section className="px-6 py-16 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">{[["Student Experience","Attendance tracking, AI voice tutor, Anonymous class chat, Adaptive mock tests, Pre-prep materials","border-blue"],["Teacher Tools","One-click attendance, AI test generation, Chat heatmap summaries, Leave + substitute management, Syllabus checklist tracker","border-teal"],["Admin Intelligence","Real-time campus metrics, Predictive risk scoring, What-If policy simulator, Auto timetable generation, Intervention engine","border-navy-light"]].map(([t,d,b])=><motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} key={t as string} className={`bg-white/10 border-l-4 ${b} p-6 rounded-lg`}><h3 className="font-semibold text-xl">{t}</h3><p className="mt-2 text-white/80">{d}</p></motion.div>)}</section>
    <section className="px-6 py-16 bg-gradient-to-br from-[#12263f] to-[#1A7A6E] text-center"><h2 className="text-3xl font-bold">Your Personal AI Study Companion — Knows Your Syllabus, Speaks Your Language.</h2><pre className="mt-6 mx-auto max-w-2xl text-left bg-black/30 p-4 rounded-lg min-h-28">{typed}</pre><div className="flex flex-wrap justify-center gap-2 mt-4">{["Summarize","Explain","Quiz Me","Mock Oral","Compare","Simplify"].map((m)=><span key={m} className="bg-white/20 rounded-full px-3 py-1 text-sm">{m}</span>)}</div></section>
    <section className="px-6 py-16 max-w-5xl mx-auto"><div className="grid md:grid-cols-3 gap-6 items-center">{["Admin registers your institution","You receive a role-specific invitation link","Access your personalized campus portal"].map((s,i)=><div className="text-center" key={s}><div className="w-12 h-12 rounded-full bg-blue mx-auto flex items-center justify-center">{i+1}</div><p className="mt-2">{s}</p></div>)}</div></section>
    <footer className="border-t border-white/20 py-8 px-6 text-center text-sm text-white/80"><p className="font-semibold">Heapify - Smarter Campus Operations</p><div className="space-x-4 mt-2"><a href="#">Privacy Policy</a><a href="#">Terms of Service</a></div><p className="mt-2">All registrations are admin-initiated. No public signup.</p></footer>
  </div>;
}

