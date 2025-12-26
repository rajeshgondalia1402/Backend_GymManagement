const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

class GymOwnerService {
  // Dashboard Stats
  async getDashboardStats(gymId) {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      expiringMembers,
      totalTrainers,
      dietPlans,
      exercisePlans,
      gym
    ] = await Promise.all([
      prisma.member.count({ where: { gymId } }),
      prisma.member.count({ 
        where: { gymId, membershipStatus: 'ACTIVE', membershipEnd: { gte: now } } 
      }),
      prisma.member.count({ 
        where: { gymId, membershipEnd: { lt: now } } 
      }),
      prisma.member.count({
        where: {
          gymId,
          membershipEnd: { gte: now, lte: thirtyDaysFromNow }
        }
      }),
      prisma.trainer.count({ where: { gymId } }),
      prisma.dietPlan.count({ where: { gymId, isActive: true } }),
      prisma.exercisePlan.count({ where: { gymId, isActive: true } }),
      prisma.gym.findUnique({
        where: { id: gymId },
        include: { subscriptionPlan: true }
      })
    ]);

    return {
      totalMembers,
      activeMembers,
      expiredMembers,
      expiringMembers,
      totalTrainers,
      dietPlans,
      exercisePlans,
      gym
    };
  }

  // Trainer Management
  async createTrainer(gymId, data) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw { statusCode: 409, message: 'Email already exists' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user and trainer in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: 'MEMBER' // Trainers don't have separate login role yet
        }
      });

      const trainer = await tx.trainer.create({
        data: {
          userId: user.id,
          gymId,
          specialization: data.specialization,
          experience: data.experience,
          phone: data.phone
        },
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      });

      return trainer;
    });

    return result;
  }

  async getAllTrainers(gymId) {
    return prisma.trainer.findMany({
      where: { gymId },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        _count: { select: { members: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTrainerById(gymId, trainerId) {
    const trainer = await prisma.trainer.findFirst({
      where: { id: trainerId, gymId },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        members: {
          where: { isActive: true },
          include: {
            member: {
              include: { user: { select: { name: true, email: true } } }
            }
          }
        }
      }
    });

    if (!trainer) {
      throw { statusCode: 404, message: 'Trainer not found' };
    }

    return trainer;
  }

  async updateTrainer(gymId, trainerId, data) {
    const trainer = await prisma.trainer.findFirst({
      where: { id: trainerId, gymId }
    });

    if (!trainer) {
      throw { statusCode: 404, message: 'Trainer not found' };
    }

    return prisma.trainer.update({
      where: { id: trainerId },
      data: {
        specialization: data.specialization,
        experience: data.experience,
        phone: data.phone
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async deleteTrainer(gymId, trainerId) {
    const trainer = await prisma.trainer.findFirst({
      where: { id: trainerId, gymId }
    });

    if (!trainer) {
      throw { statusCode: 404, message: 'Trainer not found' };
    }

    await prisma.$transaction([
      prisma.trainer.delete({ where: { id: trainerId } }),
      prisma.user.delete({ where: { id: trainer.userId } })
    ]);

    return { message: 'Trainer deleted successfully' };
  }

  // Member Management
  async createMember(gymId, data) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw { statusCode: 409, message: 'Email already exists' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: 'MEMBER'
        }
      });

      const member = await tx.member.create({
        data: {
          userId: user.id,
          gymId,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender,
          address: data.address,
          emergencyContact: data.emergencyContact,
          healthNotes: data.healthNotes,
          membershipEnd: new Date(data.membershipEnd)
        },
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      });

      return member;
    });

    return result;
  }

  async getAllMembers(gymId, page = 1, limit = 10, status = null) {
    const skip = (page - 1) * limit;
    const now = new Date();

    let where = { gymId };

    if (status === 'active') {
      where.membershipEnd = { gte: now };
      where.membershipStatus = 'ACTIVE';
    } else if (status === 'expired') {
      where.membershipEnd = { lt: now };
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, isActive: true } },
          trainerAssignments: {
            where: { isActive: true },
            include: {
              trainer: { include: { user: { select: { name: true } } } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.member.count({ where })
    ]);

    return {
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getMemberById(gymId, memberId) {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        trainerAssignments: {
          where: { isActive: true },
          include: {
            trainer: { include: { user: { select: { name: true, email: true } } } }
          }
        },
        dietAssignments: {
          where: { isActive: true },
          include: { dietPlan: true }
        },
        exerciseAssignments: {
          where: { isActive: true },
          include: { exercisePlan: true }
        }
      }
    });

    if (!member) {
      throw { statusCode: 404, message: 'Member not found' };
    }

    return member;
  }

  async updateMember(gymId, memberId, data) {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId }
    });

    if (!member) {
      throw { statusCode: 404, message: 'Member not found' };
    }

    const updateData = {};
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.emergencyContact !== undefined) updateData.emergencyContact = data.emergencyContact;
    if (data.healthNotes !== undefined) updateData.healthNotes = data.healthNotes;
    if (data.membershipEnd) updateData.membershipEnd = new Date(data.membershipEnd);
    if (data.membershipStatus) updateData.membershipStatus = data.membershipStatus;

    return prisma.member.update({
      where: { id: memberId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async deleteMember(gymId, memberId) {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId }
    });

    if (!member) {
      throw { statusCode: 404, message: 'Member not found' };
    }

    await prisma.$transaction([
      prisma.member.delete({ where: { id: memberId } }),
      prisma.user.delete({ where: { id: member.userId } })
    ]);

    return { message: 'Member deleted successfully' };
  }

  // Diet Plan Management
  async createDietPlan(gymId, data) {
    return prisma.dietPlan.create({
      data: {
        gymId,
        name: data.name,
        description: data.description,
        calories: data.calories,
        meals: data.meals || {}
      }
    });
  }

  async getAllDietPlans(gymId) {
    return prisma.dietPlan.findMany({
      where: { gymId },
      include: {
        _count: { select: { assignments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateDietPlan(gymId, planId, data) {
    const plan = await prisma.dietPlan.findFirst({
      where: { id: planId, gymId }
    });

    if (!plan) {
      throw { statusCode: 404, message: 'Diet plan not found' };
    }

    return prisma.dietPlan.update({
      where: { id: planId },
      data
    });
  }

  async deleteDietPlan(gymId, planId) {
    const plan = await prisma.dietPlan.findFirst({
      where: { id: planId, gymId }
    });

    if (!plan) {
      throw { statusCode: 404, message: 'Diet plan not found' };
    }

    return prisma.dietPlan.delete({ where: { id: planId } });
  }

  // Exercise Plan Management
  async createExercisePlan(gymId, data) {
    return prisma.exercisePlan.create({
      data: {
        gymId,
        name: data.name,
        description: data.description,
        type: data.type,
        exercises: data.exercises || {}
      }
    });
  }

  async getAllExercisePlans(gymId) {
    return prisma.exercisePlan.findMany({
      where: { gymId },
      include: {
        _count: { select: { assignments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateExercisePlan(gymId, planId, data) {
    const plan = await prisma.exercisePlan.findFirst({
      where: { id: planId, gymId }
    });

    if (!plan) {
      throw { statusCode: 404, message: 'Exercise plan not found' };
    }

    return prisma.exercisePlan.update({
      where: { id: planId },
      data
    });
  }

  async deleteExercisePlan(gymId, planId) {
    const plan = await prisma.exercisePlan.findFirst({
      where: { id: planId, gymId }
    });

    if (!plan) {
      throw { statusCode: 404, message: 'Exercise plan not found' };
    }

    return prisma.exercisePlan.delete({ where: { id: planId } });
  }

  // Assignments
  async assignTrainerToMember(gymId, memberId, trainerId) {
    // Verify member belongs to gym
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId }
    });
    if (!member) {
      throw { statusCode: 404, message: 'Member not found' };
    }

    // Verify trainer belongs to gym
    const trainer = await prisma.trainer.findFirst({
      where: { id: trainerId, gymId }
    });
    if (!trainer) {
      throw { statusCode: 404, message: 'Trainer not found' };
    }

    // Deactivate any existing assignment
    await prisma.memberTrainerAssignment.updateMany({
      where: { memberId, isActive: true },
      data: { isActive: false }
    });

    // Create new assignment
    return prisma.memberTrainerAssignment.create({
      data: { memberId, trainerId },
      include: {
        member: { include: { user: { select: { name: true } } } },
        trainer: { include: { user: { select: { name: true } } } }
      }
    });
  }

  async assignDietPlanToMember(gymId, memberId, dietPlanId, startDate, endDate) {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId }
    });
    if (!member) {
      throw { statusCode: 404, message: 'Member not found' };
    }

    const dietPlan = await prisma.dietPlan.findFirst({
      where: { id: dietPlanId, gymId }
    });
    if (!dietPlan) {
      throw { statusCode: 404, message: 'Diet plan not found' };
    }

    // Deactivate existing diet assignment
    await prisma.memberDietAssignment.updateMany({
      where: { memberId, isActive: true },
      data: { isActive: false }
    });

    return prisma.memberDietAssignment.create({
      data: {
        memberId,
        dietPlanId,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        member: { include: { user: { select: { name: true } } } },
        dietPlan: true
      }
    });
  }

  async assignExercisePlanToMember(gymId, memberId, exercisePlanId, dayOfWeek, startDate, endDate) {
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId }
    });
    if (!member) {
      throw { statusCode: 404, message: 'Member not found' };
    }

    const exercisePlan = await prisma.exercisePlan.findFirst({
      where: { id: exercisePlanId, gymId }
    });
    if (!exercisePlan) {
      throw { statusCode: 404, message: 'Exercise plan not found' };
    }

    return prisma.memberExerciseAssignment.create({
      data: {
        memberId,
        exercisePlanId,
        dayOfWeek,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        member: { include: { user: { select: { name: true } } } },
        exercisePlan: true
      }
    });
  }

  async removeAssignment(gymId, assignmentType, assignmentId) {
    let model;
    switch (assignmentType) {
      case 'trainer':
        model = prisma.memberTrainerAssignment;
        break;
      case 'diet':
        model = prisma.memberDietAssignment;
        break;
      case 'exercise':
        model = prisma.memberExerciseAssignment;
        break;
      default:
        throw { statusCode: 400, message: 'Invalid assignment type' };
    }

    return model.update({
      where: { id: assignmentId },
      data: { isActive: false }
    });
  }
}

module.exports = new GymOwnerService();
