import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import CompleteRegistrationPage from "./pages/auth/CompleteRegistrationPage";
import AppShell from "./components/layout/AppShell";
import StudentDashboardPage from "./pages/student/Dashboard";
import StudentAttendancePage from "./pages/student/Attendance";
import StudentPrePrepPage from "./pages/student/PrePrep";
import StudentTestsPage from "./pages/student/Tests";
import StudentTakeTestPage from "./pages/student/TakeTest";
import StudentResultPage from "./pages/student/TestResult";
import StudentChatPage from "./pages/student/Chat";
import StudentEventsPage from "./pages/student/Events";
import AITutorPage from "./pages/student/AITutor";
import StudentProfilePage from "./pages/student/Profile";
import TeacherDashboardPage from "./pages/teacher/Dashboard";
import TeacherAttendancePage from "./pages/teacher/Attendance";
import TeacherLeavePage from "./pages/teacher/Leave";
import TeacherResourcesPage from "./pages/teacher/Resources";
import TeacherPrePrepPage from "./pages/teacher/PrePrep";
import TeacherTestsPage from "./pages/teacher/Tests";
import TeacherChatPage from "./pages/teacher/Chat";
import TeacherTestAnalyticsPage from "./pages/teacher/TestAnalytics";
import TeacherProfilePage from "./pages/teacher/Profile";
import AdminDashboardPage from "./pages/admin/Dashboard";
import AdminAnalyticsPage from "./pages/admin/Analytics";
import AdminStudentsPage from "./pages/admin/Students";
import AdminTeachersPage from "./pages/admin/Teachers";
import AdminRiskEnginePage from "./pages/admin/RiskEngine";
import AdminWhatIfSimulatorPage from "./pages/admin/WhatIfSimulator";
import AdminLeavePage from "./pages/admin/Leave";
import AdminTimetablePage from "./pages/admin/Timetable";
import AdminEventsPage from "./pages/admin/Events";
import TimetableGeneratorPage from "./pages/admin/TimetableGenerator";
import AdminModerationPage from "./pages/admin/Moderation";
import { useAuthStore } from "./store/auth.store";

function Protected({ role }: { role: "student" | "teacher" | "admin" }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return <Outlet />;
}

export default function App() {
  const location = useLocation();
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          success: { duration: 3000, style: { background: "#1A7A4A", color: "#fff" } },
          error: { duration: 5000, style: { background: "#C0392B", color: "#fff" } },
          duration: 3000,
          style: { background: "#2E6DA4", color: "#fff" },
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/complete-registration" element={<CompleteRegistrationPage />} />

        <Route element={<Protected role="student" />}>
          <Route path="/student" element={<AppShell />}>
            <Route path="dashboard" element={<StudentDashboardPage />} />
            <Route path="attendance" element={<StudentAttendancePage />} />
            <Route path="preprep" element={<StudentPrePrepPage />} />
            <Route path="tests" element={<StudentTestsPage />} />
            <Route path="tests/:testId/take" element={<StudentTakeTestPage />} />
            <Route path="tests/:testId/result" element={<StudentResultPage />} />
            <Route path="chat" element={<StudentChatPage />} />
            <Route path="events" element={<StudentEventsPage />} />
            <Route path="ai-tutor" element={<AITutorPage />} />
            <Route path="profile" element={<StudentProfilePage />} />
          </Route>
        </Route>

        <Route element={<Protected role="teacher" />}>
          <Route path="/teacher" element={<AppShell />}>
            <Route path="dashboard" element={<TeacherDashboardPage />} />
            <Route path="attendance" element={<TeacherAttendancePage />} />
            <Route path="leave" element={<TeacherLeavePage />} />
            <Route path="resources" element={<TeacherResourcesPage />} />
            <Route path="preprep" element={<TeacherPrePrepPage />} />
            <Route path="tests" element={<TeacherTestsPage />} />
            <Route path="tests/:testId/analytics" element={<TeacherTestAnalyticsPage />} />
            <Route path="chat" element={<TeacherChatPage />} />
            <Route path="profile" element={<TeacherProfilePage />} />
          </Route>
        </Route>

        <Route element={<Protected role="admin" />}>
          <Route path="/admin" element={<AppShell />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="students" element={<AdminStudentsPage />} />
            <Route path="teachers" element={<AdminTeachersPage />} />
            <Route path="risk" element={<AdminRiskEnginePage />} />
            <Route path="simulator" element={<AdminWhatIfSimulatorPage />} />
            <Route path="leave" element={<AdminLeavePage />} />
            <Route path="timetable" element={<AdminTimetablePage />} />
            <Route path="timetable/generator" element={<TimetableGeneratorPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="moderation" element={<AdminModerationPage />} />
          </Route>
        </Route>

            <Route path="*" element={<div className="p-10">404 - Page not found</div>} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
