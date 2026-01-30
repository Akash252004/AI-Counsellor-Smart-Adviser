"""
Email notification service for sending confirmation emails
"""
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime


class EmailService:
    """
    Simple email service using SMTP
    For production, use services like SendGrid, AWS SES, or similar
    """
    
    def __init__(self):
        # For now, this is a placeholder
        # In production, configure with actual SMTP settings
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = "noreply@aicounsellor.com"  # Configure in production
        self.sender_password = ""  # Configure from environment variable
        
    def send_shortlist_confirmation(
        self,
        recipient_email: str,
        recipient_name: str,
        university_name: str,
        university_country: str
    ) -> bool:
        """
        Send congratulations email when user gets shortlisted
        """
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = f"🎉 Congratulations! Shortlisted for {university_name}"
            message["From"] = self.sender_email
            message["To"] = recipient_email
            
            # HTML email body
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: 'Inter', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .header {{
                        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                        color: white;
                        padding: 40px 20px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }}
                    .content {{
                        background: #ffffff;
                        padding: 30px;
                        border: 1px solid #e5e7eb;
                    }}
                    .cta-button {{
                        display: inline-block;
                        padding: 14px 28px;
                        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        margin: 20px 0;
                    }}
                    .footer {{
                        text-align: center;
                        padding: 20px;
                        color: #6b7280;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🤖 AI Counsellor</h1>
                        <h2>Congratulations, {recipient_name}!</h2>
                    </div>
                    <div class="content">
                        <p>Great news! Your application to <strong>{university_name}</strong> in {university_country} has been successfully locked.</p>
                        
                        <p>This means you have officially shortlisted this university for your application. Here's what happens next:</p>
                        
                        <ul>
                            <li>✓ Your application status is now marked as "Applied"</li>
                            <li>✓ This university is locked in your shortlist</li>
                            <li>✓ You can track your application progress on the dashboard</li>
                        </ul>
                        
                        <p><strong>Next Steps:</strong></p>
                        <ol>
                            <li>Complete your profile if you haven't already</li>
                            <li>Prepare required documents (SOP, LOR, transcripts)</li>
                            <li>Watch for application deadlines</li>
                            <li>Check your Tasks page for reminders</li>
                        </ol>
                        
                        <div style="text-align: center;">
                            <a href="http://localhost:3000/dashboard" class="cta-button">
                                View Dashboard →
                            </a>
                        </div>
                        
                        <p>Best of luck with your application! Our AI is here to help you every step of the way.</p>
                    </div>
                    <div class="footer">
                        <p>This email was sent by AI Counsellor - Your study abroad companion</p>
                        <p>© 2026 AI Counsellor. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text fallback
            text = f"""
            Congratulations, {recipient_name}!
            
            Your application to {university_name} in {university_country} has been successfully locked.
            
            This means you have officially shortlisted this university for your application.
            
            Next Steps:
            1. Complete your profile if you haven't already
            2. Prepare required documents (SOP, LOR, transcripts)
            3. Watch for application deadlines
            4. Check your Tasks page for reminders
            
            Visit your dashboard: http://localhost:3000/dashboard
            
            Best of luck!
            AI Counsellor Team
            """
            
            # Attach parts
            part1 = MIMEText(text, "plain")
            part2 = MIMEText(html, "html")
            message.attach(part1)
            message.attach(part2)
            
            # For development: just log the email instead of sending
            print(f"\n{'='*60}")
            print(f"📧 EMAIL NOTIFICATION (Development Mode)")
            print(f"{'='*60}")
            print(f"To: {recipient_email}")
            print(f"Subject: {message['Subject']}")
            print(f"\n{text}")
            print(f"{'='*60}\n")
            
            # In production, uncomment this to actually send:
            # with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            #     server.starttls()
            #     server.login(self.sender_email, self.sender_password)
            #     server.sendmail(self.sender_email, recipient_email, message.as_string())
            
            return True
            
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False


# Global instance
email_service = EmailService()
