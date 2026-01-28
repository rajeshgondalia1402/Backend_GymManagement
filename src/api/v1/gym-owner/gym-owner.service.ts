import bcrypt from 'bcryptjs';
import { prisma } from '../../../config/database';
import { NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '../../../common/exceptions';
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
  RemovePTAddonRequest,
  PTSessionCredit,
  MemberPaymentSummary,
  PaymentFor,
  // Membership Details
  MemberMembershipDetailsResponse,
} from './gym-owner.types';

class GymOwnerService {
  // Dashboard
  async getDashboardStats(gymId: string): Promise<GymOwnerDashboardStats> {
    const [totalMembers, totalTrainers, totalDietPlans, totalExercisePlans, totalPTMembers, totalInquiries, newInquiries] =
      await Promise.all([
        prisma.member.count({ where: { gymId } }),
        prisma.trainer.count({ where: { gymId } }),
        prisma.dietPlan.count({ where: { gymId } }),
        prisma.exercisePlan.count({ where: { gymId } }),
        prisma.pTMember.count({ where: { gymId } }),
        prisma.inquiry.count({ where: { gymId } }),
        prisma.inquiry.count({ where: { gymId, status: 'NEW' } }),
      ]);

    // Get active members
    const activeMembers = await prisma.member.count({
      where: {
        gymId,
        membershipStatus: 'ACTIVE',
        user: { isActive: true }
      }
    });

    // Calculate expiring memberships (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringMemberships = await prisma.member.count({
      where: {
        gymId,
        membershipEnd: {
          gte: new Date(),
          lte: sevenDaysFromNow,
        },
      },
    });

    return {
      totalMembers,
      totalTrainers,
      activeMembers,
      expiringMemberships,
      totalDietPlans,
      totalExercisePlans,
      totalPTMembers,
      totalInquiries,
      newInquiries,
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
          user: { select: { id: true, name: true, email: true, isActive: true } }
        }
      }),
      prisma.trainer.count({ where }),
    ]);

    const trainers: Trainer[] = trainerRecords.map((t) => ({
      id: t.id,
      email: t.user.email,
      firstName: t.user.name.split(' ')[0] || t.user.name,
      lastName: t.user.name.split(' ').slice(1).join(' ') || '',
      phone: t.phone || undefined,
      specialization: t.specialization || undefined,
      experience: t.experience || undefined,
      gender: t.gender || undefined,
      dateOfBirth: t.dateOfBirth || undefined,
      joiningDate: t.joiningDate || undefined,
      salary: t.salary ? Number(t.salary) : undefined,
      password: t.password || undefined,
      trainerPhoto: t.trainerPhoto || undefined,
      idProofType: t.idProofType || undefined,
      idProofDocument: t.idProofDocument || undefined,
      isActive: t.isActive && t.user.isActive,
      gymId: t.gymId,
      createdAt: t.createdAt,
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
      email: trainer.user.email,
      firstName: trainer.user.name.split(' ')[0] || trainer.user.name,
      lastName: trainer.user.name.split(' ').slice(1).join(' ') || '',
      phone: trainer.phone || undefined,
      specialization: trainer.specialization || undefined,
      experience: trainer.experience || undefined,
      gender: trainer.gender || undefined,
      dateOfBirth: trainer.dateOfBirth || undefined,
      joiningDate: trainer.joiningDate || undefined,
      salary: trainer.salary ? Number(trainer.salary) : undefined,
      password: trainer.password || undefined,
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

    const hashedPassword = await bcrypt.hash(data.password, 10);

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
          phone: data.phone,
          specialization: data.specialization,
          experience: data.experience,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(), // Default to today
          salary: data.salary,
          password: data.password, // Store plain text password for frontend display
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
      email: result.user.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      specialization: data.specialization,
      experience: result.experience || undefined,
      gender: result.gender || undefined,
      dateOfBirth: result.dateOfBirth || undefined,
      joiningDate: result.joiningDate || undefined,
      salary: result.salary ? Number(result.salary) : undefined,
      password: result.password || undefined,
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
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.specialization !== undefined) updateData.specialization = data.specialization;
      if (data.experience !== undefined) updateData.experience = data.experience;
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
      if (data.joiningDate !== undefined) updateData.joiningDate = data.joiningDate ? new Date(data.joiningDate) : null;
      if (data.salary !== undefined) updateData.salary = data.salary;
      if (data.idProofType !== undefined) updateData.idProofType = data.idProofType;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      // Update plain text password in Trainer table for display
      if (data.password) updateData.password = data.password;

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
      email: result.user.email,
      firstName: result.user.name.split(' ')[0] || result.user.name,
      lastName: result.user.name.split(' ').slice(1).join(' ') || '',
      phone: result.phone || undefined,
      specialization: result.specialization || undefined,
      experience: result.experience || undefined,
      gender: result.gender || undefined,
      dateOfBirth: result.dateOfBirth || undefined,
      joiningDate: result.joiningDate || undefined,
      salary: result.salary ? Number(result.salary) : undefined,
      password: result.password || undefined,
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
      email: updatedTrainer.user.email,
      firstName: updatedTrainer.user.name.split(' ')[0] || updatedTrainer.user.name,
      lastName: updatedTrainer.user.name.split(' ').slice(1).join(' ') || '',
      phone: updatedTrainer.phone || undefined,
      specialization: updatedTrainer.specialization || undefined,
      experience: updatedTrainer.experience || undefined,
      gender: updatedTrainer.gender || undefined,
      dateOfBirth: updatedTrainer.dateOfBirth || undefined,
      joiningDate: updatedTrainer.joiningDate || undefined,
      salary: updatedTrainer.salary ? Number(updatedTrainer.salary) : undefined,
      password: updatedTrainer.password || undefined,
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
        email: m.user.email,
        firstName: m.user.name.split(' ')[0] || m.user.name,
        lastName: m.user.name.split(' ').slice(1).join(' ') || '',
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
        }
      }
    });

    if (!member) throw new NotFoundException('Member not found');

    const activeTrainer = member.trainerAssignments[0]?.trainer;
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
      email: result.user.email,
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
      email: result.user.email,
      firstName: result.user.name.split(' ')[0] || result.user.name,
      lastName: result.user.name.split(' ').slice(1).join(' ') || '',
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
      email: updatedMember.user.email,
      firstName: updatedMember.user.name.split(' ')[0] || updatedMember.user.name,
      lastName: updatedMember.user.name.split(' ').slice(1).join(' ') || '',
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
      }),
      prisma.exercisePlan.count({ where }),
    ]);

    const plans: ExercisePlan[] = dbPlans.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      exercises: p.exercises as any[],
      durationMinutes: undefined,
      difficulty: p.type || undefined,
      isActive: p.isActive,
      gymId: p.gymId,
      createdAt: p.createdAt,
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

    await prisma.expenseGroupMaster.delete({
      where: { id },
    });
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
            sessionsTotal: data.sessionsTotal,
            sessionsUsed: 0, // Reset sessions used for new PT package
            sessionDuration: data.sessionDuration || 60,
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
            sessionsTotal: data.sessionsTotal,
            sessionDuration: data.sessionDuration || 60,
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
}

export default new GymOwnerService();
