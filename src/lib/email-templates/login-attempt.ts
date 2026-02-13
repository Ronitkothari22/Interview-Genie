export function generateLoginAttemptEmail(
  name: string,
  attempts: number,
  location: string,
  time: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Alert - Interview Genie</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px;
            background: #fee2e2;
            border-radius: 8px;
          }
          .alert-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .content {
            padding: 20px 0;
          }
          .details {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
          }
          .details-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .details-row:last-child {
            border-bottom: none;
          }
          .cta-button {
            display: inline-block;
            padding: 12px 24px;
            background: #dc2626;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px 0;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="alert-icon">⚠️</div>
            <h1>Security Alert</h1>
          </div>
          
          <div class="content">
            <p>Dear ${name},</p>
            
            <p>We detected multiple failed login attempts to your Interview Genie account. If this wasn't you, your account might be at risk.</p>
            
            <div class="details">
              <div class="details-row">
                <strong>Failed Attempts:</strong>
                <span>${attempts}</span>
              </div>
              <div class="details-row">
                <strong>Location:</strong>
                <span>${location}</span>
              </div>
              <div class="details-row">
                <strong>Time:</strong>
                <span>${time}</span>
              </div>
            </div>
            
            <p><strong>What should you do?</strong></p>
            <ul>
              <li>Change your password immediately if you don't recognize this activity</li>
              <li>Enable two-factor authentication if you haven't already</li>
              <li>Contact our support team if you need assistance</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password" class="cta-button">
                Reset Your Password
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>If you recognize this activity, you can safely ignore this email.</p>
            <p>Interview Genie Security Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
