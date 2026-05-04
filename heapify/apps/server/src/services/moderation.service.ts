import Groq from "groq-sdk";
import { env } from "../config/env";

const groq = new Groq({ apiKey: env.GROQ_API_KEY || "" });

export const moderateMessage = async (content: string, subjectName: string): Promise<{ allowed: boolean; reason?: string }> => {
  if (!env.GROQ_API_KEY) {
    const blocked = /(abuse|hate|idiot|stupid)/i.test(content);
    return blocked ? { allowed: false, reason: "Potentially abusive language" } : { allowed: true };
  }

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: `You are an academic chat moderator for a ${subjectName} class. Evaluate this student message: "${content}" Reply with JSON only: {"allowed": true/false, "reason": "if blocked, brief reason"}` }],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content || "{\"allowed\":true}";
  return JSON.parse(raw) as { allowed: boolean; reason?: string };
};
