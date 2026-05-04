import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

const nav = {
  student: [
    { label: "Dashboard", to: "/student/dashboard" },
    { label: "Attendance", to: "/student/attendance" },
    { label: "AI Tutor", to: "/student/ai-tutor" },
    { label: "Mock Tests", to: "/student/tests" },
    { label: "Pre-Prep", to: "/student/preprep" },
    { label: "Chat", to: "/student/chat" },
    { label: "Events", to: "/student/events" },
    { label: "Profile", to: "/student/profile" },
  ],
  teacher: [
    { label: "Dashboard", to: "/teacher/dashboard" },
    { label: "Attendance", to: "/teacher/attendance" },
    { label: "Schedule", to: "/teacher/dashboard" },
    { label: "Leave", to: "/teacher/leave" },
    { label: "Resources", to: "/teacher/resources" },
    { label: "Pre-Prep", to: "/teacher/preprep" },
    { label: "Mock Tests", to: "/teacher/tests" },
    { label: "Chat", to: "/teacher/chat" },
    { label: "Events", to: "/teacher/dashboard" },
    { label: "Profile", to: "/teacher/profile" },
  ],
  admin: [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Analytics", to: "/admin/analytics" },
    { label: "Students", to: "/admin/students" },
    { label: "Teachers", to: "/admin/teachers" },
    { label: "Risk Engine", to: "/admin/risk" },
    { label: "Timetable", to: "/admin/timetable" },
    { label: "Leave Requests", to: "/admin/leave" },
    { label: "Events", to: "/admin/events" },
    { label: "Timetable Generator", to: "/admin/timetable/generator" },
    { label: "Moderation", to: "/admin/moderation" },
  ],
};

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const items = user ? nav[user.role] : [];
  return (
    <aside className="w-64 bg-navy text-white p-4 h-full">
      <h2 className="font-bold text-lg mb-6">Heapify Institute</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <NavLink key={item.label} to={item.to} className="block px-3 py-2 rounded border-l-4 border-transparent aria-[current=page]:border-blue-light hover:bg-navy-light">
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
