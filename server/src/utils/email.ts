import nodemailer from "nodemailer";
import { ApiError } from "./ApiError";

export async function sendVerificationOtp(email: string, code: string) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  if (!user || !pass) throw new ApiError(500, "Email service is not configured");
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transporter.sendMail({ from: process.env.EMAIL_FROM || `Yaazh Clean360 <${user}>`, to: email, subject: "Verify your Yaazh Clean360 account", text: `Your verification code is ${code}. It expires in 10 minutes.`, html: `<p>Your Yaazh Clean360 verification code is:</p><h1 style="letter-spacing:6px">${code}</h1><p>This code expires in 10 minutes.</p>` });
}

export async function sendPasswordResetOtp(email: string, code: string) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  if (!user || !pass) throw new ApiError(500, "Email service is not configured");
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transporter.sendMail({ from: process.env.EMAIL_FROM || `Yaazh Clean360 <${user}>`, to: email, subject: "Reset your Yaazh Clean360 password", text: `Your password reset code is ${code}. It expires in 10 minutes.`, html: `<p>Your Yaazh Clean360 password reset code is:</p><h1 style="letter-spacing:6px">${code}</h1><p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>` });
}
