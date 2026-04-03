import { prisma } from '../../../config/database';
import { Prisma } from '@prisma/client';
import logger from '../../../common/utils/logger.util';
import type {
  CreateTrainerVacancyInput,
  UpdateTrainerVacancyInput,
  TrainerVacancySearchParams,
} from './trainer-vacancy.types';

// ============================================================
// Create Vacancy
// ============================================================
export const createVacancy = async (input: CreateTrainerVacancyInput) => {
  const { gymOwnerLeadEmail, ...data } = input;

  // Verify gym owner lead exists and is verified
  const lead = await prisma.gymOwnerLead.findUnique({
    where: { email: gymOwnerLeadEmail },
  });

  if (!lead) {
    throw new Error('Gym owner not found. Please register first.');
  }

  const verification = await prisma.gymOwnerLeadVerification.findUnique({
    where: { email: gymOwnerLeadEmail },
  });

  if (!verification?.isVerified) {
    throw new Error('Email not verified. Please verify your email first.');
  }

  const vacancy = await prisma.trainerVacancy.create({
    data: {
      gymOwnerLeadId: lead.id,
      role: data.role,
      yearsOfExperience: data.yearsOfExperience ?? null,
      ptClientExperience: data.ptClientExperience ?? null,
      description: data.description ?? null,
      specialization: data.specialization ?? null,
      certificate: data.certificate ?? null,
      isPTTrainer: data.isPTTrainer ?? false,
      howSoonCanJoin: data.howSoonCanJoin ?? null,
      gender: data.gender ?? null,
      salaryMin: data.salaryMin ?? null,
      salaryMax: data.salaryMax ?? null,
      salaryType: data.salaryType ?? 'PER_MONTH',
      country: data.country ?? 'India',
      state: data.state ?? null,
      city: data.city ?? null,
      closeDate: data.closeDate ? new Date(data.closeDate) : null,
    },
    include: {
      gymOwnerLead: {
        select: { id: true, name: true, gymName: true, mobile: true },
      },
    },
  });

  return vacancy;
};

// ============================================================
// Update Vacancy
// ============================================================
export const updateVacancy = async (
  id: string,
  gymOwnerLeadEmail: string,
  input: UpdateTrainerVacancyInput,
) => {
  const lead = await prisma.gymOwnerLead.findUnique({
    where: { email: gymOwnerLeadEmail },
  });

  if (!lead) {
    throw new Error('Gym owner not found.');
  }

  const vacancy = await prisma.trainerVacancy.findUnique({ where: { id } });

  if (!vacancy) {
    throw new Error('Vacancy not found.');
  }

  if (vacancy.gymOwnerLeadId !== lead.id) {
    throw new Error('You can only edit your own vacancies.');
  }

  const updateData: Record<string, any> = {};

  if (input.role !== undefined) updateData.role = input.role;
  if (input.yearsOfExperience !== undefined) updateData.yearsOfExperience = input.yearsOfExperience;
  if (input.ptClientExperience !== undefined) updateData.ptClientExperience = input.ptClientExperience;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.specialization !== undefined) updateData.specialization = input.specialization;
  if (input.certificate !== undefined) updateData.certificate = input.certificate;
  if (input.isPTTrainer !== undefined) updateData.isPTTrainer = input.isPTTrainer;
  if (input.howSoonCanJoin !== undefined) updateData.howSoonCanJoin = input.howSoonCanJoin;
  if (input.gender !== undefined) updateData.gender = input.gender;
  if (input.salaryMin !== undefined) updateData.salaryMin = input.salaryMin;
  if (input.salaryMax !== undefined) updateData.salaryMax = input.salaryMax;
  if (input.salaryType !== undefined) updateData.salaryType = input.salaryType;
  if (input.country !== undefined) updateData.country = input.country;
  if (input.state !== undefined) updateData.state = input.state;
  if (input.city !== undefined) updateData.city = input.city;
  if (input.closeDate !== undefined) updateData.closeDate = input.closeDate ? new Date(input.closeDate) : null;
  if (input.status !== undefined) updateData.status = input.status;

  const updated = await prisma.trainerVacancy.update({
    where: { id },
    data: updateData,
    include: {
      gymOwnerLead: {
        select: { id: true, name: true, gymName: true, mobile: true },
      },
    },
  });

  return updated;
};

// ============================================================
// Delete Vacancy
// ============================================================
export const deleteVacancy = async (id: string, gymOwnerLeadEmail: string) => {
  const lead = await prisma.gymOwnerLead.findUnique({
    where: { email: gymOwnerLeadEmail },
  });

  if (!lead) {
    throw new Error('Gym owner not found.');
  }

  const vacancy = await prisma.trainerVacancy.findUnique({ where: { id } });

  if (!vacancy) {
    throw new Error('Vacancy not found.');
  }

  if (vacancy.gymOwnerLeadId !== lead.id) {
    throw new Error('You can only delete your own vacancies.');
  }

  await prisma.trainerVacancy.delete({ where: { id } });

  return { deleted: true };
};

// ============================================================
// Get My Vacancies (for gym owner)
// ============================================================
export const getMyVacancies = async (gymOwnerLeadEmail: string) => {
  const lead = await prisma.gymOwnerLead.findUnique({
    where: { email: gymOwnerLeadEmail },
  });

  if (!lead) {
    throw new Error('Gym owner not found.');
  }

  const vacancies = await prisma.trainerVacancy.findMany({
    where: { gymOwnerLeadId: lead.id },
    orderBy: { createdAt: 'desc' },
    include: {
      gymOwnerLead: {
        select: { id: true, name: true, gymName: true, mobile: true },
      },
    },
  });

  return vacancies;
};

// ============================================================
// Search Vacancies (public)
// ============================================================
export const searchVacancies = async (params: TrainerVacancySearchParams) => {
  const { search, role, state, city, isPTTrainer, gender, salaryType, salaryMin, salaryMax, experienceMin, experienceMax, specialization, sortBy, sortOrder } = params;

  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 12;

  const where: Prisma.TrainerVacancyWhereInput = {
    status: 'ACTIVE',
    OR: [
      { closeDate: null },
      { closeDate: { gte: new Date() } },
    ],
  };

  if (search) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : []),
      {
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { specialization: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { gymOwnerLead: { gymName: { contains: search, mode: 'insensitive' } } },
        ],
      },
    ];
  }

  if (role) {
    const roles = role.split(',').map((r) => r.trim()).filter(Boolean);
    if (roles.length === 1) {
      where.role = roles[0] as any;
    } else if (roles.length > 1) {
      where.role = { in: roles as any[] };
    }
  }

  if (state) {
    where.state = { contains: state, mode: 'insensitive' };
  }

  if (city) {
    const cities = city.split(',').map((c) => c.trim()).filter(Boolean);
    if (cities.length === 1) {
      where.city = { contains: cities[0], mode: 'insensitive' };
    } else if (cities.length > 1) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        { OR: cities.map((c) => ({ city: { contains: c, mode: 'insensitive' as const } })) },
      ];
    }
  }

  if (isPTTrainer === 'true') {
    where.isPTTrainer = true;
  }

  if (gender) {
    where.gender = { equals: gender, mode: 'insensitive' };
  }

  if (salaryMin) {
    where.salaryMin = { gte: Number(salaryMin) };
  }

  if (salaryMax) {
    where.salaryMax = { lte: Number(salaryMax) };
  }

  if (experienceMin) {
    where.yearsOfExperience = { ...(where.yearsOfExperience as any), gte: Number(experienceMin) };
  }

  if (experienceMax) {
    where.yearsOfExperience = { ...(where.yearsOfExperience as any), lte: Number(experienceMax) };
  }

  if (specialization) {
    const specs = specialization.split(',').map((s) => s.trim()).filter(Boolean);
    if (specs.length > 0) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        { OR: specs.map((s) => ({ specialization: { contains: s, mode: 'insensitive' as const } })) },
      ];
    }
  }

  if (salaryType) {
    where.salaryType = salaryType as any;
  }

  // Sorting
  const orderBy: Prisma.TrainerVacancyOrderByWithRelationInput = {};
  if (sortBy === 'salary') {
    orderBy.salaryMax = sortOrder || 'desc';
  } else if (sortBy === 'closeDate') {
    orderBy.closeDate = sortOrder || 'asc';
  } else {
    orderBy.createdAt = sortOrder || 'desc';
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.trainerVacancy.findMany({
      where,
      include: {
        gymOwnerLead: {
          select: { id: true, name: true, gymName: true, mobile: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.trainerVacancy.count({ where }),
  ]);

  return { items, total, page, limit };
};

// ============================================================
// Get Single Vacancy
// ============================================================
export const getVacancy = async (id: string) => {
  const vacancy = await prisma.trainerVacancy.findUnique({
    where: { id },
    include: {
      gymOwnerLead: {
        select: { id: true, name: true, gymName: true, mobile: true },
      },
    },
  });

  if (!vacancy) {
    throw new Error('Vacancy not found.');
  }

  return vacancy;
};
