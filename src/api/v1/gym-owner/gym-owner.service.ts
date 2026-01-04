import bcrypt from 'bcryptjs';
import { prisma } from '../../../config/database';
import { NotFoundException, ConflictException, ForbiddenException } from '../../../common/exceptions';
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
  WorkoutExercise,
  CreateWorkoutExerciseRequest,
  UpdateWorkoutExerciseRequest,
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
      isActive: trainer.isActive && trainer.user.isActive,
      gymId: trainer.gymId,
      createdAt: trainer.createdAt,
    };
  }

  async createTrainer(gymId: string, data: CreateTrainerRequest): Promise<Trainer> {
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
      isActive: result.isActive,
      gymId: result.gymId,
      createdAt: result.createdAt,
    };
  }

  async updateTrainer(gymId: string, trainerId: string, data: UpdateTrainerRequest): Promise<Trainer> {
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

      const trainer = await tx.trainer.update({
        where: { id: trainerId },
        data: {
          phone: data.phone,
          specialization: data.specialization,
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
      firstName: result.user.name.split(' ')[0] || result.user.name,
      lastName: result.user.name.split(' ').slice(1).join(' ') || '',
      phone: result.phone || undefined,
      specialization: result.specialization || undefined,
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

    // Delete trainer and associated user
    await prisma.$transaction(async (tx) => {
      await tx.trainer.delete({ where: { id: trainerId } });
      await tx.user.delete({ where: { id: trainer.userId } });
    });
  }

  // Members
  async getMembers(gymId: string, params: PaginationParams): Promise<{ members: Member[]; total: number }> {
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

    const [memberRecords, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
      return {
        id: m.id,
        email: m.user.email,
        firstName: m.user.name.split(' ')[0] || m.user.name,
        lastName: m.user.name.split(' ').slice(1).join(' ') || '',
        phone: m.phone || undefined,
        isActive: m.user.isActive,
        gymId: m.gymId,
        trainerId: activeTrainer?.id,
        memberType: m.memberType as 'REGULAR' | 'PT',
        membershipStartDate: m.membershipStart,
        membershipEndDate: m.membershipEnd,
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
      email: member.user.email,
      firstName: member.user.name.split(' ')[0] || member.user.name,
      lastName: member.user.name.split(' ').slice(1).join(' ') || '',
      phone: member.phone || undefined,
      isActive: member.user.isActive,
      gymId: member.gymId,
      trainerId: activeTrainer?.id,
      memberType: member.memberType as 'REGULAR' | 'PT',
      membershipStartDate: member.membershipStart,
      membershipEndDate: member.membershipEnd,
      createdAt: member.createdAt,
    };
  }

  async createMember(gymId: string, data: CreateMemberRequest): Promise<Member> {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictException('User with this email already exists');

    const gym = await prisma.gym.findUnique({ where: { id: gymId } });
    if (!gym) throw new NotFoundException('Gym not found');

    const memberRole = await prisma.rolemaster.findFirst({ where: { rolename: 'MEMBER' } });
    if (!memberRole) throw new NotFoundException('MEMBER role not found');

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
          phone: data.phone,
          membershipStart: data.membershipStartDate ? new Date(data.membershipStartDate) : new Date(),
          membershipEnd,
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
      email: result.user.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      isActive: result.user.isActive,
      gymId: result.gymId,
      trainerId: data.trainerId,
      memberType: result.memberType as 'REGULAR' | 'PT',
      membershipStartDate: result.membershipStart,
      membershipEndDate: result.membershipEnd,
      createdAt: result.createdAt,
    };
  }

  async updateMember(gymId: string, memberId: string, data: UpdateMemberRequest): Promise<Member> {
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
      if (data.phone) updateData.phone = data.phone;
      if (data.membershipStartDate) updateData.membershipStart = new Date(data.membershipStartDate);
      if (data.membershipEndDate) updateData.membershipEnd = new Date(data.membershipEndDate);

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
      email: result.user.email,
      firstName: result.user.name.split(' ')[0] || result.user.name,
      lastName: result.user.name.split(' ').slice(1).join(' ') || '',
      phone: result.phone || undefined,
      isActive: result.user.isActive,
      gymId: result.gymId,
      trainerId: data.trainerId || result.trainerAssignments[0]?.trainerId,
      memberType: result.memberType as 'REGULAR' | 'PT',
      membershipStartDate: result.membershipStart,
      membershipEndDate: result.membershipEnd,
      createdAt: result.createdAt,
    };
  }

  async deleteMember(gymId: string, memberId: string): Promise<void> {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId }
    });
    if (!member) throw new NotFoundException('Member not found');

    await prisma.$transaction(async (tx) => {
      await tx.member.delete({ where: { id: memberId } });
      await tx.user.delete({ where: { id: member.userId } });
    });
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

  // Toggle status methods
  async toggleTrainerStatus(gymId: string, trainerId: string): Promise<{ isActive: boolean }> {
    const trainer = await prisma.trainer.findFirst({
      where: { id: trainerId, gymId },
      include: { user: true }
    });
    
    if (!trainer) throw new NotFoundException('Trainer not found');

    const newStatus = !trainer.user.isActive;

    await prisma.$transaction(async (tx) => {
      await tx.trainer.update({
        where: { id: trainerId },
        data: { isActive: newStatus }
      });
      await tx.user.update({
        where: { id: trainer.userId },
        data: { isActive: newStatus }
      });
    });

    return { isActive: newStatus };
  }

  async toggleMemberStatus(gymId: string, memberId: string): Promise<{ isActive: boolean }> {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: { user: true }
    });
    
    if (!member) throw new NotFoundException('Member not found');

    const newStatus = !member.user.isActive;

    await prisma.user.update({
      where: { id: member.userId },
      data: { isActive: newStatus }
    });

    return { isActive: newStatus };
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

  // Workout Exercise Master CRUD
  async getWorkoutExercises(gymId: string): Promise<WorkoutExercise[]> {
    const exercises = await prisma.workoutExerciseMaster.findMany({
      where: { gymId },
      orderBy: { exerciseName: 'asc' },
    });

    return exercises;
  }

  async getWorkoutExerciseById(gymId: string, id: string): Promise<WorkoutExercise> {
    const exercise = await prisma.workoutExerciseMaster.findFirst({
      where: { id, gymId },
    });
    if (!exercise) throw new NotFoundException('Workout exercise not found');
    return exercise;
  }

  async createWorkoutExercise(gymId: string, data: CreateWorkoutExerciseRequest): Promise<WorkoutExercise> {
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
        gymId,
      },
    });

    return exercise;
  }

  async updateWorkoutExercise(gymId: string, id: string, data: UpdateWorkoutExerciseRequest): Promise<WorkoutExercise> {
    await this.getWorkoutExerciseById(gymId, id);

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
        isActive: data.isActive,
      },
    });

    return exercise;
  }

  async deleteWorkoutExercise(gymId: string, id: string): Promise<void> {
    // Hard delete
    await this.getWorkoutExerciseById(gymId, id);

    await prisma.workoutExerciseMaster.delete({
      where: { id },
    });
  }
}

export default new GymOwnerService();
