import nodemailer from "nodemailer";

import { env } from "@/config/env.js";

// Type definition for SMTP errors
interface SMTPError extends Error {
  code?: string;
  command?: string;
  responseCode?: number;
  response?: string;
}

export type EmailTemplate = {
  to: string;
  subject: string;
  html: string;
};

const hasCredentials = Boolean(env.EMAIL_USER && env.EMAIL_PASS);

const transporter = hasCredentials
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    })
  : null;

if (!hasCredentials) {
  console.warn("[email] EMAIL_USER/EMAIL_PASS not set — emails will be skipped.");
}

// Verify connection on startup (production only).
if (transporter && env.NODE_ENV === "production") {
  transporter.verify((error) => {
    if (error) {
      const smtpError = error as SMTPError;
      console.error("SMTP Connection Error:", {
        error: smtpError.message,
        code: smtpError.code,
        command: smtpError.command,
        user: env.EMAIL_USER,
        service: "gmail",
      });
    } else {
      console.log("SMTP Server is ready to send emails");
    }
  });
}

export async function sendEmail({
  to,
  subject,
  html,
}: EmailTemplate): Promise<{ success: boolean; messageId?: string; error?: SMTPError }> {
  if (!transporter) {
    return { success: false, error: new Error("Email is not configured") as SMTPError };
  }

  try {
    console.log("Email attempt:", {
      environment: env.NODE_ENV,
      to,
      subject,
      from: env.EMAIL_USER,
    });

    const info = await transporter.sendMail({
      from: {
        name: "Interview Genie",
        address: env.EMAIL_USER!,
      },
      to,
      subject,
      html,
      priority: "high",
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
    });

    console.log("Email sent successfully:", {
      messageId: info.messageId,
      response: info.response,
      to,
      subject,
      environment: env.NODE_ENV,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    const smtpError = error as SMTPError;
    console.error("Email sending failed:", {
      error: {
        message: smtpError.message,
        name: smtpError.name,
        code: smtpError.code,
        command: smtpError.command,
        response: smtpError.response,
        stack: smtpError.stack,
      },
      to,
      subject,
      environment: env.NODE_ENV,
      emailUser: env.EMAIL_USER,
    });

    return { success: false, error: smtpError };
  }
}
