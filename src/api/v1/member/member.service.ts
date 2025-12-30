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

    return {
      id: member.id,
      email: user.email,
      firstName: user.name.split(' ')[0] || user.name,
      lastName: user.name.split(' ').slice(1).join(' ') || '',
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
        firstName: activeTrainer.user.name.split(' ')[0],
        lastName: activeTrainer.user.name.split(' ').slice(1).join(' ') || '',
        email: activeTrainer.user.email,
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
        await tx.user.update({
          where: { id: userId },
          data: { name: `${newFirst} ${newLast}` }
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
            name: activeTrainer.user.name,
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
      firstName: activeTrainer.user.name.split(' ')[0],
      lastName: activeTrainer.user.name.split(' ').slice(1).join(' ') || '',
      email: activeTrainer.user.email,
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
}

export default new MemberService();
