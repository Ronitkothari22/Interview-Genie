export function generatePasswordResetEmail(userName: string, resetLink: string): string {
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
