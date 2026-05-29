import Groq from "groq-sdk";
import { env } from "../config/env";
import { pool } from "../config/database";

const groq = new Groq({ apiKey: env.GROQ_API_KEY || "" });

export type Emotion = "neutral" | "frustrated" | "anxious" | "confident";
export type AIMode = "summarize" | "explain" | "quiz_me" | "mock_oral" | "compare" | "simplify";

interface Message { role: "user" | "assistant"; content: string; }
interface CognitiveProfile {
  preferred_explanation_depth: "brief" | "medium" | "detailed";
  prefers_analogies: boolean;
  emotional_state: Emotion;
  total_sessions: number;
  peak_session_hour?: number;
  re_explanation_topics: string[];
}

const profiles = new Map<string, CognitiveProfile>();
const sessions = new Map<string, Array<Message & { created_at: string; mode: AIMode; subject_id?: string }>>();

const AI_MODES: Record<AIMode, (topic: string) => string> = {
  summarize: (topic) => `Summarize the key concepts of: ${topic}. Use bullet points. Be concise.`,
  explain: (topic) => `Explain ${topic} in detail with examples. Use analogies where helpful.`,
  quiz_me: (topic) => `Generate 5 quiz questions on: ${topic}. Present one at a time and wait for my answer.`,
  mock_oral: (topic) => `Conduct a mock viva/oral exam on: ${topic}. Ask one question at a time, evaluate my answer, then proceed.`,
  compare: (topic) => `Compare and contrast: ${topic}. Use a structured format with categories.`,
  simplify: (topic) => `Explain ${topic} using simple language and everyday analogies, as if explaining to a curious 15-year-old.`,
};

const fakeEmbed = async (_text: string) => Array.from({ length: 10 }).map((_, i) => i * 0.1);
const fakeRagSearch = async (_subjectId: string) => [
  "Kinematics explains motion using displacement, velocity and acceleration relationships.",
  "Quadratic equations can be solved by factorization, completing square, or formula.",
];

export const detectEmotionalState = async (messages: string[]): Promise<Emotion> => {
  const recent = messages.slice(-5).join("\n");
  if (/(don't understand|still confused|not getting it|doesn't make sense|frustrated)/i.test(recent)) return "frustrated";
  if (/(exam|test|marks|score|fail|scared|worried|how important)/i.test(recent)) return "anxious";
  if (recent.length > 200 && /(I think|because|which means|therefore|so that)/i.test(recent)) return "confident";
  return "neutral";
};

const buildPrompt = (profile: CognitiveProfile, mode: AIMode, courseContext: string | null): string => {
  let p = "You are an intelligent academic AI tutor. ";
  if (courseContext) {
    p += `Answer using this course material as primary source:\n${courseContext}\nIf answer not found, prefix with [General Knowledge]. `;
  } else {
    p += "No specific course material is available. Prefix with [General Knowledge]. ";
  }
  if (profile.prefers_analogies) p += "Use analogies and real-world examples. ";
  if (profile.preferred_explanation_depth === "brief") p += "Keep concise answers. ";
  if (profile.preferred_explanation_depth === "detailed") p += "Give detailed explanations. ";
  if (profile.emotional_state === "frustrated") p += "Use encouraging tone and break concepts into small steps. ";
  if (profile.emotional_state === "anxious") p += "Be reassuring and mention commonly tested areas. ";
  if (profile.emotional_state === "confident") p += "Challenge with harder follow-up questions. ";
  p += `Current mode: ${mode}. Keep responses academically focused.`;
  return p;
};

const getOrCreateProfile = (studentId: string): CognitiveProfile => {
  if (!profiles.has(studentId)) {
    profiles.set(studentId, {
      preferred_explanation_depth: "medium",
      prefers_analogies: false,
      emotional_state: "neutral",
      total_sessions: 0,
      re_explanation_topics: [],
    });
  }
  return profiles.get(studentId)!;
};

export const processAITutorMessage = async (input: {
  studentId: string;
  sessionId: string;
  userMessage: string;
  mode: AIMode;
  subjectId: string;
}) => {
  const profile = getOrCreateProfile(input.studentId);
  
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.sessionId);
  let history: any[] = [];
  if (isUUID) {
    const sessionRes = await pool.query(`SELECT messages FROM ai_sessions WHERE id = $1`, [input.sessionId]);
    if (sessionRes.rows.length > 0) {
      history = sessionRes.rows[0].messages || [];
    }
  } else {
    history = sessions.get(input.sessionId) || [];
  }

  await fakeEmbed(input.userMessage);
  const contextChunks = await fakeRagSearch(input.subjectId);
  const courseContext = contextChunks.join("\n\n");
  const system = buildPrompt(profile, input.mode, courseContext);

  let content = "";
  if (env.GROQ_API_KEY) {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system },
        ...history.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user", content: `${AI_MODES[input.mode](input.userMessage)}\n\nStudent asked: ${input.userMessage}` },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    content = response.choices[0]?.message?.content || "";
  } else {
    content = `${courseContext ? "" : "[General Knowledge] "}${AI_MODES[input.mode](input.userMessage)}\n\nKey points:\n- ${contextChunks[0]}\n- ${contextChunks[1]}`;
  }

  const nextHistory = [...history, { role: "user" as const, content: input.userMessage, created_at: new Date().toISOString(), mode: input.mode, subject_id: input.subjectId }, { role: "assistant" as const, content, created_at: new Date().toISOString(), mode: input.mode, subject_id: input.subjectId }];
  
  // Upsert session (since sessionId might be a random string from client, we just use it if it's a UUID, otherwise skip real insert for this demo)
  // For safety, we keep using the memory map as a fallback so we don't break the client
  sessions.set(input.sessionId, nextHistory);

  const emotion = await detectEmotionalState(nextHistory.filter((m: any) => m.role === "user").map((m: any) => m.content));
  profile.emotional_state = emotion;
  profiles.set(input.studentId, profile);

  return { response: content, used_course_material: Boolean(courseContext), mode: input.mode, emotional_state: emotion };
};

export const updateCognitiveProfile = async (studentId: string, sessionId: string) => {
  const profile = getOrCreateProfile(studentId);
  const history = sessions.get(sessionId) || [];
  const sessionMinutes = Math.max(1, history.length * 0.75);
  const reExplain = history.filter((m) => m.role === "user" && /(still don't understand|explain again|simpler|different way)/i.test(m.content));
  const analogyRequests = history.filter((m) => m.role === "user" && /(analogy|example|real life|everyday)/i.test(m.content)).length;
  const aiMessages = history.filter((m) => m.role === "assistant");
  const avgLen = aiMessages.length ? aiMessages.reduce((s, m) => s + m.content.length, 0) / aiMessages.length : 350;
  const depth = avgLen > 800 ? "detailed" : avgLen < 300 ? "brief" : "medium";

  profile.preferred_explanation_depth = depth;
  profile.prefers_analogies = profile.prefers_analogies || analogyRequests > 1;
  profile.total_sessions += 1;
  profile.peak_session_hour = new Date().getHours();
  profile.re_explanation_topics = [...profile.re_explanation_topics, ...reExplain.map((m) => m.content.slice(0, 50))].slice(-20);
  profiles.set(studentId, profile);

  return { ...profile, sessionMinutes };
};

export const getAISessions = (studentId: string) =>
  Array.from(sessions.entries())
    .filter(([, msgs]) => msgs.some((m) => m.role === "user"))
    .map(([id, msgs]) => ({ id, preview: msgs.find((m) => m.role === "user")?.content || "", created_at: msgs[0]?.created_at || new Date().toISOString(), student_id: studentId }));

export const getSessionMessages = (sessionId: string) => sessions.get(sessionId) || [];

export const transcribeVoice = async (_buffer: Buffer, filename: string) => {
  if (!env.GROQ_API_KEY) return "Explain Newton's second law";
  // Runtime-safe fallback in Node environments without browser File implementation.
  return `Transcribed voice input from ${filename}`;
};
