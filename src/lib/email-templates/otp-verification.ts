export function generateOTPEmail(userName: string, otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email - Interview Genie</title>
      <style>
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .header {
          text-align: center;
          padding: 20px;
          background: linear-gradient(to right, #7c3aed, #6d28d9);
          color: white;
          border-radius: 10px 10px 0 0;
        }
        .content {
          padding: 30px;
          background: white;
          border-radius: 0 0 10px 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .otp-container {
          margin: 30px 0;
          text-align: center;
        }
        .otp {
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #7c3aed;
          padding: 15px 25px;
          background: #f5f3ff;
          border-radius: 10px;
          display: inline-block;
        }
        .expiry {
          margin-top: 20px;
          color: #6b7280;
          font-size: 14px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Welcome to Interview Genie! Please use the following OTP to verify your email address:</p>
          
          <div class="otp-container">
            <div class="otp">${otp}</div>
          </div>
          
          <p class="expiry">This OTP will expire in 5 minutes.</p>
          
          <p>If you didn't request this verification, please ignore this email.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Interview Genie. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
