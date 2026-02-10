import { prisma } from '../../../config/database';
import { NotFoundException } from '../../../common/exceptions';
import {
  MemberProfile,
  UpdateProfileRequest,
  MemberDashboardStats,
  AssignedDietPlan,
  AssignedExercisePlan,
  Membership,
} from './member.types';

class MemberService {
  async getProfile(userId: string): Promise<MemberProfile> {
    // First get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    // Get the member profile
    const member = await prisma.member.findUnique({
      where: { userId },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        trainerAssignments: {
          where: { isActive: true },
          include: {
            trainer: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            }
          },
          take: 1
        },
      },
    });

    if (!member) throw new NotFoundException('Member profile not found');

    const activeTrainer = member.trainerAssignments[0]?.trainer;

    const memberName = member.name || user.name;
    const memberEmail = member.email || user.email;

    return {
      id: member.id,
      email: memberEmail,
      firstName: memberName.split(' ')[0] || memberName,
      lastName: memberName.split(' ').slice(1).join(' ') || '',
      phone: member.phone || undefined,
      dateOfBirth: member.dateOfBirth || undefined,
      gender: member.gender || undefined,
      address: member.address || undefined,
      emergencyContact: member.emergencyContact || undefined,
      healthNotes: member.healthNotes || undefined,
      isActive: user.isActive,
      gymId: member.gymId,
      gym: member.gym || undefined,
      trainerId: activeTrainer?.id,
      trainer: activeTrainer ? {
        id: activeTrainer.id,
        firstName: (activeTrainer.name || activeTrainer.user.name).split(' ')[0],
        lastName: (activeTrainer.name || activeTrainer.user.name).split(' ').slice(1).join(' ') || '',
        email: activeTrainer.email || activeTrainer.user.email,
        specialization: activeTrainer.specialization || undefined,
      } : undefined,
      membershipStartDate: member.membershipStart || undefined,
      membershipEndDate: member.membershipEnd || undefined,
      membershipStatus: member.membershipStatus,
      createdAt: member.createdAt,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<MemberProfile> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // Update user name if provided
      if (data.firstName || data.lastName) {
        const currentName = user.name.split(' ');
        const newFirst = data.firstName || currentName[0];
        const newLast = data.lastName || currentName.slice(1).join(' ');
        const fullName = `${newFirst} ${newLast}`;
        await tx.user.update({
          where: { id: userId },
          data: { name: fullName }
        });
        // Sync name to Member table
        await tx.member.update({
          where: { userId },
          data: { name: fullName }
        });
      }

      // Update member data
      const memberUpdateData: any = {};
      if (data.phone) memberUpdateData.phone = data.phone;
      if (data.dateOfBirth) memberUpdateData.dateOfBirth = new Date(data.dateOfBirth);
      if (data.gender) memberUpdateData.gender = data.gender;
      if (data.address) memberUpdateData.address = data.address;
      if (data.emergencyContact) memberUpdateData.emergencyContact = data.emergencyContact;
      if (data.healthNotes) memberUpdateData.healthNotes = data.healthNotes;

      if (Object.keys(memberUpdateData).length > 0) {
        await tx.member.update({
          where: { id: member.id },
          data: memberUpdateData
        });
      }
    });

    // Return updated profile
    return this.getProfile(userId);
  }

  async getDashboard(userId: string): Promise<MemberDashboardStats> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const member = await prisma.member.findUnique({
      where: { userId },
      include: {
        trainerAssignments: {
          where: { isActive: true },
          include: {
            trainer: {
              include: { user: { select: { name: true } } }
            }
          },
          take: 1
        }
      }
    });

    if (!member) throw new NotFoundException('Member profile not found');

    // Calculate days remaining
    let daysRemaining = 0;
    if (member.membershipEnd) {
      const now = new Date();
      const diff = member.membershipEnd.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // Get active diet plan
    const activeDietPlan = await prisma.memberDietAssignment.findFirst({
      where: {
        memberId: member.id,
        isActive: true,
      },
      include: {
        dietPlan: {
          select: { id: true, name: true },
        },
      },
    });

    // Count active exercise plans
    const activeExercisePlans = await prisma.memberExerciseAssignment.count({
      where: {
        memberId: member.id,
        isActive: true,
      },
    });

    const activeTrainer = member.trainerAssignments[0]?.trainer;

    return {
      daysRemaining,
      totalWorkouts: 0, // TODO: Implement workout tracking
      activeDietPlan: activeDietPlan?.dietPlan,
      activeExercisePlans,
      trainer: activeTrainer
        ? {
            id: activeTrainer.id,
            name: activeTrainer.name || activeTrainer.user.name,
            specialization: activeTrainer.specialization || undefined,
          }
        : undefined,
    };
  }

  async getTrainer(userId: string): Promise<any> {
    const member = await prisma.member.findUnique({
      where: { userId },
      include: {
        trainerAssignments: {
          where: { isActive: true },
          include: {
            trainer: {
              include: { 
                user: { select: { id: true, name: true, email: true } } 
              }
            }
          },
          take: 1
        }
      }
    });

    if (!member) throw new NotFoundException('Member not found');
    
    const activeTrainer = member.trainerAssignments[0]?.trainer;
    if (!activeTrainer) throw new NotFoundException('No trainer assigned');

    return {
      id: activeTrainer.id,
      firstName: (activeTrainer.name || activeTrainer.user.name).split(' ')[0],
      lastName: (activeTrainer.name || activeTrainer.user.name).split(' ').slice(1).join(' ') || '',
      email: activeTrainer.email || activeTrainer.user.email,
      phone: activeTrainer.phone,
      specialization: activeTrainer.specialization,
    };
  }

  async getDietPlan(userId: string): Promise<AssignedDietPlan | null> {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const assignment = await prisma.memberDietAssignment.findFirst({
      where: {
        memberId: member.id,
        isActive: true,
      },
      include: {
        dietPlan: true,
      },
    });

    if (!assignment) return null;

    return {
      id: assignment.id,
      dietPlan: {
        id: assignment.dietPlan.id,
        name: assignment.dietPlan.name,
        description: assignment.dietPlan.description || undefined,
        meals: assignment.dietPlan.meals as any[],
        totalCalories: assignment.dietPlan.calories || undefined,
      },
      startDate: assignment.startDate,
      endDate: assignment.endDate || undefined,
      isActive: assignment.isActive,
    };
  }

  async getExercisePlans(userId: string): Promise<AssignedExercisePlan[]> {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const assignments = await prisma.memberExerciseAssignment.findMany({
      where: {
        memberId: member.id,
        isActive: true,
      },
      include: {
        exercisePlan: true,
      },
    });

    return assignments.map((assignment) => ({
      id: assignment.id,
      exercisePlan: {
        id: assignment.exercisePlan.id,
        name: assignment.exercisePlan.name,
        description: assignment.exercisePlan.description || undefined,
        exercises: assignment.exercisePlan.exercises as any[],
        durationMinutes: undefined,
        difficulty: assignment.exercisePlan.type || undefined,
      },
      startDate: assignment.startDate,
      endDate: assignment.endDate || undefined,
      isActive: assignment.isActive,
    }));
  }

  async getMembership(userId: string): Promise<Membership> {
    const member = await prisma.member.findUnique({
      where: { userId },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!member) throw new NotFoundException('Member not found');
    if (!member.gym) throw new NotFoundException('No gym associated');

    let daysRemaining = 0;
    let isActive = false;

    if (member.membershipEnd) {
      const now = new Date();
      const diff = member.membershipEnd.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      isActive = daysRemaining > 0;
    }

    return {
      startDate: member.membershipStart || undefined,
      endDate: member.membershipEnd || undefined,
      daysRemaining,
      isActive,
      gym: member.gym,
    };
  }

  // Get member's personal diet plan (MemberDietPlan - individual plan created by gym owner)
  async getMyDietPlan(userId: string): Promise<any> {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const dietPlan = await prisma.memberDietPlan.findFirst({
      where: {
        memberId: member.id,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!dietPlan) return null;

    return {
      id: dietPlan.id,
      planName: dietPlan.planName,
      description: dietPlan.description,
      meals: dietPlan.meals,
      calories: dietPlan.calories,
      startDate: dietPlan.startDate,
      endDate: dietPlan.endDate,
      isActive: dietPlan.isActive,
      createdAt: dietPlan.createdAt,
      updatedAt: dietPlan.updatedAt,
    };
  }

  // Get all member's diet plans (history)
  async getMyDietPlanHistory(userId: string): Promise<any[]> {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const dietPlans = await prisma.memberDietPlan.findMany({
      where: {
        memberId: member.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return dietPlans.map((plan) => ({
      id: plan.id,
      planName: plan.planName,
      description: plan.description,
      meals: plan.meals,
      calories: plan.calories,
      startDate: plan.startDate,
      endDate: plan.endDate,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));
  }

  // Get member's supplements (via PT membership)
  async getMySupplements(userId: string): Promise<any[]> {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    // Get PT membership for this member
    const ptMember = await prisma.pTMember.findFirst({
      where: {
        memberId: member.id,
        isActive: true,
      },
    });

    if (!ptMember) {
      return []; // Not a PT member, no supplements
    }

    const supplements = await prisma.supplement.findMany({
      where: {
        ptMemberId: ptMember.id,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return supplements.map((sup) => ({
      id: sup.id,
      name: sup.name,
      dosage: sup.dosage,
      frequency: sup.frequency,
      timing: sup.timing,
      notes: sup.notes,
      startDate: sup.startDate,
      endDate: sup.endDate,
      isActive: sup.isActive,
      createdAt: sup.createdAt,
    }));
  }

  // Get member's PT membership details (if they are a PT member)
  async getMyPTMembership(userId: string): Promise<any | null> {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const ptMember = await prisma.pTMember.findFirst({
      where: {
        memberId: member.id,
        isActive: true,
      },
      include: {
        trainer: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!ptMember) return null;

    return {
      id: ptMember.id,
      sessionsTotal: ptMember.sessionsTotal,
      sessionsUsed: ptMember.sessionsUsed,
      sessionsRemaining: ptMember.sessionsTotal - ptMember.sessionsUsed,
      startDate: ptMember.startDate,
      endDate: ptMember.endDate,
      isActive: ptMember.isActive,
      trainer: {
        id: ptMember.trainer.id,
        name: ptMember.trainer.name || ptMember.trainer.user.name,
        email: ptMember.trainer.email || ptMember.trainer.user.email,
        specialization: ptMember.trainer.specialization,
      },
    };
  }
}

export default new MemberService();
