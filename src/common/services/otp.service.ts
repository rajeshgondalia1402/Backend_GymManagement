import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmail } from './email.service';
import logger from '../utils/logger.util';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_SENDS_PER_HOUR = 3;
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Generate a cryptographically secure random OTP
 */
export const generateOTP = (): string => {
  const digits = crypto.randomInt(0, Math.pow(10, OTP_LENGTH));
  return digits.toString().padStart(OTP_LENGTH, '0');
};

/**
 * Hash an OTP for secure storage
 */
export const hashOTP = async (otp: string): Promise<string> => {
  return bcrypt.hash(otp, BCRYPT_SALT_ROUNDS);
};

/**
 * Compare a plain OTP against a hashed OTP
 */
export const compareOTP = async (otp: string, hashedOtp: string): Promise<boolean> => {
  return bcrypt.compare(otp, hashedOtp);
};

/**
 * Calculate OTP expiry timestamp
 */
export const getOTPExpiry = (): Date => {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

/**
 * Check if OTP has expired
 */
export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > new Date(expiresAt);
};

/**
 * Check if max verification attempts exceeded
 */
export const isMaxAttemptsExceeded = (attempts: number): boolean => {
  return attempts >= MAX_VERIFY_ATTEMPTS;
};

/**
 * Check if too many OTPs sent within the hour
 */
export const isRateLimited = (lastAttemptAt: Date | null, attempts: number): boolean => {
  if (!lastAttemptAt) return false;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (new Date(lastAttemptAt) > oneHourAgo && attempts >= MAX_SENDS_PER_HOUR) {
    return true;
  }
  return false;
};

/**
 * Send OTP email to the user
 */
export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">Gym Desk Pro</h1>
        <p style="color: #6b7280; margin-top: 4px;">Trainer Application Verification</p>
      </div>
      <div style="background: #f9fafb; border-radius: 12px; padding: 32px; text-align: center;">
        <h2 style="color: #1f2937; margin-bottom: 8px;">Your Verification Code</h2>
        <p style="color: #6b7280; margin-bottom: 24px;">Use the code below to verify your email address</p>
        <div style="background: #ffffff; border: 2px dashed #10b981; border-radius: 8px; padding: 20px; display: inline-block;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
        </div>
        <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">
          This code expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.
        </p>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
        If you did not request this code, please ignore this email.
      </p>
    </div>
  `;

  try {
    const result = await sendEmail({
      to: email,
      subject: 'Verify Your Email - Trainer Application',
      html,
    });
    return result.success;
  } catch (error: any) {
    logger.error('Failed to send OTP email', { email, error: error.message });
    return false;
  }
};

/**
 * Send confirmation email after successful trainer application submission
 */
export const sendTrainerConfirmationEmail = async (data: {
  email: string;
  fullName: string;
  role: string;
  totalYearsExperience: number;
  mobile: string;
  specialization?: string;
}): Promise<boolean> => {
  const roleLabel = data.role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">Gym Desk Pro</h1>
        <p style="color: #6b7280; margin-top: 4px;">Trainer Application Received</p>
      </div>
      <div style="background: #f9fafb; border-radius: 12px; padding: 32px;">
        <h2 style="color: #1f2937;">Hello ${data.fullName},</h2>
        <p style="color: #4b5563;">Thank you for submitting your trainer application. We have received your details successfully.</p>
        
        <div style="background: #ffffff; border-radius: 8px; padding: 20px; margin-top: 20px;">
          <h3 style="color: #1f2937; margin-top: 0;">Application Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 160px;">Name:</td>
              <td style="padding: 8px 0; color: #1f2937;">${data.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Role:</td>
              <td style="padding: 8px 0; color: #1f2937;">${roleLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Experience:</td>
              <td style="padding: 8px 0; color: #1f2937;">${data.totalYearsExperience} years</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Contact:</td>
              <td style="padding: 8px 0; color: #1f2937;">${data.mobile}</td>
            </tr>
            ${data.specialization ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Specialization:</td>
              <td style="padding: 8px 0; color: #1f2937;">${data.specialization}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <p style="color: #6b7280; margin-top: 20px; font-size: 14px;">
          Our team will review your application and get back to you soon.
        </p>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
        &copy; ${new Date().getFullYear()} Gym Desk Pro. All rights reserved.
      </p>
    </div>
  `;

  try {
    const result = await sendEmail({
      to: data.email,
      subject: `Application Received - ${data.fullName}`,
      html,
    });
    return result.success;
  } catch (error: any) {
    logger.error('Failed to send confirmation email', { email: data.email, error: error.message });
    return false;
  }
};
