import { SMTPClient } from 'emailjs';

// const client = new SMTPClient({
//   user: process.env.EMAIL_USER, // process.env.EMAIL_USER,
//   password: process.env.EMAIL_PASS, // process.env.EMAIL_PASS,
//   host: process.env.HOST,
//   port: 587,
//   tls: true,
// });

const client = new SMTPClient({
  user: 'no-reply@credobyte.com', // process.env.EMAIL_USER,
  password: 'X@922539828402ol', // process.env.EMAIL_PASS,
  host: 'smtp.office365.com',
  port: 587,
  tls: true,
});

// Email template utility function
export const createCredoByteEmailTemplate = (options: {
  subject: string;
  title: string;
  content: string;
  button?: {
    text: string;
    url: string;
  };
  footerNote?: string;
  previewText?: string;
}) => {
  const { subject, title, content, button, footerNote, previewText } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
        }
        
        .preview-text {
            display: none;
            font-size: 0;
            line-height: 0;
            color: transparent;
            max-height: 0;
            overflow: hidden;
        }
        
        .email-container {
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            margin: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 32px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 8px;
        }
        
        .logo-subtitle {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .content {
            padding: 48px 32px;
        }
        
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 24px;
            text-align: center;
        }
        
        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 32px;
            line-height: 1.7;
        }
        
        .message p {
            margin-bottom: 16px;
        }
        
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3);
            border: none;
            cursor: pointer;
        }
        
        .info-box {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        
        .info-box.alert {
            background: #fef3cd;
            border: 1px solid #fde68a;
        }
        
        .info-box.warning {
            background: #fef3cd;
            border: 1px solid #fde68a;
        }
        
        .info-box.success {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
        }
        
        .info-title {
            color: #0369a1;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .info-text {
            color: #0c4a6e;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .footer {
            background: #f8fafc;
            padding: 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .footer-note {
            color: #9ca3af;
            font-size: 13px;
            margin-top: 16px;
            line-height: 1.5;
        }
        
        .contact-info {
            color: #9ca3af;
            font-size: 13px;
            margin-top: 16px;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 8px;
            color: #6b7280;
            text-decoration: none;
            font-size: 13px;
        }
        
        .unsubscribe {
            color: #9ca3af;
            font-size: 12px;
            margin-top: 20px;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
            }
            
            .content {
                padding: 32px 24px;
            }
            
            .header {
                padding: 32px 24px;
            }
            
            .title {
                font-size: 20px;
            }
            
            .button {
                padding: 14px 28px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Preview Text (hidden) -->
        <div class="preview-text">${previewText || title}</div>
        
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <div class="logo">CredoByte</div>
                <div class="logo-subtitle">Intelligent Business Solutions</div>
            </div>
            
            <!-- Content -->
            <div class="content">
                <h1 class="title">${title}</h1>
                
                <div class="message">
                    ${content.replace(/\n/g, '<br>')}
                </div>
                
                ${
                  button
                    ? `
                <div class="button-container">
                    <a href="${button.url}" class="button" target="_blank">
                        ${button.text}
                    </a>
                </div>
                `
                    : ''
                }
                
                ${
                  footerNote
                    ? `
                <div class="info-box">
                    <div class="info-text">${footerNote}</div>
                </div>
                `
                    : ''
                }
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p class="footer-text">&copy; ${new Date().getFullYear()} CredoByte. All rights reserved.</p>
                <p class="contact-info">
                    CredoByte Inc.<br>
                    123 Business District, City 10001<br>
                    contact@credobyte.com
                </p>
                
                <div class="social-links">
                    <a href="#" class="social-link">Website</a>
                    <a href="#" class="social-link">Twitter</a>
                    <a href="#" class="social-link">LinkedIn</a>
                </div>
                
                <p class="unsubscribe">
                    <a href="{{unsubscribe_url}}" style="color: #9ca3af;">Unsubscribe</a> from these emails
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;
};

// Enhanced sendEmail function with HTML support
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  try {
    const messageConfig: any = {
      text,
      from: process.env.EMAIL_USER!,
      to,
      subject,
    };

    // Add HTML if provided
    if (html) {
      messageConfig.attachment = [{ data: html, alternative: true }];
    }

    const message = await client.sendAsync(messageConfig);
    console.log('Email sent:', message.header);
    return message;
  } catch (err) {
    console.error('Failed to send email:', err);
    throw new Error('Email sending failed');
  }
}

// Specialized email functions using the HTML template

/**
 * Send email verification code with HTML template
 */
export async function sendVerificationEmail(to: string, code: string) {
  const html = createCredoByteEmailTemplate({
    subject: 'Verify Your Email - CredoByte',
    title: 'Verify Your Email Address',
    content: `
      Thank you for choosing CredoByte. To complete your email verification, 
      please use the verification code below:
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="
          font-size: 42px;
          font-weight: 700;
          letter-spacing: 8px;
          color: #1e293b;
          font-family: 'Courier New', monospace;
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          display: inline-block;
          border: 2px dashed #e2e8f0;
        ">${code}</div>
      </div>
      
      This verification code will expire in 30 minutes for security reasons.
      
      If you didn't request this verification, please ignore this email.
    `,
    footerNote: 'For security reasons, this code will expire in 30 minutes.',
    previewText: `Your verification code is ${code}`,
  });

  return sendEmail({
    to,
    subject: 'Verify Your Email - CredoByte',
    text: `Your verification code is ${code}. It expires in 30 minutes.`,
    html,
  });
}

/**
 * Send welcome email with HTML template
 */
export async function sendWelcomeEmail(to: string, name: string) {
  const html = createCredoByteEmailTemplate({
    subject: 'Welcome to CredoByte!',
    title: `Welcome to CredoByte, ${name}!`,
    content: `
      We're excited to have you on board. CredoByte provides intelligent business 
      solutions to help you streamline your operations and make data-driven decisions.
      
      Get started by exploring your dashboard and setting up your preferences.
      
      If you have any questions, our support team is here to help you succeed.
    `,
    button: {
      text: 'Go to Dashboard',
      url: 'https://app.credobyte.com/dashboard',
    },
    footerNote: 'Need help? Contact our support team at support@credobyte.com',
  });

  return sendEmail({
    to,
    subject: 'Welcome to CredoByte!',
    text: `Welcome to CredoByte, ${name}! We're excited to have you on board.`,
    html,
  });
}

/**
 * Send notification alert with HTML template
 */
export async function sendNotificationAlert(
  to: string,
  notification: {
    title: string;
    message: string;
    details?: string;
    type?: 'info' | 'warning' | 'alert' | 'success';
    actionUrl?: string;
  }
) {
  const infoBoxClass = notification.type || 'alert';

  const html = createCredoByteEmailTemplate({
    subject: notification.title,
    title: notification.title,
    content: `
      ${notification.message}
      
      ${
        notification.details
          ? `
      <div class="info-box ${infoBoxClass}">
        <div class="info-text"><strong>Details:</strong> ${notification.details}</div>
      </div>
      `
          : ''
      }
      
      Please review this notification and take appropriate action if needed.
    `,
    button: notification.actionUrl
      ? {
          text: 'View Details',
          url: notification.actionUrl,
        }
      : undefined,
    footerNote: 'This is an automated notification from CredoByte.',
  });

  return sendEmail({
    to,
    subject: notification.title,
    text: `${notification.title}\n\n${notification.message}${notification.details ? `\n\nDetails: ${notification.details}` : ''}`,
    html,
  });
}

/**
 * Send password reset email with HTML template
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const html = createCredoByteEmailTemplate({
    subject: 'Reset Your Password - CredoByte',
    title: 'Password Reset Request',
    content: `
      We received a request to reset your password for your CredoByte account.
      
      Click the button below to create a new password. This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email and your 
      password will remain unchanged.
    `,
    button: {
      text: 'Reset Password',
      url: resetUrl,
    },
    footerNote: 'For security reasons, this link will expire in 1 hour.',
    previewText: 'Reset your CredoByte password',
  });

  return sendEmail({
    to,
    subject: 'Reset Your Password - CredoByte',
    text: `We received a request to reset your password. Use this link to reset: ${resetUrl}`,
    html,
  });
}

/**
 * Generic email sender with HTML template
 */
export async function sendCredoByteEmail(options: {
  to: string;
  subject: string;
  title: string;
  content: string;
  button?: {
    text: string;
    url: string;
  };
  footerNote?: string;
  previewText?: string;
}) {
  const html = createCredoByteEmailTemplate(options);

  return sendEmail({
    to: options.to,
    subject: options.subject,
    text: options.content.replace(/<[^>]*>/g, ''), // Basic HTML to text conversion
    html,
  });
}

export const sendUserInviteMail = (
  to: string,
  { userName, orgName, btnUrl }: { userName: string; orgName: string; btnUrl: string }
) => {
  const html = createCredoByteEmailTemplate({
    subject: `You’re Invited to Join ${orgName} on CredoByte!`,
    title: `Welcome to CredoByte, ${userName}!`,
    content: `
      ${orgName} has invited you to join their workspace on CredoByte.
      CredoByte is an AI agent platform for ecommerce and service-based businesses. Our agents handle sales chats, reviews, FAQs, and more, helping teams work faster and smarter.
      To get started, accept the invitation, then use the **Forgot Password** option to reset your password and log in. From there, you can access the dashboard and set up your preferences.
      If you need help, our support team is always available.
      We’re glad to have you on board.
    `,
    button: {
      text: 'Go to Dashboard',
      url: btnUrl,
    },
    footerNote: 'Need help? Contact our support team at support@credobyte.com',
  });

  return sendEmail({
    to,
    subject: `You’re Invited to Join ${orgName} on CredoByte!`,
    text: `Welcome to CredoByte, ${userName}! We're excited to have you on board.`,
    html,
  });
};

// Export the client for advanced usage
export { client };
