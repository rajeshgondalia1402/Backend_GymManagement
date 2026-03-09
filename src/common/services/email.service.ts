import nodemailer from 'nodemailer';
import logger from '../utils/logger.util';

// SMTP Configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true'; // true for 465, false for other ports
const SMTP_USER = process.env.SMTP_USER || 'logikshubsolution@gmail.com';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'Gym Desk Pro';
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'logikshubsolution@gmail.com';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });
};

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  to: string;
}

export interface BulkEmailResult {
  totalSent: number;
  totalFailed: number;
  results: SendEmailResult[];
}

/**
 * Send a single email
 */
export const sendEmail = async (options: SendEmailOptions): Promise<SendEmailResult> => {
  const transporter = createTransporter();

  try {
    const mailOptions = {
      from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      ...(options.cc && { cc: options.cc }),
      ...(options.bcc && { bcc: options.bcc }),
      ...(options.replyTo && { replyTo: options.replyTo }),
      ...(options.attachments && { attachments: options.attachments }),
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent successfully to ${options.to}`, {
      messageId: info.messageId,
      subject: options.subject,
    });

    return {
      success: true,
      messageId: info.messageId,
      to: options.to,
    };
  } catch (error: any) {
    logger.error(`Failed to send email to ${options.to}`, {
      error: error.message,
      subject: options.subject,
    });

    return {
      success: false,
      error: error.message,
      to: options.to,
    };
  }
};

/**
 * Send bulk emails (multiple recipients with same or different content)
 */
export const sendBulkEmails = async (
  emails: SendEmailOptions[]
): Promise<BulkEmailResult> => {
  const results: SendEmailResult[] = [];
  let totalSent = 0;
  let totalFailed = 0;

  // Send emails sequentially to avoid rate limiting
  for (const email of emails) {
    const result = await sendEmail(email);
    results.push(result);

    if (result.success) {
      totalSent++;
    } else {
      totalFailed++;
    }

    // Small delay between emails to prevent SMTP rate limiting
    if (emails.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  logger.info(`Bulk email completed: ${totalSent} sent, ${totalFailed} failed out of ${emails.length} total`);

  return {
    totalSent,
    totalFailed,
    results,
  };
};

/**
 * Verify SMTP connection is working
 */
export const verifyEmailConnection = async (): Promise<boolean> => {
  const transporter = createTransporter();

  try {
    await transporter.verify();
    logger.info('SMTP connection verified successfully');
    return true;
  } catch (error: any) {
    logger.warn(`SMTP connection verification failed: ${error.message}`);
    return false;
  }
};
