import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { prisma } from '../../../config/database';
import { NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '../../../common/exceptions';
import { maskPassword, generateTempPassword } from '../../../common/utils';
import {
  Trainer,
  CreateTrainerRequest,
  UpdateTrainerRequest,
  Member,
  CreateMemberRequest,
  UpdateMemberRequest,
  DietPlan,
  CreateDietPlanRequest,
  UpdateDietPlanRequest,
  ExercisePlan,
  CreateExercisePlanRequest,
  UpdateExercisePlanRequest,
  AssignPlanRequest,
  GymOwnerDashboardStats,
  PaginationParams,
  PTMember,
  TrainerPTMemberSummary,
  CreatePTMemberRequest,
  UpdatePTMemberRequest,
  Supplement,
  CreateSupplementRequest,
  UpdateSupplementRequest,
  MemberDietPlan,
  CreateMemberDietPlanRequest,
  UpdateMemberDietPlanRequest,
  Inquiry,
  CreateInquiryRequest,
  UpdateInquiryRequest,
  MemberReport,
  PTProgressReport,
  TrainerReport,
  RevenueReport,
  ExpenseGroup,
  CreateExpenseGroupRequest,
  UpdateExpenseGroupRequest,
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseListParams,
  ExpenseListResponse,
  PaymentMode,
  Designation,
  CreateDesignationRequest,
  UpdateDesignationRequest,
  BodyPart,
  CreateBodyPartRequest,
  UpdateBodyPartRequest,
  WorkoutExercise,
  CreateWorkoutExerciseRequest,
  UpdateWorkoutExerciseRequest,
  MemberInquiry,
  CreateMemberInquiryRequest,
  UpdateMemberInquiryRequest,
  CoursePackage,
  CreateCoursePackageRequest,
  UpdateCoursePackageRequest,
  MemberBalancePayment,
  CreateMemberBalancePaymentRequest,
  UpdateMemberBalancePaymentRequest,
  MemberBalancePaymentResponse,
  MembershipRenewal,
  CreateMembershipRenewalRequest,
  UpdateMembershipRenewalRequest,
  MemberRenewalHistory,
  RenewalRateReport,
  RenewalType,
  PaymentStatus,
  // New imports for PT Addon & Payment Type Conversion
  AddPTAddonRequest,
  UpdatePTAddonRequest,
  RemovePTAddonRequest,
  PTSessionCredit,
  MemberPaymentSummary,
  PaymentFor,
  // Membership Details
  MemberMembershipDetailsResponse,
  // Diet Template & Member Diet Types
  DietTemplate,
  DietMeal,
  CreateDietTemplateRequest,
  UpdateDietTemplateRequest,
  MemberDiet,
  MemberDietMeal,
  CreateMemberDietRequest,
  UpdateMemberDietRequest,
  // Trainer Salary Settlement Types
  TrainerDropdownItem,
  SalaryCalculationRequest,
  SalaryCalculationResponse,
  TrainerSalarySettlement,
  CreateSalarySettlementRequest,
  UpdateSalarySettlementRequest,
  SalarySettlementListParams,
  SalarySettlementListResponse,
  IncentiveType,
  // Salary Slip Types
  TrainerSalarySlip,
  SalarySlipGymDetails,
  SalarySlipTrainerDetails,
  SalarySlipEarnings,
  SalarySlipAttendance,
  SalarySlipPaymentDetails,
  // Report Types
  ExpenseReportParams,
  ExpenseReportItem,
  ExpenseReportResponse,
  ExpenseType,
  IncomeReportParams,
  MemberIncomeItem,
  IncomeReportResponse,
  MemberPaymentDetailParams,
  MemberPaymentDetailItem,
  MemberPaymentDetailResponse,
  PaymentSource,
  // Dashboard Report Types
  DashboardMemberItem,
  DashboardTrainerItem,
  DashboardFollowUpInquiryItem,
  DashboardExpenseItem,
  DashboardRenewalItem,
  DashboardReportParams,
  DashboardReportResponse,
} from './gym-owner.types';

class GymOwnerService {
  // Dashboard
  async getDashboardStats(gymId: string): Promise<GymOwnerDashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);

    // Get first day of current month and last month
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

    const [
      totalActiveMembers,
      totalActiveTrainers,
      todayFollowUpInquiries,
      expiringRegularMembers,
      expiringPTMembers,
      expensesCurrentMonth,
      expensesLastMonth,
      gym,
    ] = await Promise.all([
      // Total Active Members (isActive=true AND membershipStatus=ACTIVE)
      prisma.member.count({
        where: {
          gymId,
          isActive: true,
          membershipStatus: 'ACTIVE',
        },
      }),
      // Total Active Trainers
      prisma.trainer.count({
        where: {
          gymId,
          isActive: true,
        },
      }),
      // Today's Follow-up Inquiries
      prisma.memberInquiry.count({
        where: {
          gymId,
          isActive: true,
          followUp: true,
          followUpDate: {
            gte: today,
            lte: todayEnd,
          },
        },
      }),
      // Expiring Regular Members (7 days) - memberType=REGULAR and NOT hasPTAddon
      prisma.member.count({
        where: {
          gymId,
          isActive: true,
          memberType: 'REGULAR',
          hasPTAddon: { not: true },
          membershipEnd: {
            gte: today,
            lte: sevenDaysFromNow,
          },
        },
      }),
      // Expiring PT Members (7 days) - hasPTAddon=true OR memberType in PT/REGULAR_PT
      prisma.member.count({
        where: {
          gymId,
          isActive: true,
          OR: [
            { hasPTAddon: true },
            { memberType: 'PT' },
            { memberType: 'REGULAR_PT' },
          ],
          membershipEnd: {
            gte: today,
            lte: sevenDaysFromNow,
          },
        },
      }),
      // Current month expenses
      prisma.expenseMaster.aggregate({
        where: {
          gymId,
          isActive: true,
          expenseDate: {
            gte: currentMonthStart,
            lte: todayEnd,
          },
        },
        _sum: { amount: true },
      }),
      // Last month expenses
      prisma.expenseMaster.aggregate({
        where: {
          gymId,
          isActive: true,
          expenseDate: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
        _sum: { amount: true },
      }),
      // Get gym details
      prisma.gym.findUnique({
        where: { id: gymId },
        include: {
          subscriptionPlan: {
            select: {
              id: true,
              name: true,
              price: true,
              durationDays: true,
            },
          },
        },
      }),
    ]);

    return {
      totalActiveMembers,
      totalActiveTrainers,
      todayFollowUpInquiries,
      expiringRegularMembers,
      expiringPTMembers,
      expensesCurrentMonth: Number(expensesCurrentMonth._sum.amount || 0),
      expensesLastMonth: Number(expensesLastMonth._sum.amount || 0),
      gym: {
        id: gym?.id || '',
        name: gym?.name || '',
        address1: gym?.address1 || undefined,
        address2: gym?.address2 || undefined,
        city: gym?.city || undefined,
        state: gym?.state || undefined,
        zipcode: gym?.zipcode || undefined,
        mobileNo: gym?.mobileNo || undefined,
        phoneNo: gym?.phoneNo || undefined,
        email: gym?.email || undefined,
        gymLogo: gym?.gymLogo || undefined,
        subscriptionPlanId: gym?.subscriptionPlanId || undefined,
        subscriptionPlan: gym?.subscriptionPlan ? {
          id: gym.subscriptionPlan.id,
          name: gym.subscriptionPlan.name,
          price: Number(gym.subscriptionPlan.price),
          durationDays: gym.subscriptionPlan.durationDays,
        } : undefined,
        subscriptionStart: gym?.subscriptionStart || undefined,
        subscriptionEnd: gym?.subscriptionEnd || undefined,
      },
    };
  }

  // Dashboard Report Methods
  async getDashboardActiveMembers(
    gymId: string,
    params: DashboardReportParams
  ): Promise<DashboardReportResponse<DashboardMemberItem>> {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      gymId,
      isActive: true,
      membershipStatus: 'ACTIVE',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
        { memberId: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          memberId: true,
          name: true,
          email: true,
          phone: true,
          memberType: true,
          membershipEnd: true,
          memberPhoto: true,
        },
      }),
      prisma.member.count({ where }),
    ]);

    return {
      items: members.map((m) => {
        const nameParts = (m.name || '').split(' ');
        return {
          id: m.id,
          memberId: m.memberId || undefined,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: m.email || '',
          phone: m.phone || undefined,
          memberType: m.memberType as 'REGULAR' | 'PT' | 'REGULAR_PT',
          membershipEnd: m.membershipEnd || undefined,
          memberPhoto: m.memberPhoto || undefined,
        };
      }),
      total,
      page,
      limit,
    };
  }

  async getDashboardActiveTrainers(
    gymId: string,
    params: DashboardReportParams
  ): Promise<DashboardReportResponse<DashboardTrainerItem>> {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      gymId,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [trainers, total] = await Promise.all([
      prisma.trainer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          specialization: true,
          trainerPhoto: true,
          _count: { select: { ptMembers: true } },
        },
      }),
      prisma.trainer.count({ where }),
    ]);

    return {
      items: trainers.map((t) => ({
        id: t.id,
        name: t.name || '',
        email: t.email || '',
        phone: t.phone || undefined,
        specialization: t.specialization || undefined,
        trainerPhoto: t.trainerPhoto || undefined,
        ptMemberCount: t._count.ptMembers,
      })),
      total,
      page,
      limit,
    };
  }

  async getDashboardFollowUpInquiries(
    gymId: string,
    params: DashboardReportParams
  ): Promise<DashboardReportResponse<DashboardFollowUpInquiryItem>> {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const where: any = {
      gymId,
      isActive: true,
      followUp: true,
      followUpDate: {
        gte: today,
        lte: todayEnd,
      },
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' as const } },
        { contactNo: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [inquiries, total] = await Promise.all([
      prisma.memberInquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { followUpDate: 'asc' },
        select: {
          id: true,
          fullName: true,
          contactNo: true,
          followUpDate: true,
          comments: true,
          heardAbout: true,
        },
      }),
      prisma.memberInquiry.count({ where }),
    ]);

    return {
      items: inquiries.map((i) => ({
        id: i.id,
        fullName: i.fullName,
        contactNo: i.contactNo,
        followUpDate: i.followUpDate!,
        comments: i.comments || undefined,
        heardAbout: i.heardAbout || undefined,
      })),
      total,
      page,
      limit,
    };
  }

  async getDashboardExpiringRegularMembers(
    gymId: string,
    params: DashboardReportParams
  ): Promise<DashboardReportResponse<DashboardMemberItem>> {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);

    const where: any = {
      gymId,
      isActive: true,
      memberType: 'REGULAR',
      hasPTAddon: { not: true },
      membershipEnd: {
        gte: today,
        lte: sevenDaysFromNow,
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { membershipEnd: 'asc' },
        select: {
          id: true,
          memberId: true,
          name: true,
          email: true,
          phone: true,
          memberType: true,
          membershipEnd: true,
          memberPhoto: true,
        },
      }),
      prisma.member.count({ where }),
    ]);

    return {
      items: members.map((m) => {
        const nameParts = (m.name || '').split(' ');
        return {
          id: m.id,
          memberId: m.memberId || undefined,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: m.email || '',
          phone: m.phone || undefined,
          memberType: m.memberType as 'REGULAR' | 'PT' | 'REGULAR_PT',
          membershipEnd: m.membershipEnd || undefined,
          memberPhoto: m.memberPhoto || undefined,
        };
      }),
      total,
      page,
      limit,
    };
  }

  async getDashboardExpiringPTMembers(
    gymId: string,
    params: DashboardReportParams
  ): Promise<DashboardReportResponse<DashboardMemberItem>> {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);

    const where: any = {
      gymId,
      isActive: true,
      OR: [
        { hasPTAddon: true },
        { memberType: 'PT' },
        { memberType: 'REGULAR_PT' },
      ],
      membershipEnd: {
        gte: today,
        lte: sevenDaysFromNow,
      },
    };

    if (search) {
      // Need to handle search differently since OR is already used
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        },
      ];
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { membershipEnd: 'asc' },
        select: {
          id: true,
          memberId: true,
          name: true,
          email: true,
          phone: true,
          memberType: true,
          membershipEnd: true,
          memberPhoto: true,
          hasPTAddon: true,
        },
      }),
      prisma.member.count({ where }),
    ]);

    return {
      items: members.map((m) => {
        const nameParts = (m.name || '').split(' ');
        return {
          id: m.id,
          memberId: m.memberId || undefined,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: m.email || '',
          phone: m.phone || undefined,
          memberType: m.memberType as 'REGULAR' | 'PT' | 'REGULAR_PT',
          membershipEnd: m.membershipEnd || undefined,
          memberPhoto: m.memberPhoto || undefined,
        };
      }),
      total,
      page,
      limit,
    };
  }

  async getDashboardExpensesSummary(
    gymId: string,
    params: DashboardReportParams
  ): Promise<DashboardReportResponse<DashboardExpenseItem>> {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const where: any = {
      gymId,
      isActive: true,
      expenseDate: {
        gte: lastMonthStart,
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { expenseGroup: { expenseGroupName: { contains: search, mode: 'insensitive' as const } } },
      ];
    }

    const [expenses, total] = await Promise.all([
      prisma.expenseMaster.findMany({
        where,
        skip,
        take: limit,
        orderBy: { expenseDate: 'desc' },
        include: {
          expenseGroup: {
            select: { expenseGroupName: true },
          },
        },
      }),
      prisma.expenseMaster.count({ where }),
    ]);

    return {
      items: expenses.map((e) => ({
        id: e.id,
        expenseDate: e.expenseDate,
        name: e.name,
        amount: Number(e.amount),
        expenseGroupName: e.expenseGroup?.expenseGroupName || undefined,
        paymentMode: e.paymentMode as PaymentMode,
      })),
      total,
      page,
      limit,
    };
  }

  async getDashboardTodayRenewals(
    gymId: string,
    params: DashboardReportParams
  ): Promise<DashboardReportResponse<DashboardRenewalItem>> {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const where: any = {
      gymId,
      isActive: true,
      membershipEnd: {
        gte: today,
        lte: todayEnd,
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { membershipEnd: 'asc' },
        select: {
          id: true,
          memberId: true,
          name: true,
          email: true,
          phone: true,
          membershipEnd: true,
          memberType: true,
          memberPhoto: true,
        },
      }),
      prisma.member.count({ where }),
    ]);

    return {
      items: members.map((m) => {
        const nameParts = (m.name || '').split(' ');
        return {
          id: m.id,
          memberId: m.memberId || undefined,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: m.email || '',
          phone: m.phone || undefined,
          membershipEnd: m.membershipEnd!,
          memberType: m.memberType as 'REGULAR' | 'PT' | 'REGULAR_PT',
          memberPhoto: m.memberPhoto || undefined,
        };
      }),
      total,
      page,
      limit,
    };
  }

  // Trainers
  async getTrainers(gymId: string, params: PaginationParams): Promise<{ trainers: Trainer[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where = {
      gymId,
      ...(search && {
        OR: [
          { user: { name: { contains: search, mode: 'insensitive' as const } } },
          { user: { email: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    };

    const [trainerRecords, total] = await Promise.all([
      prisma.trainer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { id: true, name: true, email: true, isActive: true } },
          _count: { select: { ptMembers: true } }
        }
      }),
      prisma.trainer.count({ where }),
    ]);

    const trainers: Trainer[] = trainerRecords.map((t) => ({
      id: t.id,
      email: t.email || t.user.email,
      firstName: (t.name || t.user.name).split(' ')[0] || t.user.name,
      lastName: (t.name || t.user.name).split(' ').slice(1).join(' ') || '',
      phone: t.phone || undefined,
      specialization: t.specialization || undefined,
      experience: t.experience || undefined,
      gender: t.gender || undefined,
      dateOfBirth: t.dateOfBirth || undefined,
      joiningDate: t.joiningDate || undefined,
      salary: t.salary ? Number(t.salary) : undefined,
      passwordHint: undefined, // Hashed password - use reset if needed
      trainerPhoto: t.trainerPhoto || undefined,
      idProofType: t.idProofType || undefined,
      idProofDocument: t.idProofDocument || undefined,
      isActive: t.isActive && t.user.isActive,
      gymId: t.gymId,
      createdAt: t.createdAt,
      ptMemberCount: t._count.ptMembers,
    }));

    return { trainers, total };
  }


  async getTrainerById(gymId: string, trainerId: string): Promise<Trainer> {
    const trainer = await prisma.trainer.findFirst({
      where: { id: trainerId, gymId },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } }
      }
    });

    if (!trainer) throw new NotFoundException('Trainer not found');

    return {
      id: trainer.id,
      email: trainer.email || trainer.user.email,
      firstName: (trainer.name || trainer.user.name).split(' ')[0] || trainer.user.name,
      lastName: (trainer.name || trainer.user.name).split(' ').slice(1).join(' ') || '',
      phone: trainer.phone || undefined,
      specialization: trainer.specialization || undefined,
      experience: trainer.experience || undefined,
      gender: trainer.gender || undefined,
      dateOfBirth: trainer.dateOfBirth || undefined,
      joiningDate: trainer.joiningDate || undefined,
      salary: trainer.salary ? Number(trainer.salary) : undefined,
      passwordHint: undefined, // Hashed password - use reset if needed
      trainerPhoto: trainer.trainerPhoto || undefined,
      idProofType: trainer.idProofType || undefined,
      idProofDocument: trainer.idProofDocument || undefined,
      isActive: trainer.isActive && trainer.user.isActive,
      gymId: trainer.gymId,
      createdAt: trainer.createdAt,
    };
  }

  async createTrainer(gymId: string, data: CreateTrainerRequest, files?: { trainerPhoto?: string; idProofDocument?: string }): Promise<Trainer> {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictException('User with this email already exists');

    const gym = await prisma.gym.findUnique({ where: { id: gymId } });
    if (!gym) throw new NotFoundException('Gym not found');

    const trainerRole = await prisma.rolemaster.findFirst({ where: { rolename: 'TRAINER' } });
    if (!trainerRole) throw new NotFoundException('TRAINER role not found');

    // Generate random password if not provided
    const password = data.password || Math.random().toString(36).slice(-10) + 'A1!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and trainer in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: `${data.firstName} ${data.lastName}`,
          roleId: trainerRole.Id,
        },
      });

      const trainer = await tx.trainer.create({
        data: {
          userId: user.id,
          gymId,
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: data.password ? hashedPassword : null, // Store hashed password only if provided
          phone: data.phone,
          specialization: data.specialization,
          experience: data.experience,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(), // Default to today
          salary: data.salary,
          idProofType: data.idProofType,
          trainerPhoto: files?.trainerPhoto,
          idProofDocument: files?.idProofDocument,
        },
        include: {
          user: { select: { id: true, name: true, email: true, isActive: true } }
        }
      });

      return trainer;
    });

    return {
      id: result.id,
      email: result.email || result.user.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      specialization: data.specialization,
      experience: result.experience || undefined,
      gender: result.gender || undefined,
      dateOfBirth: result.dateOfBirth || undefined,
      joiningDate: result.joiningDate || undefined,
      salary: result.salary ? Number(result.salary) : undefined,
      passwordHint: maskPassword(data.password), // Mask original plain text on create
      trainerPhoto: result.trainerPhoto || undefined,
      idProofType: result.idProofType || undefined,
      idProofDocument: result.idProofDocument || undefined,
      isActive: result.isActive,
      gymId: result.gymId,
      createdAt: result.createdAt,
    };
  }

  async updateTrainer(gymId: string, trainerId: string, data: UpdateTrainerRequest, files?: { trainerPhoto?: string; idProofDocument?: string }): Promise<Trainer> {
    const existingTrainer = await prisma.trainer.findFirst({
      where: { id: trainerId, gymId },
      include: { user: true }
    });
    if (!existingTrainer) throw new NotFoundException('Trainer not found');

    const result = await prisma.$transaction(async (tx) => {
      // Update user name if firstName or lastName provided
      if (data.firstName || data.lastName) {
        const currentName = existingTrainer.user.name.split(' ');
        const newFirst = data.firstName || currentName[0];
        const newLast = data.lastName || currentName.slice(1).join(' ');
        await tx.user.update({
          where: { id: existingTrainer.userId },
          data: { name: `${newFirst} ${newLast}` }
        });
      }

      // Update user password if provided
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await tx.user.update({
          where: { id: existingTrainer.userId },
          data: { password: hashedPassword }
        });
      }

      // Build update data
      const updateData: any = {};
      // Sync name to Trainer table
      if (data.firstName || data.lastName) {
        const currentName = existingTrainer.user.name.split(' ');
        const newFirst = data.firstName || currentName[0];
        const newLast = data.lastName || currentName.slice(1).join(' ');
        updateData.name = `${newFirst} ${newLast}`;
      }
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.specialization !== undefined) updateData.specialization = data.specialization;
      if (data.experience !== undefined) updateData.experience = data.experience;
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
      if (data.joiningDate !== undefined) updateData.joiningDate = data.joiningDate ? new Date(data.joiningDate) : null;
      if (data.salary !== undefined) updateData.salary = data.salary;
      if (data.idProofType !== undefined) updateData.idProofType = data.idProofType;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      // Store hashed password in Trainer table
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
      }

      // Handle file uploads
      if (files?.trainerPhoto) updateData.trainerPhoto = files.trainerPhoto;
      if (files?.idProofDocument) updateData.idProofDocument = files.idProofDocument;

      const trainer = await tx.trainer.update({
        where: { id: trainerId },
        data: updateData,
        include: {
          user: { select: { id: true, name: true, email: true, isActive: true } }
        }
      });

      return trainer;
    });

    return {
      id: result.id,
      email: result.email || result.user.email,
      firstName: (result.name || result.user.name).split(' ')[0] || result.user.name,
      lastName: (result.name || result.user.name).split(' ').slice(1).join(' ') || '',
      phone: result.phone || undefined,
      specialization: result.specialization || undefined,
      experience: result.experience || undefined,
      gender: result.gender || undefined,
      dateOfBirth: result.dateOfBirth || undefined,
      joiningDate: result.joiningDate || undefined,
      salary: result.salary ? Number(result.salary) : undefined,
      passwordHint: data.password ? maskPassword(data.password) : undefined, // Mask original plain text if provided
      trainerPhoto: result.trainerPhoto || undefined,
      idProofType: result.idProofType || undefined,
      idProofDocument: result.idProofDocument || undefined,
      isActive: result.isActive && result.user.isActive,
      gymId: result.gymId,
      createdAt: result.createdAt,
    };
  }

  async deleteTrainer(gymId: string, trainerId: string): Promise<void> {
    const trainer = await prisma.trainer.findFirst({
      where: { id: trainerId, gymId }
    });
    if (!trainer) throw new NotFoundException('Trainer not found');

    // Soft delete - set isActive to false
    await prisma.trainer.update({
      where: { id: trainerId },
      data: { isActive: false }
    });
  }

  /**
   * Reset trainer password - generates a new temporary password
   * The trainer should change this password on their next login
   */
  async resetTrainerPassword(gymId: string, trainerId: string): Promise<{ trainerId: string; email: string; temporaryPassword: string; message: string }> {
    const trainer = await prisma.trainer.findFirst({
      where: { id: trainerId, gymId },
      include: { user: true }
    });

    if (!trainer) throw new NotFoundException('Trainer not found');

    // Generate a temporary password
    const temporaryPassword = generateTempPassword(12);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Update both the User table (hashed) and Trainer table (hashed)
    await prisma.$transaction(async (tx) => {
      // Update hashed password in User table for authentication
      await tx.user.update({
        where: { id: trainer.userId },
        data: { password: hashedPassword }
      });

      // Update hashed password in Trainer table
      await tx.trainer.update({
        where: { id: trainerId },
        data: { password: hashedPassword }
      });

      // Log password reset in PasswordResetHistory
      await tx.passwordResetHistory.create({
        data: {
          userId: trainer.userId,
          email: trainer.user.email,
          roleId: trainer.user.roleId || undefined,
          roleName: 'TRAINER',
          resetBy: trainer.userId, // Will be overridden by caller if needed
          resetByEmail: trainer.user.email,
          resetMethod: 'OWNER_RESET',
          targetTable: 'TRAINER',
          gymId: gymId,
        },
      });
    });

    return {
      trainerId: trainer.id,
      email: trainer.user.email,
      temporaryPassword,
      message: 'Password has been reset. Please share this temporary password securely with the trainer. They should change it on their next login.'
    };
  }

  async toggleTrainerStatus(gymId: string, trainerId: string): Promise<Trainer> {
    const existingTrainer = await prisma.trainer.findFirst({
      where: { id: trainerId, gymId },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } }
      }
    });
    if (!existingTrainer) throw new NotFoundException('Trainer not found');

    const updatedTrainer = await prisma.trainer.update({
      where: { id: trainerId },
      data: { isActive: !existingTrainer.isActive },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } }
      }
    });

    return {
      id: updatedTrainer.id,
      email: updatedTrainer.email || updatedTrainer.user.email,
      firstName: (updatedTrainer.name || updatedTrainer.user.name).split(' ')[0] || updatedTrainer.user.name,
      lastName: (updatedTrainer.name || updatedTrainer.user.name).split(' ').slice(1).join(' ') || '',
      phone: updatedTrainer.phone || undefined,
      specialization: updatedTrainer.specialization || undefined,
      experience: updatedTrainer.experience || undefined,
      gender: updatedTrainer.gender || undefined,
      dateOfBirth: updatedTrainer.dateOfBirth || undefined,
      joiningDate: updatedTrainer.joiningDate || undefined,
      salary: updatedTrainer.salary ? Number(updatedTrainer.salary) : undefined,
      passwordHint: undefined, // Hashed password - use reset if needed
      trainerPhoto: updatedTrainer.trainerPhoto || undefined,
      idProofType: updatedTrainer.idProofType || undefined,
      idProofDocument: updatedTrainer.idProofDocument || undefined,
      isActive: updatedTrainer.isActive && updatedTrainer.user.isActive,
      gymId: updatedTrainer.gymId,
      createdAt: updatedTrainer.createdAt,
    };
  }

  // Members
  async getMembers(gymId: string, params: PaginationParams): Promise<{ members: Member[]; total: number }> {
    const {
      page,
      limit,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      isActive,
      memberType,
      gender,
      bloodGroup,
      maritalStatus,
      smsFacility,
      membershipStartFrom,
      membershipStartTo,
      membershipEndFrom,
      membershipEndTo,
      coursePackageId,
    } = params;
    const skip = (page - 1) * limit;
    const today = new Date();

    // Build status filter based on status parameter
    // Active: Current date is between membershipStart and membershipEnd (membership is valid)
    // InActive: Soft deleted records (isActive = false)
    // Expired: Current date is past membershipEnd (membership has expired)
    let statusFilter: any = {};
    if (status === 'Active') {
      statusFilter = {
        isActive: true,
        membershipStart: { lte: today },
        membershipEnd: { gte: today },
      };
    } else if (status === 'InActive') {
      statusFilter = { isActive: false };
    } else if (status === 'Expired') {
      statusFilter = {
        isActive: true, // Only show expired active members, not soft deleted ones
        membershipEnd: { lt: today },
      };
    }

    // Build dynamic where clause
    const where: any = {
      gymId,
      // Status filter (Active, InActive, Expired)
      ...statusFilter,
      // Text search - searches across all text fields
      ...(search && {
        OR: [
          { user: { name: { contains: search, mode: 'insensitive' as const } } },
          { user: { email: { contains: search, mode: 'insensitive' as const } } },
          { phone: { contains: search, mode: 'insensitive' as const } },
          { memberId: { contains: search, mode: 'insensitive' as const } },
          { address: { contains: search, mode: 'insensitive' as const } },
          { altContactNo: { contains: search, mode: 'insensitive' as const } },
          { emergencyContact: { contains: search, mode: 'insensitive' as const } },
          { healthNotes: { contains: search, mode: 'insensitive' as const } },
          { occupation: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      // Boolean filters (only if status is not set)
      ...(!status && isActive !== undefined && { isActive }),
      ...(smsFacility !== undefined && { smsFacility }),
      // Enum filter
      ...(memberType && { memberType }),
      // String exact match filters
      ...(gender && { gender: { equals: gender, mode: 'insensitive' as const } }),
      ...(bloodGroup && { bloodGroup: { equals: bloodGroup, mode: 'insensitive' as const } }),
      ...(maritalStatus && { maritalStatus: { equals: maritalStatus, mode: 'insensitive' as const } }),
      // Course package filter
      ...(coursePackageId && { coursePackageId }),
      // Date range filters - Membership Start
      ...(membershipStartFrom || membershipStartTo ? {
        membershipStart: {
          ...(membershipStartFrom && { gte: new Date(membershipStartFrom) }),
          ...(membershipStartTo && { lte: new Date(membershipStartTo) }),
        },
      } : {}),
      // Date range filters - Membership End
      ...(membershipEndFrom || membershipEndTo ? {
        membershipEnd: {
          ...(membershipEndFrom && { gte: new Date(membershipEndFrom) }),
          ...(membershipEndTo && { lte: new Date(membershipEndTo) }),
        },
      } : {}),
    };

    // Build dynamic orderBy - handle special cases for user fields
    let orderBy: any;
    if (sortBy === 'name' || sortBy === 'firstName' || sortBy === 'email') {
      // Sort by user relation fields
      const userField = sortBy === 'firstName' ? 'name' : sortBy;
      orderBy = { user: { [userField]: sortOrder } };
    } else {
      // Sort by direct member fields
      orderBy = { [sortBy]: sortOrder };
    }

    const [memberRecords, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, name: true, email: true, isActive: true } },
          trainerAssignments: {
            where: { isActive: true },
            include: { trainer: { include: { user: true } } },
            take: 1
          }
        }
      }),
      prisma.member.count({ where }),
    ]);

    const members: Member[] = memberRecords.map((m) => {
      const activeTrainer = m.trainerAssignments[0]?.trainer;
      // Check if member has PT - either PT type or has PT addon
      const hasPT = m.memberType === 'PT' || m.hasPTAddon;

      return {
        id: m.id,
        memberId: m.memberId || undefined,
        email: m.email || m.user.email,
        firstName: (m.name || m.user.name).split(' ')[0] || m.user.name,
        lastName: (m.name || m.user.name).split(' ').slice(1).join(' ') || '',
        phone: m.phone || undefined,
        altContactNo: m.altContactNo || undefined,
        address: m.address || undefined,
        gender: m.gender || undefined,
        occupation: m.occupation || undefined,
        maritalStatus: m.maritalStatus || undefined,
        bloodGroup: m.bloodGroup || undefined,
        dateOfBirth: m.dateOfBirth || undefined,
        anniversaryDate: m.anniversaryDate || undefined,
        emergencyContact: m.emergencyContact || undefined,
        healthNotes: m.healthNotes || undefined,
        idProofType: m.idProofType || undefined,
        idProofDocument: m.idProofDocument || undefined,
        memberPhoto: m.memberPhoto || undefined,
        smsFacility: m.smsFacility,
        isActive: m.isActive,
        gymId: m.gymId,
        trainerId: activeTrainer?.id,
        memberType: m.memberType as 'REGULAR' | 'PT',
        membershipStartDate: m.membershipStart,
        membershipEndDate: m.membershipEnd,
        coursePackageId: m.coursePackageId || undefined,
        packageFees: m.packageFees ? Number(m.packageFees) : undefined,
        maxDiscount: m.maxDiscount ? Number(m.maxDiscount) : undefined,
        afterDiscount: m.afterDiscount ? Number(m.afterDiscount) : undefined,
        extraDiscount: m.extraDiscount ? Number(m.extraDiscount) : undefined,
        finalFees: m.finalFees ? Number(m.finalFees) : undefined,
        // PT Addon Fields - show actual values if PT, otherwise 0
        hasPTAddon: m.hasPTAddon,
        ptPackageName: hasPT ? (m.ptPackageName || undefined) : undefined,
        ptPackageFees: hasPT ? (m.ptPackageFees ? Number(m.ptPackageFees) : undefined) : 0,
        ptMaxDiscount: hasPT ? (m.ptMaxDiscount ? Number(m.ptMaxDiscount) : undefined) : 0,
        ptAfterDiscount: hasPT ? (m.ptAfterDiscount ? Number(m.ptAfterDiscount) : undefined) : 0,
        ptExtraDiscount: hasPT ? (m.ptExtraDiscount ? Number(m.ptExtraDiscount) : undefined) : 0,
        ptFinalFees: hasPT ? (m.ptFinalFees ? Number(m.ptFinalFees) : undefined) : 0,
        createdAt: m.createdAt,
      };
    });

    return { members, total };
  }

  async getMemberById(gymId: string, memberId: string): Promise<Member> {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        trainerAssignments: {
          where: { isActive: true },
          include: { trainer: { include: { user: true } } },
          take: 1
        },
        ptMember: {
          include: {
            trainer: {
              include: { user: { select: { name: true } } }
            }
          }
        }
      }
    });

    if (!member) throw new NotFoundException('Member not found');

    const activeTrainer = member.trainerAssignments[0]?.trainer;

    // Build PT info from PTMember table if exists
    let ptInfo: Member['ptInfo'] = undefined;
    if (member.ptMember && member.ptMember.isActive) {
      ptInfo = {
        trainerId: member.ptMember.trainerId,
        trainerName: member.ptMember.trainer.user.name,
        sessionsTotal: member.ptMember.sessionsTotal,
        sessionsUsed: member.ptMember.sessionsUsed,
        sessionsRemaining: member.ptMember.sessionsTotal - member.ptMember.sessionsUsed,
        sessionDuration: member.ptMember.sessionDuration,
        startDate: member.ptMember.startDate,
        endDate: member.ptMember.endDate || undefined,
        goals: member.ptMember.goals || undefined,
      };
    }

    return {
      id: member.id,
      memberId: member.memberId || undefined,
      email: member.user.email,
      firstName: member.user.name.split(' ')[0] || member.user.name,
      lastName: member.user.name.split(' ').slice(1).join(' ') || '',
      phone: member.phone || undefined,
      altContactNo: member.altContactNo || undefined,
      address: member.address || undefined,
      gender: member.gender || undefined,
      occupation: member.occupation || undefined,
      maritalStatus: member.maritalStatus || undefined,
      bloodGroup: member.bloodGroup || undefined,
      dateOfBirth: member.dateOfBirth || undefined,
      anniversaryDate: member.anniversaryDate || undefined,
      emergencyContact: member.emergencyContact || undefined,
      healthNotes: member.healthNotes || undefined,
      idProofType: member.idProofType || undefined,
      idProofDocument: member.idProofDocument || undefined,
      memberPhoto: member.memberPhoto || undefined,
      smsFacility: member.smsFacility,
      isActive: member.isActive,
      gymId: member.gymId,
      trainerId: activeTrainer?.id,
      memberType: member.memberType as 'REGULAR' | 'PT',
      membershipStartDate: member.membershipStart,
      membershipEndDate: member.membershipEnd,
      coursePackageId: member.coursePackageId || undefined,
      packageFees: member.packageFees ? Number(member.packageFees) : undefined,
      maxDiscount: member.maxDiscount ? Number(member.maxDiscount) : undefined,
      afterDiscount: member.afterDiscount ? Number(member.afterDiscount) : undefined,
      extraDiscount: member.extraDiscount ? Number(member.extraDiscount) : undefined,
      finalFees: member.finalFees ? Number(member.finalFees) : undefined,
      // PT Addon Fields from Member table
      hasPTAddon: member.hasPTAddon,
      ptPackageName: member.ptPackageName || undefined,
      ptPackageFees: member.ptPackageFees ? Number(member.ptPackageFees) : undefined,
      ptMaxDiscount: member.ptMaxDiscount ? Number(member.ptMaxDiscount) : undefined,
      ptAfterDiscount: member.ptAfterDiscount ? Number(member.ptAfterDiscount) : undefined,
      ptExtraDiscount: member.ptExtraDiscount ? Number(member.ptExtraDiscount) : undefined,
      ptFinalFees: member.ptFinalFees ? Number(member.ptFinalFees) : undefined,
      // PT Session Info from PTMember table
      ptInfo,
      createdAt: member.createdAt,
    };
  }

  async createMember(gymId: string, data: CreateMemberRequest, files?: { memberPhoto?: string; idProofDocument?: string }): Promise<Member> {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictException('User with this email already exists');

    const gym = await prisma.gym.findUnique({ where: { id: gymId } });
    if (!gym) throw new NotFoundException('Gym not found');

    const memberRole = await prisma.rolemaster.findFirst({ where: { rolename: 'MEMBER' } });
    if (!memberRole) throw new NotFoundException('MEMBER role not found');

    // Generate unique auto-increment member ID by finding maximum existing ID
    const allMembers = await prisma.member.findMany({
      where: { gymId, memberId: { not: null } },
      select: { memberId: true }
    });

    // Extract numeric values and find the maximum
    let maxId = 1000; // Default starting point (first ID will be 1001)
    for (const m of allMembers) {
      if (m.memberId) {
        const numericId = parseInt(m.memberId, 10);
        if (!isNaN(numericId) && numericId > maxId) {
          maxId = numericId;
        }
      }
    }
    const nextMemberId = String(maxId + 1);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const membershipEnd = data.membershipEndDate
      ? new Date(data.membershipEndDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: `${data.firstName} ${data.lastName}`,
          roleId: memberRole.Id,
        },
      });

      const member = await tx.member.create({
        data: {
          userId: user.id,
          gymId,
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: hashedPassword, // Store hashed password in Member table
          memberId: nextMemberId,
          phone: data.phone,
          altContactNo: data.altContactNo,
          address: data.address,
          gender: data.gender,
          occupation: data.occupation,
          maritalStatus: data.maritalStatus,
          bloodGroup: data.bloodGroup,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          anniversaryDate: data.anniversaryDate ? new Date(data.anniversaryDate) : undefined,
          emergencyContact: data.emergencyContact,
          healthNotes: data.healthNotes,
          idProofType: data.idProofType,
          idProofDocument: files?.idProofDocument,
          memberPhoto: files?.memberPhoto,
          smsFacility: data.smsFacility ?? true,
          membershipStart: data.membershipStartDate ? new Date(data.membershipStartDate) : new Date(),
          membershipEnd,
          coursePackageId: data.coursePackageId,
          packageFees: data.packageFees,
          maxDiscount: data.maxDiscount,
          afterDiscount: data.afterDiscount,
          extraDiscount: data.extraDiscount,
          finalFees: data.finalFees,
        },
        include: {
          user: { select: { id: true, name: true, email: true, isActive: true } }
        }
      });

      // Assign trainer if provided
      if (data.trainerId) {
        await tx.memberTrainerAssignment.create({
          data: {
            memberId: member.id,
            trainerId: data.trainerId,
          }
        });
      }

      return member;
    });

    return {
      id: result.id,
      memberId: result.memberId || undefined,
      email: result.email || result.user.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      altContactNo: data.altContactNo,
      address: data.address,
      gender: data.gender,
      occupation: data.occupation,
      maritalStatus: data.maritalStatus,
      bloodGroup: data.bloodGroup,
      dateOfBirth: result.dateOfBirth || undefined,
      anniversaryDate: result.anniversaryDate || undefined,
      emergencyContact: data.emergencyContact,
      healthNotes: data.healthNotes,
      idProofType: data.idProofType,
      idProofDocument: result.idProofDocument || undefined,
      memberPhoto: result.memberPhoto || undefined,
      smsFacility: result.smsFacility,
      isActive: result.isActive,
      gymId: result.gymId,
      trainerId: data.trainerId,
      memberType: result.memberType as 'REGULAR' | 'PT',
      membershipStartDate: result.membershipStart,
      membershipEndDate: result.membershipEnd,
      coursePackageId: result.coursePackageId || undefined,
      packageFees: result.packageFees ? Number(result.packageFees) : undefined,
      maxDiscount: result.maxDiscount ? Number(result.maxDiscount) : undefined,
      afterDiscount: result.afterDiscount ? Number(result.afterDiscount) : undefined,
      extraDiscount: result.extraDiscount ? Number(result.extraDiscount) : undefined,
      finalFees: result.finalFees ? Number(result.finalFees) : undefined,
      createdAt: result.createdAt,
    };
  }

  async updateMember(gymId: string, memberId: string, data: UpdateMemberRequest, files?: { memberPhoto?: string; idProofDocument?: string }): Promise<Member> {
    const existingMember = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: { user: true }
    });
    if (!existingMember) throw new NotFoundException('Member not found');

    const result = await prisma.$transaction(async (tx) => {
      // Update user name if firstName or lastName provided
      if (data.firstName || data.lastName) {
        const currentName = existingMember.user.name.split(' ');
        const newFirst = data.firstName || currentName[0];
        const newLast = data.lastName || currentName.slice(1).join(' ');
        await tx.user.update({
          where: { id: existingMember.userId },
          data: { name: `${newFirst} ${newLast}` }
        });
      }

      const updateData: any = {};
      // Sync name to Member table
      if (data.firstName || data.lastName) {
        const currentName = existingMember.user.name.split(' ');
        const newFirst = data.firstName || currentName[0];
        const newLast = data.lastName || currentName.slice(1).join(' ');
        updateData.name = `${newFirst} ${newLast}`;
      }
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.altContactNo !== undefined) updateData.altContactNo = data.altContactNo;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.occupation !== undefined) updateData.occupation = data.occupation;
      if (data.maritalStatus !== undefined) updateData.maritalStatus = data.maritalStatus;
      if (data.bloodGroup !== undefined) updateData.bloodGroup = data.bloodGroup;
      if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
      if (data.anniversaryDate !== undefined) updateData.anniversaryDate = data.anniversaryDate ? new Date(data.anniversaryDate) : null;
      if (data.emergencyContact !== undefined) updateData.emergencyContact = data.emergencyContact;
      if (data.healthNotes !== undefined) updateData.healthNotes = data.healthNotes;
      if (data.idProofType !== undefined) updateData.idProofType = data.idProofType;
      if (data.smsFacility !== undefined) updateData.smsFacility = data.smsFacility;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.memberType !== undefined) updateData.memberType = data.memberType;
      if (data.membershipStartDate) updateData.membershipStart = new Date(data.membershipStartDate);
      if (data.membershipEndDate) updateData.membershipEnd = new Date(data.membershipEndDate);

      // Handle fee-related fields
      if (data.coursePackageId !== undefined) updateData.coursePackageId = data.coursePackageId;
      if (data.packageFees !== undefined) updateData.packageFees = data.packageFees;
      if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount;
      if (data.afterDiscount !== undefined) updateData.afterDiscount = data.afterDiscount;
      if (data.extraDiscount !== undefined) updateData.extraDiscount = data.extraDiscount;
      if (data.finalFees !== undefined) updateData.finalFees = data.finalFees;

      // Handle file uploads
      if (files?.memberPhoto) updateData.memberPhoto = files.memberPhoto;
      if (files?.idProofDocument) updateData.idProofDocument = files.idProofDocument;

      // Generate unique memberId if it doesn't exist
      if (!existingMember.memberId) {
        // Find all existing member IDs for this gym and get the maximum numeric value
        const allMembers = await tx.member.findMany({
          where: { gymId, memberId: { not: null } },
          select: { memberId: true }
        });

        // Extract numeric values and find the maximum
        let maxId = 1000; // Default starting point
        for (const m of allMembers) {
          if (m.memberId) {
            const numericId = parseInt(m.memberId, 10);
            if (!isNaN(numericId) && numericId > maxId) {
              maxId = numericId;
            }
          }
        }

        // Generate next unique ID
        const nextMemberId = String(maxId + 1);
        updateData.memberId = nextMemberId;
      }

      const member = await tx.member.update({
        where: { id: memberId },
        data: updateData,
        include: {
          user: { select: { id: true, name: true, email: true, isActive: true } },
          trainerAssignments: {
            where: { isActive: true },
            take: 1
          }
        }
      });

      // Update trainer assignment if provided
      if (data.trainerId) {
        // Deactivate old assignment
        await tx.memberTrainerAssignment.updateMany({
          where: { memberId, isActive: true },
          data: { isActive: false }
        });
        // Create new assignment
        await tx.memberTrainerAssignment.create({
          data: { memberId, trainerId: data.trainerId }
        });
      }

      return member;
    });

    return {
      id: result.id,
      memberId: result.memberId || undefined,
      email: result.email || result.user.email,
      firstName: (result.name || result.user.name).split(' ')[0] || result.user.name,
      lastName: (result.name || result.user.name).split(' ').slice(1).join(' ') || '',
      phone: result.phone || undefined,
      altContactNo: result.altContactNo || undefined,
      address: result.address || undefined,
      gender: result.gender || undefined,
      occupation: result.occupation || undefined,
      maritalStatus: result.maritalStatus || undefined,
      bloodGroup: result.bloodGroup || undefined,
      dateOfBirth: result.dateOfBirth || undefined,
      anniversaryDate: result.anniversaryDate || undefined,
      emergencyContact: result.emergencyContact || undefined,
      healthNotes: result.healthNotes || undefined,
      idProofType: result.idProofType || undefined,
      idProofDocument: result.idProofDocument || undefined,
      memberPhoto: result.memberPhoto || undefined,
      smsFacility: result.smsFacility,
      isActive: result.isActive,
      gymId: result.gymId,
      trainerId: data.trainerId || result.trainerAssignments[0]?.trainerId,
      memberType: result.memberType as 'REGULAR' | 'PT',
      membershipStartDate: result.membershipStart,
      membershipEndDate: result.membershipEnd,
      coursePackageId: result.coursePackageId || undefined,
      packageFees: result.packageFees ? Number(result.packageFees) : undefined,
      maxDiscount: result.maxDiscount ? Number(result.maxDiscount) : undefined,
      afterDiscount: result.afterDiscount ? Number(result.afterDiscount) : undefined,
      extraDiscount: result.extraDiscount ? Number(result.extraDiscount) : undefined,
      finalFees: result.finalFees ? Number(result.finalFees) : undefined,
      createdAt: result.createdAt,
    };
  }

  async deleteMember(gymId: string, memberId: string): Promise<void> {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId }
    });
    if (!member) throw new NotFoundException('Member not found');

    // Soft delete - set isActive to false
    await prisma.member.update({
      where: { id: memberId },
      data: { isActive: false }
    });
  }

  /**
   * Reset member password - generates a new temporary password
   * The member should change this password on their next login
   */
  async resetMemberPassword(gymId: string, memberId: string): Promise<{ memberId: string; email: string; temporaryPassword: string; message: string }> {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: { user: true }
    });

    if (!member) throw new NotFoundException('Member not found');

    // Generate a temporary password
    const temporaryPassword = generateTempPassword(12);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Update both the User table and Member table with hashed password
    await prisma.$transaction(async (tx) => {
      // Update hashed password in User table for authentication
      await tx.user.update({
        where: { id: member.userId },
        data: { password: hashedPassword }
      });

      // Update hashed password in Member table
      await tx.member.update({
        where: { id: memberId },
        data: { password: hashedPassword }
      });

      // Log password reset in PasswordResetHistory
      await tx.passwordResetHistory.create({
        data: {
          userId: member.userId,
          email: member.user.email,
          roleId: member.user.roleId || undefined,
          roleName: 'MEMBER',
          resetBy: member.userId,
          resetByEmail: member.user.email,
          resetMethod: 'OWNER_RESET',
          targetTable: 'MEMBER',
          gymId: gymId,
        },
      });
    });

    return {
      memberId: member.id,
      email: member.user.email,
      temporaryPassword,
      message: 'Password has been reset. Please share this temporary password securely with the member. They should change it on their next login.'
    };
  }

  async toggleMemberStatus(gymId: string, memberId: string): Promise<Member> {
    const existingMember = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        trainerAssignments: {
          where: { isActive: true },
          include: { trainer: { include: { user: true } } },
          take: 1
        }
      }
    });
    if (!existingMember) throw new NotFoundException('Member not found');

    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: { isActive: !existingMember.isActive },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        trainerAssignments: {
          where: { isActive: true },
          include: { trainer: { include: { user: true } } },
          take: 1
        }
      }
    });

    const activeTrainer = updatedMember.trainerAssignments[0]?.trainer;
    return {
      id: updatedMember.id,
      memberId: updatedMember.memberId || undefined,
      email: updatedMember.email || updatedMember.user.email,
      firstName: (updatedMember.name || updatedMember.user.name).split(' ')[0] || updatedMember.user.name,
      lastName: (updatedMember.name || updatedMember.user.name).split(' ').slice(1).join(' ') || '',
      phone: updatedMember.phone || undefined,
      altContactNo: updatedMember.altContactNo || undefined,
      address: updatedMember.address || undefined,
      gender: updatedMember.gender || undefined,
      occupation: updatedMember.occupation || undefined,
      maritalStatus: updatedMember.maritalStatus || undefined,
      bloodGroup: updatedMember.bloodGroup || undefined,
      dateOfBirth: updatedMember.dateOfBirth || undefined,
      anniversaryDate: updatedMember.anniversaryDate || undefined,
      emergencyContact: updatedMember.emergencyContact || undefined,
      healthNotes: updatedMember.healthNotes || undefined,
      idProofType: updatedMember.idProofType || undefined,
      idProofDocument: updatedMember.idProofDocument || undefined,
      memberPhoto: updatedMember.memberPhoto || undefined,
      smsFacility: updatedMember.smsFacility,
      isActive: updatedMember.isActive,
      gymId: updatedMember.gymId,
      trainerId: activeTrainer?.id,
      memberType: updatedMember.memberType as 'REGULAR' | 'PT',
      membershipStartDate: updatedMember.membershipStart,
      membershipEndDate: updatedMember.membershipEnd,
      coursePackageId: updatedMember.coursePackageId || undefined,
      packageFees: updatedMember.packageFees ? Number(updatedMember.packageFees) : undefined,
      maxDiscount: updatedMember.maxDiscount ? Number(updatedMember.maxDiscount) : undefined,
      afterDiscount: updatedMember.afterDiscount ? Number(updatedMember.afterDiscount) : undefined,
      extraDiscount: updatedMember.extraDiscount ? Number(updatedMember.extraDiscount) : undefined,
      finalFees: updatedMember.finalFees ? Number(updatedMember.finalFees) : undefined,
      createdAt: updatedMember.createdAt,
    };
  }

  // Diet Plans
  async getDietPlans(gymId: string, params: PaginationParams): Promise<{ plans: DietPlan[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where = {
      gymId,
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    };

    const [dbPlans, total] = await Promise.all([
      prisma.dietPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.dietPlan.count({ where }),
    ]);

    const plans: DietPlan[] = dbPlans.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      meals: p.meals as any[],
      totalCalories: p.calories || undefined,
      isActive: p.isActive,
      gymId: p.gymId,
      createdAt: p.createdAt,
    }));

    return { plans, total };
  }

  async getDietPlanById(gymId: string, planId: string): Promise<DietPlan> {
    const plan = await prisma.dietPlan.findFirst({ where: { id: planId, gymId } });
    if (!plan) throw new NotFoundException('Diet plan not found');
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || undefined,
      meals: plan.meals as any[],
      totalCalories: plan.calories || undefined,
      isActive: plan.isActive,
      gymId: plan.gymId,
      createdAt: plan.createdAt,
    };
  }

  async createDietPlan(gymId: string, data: CreateDietPlanRequest): Promise<DietPlan> {
    const plan = await prisma.dietPlan.create({
      data: {
        name: data.name,
        description: data.description,
        meals: data.meals || [],
        calories: data.totalCalories,
        isActive: data.isActive ?? true,
        gymId,
      },
    });
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || undefined,
      meals: plan.meals as any[],
      totalCalories: plan.calories || undefined,
      isActive: plan.isActive,
      gymId: plan.gymId,
      createdAt: plan.createdAt,
    };
  }

  async updateDietPlan(gymId: string, planId: string, data: UpdateDietPlanRequest): Promise<DietPlan> {
    await this.getDietPlanById(gymId, planId);

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.meals) updateData.meals = data.meals;
    if (data.totalCalories) updateData.calories = data.totalCalories;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const plan = await prisma.dietPlan.update({
      where: { id: planId },
      data: updateData,
    });
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || undefined,
      meals: plan.meals as any[],
      totalCalories: plan.calories || undefined,
      isActive: plan.isActive,
      gymId: plan.gymId,
      createdAt: plan.createdAt,
    };
  }

  async deleteDietPlan(gymId: string, planId: string): Promise<void> {
    await this.getDietPlanById(gymId, planId);
    await prisma.dietPlan.delete({ where: { id: planId } });
  }

  // Exercise Plans
  async getExercisePlans(gymId: string, params: PaginationParams): Promise<{ plans: ExercisePlan[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where = {
      gymId,
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    };

    const [dbPlans, total] = await Promise.all([
      prisma.exercisePlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignments: {
            where: { isActive: true },
            include: {
              member: {
                include: {
                  user: { select: { name: true, email: true } },
                },
              },
            },
          },
          _count: {
            select: { assignments: { where: { isActive: true } } },
          },
        },
      }),
      prisma.exercisePlan.count({ where }),
    ]);

    const plans = dbPlans.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      type: p.type || undefined,
      exercises: p.exercises as any,
      durationMinutes: undefined,
      difficulty: p.type || undefined,
      isActive: p.isActive,
      gymId: p.gymId,
      createdAt: p.createdAt,
      _count: { assignments: p._count.assignments },
      assignedMembers: p.assignments.map((a) => ({
        memberExerciseId: a.id,
        memberId: a.member.id,
        memberCode: a.member.memberId || '',
        memberName: a.member.user.name,
        memberEmail: a.member.user.email || '',
        mobileNo: a.member.phone || '',
        memberType: a.member.memberType,
        hasPTAddon: a.member.hasPTAddon,
        startDate: a.startDate,
        endDate: a.endDate,
      })),
    }));

    return { plans, total };
  }

  async getExercisePlanById(gymId: string, planId: string): Promise<ExercisePlan> {
    const plan = await prisma.exercisePlan.findFirst({ where: { id: planId, gymId } });
    if (!plan) throw new NotFoundException('Exercise plan not found');
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || undefined,
      exercises: plan.exercises as any[],
      durationMinutes: undefined,
      difficulty: plan.type || undefined,
      isActive: plan.isActive,
      gymId: plan.gymId,
      createdAt: plan.createdAt,
    };
  }

  async createExercisePlan(gymId: string, data: CreateExercisePlanRequest): Promise<ExercisePlan> {
    const plan = await prisma.exercisePlan.create({
      data: {
        name: data.name,
        description: data.description,
        exercises: data.exercises || [],
        type: data.difficulty,
        isActive: data.isActive ?? true,
        gymId,
      },
    });
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || undefined,
      exercises: plan.exercises as any[],
      durationMinutes: data.durationMinutes,
      difficulty: plan.type || undefined,
      isActive: plan.isActive,
      gymId: plan.gymId,
      createdAt: plan.createdAt,
    };
  }

  async updateExercisePlan(gymId: string, planId: string, data: UpdateExercisePlanRequest): Promise<ExercisePlan> {
    await this.getExercisePlanById(gymId, planId);

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.exercises) updateData.exercises = data.exercises;
    if (data.difficulty) updateData.type = data.difficulty;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const plan = await prisma.exercisePlan.update({
      where: { id: planId },
      data: updateData,
    });
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || undefined,
      exercises: plan.exercises as any[],
      durationMinutes: data.durationMinutes,
      difficulty: plan.type || undefined,
      isActive: plan.isActive,
      gymId: plan.gymId,
      createdAt: plan.createdAt,
    };
  }

  async deleteExercisePlan(gymId: string, planId: string): Promise<void> {
    await this.getExercisePlanById(gymId, planId);
    await prisma.exercisePlan.delete({ where: { id: planId } });
  }

  async toggleExercisePlanStatus(gymId: string, planId: string): Promise<ExercisePlan> {
    const plan = await this.getExercisePlanById(gymId, planId);
    const updated = await prisma.exercisePlan.update({
      where: { id: planId },
      data: { isActive: !plan.isActive },
    });
    return {
      id: updated.id,
      name: updated.name,
      description: updated.description || undefined,
      exercises: updated.exercises as any[],
      durationMinutes: undefined,
      difficulty: updated.type || undefined,
      isActive: updated.isActive,
      gymId: updated.gymId,
      createdAt: updated.createdAt,
    };
  }

  async bulkAssignExercisePlan(
    gymId: string,
    userId: string,
    data: {
      memberIds: string[];
      exercisePlanId: string;
      startDate: string;
      endDate?: string;
      notes?: string;
    }
  ): Promise<{ assignedCount: number; results: any[] }> {
    // Validate exercise plan exists and belongs to gym
    const exercisePlan = await prisma.exercisePlan.findFirst({
      where: { id: data.exercisePlanId, gymId },
    });
    if (!exercisePlan) {
      throw new NotFoundException('Exercise plan not found');
    }

    // Validate all members belong to this gym
    const members = await prisma.member.findMany({
      where: {
        id: { in: data.memberIds },
        gymId,
        isActive: true,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (members.length === 0) {
      throw new BadRequestException('No valid members found');
    }

    const results: any[] = [];
    const startDate = new Date(data.startDate);
    const endDate = data.endDate ? new Date(data.endDate) : undefined;

    // Deactivate existing assignments for these members to this plan
    await prisma.memberExerciseAssignment.updateMany({
      where: {
        memberId: { in: members.map((m) => m.id) },
        exercisePlanId: data.exercisePlanId,
        isActive: true,
      },
      data: { isActive: false },
    });

    // Create new assignments for all members
    for (const member of members) {
      const assignment = await prisma.memberExerciseAssignment.create({
        data: {
          memberId: member.id,
          exercisePlanId: data.exercisePlanId,
          startDate,
          endDate,
          isActive: true,
        },
      });

      results.push({
        id: assignment.id,
        memberId: member.id,
        memberName: member.user.name,
        memberEmail: member.user.email,
        exercisePlanId: data.exercisePlanId,
        exercisePlanName: exercisePlan.name,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        isActive: assignment.isActive,
        assignedAt: assignment.assignedAt,
      });
    }

    return { assignedCount: results.length, results };
  }

  async bulkRemoveExercisePlanAssignments(
    gymId: string,
    memberExerciseIds: string[]
  ): Promise<{ deletedCount: number; deletedIds: string[] }> {
    if (!memberExerciseIds || memberExerciseIds.length === 0) {
      throw new BadRequestException('No assignment IDs provided');
    }

    // Get assignments to validate they belong to this gym's exercise plans
    const assignments = await prisma.memberExerciseAssignment.findMany({
      where: {
        id: { in: memberExerciseIds },
        isActive: true,
      },
      include: {
        exercisePlan: { select: { gymId: true } },
      },
    });

    // Filter to only assignments that belong to this gym
    const validAssignments = assignments.filter((a) => a.exercisePlan.gymId === gymId);

    if (validAssignments.length === 0) {
      throw new BadRequestException('No valid assignments found to remove');
    }

    const validIds = validAssignments.map((a) => a.id);

    // Deactivate the assignments (soft delete)
    await prisma.memberExerciseAssignment.updateMany({
      where: { id: { in: validIds } },
      data: { isActive: false },
    });

    return { deletedCount: validIds.length, deletedIds: validIds };
  }

  // Assign Plans
  async assignDietPlan(gymId: string, data: AssignPlanRequest): Promise<void> {
    await this.getMemberById(gymId, data.memberId);
    await this.getDietPlanById(gymId, data.planId);

    await prisma.memberDietAssignment.create({
      data: {
        memberId: data.memberId,
        dietPlanId: data.planId,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async assignExercisePlan(gymId: string, data: AssignPlanRequest): Promise<void> {
    await this.getMemberById(gymId, data.memberId);
    await this.getExercisePlanById(gymId, data.planId);

    await prisma.memberExerciseAssignment.create({
      data: {
        memberId: data.memberId,
        exercisePlanId: data.planId,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async assignTrainer(gymId: string, memberId: string, trainerId: string): Promise<Member> {
    const member = await this.getMemberById(gymId, memberId);
    await this.getTrainerById(gymId, trainerId);

    // Deactivate old assignment
    await prisma.memberTrainerAssignment.updateMany({
      where: { memberId, isActive: true },
      data: { isActive: false }
    });

    // Create new assignment
    await prisma.memberTrainerAssignment.create({
      data: { memberId, trainerId }
    });

    return { ...member, trainerId };
  }


  // =============================================
  // PT Member Methods
  // =============================================

  async getPTMembers(gymId: string, params: PaginationParams): Promise<{ ptMembers: PTMember[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = { gymId };
    if (search) {
      where.OR = [
        { member: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { member: { user: { email: { contains: search, mode: 'insensitive' } } } },
        { member: { phone: { contains: search, mode: 'insensitive' } } },
        { member: { memberId: { contains: search, mode: 'insensitive' } } },
        { trainer: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { packageName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [ptMemberRecords, total] = await Promise.all([
      prisma.pTMember.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          member: { include: { user: { select: { name: true, email: true } } } },
          trainer: { include: { user: { select: { name: true } } } },
        },
      }),
      prisma.pTMember.count({ where }),
    ]);

    const ptMembers: PTMember[] = ptMemberRecords.map((pt) => ({
      id: pt.id,
      memberId: pt.memberId,
      memberMemberId: pt.member.memberId || undefined,
      memberName: pt.member.user.name,
      memberEmail: pt.member.user.email,
      memberPhone: pt.member.phone || undefined,
      trainerId: pt.trainerId,
      trainerName: pt.trainer.user.name,
      packageName: pt.packageName,
      sessionsTotal: pt.sessionsTotal,
      sessionsUsed: pt.sessionsUsed,
      sessionsRemaining: pt.sessionsTotal - pt.sessionsUsed,
      sessionDuration: pt.sessionDuration,
      startDate: pt.startDate,
      endDate: pt.endDate || undefined,
      goals: pt.goals || undefined,
      notes: pt.notes || undefined,
      isActive: pt.isActive,
      gymId: pt.gymId,
      createdAt: pt.createdAt,
      createdBy: pt.createdBy || undefined,
      updatedBy: pt.updatedBy || undefined,
    }));

    return { ptMembers, total };
  }

  async getPTMemberById(gymId: string, ptMemberId: string): Promise<PTMember> {
    const pt = await prisma.pTMember.findFirst({
      where: { id: ptMemberId, gymId },
      include: {
        member: { include: { user: { select: { name: true, email: true } } } },
        trainer: { include: { user: { select: { name: true } } } },
      },
    });

    if (!pt) throw new NotFoundException('PT Member not found');

    return {
      id: pt.id,
      memberId: pt.memberId,
      memberMemberId: pt.member.memberId || undefined,
      memberName: pt.member.user.name,
      memberEmail: pt.member.user.email,
      memberPhone: pt.member.phone || undefined,
      trainerId: pt.trainerId,
      trainerName: pt.trainer.user.name,
      packageName: pt.packageName,
      sessionsTotal: pt.sessionsTotal,
      sessionsUsed: pt.sessionsUsed,
      sessionsRemaining: pt.sessionsTotal - pt.sessionsUsed,
      sessionDuration: pt.sessionDuration,
      startDate: pt.startDate,
      endDate: pt.endDate || undefined,
      goals: pt.goals || undefined,
      notes: pt.notes || undefined,
      isActive: pt.isActive,
      gymId: pt.gymId,
      createdAt: pt.createdAt,
      createdBy: pt.createdBy || undefined,
      updatedBy: pt.updatedBy || undefined,
    };
  }

  /**
   * Get all PT members assigned to a specific trainer
   * Search by member name, email, phone, or memberId
   */
  async getPTMembersByTrainerId(
    gymId: string,
    trainerId: string,
    params: PaginationParams
  ): Promise<{ ptMembers: TrainerPTMemberSummary[]; total: number; trainer: { id: string; name: string } }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    // Verify trainer exists and belongs to gym
    const trainer = await prisma.trainer.findFirst({
      where: { id: trainerId, gymId },
      include: { user: { select: { name: true } } },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    // Build where clause
    const where: any = {
      gymId,
      trainerId,
      isActive: true,
    };

    // Add search conditions if search term provided
    if (search) {
      where.OR = [
        { member: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { member: { user: { email: { contains: search, mode: 'insensitive' } } } },
        { member: { phone: { contains: search, mode: 'insensitive' } } },
        { member: { memberId: { contains: search, mode: 'insensitive' } } },
        { packageName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [ptMemberRecords, total] = await Promise.all([
      prisma.pTMember.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          member: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          trainer: { include: { user: { select: { name: true } } } },
        },
      }),
      prisma.pTMember.count({ where }),
    ]);

    const ptMembers = ptMemberRecords.map((pt) => ({
      id: pt.id,
      memberId: pt.memberId,
      memberMemberId: pt.member.memberId || undefined,
      memberName: pt.member.user.name,
      memberEmail: pt.member.user.email,
      memberPhone: pt.member.phone || undefined,
      trainerId: pt.trainerId,
      trainerName: pt.trainer.user.name,
      packageName: pt.packageName,
      startDate: pt.startDate,
      endDate: pt.endDate || undefined,
      goals: pt.goals || undefined,
      notes: pt.notes || undefined,
      isActive: pt.isActive,
      gymId: pt.gymId,
      createdAt: pt.createdAt,
    }));

    return {
      ptMembers,
      total,
      trainer: {
        id: trainer.id,
        name: trainer.user.name,
      },
    };
  }

  async createPTMember(gymId: string, userId: string, data: CreatePTMemberRequest): Promise<PTMember> {
    // Verify member exists and belongs to gym
    const member = await prisma.member.findFirst({ where: { id: data.memberId, gymId } });
    if (!member) throw new NotFoundException('Member not found');

    // Verify trainer exists and belongs to gym
    const trainer = await prisma.trainer.findFirst({ where: { id: data.trainerId, gymId } });
    if (!trainer) throw new NotFoundException('Trainer not found');

    // Check if member already has active PT membership
    const existingPT = await prisma.pTMember.findFirst({ where: { memberId: data.memberId, isActive: true } });
    if (existingPT) throw new ConflictException('Member already has an active PT membership');

    // Update member type to PT
    await prisma.member.update({ where: { id: data.memberId }, data: { memberType: 'PT', updatedBy: userId } });

    const pt = await prisma.pTMember.create({
      data: {
        memberId: data.memberId,
        trainerId: data.trainerId,
        packageName: data.packageName,
        sessionsTotal: data.sessionsTotal,
        sessionDuration: data.sessionDuration || 60,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        goals: data.goals,
        notes: data.notes,
        gymId,
        createdBy: userId,
      },
      include: {
        member: { include: { user: { select: { name: true, email: true } } } },
        trainer: { include: { user: { select: { name: true } } } },
      },
    });

    return {
      id: pt.id,
      memberId: pt.memberId,
      memberName: pt.member.user.name,
      memberEmail: pt.member.user.email,
      trainerId: pt.trainerId,
      trainerName: pt.trainer.user.name,
      packageName: pt.packageName,
      sessionsTotal: pt.sessionsTotal,
      sessionsUsed: pt.sessionsUsed,
      sessionsRemaining: pt.sessionsTotal - pt.sessionsUsed,
      sessionDuration: pt.sessionDuration,
      startDate: pt.startDate,
      endDate: pt.endDate || undefined,
      goals: pt.goals || undefined,
      notes: pt.notes || undefined,
      isActive: pt.isActive,
      gymId: pt.gymId,
      createdAt: pt.createdAt,
      createdBy: pt.createdBy || undefined,
      updatedBy: pt.updatedBy || undefined,
    };
  }

  async updatePTMember(gymId: string, userId: string, ptMemberId: string, data: UpdatePTMemberRequest): Promise<PTMember> {
    const existing = await prisma.pTMember.findFirst({ where: { id: ptMemberId, gymId } });
    if (!existing) throw new NotFoundException('PT Member not found');

    if (data.trainerId) {
      const trainer = await prisma.trainer.findFirst({ where: { id: data.trainerId, gymId } });
      if (!trainer) throw new NotFoundException('Trainer not found');
    }

    const pt = await prisma.pTMember.update({
      where: { id: ptMemberId },
      data: {
        ...(data.trainerId && { trainerId: data.trainerId }),
        ...(data.packageName && { packageName: data.packageName }),
        ...(data.sessionsTotal !== undefined && { sessionsTotal: data.sessionsTotal }),
        ...(data.sessionsUsed !== undefined && { sessionsUsed: data.sessionsUsed }),
        ...(data.sessionDuration && { sessionDuration: data.sessionDuration }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.goals !== undefined && { goals: data.goals }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedBy: userId,
      },
      include: {
        member: { include: { user: { select: { name: true, email: true } } } },
        trainer: { include: { user: { select: { name: true } } } },
      },
    });

    return {
      id: pt.id,
      memberId: pt.memberId,
      memberName: pt.member.user.name,
      memberEmail: pt.member.user.email,
      trainerId: pt.trainerId,
      trainerName: pt.trainer.user.name,
      packageName: pt.packageName,
      sessionsTotal: pt.sessionsTotal,
      sessionsUsed: pt.sessionsUsed,
      sessionsRemaining: pt.sessionsTotal - pt.sessionsUsed,
      sessionDuration: pt.sessionDuration,
      startDate: pt.startDate,
      endDate: pt.endDate || undefined,
      goals: pt.goals || undefined,
      notes: pt.notes || undefined,
      isActive: pt.isActive,
      gymId: pt.gymId,
      createdAt: pt.createdAt,
      createdBy: pt.createdBy || undefined,
      updatedBy: pt.updatedBy || undefined,
    };
  }

  // =============================================
  // Supplement Methods
  // =============================================

  async getSupplements(gymId: string, ptMemberId: string): Promise<Supplement[]> {
    const pt = await prisma.pTMember.findFirst({ where: { id: ptMemberId, gymId } });
    if (!pt) throw new NotFoundException('PT Member not found');

    const supplements = await prisma.supplement.findMany({
      where: { ptMemberId, gymId },
      include: { ptMember: { include: { member: { include: { user: { select: { name: true } } } } } } },
      orderBy: { createdAt: 'desc' },
    });

    return supplements.map((s) => ({
      id: s.id,
      ptMemberId: s.ptMemberId,
      memberName: s.ptMember.member.user.name,
      name: s.name,
      dosage: s.dosage || undefined,
      frequency: s.frequency || undefined,
      timing: s.timing || undefined,
      notes: s.notes || undefined,
      startDate: s.startDate,
      endDate: s.endDate || undefined,
      isActive: s.isActive,
      gymId: s.gymId,
      createdAt: s.createdAt,
      createdBy: s.createdBy || undefined,
      updatedBy: s.updatedBy || undefined,
    }));
  }

  async createSupplement(gymId: string, userId: string, ptMemberId: string, data: CreateSupplementRequest): Promise<Supplement> {
    const pt = await prisma.pTMember.findFirst({
      where: { id: ptMemberId, gymId },
      include: { member: { include: { user: { select: { name: true } } } } },
    });
    if (!pt) throw new NotFoundException('PT Member not found');

    const supplement = await prisma.supplement.create({
      data: {
        ptMemberId,
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        timing: data.timing,
        notes: data.notes,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        gymId,
        createdBy: userId,
      },
    });

    return {
      id: supplement.id,
      ptMemberId: supplement.ptMemberId,
      memberName: pt.member.user.name,
      name: supplement.name,
      dosage: supplement.dosage || undefined,
      frequency: supplement.frequency || undefined,
      timing: supplement.timing || undefined,
      notes: supplement.notes || undefined,
      startDate: supplement.startDate,
      endDate: supplement.endDate || undefined,
      isActive: supplement.isActive,
      gymId: supplement.gymId,
      createdAt: supplement.createdAt,
      createdBy: supplement.createdBy || undefined,
      updatedBy: supplement.updatedBy || undefined,
    };
  }

  async updateSupplement(gymId: string, userId: string, supplementId: string, data: UpdateSupplementRequest): Promise<Supplement> {
    const existing = await prisma.supplement.findFirst({ where: { id: supplementId, gymId } });
    if (!existing) throw new NotFoundException('Supplement not found');

    const supplement = await prisma.supplement.update({
      where: { id: supplementId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.dosage !== undefined && { dosage: data.dosage }),
        ...(data.frequency !== undefined && { frequency: data.frequency }),
        ...(data.timing !== undefined && { timing: data.timing }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedBy: userId,
      },
      include: { ptMember: { include: { member: { include: { user: { select: { name: true } } } } } } },
    });

    return {
      id: supplement.id,
      ptMemberId: supplement.ptMemberId,
      memberName: supplement.ptMember.member.user.name,
      name: supplement.name,
      dosage: supplement.dosage || undefined,
      frequency: supplement.frequency || undefined,
      timing: supplement.timing || undefined,
      notes: supplement.notes || undefined,
      startDate: supplement.startDate,
      endDate: supplement.endDate || undefined,
      isActive: supplement.isActive,
      gymId: supplement.gymId,
      createdAt: supplement.createdAt,
      createdBy: supplement.createdBy || undefined,
      updatedBy: supplement.updatedBy || undefined,
    };
  }

  // =============================================
  // Member Diet Plan Methods (per member)
  // =============================================

  async getMemberDietPlans(gymId: string, memberId: string): Promise<MemberDietPlan[]> {
    const member = await prisma.member.findFirst({ where: { id: memberId, gymId } });
    if (!member) throw new NotFoundException('Member not found');

    const plans = await prisma.memberDietPlan.findMany({
      where: { memberId, gymId },
      include: { member: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    return plans.map((p) => ({
      id: p.id,
      memberId: p.memberId,
      memberName: p.member.user.name,
      planName: p.planName,
      description: p.description || undefined,
      calories: p.calories || undefined,
      meals: p.meals,
      startDate: p.startDate,
      endDate: p.endDate || undefined,
      isActive: p.isActive,
      gymId: p.gymId,
      createdAt: p.createdAt,
      createdBy: p.createdBy || undefined,
      updatedBy: p.updatedBy || undefined,
    }));
  }

  async createMemberDietPlan(gymId: string, userId: string, memberId: string, data: CreateMemberDietPlanRequest): Promise<MemberDietPlan> {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: { user: { select: { name: true } } },
    });
    if (!member) throw new NotFoundException('Member not found');

    // Deactivate existing active diet plans
    await prisma.memberDietPlan.updateMany({
      where: { memberId, isActive: true },
      data: { isActive: false },
    });

    const plan = await prisma.memberDietPlan.create({
      data: {
        memberId,
        planName: data.planName,
        description: data.description,
        calories: data.calories,
        meals: data.meals,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        gymId,
        createdBy: userId,
      },
    });

    return {
      id: plan.id,
      memberId: plan.memberId,
      memberName: member.user.name,
      planName: plan.planName,
      description: plan.description || undefined,
      calories: plan.calories || undefined,
      meals: plan.meals,
      startDate: plan.startDate,
      endDate: plan.endDate || undefined,
      isActive: plan.isActive,
      gymId: plan.gymId,
      createdAt: plan.createdAt,
      createdBy: plan.createdBy || undefined,
      updatedBy: plan.updatedBy || undefined,
    };
  }

  async updateMemberDietPlan(gymId: string, userId: string, planId: string, data: UpdateMemberDietPlanRequest): Promise<MemberDietPlan> {
    const existing = await prisma.memberDietPlan.findFirst({ where: { id: planId, gymId } });
    if (!existing) throw new NotFoundException('Diet plan not found');

    const plan = await prisma.memberDietPlan.update({
      where: { id: planId },
      data: {
        ...(data.planName && { planName: data.planName }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.calories !== undefined && { calories: data.calories }),
        ...(data.meals && { meals: data.meals }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedBy: userId,
      },
      include: { member: { include: { user: { select: { name: true } } } } },
    });

    return {
      id: plan.id,
      memberId: plan.memberId,
      memberName: plan.member.user.name,
      planName: plan.planName,
      description: plan.description || undefined,
      calories: plan.calories || undefined,
      meals: plan.meals,
      startDate: plan.startDate,
      endDate: plan.endDate || undefined,
      isActive: plan.isActive,
      gymId: plan.gymId,
      createdAt: plan.createdAt,
      createdBy: plan.createdBy || undefined,
      updatedBy: plan.updatedBy || undefined,
    };
  }

  // =============================================
  // Inquiry Methods
  // =============================================

  async getInquiries(gymId: string, params: PaginationParams): Promise<{ inquiries: Inquiry[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc', status } = params;
    const skip = (page - 1) * limit;

    const where: any = { gymId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [inquiryRecords, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.inquiry.count({ where }),
    ]);

    const inquiries: Inquiry[] = inquiryRecords.map((i) => ({
      id: i.id,
      name: i.name,
      email: i.email || undefined,
      phone: i.phone,
      source: i.source as Inquiry['source'],
      interest: i.interest || undefined,
      notes: i.notes || undefined,
      status: i.status as Inquiry['status'],
      followUpDate: i.followUpDate || undefined,
      isActive: i.isActive,
      gymId: i.gymId,
      createdAt: i.createdAt,
      createdBy: i.createdBy || undefined,
      updatedBy: i.updatedBy || undefined,
    }));

    return { inquiries, total };
  }

  async createInquiry(gymId: string, userId: string, data: CreateInquiryRequest): Promise<Inquiry> {
    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source || 'WALK_IN',
        interest: data.interest,
        notes: data.notes,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        gymId,
        createdBy: userId,
      },
    });

    return {
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email || undefined,
      phone: inquiry.phone,
      source: inquiry.source as Inquiry['source'],
      interest: inquiry.interest || undefined,
      notes: inquiry.notes || undefined,
      status: inquiry.status as Inquiry['status'],
      followUpDate: inquiry.followUpDate || undefined,
      isActive: inquiry.isActive,
      gymId: inquiry.gymId,
      createdAt: inquiry.createdAt,
      createdBy: inquiry.createdBy || undefined,
      updatedBy: inquiry.updatedBy || undefined,
    };
  }

  async updateInquiry(gymId: string, userId: string, inquiryId: string, data: UpdateInquiryRequest): Promise<Inquiry> {
    const existing = await prisma.inquiry.findFirst({ where: { id: inquiryId, gymId } });
    if (!existing) throw new NotFoundException('Inquiry not found');

    const inquiry = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.source && { source: data.source }),
        ...(data.interest !== undefined && { interest: data.interest }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status && { status: data.status }),
        ...(data.followUpDate && { followUpDate: new Date(data.followUpDate) }),
        updatedBy: userId,
      },
    });

    return {
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email || undefined,
      phone: inquiry.phone,
      source: inquiry.source as Inquiry['source'],
      interest: inquiry.interest || undefined,
      notes: inquiry.notes || undefined,
      status: inquiry.status as Inquiry['status'],
      followUpDate: inquiry.followUpDate || undefined,
      isActive: inquiry.isActive,
      gymId: inquiry.gymId,
      createdAt: inquiry.createdAt,
      createdBy: inquiry.createdBy || undefined,
      updatedBy: inquiry.updatedBy || undefined,
    };
  }

  // =============================================
  // Report Methods
  // =============================================

  async getMemberReport(gymId: string): Promise<MemberReport> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const [totalMembers, activeMembers, regularMembers, ptMembers, newMembersThisMonth, expiringThisWeek] = await Promise.all([
      prisma.member.count({ where: { gymId } }),
      prisma.member.count({ where: { gymId, membershipStatus: 'ACTIVE', user: { isActive: true } } }),
      prisma.member.count({ where: { gymId, memberType: 'REGULAR' } }),
      prisma.member.count({ where: { gymId, memberType: 'PT' } }),
      prisma.member.count({ where: { gymId, createdAt: { gte: startOfMonth } } }),
      prisma.member.count({ where: { gymId, membershipEnd: { gte: now, lte: sevenDaysFromNow } } }),
    ]);

    // Get members by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const membersByMonthRaw = await prisma.member.groupBy({
      by: ['createdAt'],
      where: { gymId, createdAt: { gte: sixMonthsAgo } },
      _count: true,
    });

    const monthCounts: { [key: string]: number } = {};
    membersByMonthRaw.forEach((m) => {
      const monthKey = `${m.createdAt.getFullYear()}-${String(m.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + m._count;
    });

    const membersByMonth = Object.entries(monthCounts).map(([month, count]) => ({ month, count }));

    return {
      totalMembers,
      activeMembers,
      regularMembers,
      ptMembers,
      newMembersThisMonth,
      expiringThisWeek,
      membersByMonth,
    };
  }

  async getPTProgressReport(gymId: string): Promise<PTProgressReport> {
    const ptMembers = await prisma.pTMember.findMany({
      where: { gymId },
      include: { trainer: { include: { user: { select: { name: true } } } } },
    });

    const totalPTMembers = ptMembers.length;
    const activePTMembers = ptMembers.filter((p) => p.isActive).length;
    const totalSessions = ptMembers.reduce((sum, p) => sum + p.sessionsTotal, 0);
    const completedSessions = ptMembers.reduce((sum, p) => sum + p.sessionsUsed, 0);
    const remainingSessions = totalSessions - completedSessions;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    const trainerCounts: { [key: string]: number } = {};
    ptMembers.forEach((p) => {
      const name = p.trainer.user.name;
      trainerCounts[name] = (trainerCounts[name] || 0) + 1;
    });

    const ptMembersByTrainer = Object.entries(trainerCounts).map(([trainerName, count]) => ({ trainerName, count }));

    return {
      totalPTMembers,
      activePTMembers,
      totalSessions,
      completedSessions,
      remainingSessions,
      completionRate,
      ptMembersByTrainer,
    };
  }

  async getTrainerReport(gymId: string): Promise<TrainerReport> {
    const trainers = await prisma.trainer.findMany({
      where: { gymId },
      include: {
        user: { select: { name: true, isActive: true } },
        ptMembers: true,
      },
    });

    const totalTrainers = trainers.length;
    const activeTrainers = trainers.filter((t) => t.isActive && t.user.isActive).length;
    const trainersWithPTMembers = trainers.filter((t) => t.ptMembers.length > 0).length;

    const trainerWorkload = trainers.map((t) => ({
      trainerName: t.user.name,
      ptMembers: t.ptMembers.filter((p) => p.isActive).length,
      totalSessions: t.ptMembers.reduce((sum, p) => sum + p.sessionsTotal, 0),
    }));

    return {
      totalTrainers,
      activeTrainers,
      trainersWithPTMembers,
      trainerWorkload,
    };
  }

  async getRevenueReport(gymId: string): Promise<RevenueReport> {
    const [totalMembers, ptMembers, regularMembers] = await Promise.all([
      prisma.member.count({ where: { gymId } }),
      prisma.member.count({ where: { gymId, memberType: 'PT' } }),
      prisma.member.count({ where: { gymId, memberType: 'REGULAR' } }),
    ]);

    const membershipsByStatusRaw = await prisma.member.groupBy({
      by: ['membershipStatus'],
      where: { gymId },
      _count: true,
    });

    const membershipsByStatus = membershipsByStatusRaw.map((m) => ({
      status: m.membershipStatus,
      count: m._count,
    }));

    const [totalInquiries, convertedInquiries] = await Promise.all([
      prisma.inquiry.count({ where: { gymId } }),
      prisma.inquiry.count({ where: { gymId, status: 'CONVERTED' } }),
    ]);

    const inquiriesConversionRate = totalInquiries > 0 ? Math.round((convertedInquiries / totalInquiries) * 100) : 0;

    return {
      totalMembers,
      ptMembers,
      regularMembers,
      membershipsByStatus,
      inquiriesConversionRate,
    };
  }

  // Expense Group Master CRUD
  async getExpenseGroups(gymId: string): Promise<ExpenseGroup[]> {
    const expenseGroups = await prisma.expenseGroupMaster.findMany({
      where: { gymId },
      orderBy: { expenseGroupName: 'asc' },
    });

    return expenseGroups;
  }

  async getExpenseGroupById(gymId: string, id: string): Promise<ExpenseGroup> {
    const expenseGroup = await prisma.expenseGroupMaster.findFirst({
      where: { id, gymId },
    });
    if (!expenseGroup) throw new NotFoundException('Expense group not found');
    return expenseGroup;
  }

  async createExpenseGroup(gymId: string, data: CreateExpenseGroupRequest): Promise<ExpenseGroup> {
    // Check if expense group with same name exists for this gym
    const existingExpenseGroup = await prisma.expenseGroupMaster.findFirst({
      where: {
        expenseGroupName: data.expenseGroupName,
        gymId,
      },
    });
    if (existingExpenseGroup) {
      throw new ConflictException('Expense group with this name already exists');
    }

    const expenseGroup = await prisma.expenseGroupMaster.create({
      data: {
        expenseGroupName: data.expenseGroupName,
        gymId,
      },
    });

    return expenseGroup;
  }

  async updateExpenseGroup(gymId: string, id: string, data: UpdateExpenseGroupRequest): Promise<ExpenseGroup> {
    await this.getExpenseGroupById(gymId, id);

    // Check for duplicate name if updating expenseGroupName
    if (data.expenseGroupName) {
      const existingExpenseGroup = await prisma.expenseGroupMaster.findFirst({
        where: {
          expenseGroupName: data.expenseGroupName,
          gymId,
          NOT: { id },
        },
      });
      if (existingExpenseGroup) {
        throw new ConflictException('Expense group with this name already exists');
      }
    }

    const expenseGroup = await prisma.expenseGroupMaster.update({
      where: { id },
      data: {
        expenseGroupName: data.expenseGroupName,
      },
    });

    return expenseGroup;
  }

  async deleteExpenseGroup(gymId: string, id: string): Promise<void> {
    // Hard delete
    await this.getExpenseGroupById(gymId, id);

    // Check if expense group has expenses
    const expenseCount = await prisma.expenseMaster.count({
      where: { expenseGroupId: id, isActive: true },
    });

    if (expenseCount > 0) {
      throw new BadRequestException(
        `Cannot delete expense group. It has ${expenseCount} active expense(s) associated with it.`
      );
    }

    await prisma.expenseGroupMaster.delete({
      where: { id },
    });
  }

  // =============================================
  // Expense Management CRUD
  // =============================================

  /**
   * Create a new expense
   */
  async createExpense(
    gymId: string,
    userId: string,
    data: CreateExpenseRequest,
    attachmentPaths?: string[]
  ): Promise<Expense> {
    // Verify expense group exists and belongs to the gym
    const expenseGroup = await prisma.expenseGroupMaster.findFirst({
      where: { id: data.expenseGroupId, gymId },
    });

    if (!expenseGroup) {
      throw new NotFoundException('Expense group not found');
    }

    const expense = await prisma.expenseMaster.create({
      data: {
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
        name: data.name,
        expenseGroupId: data.expenseGroupId,
        description: data.description,
        paymentMode: data.paymentMode,
        amount: data.amount,
        attachments: attachmentPaths || [],
        createdBy: userId,
        gymId,
      },
      include: {
        expenseGroup: true,
      },
    });

    return {
      id: expense.id,
      expenseDate: expense.expenseDate,
      name: expense.name,
      expenseGroupId: expense.expenseGroupId,
      expenseGroupName: expense.expenseGroup.expenseGroupName,
      description: expense.description || undefined,
      paymentMode: expense.paymentMode as PaymentMode,
      amount: Number(expense.amount),
      attachments: expense.attachments || undefined,
      createdBy: expense.createdBy,
      gymId: expense.gymId,
      isActive: expense.isActive,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  /**
   * Update an expense
   */
  async updateExpense(
    gymId: string,
    expenseId: string,
    data: UpdateExpenseRequest,
    newAttachmentPaths?: string[]
  ): Promise<Expense> {
    // Verify expense exists and belongs to the gym
    const existing = await prisma.expenseMaster.findFirst({
      where: { id: expenseId, gymId },
    });

    if (!existing) {
      throw new NotFoundException('Expense not found');
    }

    // If updating expense group, verify it exists
    if (data.expenseGroupId) {
      const expenseGroup = await prisma.expenseGroupMaster.findFirst({
        where: { id: data.expenseGroupId, gymId },
      });

      if (!expenseGroup) {
        throw new NotFoundException('Expense group not found');
      }
    }

    // Handle attachments update
    let finalAttachments: string[] = [];

    // Helper function to delete attachment file
    const deleteAttachmentFile = (filePath: string | null | undefined): void => {
      if (filePath) {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
          } catch (error) {
            console.error('Error deleting expense attachment:', error);
          }
        }
      }
    };

    // Parse keepAttachments (existing attachments to keep)
    if (data.keepAttachments) {
      const keepAttachmentsArray = typeof data.keepAttachments === 'string'
        ? data.keepAttachments.split(',').filter(Boolean)
        : [];

      // Delete attachments that are not in keepAttachments list
      const attachmentsToDelete = existing.attachments.filter(
        (att: string) => !keepAttachmentsArray.includes(att)
      );

      attachmentsToDelete.forEach((att: string) => deleteAttachmentFile(att));

      finalAttachments = keepAttachmentsArray;
    } else if (newAttachmentPaths && newAttachmentPaths.length > 0) {
      // If new attachments provided but no keepAttachments, delete all old attachments
      existing.attachments.forEach((att: string) => deleteAttachmentFile(att));
      finalAttachments = [];
    } else {
      // Keep existing attachments if no changes
      finalAttachments = existing.attachments;
    }

    // Add new attachments if provided
    if (newAttachmentPaths && newAttachmentPaths.length > 0) {
      finalAttachments = [...finalAttachments, ...newAttachmentPaths];
    }

    const expense = await prisma.expenseMaster.update({
      where: { id: expenseId },
      data: {
        ...(data.expenseDate && { expenseDate: new Date(data.expenseDate) }),
        ...(data.name && { name: data.name }),
        ...(data.expenseGroupId && { expenseGroupId: data.expenseGroupId }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.paymentMode && { paymentMode: data.paymentMode }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        attachments: finalAttachments,
      },
      include: {
        expenseGroup: true,
      },
    });

    return {
      id: expense.id,
      expenseDate: expense.expenseDate,
      name: expense.name,
      expenseGroupId: expense.expenseGroupId,
      expenseGroupName: expense.expenseGroup.expenseGroupName,
      description: expense.description || undefined,
      paymentMode: expense.paymentMode as PaymentMode,
      amount: Number(expense.amount),
      attachments: expense.attachments || undefined,
      createdBy: expense.createdBy,
      gymId: expense.gymId,
      isActive: expense.isActive,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  /**
   * Soft delete an expense
   */
  async softDeleteExpense(gymId: string, expenseId: string, deleteFiles: boolean = true): Promise<void> {
    const expense = await prisma.expenseMaster.findFirst({
      where: { id: expenseId, gymId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Delete attachment files if requested
    if (deleteFiles && expense.attachments && expense.attachments.length > 0) {
      expense.attachments.forEach((filePath: string) => {
        if (filePath) {
          const fullPath = path.join(process.cwd(), filePath);
          if (fs.existsSync(fullPath)) {
            try {
              fs.unlinkSync(fullPath);
            } catch (error) {
              console.error('Error deleting expense attachment:', error);
            }
          }
        }
      });
    }

    await prisma.expenseMaster.update({
      where: { id: expenseId },
      data: { isActive: false },
    });
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(gymId: string, expenseId: string): Promise<Expense> {
    const expense = await prisma.expenseMaster.findFirst({
      where: { id: expenseId, gymId },
      include: {
        expenseGroup: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return {
      id: expense.id,
      expenseDate: expense.expenseDate,
      name: expense.name,
      expenseGroupId: expense.expenseGroupId,
      expenseGroupName: expense.expenseGroup.expenseGroupName,
      description: expense.description || undefined,
      paymentMode: expense.paymentMode as PaymentMode,
      amount: Number(expense.amount),
      attachments: expense.attachments || undefined,
      createdBy: expense.createdBy,
      gymId: expense.gymId,
      isActive: expense.isActive,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  /**
   * List expenses with filters, pagination, and sorting (Report API)
   */
  async getExpenses(gymId: string, params: ExpenseListParams): Promise<ExpenseListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'expenseDate',
      sortOrder = 'desc',
      year,
      dateFrom,
      dateTo,
      expenseGroupId,
      paymentMode,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause with filters
    const where: any = {
      gymId,
      isActive: true,
    };

    // Text search - searches across name and description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { expenseGroup: { expenseGroupName: { contains: search, mode: 'insensitive' as const } } },
      ];
    }

    // Year filter - expenses in that year
    if (year) {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59);
      where.expenseDate = {
        gte: yearStart,
        lte: yearEnd,
      };
    }

    // Date range filters - override year filter if both provided
    if (dateFrom || dateTo) {
      where.expenseDate = {};
      
      if (dateFrom) {
        // Set to start of day (00:00:00.000)
        const fromDateObj = new Date(dateFrom);
        fromDateObj.setHours(0, 0, 0, 0);
        where.expenseDate.gte = fromDateObj;
      }
      
      if (dateTo) {
        // Set to end of day (23:59:59.999)
        const toDateObj = new Date(dateTo);
        toDateObj.setHours(23, 59, 59, 999);
        where.expenseDate.lte = toDateObj;
      }
    }

    // Expense group filter
    if (expenseGroupId) {
      where.expenseGroupId = expenseGroupId;
    }

    // Payment mode filter
    if (paymentMode) {
      where.paymentMode = paymentMode;
    }

    // Execute queries in parallel
    const [expenseRecords, total, totalAmountResult] = await Promise.all([
      prisma.expenseMaster.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          expenseGroup: true,
        },
      }),
      prisma.expenseMaster.count({ where }),
      prisma.expenseMaster.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    const expenses: Expense[] = expenseRecords.map((e) => ({
      id: e.id,
      expenseDate: e.expenseDate,
      name: e.name,
      expenseGroupId: e.expenseGroupId,
      expenseGroupName: e.expenseGroup.expenseGroupName,
      description: e.description || undefined,
      paymentMode: e.paymentMode as PaymentMode,
      amount: Number(e.amount),
      attachments: e.attachments || undefined,
      createdBy: e.createdBy,
      gymId: e.gymId,
      isActive: e.isActive,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

    return {
      expenses,
      total,
      page,
      limit,
      totalAmount: Number(totalAmountResult._sum.amount || 0),
    };
  }

  // Designation Master CRUD
  async getDesignations(gymId: string): Promise<Designation[]> {
    const designations = await prisma.designationMaster.findMany({
      where: { gymId },
      orderBy: { designationName: 'asc' },
    });

    return designations;
  }

  async getDesignationById(gymId: string, id: string): Promise<Designation> {
    const designation = await prisma.designationMaster.findFirst({
      where: { id, gymId },
    });
    if (!designation) throw new NotFoundException('Designation not found');
    return designation;
  }

  async createDesignation(gymId: string, data: CreateDesignationRequest): Promise<Designation> {
    // Check if designation with same name exists for this gym
    const existingDesignation = await prisma.designationMaster.findFirst({
      where: {
        designationName: data.designationName,
        gymId,
      },
    });
    if (existingDesignation) {
      throw new ConflictException('Designation with this name already exists');
    }

    const designation = await prisma.designationMaster.create({
      data: {
        designationName: data.designationName,
        gymId,
      },
    });

    return designation;
  }

  async updateDesignation(gymId: string, id: string, data: UpdateDesignationRequest): Promise<Designation> {
    await this.getDesignationById(gymId, id);

    // Check for duplicate name if updating designationName
    if (data.designationName) {
      const existingDesignation = await prisma.designationMaster.findFirst({
        where: {
          designationName: data.designationName,
          gymId,
          NOT: { id },
        },
      });
      if (existingDesignation) {
        throw new ConflictException('Designation with this name already exists');
      }
    }

    const designation = await prisma.designationMaster.update({
      where: { id },
      data: {
        designationName: data.designationName,
      },
    });

    return designation;
  }

  async deleteDesignation(gymId: string, id: string): Promise<void> {
    // Hard delete
    await this.getDesignationById(gymId, id);

    await prisma.designationMaster.delete({
      where: { id },
    });
  }

  // Body Part Master CRUD
  async getBodyParts(gymId: string): Promise<BodyPart[]> {
    const bodyParts = await prisma.bodyPartMaster.findMany({
      where: { gymId },
      include: {
        exercises: true,
      },
      orderBy: { bodyPartName: 'asc' },
    });

    return bodyParts.map((bp) => ({
      id: bp.id,
      bodyPartName: bp.bodyPartName,
      description: bp.description,
      isActive: bp.isActive,
      gymId: bp.gymId,
      createdAt: bp.createdAt,
      updatedAt: bp.updatedAt,
      exercises: bp.exercises.map((e) => ({
        id: e.id,
        exerciseName: e.exerciseName,
        shortCode: e.shortCode,
        description: e.description,
        isActive: e.isActive,
        gymId: e.gymId,
        bodyPartId: e.bodyPartId,
        bodyPartName: bp.bodyPartName,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
    }));
  }

  async getBodyPartById(gymId: string, id: string): Promise<BodyPart> {
    const bodyPart = await prisma.bodyPartMaster.findFirst({
      where: { id, gymId },
      include: {
        exercises: true,
      },
    });
    if (!bodyPart) throw new NotFoundException('Body part not found');

    return {
      id: bodyPart.id,
      bodyPartName: bodyPart.bodyPartName,
      description: bodyPart.description,
      isActive: bodyPart.isActive,
      gymId: bodyPart.gymId,
      createdAt: bodyPart.createdAt,
      updatedAt: bodyPart.updatedAt,
      exercises: bodyPart.exercises.map((e) => ({
        id: e.id,
        exerciseName: e.exerciseName,
        shortCode: e.shortCode,
        description: e.description,
        isActive: e.isActive,
        gymId: e.gymId,
        bodyPartId: e.bodyPartId,
        bodyPartName: bodyPart.bodyPartName,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
    };
  }

  async createBodyPart(gymId: string, data: CreateBodyPartRequest): Promise<BodyPart> {
    const existingBodyPart = await prisma.bodyPartMaster.findFirst({
      where: {
        bodyPartName: data.bodyPartName,
        gymId,
      },
    });
    if (existingBodyPart) {
      throw new ConflictException('Body part with this name already exists');
    }

    const bodyPart = await prisma.bodyPartMaster.create({
      data: {
        bodyPartName: data.bodyPartName,
        description: data.description,
        gymId,
      },
    });

    return {
      id: bodyPart.id,
      bodyPartName: bodyPart.bodyPartName,
      description: bodyPart.description,
      isActive: bodyPart.isActive,
      gymId: bodyPart.gymId,
      createdAt: bodyPart.createdAt,
      updatedAt: bodyPart.updatedAt,
      exercises: [],
    };
  }

  async updateBodyPart(gymId: string, id: string, data: UpdateBodyPartRequest): Promise<BodyPart> {
    await this.getBodyPartById(gymId, id);

    if (data.bodyPartName) {
      const existingBodyPart = await prisma.bodyPartMaster.findFirst({
        where: {
          bodyPartName: data.bodyPartName,
          gymId,
          NOT: { id },
        },
      });
      if (existingBodyPart) {
        throw new ConflictException('Body part with this name already exists');
      }
    }

    const bodyPart = await prisma.bodyPartMaster.update({
      where: { id },
      data: {
        bodyPartName: data.bodyPartName,
        description: data.description,
        isActive: data.isActive,
      },
      include: {
        exercises: true,
      },
    });

    return {
      id: bodyPart.id,
      bodyPartName: bodyPart.bodyPartName,
      description: bodyPart.description,
      isActive: bodyPart.isActive,
      gymId: bodyPart.gymId,
      createdAt: bodyPart.createdAt,
      updatedAt: bodyPart.updatedAt,
      exercises: bodyPart.exercises.map((e) => ({
        id: e.id,
        exerciseName: e.exerciseName,
        shortCode: e.shortCode,
        description: e.description,
        isActive: e.isActive,
        gymId: e.gymId,
        bodyPartId: e.bodyPartId,
        bodyPartName: bodyPart.bodyPartName,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
    };
  }

  async deleteBodyPart(gymId: string, id: string): Promise<void> {
    await this.getBodyPartById(gymId, id);

    await prisma.bodyPartMaster.delete({
      where: { id },
    });
  }

  // Workout Exercise Master CRUD
  async getWorkoutExercises(gymId: string): Promise<WorkoutExercise[]> {
    const exercises = await prisma.workoutExerciseMaster.findMany({
      where: { gymId },
      include: {
        bodyPart: true,
      },
      orderBy: [{ bodyPart: { bodyPartName: 'asc' } }, { exerciseName: 'asc' }],
    });

    return exercises.map((e) => ({
      id: e.id,
      exerciseName: e.exerciseName,
      shortCode: e.shortCode,
      description: e.description,
      isActive: e.isActive,
      gymId: e.gymId,
      bodyPartId: e.bodyPartId,
      bodyPartName: e.bodyPart?.bodyPartName || null,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));
  }

  async getWorkoutExerciseById(gymId: string, id: string): Promise<WorkoutExercise> {
    const exercise = await prisma.workoutExerciseMaster.findFirst({
      where: { id, gymId },
      include: {
        bodyPart: true,
      },
    });
    if (!exercise) throw new NotFoundException('Workout exercise not found');

    return {
      id: exercise.id,
      exerciseName: exercise.exerciseName,
      shortCode: exercise.shortCode,
      description: exercise.description,
      isActive: exercise.isActive,
      gymId: exercise.gymId,
      bodyPartId: exercise.bodyPartId,
      bodyPartName: exercise.bodyPart?.bodyPartName || null,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    };
  }

  async createWorkoutExercise(gymId: string, data: CreateWorkoutExerciseRequest): Promise<WorkoutExercise> {
    // Verify body part exists and belongs to this gym
    const bodyPart = await prisma.bodyPartMaster.findFirst({
      where: { id: data.bodyPartId, gymId },
    });
    if (!bodyPart) {
      throw new NotFoundException('Body part not found');
    }

    // Check if exercise with same name exists for this gym
    const existingExercise = await prisma.workoutExerciseMaster.findFirst({
      where: {
        exerciseName: data.exerciseName,
        gymId,
      },
    });
    if (existingExercise) {
      throw new ConflictException('Workout exercise with this name already exists');
    }

    const exercise = await prisma.workoutExerciseMaster.create({
      data: {
        exerciseName: data.exerciseName,
        shortCode: data.shortCode,
        description: data.description,
        bodyPartId: data.bodyPartId,
        gymId,
      },
      include: {
        bodyPart: true,
      },
    });

    return {
      id: exercise.id,
      exerciseName: exercise.exerciseName,
      shortCode: exercise.shortCode,
      description: exercise.description,
      isActive: exercise.isActive,
      gymId: exercise.gymId,
      bodyPartId: exercise.bodyPartId,
      bodyPartName: exercise.bodyPart?.bodyPartName || null,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    };
  }

  async updateWorkoutExercise(gymId: string, id: string, data: UpdateWorkoutExerciseRequest): Promise<WorkoutExercise> {
    await this.getWorkoutExerciseById(gymId, id);

    // Verify body part exists if provided
    if (data.bodyPartId) {
      const bodyPart = await prisma.bodyPartMaster.findFirst({
        where: { id: data.bodyPartId, gymId },
      });
      if (!bodyPart) {
        throw new NotFoundException('Body part not found');
      }
    }

    // Check for duplicate name if updating exerciseName
    if (data.exerciseName) {
      const existingExercise = await prisma.workoutExerciseMaster.findFirst({
        where: {
          exerciseName: data.exerciseName,
          gymId,
          NOT: { id },
        },
      });
      if (existingExercise) {
        throw new ConflictException('Workout exercise with this name already exists');
      }
    }

    const exercise = await prisma.workoutExerciseMaster.update({
      where: { id },
      data: {
        exerciseName: data.exerciseName,
        shortCode: data.shortCode,
        description: data.description,
        bodyPartId: data.bodyPartId,
        isActive: data.isActive,
      },
      include: {
        bodyPart: true,
      },
    });

    return {
      id: exercise.id,
      exerciseName: exercise.exerciseName,
      shortCode: exercise.shortCode,
      description: exercise.description,
      isActive: exercise.isActive,
      gymId: exercise.gymId,
      bodyPartId: exercise.bodyPartId,
      bodyPartName: exercise.bodyPart?.bodyPartName || null,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    };
  }

  async toggleWorkoutExerciseStatus(gymId: string, id: string): Promise<WorkoutExercise> {
    const exercise = await prisma.workoutExerciseMaster.findFirst({
      where: { id, gymId },
      include: { bodyPart: true },
    });
    if (!exercise) throw new NotFoundException('Workout exercise not found');

    const updatedExercise = await prisma.workoutExerciseMaster.update({
      where: { id },
      data: { isActive: !exercise.isActive },
      include: { bodyPart: true },
    });

    return {
      id: updatedExercise.id,
      exerciseName: updatedExercise.exerciseName,
      shortCode: updatedExercise.shortCode,
      description: updatedExercise.description,
      isActive: updatedExercise.isActive,
      gymId: updatedExercise.gymId,
      bodyPartId: updatedExercise.bodyPartId,
      bodyPartName: updatedExercise.bodyPart?.bodyPartName || null,
      createdAt: updatedExercise.createdAt,
      updatedAt: updatedExercise.updatedAt,
    };
  }

  // Member Inquiry Methods
  async getMemberInquiries(gymId: string, params: PaginationParams): Promise<{ inquiries: MemberInquiry[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      gymId,
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { contactNo: { contains: search, mode: 'insensitive' as const } },
          { address: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [inquiryRecords, total] = await Promise.all([
      prisma.memberInquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.memberInquiry.count({ where }),
    ]);

    const inquiries: MemberInquiry[] = inquiryRecords.map((inquiry) => ({
      id: inquiry.id,
      fullName: inquiry.fullName,
      contactNo: inquiry.contactNo,
      inquiryDate: inquiry.inquiryDate,
      dob: inquiry.dob || undefined,
      followUp: inquiry.followUp,
      followUpDate: inquiry.followUpDate || undefined,
      gender: inquiry.gender || undefined,
      address: inquiry.address || undefined,
      heardAbout: inquiry.heardAbout || undefined,
      userId: inquiry.userId,
      userName: inquiry.user.name,
      comments: inquiry.comments || undefined,
      memberPhoto: inquiry.memberPhoto || undefined,
      height: inquiry.height ? Number(inquiry.height) : undefined,
      weight: inquiry.weight ? Number(inquiry.weight) : undefined,
      referenceName: inquiry.referenceName || undefined,
      gymId: inquiry.gymId,
      isActive: inquiry.isActive,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
      createdBy: inquiry.createdBy || undefined,
      updatedBy: inquiry.updatedBy || undefined,
    }));

    return { inquiries, total };
  }

  async getMemberInquiriesByUserId(gymId: string, userId: string, params: PaginationParams): Promise<{ inquiries: MemberInquiry[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      gymId,
      userId,
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { contactNo: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [inquiryRecords, total] = await Promise.all([
      prisma.memberInquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.memberInquiry.count({ where }),
    ]);

    const inquiries: MemberInquiry[] = inquiryRecords.map((inquiry) => ({
      id: inquiry.id,
      fullName: inquiry.fullName,
      contactNo: inquiry.contactNo,
      inquiryDate: inquiry.inquiryDate,
      dob: inquiry.dob || undefined,
      followUp: inquiry.followUp,
      followUpDate: inquiry.followUpDate || undefined,
      gender: inquiry.gender || undefined,
      address: inquiry.address || undefined,
      heardAbout: inquiry.heardAbout || undefined,
      userId: inquiry.userId,
      userName: inquiry.user.name,
      comments: inquiry.comments || undefined,
      memberPhoto: inquiry.memberPhoto || undefined,
      height: inquiry.height ? Number(inquiry.height) : undefined,
      weight: inquiry.weight ? Number(inquiry.weight) : undefined,
      referenceName: inquiry.referenceName || undefined,
      gymId: inquiry.gymId,
      isActive: inquiry.isActive,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
      createdBy: inquiry.createdBy || undefined,
      updatedBy: inquiry.updatedBy || undefined,
    }));

    return { inquiries, total };
  }

  async getMemberInquiryById(gymId: string, id: string): Promise<MemberInquiry> {
    const inquiry = await prisma.memberInquiry.findFirst({
      where: { id, gymId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!inquiry) {
      throw new NotFoundException('Member inquiry not found');
    }

    return {
      id: inquiry.id,
      fullName: inquiry.fullName,
      contactNo: inquiry.contactNo,
      inquiryDate: inquiry.inquiryDate,
      dob: inquiry.dob || undefined,
      followUp: inquiry.followUp,
      followUpDate: inquiry.followUpDate || undefined,
      gender: inquiry.gender || undefined,
      address: inquiry.address || undefined,
      heardAbout: inquiry.heardAbout || undefined,
      userId: inquiry.userId,
      userName: inquiry.user.name,
      comments: inquiry.comments || undefined,
      memberPhoto: inquiry.memberPhoto || undefined,
      height: inquiry.height ? Number(inquiry.height) : undefined,
      weight: inquiry.weight ? Number(inquiry.weight) : undefined,
      referenceName: inquiry.referenceName || undefined,
      gymId: inquiry.gymId,
      isActive: inquiry.isActive,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
      createdBy: inquiry.createdBy || undefined,
      updatedBy: inquiry.updatedBy || undefined,
    };
  }

  async createMemberInquiry(gymId: string, userId: string, data: CreateMemberInquiryRequest): Promise<MemberInquiry> {
    const inquiry = await prisma.memberInquiry.create({
      data: {
        fullName: data.fullName,
        contactNo: data.contactNo,
        inquiryDate: data.inquiryDate ? new Date(data.inquiryDate) : new Date(),
        dob: data.dob ? new Date(data.dob) : null,
        followUp: data.followUp || false,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        gender: data.gender,
        address: data.address,
        heardAbout: data.heardAbout,
        userId: userId,
        comments: data.comments,
        memberPhoto: data.memberPhoto || null,
        height: data.height,
        weight: data.weight,
        referenceName: data.referenceName || null,
        gymId: gymId,
        createdBy: userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      id: inquiry.id,
      fullName: inquiry.fullName,
      contactNo: inquiry.contactNo,
      inquiryDate: inquiry.inquiryDate,
      dob: inquiry.dob || undefined,
      followUp: inquiry.followUp,
      followUpDate: inquiry.followUpDate || undefined,
      gender: inquiry.gender || undefined,
      address: inquiry.address || undefined,
      heardAbout: inquiry.heardAbout || undefined,
      userId: inquiry.userId,
      userName: inquiry.user.name,
      comments: inquiry.comments || undefined,
      memberPhoto: inquiry.memberPhoto || undefined,
      height: inquiry.height ? Number(inquiry.height) : undefined,
      weight: inquiry.weight ? Number(inquiry.weight) : undefined,
      referenceName: inquiry.referenceName || undefined,
      gymId: inquiry.gymId,
      isActive: inquiry.isActive,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
      createdBy: inquiry.createdBy || undefined,
      updatedBy: inquiry.updatedBy || undefined,
    };
  }

  async updateMemberInquiry(gymId: string, id: string, userId: string, data: UpdateMemberInquiryRequest): Promise<MemberInquiry> {
    await this.getMemberInquiryById(gymId, id);

    const updateData: any = {
      updatedBy: userId,
    };

    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.contactNo !== undefined) updateData.contactNo = data.contactNo;
    if (data.inquiryDate !== undefined) updateData.inquiryDate = new Date(data.inquiryDate);
    if (data.dob !== undefined) updateData.dob = data.dob ? new Date(data.dob) : null;
    if (data.followUp !== undefined) updateData.followUp = data.followUp;
    if (data.followUpDate !== undefined) updateData.followUpDate = data.followUpDate ? new Date(data.followUpDate) : null;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.heardAbout !== undefined) updateData.heardAbout = data.heardAbout;
    if (data.comments !== undefined) updateData.comments = data.comments;
    if (data.memberPhoto !== undefined) updateData.memberPhoto = data.memberPhoto;
    if (data.height !== undefined) updateData.height = data.height;
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.referenceName !== undefined) updateData.referenceName = data.referenceName;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const inquiry = await prisma.memberInquiry.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      id: inquiry.id,
      fullName: inquiry.fullName,
      contactNo: inquiry.contactNo,
      inquiryDate: inquiry.inquiryDate,
      dob: inquiry.dob || undefined,
      followUp: inquiry.followUp,
      followUpDate: inquiry.followUpDate || undefined,
      gender: inquiry.gender || undefined,
      address: inquiry.address || undefined,
      heardAbout: inquiry.heardAbout || undefined,
      userId: inquiry.userId,
      userName: inquiry.user.name,
      comments: inquiry.comments || undefined,
      memberPhoto: inquiry.memberPhoto || undefined,
      height: inquiry.height ? Number(inquiry.height) : undefined,
      weight: inquiry.weight ? Number(inquiry.weight) : undefined,
      referenceName: inquiry.referenceName || undefined,
      gymId: inquiry.gymId,
      isActive: inquiry.isActive,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
      createdBy: inquiry.createdBy || undefined,
      updatedBy: inquiry.updatedBy || undefined,
    };
  }

  async deleteMemberInquiry(gymId: string, id: string): Promise<void> {
    await this.getMemberInquiryById(gymId, id);
    await prisma.memberInquiry.delete({
      where: { id },
    });
  }

  async toggleMemberInquiryStatus(gymId: string, id: string): Promise<MemberInquiry> {
    const inquiry = await prisma.memberInquiry.findFirst({
      where: { id, gymId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!inquiry) throw new NotFoundException('Member inquiry not found');

    const updatedInquiry = await prisma.memberInquiry.update({
      where: { id },
      data: { isActive: !inquiry.isActive },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return {
      id: updatedInquiry.id,
      fullName: updatedInquiry.fullName,
      contactNo: updatedInquiry.contactNo,
      inquiryDate: updatedInquiry.inquiryDate,
      dob: updatedInquiry.dob || undefined,
      followUp: updatedInquiry.followUp,
      followUpDate: updatedInquiry.followUpDate || undefined,
      gender: updatedInquiry.gender || undefined,
      address: updatedInquiry.address || undefined,
      heardAbout: updatedInquiry.heardAbout || undefined,
      userId: updatedInquiry.userId,
      userName: updatedInquiry.user.name,
      comments: updatedInquiry.comments || undefined,
      memberPhoto: updatedInquiry.memberPhoto || undefined,
      height: updatedInquiry.height ? Number(updatedInquiry.height) : undefined,
      weight: updatedInquiry.weight ? Number(updatedInquiry.weight) : undefined,
      referenceName: updatedInquiry.referenceName || undefined,
      gymId: updatedInquiry.gymId,
      isActive: updatedInquiry.isActive,
      createdAt: updatedInquiry.createdAt,
      updatedAt: updatedInquiry.updatedAt,
      createdBy: updatedInquiry.createdBy || undefined,
      updatedBy: updatedInquiry.updatedBy || undefined,
    };
  }

  // =============================================
  // Course Package Methods
  // =============================================

  async getCoursePackages(gymId: string, params: PaginationParams): Promise<{ packages: CoursePackage[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc', isActive, coursePackageType } = params;
    const skip = (page - 1) * limit;

    // Default to only active packages if isActive is not explicitly set
    const activeFilter = isActive !== undefined ? isActive : true;

    const where: any = {
      gymId,
      isActive: activeFilter,
      ...(search && { packageName: { contains: search, mode: 'insensitive' as const } }),
      ...(coursePackageType && { coursePackageType }),
    };

    const [packageRecords, total] = await Promise.all([
      prisma.coursePackage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.coursePackage.count({ where }),
    ]);

    const packages: CoursePackage[] = packageRecords.map((p) => ({
      id: p.id,
      packageName: p.packageName,
      description: p.description || undefined,
      fees: Number(p.fees),
      maxDiscount: p.maxDiscount ? Number(p.maxDiscount) : undefined,
      discountType: p.discountType as 'PERCENTAGE' | 'AMOUNT',
      coursePackageType: p.coursePackageType as 'REGULAR' | 'PT',
      Months: p.Months,
      isActive: p.isActive,
      gymId: p.gymId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      createdBy: p.createdBy || undefined,
      updatedBy: p.updatedBy || undefined,
    }));

    return { packages, total };
  }

  async getAllActiveCoursePackages(gymId: string): Promise<CoursePackage[]> {
    const packageRecords = await prisma.coursePackage.findMany({
      where: {
        gymId,
        isActive: true,
      },
      orderBy: { packageName: 'asc' },
    });

    return packageRecords.map((p) => ({
      id: p.id,
      packageName: p.packageName,
      description: p.description || undefined,
      fees: Number(p.fees),
      maxDiscount: p.maxDiscount ? Number(p.maxDiscount) : undefined,
      discountType: p.discountType as 'PERCENTAGE' | 'AMOUNT',
      coursePackageType: p.coursePackageType as 'REGULAR' | 'PT',
      Months: p.Months,
      isActive: p.isActive,
      gymId: p.gymId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      createdBy: p.createdBy || undefined,
      updatedBy: p.updatedBy || undefined,
    }));
  }

  async getCoursePackageById(gymId: string, id: string): Promise<CoursePackage> {
    const packageRecord = await prisma.coursePackage.findFirst({
      where: { id, gymId },
    });

    if (!packageRecord) throw new NotFoundException('Course package not found');

    return {
      id: packageRecord.id,
      packageName: packageRecord.packageName,
      description: packageRecord.description || undefined,
      fees: Number(packageRecord.fees),
      maxDiscount: packageRecord.maxDiscount ? Number(packageRecord.maxDiscount) : undefined,
      discountType: packageRecord.discountType as 'PERCENTAGE' | 'AMOUNT',
      coursePackageType: packageRecord.coursePackageType as 'REGULAR' | 'PT',
      Months: packageRecord.Months,
      isActive: packageRecord.isActive,
      gymId: packageRecord.gymId,
      createdAt: packageRecord.createdAt,
      updatedAt: packageRecord.updatedAt,
      createdBy: packageRecord.createdBy || undefined,
      updatedBy: packageRecord.updatedBy || undefined,
    };
  }

  async createCoursePackage(gymId: string, userId: string, data: CreateCoursePackageRequest): Promise<CoursePackage> {
    // Check for duplicate package name in the same gym
    const existingPackage = await prisma.coursePackage.findFirst({
      where: { packageName: data.packageName, gymId },
    });

    if (existingPackage) {
      throw new ConflictException('A course package with this name already exists');
    }

    const packageRecord = await prisma.coursePackage.create({
      data: {
        packageName: data.packageName,
        description: data.description,
        fees: data.fees,
        maxDiscount: data.maxDiscount,
        discountType: data.discountType || 'PERCENTAGE',
        coursePackageType: data.coursePackageType || 'REGULAR',
        Months: data.Months,
        gymId,
        createdBy: userId,
      },
    });

    return {
      id: packageRecord.id,
      packageName: packageRecord.packageName,
      description: packageRecord.description || undefined,
      fees: Number(packageRecord.fees),
      maxDiscount: packageRecord.maxDiscount ? Number(packageRecord.maxDiscount) : undefined,
      discountType: packageRecord.discountType as 'PERCENTAGE' | 'AMOUNT',
      coursePackageType: packageRecord.coursePackageType as 'REGULAR' | 'PT',
      Months: packageRecord.Months,
      isActive: packageRecord.isActive,
      gymId: packageRecord.gymId,
      createdAt: packageRecord.createdAt,
      updatedAt: packageRecord.updatedAt,
      createdBy: packageRecord.createdBy || undefined,
      updatedBy: packageRecord.updatedBy || undefined,
    };
  }

  async updateCoursePackage(gymId: string, userId: string, id: string, data: UpdateCoursePackageRequest): Promise<CoursePackage> {
    const existingPackage = await prisma.coursePackage.findFirst({
      where: { id, gymId },
    });

    if (!existingPackage) throw new NotFoundException('Course package not found');

    // Check for duplicate package name if updating the name
    if (data.packageName && data.packageName !== existingPackage.packageName) {
      const duplicatePackage = await prisma.coursePackage.findFirst({
        where: { packageName: data.packageName, gymId, id: { not: id } },
      });

      if (duplicatePackage) {
        throw new ConflictException('A course package with this name already exists');
      }
    }

    const updateData: any = { updatedBy: userId };
    if (data.packageName !== undefined) updateData.packageName = data.packageName;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.fees !== undefined) updateData.fees = data.fees;
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount;
    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.coursePackageType !== undefined) updateData.coursePackageType = data.coursePackageType;
    if (data.Months !== undefined) updateData.Months = data.Months;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const packageRecord = await prisma.coursePackage.update({
      where: { id },
      data: updateData,
    });

    return {
      id: packageRecord.id,
      packageName: packageRecord.packageName,
      description: packageRecord.description || undefined,
      fees: Number(packageRecord.fees),
      maxDiscount: packageRecord.maxDiscount ? Number(packageRecord.maxDiscount) : undefined,
      discountType: packageRecord.discountType as 'PERCENTAGE' | 'AMOUNT',
      coursePackageType: packageRecord.coursePackageType as 'REGULAR' | 'PT',
      Months: packageRecord.Months,
      isActive: packageRecord.isActive,
      gymId: packageRecord.gymId,
      createdAt: packageRecord.createdAt,
      updatedAt: packageRecord.updatedAt,
      createdBy: packageRecord.createdBy || undefined,
      updatedBy: packageRecord.updatedBy || undefined,
    };
  }

  async deleteCoursePackage(gymId: string, id: string): Promise<void> {
    const existingPackage = await prisma.coursePackage.findFirst({
      where: { id, gymId },
    });

    if (!existingPackage) throw new NotFoundException('Course package not found');

    // Soft delete by setting isActive to false
    await prisma.coursePackage.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async toggleCoursePackageStatus(gymId: string, id: string): Promise<CoursePackage> {
    const existingPackage = await prisma.coursePackage.findFirst({
      where: { id, gymId },
    });

    if (!existingPackage) throw new NotFoundException('Course package not found');

    const packageRecord = await prisma.coursePackage.update({
      where: { id },
      data: { isActive: !existingPackage.isActive },
    });

    return {
      id: packageRecord.id,
      packageName: packageRecord.packageName,
      description: packageRecord.description || undefined,
      fees: Number(packageRecord.fees),
      maxDiscount: packageRecord.maxDiscount ? Number(packageRecord.maxDiscount) : undefined,
      discountType: packageRecord.discountType as 'PERCENTAGE' | 'AMOUNT',
      coursePackageType: packageRecord.coursePackageType as 'REGULAR' | 'PT',
      Months: packageRecord.Months,
      isActive: packageRecord.isActive,
      gymId: packageRecord.gymId,
      createdAt: packageRecord.createdAt,
      updatedAt: packageRecord.updatedAt,
      createdBy: packageRecord.createdBy || undefined,
      updatedBy: packageRecord.updatedBy || undefined,
    };
  }

  async getCoursePackageWithActiveMembers(gymId: string, id: string): Promise<{
    package: CoursePackage;
    members: Member[];
    totalActiveMembers: number;
  }> {
    const packageRecord = await prisma.coursePackage.findFirst({
      where: { id, gymId },
    });

    if (!packageRecord) throw new NotFoundException('Course package not found');

    const today = new Date();

    // Get all active members who are subscribed to this course package
    const memberRecords = await prisma.member.findMany({
      where: {
        gymId,
        coursePackageId: id,
        isActive: true,
        // Only members with valid membership (end date in the future)
        membershipEnd: {
          gte: today,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        trainerAssignments: {
          where: { isActive: true },
          include: {
            trainer: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const members: Member[] = memberRecords.map((member) => {
      const activeTrainerAssignment = member.trainerAssignments[0];
      const trainer = activeTrainerAssignment?.trainer;

      return {
        id: member.id,
        memberId: member.memberId || undefined,
        email: member.user.email,
        firstName: member.user.name?.split(' ')[0] || '',
        lastName: member.user.name?.split(' ').slice(1).join(' ') || '',
        phone: member.phone || undefined,
        altContactNo: member.altContactNo || undefined,
        address: member.address || undefined,
        gender: member.gender || undefined,
        occupation: member.occupation || undefined,
        maritalStatus: member.maritalStatus || undefined,
        bloodGroup: member.bloodGroup || undefined,
        dateOfBirth: member.dateOfBirth || undefined,
        anniversaryDate: member.anniversaryDate || undefined,
        emergencyContact: member.emergencyContact || undefined,
        healthNotes: member.healthNotes || undefined,
        idProofType: member.idProofType || undefined,
        idProofDocument: member.idProofDocument || undefined,
        memberPhoto: member.memberPhoto || undefined,
        smsFacility: member.smsFacility,
        isActive: member.isActive,
        gymId: member.gymId,
        trainerId: trainer?.id || undefined,
        trainer: trainer
          ? {
            id: trainer.id,
            email: trainer.user.email,
            firstName: trainer.user.name?.split(' ')[0] || '',
            lastName: trainer.user.name?.split(' ').slice(1).join(' ') || '',
            isActive: trainer.isActive,
            gymId: trainer.gymId,
            createdAt: trainer.createdAt,
            specialization: trainer.specialization || undefined,
            phone: trainer.phone || undefined,
          }
          : undefined,
        memberType: (member.memberType as 'REGULAR' | 'PT') || 'REGULAR',
        membershipStartDate: member.membershipStart || undefined,
        membershipEndDate: member.membershipEnd || undefined,
        coursePackageId: member.coursePackageId || undefined,
        packageFees: member.packageFees ? Number(member.packageFees) : undefined,
        maxDiscount: member.maxDiscount ? Number(member.maxDiscount) : undefined,
        afterDiscount: member.afterDiscount ? Number(member.afterDiscount) : undefined,
        extraDiscount: member.extraDiscount ? Number(member.extraDiscount) : undefined,
        finalFees: member.finalFees ? Number(member.finalFees) : undefined,
        createdAt: member.createdAt,
        createdBy: member.createdBy || undefined,
        updatedBy: member.updatedBy || undefined,
      };
    });

    return {
      package: {
        id: packageRecord.id,
        packageName: packageRecord.packageName,
        description: packageRecord.description || undefined,
        fees: Number(packageRecord.fees),
        maxDiscount: packageRecord.maxDiscount ? Number(packageRecord.maxDiscount) : undefined,
        discountType: packageRecord.discountType as 'PERCENTAGE' | 'AMOUNT',
        coursePackageType: packageRecord.coursePackageType as 'REGULAR' | 'PT',
        Months: packageRecord.Months,
        isActive: packageRecord.isActive,
        gymId: packageRecord.gymId,
        createdAt: packageRecord.createdAt,
        updatedAt: packageRecord.updatedAt,
        createdBy: packageRecord.createdBy || undefined,
        updatedBy: packageRecord.updatedBy || undefined,
      },
      members,
      totalActiveMembers: members.length,
    };
  }

  // =============================================
  // Member Balance Payment Methods
  // =============================================

  // Generate next receipt number for gym
  private async generateReceiptNo(gymId: string): Promise<string> {
    const lastPayment = await prisma.memberBalancePayment.findFirst({
      where: { gymId },
      orderBy: { createdAt: 'desc' },
      select: { receiptNo: true }
    });

    if (!lastPayment?.receiptNo) {
      return 'RCP-001';
    }

    const lastNum = parseInt(lastPayment.receiptNo.replace('RCP-', '')) || 0;
    return `RCP-${String(lastNum + 1).padStart(3, '0')}`;
  }

  async createMemberBalancePayment(
    gymId: string,
    userId: string,
    memberId: string,
    data: CreateMemberBalancePaymentRequest
  ): Promise<MemberBalancePayment> {
    // Validate member exists and belongs to gym
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: { user: { select: { name: true } } }
    });
    if (!member) throw new NotFoundException('Member not found');

    // Determine payment type (default to REGULAR)
    const paymentFor = (data.paymentFor || 'REGULAR') as 'REGULAR' | 'PT';

    // Get the relevant final fees based on payment type
    let finalFees: number;
    if (paymentFor === 'PT') {
      if (!member.hasPTAddon) {
        throw new ForbiddenException('Member does not have PT addon. Cannot make PT payment.');
      }
      finalFees = member.ptFinalFees ? Number(member.ptFinalFees) : 0;
    } else {
      finalFees = member.finalFees ? Number(member.finalFees) : 0;
    }

    // Get total already paid for this payment type
    const existingPayments = await prisma.memberBalancePayment.findMany({
      where: { memberId, gymId, isActive: true, paymentFor },
      select: { paidFees: true }
    });
    const totalAlreadyPaid = existingPayments.reduce((sum, p) => sum + Number(p.paidFees), 0);

    // Check if new payment would exceed final fees
    const newTotalPaid = totalAlreadyPaid + Number(data.paidFees);
    if (finalFees > 0 && newTotalPaid > finalFees) {
      const remainingAmount = finalFees - totalAlreadyPaid;
      const feeType = paymentFor === 'PT' ? 'PT' : 'Regular';
      throw new ForbiddenException(
        `Payment amount exceeds remaining ${feeType} balance. Final Fees: ₹${finalFees}, Already Paid: ₹${totalAlreadyPaid}, Remaining: ₹${remainingAmount}. Maximum payment allowed: ₹${remainingAmount}`
      );
    }

    const receiptNo = await this.generateReceiptNo(gymId);

    const payment = await prisma.memberBalancePayment.create({
      data: {
        receiptNo,
        memberId,
        gymId,
        paymentFor,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        contactNo: data.contactNo || member.phone,
        paidFees: data.paidFees,
        payMode: data.payMode,
        nextPaymentDate: data.nextPaymentDate ? new Date(data.nextPaymentDate) : undefined,
        notes: data.notes,
        createdBy: userId,
      },
      include: { member: { include: { user: { select: { name: true } } } } }
    });

    return {
      id: payment.id,
      receiptNo: payment.receiptNo,
      memberId: payment.memberId,
      memberName: payment.member.user.name,
      paymentFor: payment.paymentFor as PaymentFor,
      paymentDate: payment.paymentDate,
      contactNo: payment.contactNo || undefined,
      paidFees: Number(payment.paidFees),
      payMode: payment.payMode,
      nextPaymentDate: payment.nextPaymentDate || undefined,
      notes: payment.notes || undefined,
      isActive: payment.isActive,
      gymId: payment.gymId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      createdBy: payment.createdBy || undefined,
      updatedBy: payment.updatedBy || undefined,
    };
  }

  async updateMemberBalancePayment(
    gymId: string,
    userId: string,
    paymentId: string,
    data: UpdateMemberBalancePaymentRequest
  ): Promise<MemberBalancePayment> {
    const existingPayment = await prisma.memberBalancePayment.findFirst({
      where: { id: paymentId, gymId }
    });
    if (!existingPayment) throw new NotFoundException('Payment not found');

    const payment = await prisma.memberBalancePayment.update({
      where: { id: paymentId },
      data: {
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
        contactNo: data.contactNo,
        paidFees: data.paidFees,
        payMode: data.payMode,
        nextPaymentDate: data.nextPaymentDate ? new Date(data.nextPaymentDate) : undefined,
        notes: data.notes,
        isActive: data.isActive,
        updatedBy: userId,
      },
      include: { member: { include: { user: { select: { name: true } } } } }
    });

    return {
      id: payment.id,
      receiptNo: payment.receiptNo,
      memberId: payment.memberId,
      memberName: payment.member.user.name,
      paymentFor: payment.paymentFor as PaymentFor,
      paymentDate: payment.paymentDate,
      contactNo: payment.contactNo || undefined,
      paidFees: Number(payment.paidFees),
      payMode: payment.payMode,
      nextPaymentDate: payment.nextPaymentDate || undefined,
      notes: payment.notes || undefined,
      isActive: payment.isActive,
      gymId: payment.gymId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      createdBy: payment.createdBy || undefined,
      updatedBy: payment.updatedBy || undefined,
    };
  }

  async getMemberBalancePaymentById(gymId: string, paymentId: string): Promise<MemberBalancePayment> {
    const payment = await prisma.memberBalancePayment.findFirst({
      where: { id: paymentId, gymId },
      include: { member: { include: { user: { select: { name: true } } } } }
    });
    if (!payment) throw new NotFoundException('Payment not found');

    return {
      id: payment.id,
      receiptNo: payment.receiptNo,
      memberId: payment.memberId,
      memberName: payment.member.user.name,
      paymentFor: payment.paymentFor as PaymentFor,
      paymentDate: payment.paymentDate,
      contactNo: payment.contactNo || undefined,
      paidFees: Number(payment.paidFees),
      payMode: payment.payMode,
      nextPaymentDate: payment.nextPaymentDate || undefined,
      notes: payment.notes || undefined,
      isActive: payment.isActive,
      gymId: payment.gymId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      createdBy: payment.createdBy || undefined,
      updatedBy: payment.updatedBy || undefined,
    };
  }

  async getMemberBalancePayments(gymId: string, memberId: string): Promise<MemberBalancePaymentResponse> {
    // Get member with finalFees
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: { user: { select: { name: true } } }
    });
    if (!member) throw new NotFoundException('Member not found');

    // Get all payments for this member
    const payments = await prisma.memberBalancePayment.findMany({
      where: { memberId, gymId, isActive: true },
      orderBy: { paymentDate: 'desc' },
      include: { member: { include: { user: { select: { name: true } } } } }
    });

    // Calculate totals
    const finalFees = member.finalFees ? Number(member.finalFees) : 0;
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.paidFees), 0);
    const pendingAmount = Math.max(0, finalFees - totalPaid);

    return {
      summary: {
        memberId: member.id,
        memberName: member.user.name,
        finalFees,
        totalPaid,
        pendingAmount,
        paymentCount: payments.length,
      },
      payments: payments.map(payment => ({
        id: payment.id,
        receiptNo: payment.receiptNo,
        memberId: payment.memberId,
        memberName: payment.member.user.name,
        paymentFor: payment.paymentFor as PaymentFor,
        paymentDate: payment.paymentDate,
        contactNo: payment.contactNo || undefined,
        paidFees: Number(payment.paidFees),
        payMode: payment.payMode,
        nextPaymentDate: payment.nextPaymentDate || undefined,
        notes: payment.notes || undefined,
        isActive: payment.isActive,
        gymId: payment.gymId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        createdBy: payment.createdBy || undefined,
        updatedBy: payment.updatedBy || undefined,
      })),
    };
  }

  async getAllMemberBalancePayments(
    gymId: string,
    params: PaginationParams
  ): Promise<{ payments: MemberBalancePayment[]; total: number }> {
    const { page, limit, search, sortBy = 'paymentDate', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      gymId,
      isActive: true,
      ...(search && {
        OR: [
          { receiptNo: { contains: search, mode: 'insensitive' as const } },
          { member: { user: { name: { contains: search, mode: 'insensitive' as const } } } },
          { contactNo: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [paymentRecords, total] = await Promise.all([
      prisma.memberBalancePayment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { member: { include: { user: { select: { name: true } } } } }
      }),
      prisma.memberBalancePayment.count({ where }),
    ]);

    const payments: MemberBalancePayment[] = paymentRecords.map(payment => ({
      id: payment.id,
      receiptNo: payment.receiptNo,
      memberId: payment.memberId,
      memberName: payment.member.user.name,
      paymentFor: payment.paymentFor as PaymentFor,
      paymentDate: payment.paymentDate,
      contactNo: payment.contactNo || undefined,
      paidFees: Number(payment.paidFees),
      payMode: payment.payMode,
      nextPaymentDate: payment.nextPaymentDate || undefined,
      notes: payment.notes || undefined,
      isActive: payment.isActive,
      gymId: payment.gymId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      createdBy: payment.createdBy || undefined,
      updatedBy: payment.updatedBy || undefined,
    }));

    return { payments, total };
  }

  // =============================================
  // Membership Renewal Methods
  // =============================================

  /**
   * Create a new membership renewal
   * - Only Active or Expired members can renew (not InActive/soft-deleted)
   * - Creates a NEW row in MembershipRenewal table (historical tracking)
   * - Updates the member's current membership dates
   */
  async createMembershipRenewal(
    gymId: string,
    userId: string,
    data: CreateMembershipRenewalRequest
  ): Promise<MembershipRenewal> {
    // Get member and validate ownership
    const member = await prisma.member.findFirst({
      where: { id: data.memberId, gymId },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Check if member is Active or Expired (not InActive/soft-deleted)
    if (!member.isActive) {
      throw new BadRequestException('Cannot renew membership for inactive (soft-deleted) members. Please reactivate the member first.');
    }

    // Determine renewal type based on dates
    const today = new Date();
    let renewalType: RenewalType = data.renewalType || 'STANDARD';

    if (!data.renewalType) {
      if (member.membershipEnd < today) {
        renewalType = 'LATE'; // Expired member returning
      } else if (member.membershipEnd > new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        renewalType = 'EARLY'; // More than 7 days left
      }
    }

    // Generate auto-increment renewal number
    const lastRenewal = await prisma.membershipRenewal.findFirst({
      where: { gymId },
      orderBy: { createdAt: 'desc' },
      select: { renewalNumber: true }
    });

    let nextNumber = 1;
    if (lastRenewal?.renewalNumber) {
      const match = lastRenewal.renewalNumber.match(/REN-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    const renewalNumber = `REN-${String(nextNumber).padStart(5, '0')}`;

    const newMembershipStart = new Date(data.newMembershipStart);
    const newMembershipEnd = new Date(data.newMembershipEnd);

    // Calculate payment status and amounts
    const finalFees = data.finalFees || 0;
    const paidAmount = data.paidAmount || 0;
    const pendingAmount = Math.max(0, finalFees - paidAmount);

    let paymentStatus: PaymentStatus = 'PENDING';
    if (paidAmount >= finalFees && finalFees > 0) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIAL';
    }

    // Create renewal record and update member in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the renewal record (NEW ROW - historical tracking)
      const renewal = await tx.membershipRenewal.create({
        data: {
          renewalNumber,
          memberId: data.memberId,
          gymId,

          // Previous dates (current member dates before renewal)
          previousMembershipStart: member.membershipStart,
          previousMembershipEnd: member.membershipEnd,

          // New dates
          newMembershipStart,
          newMembershipEnd,

          // Renewal details
          renewalType,

          // Package and fees
          coursePackageId: data.coursePackageId,
          packageFees: data.packageFees,
          maxDiscount: data.maxDiscount,
          afterDiscount: data.afterDiscount,
          extraDiscount: data.extraDiscount,
          finalFees: data.finalFees,

          // Payment
          paymentStatus,
          paymentMode: data.paymentMode,
          paidAmount,
          pendingAmount,

          notes: data.notes,
          createdBy: userId,
        },
        include: {
          member: {
            include: {
              user: { select: { name: true, email: true } }
            }
          }
        }
      });

      // Update member's current membership dates
      await tx.member.update({
        where: { id: data.memberId },
        data: {
          membershipStart: newMembershipStart,
          membershipEnd: newMembershipEnd,
          coursePackageId: data.coursePackageId || member.coursePackageId,
          packageFees: data.packageFees,
          maxDiscount: data.maxDiscount,
          afterDiscount: data.afterDiscount,
          extraDiscount: data.extraDiscount,
          finalFees: data.finalFees,
          updatedBy: userId,
        }
      });

      return renewal;
    });

    // Map to response type
    return {
      id: result.id,
      renewalNumber: result.renewalNumber,
      memberId: result.memberId,
      memberName: result.member.user.name,
      memberEmail: result.member.user.email,
      memberPhone: result.member.phone || undefined,
      gymId: result.gymId,
      previousMembershipStart: result.previousMembershipStart,
      previousMembershipEnd: result.previousMembershipEnd,
      newMembershipStart: result.newMembershipStart,
      newMembershipEnd: result.newMembershipEnd,
      renewalDate: result.renewalDate,
      renewalType: result.renewalType as RenewalType,
      coursePackageId: result.coursePackageId || undefined,
      packageFees: result.packageFees ? Number(result.packageFees) : undefined,
      maxDiscount: result.maxDiscount ? Number(result.maxDiscount) : undefined,
      afterDiscount: result.afterDiscount ? Number(result.afterDiscount) : undefined,
      extraDiscount: result.extraDiscount ? Number(result.extraDiscount) : undefined,
      finalFees: result.finalFees ? Number(result.finalFees) : undefined,
      paymentStatus: result.paymentStatus as PaymentStatus,
      paymentMode: result.paymentMode || undefined,
      paidAmount: result.paidAmount ? Number(result.paidAmount) : undefined,
      pendingAmount: result.pendingAmount ? Number(result.pendingAmount) : undefined,
      notes: result.notes || undefined,
      isActive: result.isActive,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      createdBy: result.createdBy || undefined,
      updatedBy: result.updatedBy || undefined,
    };
  }

  /**
   * Get all membership renewals with filters and pagination
   */
  async getMembershipRenewals(
    gymId: string,
    params: PaginationParams & {
      renewalType?: RenewalType;
      paymentStatus?: PaymentStatus;
      renewalDateFrom?: string;
      renewalDateTo?: string;
    }
  ): Promise<{ renewals: MembershipRenewal[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'renewalDate',
      sortOrder = 'desc',
      renewalType,
      paymentStatus,
      renewalDateFrom,
      renewalDateTo,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      gymId,
      isActive: true,
      ...(renewalType && { renewalType }),
      ...(paymentStatus && { paymentStatus }),
      ...(search && {
        OR: [
          { renewalNumber: { contains: search, mode: 'insensitive' as const } },
          { member: { user: { name: { contains: search, mode: 'insensitive' as const } } } },
          { member: { user: { email: { contains: search, mode: 'insensitive' as const } } } },
          { member: { phone: { contains: search, mode: 'insensitive' as const } } },
          { member: { memberId: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
      ...(renewalDateFrom || renewalDateTo ? {
        renewalDate: {
          ...(renewalDateFrom && { gte: new Date(renewalDateFrom) }),
          ...(renewalDateTo && { lte: new Date(renewalDateTo) }),
        },
      } : {}),
    };

    const [renewalRecords, total] = await Promise.all([
      prisma.membershipRenewal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          member: {
            include: {
              user: { select: { name: true, email: true } }
            }
          }
        }
      }),
      prisma.membershipRenewal.count({ where }),
    ]);

    const renewals: MembershipRenewal[] = renewalRecords.map(r => ({
      id: r.id,
      renewalNumber: r.renewalNumber,
      memberId: r.memberId,
      memberName: r.member.user.name,
      memberEmail: r.member.user.email,
      memberPhone: r.member.phone || undefined,
      gymId: r.gymId,
      previousMembershipStart: r.previousMembershipStart,
      previousMembershipEnd: r.previousMembershipEnd,
      newMembershipStart: r.newMembershipStart,
      newMembershipEnd: r.newMembershipEnd,
      renewalDate: r.renewalDate,
      renewalType: r.renewalType as RenewalType,
      coursePackageId: r.coursePackageId || undefined,
      packageFees: r.packageFees ? Number(r.packageFees) : undefined,
      maxDiscount: r.maxDiscount ? Number(r.maxDiscount) : undefined,
      afterDiscount: r.afterDiscount ? Number(r.afterDiscount) : undefined,
      extraDiscount: r.extraDiscount ? Number(r.extraDiscount) : undefined,
      finalFees: r.finalFees ? Number(r.finalFees) : undefined,
      paymentStatus: r.paymentStatus as PaymentStatus,
      paymentMode: r.paymentMode || undefined,
      paidAmount: r.paidAmount ? Number(r.paidAmount) : undefined,
      pendingAmount: r.pendingAmount ? Number(r.pendingAmount) : undefined,
      notes: r.notes || undefined,
      isActive: r.isActive,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      createdBy: r.createdBy || undefined,
      updatedBy: r.updatedBy || undefined,
    }));

    return { renewals, total };
  }

  /**
   * Get membership renewal by ID
   */
  async getMembershipRenewalById(gymId: string, renewalId: string): Promise<MembershipRenewal> {
    const renewal = await prisma.membershipRenewal.findFirst({
      where: { id: renewalId, gymId },
      include: {
        member: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });

    if (!renewal) {
      throw new NotFoundException('Membership renewal not found');
    }

    return {
      id: renewal.id,
      renewalNumber: renewal.renewalNumber,
      memberId: renewal.memberId,
      memberName: renewal.member.user.name,
      memberEmail: renewal.member.user.email,
      memberPhone: renewal.member.phone || undefined,
      gymId: renewal.gymId,
      previousMembershipStart: renewal.previousMembershipStart,
      previousMembershipEnd: renewal.previousMembershipEnd,
      newMembershipStart: renewal.newMembershipStart,
      newMembershipEnd: renewal.newMembershipEnd,
      renewalDate: renewal.renewalDate,
      renewalType: renewal.renewalType as RenewalType,
      coursePackageId: renewal.coursePackageId || undefined,
      packageFees: renewal.packageFees ? Number(renewal.packageFees) : undefined,
      maxDiscount: renewal.maxDiscount ? Number(renewal.maxDiscount) : undefined,
      afterDiscount: renewal.afterDiscount ? Number(renewal.afterDiscount) : undefined,
      extraDiscount: renewal.extraDiscount ? Number(renewal.extraDiscount) : undefined,
      finalFees: renewal.finalFees ? Number(renewal.finalFees) : undefined,
      paymentStatus: renewal.paymentStatus as PaymentStatus,
      paymentMode: renewal.paymentMode || undefined,
      paidAmount: renewal.paidAmount ? Number(renewal.paidAmount) : undefined,
      pendingAmount: renewal.pendingAmount ? Number(renewal.pendingAmount) : undefined,
      notes: renewal.notes || undefined,
      isActive: renewal.isActive,
      createdAt: renewal.createdAt,
      updatedAt: renewal.updatedAt,
      createdBy: renewal.createdBy || undefined,
      updatedBy: renewal.updatedBy || undefined,
    };
  }

  /**
   * Get member renewal history - all renewals for a specific member
   */
  async getMemberRenewalHistory(gymId: string, memberId: string): Promise<MemberRenewalHistory> {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const renewals = await prisma.membershipRenewal.findMany({
      where: { memberId, gymId, isActive: true },
      orderBy: { renewalDate: 'desc' },
      include: {
        member: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });

    // Determine member status
    const today = new Date();
    let memberStatus: 'Active' | 'Expired' | 'InActive' = 'Active';
    if (!member.isActive) {
      memberStatus = 'InActive';
    } else if (member.membershipEnd < today) {
      memberStatus = 'Expired';
    }

    return {
      member: {
        id: member.id,
        memberId: member.memberId || undefined,
        name: member.user.name,
        email: member.user.email,
        phone: member.phone || undefined,
        currentMembershipStart: member.membershipStart,
        currentMembershipEnd: member.membershipEnd,
        memberStatus,
      },
      totalRenewals: renewals.length,
      renewals: renewals.map(r => ({
        id: r.id,
        renewalNumber: r.renewalNumber,
        memberId: r.memberId,
        memberName: r.member.user.name,
        memberEmail: r.member.user.email,
        memberPhone: r.member.phone || undefined,
        gymId: r.gymId,
        previousMembershipStart: r.previousMembershipStart,
        previousMembershipEnd: r.previousMembershipEnd,
        newMembershipStart: r.newMembershipStart,
        newMembershipEnd: r.newMembershipEnd,
        renewalDate: r.renewalDate,
        renewalType: r.renewalType as RenewalType,
        coursePackageId: r.coursePackageId || undefined,
        packageFees: r.packageFees ? Number(r.packageFees) : undefined,
        maxDiscount: r.maxDiscount ? Number(r.maxDiscount) : undefined,
        afterDiscount: r.afterDiscount ? Number(r.afterDiscount) : undefined,
        extraDiscount: r.extraDiscount ? Number(r.extraDiscount) : undefined,
        finalFees: r.finalFees ? Number(r.finalFees) : undefined,
        paymentStatus: r.paymentStatus as PaymentStatus,
        paymentMode: r.paymentMode || undefined,
        paidAmount: r.paidAmount ? Number(r.paidAmount) : undefined,
        pendingAmount: r.pendingAmount ? Number(r.pendingAmount) : undefined,
        notes: r.notes || undefined,
        isActive: r.isActive,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        createdBy: r.createdBy || undefined,
        updatedBy: r.updatedBy || undefined,
      })),
    };
  }

  /**
   * Update membership renewal (mainly for payment updates)
   */
  async updateMembershipRenewal(
    gymId: string,
    userId: string,
    renewalId: string,
    data: UpdateMembershipRenewalRequest
  ): Promise<MembershipRenewal> {
    const existing = await prisma.membershipRenewal.findFirst({
      where: { id: renewalId, gymId }
    });

    if (!existing) {
      throw new NotFoundException('Membership renewal not found');
    }

    // Recalculate payment amounts if paidAmount updated
    let updateData: any = { ...data, updatedBy: userId };

    if (data.paidAmount !== undefined) {
      const finalFees = Number(existing.finalFees) || 0;
      const paidAmount = data.paidAmount;
      const pendingAmount = Math.max(0, finalFees - paidAmount);

      let paymentStatus = data.paymentStatus || existing.paymentStatus;
      if (paidAmount >= finalFees && finalFees > 0) {
        paymentStatus = 'PAID';
      } else if (paidAmount > 0) {
        paymentStatus = 'PARTIAL';
      } else {
        paymentStatus = 'PENDING';
      }

      updateData = {
        ...updateData,
        paidAmount,
        pendingAmount,
        paymentStatus,
      };
    }

    const updated = await prisma.membershipRenewal.update({
      where: { id: renewalId },
      data: updateData,
      include: {
        member: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });

    return {
      id: updated.id,
      renewalNumber: updated.renewalNumber,
      memberId: updated.memberId,
      memberName: updated.member.user.name,
      memberEmail: updated.member.user.email,
      memberPhone: updated.member.phone || undefined,
      gymId: updated.gymId,
      previousMembershipStart: updated.previousMembershipStart,
      previousMembershipEnd: updated.previousMembershipEnd,
      newMembershipStart: updated.newMembershipStart,
      newMembershipEnd: updated.newMembershipEnd,
      renewalDate: updated.renewalDate,
      renewalType: updated.renewalType as RenewalType,
      coursePackageId: updated.coursePackageId || undefined,
      packageFees: updated.packageFees ? Number(updated.packageFees) : undefined,
      maxDiscount: updated.maxDiscount ? Number(updated.maxDiscount) : undefined,
      afterDiscount: updated.afterDiscount ? Number(updated.afterDiscount) : undefined,
      extraDiscount: updated.extraDiscount ? Number(updated.extraDiscount) : undefined,
      finalFees: updated.finalFees ? Number(updated.finalFees) : undefined,
      paymentStatus: updated.paymentStatus as PaymentStatus,
      paymentMode: updated.paymentMode || undefined,
      paidAmount: updated.paidAmount ? Number(updated.paidAmount) : undefined,
      pendingAmount: updated.pendingAmount ? Number(updated.pendingAmount) : undefined,
      notes: updated.notes || undefined,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      createdBy: updated.createdBy || undefined,
      updatedBy: updated.updatedBy || undefined,
    };
  }

  /**
   * Get Renewal Rate Report - comprehensive analytics for gym owner
   */
  async getRenewalRateReport(gymId: string): Promise<RenewalRateReport> {
    const today = new Date();
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Get member counts
    const [totalMembers, totalActiveMembers, totalExpiredMembers] = await Promise.all([
      prisma.member.count({ where: { gymId, isActive: true } }),
      prisma.member.count({
        where: {
          gymId,
          isActive: true,
          membershipStart: { lte: today },
          membershipEnd: { gte: today },
        }
      }),
      prisma.member.count({
        where: {
          gymId,
          isActive: true,
          membershipEnd: { lt: today },
        }
      }),
    ]);

    // Get all renewals
    const allRenewals = await prisma.membershipRenewal.findMany({
      where: { gymId, isActive: true }
    });

    const totalRenewals = allRenewals.length;

    // Calculate renewal rate (members who have renewed at least once / total members)
    const membersWithRenewals = new Set(allRenewals.map(r => r.memberId)).size;
    const renewalRate = totalMembers > 0 ? (membersWithRenewals / totalMembers) * 100 : 0;

    // Renewals by type
    const renewalTypeCount: Record<RenewalType, number> = {
      'STANDARD': 0,
      'EARLY': 0,
      'LATE': 0,
      'UPGRADE': 0,
      'DOWNGRADE': 0,
    };
    allRenewals.forEach(r => {
      renewalTypeCount[r.renewalType as RenewalType]++;
    });
    const renewalsByType = Object.entries(renewalTypeCount).map(([type, count]) => ({
      type: type as RenewalType,
      count,
      percentage: totalRenewals > 0 ? (count / totalRenewals) * 100 : 0,
    }));

    // Renewals by payment status
    const paymentStatusCount: Record<PaymentStatus, { count: number; amount: number }> = {
      'PAID': { count: 0, amount: 0 },
      'PENDING': { count: 0, amount: 0 },
      'PARTIAL': { count: 0, amount: 0 },
    };
    allRenewals.forEach(r => {
      paymentStatusCount[r.paymentStatus as PaymentStatus].count++;
      paymentStatusCount[r.paymentStatus as PaymentStatus].amount += Number(r.finalFees) || 0;
    });
    const renewalsByPaymentStatus = Object.entries(paymentStatusCount).map(([status, data]) => ({
      status: status as PaymentStatus,
      count: data.count,
      totalAmount: data.amount,
    }));

    // Monthly renewal trends (last 12 months)
    const monthlyData: Map<string, { renewalCount: number; newMemberCount: number; expiredCount: number }> = new Map();

    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(today);
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(monthKey, { renewalCount: 0, newMemberCount: 0, expiredCount: 0 });
    }

    // Count renewals per month
    allRenewals.forEach(r => {
      const monthKey = `${r.renewalDate.getFullYear()}-${String(r.renewalDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.has(monthKey)) {
        monthlyData.get(monthKey)!.renewalCount++;
      }
    });

    // Get new members per month
    const newMembers = await prisma.member.findMany({
      where: { gymId, createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true }
    });
    newMembers.forEach(m => {
      const monthKey = `${m.createdAt.getFullYear()}-${String(m.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.has(monthKey)) {
        monthlyData.get(monthKey)!.newMemberCount++;
      }
    });

    // Get expired memberships per month
    const expiredMembers = await prisma.member.findMany({
      where: { gymId, membershipEnd: { gte: twelveMonthsAgo, lt: today } },
      select: { membershipEnd: true }
    });
    expiredMembers.forEach(m => {
      const monthKey = `${m.membershipEnd.getFullYear()}-${String(m.membershipEnd.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.has(monthKey)) {
        monthlyData.get(monthKey)!.expiredCount++;
      }
    });

    const monthlyRenewals = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        renewalCount: data.renewalCount,
        newMemberCount: data.newMemberCount,
        expiredCount: data.expiredCount,
        renewalRate: data.expiredCount > 0 ? (data.renewalCount / data.expiredCount) * 100 : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Revenue calculations
    const totalRenewalRevenue = allRenewals.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0);
    const averageRenewalFees = totalRenewals > 0 ? totalRenewalRevenue / totalRenewals : 0;

    // Package popularity in renewals
    const packageStats: Map<string, { packageId: string; packageName: string; renewalCount: number; totalRevenue: number }> = new Map();

    const coursePackages = await prisma.coursePackage.findMany({
      where: { gymId },
      select: { id: true, packageName: true }
    });
    const packageNameMap = new Map(coursePackages.map(p => [p.id, p.packageName]));

    allRenewals.forEach(r => {
      if (r.coursePackageId) {
        const existing = packageStats.get(r.coursePackageId);
        if (existing) {
          existing.renewalCount++;
          existing.totalRevenue += Number(r.finalFees) || 0;
        } else {
          packageStats.set(r.coursePackageId, {
            packageId: r.coursePackageId,
            packageName: typeof packageNameMap.get(r.coursePackageId) === 'string' ? packageNameMap.get(r.coursePackageId) as string : 'Unknown Package',
            renewalCount: 1,
            totalRevenue: Number(r.finalFees) || 0,
          });
        }
      }
    });

    const packageRenewalStats = Array.from(packageStats.values())
      .sort((a, b) => b.renewalCount - a.renewalCount);

    return {
      totalMembers,
      totalActiveMembers,
      totalExpiredMembers,
      totalRenewals,
      renewalRate: Math.round(renewalRate * 100) / 100,
      renewalsByType,
      renewalsByPaymentStatus,
      monthlyRenewals,
      totalRenewalRevenue,
      averageRenewalFees: Math.round(averageRenewalFees * 100) / 100,
      packageRenewalStats,
    };
  }

  // =============================================
  // PT Addon Management Methods
  // =============================================

  // Add PT addon to existing Regular member
  async addPTAddon(
    gymId: string,
    userId: string,
    memberId: string,
    data: AddPTAddonRequest
  ): Promise<Member> {
    // Validate member exists and belongs to gym
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: { user: { select: { name: true, email: true } }, ptMember: true }
    });
    if (!member) throw new NotFoundException('Member not found');

    // Check if already has ACTIVE PT addon (inactive PT records are allowed from previous removals)
    const hasActivePT = member.hasPTAddon || (member.ptMember && member.ptMember.isActive);
    if (hasActivePT) {
      throw new ConflictException('Member already has PT addon. Remove existing PT first.');
    }

    // Validate trainer exists
    const trainer = await prisma.trainer.findFirst({
      where: { id: data.trainerId, gymId, isActive: true },
      include: { user: { select: { name: true } } }
    });
    if (!trainer) throw new NotFoundException('Trainer not found or inactive');

    // Calculate PT fees after discount
    const ptAfterDiscount = Number(data.ptPackageFees) - (Number(data.ptMaxDiscount) || 0);

    // Check if there's an existing (inactive) PT record that we need to update
    const existingPTMember = member.ptMember;

    // Transaction to create/update PTMember and update Member
    const result = await prisma.$transaction(async (tx) => {
      let ptMember;

      if (existingPTMember && !existingPTMember.isActive) {
        // Update existing inactive PT record (re-adding PT after removal)
        ptMember = await tx.pTMember.update({
          where: { id: existingPTMember.id },
          data: {
            trainerId: data.trainerId,
            packageName: data.ptPackageName,
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            endDate: data.endDate ? new Date(data.endDate) : null,
            goals: data.goals,
            notes: data.notes,
            isActive: true, // Re-activate
            updatedBy: userId,
          }
        });
      } else {
        // Create new PTMember record (first time adding PT)
        ptMember = await tx.pTMember.create({
          data: {
            memberId,
            trainerId: data.trainerId,
            gymId,
            packageName: data.ptPackageName,
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            goals: data.goals,
            notes: data.notes,
            createdBy: userId,
          }
        });
      }

      // Update Member with PT addon fields
      const updatedMember = await tx.member.update({
        where: { id: memberId },
        data: {
          hasPTAddon: true,
          memberType: member.memberType === 'REGULAR' ? 'REGULAR_PT' : member.memberType,
          ptPackageName: data.ptPackageName,
          ptPackageFees: data.ptPackageFees,
          ptMaxDiscount: data.ptMaxDiscount,
          ptAfterDiscount,
          ptExtraDiscount: data.ptExtraDiscount,
          ptFinalFees: data.ptFinalFees,
          updatedBy: userId,
        },
        include: {
          user: { select: { name: true, email: true } },
          ptMember: { include: { trainer: { include: { user: { select: { name: true } } } } } }
        }
      });

      // Create initial payment if provided
      if (data.initialPayment && data.initialPayment > 0) {
        const receiptNo = await this.generateReceiptNo(gymId);
        await tx.memberBalancePayment.create({
          data: {
            receiptNo,
            memberId,
            gymId,
            paymentFor: 'PT',
            paymentDate: new Date(),
            paidFees: data.initialPayment,
            payMode: data.paymentMode || 'CASH',
            notes: 'Initial PT payment',
            createdBy: userId,
          }
        });
      }

      return updatedMember;
    });

    return this.mapMemberToResponse(result);
  }

  // Update PT addon for existing member
  async updatePTAddon(
    gymId: string,
    userId: string,
    memberId: string,
    data: UpdatePTAddonRequest
  ): Promise<Member> {
    // Validate member exists and has PT addon
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: {
        user: { select: { name: true, email: true } },
        ptMember: { include: { trainer: { include: { user: { select: { name: true } } } } } }
      }
    });
    if (!member) throw new NotFoundException('Member not found');
    if (!member.hasPTAddon || !member.ptMember || !member.ptMember.isActive) {
      throw new BadRequestException('Member does not have an active PT addon to update');
    }

    // If trainer is being changed, validate the new trainer
    if (data.trainerId) {
      const trainer = await prisma.trainer.findFirst({
        where: { id: data.trainerId, gymId, isActive: true },
        include: { user: { select: { name: true } } }
      });
      if (!trainer) throw new NotFoundException('Trainer not found or inactive');
    }

    // Calculate PT fees after discount if fees are being updated
    let ptAfterDiscount: number | undefined;
    if (data.ptPackageFees !== undefined || data.ptMaxDiscount !== undefined) {
      const ptPackageFees = data.ptPackageFees ?? (member.ptPackageFees ? Number(member.ptPackageFees) : 0);
      const ptMaxDiscount = data.ptMaxDiscount ?? (member.ptMaxDiscount ? Number(member.ptMaxDiscount) : 0);
      ptAfterDiscount = ptPackageFees - ptMaxDiscount;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update PTMember record
      const ptMemberUpdateData: any = { updatedBy: userId };
      if (data.trainerId) ptMemberUpdateData.trainerId = data.trainerId;
      if (data.ptPackageName) ptMemberUpdateData.packageName = data.ptPackageName;
      if (data.startDate) ptMemberUpdateData.startDate = new Date(data.startDate);
      if (data.endDate) ptMemberUpdateData.endDate = new Date(data.endDate);
      if (data.goals !== undefined) ptMemberUpdateData.goals = data.goals;
      if (data.notes !== undefined) ptMemberUpdateData.notes = data.notes;

      await tx.pTMember.update({
        where: { id: member.ptMember!.id },
        data: ptMemberUpdateData
      });

      // Update Member PT addon fields
      const memberUpdateData: any = { updatedBy: userId };
      if (data.ptPackageName) memberUpdateData.ptPackageName = data.ptPackageName;
      if (data.ptPackageFees !== undefined) memberUpdateData.ptPackageFees = data.ptPackageFees;
      if (data.ptMaxDiscount !== undefined) memberUpdateData.ptMaxDiscount = data.ptMaxDiscount;
      if (ptAfterDiscount !== undefined) memberUpdateData.ptAfterDiscount = ptAfterDiscount;
      if (data.ptExtraDiscount !== undefined) memberUpdateData.ptExtraDiscount = data.ptExtraDiscount;
      if (data.ptFinalFees !== undefined) memberUpdateData.ptFinalFees = data.ptFinalFees;

      const updatedMember = await tx.member.update({
        where: { id: memberId },
        data: memberUpdateData,
        include: {
          user: { select: { name: true, email: true } },
          ptMember: { include: { trainer: { include: { user: { select: { name: true } } } } } }
        }
      });

      return updatedMember;
    });

    return this.mapMemberToResponse(result);
  }

  // Remove PT addon from member
  async removePTAddon(
    gymId: string,
    userId: string,
    memberId: string,
    data: RemovePTAddonRequest
  ): Promise<Member> {
    // Validate member exists and has PT addon
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: {
        user: { select: { name: true, email: true } },
        ptMember: { include: { trainer: { include: { user: { select: { name: true } } } } } }
      }
    });
    if (!member) throw new NotFoundException('Member not found');
    if (!member.hasPTAddon && !member.ptMember) {
      throw new BadRequestException('Member does not have PT addon to remove');
    }

    const ptMember = member.ptMember;
    const sessionsRemaining = ptMember ? ptMember.sessionsTotal - ptMember.sessionsUsed : 0;

    const result = await prisma.$transaction(async (tx) => {
      // Handle based on action
      if (data.action === 'CARRY_FORWARD' && sessionsRemaining > 0) {
        // Create session credit
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months expiry

        await tx.pTSessionCredit.create({
          data: {
            memberId,
            gymId,
            sessionCredits: sessionsRemaining,
            originalPackage: member.ptPackageName || ptMember?.packageName || 'PT Package',
            creditDate: new Date(),
            expiryDate,
            reason: 'PT membership removed - sessions carried forward',
            notes: data.notes,
            createdBy: userId,
          }
        });
      }

      // Deactivate PTMember if exists (but keep record for history)
      if (ptMember) {
        await tx.pTMember.update({
          where: { id: ptMember.id },
          data: {
            isActive: false,
            notes: `${ptMember.notes || ''}\n[Removed on ${new Date().toISOString()}] Action: ${data.action}. ${data.notes || ''}`.trim(),
            updatedBy: userId,
          }
        });
      }

      // Update Member to remove PT addon
      const updatedMember = await tx.member.update({
        where: { id: memberId },
        data: {
          hasPTAddon: false,
          memberType: member.memberType === 'REGULAR_PT' ? 'REGULAR' : member.memberType,
          // Clear PT fields
          ptPackageName: null,
          ptPackageFees: null,
          ptMaxDiscount: null,
          ptAfterDiscount: null,
          ptExtraDiscount: null,
          ptFinalFees: null,
          updatedBy: userId,
        },
        include: {
          user: { select: { name: true, email: true } },
          ptMember: { include: { trainer: { include: { user: { select: { name: true } } } } } }
        }
      });

      return updatedMember;
    });

    return this.mapMemberToResponse(result);
  }

  // Get combined payment summary for Regular + PT fees
  async getMemberPaymentSummary(gymId: string, memberId: string): Promise<MemberPaymentSummary> {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: { user: { select: { name: true } } }
    });
    if (!member) throw new NotFoundException('Member not found');

    // Get all payments grouped by type
    const payments = await prisma.memberBalancePayment.findMany({
      where: { memberId, gymId, isActive: true }
    });

    // Calculate Regular summary
    const regularPayments = payments.filter(p => p.paymentFor === 'REGULAR');
    const regularFinalFees = member.finalFees ? Number(member.finalFees) : 0;
    const regularTotalPaid = regularPayments.reduce((sum, p) => sum + Number(p.paidFees), 0);
    const regularPending = Math.max(0, regularFinalFees - regularTotalPaid);
    const regularStatus = regularFinalFees === 0 ? 'PENDING' :
      regularTotalPaid >= regularFinalFees ? 'PAID' :
        regularTotalPaid > 0 ? 'PARTIAL' : 'PENDING';

    // Calculate PT summary if applicable
    let ptSummary: MemberPaymentSummary['pt'] | undefined;
    if (member.hasPTAddon && member.ptFinalFees) {
      const ptPayments = payments.filter(p => p.paymentFor === 'PT');
      const ptFinalFees = Number(member.ptFinalFees);
      const ptTotalPaid = ptPayments.reduce((sum, p) => sum + Number(p.paidFees), 0);
      const ptPending = Math.max(0, ptFinalFees - ptTotalPaid);
      const ptStatus = ptFinalFees === 0 ? 'PENDING' :
        ptTotalPaid >= ptFinalFees ? 'PAID' :
          ptTotalPaid > 0 ? 'PARTIAL' : 'PENDING';

      ptSummary = {
        finalFees: ptFinalFees,
        totalPaid: ptTotalPaid,
        pendingAmount: ptPending,
        paymentStatus: ptStatus as 'PAID' | 'PARTIAL' | 'PENDING',
        paymentCount: ptPayments.length,
      };
    }

    // Calculate grand totals
    const grandTotal = regularFinalFees + (ptSummary?.finalFees || 0);
    const totalPaid = regularTotalPaid + (ptSummary?.totalPaid || 0);
    const totalPending = regularPending + (ptSummary?.pendingAmount || 0);

    return {
      memberId: member.id,
      memberName: member.user.name,
      regular: {
        finalFees: regularFinalFees,
        totalPaid: regularTotalPaid,
        pendingAmount: regularPending,
        paymentStatus: regularStatus as 'PAID' | 'PARTIAL' | 'PENDING',
        paymentCount: regularPayments.length,
      },
      pt: ptSummary,
      grandTotal,
      totalPaid,
      totalPending,
    };
  }

  // Get session credits for a member
  async getMemberSessionCredits(gymId: string, memberId: string): Promise<PTSessionCredit[]> {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId }
    });
    if (!member) throw new NotFoundException('Member not found');

    const credits = await prisma.pTSessionCredit.findMany({
      where: { memberId, gymId, isActive: true },
      include: { member: { include: { user: { select: { name: true } } } } },
      orderBy: { expiryDate: 'asc' }
    });

    return credits.map(credit => ({
      id: credit.id,
      memberId: credit.memberId,
      memberName: credit.member.user.name,
      sessionCredits: credit.sessionCredits,
      usedCredits: credit.usedCredits,
      remainingCredits: credit.sessionCredits - credit.usedCredits,
      originalPackage: credit.originalPackage,
      creditDate: credit.creditDate,
      expiryDate: credit.expiryDate,
      reason: credit.reason || undefined,
      notes: credit.notes || undefined,
      isActive: credit.isActive,
      gymId: credit.gymId,
      createdAt: credit.createdAt,
    }));
  }

  // Helper method to map member to response with PT info
  private mapMemberToResponse(member: any): Member {
    const ptInfo = member.ptMember && member.ptMember.isActive !== false ? {
      trainerId: member.ptMember.trainerId,
      trainerName: member.ptMember.trainer?.user?.name || 'Unknown',
      sessionsTotal: member.ptMember.sessionsTotal,
      sessionsUsed: member.ptMember.sessionsUsed,
      sessionsRemaining: member.ptMember.sessionsTotal - member.ptMember.sessionsUsed,
      sessionDuration: member.ptMember.sessionDuration,
      startDate: member.ptMember.startDate,
      endDate: member.ptMember.endDate || undefined,
      goals: member.ptMember.goals || undefined,
    } : undefined;

    return {
      id: member.id,
      memberId: member.memberId || undefined,
      email: member.user.email,
      firstName: member.user.name.split(' ')[0] || member.user.name,
      lastName: member.user.name.split(' ').slice(1).join(' ') || '',
      phone: member.phone || undefined,
      altContactNo: member.altContactNo || undefined,
      address: member.address || undefined,
      gender: member.gender || undefined,
      occupation: member.occupation || undefined,
      maritalStatus: member.maritalStatus || undefined,
      bloodGroup: member.bloodGroup || undefined,
      dateOfBirth: member.dateOfBirth || undefined,
      anniversaryDate: member.anniversaryDate || undefined,
      emergencyContact: member.emergencyContact || undefined,
      healthNotes: member.healthNotes || undefined,
      idProofType: member.idProofType || undefined,
      idProofDocument: member.idProofDocument || undefined,
      memberPhoto: member.memberPhoto || undefined,
      smsFacility: member.smsFacility,
      isActive: member.isActive,
      gymId: member.gymId,
      memberType: member.memberType,
      membershipStartDate: member.membershipStart,
      membershipEndDate: member.membershipEnd,
      coursePackageId: member.coursePackageId || undefined,
      packageFees: member.packageFees ? Number(member.packageFees) : undefined,
      maxDiscount: member.maxDiscount ? Number(member.maxDiscount) : undefined,
      afterDiscount: member.afterDiscount ? Number(member.afterDiscount) : undefined,
      extraDiscount: member.extraDiscount ? Number(member.extraDiscount) : undefined,
      finalFees: member.finalFees ? Number(member.finalFees) : undefined,
      // PT Addon Fields
      hasPTAddon: member.hasPTAddon,
      ptPackageName: member.ptPackageName || undefined,
      ptPackageFees: member.ptPackageFees ? Number(member.ptPackageFees) : undefined,
      ptMaxDiscount: member.ptMaxDiscount ? Number(member.ptMaxDiscount) : undefined,
      ptAfterDiscount: member.ptAfterDiscount ? Number(member.ptAfterDiscount) : undefined,
      ptExtraDiscount: member.ptExtraDiscount ? Number(member.ptExtraDiscount) : undefined,
      ptFinalFees: member.ptFinalFees ? Number(member.ptFinalFees) : undefined,
      ptInfo,
      createdAt: member.createdAt,
      createdBy: member.createdBy || undefined,
      updatedBy: member.updatedBy || undefined,
    };
  }

  // Get Member Membership Details
  async getMemberMembershipDetails(gymId: string, memberId: string): Promise<MemberMembershipDetailsResponse> {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: {
        ptMember: {
          include: {
            trainer: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!member) throw new NotFoundException('Member not found');

    // Get all balance payments for this member
    const allPayments = await prisma.memberBalancePayment.findMany({
      where: { memberId, gymId, isActive: true },
      select: { paidFees: true, paymentFor: true }
    });

    // Calculate total paid for REGULAR payments
    const regularPayments = allPayments.filter(p => p.paymentFor === 'REGULAR');
    const totalPaidRegular = regularPayments.reduce((sum, p) => sum + Number(p.paidFees), 0);

    // Calculate total paid for PT payments
    const ptPayments = allPayments.filter(p => p.paymentFor === 'PT');
    const totalPaidPT = ptPayments.reduce((sum, p) => sum + Number(p.paidFees), 0);

    // Determine if member has regular membership
    const hasRegularMembership = !!member.packageFees && Number(member.packageFees) > 0;

    // Determine if member has PT membership
    const hasPTMembership = member.hasPTAddon && !!member.ptPackageFees && Number(member.ptPackageFees) > 0;

    const response: MemberMembershipDetailsResponse = {
      hasRegularMembership,
      hasPTMembership,
    };

    // Add regular membership details if exists
    if (hasRegularMembership) {
      const finalFees = member.finalFees ? Number(member.finalFees) : Number(member.packageFees);
      const totalPendingRegular = Math.max(0, finalFees - totalPaidRegular);

      response.regularMembershipDetails = {
        packageFees: Number(member.packageFees),
        maxDiscount: member.maxDiscount ? Number(member.maxDiscount) : 0,
        afterDiscount: member.afterDiscount ? Number(member.afterDiscount) : Number(member.packageFees),
        extraDiscount: member.extraDiscount ? Number(member.extraDiscount) : 0,
        finalFees,
        totalPaidFees: totalPaidRegular,
        totalPendingFees: totalPendingRegular,
        coursePackageId: member.coursePackageId || undefined,
        membershipStart: member.membershipStart,
        membershipEnd: member.membershipEnd,
        membershipStatus: member.membershipStatus,
      };
    }

    // Add PT membership details if exists
    if (hasPTMembership && member.ptMember) {
      const sessionsRemaining = member.ptMember.sessionsTotal - member.ptMember.sessionsUsed;
      const ptFinalFees = member.ptFinalFees ? Number(member.ptFinalFees) : Number(member.ptPackageFees);
      const totalPendingPT = Math.max(0, ptFinalFees - totalPaidPT);

      response.ptMembershipDetails = {
        packageFees: Number(member.ptPackageFees),
        maxDiscount: member.ptMaxDiscount ? Number(member.ptMaxDiscount) : 0,
        afterDiscount: member.ptAfterDiscount ? Number(member.ptAfterDiscount) : Number(member.ptPackageFees),
        extraDiscount: member.ptExtraDiscount ? Number(member.ptExtraDiscount) : 0,
        finalFees: ptFinalFees,
        totalPaidFees: totalPaidPT,
        totalPendingFees: totalPendingPT,
        packageName: member.ptPackageName || member.ptMember.packageName,
        trainerId: member.ptMember.trainerId,
        trainerName: member.ptMember.trainer.user.name,
        sessionsTotal: member.ptMember.sessionsTotal,
        sessionsUsed: member.ptMember.sessionsUsed,
        sessionsRemaining,
        sessionDuration: member.ptMember.sessionDuration,
        startDate: member.ptMember.startDate,
        endDate: member.ptMember.endDate || undefined,
        goals: member.ptMember.goals || undefined,
      };
    }

    return response;
  }

  // =============================================
  // Diet Template Methods
  // =============================================

  // Create a new diet template
  async createDietTemplate(gymId: string, userId: string, data: CreateDietTemplateRequest): Promise<DietTemplate> {
    // Create the diet template with meals in a transaction
    const template = await prisma.dietTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        gymId,
        createdBy: userId,
        meals: {
          create: data.meals.map(meal => ({
            mealNo: meal.mealNo,
            title: meal.title,
            description: meal.description,
            time: meal.time,
          })),
        },
      },
      include: {
        meals: {
          orderBy: { mealNo: 'asc' },
        },
        creator: {
          select: { name: true },
        },
      },
    });

    return {
      id: template.id,
      name: template.name,
      description: template.description || undefined,
      gymId: template.gymId,
      createdBy: template.createdBy,
      creatorName: template.creator.name,
      isActive: template.isActive,
      meals: template.meals.map(meal => ({
        id: meal.id,
        mealNo: meal.mealNo,
        title: meal.title,
        description: meal.description,
        time: meal.time,
      })),
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  // Get all diet templates for a gym
  async getDietTemplates(gymId: string, params: any): Promise<{ templates: DietTemplate[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc', mealsPerDay, isActive } = params;
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: any = {
      gymId,
      // Filter by active status if provided
      ...(isActive !== undefined && { isActive }),
    };

    // If search is provided, search in template name, description, and meal titles/descriptions
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        // Search in meals (title and description)
        {
          meals: {
            some: {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    // First, get all templates matching the basic criteria
    let [templates, total] = await Promise.all([
      prisma.dietTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          meals: {
            orderBy: { mealNo: 'asc' },
          },
          creator: {
            select: { name: true },
          },
          memberDiets: {
            where: { isActive: true },
            include: {
              member: {
                include: {
                  user: {
                    select: { name: true },
                  },
                },
              },
            },
          },
          _count: {
            select: { meals: true },
          },
        },
      }),
      prisma.dietTemplate.count({ where }),
    ]);

    // Filter by mealsPerDay if provided (post-query filter since Prisma doesn't support count filter directly)
    if (mealsPerDay !== undefined) {
      templates = templates.filter(t => t._count.meals === mealsPerDay);
      // Adjust total count for mealsPerDay filter
      const allTemplatesWithMealCount = await prisma.dietTemplate.findMany({
        where,
        include: {
          _count: {
            select: { meals: true },
          },
        },
      });
      total = allTemplatesWithMealCount.filter(t => t._count.meals === mealsPerDay).length;
    }

    return {
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description || undefined,
        gymId: template.gymId,
        createdBy: template.createdBy,
        creatorName: template.creator.name,
        isActive: template.isActive,
        mealsPerDay: template._count.meals,
        meals: template.meals.map(meal => ({
          id: meal.id,
          mealNo: meal.mealNo,
          title: meal.title,
          description: meal.description,
          time: meal.time,
        })),
        assignedMembers: template.memberDiets.map(md => ({
          memberDietId: md.id,
          memberId: md.member.id,
          memberCode: md.member.memberId,
          memberName: md.member.user.name,
          mobileNo: md.member.phone,
          memberType: md.member.memberType,
          hasPTAddon: md.member.hasPTAddon,
          startDate: md.startDate,
          endDate: md.endDate,
        })),
        assignedMemberCount: template.memberDiets.length,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      })),
      total,
    };
  }

  // Get a single diet template by ID
  async getDietTemplateById(gymId: string, templateId: string): Promise<DietTemplate> {
    const template = await prisma.dietTemplate.findFirst({
      where: {
        id: templateId,
        gymId,
      },
      include: {
        meals: {
          orderBy: { mealNo: 'asc' },
        },
        creator: {
          select: { name: true },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Diet template not found');
    }

    return {
      id: template.id,
      name: template.name,
      description: template.description || undefined,
      gymId: template.gymId,
      createdBy: template.createdBy,
      creatorName: template.creator.name,
      isActive: template.isActive,
      meals: template.meals.map(meal => ({
        id: meal.id,
        mealNo: meal.mealNo,
        title: meal.title,
        description: meal.description,
        time: meal.time,
      })),
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  // Update a diet template
  async updateDietTemplate(gymId: string, templateId: string, data: UpdateDietTemplateRequest): Promise<DietTemplate> {
    // Check if template exists
    const existing = await prisma.dietTemplate.findFirst({
      where: { id: templateId, gymId },
    });

    if (!existing) {
      throw new NotFoundException('Diet template not found');
    }

    // Update in a transaction
    const template = await prisma.$transaction(async (tx) => {
      // If meals are provided, delete existing and create new ones
      if (data.meals) {
        await tx.dietMeal.deleteMany({
          where: { dietTemplateId: templateId },
        });
      }

      return tx.dietTemplate.update({
        where: { id: templateId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.meals && {
            meals: {
              create: data.meals.map(meal => ({
                mealNo: meal.mealNo,
                title: meal.title,
                description: meal.description,
                time: meal.time,
              })),
            },
          }),
        },
        include: {
          meals: {
            orderBy: { mealNo: 'asc' },
          },
          creator: {
            select: { name: true },
          },
        },
      });
    });

    return {
      id: template.id,
      name: template.name,
      description: template.description || undefined,
      gymId: template.gymId,
      createdBy: template.createdBy,
      creatorName: template.creator.name,
      isActive: template.isActive,
      meals: template.meals.map(meal => ({
        id: meal.id,
        mealNo: meal.mealNo,
        title: meal.title,
        description: meal.description,
        time: meal.time,
      })),
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  // Toggle diet template active status
  async toggleDietTemplateActive(gymId: string, templateId: string, isActive: boolean): Promise<DietTemplate> {
    const existing = await prisma.dietTemplate.findFirst({
      where: { id: templateId, gymId },
    });

    if (!existing) {
      throw new NotFoundException('Diet template not found');
    }

    const template = await prisma.dietTemplate.update({
      where: { id: templateId },
      data: { isActive },
      include: {
        meals: {
          orderBy: { mealNo: 'asc' },
        },
        creator: {
          select: { name: true },
        },
      },
    });

    return {
      id: template.id,
      name: template.name,
      description: template.description || undefined,
      gymId: template.gymId,
      createdBy: template.createdBy,
      creatorName: template.creator.name,
      isActive: template.isActive,
      meals: template.meals.map(meal => ({
        id: meal.id,
        mealNo: meal.mealNo,
        title: meal.title,
        description: meal.description,
        time: meal.time,
      })),
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  // =============================================
  // Member Diet Methods
  // =============================================

  // Assign a diet to multiple members
  async createMemberDiet(gymId: string, userId: string, data: CreateMemberDietRequest): Promise<MemberDiet[]> {
    // Verify diet template exists and belongs to gym
    const template = await prisma.dietTemplate.findFirst({
      where: { id: data.dietTemplateId, gymId },
      include: { meals: { orderBy: { mealNo: 'asc' } } },
    });

    if (!template) {
      throw new NotFoundException('Diet template not found');
    }

    // Verify all members exist and belong to gym
    const members = await prisma.member.findMany({
      where: { id: { in: data.memberIds }, gymId },
      include: { user: { select: { name: true, email: true } } },
    });

    if (members.length !== data.memberIds.length) {
      const foundMemberIds = members.map(m => m.id);
      const notFoundIds = data.memberIds.filter(id => !foundMemberIds.includes(id));
      throw new NotFoundException(`Members not found: ${notFoundIds.join(', ')}`);
    }

    // Determine meals to use (custom or from template)
    const mealsToCreate = data.customMeals && data.customMeals.length > 0
      ? data.customMeals
      : template.meals;

    // Create diet assignments for all members in a transaction
    const memberDiets = await prisma.$transaction(async (tx) => {
      const createdDiets: any[] = [];

      for (const memberId of data.memberIds) {
        // Deactivate any existing active diet for this member
        await tx.memberDiet.updateMany({
          where: {
            memberId,
            gymId,
            isActive: true,
          },
          data: { isActive: false },
        });

        // Create the member diet assignment with meals
        const memberDiet = await tx.memberDiet.create({
          data: {
            memberId,
            dietTemplateId: data.dietTemplateId,
            gymId,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
            assignedBy: userId,
            notes: data.notes,
            meals: {
              create: mealsToCreate.map(meal => ({
                mealNo: meal.mealNo,
                title: meal.title,
                description: meal.description,
                time: meal.time,
              })),
            },
          },
          include: {
            meals: {
              orderBy: { mealNo: 'asc' },
            },
            member: {
              include: { user: { select: { name: true, email: true } } },
            },
            dietTemplate: {
              select: { name: true },
            },
            assigner: {
              select: { name: true },
            },
          },
        });

        createdDiets.push(memberDiet);
      }

      return createdDiets;
    });

    return memberDiets.map(memberDiet => ({
      id: memberDiet.id,
      memberId: memberDiet.memberId,
      memberName: memberDiet.member.user.name,
      memberEmail: memberDiet.member.user.email,
      dietTemplateId: memberDiet.dietTemplateId,
      dietTemplateName: memberDiet.dietTemplate.name,
      gymId: memberDiet.gymId,
      startDate: memberDiet.startDate,
      endDate: memberDiet.endDate || undefined,
      assignedBy: memberDiet.assignedBy,
      assignerName: memberDiet.assigner.name,
      isActive: memberDiet.isActive,
      notes: memberDiet.notes || undefined,
      meals: memberDiet.meals.map((meal: any) => ({
        id: meal.id,
        mealNo: meal.mealNo,
        title: meal.title,
        description: meal.description,
        time: meal.time,
      })),
      createdAt: memberDiet.createdAt,
      updatedAt: memberDiet.updatedAt,
    }));
  }

  // Get all diets for a member
  async getMemberDiets(gymId: string, memberId: string, params: PaginationParams): Promise<{ diets: MemberDiet[]; total: number }> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    // Verify member exists and belongs to gym
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const where = {
      memberId,
      gymId,
    };

    const [diets, total] = await Promise.all([
      prisma.memberDiet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          meals: {
            orderBy: { mealNo: 'asc' },
          },
          member: {
            include: { user: { select: { name: true, email: true } } },
          },
          dietTemplate: {
            select: { name: true },
          },
          assigner: {
            select: { name: true },
          },
        },
      }),
      prisma.memberDiet.count({ where }),
    ]);

    return {
      diets: diets.map(diet => ({
        id: diet.id,
        memberId: diet.memberId,
        memberName: diet.member.user.name,
        memberEmail: diet.member.user.email,
        dietTemplateId: diet.dietTemplateId,
        dietTemplateName: diet.dietTemplate.name,
        gymId: diet.gymId,
        startDate: diet.startDate,
        endDate: diet.endDate || undefined,
        assignedBy: diet.assignedBy,
        assignerName: diet.assigner.name,
        isActive: diet.isActive,
        notes: diet.notes || undefined,
        meals: diet.meals.map(meal => ({
          id: meal.id,
          mealNo: meal.mealNo,
          title: meal.title,
          description: meal.description,
          time: meal.time,
        })),
        createdAt: diet.createdAt,
        updatedAt: diet.updatedAt,
      })),
      total,
    };
  }

  // Get a single member diet by ID
  async getMemberDietById(gymId: string, memberDietId: string): Promise<MemberDiet> {
    const diet = await prisma.memberDiet.findFirst({
      where: {
        id: memberDietId,
        gymId,
      },
      include: {
        meals: {
          orderBy: { mealNo: 'asc' },
        },
        member: {
          include: { user: { select: { name: true, email: true } } },
        },
        dietTemplate: {
          select: { name: true },
        },
        assigner: {
          select: { name: true },
        },
      },
    });

    if (!diet) {
      throw new NotFoundException('Member diet not found');
    }

    return {
      id: diet.id,
      memberId: diet.memberId,
      memberName: diet.member.user.name,
      memberEmail: diet.member.user.email,
      dietTemplateId: diet.dietTemplateId,
      dietTemplateName: diet.dietTemplate.name,
      gymId: diet.gymId,
      startDate: diet.startDate,
      endDate: diet.endDate || undefined,
      assignedBy: diet.assignedBy,
      assignerName: diet.assigner.name,
      isActive: diet.isActive,
      notes: diet.notes || undefined,
      meals: diet.meals.map(meal => ({
        id: meal.id,
        mealNo: meal.mealNo,
        title: meal.title,
        description: meal.description,
        time: meal.time,
      })),
      createdAt: diet.createdAt,
      updatedAt: diet.updatedAt,
    };
  }

  // Update a member diet
  async updateMemberDiet(gymId: string, memberDietId: string, data: UpdateMemberDietRequest): Promise<MemberDiet> {
    const existing = await prisma.memberDiet.findFirst({
      where: { id: memberDietId, gymId },
    });

    if (!existing) {
      throw new NotFoundException('Member diet not found');
    }

    // Update in a transaction
    const diet = await prisma.$transaction(async (tx) => {
      // If meals are provided, delete existing and create new ones
      if (data.meals && data.meals.length > 0) {
        await tx.memberDietMeal.deleteMany({
          where: { memberDietId },
        });
      }

      return tx.memberDiet.update({
        where: { id: memberDietId },
        data: {
          ...(data.startDate && { startDate: new Date(data.startDate) }),
          ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.meals && data.meals.length > 0 && {
            meals: {
              create: data.meals.map(meal => ({
                mealNo: meal.mealNo,
                title: meal.title,
                description: meal.description,
                time: meal.time,
              })),
            },
          }),
        },
        include: {
          meals: {
            orderBy: { mealNo: 'asc' },
          },
          member: {
            include: { user: { select: { name: true, email: true } } },
          },
          dietTemplate: {
            select: { name: true },
          },
          assigner: {
            select: { name: true },
          },
        },
      });
    });

    return {
      id: diet.id,
      memberId: diet.memberId,
      memberName: diet.member.user.name,
      memberEmail: diet.member.user.email,
      dietTemplateId: diet.dietTemplateId,
      dietTemplateName: diet.dietTemplate.name,
      gymId: diet.gymId,
      startDate: diet.startDate,
      endDate: diet.endDate || undefined,
      assignedBy: diet.assignedBy,
      assignerName: diet.assigner.name,
      isActive: diet.isActive,
      notes: diet.notes || undefined,
      meals: diet.meals.map(meal => ({
        id: meal.id,
        mealNo: meal.mealNo,
        title: meal.title,
        description: meal.description,
        time: meal.time,
      })),
      createdAt: diet.createdAt,
      updatedAt: diet.updatedAt,
    };
  }

  // Deactivate a member diet
  async deactivateMemberDiet(gymId: string, memberDietId: string, reason?: string): Promise<MemberDiet> {
    const existing = await prisma.memberDiet.findFirst({
      where: { id: memberDietId, gymId },
    });

    if (!existing) {
      throw new NotFoundException('Member diet not found');
    }

    const diet = await prisma.memberDiet.update({
      where: { id: memberDietId },
      data: {
        isActive: false,
        notes: reason ? `${existing.notes || ''}\nDeactivated: ${reason}`.trim() : existing.notes,
      },
      include: {
        meals: {
          orderBy: { mealNo: 'asc' },
        },
        member: {
          include: { user: { select: { name: true, email: true } } },
        },
        dietTemplate: {
          select: { name: true },
        },
        assigner: {
          select: { name: true },
        },
      },
    });

    return {
      id: diet.id,
      memberId: diet.memberId,
      memberName: diet.member.user.name,
      memberEmail: diet.member.user.email,
      dietTemplateId: diet.dietTemplateId,
      dietTemplateName: diet.dietTemplate.name,
      gymId: diet.gymId,
      startDate: diet.startDate,
      endDate: diet.endDate || undefined,
      assignedBy: diet.assignedBy,
      assignerName: diet.assigner.name,
      isActive: diet.isActive,
      notes: diet.notes || undefined,
      meals: diet.meals.map(meal => ({
        id: meal.id,
        mealNo: meal.mealNo,
        title: meal.title,
        description: meal.description,
        time: meal.time,
      })),
      createdAt: diet.createdAt,
      updatedAt: diet.updatedAt,
    };
  }

  // Remove multiple assigned members from diet templates (bulk delete)
  async removeAssignedMembers(gymId: string, memberDietIds: string[]): Promise<{ deletedCount: number; deletedIds: string[] }> {
    // Verify all member diets exist and belong to the gym
    const existingDiets = await prisma.memberDiet.findMany({
      where: {
        id: { in: memberDietIds },
        gymId,
      },
      select: {
        id: true,
        member: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (existingDiets.length === 0) {
      throw new NotFoundException('No valid member diet assignments found');
    }

    // Get the IDs that were found
    const foundIds = existingDiets.map(d => d.id);

    // Delete the member diet meals first (cascade should handle this, but being explicit)
    await prisma.memberDietMeal.deleteMany({
      where: {
        memberDietId: { in: foundIds },
      },
    });

    // Delete the member diets
    const deleteResult = await prisma.memberDiet.deleteMany({
      where: {
        id: { in: foundIds },
        gymId,
      },
    });

    return {
      deletedCount: deleteResult.count,
      deletedIds: foundIds,
    };
  }

  // =============================================
  // Trainer Salary Settlement Methods
  // =============================================

  // Get trainers dropdown for salary settlement
  async getTrainersDropdown(gymId: string): Promise<TrainerDropdownItem[]> {
    const trainers = await prisma.trainer.findMany({
      where: {
        gymId,
        isActive: true,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });

    return trainers.map((trainer) => ({
      trainerId: trainer.id,
      name: trainer.user.name,
      mobileNumber: trainer.phone || undefined,
      joiningDate: trainer.joiningDate || undefined,
      monthlySalary: trainer.salary ? Number(trainer.salary) : undefined,
    }));
  }

  // Calculate salary for a trainer
  async calculateSalary(
    gymId: string,
    data: SalaryCalculationRequest
  ): Promise<SalaryCalculationResponse> {
    // Fetch trainer details
    const trainer = await prisma.trainer.findFirst({
      where: {
        id: data.trainerId,
        gymId,
        isActive: true,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    if (!trainer.salary) {
      throw new BadRequestException('Trainer does not have a monthly salary set');
    }

    // Parse salary month
    const [year, month] = data.salaryMonth.split('-').map(Number);

    // Calculate total days in the month
    const totalDaysInMonth = new Date(year, month, 0).getDate();

    // Validate present days
    if (data.presentDays > totalDaysInMonth) {
      throw new BadRequestException(
        `Present days (${data.presentDays}) cannot exceed total days in month (${totalDaysInMonth})`
      );
    }

    // Calculate absent days
    const absentDays = totalDaysInMonth - data.presentDays;

    // Validate discount days
    const discountDays = data.discountDays || 0;
    if (discountDays > absentDays) {
      throw new BadRequestException(
        `Discount days (${discountDays}) cannot exceed absent days (${absentDays})`
      );
    }

    // Calculate payable days
    const payableDays = data.presentDays + discountDays;

    // Calculate salary
    const monthlySalary = Number(trainer.salary);
    const calculatedSalary = Math.round((monthlySalary / totalDaysInMonth) * payableDays * 100) / 100;

    // Calculate final payable amount
    const incentiveAmount = data.incentiveAmount || 0;
    const finalPayableAmount = Math.round((calculatedSalary + incentiveAmount) * 100) / 100;

    return {
      trainerId: trainer.id,
      trainerName: trainer.user.name,
      mobileNumber: trainer.phone || undefined,
      joiningDate: trainer.joiningDate || undefined,
      monthlySalary,
      salaryMonth: data.salaryMonth,
      totalDaysInMonth,
      presentDays: data.presentDays,
      absentDays,
      discountDays,
      payableDays,
      calculatedSalary,
      incentiveAmount,
      incentiveType: data.incentiveType,
      finalPayableAmount,
    };
  }

  // Create salary settlement
  async createSalarySettlement(
    gymId: string,
    createdBy: string,
    data: CreateSalarySettlementRequest
  ): Promise<TrainerSalarySettlement> {
    // First calculate the salary to get all computed values
    const calculation = await this.calculateSalary(gymId, {
      trainerId: data.trainerId,
      salaryMonth: data.salaryMonth,
      presentDays: data.presentDays,
      discountDays: data.discountDays,
      incentiveAmount: data.incentiveAmount,
      incentiveType: data.incentiveType,
    });

    // Check for duplicate settlement
    const existingSettlement = await prisma.trainerSalarySettlement.findUnique({
      where: {
        trainerId_salaryMonth_gymId: {
          trainerId: data.trainerId,
          salaryMonth: data.salaryMonth,
          gymId,
        },
      },
    });

    if (existingSettlement) {
      throw new ConflictException(
        `Salary settlement already exists for this trainer for ${data.salaryMonth}`
      );
    }

    // Create the settlement
    const settlement = await prisma.trainerSalarySettlement.create({
      data: {
        trainerId: data.trainerId,
        trainerName: calculation.trainerName,
        mobileNumber: calculation.mobileNumber,
        joiningDate: calculation.joiningDate,
        monthlySalary: calculation.monthlySalary,
        salaryMonth: data.salaryMonth,
        salarySentDate: data.salarySentDate ? new Date(data.salarySentDate) : new Date(),
        totalDaysInMonth: calculation.totalDaysInMonth,
        presentDays: calculation.presentDays,
        absentDays: calculation.absentDays,
        discountDays: calculation.discountDays,
        payableDays: calculation.payableDays,
        calculatedSalary: calculation.calculatedSalary,
        incentiveAmount: calculation.incentiveAmount,
        incentiveType: data.incentiveType as any,
        paymentMode: data.paymentMode as any,
        finalPayableAmount: calculation.finalPayableAmount,
        remarks: data.remarks,
        gymId,
        createdBy,
      },
    });

    return this.mapSettlementToResponse(settlement);
  }

  // Get salary settlements list with filters and pagination
  async getSalarySettlements(
    gymId: string,
    params: SalarySettlementListParams
  ): Promise<SalarySettlementListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      trainerId,
      paymentMode,
      fromDate,
      toDate,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { gymId };

    if (trainerId) {
      where.trainerId = trainerId;
    }

    if (paymentMode) {
      where.paymentMode = paymentMode;
    }

    if (fromDate || toDate) {
      where.salarySentDate = {};
      if (fromDate) {
        where.salarySentDate.gte = new Date(fromDate);
      }
      if (toDate) {
        // Add 1 day to include the end date fully
        const endDate = new Date(toDate);
        endDate.setDate(endDate.getDate() + 1);
        where.salarySentDate.lt = endDate;
      }
    }

    if (search) {
      where.OR = [
        { trainerName: { contains: search, mode: 'insensitive' } },
        { mobileNumber: { contains: search, mode: 'insensitive' } },
        { remarks: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get settlements and count in parallel
    const [settlements, total, totalAmountResult] = await Promise.all([
      prisma.trainerSalarySettlement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.trainerSalarySettlement.count({ where }),
      prisma.trainerSalarySettlement.aggregate({
        where,
        _sum: { finalPayableAmount: true },
      }),
    ]);

    return {
      settlements: settlements.map(this.mapSettlementToResponse),
      total,
      page,
      limit,
      totalAmount: Number(totalAmountResult._sum.finalPayableAmount || 0),
    };
  }

  // Get salary settlement by ID
  async getSalarySettlementById(gymId: string, settlementId: string): Promise<TrainerSalarySettlement> {
    const settlement = await prisma.trainerSalarySettlement.findFirst({
      where: {
        id: settlementId,
        gymId,
      },
    });

    if (!settlement) {
      throw new NotFoundException('Salary settlement not found');
    }

    return this.mapSettlementToResponse(settlement);
  }

  // Update salary settlement
  async updateSalarySettlement(
    gymId: string,
    settlementId: string,
    data: UpdateSalarySettlementRequest
  ): Promise<TrainerSalarySettlement> {
    // Find existing settlement
    const existingSettlement = await prisma.trainerSalarySettlement.findFirst({
      where: {
        id: settlementId,
        gymId,
      },
    });

    if (!existingSettlement) {
      throw new NotFoundException('Salary settlement not found');
    }

    // Prepare update data
    const updateData: any = {};

    if (data.salarySentDate !== undefined) {
      updateData.salarySentDate = new Date(data.salarySentDate);
    }

    if (data.paymentMode !== undefined) {
      updateData.paymentMode = data.paymentMode;
    }

    if (data.remarks !== undefined) {
      updateData.remarks = data.remarks;
    }

    if (data.incentiveType !== undefined) {
      updateData.incentiveType = data.incentiveType;
    }

    // If presentDays, discountDays, or incentiveAmount are updated, recalculate
    const needsRecalculation =
      data.presentDays !== undefined ||
      data.discountDays !== undefined ||
      data.incentiveAmount !== undefined;

    if (needsRecalculation) {
      const presentDays = data.presentDays ?? existingSettlement.presentDays;
      const discountDays = data.discountDays ?? existingSettlement.discountDays;
      const incentiveAmount = data.incentiveAmount ?? Number(existingSettlement.incentiveAmount);
      const totalDaysInMonth = existingSettlement.totalDaysInMonth;
      const monthlySalary = Number(existingSettlement.monthlySalary);

      // Validate present days
      if (presentDays > totalDaysInMonth) {
        throw new BadRequestException(
          `Present days (${presentDays}) cannot exceed total days in month (${totalDaysInMonth})`
        );
      }

      const absentDays = totalDaysInMonth - presentDays;

      // Validate discount days
      if (discountDays > absentDays) {
        throw new BadRequestException(
          `Discount days (${discountDays}) cannot exceed absent days (${absentDays})`
        );
      }

      const payableDays = presentDays + discountDays;
      const calculatedSalary = Math.round((monthlySalary / totalDaysInMonth) * payableDays * 100) / 100;
      const finalPayableAmount = Math.round((calculatedSalary + incentiveAmount) * 100) / 100;

      updateData.presentDays = presentDays;
      updateData.absentDays = absentDays;
      updateData.discountDays = discountDays;
      updateData.payableDays = payableDays;
      updateData.calculatedSalary = calculatedSalary;
      updateData.incentiveAmount = incentiveAmount;
      updateData.finalPayableAmount = finalPayableAmount;
    }

    const updatedSettlement = await prisma.trainerSalarySettlement.update({
      where: { id: settlementId },
      data: updateData,
    });

    return this.mapSettlementToResponse(updatedSettlement);
  }

  // Helper to map Prisma result to response type
  private mapSettlementToResponse(settlement: any): TrainerSalarySettlement {
    return {
      id: settlement.id,
      trainerId: settlement.trainerId,
      trainerName: settlement.trainerName,
      mobileNumber: settlement.mobileNumber || undefined,
      joiningDate: settlement.joiningDate || undefined,
      monthlySalary: Number(settlement.monthlySalary),
      salaryMonth: settlement.salaryMonth,
      salarySentDate: settlement.salarySentDate || undefined,
      totalDaysInMonth: settlement.totalDaysInMonth,
      presentDays: settlement.presentDays,
      absentDays: settlement.absentDays,
      discountDays: settlement.discountDays,
      payableDays: settlement.payableDays,
      calculatedSalary: Number(settlement.calculatedSalary),
      incentiveAmount: Number(settlement.incentiveAmount),
      incentiveType: settlement.incentiveType as IncentiveType | undefined,
      paymentMode: settlement.paymentMode,
      finalPayableAmount: Number(settlement.finalPayableAmount),
      remarks: settlement.remarks || undefined,
      gymId: settlement.gymId,
      createdBy: settlement.createdBy,
      createdAt: settlement.createdAt,
      updatedAt: settlement.updatedAt,
    };
  }

  // =============================================
  // Trainer Salary Slip Methods
  // =============================================

  /**
   * Generate salary slip for a settlement
   * Accessible by GYM_OWNER (any trainer) and TRAINER (own only)
   */
  async generateSalarySlip(
    gymId: string,
    settlementId: string,
    requestingTrainerId?: string // If provided, validates trainer can only access own slip
  ): Promise<TrainerSalarySlip> {
    // Fetch settlement with gym and trainer details
    const settlement = await prisma.trainerSalarySettlement.findFirst({
      where: {
        id: settlementId,
        gymId,
        ...(requestingTrainerId && { trainerId: requestingTrainerId }),
      },
      include: {
        gym: true,
        trainer: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
    });

    if (!settlement) {
      throw new NotFoundException('Salary settlement not found');
    }

    // Parse salary month for period dates
    const [year, month] = settlement.salaryMonth.split('-').map(Number);
    const periodStartDate = new Date(year, month - 1, 1);
    const periodEndDate = new Date(year, month, 0); // Last day of month

    // Format salary period
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const salaryPeriod = `${monthNames[month - 1]} ${year}`;

    // Build gym details
    const gym = settlement.gym;
    const fullAddress = [
      gym.address1,
      gym.address2,
      gym.city,
      gym.state,
      gym.zipcode,
    ].filter(Boolean).join(', ');

    const gymDetails: SalarySlipGymDetails = {
      gymId: gym.id,
      gymName: gym.name,
      address1: gym.address1 || undefined,
      address2: gym.address2 || undefined,
      city: gym.city || undefined,
      state: gym.state || undefined,
      zipcode: gym.zipcode || undefined,
      fullAddress: fullAddress || 'N/A',
      mobileNo: gym.mobileNo || undefined,
      phoneNo: gym.phoneNo || undefined,
      email: gym.email || undefined,
      gstRegNo: gym.gstRegNo || undefined,
      gymLogo: gym.gymLogo || undefined,
    };

    // Build trainer details
    const trainer = settlement.trainer;
    const trainerDetails: SalarySlipTrainerDetails = {
      trainerId: trainer.id,
      trainerName: settlement.trainerName,
      email: trainer.user.email,
      mobileNumber: settlement.mobileNumber || trainer.phone || undefined,
      gender: trainer.gender || undefined,
      designation: trainer.specialization || 'Trainer',
      joiningDate: settlement.joiningDate || trainer.joiningDate || undefined,
      employeeCode: trainer.id.substring(0, 8).toUpperCase(), // First 8 chars as employee code
    };

    // Build attendance summary
    const attendancePercentage = Math.round(
      (settlement.presentDays / settlement.totalDaysInMonth) * 100 * 100
    ) / 100;

    const attendance: SalarySlipAttendance = {
      totalDaysInMonth: settlement.totalDaysInMonth,
      presentDays: settlement.presentDays,
      absentDays: settlement.absentDays,
      discountDays: settlement.discountDays,
      payableDays: settlement.payableDays,
      attendancePercentage,
    };

    // Build earnings
    const calculatedSalary = Number(settlement.calculatedSalary);
    const incentiveAmount = Number(settlement.incentiveAmount);
    const grossEarnings = calculatedSalary + incentiveAmount;

    const earnings: SalarySlipEarnings = {
      basicSalary: Number(settlement.monthlySalary),
      calculatedSalary,
      incentiveAmount,
      incentiveType: settlement.incentiveType as IncentiveType | undefined,
      grossEarnings,
    };

    // Deductions (placeholder for future)
    const deductions = {
      totalDeductions: 0,
      items: [] as { name: string; amount: number }[],
    };

    // Net payable
    const netPayableAmount = Number(settlement.finalPayableAmount);
    const netPayableInWords = this.numberToWords(netPayableAmount);

    // Payment details
    const paymentDetails: SalarySlipPaymentDetails = {
      paymentMode: settlement.paymentMode as any,
      paymentDate: settlement.salarySentDate || undefined,
      transactionRef: undefined, // Future scope
    };

    // Generate slip number
    const slipNumber = `SAL-${settlement.salaryMonth.replace('-', '')}-${settlement.id.substring(0, 6).toUpperCase()}`;

    return {
      slipId: settlement.id,
      slipNumber,
      generatedDate: new Date(),
      salaryMonth: settlement.salaryMonth,
      salaryPeriod,
      periodStartDate,
      periodEndDate,
      gymDetails,
      trainerDetails,
      attendance,
      earnings,
      deductions,
      netPayableAmount,
      netPayableInWords,
      paymentDetails,
      remarks: settlement.remarks || undefined,
      createdAt: settlement.createdAt,
    };
  }

  /**
   * Convert number to words (Indian format)
   */
  private numberToWords(num: number): string {
    if (num === 0) return 'Zero Rupees Only';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWords = (n: number): string => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
      return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let result = numToWords(rupees) + ' Rupees';
    if (paise > 0) {
      result += ' and ' + numToWords(paise) + ' Paise';
    }
    result += ' Only';

    return result;
  }

  // =============================================
  // Gym Subscription History (Gym Owner)
  // =============================================

  async getMySubscriptionHistory(gymId: string, params: PaginationParams) {
    const { page = 1, limit = 10, sortBy = 'renewalDate', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = { gymId };

    const [history, total] = await Promise.all([
      prisma.gymSubscriptionHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          subscriptionPlan: { select: { name: true, price: true, durationDays: true } },
        },
      }),
      prisma.gymSubscriptionHistory.count({ where }),
    ]);

    return { history, total };
  }

  async getCurrentSubscription(gymId: string) {
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      include: {
        subscriptionPlan: true,
      },
    });
    if (!gym) throw new NotFoundException('Gym not found');

    // Fetch the active history record
    const activeHistory = await prisma.gymSubscriptionHistory.findFirst({
      where: { gymId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate days remaining
    let daysRemaining = 0;
    let isExpired = true;
    if (gym.subscriptionEnd) {
      const now = new Date();
      const diffTime = gym.subscriptionEnd.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      isExpired = daysRemaining <= 0;
    }

    return {
      plan: gym.subscriptionPlan
        ? {
            id: gym.subscriptionPlan.id,
            name: gym.subscriptionPlan.name,
            description: gym.subscriptionPlan.description,
            price: Number(gym.subscriptionPlan.price),
            currency: gym.subscriptionPlan.priceCurrency,
            durationDays: gym.subscriptionPlan.durationDays,
            features: gym.subscriptionPlan.features || '',
          }
        : null,
      subscriptionStart: gym.subscriptionStart,
      subscriptionEnd: gym.subscriptionEnd,
      daysRemaining,
      isExpired,
      subscriptionHistory: activeHistory
        ? {
            id: activeHistory.id,
            subscriptionNumber: activeHistory.subscriptionNumber,
            renewalType: activeHistory.renewalType,
            renewalDate: activeHistory.renewalDate,
            planAmount: activeHistory.planAmount ? Number(activeHistory.planAmount) : null,
            extraDiscount: activeHistory.extraDiscount ? Number(activeHistory.extraDiscount) : null,
            amount: Number(activeHistory.amount),
            paymentStatus: activeHistory.paymentStatus,
            paymentMode: activeHistory.paymentMode,
            paidAmount: activeHistory.paidAmount ? Number(activeHistory.paidAmount) : null,
            pendingAmount: activeHistory.pendingAmount ? Number(activeHistory.pendingAmount) : null,
          }
        : null,
    };
  }

  // =============================================
  // Expense Report (Combined Expenses + Salary Settlements)
  // =============================================

  async getExpenseReport(gymId: string, params: ExpenseReportParams): Promise<ExpenseReportResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      year,
      month,
      dateFrom,
      dateTo,
      expenseType,
      expenseGroupId,
      paymentMode,
    } = params;

    const skip = (page - 1) * limit;

    // Build date filters
    let dateFilter: { gte?: Date; lte?: Date } = {};

    if (year && month) {
      // Specific month of a year
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter = { gte: startDate, lte: endDate };
    } else if (year) {
      // Entire year
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter = { gte: startDate, lte: endDate };
    } else if (dateFrom || dateTo) {
      // Custom date range
      if (dateFrom) {
        dateFilter.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.lte = endDate;
      }
    }

    // Fetch expenses if not filtering for SALARY only
    let expenses: ExpenseReportItem[] = [];
    let expenseTotal = 0;
    let expenseCount = 0;
    let totalExpenseAmount = 0;

    if (!expenseType || expenseType === 'EXPENSE') {
      const expenseWhere: any = {
        gymId,
        isActive: true,
        ...(Object.keys(dateFilter).length > 0 && { expenseDate: dateFilter }),
        ...(expenseGroupId && { expenseGroupId }),
        ...(paymentMode && { paymentMode }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { expenseGroup: { expenseGroupName: { contains: search, mode: 'insensitive' } } },
          ],
        }),
      };

      const [expenseRecords, expenseCountResult, expenseSum] = await Promise.all([
        prisma.expenseMaster.findMany({
          where: expenseWhere,
          include: { expenseGroup: true },
          orderBy: sortBy === 'date' ? { expenseDate: sortOrder } : { [sortBy]: sortOrder },
        }),
        prisma.expenseMaster.count({ where: expenseWhere }),
        prisma.expenseMaster.aggregate({
          where: expenseWhere,
          _sum: { amount: true },
        }),
      ]);

      expenseCount = expenseCountResult;
      totalExpenseAmount = Number(expenseSum._sum.amount || 0);

      expenses = expenseRecords.map((e): ExpenseReportItem => ({
        id: e.id,
        date: e.expenseDate,
        name: e.name,
        description: e.description || undefined,
        category: e.expenseGroup.expenseGroupName,
        amount: Number(e.amount),
        paymentMode: e.paymentMode as PaymentMode,
        type: 'EXPENSE',
        expenseGroupId: e.expenseGroupId,
        attachments: e.attachments,
        createdAt: e.createdAt,
      }));
    }

    // Fetch salary settlements if not filtering for EXPENSE only
    let salaries: ExpenseReportItem[] = [];
    let salaryCount = 0;
    let totalSalaryAmount = 0;

    if (!expenseType || expenseType === 'SALARY') {
      // For salary, filter by salarySentDate or createdAt
      const salaryWhere: any = {
        gymId,
        ...(Object.keys(dateFilter).length > 0 && { salarySentDate: dateFilter }),
        ...(paymentMode && { paymentMode }),
        ...(search && {
          OR: [
            { trainerName: { contains: search, mode: 'insensitive' } },
            { remarks: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const [salaryRecords, salaryCountResult, salarySum] = await Promise.all([
        prisma.trainerSalarySettlement.findMany({
          where: salaryWhere,
          orderBy: sortBy === 'date' ? { salarySentDate: sortOrder } : { createdAt: sortOrder },
        }),
        prisma.trainerSalarySettlement.count({ where: salaryWhere }),
        prisma.trainerSalarySettlement.aggregate({
          where: salaryWhere,
          _sum: { finalPayableAmount: true },
        }),
      ]);

      salaryCount = salaryCountResult;
      totalSalaryAmount = Number(salarySum._sum.finalPayableAmount || 0);

      salaries = salaryRecords.map((s): ExpenseReportItem => ({
        id: s.id,
        date: s.salarySentDate || s.createdAt,
        name: `Salary - ${s.trainerName}`,
        description: s.remarks || undefined,
        category: 'Salary Settlement',
        amount: Number(s.finalPayableAmount),
        paymentMode: s.paymentMode as PaymentMode,
        type: 'SALARY',
        trainerId: s.trainerId,
        trainerName: s.trainerName,
        salaryMonth: s.salaryMonth,
        createdAt: s.createdAt,
      }));
    }

    // Combine and sort
    let allItems = [...expenses, ...salaries];

    // Sort combined items
    allItems.sort((a, b) => {
      const aDate = a.date.getTime();
      const bDate = b.date.getTime();
      return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
    });

    // Apply pagination to combined results
    const total = allItems.length;
    const paginatedItems = allItems.slice(skip, skip + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      summary: {
        totalExpenseAmount,
        totalSalaryAmount,
        grandTotal: totalExpenseAmount + totalSalaryAmount,
        expenseCount,
        salaryCount,
      },
    };
  }

  // =============================================
  // Income Report (Member Payments)
  // =============================================

  async getIncomeReport(gymId: string, params: IncomeReportParams): Promise<IncomeReportResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'totalPaidAmount',
      sortOrder = 'desc',
      year,
      month,
      dateFrom,
      dateTo,
      paymentStatus,
      membershipStatus,
    } = params;

    const skip = (page - 1) * limit;

    // Build date filters for payments
    let dateFilter: { gte?: Date; lte?: Date } = {};

    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter = { gte: startDate, lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter = { gte: startDate, lte: endDate };
    } else if (dateFrom || dateTo) {
      if (dateFrom) {
        dateFilter.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.lte = endDate;
      }
    }

    // Build member where clause
    const memberWhere: any = {
      gymId,
      ...(membershipStatus && { membershipStatus }),
      ...(search && {
        OR: [
          { memberId: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Get all members with their payments
    const members = await prisma.member.findMany({
      where: memberWhere,
      include: {
        user: { select: { name: true, email: true } },
        balancePayments: {
          where: {
            isActive: true,
            // Don't date-filter balance payments here - we need ALL of them to calculate correct pending amounts
            // Date filtering for paid amounts is done in-memory below
          },
        },
        membershipRenewals: {
          where: {
            isActive: true,
            ...(paymentStatus && { paymentStatus }),
            ...(Object.keys(dateFilter).length > 0 && { renewalDate: dateFilter }),
          },
        },
      },
    });

    // Calculate payment summaries for each member
    const hasDateFilter = Object.keys(dateFilter).length > 0;
    let memberIncomeItems: MemberIncomeItem[] = members.map((member) => {
      // Note: Initial payment is not stored separately on Member model
      // It's tracked through balance payments or the finalFees field
      const initialPayment = 0; // No separate initial payment field in schema

      // Renewal payments (already date-filtered from query)
      const renewalPayments = member.membershipRenewals.reduce((sum, r) => sum + Number(r.paidAmount || 0), 0);
      const renewalPending = member.membershipRenewals.reduce((sum, r) => sum + Number(r.pendingAmount || 0), 0);

      // Separate balance payments by date filter for display vs all for pending calc
      const allBalancePayments = member.balancePayments;
      const filteredBalancePayments = hasDateFilter
        ? allBalancePayments.filter(p => {
            const payDate = p.paymentDate.getTime();
            if (dateFilter.gte && payDate < dateFilter.gte.getTime()) return false;
            if (dateFilter.lte && payDate > dateFilter.lte.getTime()) return false;
            return true;
          })
        : allBalancePayments;

      // Balance payments within period (for paid amount display)
      const balancePayments = filteredBalancePayments.reduce((sum, p) => sum + Number(p.paidFees || 0), 0);

      // Calculate initial membership pending using ALL balance payments (not date-filtered)
      const totalRegularBalancePaid = allBalancePayments
        .filter(p => p.paymentFor === 'REGULAR')
        .reduce((sum, p) => sum + Number(p.paidFees || 0), 0);
      const totalPTBalancePaid = allBalancePayments
        .filter(p => p.paymentFor === 'PT')
        .reduce((sum, p) => sum + Number(p.paidFees || 0), 0);

      const initialRegularPending = Math.max(0, Number(member.finalFees || 0) - totalRegularBalancePaid);
      const initialPTPending = member.hasPTAddon
        ? Math.max(0, Number(member.ptFinalFees || 0) - totalPTBalancePaid)
        : 0;

      // Total pending = initial membership pending + renewal pending
      const totalPendingAmount = initialRegularPending + initialPTPending + renewalPending;

      // Calculate last payment date
      const paymentDates: Date[] = [];
      member.membershipRenewals.forEach(r => {
        if (r.paidAmount && Number(r.paidAmount) > 0) paymentDates.push(r.renewalDate);
      });
      filteredBalancePayments.forEach(p => paymentDates.push(p.paymentDate));

      const lastPaymentDate = paymentDates.length > 0
        ? new Date(Math.max(...paymentDates.map(d => d.getTime())))
        : undefined;

      const totalPaidAmount = renewalPayments + balancePayments;
      const paymentCount = member.membershipRenewals.length + filteredBalancePayments.length;

      return {
        memberId: member.id,
        memberCode: member.memberId || member.id.substring(0, 8), // memberId is the member code
        memberName: member.name || member.user.name,
        email: member.email || member.user.email || undefined,
        phone: member.phone || undefined,
        memberPhoto: member.memberPhoto || undefined,
        membershipStatus: member.membershipStatus,
        initialPayment,
        renewalPayments,
        balancePayments,
        totalPaidAmount,
        totalPendingAmount,
        lastPaymentDate,
        paymentCount,
      };
    });

    // Filter out members with no payments if date filter is applied
    if (Object.keys(dateFilter).length > 0) {
      memberIncomeItems = memberIncomeItems.filter(m => m.totalPaidAmount > 0 || m.totalPendingAmount > 0);
    }

    // Sort
    memberIncomeItems.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case 'totalPaidAmount':
          aVal = a.totalPaidAmount;
          bVal = b.totalPaidAmount;
          break;
        case 'lastPaymentDate':
          aVal = a.lastPaymentDate?.getTime() || 0;
          bVal = b.lastPaymentDate?.getTime() || 0;
          break;
        case 'memberName':
          aVal = a.memberName.toLowerCase();
          bVal = b.memberName.toLowerCase();
          break;
        case 'memberCode':
          aVal = a.memberCode;
          bVal = b.memberCode;
          break;
        default:
          aVal = a.totalPaidAmount;
          bVal = b.totalPaidAmount;
      }
      if (typeof aVal === 'string') {
        return sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // Calculate summary totals
    const summary = memberIncomeItems.reduce(
      (acc, m) => ({
        totalInitialPayments: acc.totalInitialPayments + m.initialPayment,
        totalRenewalPayments: acc.totalRenewalPayments + m.renewalPayments,
        totalBalancePayments: acc.totalBalancePayments + m.balancePayments,
        grandTotal: acc.grandTotal + m.totalPaidAmount,
        totalPending: acc.totalPending + m.totalPendingAmount,
        memberCount: acc.memberCount + 1,
      }),
      {
        totalInitialPayments: 0,
        totalRenewalPayments: 0,
        totalBalancePayments: 0,
        grandTotal: 0,
        totalPending: 0,
        memberCount: 0,
      }
    );

    // Apply pagination
    const total = memberIncomeItems.length;
    const paginatedItems = memberIncomeItems.slice(skip, skip + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      summary,
    };
  }

  // =============================================
  // Member Payment Details (for popup)
  // =============================================

  async getMemberPaymentDetails(
    gymId: string,
    memberId: string,
    params: MemberPaymentDetailParams
  ): Promise<MemberPaymentDetailResponse> {
    const {
      page = 1,
      limit = 10,
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      paymentFor,
    } = params;

    const skip = (page - 1) * limit;

    // Build date filter
    let dateFilter: { gte?: Date; lte?: Date } = {};
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.lte = endDate;
    }

    // Get member with basic info
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: {
        user: { select: { name: true } },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Get course package name if exists
    let coursePackageName: string | undefined;
    if (member.coursePackageId) {
      const pkg = await prisma.coursePackage.findUnique({
        where: { id: member.coursePackageId },
        select: { packageName: true },
      });
      coursePackageName = pkg?.packageName;
    }

    const paymentItems: MemberPaymentDetailItem[] = [];

    // Note: Initial payment is not stored separately on Member model
    // All payments are tracked through balance payments or renewals

    // 1. Renewal payments
    const renewalWhere: any = {
      memberId,
      isActive: true,
      ...(Object.keys(dateFilter).length > 0 && { renewalDate: dateFilter }),
    };

    const renewals = await prisma.membershipRenewal.findMany({
      where: renewalWhere,
    });

    for (const renewal of renewals) {
      const paidAmount = Number(renewal.paidAmount || 0);
      if (paidAmount > 0 && (!paymentFor || paymentFor === 'REGULAR')) {
        paymentItems.push({
          id: renewal.id,
          paymentDate: renewal.renewalDate,
          source: 'RENEWAL',
          paymentFor: 'REGULAR',
          amount: paidAmount,
          paymentMode: renewal.paymentMode || undefined,
          renewalNumber: renewal.renewalNumber,
          notes: renewal.notes || undefined,
          packageName: coursePackageName,
          createdAt: renewal.createdAt,
        });
      }
    }

    // 2. Balance payments
    const balanceWhere: any = {
      memberId,
      isActive: true,
      ...(Object.keys(dateFilter).length > 0 && { paymentDate: dateFilter }),
      ...(paymentFor && { paymentFor }),
    };

    const balancePayments = await prisma.memberBalancePayment.findMany({
      where: balanceWhere,
    });

    for (const payment of balancePayments) {
      paymentItems.push({
        id: payment.id,
        paymentDate: payment.paymentDate,
        source: 'BALANCE_PAYMENT',
        paymentFor: payment.paymentFor as PaymentFor,
        amount: Number(payment.paidFees),
        paymentMode: payment.payMode || undefined,
        receiptNo: payment.receiptNo,
        notes: payment.notes || undefined,
        createdAt: payment.createdAt,
      });
    }

    // Sort by payment date
    paymentItems.sort((a, b) => {
      const aTime = a.paymentDate.getTime();
      const bTime = b.paymentDate.getTime();
      return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
    });

    // Calculate summary
    const summary = paymentItems.reduce(
      (acc, p) => ({
        totalPaidAmount: acc.totalPaidAmount + p.amount,
        regularPayments: acc.regularPayments + (p.paymentFor === 'REGULAR' ? p.amount : 0),
        ptPayments: acc.ptPayments + (p.paymentFor === 'PT' ? p.amount : 0),
        paymentCount: acc.paymentCount + 1,
      }),
      {
        totalPaidAmount: 0,
        regularPayments: 0,
        ptPayments: 0,
        paymentCount: 0,
      }
    );

    // Apply pagination
    const total = paymentItems.length;
    const paginatedItems = paymentItems.slice(skip, skip + limit);

    return {
      memberId: member.id,
      memberName: member.name || member.user.name,
      memberCode: member.memberId || member.id.substring(0, 8),
      items: paginatedItems,
      total,
      page,
      limit,
      summary,
    };
  }
}

export default new GymOwnerService();
