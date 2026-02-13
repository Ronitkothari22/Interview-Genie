export function generateWelcomeEmail(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Interview Genie</title>
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
            padding: 20px 0;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
            margin-bottom: 10px;
          }
          .content {
            padding: 20px 0;
          }
          .feature {
            margin: 15px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .feature h3 {
            color: #4f46e5;
            margin: 0 0 10px 0;
          }
          .cta-button {
            display: inline-block;
            padding: 12px 24px;
            background: #4f46e5;
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
            <div class="logo">Interview Genie 🧞‍♂️</div>
            <h1>Welcome, ${name}!</h1>
          </div>
          
          <div class="content">
            <p>Thank you for joining Interview Genie! We're excited to help you ace your next interview.</p>
            
            <div class="feature">
              <h3>🎯 AI-Powered Practice</h3>
              <p>Get personalized interview questions based on real job descriptions and receive instant feedback on your responses.</p>
            </div>
            
            <div class="feature">
              <h3>📊 Performance Analysis</h3>
              <p>Track your progress with detailed performance reports and targeted improvement suggestions.</p>
            </div>
            
            <div class="feature">
              <h3>🎥 Video Analysis</h3>
              <p>Perfect your presentation with our advanced video analysis for body language and confidence assessment.</p>
            </div>
            
            <div style="text-align: center;">
              <p>Ready to start practicing?</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/interview-preparation" class="cta-button">
                Start Your First Interview
              </a>
            </div>
            
            <p style="margin-top: 30px;">
              <strong>Your Free Trial Benefits:</strong>
              <ul>
                <li>100 credits to use across all features</li>
                <li>Access to all question types</li>
                <li>Detailed performance analytics</li>
                <li>Video analysis capabilities</li>
              </ul>
            </p>
          </div>
          
          <div class="footer">
            <p>Need help? Reply to this email or contact our support team.</p>
            <p>Interview Genie - Your AI Interview Coach</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
