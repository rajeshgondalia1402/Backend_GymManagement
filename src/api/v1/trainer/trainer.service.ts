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
  CreateDietPlanRequest,
  CreateExercisePlanRequest,
  UpdateDietPlanRequest,
  UpdateExercisePlanRequest,
  MemberDietAssignment,
  MemberExerciseAssignment,
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
      name: trainer.user.name,
      email: trainer.user.email,
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
        sessionsTotal: pt.sessionsTotal,
        sessionsUsed: pt.sessionsUsed,
        sessionsRemaining: pt.sessionsTotal - pt.sessionsUsed,
        sessionDuration: pt.sessionDuration,
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
   */
  async getPTMemberById(trainerId: string, ptMemberId: string): Promise<any> {
    const pt = await prisma.pTMember.findFirst({
      where: { id: ptMemberId, trainerId },
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
}

export const trainerService = new TrainerService();
