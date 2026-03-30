import { prisma } from '../../../config/database';
import {
  generateOTP,
  hashOTP,
  compareOTP,
  getOTPExpiry,
  isOTPExpired,
  isMaxAttemptsExceeded,
  isRateLimited,
} from '../../../common/services/otp.service';
import { sendEmail } from '../../../common/services/email.service';
import logger from '../../../common/utils/logger.util';
import type {
  GymOwnerLeadSendOtpInput,
  GymOwnerLeadVerifyOtpInput,
  GymOwnerLeadRegisterInput,
  GymOwnerLeadCheckMobileInput,
} from './gym-owner-lead.types';

// ============================================================
// OTP & Verification
// ============================================================

export const sendOtp = async (input: GymOwnerLeadSendOtpInput) => {
  const { email } = input;

  // Check if already verified
  const existing = await prisma.gymOwnerLeadVerification.findUnique({
    where: { email },
  });

  if (existing?.isVerified) {
    // Check if already registered
    const lead = await prisma.gymOwnerLead.findUnique({ where: { email } });
    if (lead) {
      return { isAlreadyVerified: true, isRegistered: true, message: 'Already verified and registered' };
    }
    return { isAlreadyVerified: true, isRegistered: false, message: 'Email is already verified' };
  }

  // Rate limiting
  if (existing && isRateLimited(existing.lastAttemptAt, existing.attempts)) {
    throw new Error('Too many OTP requests. Please try again later.');
  }

  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);
  const expiresAt = getOTPExpiry();

  // Upsert verification record
  await prisma.gymOwnerLeadVerification.upsert({
    where: { email },
    update: {
      otpCode: hashedOtp,
      otpExpiresAt: expiresAt,
      attempts: existing ? existing.attempts + 1 : 1,
      lastAttemptAt: new Date(),
      isVerified: false,
      verifiedAt: null,
    },
    create: {
      email,
      otpCode: hashedOtp,
      otpExpiresAt: expiresAt,
      attempts: 1,
      lastAttemptAt: new Date(),
    },
  });

  // Send OTP email (non-blocking)
  sendGymOwnerLeadOTPEmail(email, otp).catch((err) =>
    logger.error('Failed to send gym-owner-lead OTP email', { error: err.message }),
  );

  return { isAlreadyVerified: false, isRegistered: false, message: 'OTP sent to your email' };
};

export const verifyOtp = async (input: GymOwnerLeadVerifyOtpInput) => {
  const { email, otpCode } = input;

  const verification = await prisma.gymOwnerLeadVerification.findUnique({
    where: { email },
  });

  if (!verification) {
    throw new Error('No OTP found. Please request a new one.');
  }

  if (verification.isVerified) {
    return { verified: true, message: 'Email already verified' };
  }

  if (isMaxAttemptsExceeded(verification.attempts)) {
    throw new Error('Too many failed attempts. Please request a new OTP.');
  }

  if (isOTPExpired(verification.otpExpiresAt)) {
    throw new Error('OTP has expired. Please request a new one.');
  }

  const isValid = await compareOTP(otpCode, verification.otpCode);

  // Increment attempt count regardless of success
  await prisma.gymOwnerLeadVerification.update({
    where: { email },
    data: {
      attempts: verification.attempts + 1,
      lastAttemptAt: new Date(),
      ...(isValid
        ? { isVerified: true, verifiedAt: new Date() }
        : {}),
    },
  });

  if (!isValid) {
    throw new Error('Invalid OTP. Please try again.');
  }

  // Check if already registered
  const lead = await prisma.gymOwnerLead.findUnique({ where: { email } });

  return {
    verified: true,
    isRegistered: !!lead,
    lead: lead || null,
    message: 'Email verified successfully',
  };
};

// ============================================================
// Check Mobile — passwordless login by mobile number
// ============================================================

export const checkMobile = async (input: GymOwnerLeadCheckMobileInput) => {
  const { mobile } = input;

  // 1. Check gym owner leads
  const lead = await prisma.gymOwnerLead.findFirst({
    where: { mobile },
  });

  if (lead) {
    const verification = await prisma.gymOwnerLeadVerification.findUnique({
      where: { email: lead.email },
    });

    if (verification?.isVerified) {
      return { exists: true, isVerified: true, userType: 'gym_owner' as const, lead, trainer: null };
    }
    return { exists: true, isVerified: false, userType: null, lead: null, trainer: null };
  }

  // 2. Check submitted trainers
  const trainer = await prisma.hireTrainer.findFirst({
    where: { mobile, isSubmitted: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      mobile: true,
      fullName: true,
      city: true,
      state: true,
      role: true,
    },
  });

  if (trainer) {
    const trainerVerification = await prisma.hireTrainerVerification.findUnique({
      where: { email: trainer.email },
    });

    if (trainerVerification?.isVerified) {
      return { exists: true, isVerified: true, userType: 'trainer' as const, lead: null, trainer };
    }
    return { exists: true, isVerified: false, userType: null, lead: null, trainer: null };
  }

  return { exists: false, isVerified: false, userType: null, lead: null, trainer: null };
};

// ============================================================
// Registration (with OTP email for verification)
// ============================================================

export const register = async (input: GymOwnerLeadRegisterInput) => {
  const { email, name, gymName, mobile, gender } = input;

  // Check if email already registered
  const existingByEmail = await prisma.gymOwnerLead.findUnique({ where: { email } });
  if (existingByEmail) {
    throw new Error('This email is already registered.');
  }

  // Check if mobile already registered
  const existingByMobile = await prisma.gymOwnerLead.findFirst({ where: { mobile } });
  if (existingByMobile) {
    throw new Error('This mobile number is already registered.');
  }

  // Generate OTP and create verification record
  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);
  const expiresAt = getOTPExpiry();

  await prisma.gymOwnerLeadVerification.upsert({
    where: { email },
    update: {
      otpCode: hashedOtp,
      otpExpiresAt: expiresAt,
      attempts: 1,
      lastAttemptAt: new Date(),
      isVerified: false,
      verifiedAt: null,
    },
    create: {
      email,
      otpCode: hashedOtp,
      otpExpiresAt: expiresAt,
      attempts: 1,
      lastAttemptAt: new Date(),
    },
  });

  // Create the lead (unverified until OTP is confirmed)
  const lead = await prisma.gymOwnerLead.create({
    data: { email, name, gymName, mobile, gender },
  });

  // Send OTP email (non-blocking)
  sendGymOwnerRegistrationOTPEmail({ email, name, gymName, otp }).catch((err) =>
    logger.error('Failed to send gym-owner-lead registration OTP email', { error: err.message }),
  );

  return { lead, message: 'Registration successful. OTP sent to your email for verification.' };
};

// ============================================================
// Session check — returns lead if verified + registered
// ============================================================

export const checkSession = async (email: string) => {
  // 1. Check gym owner lead
  const verification = await prisma.gymOwnerLeadVerification.findUnique({
    where: { email },
  });

  if (verification?.isVerified) {
    const lead = await prisma.gymOwnerLead.findUnique({ where: { email } });
    if (lead) {
      return {
        isVerified: true,
        isRegistered: true,
        userType: 'gym_owner' as const,
        lead,
        trainer: null,
      };
    }
  }

  // 2. Check trainer
  const trainerVerification = await prisma.hireTrainerVerification.findUnique({
    where: { email },
  });

  if (trainerVerification?.isVerified) {
    const trainer = await prisma.hireTrainer.findFirst({
      where: { email, isSubmitted: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        mobile: true,
        fullName: true,
        city: true,
        state: true,
        role: true,
      },
    });

    if (trainer) {
      return {
        isVerified: true,
        isRegistered: true,
        userType: 'trainer' as const,
        lead: null,
        trainer,
      };
    }
  }

  return {
    isVerified: verification?.isVerified || false,
    isRegistered: false,
    userType: null,
    lead: null,
    trainer: null,
  };
};

// ============================================================
// Resend OTP — for gym owner lead email verification
// ============================================================

export const resendOtp = async (email: string) => {
  const verification = await prisma.gymOwnerLeadVerification.findUnique({
    where: { email },
  });

  if (!verification) {
    throw new Error('No registration found for this email. Please register first.');
  }

  if (verification.isVerified) {
    return { message: 'Email is already verified.' };
  }

  // Rate limiting
  if (isRateLimited(verification.lastAttemptAt, verification.attempts)) {
    throw new Error('Too many OTP requests. Please try again later.');
  }

  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);
  const expiresAt = getOTPExpiry();

  await prisma.gymOwnerLeadVerification.update({
    where: { email },
    data: {
      otpCode: hashedOtp,
      otpExpiresAt: expiresAt,
      attempts: verification.attempts + 1,
      lastAttemptAt: new Date(),
    },
  });

  // Get lead info for email template
  const lead = await prisma.gymOwnerLead.findUnique({ where: { email } });

  sendGymOwnerRegistrationOTPEmail({
    email,
    name: lead?.name || 'Gym Owner',
    gymName: lead?.gymName || '',
    otp,
  }).catch((err) =>
    logger.error('Failed to resend gym-owner-lead OTP email', { error: err.message }),
  );

  return { message: 'OTP resent to your email.' };
};

// ============================================================
// Forgot Password — send account/login details to email
// ============================================================

export const forgotPassword = async (email: string) => {
  // 1. Check gym owner lead
  const lead = await prisma.gymOwnerLead.findUnique({ where: { email } });

  if (lead) {
    const verification = await prisma.gymOwnerLeadVerification.findUnique({
      where: { email },
    });

    if (!verification?.isVerified) {
      throw new Error('This account is not yet verified. Please complete registration first.');
    }

    sendForgotPasswordEmail(lead).catch((err) =>
      logger.error('Failed to send forgot-password email', { error: err.message }),
    );

    return { message: 'Your login details have been sent to your registered email address.' };
  }

  // 2. Check trainer
  const trainer = await prisma.hireTrainer.findFirst({
    where: { email, isSubmitted: true },
    orderBy: { createdAt: 'desc' },
  });

  if (trainer) {
    const trainerVerification = await prisma.hireTrainerVerification.findUnique({
      where: { email },
    });

    if (!trainerVerification?.isVerified) {
      throw new Error('This account is not yet verified. Please complete registration first.');
    }

    sendTrainerForgotPasswordEmail({
      email: trainer.email,
      name: trainer.fullName || 'Trainer',
      mobile: trainer.mobile,
      city: trainer.city,
      role: trainer.role,
    }).catch((err) =>
      logger.error('Failed to send trainer forgot-password email', { error: err.message }),
    );

    return { message: 'Your login details have been sent to your registered email address.' };
  }

  throw new Error('No account found with this email address. Please register first.');
};

// ============================================================
// Email helpers
// ============================================================

const OTP_EXPIRY_MINUTES = 10;

async function sendGymOwnerLeadOTPEmail(email: string, otp: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">Gym Desk Pro</h1>
        <p style="color: #6b7280; margin-top: 4px;">Gym Owner Verification</p>
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
      subject: 'Verify Your Email - Gym Desk Pro',
      html,
    });
    return result.success;
  } catch (error: any) {
    logger.error('Failed to send OTP email', { email, error: error.message });
    return false;
  }
}

async function sendGymOwnerRegistrationOTPEmail(data: {
  email: string;
  name: string;
  gymName: string;
  otp: string;
}): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">Gym Desk Pro</h1>
        <p style="color: #6b7280; margin-top: 4px;">Gym Owner Registration for Hiring Trainer</p>
      </div>
      <div style="background: #f9fafb; border-radius: 12px; padding: 32px;">
        <h2 style="color: #1f2937; margin-bottom: 8px;">Hello ${data.name},</h2>
        <p style="color: #4b5563; margin-bottom: 16px;">
          Thank you for registering on <strong>Gym Desk Pro</strong> to hire trainers for your gym <strong>${data.gymName}</strong>.
        </p>
        <p style="color: #4b5563; margin-bottom: 24px;">
          Please verify your email address using the OTP below to complete your registration and start browsing trainer profiles.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="background: #ffffff; border: 2px dashed #10b981; border-radius: 8px; padding: 20px; display: inline-block;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${data.otp}</span>
          </div>
        </div>
        <div style="background: #ffffff; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 12px;">Registration Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">Name:</td>
              <td style="padding: 8px 0; color: #1f2937;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Gym Name:</td>
              <td style="padding: 8px 0; color: #1f2937;">${data.gymName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
              <td style="padding: 8px 0; color: #1f2937;">${data.email}</td>
            </tr>
          </table>
        </div>
        <p style="color: #9ca3af; font-size: 14px;">
          This code expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.
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
      subject: `Verify Your Registration - ${data.gymName} | Gym Desk Pro`,
      html,
    });
    return result.success;
  } catch (error: any) {
    logger.error('Failed to send registration OTP email', { email: data.email, error: error.message });
    return false;
  }
}

async function sendForgotPasswordEmail(lead: {
  email: string;
  name: string;
  gymName: string;
  mobile: string;
}): Promise<boolean> {
  // Mask mobile: show first 3 and last 2 digits
  const maskedMobile =
    lead.mobile.length >= 6
      ? lead.mobile.slice(0, 3) + '*'.repeat(lead.mobile.length - 5) + lead.mobile.slice(-2)
      : lead.mobile;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">Gym Desk Pro</h1>
        <p style="color: #6b7280; margin-top: 4px;">Account Recovery</p>
      </div>
      <div style="background: #f9fafb; border-radius: 12px; padding: 32px;">
        <h2 style="color: #1f2937; margin-bottom: 8px;">Hello ${lead.name},</h2>
        <p style="color: #4b5563; margin-bottom: 16px;">
          You requested your login details for <strong>Gym Desk Pro</strong>. Here are your account details:
        </p>
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #374151; width: 160px; border-bottom: 1px solid #f3f4f6;">Name:</td>
              <td style="padding: 10px 0; color: #1f2937; border-bottom: 1px solid #f3f4f6;">${lead.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #374151; border-bottom: 1px solid #f3f4f6;">Gym Name:</td>
              <td style="padding: 10px 0; color: #1f2937; border-bottom: 1px solid #f3f4f6;">${lead.gymName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #374151; border-bottom: 1px solid #f3f4f6;">Email:</td>
              <td style="padding: 10px 0; color: #1f2937; border-bottom: 1px solid #f3f4f6;">${lead.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #374151;">Registered Mobile:</td>
              <td style="padding: 10px 0;">
                <span style="font-size: 18px; font-weight: bold; color: #10b981; letter-spacing: 2px;">${maskedMobile}</span>
              </td>
            </tr>
          </table>
        </div>
        <div style="background: #ecfdf5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #065f46; font-size: 14px; margin: 0;">
            <strong>How to login:</strong> Visit the Search Trainers page, enter your registered mobile number <strong>${maskedMobile}</strong>, and you'll be logged in instantly — no password required.
          </p>
        </div>
        <p style="color: #9ca3af; font-size: 13px;">
          If you did not request this information, you can safely ignore this email. Your account is secure.
        </p>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
        &copy; ${new Date().getFullYear()} Gym Desk Pro. All rights reserved.
      </p>
    </div>
  `;

  try {
    const result = await sendEmail({
      to: lead.email,
      subject: `Your Login Details - ${lead.gymName} | Gym Desk Pro`,
      html,
    });
    return result.success;
  } catch (error: any) {
    logger.error('Failed to send forgot-password email', { email: lead.email, error: error.message });
    return false;
  }
}

async function sendTrainerForgotPasswordEmail(trainer: {
  email: string;
  name: string;
  mobile: string;
  city: string | null;
  role: string | null;
}): Promise<boolean> {
  const maskedMobile =
    trainer.mobile.length >= 6
      ? trainer.mobile.slice(0, 3) + '*'.repeat(trainer.mobile.length - 5) + trainer.mobile.slice(-2)
      : trainer.mobile;

  const roleLabel = trainer.role
    ? trainer.role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'N/A';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">Gym Desk Pro</h1>
        <p style="color: #6b7280; margin-top: 4px;">Trainer Account Recovery</p>
      </div>
      <div style="background: #f9fafb; border-radius: 12px; padding: 32px;">
        <h2 style="color: #1f2937; margin-bottom: 8px;">Hello ${trainer.name},</h2>
        <p style="color: #4b5563; margin-bottom: 16px;">
          You requested your login details for <strong>Gym Desk Pro</strong>. Here are your account details:
        </p>
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #374151; width: 160px; border-bottom: 1px solid #f3f4f6;">Name:</td>
              <td style="padding: 10px 0; color: #1f2937; border-bottom: 1px solid #f3f4f6;">${trainer.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #374151; border-bottom: 1px solid #f3f4f6;">Role:</td>
              <td style="padding: 10px 0; color: #1f2937; border-bottom: 1px solid #f3f4f6;">${roleLabel}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #374151; border-bottom: 1px solid #f3f4f6;">City:</td>
              <td style="padding: 10px 0; color: #1f2937; border-bottom: 1px solid #f3f4f6;">${trainer.city || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #374151; border-bottom: 1px solid #f3f4f6;">Email:</td>
              <td style="padding: 10px 0; color: #1f2937; border-bottom: 1px solid #f3f4f6;">${trainer.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #374151;">Registered Mobile:</td>
              <td style="padding: 10px 0;">
                <span style="font-size: 18px; font-weight: bold; color: #10b981; letter-spacing: 2px;">${maskedMobile}</span>
              </td>
            </tr>
          </table>
        </div>
        <div style="background: #ecfdf5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #065f46; font-size: 14px; margin: 0;">
            <strong>How to login:</strong> Visit the Search Trainers page, enter your registered mobile number <strong>${maskedMobile}</strong>, and you'll be logged in instantly — no password required.
          </p>
        </div>
        <p style="color: #9ca3af; font-size: 13px;">
          If you did not request this information, you can safely ignore this email. Your account is secure.
        </p>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
        &copy; ${new Date().getFullYear()} Gym Desk Pro. All rights reserved.
      </p>
    </div>
  `;

  try {
    const result = await sendEmail({
      to: trainer.email,
      subject: `Your Login Details - Trainer Account | Gym Desk Pro`,
      html,
    });
    return result.success;
  } catch (error: any) {
    logger.error('Failed to send trainer forgot-password email', { email: trainer.email, error: error.message });
    return false;
  }
}
