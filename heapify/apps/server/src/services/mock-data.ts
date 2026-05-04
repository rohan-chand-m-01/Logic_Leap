export type AttendanceStatus = "present" | "absent" | "late";

export interface AttendanceEntry {
  date: string;
  status: AttendanceStatus;
  teacher: string;
  markedAt: string;
}

export interface SubjectAttendance {
  subjectId: string;
  name: string;
  present: number;
  total: number;
  entries: AttendanceEntry[];
}

export interface StudentTestRecord {
  testId: string;
  subject: string;
  title: string;
  score: number;
  total: number;
  percentile: number;
  dateTaken: string;
  timeLimitMin: number;
  deadline: string;
  questionCount: number;
  status: "available" | "completed";
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  pseudonym: string;
  content: string;
  upvotes: number;
  createdAt: string;
  isAnswered?: boolean;
  answerText?: string;
  isPinned?: boolean;
}

export const sampleAttendance: SubjectAttendance[] = [
  {
    subjectId: "sub_math",
    name: "Mathematics",
    present: 22,
    total: 28,
    entries: Array.from({ length: 28 }).map((_, i) => {
      const status: AttendanceStatus = i % 7 === 0 ? "absent" : i % 6 === 0 ? "late" : "present";
      return {
        date: new Date(2026, 0, i + 1).toISOString(),
        status,
        teacher: "Dr. Arjun",
        markedAt: new Date(2026, 0, i + 1, 9, 5).toISOString(),
      };
    }),
  },
  {
    subjectId: "sub_phy",
    name: "Physics",
    present: 18,
    total: 26,
    entries: Array.from({ length: 26 }).map((_, i) => ({
      date: new Date(2026, 1, i + 1).toISOString(),
      status: i % 5 === 0 ? "absent" : "present",
      teacher: "Prof. Mira",
      markedAt: new Date(2026, 1, i + 1, 10, 10).toISOString(),
    })),
  },
];

export const sampleTests: StudentTestRecord[] = [
  { testId: "t1", subject: "Mathematics", title: "Algebra Formative", score: 34, total: 50, percentile: 66, dateTaken: "2026-04-10", timeLimitMin: 45, deadline: "2026-04-09T18:00:00.000Z", questionCount: 20, status: "completed" },
  { testId: "t2", subject: "Mathematics", title: "Quadratics Drill", score: 42, total: 50, percentile: 81, dateTaken: "2026-04-21", timeLimitMin: 45, deadline: "2026-04-20T18:00:00.000Z", questionCount: 20, status: "completed" },
  { testId: "t3", subject: "Physics", title: "Kinematics Weekly", score: 0, total: 50, percentile: 0, dateTaken: "", timeLimitMin: 30, deadline: "2026-06-15T18:00:00.000Z", questionCount: 15, status: "available" },
];

export const sampleTestQuestions: Record<string, Array<{ id: string; question_text: string; question_type: "mcq" | "true_false" | "short_answer"; options?: string[]; correct_answer: string; explanation: string; topic_tag: string; difficulty: "easy" | "medium" | "hard" }>> = {
  t3: [
    { id: "q1", question_text: "Unit of acceleration is?", question_type: "mcq", options: ["m/s", "m/s^2", "N", "kg"], correct_answer: "m/s^2", explanation: "Acceleration is change in velocity per second.", topic_tag: "Units", difficulty: "easy" },
    { id: "q2", question_text: "Velocity can be negative.", question_type: "true_false", correct_answer: "true", explanation: "Direction can make velocity negative in a chosen axis.", topic_tag: "Vectors", difficulty: "easy" },
    { id: "q3", question_text: "Explain constant acceleration motion in 2 lines.", question_type: "short_answer", correct_answer: "Any equivalent concise explanation", explanation: "Look for uniform change in velocity over time.", topic_tag: "Motion", difficulty: "medium" },
  ],
};

export const sampleRooms = [
  { id: "room_math_a", name: "Mathematics - CS A" },
  { id: "room_phy_a", name: "Physics - CS A" },
];

export const sampleMessages: ChatMessage[] = [
  { id: "m1", roomId: "room_math_a", senderId: "u2", pseudonym: "Anonymous Tiger", content: "Can anyone explain completing square?", upvotes: 7, createdAt: new Date().toISOString(), isPinned: true },
  { id: "m2", roomId: "room_math_a", senderId: "u3", pseudonym: "Anonymous Dolphin", content: "Is discriminant always positive?", upvotes: 2, createdAt: new Date().toISOString(), isAnswered: true, answerText: "No, it can be negative as well." },
];
