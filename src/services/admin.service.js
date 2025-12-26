const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

class AdminService {
  // Dashboard Stats
  async getDashboardStats() {
    const [
      totalGyms,
      activeGyms,
      totalGymOwners,
      totalMembers,
      totalTrainers,
      subscriptionPlans,
      recentGyms
    ] = await Promise.all([
      prisma.gym.count(),
      prisma.gym.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'GYM_OWNER' } }),
      prisma.member.count(),
      prisma.trainer.count(),
      prisma.gymSubscriptionPlan.count({ where: { isActive: true } }),
      prisma.gym.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { name: true, email: true } } }
      })
    ]);

    return {
      totalGyms,
      activeGyms,
      inactiveGyms: totalGyms - activeGyms,
      totalGymOwners,
      totalMembers,
      totalTrainers,
      subscriptionPlans,
      recentGyms
    };
  }

  // Subscription Plan Management
  async createSubscriptionPlan(data) {
    return prisma.gymSubscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        durationDays: data.durationDays,
        features: data.features || []
      }
    });
  }

  async getAllSubscriptionPlans() {
    return prisma.gymSubscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    });
  }

  async updateSubscriptionPlan(id, data) {
    return prisma.gymSubscriptionPlan.update({
      where: { id },
      data
    });
  }

  async deleteSubscriptionPlan(id) {
    // Check if any gyms are using this plan
    const gymsUsingPlan = await prisma.gym.count({
      where: { subscriptionPlanId: id }
    });

    if (gymsUsingPlan > 0) {
      throw { 
        statusCode: 400, 
        message: `Cannot delete plan. ${gymsUsingPlan} gym(s) are using this plan.` 
      };
    }

    return prisma.gymSubscriptionPlan.delete({ where: { id } });
  }

  // Gym Management
  async createGym(data) {
    const gymData = {
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email
    };

    if (data.subscriptionPlanId) {
      const plan = await prisma.gymSubscriptionPlan.findUnique({
        where: { id: data.subscriptionPlanId }
      });

      if (plan) {
        gymData.subscriptionPlanId = data.subscriptionPlanId;
        gymData.subscriptionStart = new Date();
        gymData.subscriptionEnd = new Date(
          Date.now() + plan.durationDays * 24 * 60 * 60 * 1000
        );
      }
    }

    return prisma.gym.create({
      data: gymData,
      include: { subscriptionPlan: true }
    });
  }

  async getAllGyms(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;
    
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {};

    const [gyms, total] = await Promise.all([
      prisma.gym.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          subscriptionPlan: true,
          _count: { select: { members: true, trainers: true } }
        }
      }),
      prisma.gym.count({ where })
    ]);

    return {
      gyms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getGymById(id) {
    const gym = await prisma.gym.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        subscriptionPlan: true,
        _count: { select: { members: true, trainers: true } }
      }
    });

    if (!gym) {
      throw { statusCode: 404, message: 'Gym not found' };
    }

    return gym;
  }

  async updateGym(id, data) {
    return prisma.gym.update({
      where: { id },
      data,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        subscriptionPlan: true
      }
    });
  }

  async deleteGym(id) {
    return prisma.gym.delete({ where: { id } });
  }

  async toggleGymStatus(id) {
    const gym = await prisma.gym.findUnique({ where: { id } });
    if (!gym) {
      throw { statusCode: 404, message: 'Gym not found' };
    }

    return prisma.gym.update({
      where: { id },
      data: { isActive: !gym.isActive }
    });
  }

  // Gym Owner Management
  async createGymOwner(data) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw { statusCode: 409, message: 'Email already exists' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'GYM_OWNER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    return user;
  }

  async assignGymOwner(gymId, ownerId) {
    // Check if owner exists and is a GYM_OWNER
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
      throw { statusCode: 404, message: 'User not found' };
    }
    if (owner.role !== 'GYM_OWNER') {
      throw { statusCode: 400, message: 'User is not a gym owner' };
    }

    // Check if owner already has a gym
    const existingGym = await prisma.gym.findUnique({
      where: { ownerId }
    });
    if (existingGym) {
      throw { statusCode: 400, message: 'This owner is already assigned to a gym' };
    }

    return prisma.gym.update({
      where: { id: gymId },
      data: { ownerId },
      include: {
        owner: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async getAllGymOwners() {
    return prisma.user.findMany({
      where: { role: 'GYM_OWNER' },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        ownedGym: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async toggleUserStatus(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });
  }
}

module.exports = new AdminService();
