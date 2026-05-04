import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import { Link } from "react-router-dom";

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const role = useAuthStore((s) => s.user?.role);
  const mobileNav = role === "student"
    ? [{ to: "/student/dashboard", label: "Home" }, { to: "/student/tests", label: "Tests" }, { to: "/student/chat", label: "Chat" }, { to: "/student/profile", label: "Profile" }]
    : role === "teacher"
      ? [{ to: "/teacher/dashboard", label: "Home" }, { to: "/teacher/attendance", label: "Attendance" }, { to: "/teacher/chat", label: "Chat" }, { to: "/teacher/profile", label: "Profile" }]
      : [{ to: "/admin/dashboard", label: "Home" }, { to: "/admin/analytics", label: "Analytics" }, { to: "/admin/timetable", label: "Timetable" }, { to: "/admin/events", label: "Events" }];
  return (
    <div className="h-screen flex bg-surface">
      <div className="hidden md:block"><Sidebar /></div>
      {open && <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setOpen(false)}><div className="w-64 h-full" onClick={(e) => e.stopPropagation()}><Sidebar /></div></div>}
      <div className="flex-1 flex flex-col min-h-0">
        <Header onMenu={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6"><Outlet /></main>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t grid grid-cols-4">
          {mobileNav.map((item) => <Link aria-label={item.label} key={item.to} to={item.to} className="text-center py-3 text-xs">{item.label}</Link>)}
        </nav>
      </div>
    </div>
  );
}

