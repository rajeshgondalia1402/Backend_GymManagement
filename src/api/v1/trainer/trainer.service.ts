// =============================================
// Trainer Service - Business Logic
// =============================================

import { prisma } from '../../../config/database';
import { NotFoundException, BadRequestException, ForbiddenException } from '../../../common/exceptions';
import {
  AssignedMember,
  DietPlan,
  ExercisePlan,
  TrainerProfile,
  TrainerProfileDetails,
  CreateDietPlanRequest,
  CreateExercisePlanRequest,
  UpdateDietPlanRequest,
  UpdateExercisePlanRequest,
  MemberDietAssignment,
  MemberExerciseAssignment,
  TrainerSalarySettlement,
  SalarySettlementListParams,
  SalarySettlementSummary,
  IncentiveType,
  PaymentMode,
  TrainerDashboardStats,
  CurrentMonthPTMember,
} from './trainer.types';

export class TrainerService {
  /**
   * Get trainer's own profile
   */
  async getProfile(trainerId: string): Promise<TrainerProfile> {
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      include: {
        user: { select: { name: true, email: true } },
        gym: { select: { id: true, name: true } },
      },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    return {
      id: trainer.id,
      name: trainer.name || trainer.user.name,
      email: trainer.email || trainer.user.email,
      specialization: trainer.specialization || '',
      experience: trainer.experience,
      phone: trainer.phone || '',
      gymId: trainer.gymId,
      gymName: trainer.gym.name,
      isActive: trainer.isActive,
      createdAt: trainer.createdAt.toISOString(),
    };
  }

  /**
   * Get trainer's complete profile details
   * Returns all trainer information including gym details
   */
  async getProfileDetails(trainerId: string): Promise<TrainerProfileDetails> {
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      include: {
        user: { select: { name: true, email: true } },
        gym: {
          select: {
            id: true,
            name: true,
            gymLogo: true,
            address1: true,
            address2: true,
            city: true,
            state: true,
            zipcode: true,
            mobileNo: true,
            phoneNo: true,
            email: true,
          },
        },
      },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    return {
      id: trainer.id,
      name: trainer.name || trainer.user.name,
      email: trainer.email || trainer.user.email,
      phone: trainer.phone || undefined,
      gender: trainer.gender || undefined,
      dateOfBirth: trainer.dateOfBirth?.toISOString(),
      specialization: trainer.specialization || undefined,
      experience: trainer.experience || undefined,
      joiningDate: trainer.joiningDate?.toISOString(),
      salary: trainer.salary ? Number(trainer.salary) : undefined,
      trainerPhoto: trainer.trainerPhoto || undefined,
      idProofType: trainer.idProofType || undefined,
      idProofDocument: trainer.idProofDocument || undefined,
      isActive: trainer.isActive,
      createdAt: trainer.createdAt.toISOString(),
      updatedAt: trainer.updatedAt.toISOString(),
      gym: {
        id: trainer.gym.id,
        name: trainer.gym.name,
        logo: trainer.gym.gymLogo || undefined,
        address1: trainer.gym.address1 || undefined,
        address2: trainer.gym.address2 || undefined,
        city: trainer.gym.city || undefined,
        state: trainer.gym.state || undefined,
        zipcode: trainer.gym.zipcode || undefined,
        mobileNo: trainer.gym.mobileNo || undefined,
        phoneNo: trainer.gym.phoneNo || undefined,
        email: trainer.gym.email || undefined,
      },
    };
  }

  /**
   * Get trainer dashboard stats
   * Returns: totalSalary, totalIncentive, totalAssignedPTMembers, currentMonthPTMembers list with diet plans
   */
  async getDashboardStats(trainerId: string): Promise<TrainerDashboardStats> {
    // Get current month start and end dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Execute all queries in parallel for performance
    const [salaryAggregation, totalPTMembers, currentMonthPTMembers] = await Promise.all([
      // Get total salary and total incentive from all salary settlements
      prisma.trainerSalarySettlement.aggregate({
        where: { trainerId },
        _sum: {
          calculatedSalary: true,
          incentiveAmount: true,
        },
      }),
      // Get total PT members count (all time)
      prisma.pTMember.count({
        where: { trainerId },
      }),
      // Get current month PT members list with diet plans
      prisma.pTMember.findMany({
        where: {
          trainerId,
          createdAt: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
        },
        include: {
          member: {
            include: {
              user: { select: { name: true, email: true } },
              memberDietPlans: {
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Map current month PT members to response format with diet plan details
    const mappedCurrentMonthPTMembers: CurrentMonthPTMember[] = currentMonthPTMembers.map((pt) => {
      const activeDietPlan = pt.member.memberDietPlans[0];

      return {
        id: pt.id,
        memberId: pt.memberId,
        memberName: pt.member.user.name,
        memberEmail: pt.member.user.email,
        memberPhone: pt.member.phone || '',
        memberGender: pt.member.gender || '',
        packageName: pt.packageName,
        startDate: pt.startDate.toISOString(),
        endDate: pt.endDate?.toISOString(),
        goals: pt.goals || undefined,
        notes: pt.notes || undefined,
        isActive: pt.isActive,
        createdAt: pt.createdAt.toISOString(),
        dietPlan: activeDietPlan ? {
          id: activeDietPlan.id,
          planName: activeDietPlan.planName,
          description: activeDietPlan.description || undefined,
          calories: activeDietPlan.calories || undefined,
          meals: activeDietPlan.meals as object,
          startDate: activeDietPlan.startDate.toISOString(),
          endDate: activeDietPlan.endDate?.toISOString(),
          isActive: activeDietPlan.isActive,
        } : undefined,
      };
    });

    return {
      totalSalary: Number(salaryAggregation._sum.calculatedSalary || 0),
      totalIncentive: Number(salaryAggregation._sum.incentiveAmount || 0),
      totalAssignedPTMembers: totalPTMembers,
      currentMonthPTMembers: mappedCurrentMonthPTMembers,
    };
  }

  /**
   * Get all members assigned to this trainer
   */
  async getAssignedMembers(
    trainerId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ members: AssignedMember[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      trainerId,
      isActive: true,
    };

    if (search) {
      whereClause.member = {
        user: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
    }

    const [assignments, total] = await Promise.all([
      prisma.memberTrainerAssignment.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          member: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { assignedAt: 'desc' },
      }),
      prisma.memberTrainerAssignment.count({ where: whereClause }),
    ]);

    const members: AssignedMember[] = assignments.map((assignment) => ({
      id: assignment.member.id,
      name: assignment.member.user.name,
      email: assignment.member.user.email,
      phone: assignment.member.phone || '',
      gender: assignment.member.gender || '',
      membershipStatus: assignment.member.membershipStatus,
      membershipStart: assignment.member.membershipStart.toISOString(),
      membershipEnd: assignment.member.membershipEnd.toISOString(),
      assignedAt: assignment.assignedAt.toISOString(),
    }));

    return { members, total, page, limit };
  }

  /**
   * Get a specific member's details (only if assigned to trainer)
   */
  async getMemberDetails(trainerId: string, memberId: string): Promise<AssignedMember> {
    const assignment = await prisma.memberTrainerAssignment.findFirst({
      where: {
        trainerId,
        memberId,
        isActive: true,
      },
      include: {
        member: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!assignment) {
      throw new ForbiddenException('Member not assigned to you');
    }

    return {
      id: assignment.member.id,
      name: assignment.member.user.name,
      email: assignment.member.user.email,
      phone: assignment.member.phone || '',
      gender: assignment.member.gender || '',
      membershipStatus: assignment.member.membershipStatus,
      membershipStart: assignment.member.membershipStart.toISOString(),
      membershipEnd: assignment.member.membershipEnd.toISOString(),
      assignedAt: assignment.assignedAt.toISOString(),
    };
  }

  /**
   * Get all diet plans for the trainer's gym
   */
  async getDietPlans(gymId: string): Promise<DietPlan[]> {
    const plans = await prisma.dietPlan.findMany({
      where: { gymId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      calories: plan.calories,
      meals: plan.meals as object,
      isActive: plan.isActive,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    }));
  }

  /**
   * Get all exercise plans for the trainer's gym
   */
  async getExercisePlans(gymId: string): Promise<ExercisePlan[]> {
    const plans = await prisma.exercisePlan.findMany({
      where: { gymId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      type: plan.type,
      exercises: plan.exercises as object,
      isActive: plan.isActive,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    }));
  }

  /**
   * Create a new diet plan
   */
  async createDietPlan(gymId: string, data: CreateDietPlanRequest): Promise<DietPlan> {
    const plan = await prisma.dietPlan.create({
      data: {
        name: data.name,
        description: data.description,
        calories: data.calories,
        meals: data.meals,
        gymId,
      },
    });

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      calories: plan.calories,
      meals: plan.meals as object,
      isActive: plan.isActive,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }

  /**
   * Create a new exercise plan
   */
  async createExercisePlan(gymId: string, data: CreateExercisePlanRequest): Promise<ExercisePlan> {
    const plan = await prisma.exercisePlan.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        exercises: data.exercises,
        gymId,
      },
    });

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      type: plan.type,
      exercises: plan.exercises as object,
      isActive: plan.isActive,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }

  /**
   * Update a diet plan
   */
  async updateDietPlan(planId: string, gymId: string, data: UpdateDietPlanRequest): Promise<DietPlan> {
    const existing = await prisma.dietPlan.findFirst({
      where: { id: planId, gymId },
    });

    if (!existing) {
      throw new NotFoundException('Diet plan not found');
    }

    const plan = await prisma.dietPlan.update({
      where: { id: planId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.calories !== undefined && { calories: data.calories }),
        ...(data.meals && { meals: data.meals }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      calories: plan.calories,
      meals: plan.meals as object,
      isActive: plan.isActive,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }

  /**
   * Update an exercise plan
   */
  async updateExercisePlan(planId: string, gymId: string, data: UpdateExercisePlanRequest): Promise<ExercisePlan> {
    const existing = await prisma.exercisePlan.findFirst({
      where: { id: planId, gymId },
    });

    if (!existing) {
      throw new NotFoundException('Exercise plan not found');
    }

    const plan = await prisma.exercisePlan.update({
      where: { id: planId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.exercises && { exercises: data.exercises }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      type: plan.type,
      exercises: plan.exercises as object,
      isActive: plan.isActive,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }

  /**
   * Assign a diet plan to a member
   */
  async assignDietPlan(
    trainerId: string,
    memberId: string,
    dietPlanId: string,
    startDate?: string,
    endDate?: string
  ): Promise<MemberDietAssignment> {
    // Verify trainer has this member assigned
    const trainerAssignment = await prisma.memberTrainerAssignment.findFirst({
      where: { trainerId, memberId, isActive: true },
    });

    if (!trainerAssignment) {
      throw new ForbiddenException('Member not assigned to you');
    }

    // Verify diet plan exists
    const dietPlan = await prisma.dietPlan.findUnique({ where: { id: dietPlanId } });
    if (!dietPlan) {
      throw new NotFoundException('Diet plan not found');
    }

    // Deactivate existing active assignments for this member
    await prisma.memberDietAssignment.updateMany({
      where: { memberId, isActive: true },
      data: { isActive: false },
    });

    // Create new assignment
    const assignment = await prisma.memberDietAssignment.create({
      data: {
        memberId,
        dietPlanId,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        member: { include: { user: { select: { name: true } } } },
        dietPlan: { select: { name: true } },
      },
    });

    return {
      id: assignment.id,
      memberId: assignment.memberId,
      memberName: assignment.member.user.name,
      dietPlanId: assignment.dietPlanId,
      dietPlanName: assignment.dietPlan.name,
      assignedAt: assignment.assignedAt.toISOString(),
      startDate: assignment.startDate.toISOString(),
      endDate: assignment.endDate?.toISOString() || null,
      isActive: assignment.isActive,
    };
  }

  /**
   * Assign an exercise plan to a member
   */
  async assignExercisePlan(
    trainerId: string,
    memberId: string,
    exercisePlanId: string,
    dayOfWeek?: number,
    startDate?: string,
    endDate?: string
  ): Promise<MemberExerciseAssignment> {
    // Verify trainer has this member assigned
    const trainerAssignment = await prisma.memberTrainerAssignment.findFirst({
      where: { trainerId, memberId, isActive: true },
    });

    if (!trainerAssignment) {
      throw new ForbiddenException('Member not assigned to you');
    }

    // Verify exercise plan exists
    const exercisePlan = await prisma.exercisePlan.findUnique({ where: { id: exercisePlanId } });
    if (!exercisePlan) {
      throw new NotFoundException('Exercise plan not found');
    }

    // Create new assignment (can have multiple exercise plans)
    const assignment = await prisma.memberExerciseAssignment.create({
      data: {
        memberId,
        exercisePlanId,
        dayOfWeek,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        member: { include: { user: { select: { name: true } } } },
        exercisePlan: { select: { name: true } },
      },
    });

    return {
      id: assignment.id,
      memberId: assignment.memberId,
      memberName: assignment.member.user.name,
      exercisePlanId: assignment.exercisePlanId,
      exercisePlanName: assignment.exercisePlan.name,
      dayOfWeek: assignment.dayOfWeek,
      assignedAt: assignment.assignedAt.toISOString(),
      startDate: assignment.startDate.toISOString(),
      endDate: assignment.endDate?.toISOString() || null,
      isActive: assignment.isActive,
    };
  }

  /**
   * Get member's current diet assignments
   */
  async getMemberDietAssignments(trainerId: string, memberId: string): Promise<MemberDietAssignment[]> {
    // Verify trainer has this member assigned
    const trainerAssignment = await prisma.memberTrainerAssignment.findFirst({
      where: { trainerId, memberId, isActive: true },
    });

    if (!trainerAssignment) {
      throw new ForbiddenException('Member not assigned to you');
    }

    const assignments = await prisma.memberDietAssignment.findMany({
      where: { memberId },
      include: {
        member: { include: { user: { select: { name: true } } } },
        dietPlan: { select: { name: true } },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return assignments.map((a) => ({
      id: a.id,
      memberId: a.memberId,
      memberName: a.member.user.name,
      dietPlanId: a.dietPlanId,
      dietPlanName: a.dietPlan.name,
      assignedAt: a.assignedAt.toISOString(),
      startDate: a.startDate.toISOString(),
      endDate: a.endDate?.toISOString() || null,
      isActive: a.isActive,
    }));
  }

  /**
   * Get member's current exercise assignments
   */
  async getMemberExerciseAssignments(trainerId: string, memberId: string): Promise<MemberExerciseAssignment[]> {
    // Verify trainer has this member assigned
    const trainerAssignment = await prisma.memberTrainerAssignment.findFirst({
      where: { trainerId, memberId, isActive: true },
    });

    if (!trainerAssignment) {
      throw new ForbiddenException('Member not assigned to you');
    }

    const assignments = await prisma.memberExerciseAssignment.findMany({
      where: { memberId },
      include: {
        member: { include: { user: { select: { name: true } } } },
        exercisePlan: { select: { name: true } },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return assignments.map((a) => ({
      id: a.id,
      memberId: a.memberId,
      memberName: a.member.user.name,
      exercisePlanId: a.exercisePlanId,
      exercisePlanName: a.exercisePlan.name,
      dayOfWeek: a.dayOfWeek,
      assignedAt: a.assignedAt.toISOString(),
      startDate: a.startDate.toISOString(),
      endDate: a.endDate?.toISOString() || null,
      isActive: a.isActive,
    }));
  }

  /**
   * Remove a diet assignment
   */
  async removeDietAssignment(trainerId: string, assignmentId: string): Promise<void> {
    const assignment = await prisma.memberDietAssignment.findUnique({
      where: { id: assignmentId },
      include: { member: true },
    });

    if (!assignment) {
      throw new NotFoundException('Diet assignment not found');
    }

    // Verify trainer has this member assigned
    const trainerAssignment = await prisma.memberTrainerAssignment.findFirst({
      where: { trainerId, memberId: assignment.memberId, isActive: true },
    });

    if (!trainerAssignment) {
      throw new ForbiddenException('Member not assigned to you');
    }

    await prisma.memberDietAssignment.update({
      where: { id: assignmentId },
      data: { isActive: false },
    });
  }

  /**
   * Remove an exercise assignment
   */
  async removeExerciseAssignment(trainerId: string, assignmentId: string): Promise<void> {
    const assignment = await prisma.memberExerciseAssignment.findUnique({
      where: { id: assignmentId },
      include: { member: true },
    });

    if (!assignment) {
      throw new NotFoundException('Exercise assignment not found');
    }

    // Verify trainer has this member assigned
    const trainerAssignment = await prisma.memberTrainerAssignment.findFirst({
      where: { trainerId, memberId: assignment.memberId, isActive: true },
    });

    if (!trainerAssignment) {
      throw new ForbiddenException('Member not assigned to you');
    }

    await prisma.memberExerciseAssignment.update({
      where: { id: assignmentId },
      data: { isActive: false },
    });
  }

  // =============================================
  // PT Member Methods for Trainer
  // =============================================

  /**
   * Get PT members assigned to this trainer
   */
  async getPTMembers(trainerId: string, page: number = 1, limit: number = 10, search?: string): Promise<{
    ptMembers: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const where: any = { trainerId, isActive: true };
    if (search) {
      where.member = {
        user: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
    }

    const [ptMembers, total] = await Promise.all([
      prisma.pTMember.findMany({
        where,
        skip,
        take: limit,
        include: {
          member: { include: { user: { select: { name: true, email: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pTMember.count({ where }),
    ]);

    return {
      ptMembers: ptMembers.map((pt) => ({
        id: pt.id,
        memberId: pt.memberId,
        memberName: pt.member.user.name,
        memberEmail: pt.member.user.email,
        packageName: pt.packageName,
        startDate: pt.startDate.toISOString(),
        endDate: pt.endDate?.toISOString(),
        goals: pt.goals,
        notes: pt.notes,
        isActive: pt.isActive,
      })),
      total,
      page,
      limit,
    };
  }

  /**
   * Get PT member by ID (only if assigned to trainer)
   * Accepts either PT Member ID or Member ID
   */
  async getPTMemberById(trainerId: string, ptMemberId: string): Promise<any> {
    const pt = await prisma.pTMember.findFirst({
      where: { 
        trainerId,
        OR: [
          { id: ptMemberId },
          { memberId: ptMemberId }
        ]
      },
      include: {
        member: { 
          include: { 
            user: { select: { name: true, email: true } },
            memberDietPlans: { where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 1 },
          } 
        },
        supplements: { where: { isActive: true } },
      },
    });

    if (!pt) {
      throw new ForbiddenException('PT Member not assigned to you');
    }

    const activeDietPlan = pt.member.memberDietPlans[0];

    return {
      id: pt.id,
      memberId: pt.memberId,
      memberName: pt.member.user.name,
      memberEmail: pt.member.user.email,
      packageName: pt.packageName,
      sessionsTotal: pt.sessionsTotal,
      sessionsUsed: pt.sessionsUsed,
      sessionsRemaining: pt.sessionsTotal - pt.sessionsUsed,
      sessionDuration: pt.sessionDuration,
      startDate: pt.startDate.toISOString(),
      endDate: pt.endDate?.toISOString(),
      goals: pt.goals,
      notes: pt.notes,
      isActive: pt.isActive,
      dietPlan: activeDietPlan ? {
        id: activeDietPlan.id,
        planName: activeDietPlan.planName,
        description: activeDietPlan.description,
        calories: activeDietPlan.calories,
        meals: activeDietPlan.meals,
        startDate: activeDietPlan.startDate.toISOString(),
        endDate: activeDietPlan.endDate?.toISOString(),
        isActive: activeDietPlan.isActive,
      } : null,
      supplements: pt.supplements.map((s) => ({
        id: s.id,
        name: s.name,
        dosage: s.dosage,
        frequency: s.frequency,
        timing: s.timing,
        notes: s.notes,
        startDate: s.startDate.toISOString(),
        endDate: s.endDate?.toISOString(),
        isActive: s.isActive,
      })),
    };
  }

  /**
   * Get diet plan for a PT member (read-only)
   */
  async getDietPlanForPTMember(trainerId: string, ptMemberId: string): Promise<any> {
    // Verify PT member is assigned to this trainer
    const pt = await prisma.pTMember.findFirst({
      where: { id: ptMemberId, trainerId },
      include: { member: true },
    });

    if (!pt) {
      throw new ForbiddenException('PT Member not assigned to you');
    }

    const dietPlans = await prisma.memberDietPlan.findMany({
      where: { memberId: pt.memberId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return dietPlans.map((plan) => ({
      id: plan.id,
      planName: plan.planName,
      description: plan.description,
      calories: plan.calories,
      meals: plan.meals,
      startDate: plan.startDate.toISOString(),
      endDate: plan.endDate?.toISOString(),
      isActive: plan.isActive,
      createdAt: plan.createdAt.toISOString(),
    }));
  }

  // =============================================
  // Supplement Methods for Trainer (Read-Only)
  // =============================================

  /**
   * Get supplements for a PT member (read-only)
   */
  async getSupplementsForPTMember(trainerId: string, ptMemberId: string): Promise<any[]> {
    // Verify PT member is assigned to this trainer
    const pt = await prisma.pTMember.findFirst({
      where: { id: ptMemberId, trainerId },
    });

    if (!pt) {
      throw new ForbiddenException('PT Member not assigned to you');
    }

    const supplements = await prisma.supplement.findMany({
      where: { ptMemberId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return supplements.map((s) => ({
      id: s.id,
      ptMemberId: s.ptMemberId,
      name: s.name,
      dosage: s.dosage,
      frequency: s.frequency,
      timing: s.timing,
      notes: s.notes,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate?.toISOString(),
      isActive: s.isActive,
      createdAt: s.createdAt.toISOString(),
    }));
  }

  // =============================================
  // Salary Settlement Methods (Read-Only for Trainer)
  // =============================================

  /**
   * Get trainer's own salary settlements with pagination and filters
   */
  async getMySalarySettlements(
    trainerId: string,
    params: SalarySettlementListParams
  ): Promise<{ settlements: TrainerSalarySettlement[]; total: number; page: number; limit: number; summary: SalarySettlementSummary }> {
    const { page = 1, limit = 10, fromDate, toDate } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { trainerId };

    // Filter by date range
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        // Set to end of the day for inclusive filtering
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    // Get settlements, count, and summary in parallel
    const [settlements, total, summaryResult] = await Promise.all([
      prisma.trainerSalarySettlement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { salaryMonth: 'desc' },
      }),
      prisma.trainerSalarySettlement.count({ where }),
      prisma.trainerSalarySettlement.aggregate({
        where: { trainerId }, // Summary for all time
        _sum: {
          finalPayableAmount: true,
          incentiveAmount: true,
        },
        _count: true,
      }),
    ]);

    const summary: SalarySettlementSummary = {
      totalSettlements: summaryResult._count,
      totalEarnings: Number(summaryResult._sum.finalPayableAmount || 0),
      totalIncentives: Number(summaryResult._sum.incentiveAmount || 0),
    };

    return {
      settlements: settlements.map(this.mapSettlementToResponse),
      total,
      page,
      limit,
      summary,
    };
  }

  /**
   * Get a specific salary settlement by ID (only if it belongs to the trainer)
   */
  async getMySalarySettlementById(trainerId: string, settlementId: string): Promise<TrainerSalarySettlement> {
    const settlement = await prisma.trainerSalarySettlement.findFirst({
      where: {
        id: settlementId,
        trainerId,
      },
    });

    if (!settlement) {
      throw new NotFoundException('Salary settlement not found');
    }

    return this.mapSettlementToResponse(settlement);
  }

  /**
   * Helper to map Prisma settlement to response type
   */
  private mapSettlementToResponse(settlement: any): TrainerSalarySettlement {
    return {
      id: settlement.id,
      trainerId: settlement.trainerId,
      trainerName: settlement.trainerName,
      mobileNumber: settlement.mobileNumber || undefined,
      joiningDate: settlement.joiningDate?.toISOString(),
      monthlySalary: Number(settlement.monthlySalary),
      salaryMonth: settlement.salaryMonth,
      salarySentDate: settlement.salarySentDate?.toISOString(),
      totalDaysInMonth: settlement.totalDaysInMonth,
      presentDays: settlement.presentDays,
      absentDays: settlement.absentDays,
      discountDays: settlement.discountDays,
      payableDays: settlement.payableDays,
      calculatedSalary: Number(settlement.calculatedSalary),
      incentiveAmount: Number(settlement.incentiveAmount),
      incentiveType: settlement.incentiveType as IncentiveType | undefined,
      paymentMode: settlement.paymentMode as PaymentMode,
      finalPayableAmount: Number(settlement.finalPayableAmount),
      remarks: settlement.remarks || undefined,
      createdAt: settlement.createdAt.toISOString(),
    };
  }

  /**
   * Generate salary slip for trainer's own settlement
   */
  async getMySalarySlip(trainerId: string, settlementId: string): Promise<any> {
    // First verify the settlement belongs to this trainer
    const settlement = await prisma.trainerSalarySettlement.findFirst({
      where: {
        id: settlementId,
        trainerId,
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
    const periodEndDate = new Date(year, month, 0);

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

    const gymDetails = {
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
    const trainerDetails = {
      trainerId: trainer.id,
      trainerName: settlement.trainerName,
      email: trainer.user.email,
      mobileNumber: settlement.mobileNumber || trainer.phone || undefined,
      gender: trainer.gender || undefined,
      designation: trainer.specialization || 'Trainer',
      joiningDate: settlement.joiningDate || trainer.joiningDate || undefined,
      employeeCode: trainer.id.substring(0, 8).toUpperCase(),
    };

    // Attendance
    const attendancePercentage = Math.round(
      (settlement.presentDays / settlement.totalDaysInMonth) * 100 * 100
    ) / 100;

    const attendance = {
      totalDaysInMonth: settlement.totalDaysInMonth,
      presentDays: settlement.presentDays,
      absentDays: settlement.absentDays,
      discountDays: settlement.discountDays,
      payableDays: settlement.payableDays,
      attendancePercentage,
    };

    // Earnings
    const calculatedSalary = Number(settlement.calculatedSalary);
    const incentiveAmount = Number(settlement.incentiveAmount);

    const earnings = {
      basicSalary: Number(settlement.monthlySalary),
      calculatedSalary,
      incentiveAmount,
      incentiveType: settlement.incentiveType || undefined,
      grossEarnings: calculatedSalary + incentiveAmount,
    };

    // Deductions
    const deductions = {
      totalDeductions: 0,
      items: [] as { name: string; amount: number }[],
    };

    // Net payable
    const netPayableAmount = Number(settlement.finalPayableAmount);
    const netPayableInWords = this.numberToWords(netPayableAmount);

    // Payment details
    const paymentDetails = {
      paymentMode: settlement.paymentMode,
      paymentDate: settlement.salarySentDate || undefined,
      transactionRef: undefined,
    };

    // Slip number
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
}

export const trainerService = new TrainerService();
