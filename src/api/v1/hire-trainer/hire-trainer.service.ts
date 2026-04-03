import { prisma } from '../../../config/database';
import { Prisma } from '@prisma/client';
import {
  generateOTP,
  hashOTP,
  compareOTP,
  getOTPExpiry,
  isOTPExpired,
  isMaxAttemptsExceeded,
  isRateLimited,
  sendOTPEmail,
  sendTrainerConfirmationEmail,
} from '../../../common/services/otp.service';
import { uploadToR2, R2Folder, FileData } from '../../../common/services/r2-upload.service';
import logger from '../../../common/utils/logger.util';
import type { SendOtpInput, VerifyOtpInput, SaveStepInput, HireTrainerSearchParams } from './hire-trainer.types';

// ============================================================
// OTP & Verification
// ============================================================

export const sendOtp = async (input: SendOtpInput) => {
  const { email, mobile } = input;

  // Check if already verified
  const existing = await prisma.hireTrainerVerification.findUnique({
    where: { email },
  });

  if (existing?.isVerified) {
    return { isAlreadyVerified: true, message: 'Email is already verified' };
  }

  // Rate limiting
  if (existing && isRateLimited(existing.lastAttemptAt, existing.attempts)) {
    throw new Error('Too many OTP requests. Please try again later.');
  }

  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);
  const expiresAt = getOTPExpiry();

  // Upsert verification record
  await prisma.hireTrainerVerification.upsert({
    where: { email },
    update: {
      otpCode: hashedOtp,
      otpExpiresAt: expiresAt,
      mobile,
      attempts: existing ? existing.attempts + 1 : 1,
      lastAttemptAt: new Date(),
    },
    create: {
      email,
      mobile,
      otpCode: hashedOtp,
      otpExpiresAt: expiresAt,
      attempts: 1,
      lastAttemptAt: new Date(),
    },
  });

  // Send OTP email
  const sent = await sendOTPEmail(email, otp);
  if (!sent) {
    throw new Error('Failed to send OTP email. Please try again.');
  }

  return { isAlreadyVerified: false, message: 'OTP sent to your email' };
};

export const verifyOtp = async (input: VerifyOtpInput) => {
  const { email, otpCode } = input;

  const record = await prisma.hireTrainerVerification.findUnique({
    where: { email },
  });

  if (!record) {
    throw new Error('No OTP found for this email. Please request a new one.');
  }

  if (record.isVerified) {
    return { verified: true, message: 'Email is already verified' };
  }

  if (isMaxAttemptsExceeded(record.attempts)) {
    throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
  }

  if (isOTPExpired(record.otpExpiresAt)) {
    throw new Error('OTP has expired. Please request a new one.');
  }

  const isValid = await compareOTP(otpCode, record.otpCode);

  // Increment attempts regardless
  await prisma.hireTrainerVerification.update({
    where: { email },
    data: { attempts: record.attempts + 1 },
  });

  if (!isValid) {
    throw new Error('Invalid OTP. Please try again.');
  }

  // Mark as verified
  await prisma.hireTrainerVerification.update({
    where: { email },
    data: {
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  return { verified: true, message: 'Email verified successfully' };
};

export const checkVerification = async (email: string) => {
  const verification = await prisma.hireTrainerVerification.findUnique({
    where: { email },
  });

  const draft = await prisma.hireTrainer.findUnique({
    where: { email },
  });

  return {
    isVerified: verification?.isVerified ?? false,
    hasExistingDraft: draft ? !draft.isSubmitted : false,
    currentStep: draft?.currentStep ?? 1,
  };
};

// ============================================================
// Draft Save & Resume
// ============================================================

const STEP2_FIELDS = [
  'fullName', 'address', 'whatsappNumber', 'country', 'state', 'city',
  'role', 'totalYearsExperience', 'ptExperienceYears', 'ptExperienceMonths',
  'currentSalary', 'expectedSalary', 'howSoonCanJoin', 'specialization',
  'currentGymName', 'reasonForLeaving', 'numberOfGymsChanged',
  'gender', 'maritalStatus',
] as const;

export const saveStep = async (input: SaveStepInput) => {
  const { email, step, data } = input;

  // Verify email first
  const verification = await prisma.hireTrainerVerification.findUnique({
    where: { email },
  });
  if (!verification?.isVerified) {
    throw new Error('Email must be verified before saving data.');
  }

  // Build update data based on step
  const updateData: Record<string, any> = { currentStep: step };

  if (step === 1) {
    if (data.mobile) updateData.mobile = data.mobile;
  } else if (step === 2) {
    for (const field of STEP2_FIELDS) {
      if (data[field] !== undefined) {
        // Convert numeric fields
        if (['totalYearsExperience', 'ptExperienceYears', 'ptExperienceMonths', 'numberOfGymsChanged'].includes(field)) {
          updateData[field] = data[field] !== null && data[field] !== '' ? parseInt(data[field], 10) : null;
        } else if (['currentSalary', 'expectedSalary'].includes(field)) {
          updateData[field] = data[field] !== null && data[field] !== '' ? parseFloat(data[field]) : null;
        } else {
          updateData[field] = data[field] || null;
        }
      }
    }
  }

  // Upsert the trainer record
  const trainer = await prisma.hireTrainer.upsert({
    where: { email },
    update: updateData,
    create: {
      email,
      mobile: data.mobile || verification.mobile || '',
      ...updateData,
    },
  });

  return { id: trainer.id, currentStep: trainer.currentStep };
};

export const resumeDraft = async (email: string, mobile: string) => {
  const trainer = await prisma.hireTrainer.findUnique({
    where: { email },
    include: { documents: true },
  });

  if (!trainer) {
    throw new Error('No application found for this email.');
  }

  if (trainer.mobile !== mobile) {
    throw new Error('Email and mobile number do not match.');
  }

  if (trainer.isSubmitted) {
    throw new Error('This application has already been submitted.');
  }

  return trainer;
};

// ============================================================
// Final Submission
// ============================================================

export const submitApplication = async (email: string) => {
  // Verify email is verified
  const verification = await prisma.hireTrainerVerification.findUnique({
    where: { email },
  });
  if (!verification?.isVerified) {
    throw new Error('Email must be verified before submission.');
  }

  const trainer = await prisma.hireTrainer.findUnique({
    where: { email },
  });

  if (!trainer) {
    throw new Error('No application found. Please fill in the form first.');
  }

  if (trainer.isSubmitted) {
    throw new Error('This application has already been submitted.');
  }

  // Validate required fields
  if (!trainer.fullName || !trainer.mobile || !trainer.role || trainer.totalYearsExperience === null) {
    throw new Error('Please complete all required fields before submitting.');
  }

  // Update status
  const updated = await prisma.hireTrainer.update({
    where: { email },
    data: {
      isSubmitted: true,
      status: 'SUBMITTED',
      submittedAt: new Date(),
      currentStep: 2,
    },
  });

  // Send confirmation email (non-blocking)
  sendTrainerConfirmationEmail({
    email: trainer.email,
    fullName: trainer.fullName,
    role: trainer.role || 'FULL_TIME',
    totalYearsExperience: trainer.totalYearsExperience || 0,
    mobile: trainer.mobile,
    specialization: trainer.specialization || undefined,
  }).catch((err) => {
    logger.error('Failed to send confirmation email', { email, error: err.message });
  });

  return updated;
};

// ============================================================
// File Upload
// ============================================================

export const uploadCertificate = async (hireTrainerId: string, file: FileData) => {
  // Verify trainer exists
  const trainer = await prisma.hireTrainer.findUnique({
    where: { id: hireTrainerId },
  });
  if (!trainer) {
    throw new Error('Trainer application not found.');
  }
  if (trainer.isSubmitted) {
    throw new Error('Cannot upload files to a submitted application.');
  }

  // Upload to R2
  const result = await uploadToR2(file, R2Folder.HIRE_TRAINER_CERTIFICATES, 'cert');

  if (!result.success) {
    throw new Error(result.error || 'Failed to upload certificate.');
  }

  // Create document record
  const doc = await prisma.hireTrainerDocument.create({
    data: {
      hireTrainerId,
      fileName: file.originalname,
      fileUrl: result.url,
      fileType: file.mimetype.includes('pdf') ? 'pdf' : 'image',
      fileSize: file.size,
    },
  });

  return doc;
};

// ============================================================
// My Profile & Update
// ============================================================

export const getMyProfile = async (email: string) => {
  const verification = await prisma.hireTrainerVerification.findUnique({
    where: { email },
  });
  if (!verification?.isVerified) {
    throw new Error('Email must be verified.');
  }

  const trainer = await prisma.hireTrainer.findUnique({
    where: { email },
    include: { documents: true },
  });

  if (!trainer) {
    throw new Error('No trainer profile found for this email.');
  }

  return trainer;
};

export const updateTrainerProfile = async (email: string, data: Record<string, any>) => {
  const verification = await prisma.hireTrainerVerification.findUnique({
    where: { email },
  });
  if (!verification?.isVerified) {
    throw new Error('Email must be verified.');
  }

  const trainer = await prisma.hireTrainer.findUnique({
    where: { email },
  });

  if (!trainer) {
    throw new Error('No trainer profile found for this email.');
  }

  const allowedFields = [
    'fullName', 'address', 'whatsappNumber', 'country', 'state', 'city',
    'role', 'totalYearsExperience', 'ptExperienceYears', 'ptExperienceMonths',
    'currentSalary', 'expectedSalary', 'howSoonCanJoin', 'specialization',
    'currentGymName', 'reasonForLeaving', 'numberOfGymsChanged',
    'gender', 'maritalStatus',
  ];

  const updateData: Record<string, any> = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (['totalYearsExperience', 'ptExperienceYears', 'ptExperienceMonths', 'numberOfGymsChanged'].includes(field)) {
        updateData[field] = data[field] !== null && data[field] !== '' ? parseInt(data[field], 10) : null;
      } else if (['currentSalary', 'expectedSalary'].includes(field)) {
        updateData[field] = data[field] !== null && data[field] !== '' ? parseFloat(data[field]) : null;
      } else {
        updateData[field] = data[field] || null;
      }
    }
  }

  const updated = await prisma.hireTrainer.update({
    where: { email },
    data: updateData,
    include: { documents: true },
  });

  return updated;
};

// ============================================================
// Search & Listing
// ============================================================

export const searchTrainers = async (params: HireTrainerSearchParams) => {
  const {
    search, city, role,
    specialization, gender, availability,
    sortBy, sortOrder,
  } = params;

  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 12;
  const experienceMin = params.experienceMin !== undefined ? Number(params.experienceMin) : undefined;
  const experienceMax = params.experienceMax !== undefined ? Number(params.experienceMax) : undefined;
  const salaryMin = params.salaryMin !== undefined ? Number(params.salaryMin) : undefined;
  const salaryMax = params.salaryMax !== undefined ? Number(params.salaryMax) : undefined;

  const where: Prisma.HireTrainerWhereInput = {
    isSubmitted: true,
    status: { in: ['SUBMITTED', 'APPROVED'] },
  };

  // Text search
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { specialization: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filters
  if (city) {
    const cities = city.split(',').map(c => c.trim()).filter(Boolean);
    if (cities.length === 1) {
      where.city = { contains: cities[0], mode: 'insensitive' };
    } else if (cities.length > 1) {
      if (!where.AND) where.AND = [];
      (where.AND as any[]).push({ OR: cities.map(c => ({ city: { contains: c, mode: 'insensitive' } })) });
    }
  }
  if (role) {
    const roles = role.split(',').map(r => r.trim()).filter(Boolean);
    if (roles.length === 1) {
      where.role = roles[0] as any;
    } else if (roles.length > 1) {
      where.role = { in: roles as any[] };
    }
  }
  if (gender) {
    const genders = gender.split(',').map(g => g.trim()).filter(Boolean);
    if (genders.length === 1) {
      where.gender = { equals: genders[0], mode: 'insensitive' };
    } else if (genders.length > 1) {
      if (!where.AND) where.AND = [];
      (where.AND as any[]).push({ OR: genders.map(g => ({ gender: { equals: g, mode: 'insensitive' } })) });
    }
  }
  if (specialization) where.specialization = { contains: specialization, mode: 'insensitive' };
  if (availability) {
    const availabilities = availability.split(',').map(a => a.trim()).filter(Boolean);
    if (availabilities.length === 1) {
      where.howSoonCanJoin = { contains: availabilities[0], mode: 'insensitive' };
    } else if (availabilities.length > 1) {
      if (!where.AND) where.AND = [];
      (where.AND as any[]).push({ OR: availabilities.map(a => ({ howSoonCanJoin: { contains: a, mode: 'insensitive' } })) });
    }
  }

  if (experienceMin !== undefined || experienceMax !== undefined) {
    where.totalYearsExperience = {};
    if (experienceMin !== undefined) where.totalYearsExperience.gte = experienceMin;
    if (experienceMax !== undefined) where.totalYearsExperience.lte = experienceMax;
  }

  if (salaryMin !== undefined || salaryMax !== undefined) {
    where.expectedSalary = {};
    if (salaryMin !== undefined) where.expectedSalary.gte = salaryMin;
    if (salaryMax !== undefined) where.expectedSalary.lte = salaryMax;
  }

  // Sorting
  const orderBy: Prisma.HireTrainerOrderByWithRelationInput = {};
  if (sortBy === 'experience') {
    orderBy.totalYearsExperience = sortOrder || 'desc';
  } else if (sortBy === 'salary') {
    orderBy.expectedSalary = sortOrder || 'desc';
  } else {
    orderBy.createdAt = sortOrder || 'desc';
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.hireTrainer.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        city: true,
        state: true,
        role: true,
        totalYearsExperience: true,
        ptExperienceYears: true,
        ptExperienceMonths: true,
        expectedSalary: true,
        specialization: true,
        gender: true,
        howSoonCanJoin: true,
        createdAt: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.hireTrainer.count({ where }),
  ]);

  return { items, total, page, limit };
};

export const getTrainerProfile = async (id: string) => {
  const trainer = await prisma.hireTrainer.findUnique({
    where: { id },
    include: { documents: true },
  });

  if (!trainer || !trainer.isSubmitted) {
    throw new Error('Trainer profile not found.');
  }

  // Don't expose sensitive fields
  const { email, mobile, ...publicProfile } = trainer;
  return publicProfile;
};
