import { z } from "zod";

export const timetableConfigSchema = z.object({
  academic_year: z.string().min(4),
  working_days: z.array(z.number()).min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  period_duration_minutes: z.union([z.literal(45), z.literal(60), z.literal(75), z.literal(90)]),
});

export const profileSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((v) => v.password === v.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
