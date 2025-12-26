const prisma = require('../config/database');

class MemberService {
  async getDashboard(memberId) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: { select: { name: true, email: true } },
        gym: { 
          select: { 
            id: true, 
            name: true, 
            address: true, 
            phone: true,
            email: true
          } 
        },
        trainerAssignments: {
          where: { isActive: true },
          include: {
            trainer: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        },
        dietAssignments: {
          where: { isActive: true },
          include: { dietPlan: true },
          orderBy: { assignedAt: 'desc' },
          take: 1
        },
        exerciseAssignments: {
          where: { isActive: true },
          include: { exercisePlan: true },
          orderBy: { assignedAt: 'desc' }
        }
      }
    });

    if (!member) {
      throw { statusCode: 404, message: 'Member not found' };
    }

    // Determine membership status
    const now = new Date();
    const isExpired = member.membershipEnd < now;
    const daysRemaining = isExpired 
      ? 0 
      : Math.ceil((member.membershipEnd - now) / (1000 * 60 * 60 * 24));

    return {
      member,
      membershipStatus: isExpired ? 'EXPIRED' : 'ACTIVE',
      daysRemaining,
      assignedTrainer: member.trainerAssignments[0]?.trainer || null,
      currentDietPlan: member.dietAssignments[0]?.dietPlan || null,
      exercisePlans: member.exerciseAssignments.map(a => ({
        ...a.exercisePlan,
        dayOfWeek: a.dayOfWeek
      }))
    };
  }

  async getProfile(memberId) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: { 
          select: { 
            name: true, 
            email: true,
            createdAt: true
          } 
        },
        gym: { 
          select: { 
            name: true, 
            address: true, 
            phone: true,
            email: true
          } 
        }
      }
    });

    if (!member) {
      throw { statusCode: 404, message: 'Member not found' };
    }

    return member;
  }

  async getAssignedTrainer(memberId) {
    const assignment = await prisma.memberTrainerAssignment.findFirst({
      where: { memberId, isActive: true },
      include: {
        trainer: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });

    return assignment?.trainer || null;
  }

  async getDietPlan(memberId) {
    const assignment = await prisma.memberDietAssignment.findFirst({
      where: { memberId, isActive: true },
      include: { dietPlan: true },
      orderBy: { assignedAt: 'desc' }
    });

    return assignment?.dietPlan || null;
  }

  async getExercisePlans(memberId) {
    const assignments = await prisma.memberExerciseAssignment.findMany({
      where: { memberId, isActive: true },
      include: { exercisePlan: true },
      orderBy: { dayOfWeek: 'asc' }
    });

    return assignments.map(a => ({
      ...a.exercisePlan,
      dayOfWeek: a.dayOfWeek,
      assignedAt: a.assignedAt
    }));
  }

  async getTodayExercise(memberId) {
    const today = new Date().getDay(); // 0-6

    const assignment = await prisma.memberExerciseAssignment.findFirst({
      where: { 
        memberId, 
        isActive: true,
        OR: [
          { dayOfWeek: today },
          { dayOfWeek: null } // Daily plans
        ]
      },
      include: { exercisePlan: true },
      orderBy: { dayOfWeek: 'asc' }
    });

    return assignment?.exercisePlan || null;
  }

  async getMembershipStatus(memberId) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: {
        membershipStart: true,
        membershipEnd: true,
        membershipStatus: true,
        gym: { 
          select: { 
            name: true,
            subscriptionPlan: { select: { name: true } }
          } 
        }
      }
    });

    if (!member) {
      throw { statusCode: 404, message: 'Member not found' };
    }

    const now = new Date();
    const isExpired = member.membershipEnd < now;
    const daysRemaining = isExpired 
      ? 0 
      : Math.ceil((member.membershipEnd - now) / (1000 * 60 * 60 * 24));

    return {
      ...member,
      isExpired,
      daysRemaining
    };
  }
}

module.exports = new MemberService();
