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
} from './gym-owner.types';

class GymOwnerService {
  // Dashboard
  async getDashboardStats(gymId: string): Promise<GymOwnerDashboardStats> {
    const [totalMembers, totalTrainers, totalDietPlans, totalExercisePlans] =
      await Promise.all([
        prisma.member.count({ where: { gymId } }),
        prisma.trainer.count({ where: { gymId } }),
        prisma.dietPlan.count({ where: { gymId } }),
        prisma.exercisePlan.count({ where: { gymId } }),
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
}

export default new GymOwnerService();
