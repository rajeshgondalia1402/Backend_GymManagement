import bcrypt from 'bcryptjs';
import { prisma } from '../../../config/database';
import { NotFoundException, ConflictException } from '../../../common/exceptions';
import {
  SubscriptionPlan,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  Gym,
  CreateGymRequest,
  UpdateGymRequest,
  GymOwner,
  CreateGymOwnerRequest,
  DashboardStats,
  PaginationParams,
} from './admin.types';

class AdminService {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    // Get role IDs
    const gymOwnerRole = await prisma.rolemaster.findFirst({ where: { rolename: 'GYM_OWNER' } });
    const memberRole = await prisma.rolemaster.findFirst({ where: { rolename: 'MEMBER' } });
    const trainerRole = await prisma.rolemaster.findFirst({ where: { rolename: 'TRAINER' } });

    const [totalGyms, totalGymOwners, totalMembers, totalTrainers, activeSubscriptions] =
      await Promise.all([
        prisma.gym.count(),
        gymOwnerRole ? prisma.user.count({ where: { roleId: gymOwnerRole.Id } }) : 0,
        memberRole ? prisma.member.count() : 0,
        trainerRole ? prisma.trainer.count() : 0,
        prisma.gym.count({ where: { isActive: true } }),
      ]);

    return {
      totalGyms,
      totalGymOwners,
      totalMembers,
      totalTrainers,
      activeSubscriptions,
      revenueThisMonth: 0, // TODO: Implement revenue calculation
    };
  }

  // Subscription Plans - using GymSubscriptionPlan
  async getSubscriptionPlans(params: PaginationParams): Promise<{ plans: SubscriptionPlan[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }] }
      : {};

    const [dbPlans, total] = await Promise.all([
      prisma.gymSubscriptionPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.gymSubscriptionPlan.count({ where }),
    ]);

    // Transform to match our interface
    const plans: SubscriptionPlan[] = dbPlans.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      price: Number(p.price),
      currency: p.priceCurrency,
      durationDays: p.durationDays,
      maxMembers: 0, // Not in schema, will need migration
      maxTrainers: 0, // Not in schema, will need migration
      features: p.features ? [p.features] : [],
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return { plans, total };
  }

  async getSubscriptionPlanById(id: string): Promise<SubscriptionPlan> {
    const plan = await prisma.gymSubscriptionPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Subscription plan not found');
    
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || undefined,
      price: Number(plan.price),
      currency: plan.priceCurrency,
      durationDays: plan.durationDays,
      maxMembers: 0,
      maxTrainers: 0,
      features: plan.features ? [plan.features] : [],
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  async createSubscriptionPlan(data: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
    const plan = await prisma.gymSubscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        priceCurrency: data.currency || 'INR',
        durationDays: data.durationDays,
        features: typeof data.features === 'string' ? data.features : (data.features?.join('\n') || ''),
        isActive: data.isActive ?? true,
      },
    });

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || undefined,
      price: Number(plan.price),
      currency: plan.priceCurrency,
      durationDays: plan.durationDays,
      maxMembers: data.maxMembers || 0,
      maxTrainers: data.maxTrainers || 0,
      features: typeof data.features === 'string' ? [data.features] : (data.features || []),
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  async updateSubscriptionPlan(id: string, data: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
    await this.getSubscriptionPlanById(id);
    
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.price) updateData.price = data.price;
    if (data.currency) updateData.priceCurrency = data.currency;
    if (data.durationDays) updateData.durationDays = data.durationDays;
    if (data.features) {
      updateData.features = typeof data.features === 'string' ? data.features : data.features.join('\n');
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const plan = await prisma.gymSubscriptionPlan.update({
      where: { id },
      data: updateData,
    });

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || undefined,
      price: Number(plan.price),
      currency: plan.priceCurrency,
      durationDays: plan.durationDays,
      maxMembers: data.maxMembers || 0,
      maxTrainers: data.maxTrainers || 0,
      features: typeof data.features === 'string' ? [data.features] : (plan.features ? plan.features.split('\n') : []),
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  async deleteSubscriptionPlan(id: string): Promise<void> {
    await this.getSubscriptionPlanById(id);
    const gymsUsingPlan = await prisma.gym.count({ where: { subscriptionPlanId: id } });
    if (gymsUsingPlan > 0) {
      throw new ConflictException('Cannot delete plan with active gyms');
    }
    await prisma.gymSubscriptionPlan.delete({ where: { id } });
  }

  // Gyms
  async getGyms(params: PaginationParams): Promise<{ gyms: Gym[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [gyms, total] = await Promise.all([
      prisma.gym.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          subscriptionPlan: true,
          owner: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.gym.count({ where }),
    ]);

    return { gyms: gyms as unknown as Gym[], total };
  }

  async getGymById(id: string): Promise<Gym> {
    const gym = await prisma.gym.findUnique({
      where: { id },
      include: {
        subscriptionPlan: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    });
    if (!gym) throw new NotFoundException('Gym not found');
    return gym as unknown as Gym;
  }

  async createGym(data: CreateGymRequest): Promise<Gym> {
    if (data.email) {
      const existingGym = await prisma.gym.findFirst({ where: { email: data.email } });
      if (existingGym) throw new ConflictException('Gym with this email already exists');
    }

    const gym = await prisma.gym.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        subscriptionPlanId: data.subscriptionPlanId,
        ownerId: data.ownerId,
      },
      include: { subscriptionPlan: true },
    });

    return gym as unknown as Gym;
  }

  async updateGym(id: string, data: UpdateGymRequest): Promise<Gym> {
    await this.getGymById(id);
    const gym = await prisma.gym.update({
      where: { id },
      data,
      include: { subscriptionPlan: true },
    });
    return gym as unknown as Gym;
  }

  async deleteGym(id: string): Promise<void> {
    await this.getGymById(id);
    await prisma.gym.delete({ where: { id } });
  }

  async toggleGymStatus(id: string): Promise<Gym> {
    const gym = await this.getGymById(id);
    const updated = await prisma.gym.update({
      where: { id },
      data: { isActive: !gym.isActive },
      include: { subscriptionPlan: true },
    });
    return updated as unknown as Gym;
  }

  // Gym Owners
  async getGymOwners(params: PaginationParams): Promise<{ owners: GymOwner[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const gymOwnerRole = await prisma.rolemaster.findFirst({ where: { rolename: 'GYM_OWNER' } });
    if (!gymOwnerRole) return { owners: [], total: 0 };

    const where = {
      roleId: gymOwnerRole.Id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { ownedGym: { select: { id: true } } },
      }),
      prisma.user.count({ where }),
    ]);

    const owners: GymOwner[] = users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.name.split(' ')[0] || u.name,
      lastName: u.name.split(' ').slice(1).join(' ') || '',
      phone: undefined,
      isActive: u.isActive,
      gymId: u.ownedGym?.id,
      createdAt: u.createdAt,
    }));

    return { owners, total };
  }

  async createGymOwner(data: CreateGymOwnerRequest): Promise<GymOwner> {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictException('User with this email already exists');

    const gymOwnerRole = await prisma.rolemaster.findFirst({ where: { rolename: 'GYM_OWNER' } });
    if (!gymOwnerRole) throw new NotFoundException('GYM_OWNER role not found');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: `${data.firstName} ${data.lastName}`,
        roleId: gymOwnerRole.Id,
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      isActive: user.isActive,
      gymId: undefined,
      createdAt: user.createdAt,
    };
  }

  async toggleUserStatus(id: string): Promise<{ isActive: boolean }> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return { isActive: updated.isActive };
  }
}

export default new AdminService();
