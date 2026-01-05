interface BrevoConfig {
  apiKey?: string;
  senderEmail: string;
  senderName: string;
}

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: string;
  tags?: string[];
}

interface BrevoResponse {
  messageId?: string;
  success: boolean;
  error?: string;
}

class BrevoEmailService {
  private config: BrevoConfig;
  private mockMode: boolean;

  constructor() {
    this.config = {
      apiKey: process.env.BREVO_API_KEY,
      senderEmail: process.env.BREVO_SENDER_EMAIL || "noreply@didtron.com",
      senderName: process.env.BREVO_SENDER_NAME || "DIDTron Communications",
    };
    this.mockMode = !this.config.apiKey;

    if (this.mockMode) {
      console.log("[Brevo] Running in mock mode - no API key configured");
    } else {
      console.log("[Brevo] Email service initialized");
    }
  }

  async sendEmail(params: SendEmailParams): Promise<BrevoResponse> {
    if (this.mockMode) {
      console.log(`[Brevo Mock] Would send email to ${params.to}: ${params.subject}`);
      return {
        messageId: `mock-${Date.now()}`,
        success: true,
      };
    }

    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": this.config.apiKey!,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: this.config.senderName,
            email: this.config.senderEmail,
          },
          to: [
            {
              email: params.to,
              name: params.toName || params.to,
            },
          ],
          subject: params.subject,
          htmlContent: params.htmlContent,
          textContent: params.textContent,
          replyTo: params.replyTo ? { email: params.replyTo } : undefined,
          tags: params.tags,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[Brevo] Failed to send email:", error);
        return {
          success: false,
          error: error.message || "Failed to send email",
        };
      }

      const data = await response.json();
      console.log(`[Brevo] Email sent to ${params.to}: ${data.messageId}`);
      return {
        messageId: data.messageId,
        success: true,
      };
    } catch (error) {
      console.error("[Brevo] Error sending email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  parseTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      result = result.replace(regex, value);
    }
    return result;
  }

  async sendTemplatedEmail(
    templateHtml: string,
    templateSubject: string,
    to: string,
    toName: string | undefined,
    variables: Record<string, string>,
    tags?: string[]
  ): Promise<BrevoResponse> {
    const htmlContent = this.parseTemplate(templateHtml, variables);
    const subject = this.parseTemplate(templateSubject, variables);

    return this.sendEmail({
      to,
      toName,
      subject,
      htmlContent,
      tags,
    });
  }

  isConfigured(): boolean {
    return !this.mockMode;
  }
}

export const brevoService = new BrevoEmailService();

export const defaultEmailTemplates = [
  {
    name: "Welcome Email",
    slug: "welcome",
    subject: "Welcome to DIDTron, {{ firstName }}!",
    category: "onboarding",
    variables: ["firstName", "lastName", "email", "loginUrl"],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to DIDTron</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1e293b; margin-top: 0; }
    .button { display: inline-block; background: #2563EB; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .features { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .feature { padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .feature:last-child { border-bottom: none; }
    .feature strong { color: #2563EB; }
    .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
    .footer a { color: #60a5fa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to DIDTron!</h1>
      <p>Your AI-Powered VoIP Platform</p>
    </div>
    <div class="content">
      <h2>Hello {{ firstName }},</h2>
      <p>Thank you for joining DIDTron Communications! We're excited to have you on board.</p>
      <p>Your account has been created successfully. Here's what you can do next:</p>
      
      <div class="features">
        <div class="feature"><strong>Voice Termination</strong> - Premium routes at $0.012/min</div>
        <div class="feature"><strong>DIDs</strong> - Numbers from 100+ countries at $1.50/mo</div>
        <div class="feature"><strong>Cloud PBX</strong> - Full-featured PBX at $3/extension</div>
        <div class="feature"><strong>AI Voice Agents</strong> - Intelligent assistants at $0.10/min</div>
      </div>
      
      <p>Ready to get started? Log in to your portal now:</p>
      <p style="text-align: center;">
        <a href="{{ loginUrl }}" class="button">Access Your Portal</a>
      </p>
      
      <p>If you have any questions, our support team is here to help 24/7.</p>
      <p>Best regards,<br>The DIDTron Team</p>
    </div>
    <div class="footer">
      <p>DIDTron Communications</p>
      <p>This email was sent to {{ email }}</p>
      <p><a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    name: "Email Verification",
    slug: "email-verification",
    subject: "Verify your email address",
    category: "onboarding",
    variables: ["firstName", "verificationUrl", "expiresIn"],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #2563EB; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; text-align: center; }
    .button { display: inline-block; background: #2563EB; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .note { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; color: #92400e; }
    .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <h2>Hi {{ firstName }},</h2>
      <p>Please verify your email address to complete your registration.</p>
      <a href="{{ verificationUrl }}" class="button">Verify Email Address</a>
      <div class="note">
        This link will expire in {{ expiresIn }}. If you didn't create an account, you can safely ignore this email.
      </div>
    </div>
    <div class="footer">
      <p>DIDTron Communications</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    name: "Password Reset",
    slug: "password-reset",
    subject: "Reset your password",
    category: "security",
    variables: ["firstName", "resetUrl", "expiresIn"],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #dc2626; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: #2563EB; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .warning { background: #fef2f2; border: 1px solid #ef4444; border-radius: 6px; padding: 15px; margin: 20px 0; color: #991b1b; }
    .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <h2>Hi {{ firstName }},</h2>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <p style="text-align: center;">
        <a href="{{ resetUrl }}" class="button">Reset Password</a>
      </p>
      <div class="warning">
        This link expires in {{ expiresIn }}. If you didn't request a password reset, please ignore this email or contact support if you're concerned.
      </div>
    </div>
    <div class="footer">
      <p>DIDTron Communications</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    name: "Low Balance Alert",
    slug: "low-balance",
    subject: "Low Balance Alert - Action Required",
    category: "billing",
    variables: ["firstName", "currentBalance", "minimumBalance", "topUpUrl", "suggestedAmount"],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Low Balance Alert</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #f59e0b; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; }
    .balance-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .balance { font-size: 36px; font-weight: bold; color: #d97706; }
    .button { display: inline-block; background: #2563EB; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .suggestion { background: #f0fdf4; border: 1px solid #22c55e; border-radius: 6px; padding: 15px; margin: 20px 0; color: #166534; }
    .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Low Balance Alert</h1>
    </div>
    <div class="content">
      <h2>Hi {{ firstName }},</h2>
      <p>Your account balance is running low. To avoid service interruption, please add funds soon.</p>
      
      <div class="balance-box">
        <p style="margin: 0; color: #92400e;">Current Balance</p>
        <p class="balance">\${{ currentBalance }}</p>
        <p style="margin: 0; color: #92400e; font-size: 14px;">Minimum required: \${{ minimumBalance }}</p>
      </div>
      
      <div class="suggestion">
        <strong>AI Recommendation:</strong> Based on your usage patterns, we suggest topping up with <strong>\${{ suggestedAmount }}</strong> to cover approximately 2 weeks of usage.
      </div>
      
      <p style="text-align: center;">
        <a href="{{ topUpUrl }}" class="button">Add Funds Now</a>
      </p>
    </div>
    <div class="footer">
      <p>DIDTron Communications</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    name: "Invoice Ready",
    slug: "invoice-ready",
    subject: "Invoice #{{ invoiceNumber }} is ready",
    category: "billing",
    variables: ["firstName", "invoiceNumber", "amount", "dueDate", "invoiceUrl", "summary"],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice Ready</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #2563EB; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; }
    .invoice-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .invoice-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .invoice-row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; }
    .button { display: inline-block; background: #2563EB; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .summary { background: #eff6ff; border-radius: 6px; padding: 15px; margin: 20px 0; color: #1e40af; }
    .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Invoice #{{ invoiceNumber }}</h1>
    </div>
    <div class="content">
      <h2>Hi {{ firstName }},</h2>
      <p>Your invoice is ready for review.</p>
      
      <div class="invoice-box">
        <div class="invoice-row"><span>Invoice Number</span><span>#{{ invoiceNumber }}</span></div>
        <div class="invoice-row"><span>Due Date</span><span>{{ dueDate }}</span></div>
        <div class="invoice-row"><span>Total Amount</span><span>\${{ amount }}</span></div>
      </div>
      
      <div class="summary">
        <strong>AI Summary:</strong> {{ summary }}
      </div>
      
      <p style="text-align: center;">
        <a href="{{ invoiceUrl }}" class="button">View Invoice</a>
      </p>
    </div>
    <div class="footer">
      <p>DIDTron Communications</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    name: "Payment Received",
    slug: "payment-received",
    subject: "Payment Received - Thank You!",
    category: "billing",
    variables: ["firstName", "amount", "paymentMethod", "transactionId", "newBalance"],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Received</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #22c55e; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; text-align: center; }
    .amount { font-size: 48px; font-weight: bold; color: #22c55e; margin: 20px 0; }
    .details { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: left; }
    .detail-row { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .detail-row:last-child { border-bottom: none; }
    .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Received</h1>
    </div>
    <div class="content">
      <h2>Thank you, {{ firstName }}!</h2>
      <p>We've received your payment.</p>
      <p class="amount">\${{ amount }}</p>
      
      <div class="details">
        <div class="detail-row"><strong>Payment Method:</strong> {{ paymentMethod }}</div>
        <div class="detail-row"><strong>Transaction ID:</strong> {{ transactionId }}</div>
        <div class="detail-row"><strong>New Balance:</strong> \${{ newBalance }}</div>
      </div>
      
      <p>Your account has been credited and you're all set to continue using our services.</p>
    </div>
    <div class="footer">
      <p>DIDTron Communications</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    name: "KYC Approved",
    slug: "kyc-approved",
    subject: "KYC Verification Approved",
    category: "compliance",
    variables: ["firstName", "documentType", "approvedDate", "portalUrl"],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KYC Approved</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #22c55e; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; text-align: center; }
    .checkmark { font-size: 64px; color: #22c55e; }
    .button { display: inline-block; background: #2563EB; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KYC Approved</h1>
    </div>
    <div class="content">
      <div class="checkmark">&#10003;</div>
      <h2>Congratulations, {{ firstName }}!</h2>
      <p>Your KYC verification has been approved.</p>
      <p><strong>Document Type:</strong> {{ documentType }}<br>
      <strong>Approved Date:</strong> {{ approvedDate }}</p>
      <p>You now have full access to all DIDTron services including international DIDs.</p>
      <a href="{{ portalUrl }}" class="button">Go to Portal</a>
    </div>
    <div class="footer">
      <p>DIDTron Communications</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    name: "KYC Rejected",
    slug: "kyc-rejected",
    subject: "KYC Verification - Action Required",
    category: "compliance",
    variables: ["firstName", "documentType", "rejectionReason", "aiExplanation", "resubmitUrl"],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KYC Action Required</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #f59e0b; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; }
    .reason { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
    .ai-help { background: #eff6ff; border: 1px solid #3b82f6; border-radius: 6px; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; background: #2563EB; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KYC Verification Update</h1>
    </div>
    <div class="content">
      <h2>Hi {{ firstName }},</h2>
      <p>Unfortunately, we couldn't verify your {{ documentType }}. Please see the details below:</p>
      
      <div class="reason">
        <strong>Reason:</strong> {{ rejectionReason }}
      </div>
      
      <div class="ai-help">
        <strong>How to fix this:</strong> {{ aiExplanation }}
      </div>
      
      <p style="text-align: center;">
        <a href="{{ resubmitUrl }}" class="button">Resubmit Documents</a>
      </p>
    </div>
    <div class="footer">
      <p>DIDTron Communications</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    name: "Referral Reward",
    slug: "referral-reward",
    subject: "You earned a referral reward!",
    category: "rewards",
    variables: ["firstName", "referredName", "rewardAmount", "totalEarnings", "referralUrl"],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Referral Reward</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; text-align: center; }
    .reward { font-size: 48px; font-weight: bold; color: #8b5cf6; margin: 20px 0; }
    .stats { background: #f5f3ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: #8b5cf6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Referral Reward Earned!</h1>
    </div>
    <div class="content">
      <h2>Awesome, {{ firstName }}!</h2>
      <p>{{ referredName }} just signed up using your referral link!</p>
      <p class="reward">+\${{ rewardAmount }}</p>
      
      <div class="stats">
        <p style="margin: 0;"><strong>Total Referral Earnings:</strong> \${{ totalEarnings }}</p>
      </div>
      
      <p>Keep sharing and keep earning!</p>
      <a href="{{ referralUrl }}" class="button">Share Your Link</a>
    </div>
    <div class="footer">
      <p>DIDTron Communications</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    name: "Weekly Summary",
    slug: "weekly-summary",
    subject: "Your Weekly Summary - {{ weekRange }}",
    category: "reports",
    variables: ["firstName", "weekRange", "totalCalls", "totalMinutes", "totalSpend", "topDestination", "aiInsights", "portalUrl"],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Summary</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #2563EB; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.9); margin: 5px 0 0; }
    .content { padding: 40px 30px; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .stat-box { background: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: bold; color: #2563EB; }
    .stat-label { color: #64748b; font-size: 14px; }
    .insights { background: #eff6ff; border-left: 4px solid #2563EB; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; background: #2563EB; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Weekly Summary</h1>
      <p>{{ weekRange }}</p>
    </div>
    <div class="content">
      <h2>Hi {{ firstName }},</h2>
      <p>Here's your activity summary for the week:</p>
      
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">{{ totalCalls }}</div>
          <div class="stat-label">Total Calls</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ totalMinutes }}</div>
          <div class="stat-label">Minutes Used</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">\${{ totalSpend }}</div>
          <div class="stat-label">Total Spend</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ topDestination }}</div>
          <div class="stat-label">Top Destination</div>
        </div>
      </div>
      
      <div class="insights">
        <strong>AI Insights:</strong><br>
        {{ aiInsights }}
      </div>
      
      <p style="text-align: center;">
        <a href="{{ portalUrl }}" class="button">View Full Analytics</a>
      </p>
    </div>
    <div class="footer">
      <p>DIDTron Communications</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
];
