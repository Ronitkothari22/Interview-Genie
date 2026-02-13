import nodemailer from "nodemailer";
import { env } from "@/env";

// Type definition for SMTP errors
interface SMTPError extends Error {
  code?: string;
  command?: string;
  responseCode?: number;
  response?: string;
}

// Create transporter with verification
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

// Verify connection on startup
if (process.env.NODE_ENV === "production") {
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

export type EmailTemplate = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailTemplate) {
  try {
    // Log environment and attempt
    console.log("Email attempt:", {
      environment: process.env.NODE_ENV,
      to,
      subject,
      from: env.EMAIL_USER,
    });

    const info = await transporter.sendMail({
      from: {
        name: "Interview Genie",
        address: env.EMAIL_USER,
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
      environment: process.env.NODE_ENV,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Enhanced error logging for production debugging
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
      environment: process.env.NODE_ENV,
      emailUser: env.EMAIL_USER,
    });

    return { success: false, error: smtpError };
  }
}

export function generatePasswordResetEmail(
  userName: string,
  resetLink: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Hello ${userName},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #7c3aed; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>This link will expire in 5 minutes for security reasons.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>Interview Genie Team</p>
    </div>
  `;
}
