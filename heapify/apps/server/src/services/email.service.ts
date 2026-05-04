import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: false,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export const sendRegistrationEmail = async (to: string, link: string) => {
  if (!env.SMTP_USER) return;
  await transporter.sendMail({
    from: env.SMTP_USER,
    to,
    subject: "Complete your Heapify registration",
    html: `<p>Click <a href="${link}">here</a> to complete registration.</p>`,
  });
};
