import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { prisma } from '../../../config/database';
import { NotFoundException, ConflictException, BadRequestException } from '../../../common/exceptions';
import { maskPassword, generateTempPassword } from '../../../common/utils';
import {
  SubscriptionPlan,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  Gym,
  CreateGymRequest,
  UpdateGymRequest,
  GymOwner,
  CreateGymOwnerRequest,
  UpdateGymOwnerRequest,
  DashboardStats,
  PaginationParams,
  GymParams,
  PlanCategory,
  CreatePlanCategoryRequest,
  UpdatePlanCategoryRequest,
  Occupation,
  CreateOccupationRequest,
  UpdateOccupationRequest,
  EnquiryType,
  CreateEnquiryTypeRequest,
  UpdateEnquiryTypeRequest,
  PaymentType,
  CreatePaymentTypeRequest,
  UpdatePaymentTypeRequest,
  RenewGymSubscriptionRequest,
  GymSubscriptionHistoryParams,
  CreateGymInquiryRequest,
  UpdateGymInquiryRequest,
  CreateGymInquiryFollowupRequest,
  GymInquiryParams,
  AdminMembersParams,
  AdminMemberDetails,
  AdminExpenseGroup,
  CreateAdminExpenseGroupRequest,
  UpdateAdminExpenseGroupRequest,
  AdminExpense,
  CreateAdminExpenseRequest,
  UpdateAdminExpenseRequest,
  AdminExpenseListParams,
  AdminExpenseListResponse,
  AdminPaymentMode,
  AdminDashboardCounts,
  DashboardDetailParams,
  ActiveGymDetail,
  GymInquiryDetail,
  ExpiringGymDetail,
  ExpiredGymDetail,
  RenewalGymDetail,
  MemberDetail,
  PopularPlanGymDetail,
  IncomeDetail,
  ExpenseDetail,
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
  async getGyms(params: GymParams): Promise<{ gyms: any[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc', subscriptionStatus } = params;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const searchWhere = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { city: { contains: search, mode: 'insensitive' as const } },
            { state: { contains: search, mode: 'insensitive' as const } },
            { gstRegNo: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Build where clause for subscription status filter
    // Logic matches frontend getGymSubscriptionStatus():
    // - daysRemaining = Math.ceil((endDate - today) / oneDay)
    // - EXPIRED: daysRemaining < 0 (end date before today)
    // - EXPIRING_SOON: daysRemaining >= 0 && daysRemaining <= 7 (today through 7 days from now)
    // - ACTIVE: daysRemaining > 7 (more than 7 days from now)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Day 8 from today is the first day considered "ACTIVE"
    // e.g., if today is Feb 9, then Feb 17 onwards is ACTIVE
    const startOfDay8 = new Date(startOfToday);
    startOfDay8.setDate(startOfDay8.getDate() + 8);

    // Build subscription status conditions using AND array for clarity
    const subscriptionConditions: any[] = [];

    if (subscriptionStatus === 'ACTIVE') {
      // Active: daysRemaining > 7 → subscriptionEnd >= startOfDay8
      subscriptionConditions.push({ subscriptionPlanId: { not: null } });
      subscriptionConditions.push({ subscriptionEnd: { not: null } });
      subscriptionConditions.push({ subscriptionEnd: { gte: startOfDay8 } });
    } else if (subscriptionStatus === 'EXPIRING_SOON') {
      // Expiring Soon: daysRemaining >= 0 && daysRemaining <= 7
      subscriptionConditions.push({ subscriptionPlanId: { not: null } });
      subscriptionConditions.push({ subscriptionEnd: { not: null } });
      subscriptionConditions.push({ subscriptionEnd: { gte: startOfToday } });
      subscriptionConditions.push({ subscriptionEnd: { lt: startOfDay8 } });
    } else if (subscriptionStatus === 'EXPIRED') {
      // Expired: daysRemaining < 0 → subscriptionEnd < startOfToday
      subscriptionConditions.push({ subscriptionPlanId: { not: null } });
      subscriptionConditions.push({ subscriptionEnd: { not: null } });
      subscriptionConditions.push({ subscriptionEnd: { lt: startOfToday } });
    }

    // Combine search and subscription status filters using AND
    const whereConditions: any[] = [];
    if (search) {
      whereConditions.push(searchWhere);
    }
    if (subscriptionConditions.length > 0) {
      whereConditions.push(...subscriptionConditions);
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [gyms, total] = await Promise.all([
      prisma.gym.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          subscriptionPlan: true,
          owner: { select: { id: true, name: true, email: true } },
          subscriptionHistory: {
            select: {
              amount: true,
              paidAmount: true,
            },
          },
        },
      }),
      prisma.gym.count({ where }),
    ]);

    // Calculate total subscription amount per gym
    const gymsWithTotalAmount = gyms.map((gym) => {
      const totalSubscriptionAmount = gym.subscriptionHistory.reduce(
        (sum, history) => sum + Number(history.amount || 0),
        0
      );
      const totalPaidAmount = gym.subscriptionHistory.reduce(
        (sum, history) => sum + Number(history.paidAmount || 0),
        0
      );
      const totalPendingAmount = totalSubscriptionAmount - totalPaidAmount;

      // Remove subscriptionHistory array from response and add totals
      const { subscriptionHistory, ...gymData } = gym;
      return {
        ...gymData,
        totalSubscriptionAmount,
        totalPaidAmount,
        totalPendingAmount,
      };
    });

    return { gyms: gymsWithTotalAmount, total };
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

    // Calculate subscription dates if a plan is assigned
    let subscriptionStart: Date | undefined;
    let subscriptionEnd: Date | undefined;
    let plan: any = null;
    if (data.subscriptionPlanId) {
      plan = await prisma.gymSubscriptionPlan.findUnique({
        where: { id: data.subscriptionPlanId },
      });
      if (plan) {
        subscriptionStart = new Date();
        subscriptionEnd = new Date();
        subscriptionEnd.setDate(subscriptionEnd.getDate() + plan.durationDays);
      }
    }

    // Use transaction to create gym and initial subscription history
    const gym = await prisma.$transaction(async (tx) => {
      const newGym = await tx.gym.create({
        data: {
          name: data.name,
          address1: data.address1,
          address2: data.address2,
          city: data.city,
          state: data.state,
          zipcode: data.zipcode,
          mobileNo: data.mobileNo,
          phoneNo: data.phoneNo,
          email: data.email,
          gstRegNo: data.gstRegNo,
          website: data.website,
          memberSize: data.memberSize,
          note: data.note,
          gymLogo: data.gymLogo,
          subscriptionPlanId: data.subscriptionPlanId,
          ownerId: data.ownerId,
          subscriptionStart,
          subscriptionEnd,
        },
        include: { subscriptionPlan: true },
      });

      // Create initial subscription history record if plan is assigned
      if (plan && subscriptionStart && subscriptionEnd) {
        const planPrice = Number(plan.price);
        const discount = data.extraDiscount || 0;
        if (discount < 0 || discount > planPrice) {
          throw new ConflictException('Extra discount must be between 0 and the plan price');
        }
        const finalAmount = planPrice - discount;

        const subscriptionNumber = await this.generateSubscriptionNumber(tx);
        await tx.gymSubscriptionHistory.create({
          data: {
            subscriptionNumber,
            gymId: newGym.id,
            subscriptionPlanId: data.subscriptionPlanId!,
            subscriptionStart,
            subscriptionEnd,
            renewalType: 'NEW',
            planAmount: planPrice,
            extraDiscount: discount,
            amount: finalAmount,
            paymentStatus: 'PAID',
            paidAmount: finalAmount,
            pendingAmount: 0,
            isActive: true,
          },
        });
      }

      return newGym;
    });

    return gym as unknown as Gym;
  }

  async updateGym(id: string, data: UpdateGymRequest): Promise<Gym> {
    const existingGym = await prisma.gym.findUnique({
      where: { id },
      include: { subscriptionPlan: true },
    });
    if (!existingGym) throw new NotFoundException('Gym not found');

    // Build update data object with only provided fields
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address1 !== undefined) updateData.address1 = data.address1;
    if (data.address2 !== undefined) updateData.address2 = data.address2;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.zipcode !== undefined) updateData.zipcode = data.zipcode;
    if (data.mobileNo !== undefined) updateData.mobileNo = data.mobileNo;
    if (data.phoneNo !== undefined) updateData.phoneNo = data.phoneNo;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.gstRegNo !== undefined) updateData.gstRegNo = data.gstRegNo;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.memberSize !== undefined) updateData.memberSize = data.memberSize;
    if (data.note !== undefined) updateData.note = data.note;
    if (data.gymLogo !== undefined) updateData.gymLogo = data.gymLogo || null;

    let newPlan: any = null;
    const subscriptionPlanChanged = data.subscriptionPlanId !== undefined && data.subscriptionPlanId !== existingGym.subscriptionPlanId;

    if (data.subscriptionPlanId !== undefined) {
      updateData.subscriptionPlanId = data.subscriptionPlanId;

      // When subscription plan changes, reset subscription dates
      newPlan = await prisma.gymSubscriptionPlan.findUnique({
        where: { id: data.subscriptionPlanId },
      });
      if (newPlan) {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + newPlan.durationDays);
        updateData.subscriptionStart = now;
        updateData.subscriptionEnd = endDate;
      }
    }
    if (data.ownerId !== undefined) updateData.ownerId = data.ownerId;

    // Use transaction when subscription plan changes to also create history
    const gym = await prisma.$transaction(async (tx) => {
      const updatedGym = await tx.gym.update({
        where: { id },
        data: updateData,
        include: { subscriptionPlan: true },
      });

      // Create subscription history record when plan changes
      if (subscriptionPlanChanged && newPlan) {
        // Backfill: if no history records exist for this gym (gym created before history feature),
        // create an initial "NEW" record for the original subscription
        const existingHistoryCount = await tx.gymSubscriptionHistory.count({ where: { gymId: id } });
        if (existingHistoryCount === 0 && existingGym.subscriptionPlanId && existingGym.subscriptionPlan && existingGym.subscriptionStart && existingGym.subscriptionEnd) {
          const initialSubNumber = await this.generateSubscriptionNumber(tx);
          const initialPlanPrice = Number(existingGym.subscriptionPlan.price);
          await tx.gymSubscriptionHistory.create({
            data: {
              subscriptionNumber: initialSubNumber,
              gymId: id,
              subscriptionPlanId: existingGym.subscriptionPlanId,
              subscriptionStart: existingGym.subscriptionStart,
              subscriptionEnd: existingGym.subscriptionEnd,
              renewalDate: existingGym.subscriptionStart,
              renewalType: 'NEW',
              planAmount: initialPlanPrice,
              extraDiscount: 0,
              amount: initialPlanPrice,
              paymentStatus: 'PAID',
              paidAmount: initialPlanPrice,
              pendingAmount: 0,
              isActive: true,
            },
          });
        }

        // Deactivate previous history records
        await tx.gymSubscriptionHistory.updateMany({
          where: { gymId: id, isActive: true },
          data: { isActive: false },
        });

        // Determine renewal type
        let renewalType: 'NEW' | 'RENEWAL' | 'UPGRADE' | 'DOWNGRADE' = 'NEW';
        if (existingGym.subscriptionPlanId && existingGym.subscriptionPlan) {
          const oldPrice = Number(existingGym.subscriptionPlan.price);
          const newPrice = Number(newPlan.price);
          if (existingGym.subscriptionPlanId === data.subscriptionPlanId) {
            renewalType = 'RENEWAL';
          } else if (newPrice > oldPrice) {
            renewalType = 'UPGRADE';
          } else if (newPrice < oldPrice) {
            renewalType = 'DOWNGRADE';
          } else {
            renewalType = 'RENEWAL';
          }
        }

        const newPlanPrice = Number(newPlan.price);
        const discount = data.extraDiscount || 0;
        if (discount < 0 || discount > newPlanPrice) {
          throw new ConflictException('Extra discount must be between 0 and the plan price');
        }
        const finalAmount = newPlanPrice - discount;

        const subscriptionNumber = await this.generateSubscriptionNumber(tx);
        await tx.gymSubscriptionHistory.create({
          data: {
            subscriptionNumber,
            gymId: id,
            subscriptionPlanId: data.subscriptionPlanId!,
            subscriptionStart: updateData.subscriptionStart,
            subscriptionEnd: updateData.subscriptionEnd,
            renewalType,
            planAmount: newPlanPrice,
            extraDiscount: discount,
            amount: finalAmount,
            previousPlanId: existingGym.subscriptionPlanId || undefined,
            previousPlanName: existingGym.subscriptionPlan?.name || undefined,
            previousSubscriptionEnd: existingGym.subscriptionEnd || undefined,
            paymentStatus: 'PAID',
            paidAmount: finalAmount,
            pendingAmount: 0,
            isActive: true,
          },
        });
      }

      return updatedGym;
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

  async assignGymOwner(gymId: string, ownerId: string, password?: string): Promise<Gym> {
    // Verify gym exists
    await this.getGymById(gymId);

    // Verify user exists and is a gym owner
    const gymOwnerRole = await prisma.rolemaster.findFirst({ where: { rolename: 'GYM_OWNER' } });
    if (!gymOwnerRole) throw new NotFoundException('Gym owner role not found');

    const user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.roleId !== gymOwnerRole.Id) {
      throw new ConflictException('User is not a gym owner');
    }

    // Check if user already owns a gym
    const existingGym = await prisma.gym.findFirst({ where: { ownerId } });
    if (existingGym && existingGym.id !== gymId) {
      throw new ConflictException('User already owns another gym');
    }

    // Assign owner to gym (and store password if provided)
    const gym = await prisma.gym.update({
      where: { id: gymId },
      data: {
        ownerId,
        ...(password && { ownerPassword: password }),
      },
      include: {
        subscriptionPlan: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    return gym as unknown as Gym;
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
        include: { ownedGym: { select: { id: true, name: true, ownerPassword: true } } },
      }),
      prisma.user.count({ where }),
    ]);

    const owners: GymOwner[] = users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.name.split(' ')[0] || u.name,
      lastName: u.name.split(' ').slice(1).join(' ') || '',
      phone: undefined,
      passwordHint: maskPassword(u.ownedGym?.ownerPassword),
      isActive: u.isActive,
      gymId: u.ownedGym?.id || '',
      gymName: u.ownedGym?.name || '',
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
    
    // Handle both name formats: single 'name' field or 'firstName'/'lastName'
    const fullName = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim();
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: fullName,
        roleId: gymOwnerRole.Id,
      },
    });

    const nameParts = fullName.split(' ');
    return {
      id: user.id,
      email: user.email,
      firstName: data.firstName || nameParts[0] || fullName,
      lastName: data.lastName || nameParts.slice(1).join(' ') || '',
      phone: data.phone,
      passwordHint: maskPassword(data.password),
      isActive: user.isActive,
      gymId: undefined,
      createdAt: user.createdAt,
    };
  }

  async getGymOwnerById(id: string): Promise<GymOwner> {
    const gymOwnerRole = await prisma.rolemaster.findFirst({ where: { rolename: 'GYM_OWNER' } });
    if (!gymOwnerRole) throw new NotFoundException('GYM_OWNER role not found');

    const user = await prisma.user.findUnique({
      where: { id },
      include: { ownedGym: { select: { id: true, name: true, ownerPassword: true } } },
    });

    if (!user) throw new NotFoundException('Gym owner not found');
    if (user.roleId !== gymOwnerRole.Id) throw new NotFoundException('User is not a gym owner');

    const nameParts = user.name.split(' ');
    return {
      id: user.id,
      email: user.email,
      firstName: nameParts[0] || user.name,
      lastName: nameParts.slice(1).join(' ') || '',
      phone: undefined,
      passwordHint: maskPassword(user.ownedGym?.ownerPassword),
      isActive: user.isActive,
      gymId: user.ownedGym?.id || '',
      gymName: user.ownedGym?.name || '',
      createdAt: user.createdAt,
    };
  }

  async updateGymOwner(id: string, data: UpdateGymOwnerRequest): Promise<GymOwner> {
    const gymOwnerRole = await prisma.rolemaster.findFirst({ where: { rolename: 'GYM_OWNER' } });
    if (!gymOwnerRole) throw new NotFoundException('GYM_OWNER role not found');

    const user = await prisma.user.findUnique({
      where: { id },
      include: { ownedGym: { select: { id: true, name: true, ownerPassword: true } } },
    });

    if (!user) throw new NotFoundException('Gym owner not found');
    if (user.roleId !== gymOwnerRole.Id) throw new NotFoundException('User is not a gym owner');

    // Check if email is being changed and if new email already exists
    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) throw new ConflictException('User with this email already exists');
    }

    // Handle name update
    let fullName = user.name;
    if (data.name) {
      fullName = data.name;
    } else if (data.firstName || data.lastName) {
      const currentParts = user.name.split(' ');
      const firstName = data.firstName || currentParts[0] || '';
      const lastName = data.lastName || currentParts.slice(1).join(' ') || '';
      fullName = `${firstName} ${lastName}`.trim();
    }

    // Handle password update
    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    // Use transaction to update both User and Gym (for ownerPassword)
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          name: fullName,
          email: data.email || user.email,
          isActive: data.isActive !== undefined ? data.isActive : user.isActive,
          ...(hashedPassword && { password: hashedPassword }),
        },
        include: { ownedGym: { select: { id: true, name: true, ownerPassword: true } } },
      });

      // If password is being updated and user has a gym, update ownerPassword in Gym table
      if (data.password && updatedUser.ownedGym) {
        await tx.gym.update({
          where: { id: updatedUser.ownedGym.id },
          data: { ownerPassword: data.password },
        });
      }

      return {
        user: updatedUser,
        newPassword: data.password,
      };
    });

    const nameParts = result.user.name.split(' ');
    return {
      id: result.user.id,
      email: result.user.email,
      firstName: nameParts[0] || result.user.name,
      lastName: nameParts.slice(1).join(' ') || '',
      phone: data.phone,
      passwordHint: maskPassword(result.newPassword || result.user.ownedGym?.ownerPassword),
      isActive: result.user.isActive,
      gymId: result.user.ownedGym?.id || '',
      gymName: result.user.ownedGym?.name || '',
      createdAt: result.user.createdAt,
    };
  }

  async deleteGymOwner(id: string): Promise<void> {
    const gymOwnerRole = await prisma.rolemaster.findFirst({ where: { rolename: 'GYM_OWNER' } });
    if (!gymOwnerRole) throw new NotFoundException('GYM_OWNER role not found');

    const user = await prisma.user.findUnique({
      where: { id },
      include: { ownedGym: true },
    });

    if (!user) throw new NotFoundException('Gym owner not found');
    if (user.roleId !== gymOwnerRole.Id) throw new NotFoundException('User is not a gym owner');

    // If the gym owner has a gym, unassign them first
    if (user.ownedGym) {
      await prisma.gym.update({
        where: { id: user.ownedGym.id },
        data: { ownerId: null },
      });
    }

    await prisma.user.delete({ where: { id } });
  }

  /**
   * Reset gym owner password - generates a new temporary password
   * The gym owner should change this password on their next login
   */
  async resetGymOwnerPassword(id: string): Promise<{ ownerId: string; email: string; temporaryPassword: string; message: string }> {
    const gymOwnerRole = await prisma.rolemaster.findFirst({ where: { rolename: 'GYM_OWNER' } });
    if (!gymOwnerRole) throw new NotFoundException('GYM_OWNER role not found');

    const user = await prisma.user.findUnique({
      where: { id },
      include: { ownedGym: true },
    });

    if (!user) throw new NotFoundException('Gym owner not found');
    if (user.roleId !== gymOwnerRole.Id) throw new NotFoundException('User is not a gym owner');

    // Generate a temporary password
    const temporaryPassword = generateTempPassword(12);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Update both User table (hashed) and Gym table (plain for hint)
    await prisma.$transaction(async (tx) => {
      // Update hashed password in User table for authentication
      await tx.user.update({
        where: { id },
        data: { password: hashedPassword },
      });

      // If user has a gym, update plain text password in Gym table for password hint display
      if (user.ownedGym) {
        await tx.gym.update({
          where: { id: user.ownedGym.id },
          data: { ownerPassword: temporaryPassword },
        });
      }

      // Log password reset in PasswordResetHistory
      await tx.passwordResetHistory.create({
        data: {
          userId: user.id,
          email: user.email,
          roleId: user.roleId || undefined,
          roleName: 'GYM_OWNER',
          resetBy: user.id,
          resetByEmail: user.email,
          resetMethod: 'ADMIN_RESET',
          targetTable: 'USER',
          gymId: user.ownedGym?.id || undefined,
        },
      });
    });

    return {
      ownerId: user.id,
      email: user.email,
      temporaryPassword,
      message: 'Password has been reset. Please share this temporary password securely with the gym owner. They should change it on their next login.',
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

  // Occupation Master CRUD
  async getOccupations(): Promise<Occupation[]> {
    const occupations = await prisma.occupationMaster.findMany({
      orderBy: { occupationName: 'asc' },
    });

    return occupations;
  }

  async getOccupationById(id: string): Promise<Occupation> {
    const occupation = await prisma.occupationMaster.findUnique({ where: { id } });
    if (!occupation) throw new NotFoundException('Occupation not found');
    return occupation;
  }

  async createOccupation(data: CreateOccupationRequest, createdBy?: string): Promise<Occupation> {
    // Check if occupation with same name exists
    const existingOccupation = await prisma.occupationMaster.findUnique({
      where: { occupationName: data.occupationName },
    });
    if (existingOccupation) {
      throw new ConflictException('Occupation with this name already exists');
    }

    const occupation = await prisma.occupationMaster.create({
      data: {
        occupationName: data.occupationName,
        description: data.description,
        createdBy: createdBy,
      },
    });

    return occupation;
  }

  async updateOccupation(id: string, data: UpdateOccupationRequest): Promise<Occupation> {
    await this.getOccupationById(id);

    // Check for duplicate name if updating occupationName
    if (data.occupationName) {
      const existingOccupation = await prisma.occupationMaster.findFirst({
        where: {
          occupationName: data.occupationName,
          NOT: { id },
        },
      });
      if (existingOccupation) {
        throw new ConflictException('Occupation with this name already exists');
      }
    }

    const updateData: any = {};
    if (data.occupationName) updateData.occupationName = data.occupationName;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const occupation = await prisma.occupationMaster.update({
      where: { id },
      data: updateData,
    });

    return occupation;
  }

  async getOccupationUsage(id: string): Promise<{ usageCount: number; canDelete: boolean }> {
    // Check if occupation exists
    const occupation = await this.getOccupationById(id);

    // Check if occupation name is used in any member records
    const usageCount = await prisma.member.count({
      where: { occupation: occupation.occupationName },
    });

    return {
      usageCount,
      canDelete: usageCount === 0,
    };
  }

  async deleteOccupation(id: string): Promise<Occupation> {
    // Check if occupation exists
    const occupation = await this.getOccupationById(id);

    // Check if occupation name is used in any member records
    const usageCount = await prisma.member.count({
      where: { occupation: occupation.occupationName },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete this occupation. It is currently used by ${usageCount} member(s). Please update those members first.`
      );
    }

    // Soft delete - set isActive to false
    const updatedOccupation = await prisma.occupationMaster.update({
      where: { id },
      data: { isActive: false },
    });

    return updatedOccupation;
  }

  // Plan Category Master CRUD
  async getPlanCategories(): Promise<PlanCategory[]> {
    const categories = await prisma.planCategoryMaster.findMany({
      orderBy: { categoryName: 'asc' },
    });
    return categories;
  }

  async getPlanCategoryById(id: string): Promise<PlanCategory> {
    const category = await prisma.planCategoryMaster.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Plan category not found');
    }
    return category;
  }

  async createPlanCategory(data: CreatePlanCategoryRequest, createdBy?: string): Promise<PlanCategory> {
    const existing = await prisma.planCategoryMaster.findUnique({
      where: { categoryName: data.categoryName },
    });
    if (existing) {
      throw new ConflictException('Plan category with this name already exists');
    }
    const category = await prisma.planCategoryMaster.create({
      data: {
        categoryName: data.categoryName,
        description: data.description,
        createdBy: createdBy,
      },
    });
    return category;
  }

  async updatePlanCategory(id: string, data: UpdatePlanCategoryRequest): Promise<PlanCategory> {
    await this.getPlanCategoryById(id);
    if (data.categoryName) {
      const existing = await prisma.planCategoryMaster.findFirst({
        where: { categoryName: data.categoryName, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Plan category with this name already exists');
      }
    }
    const updateData: any = {};
    if (data.categoryName) updateData.categoryName = data.categoryName;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    const category = await prisma.planCategoryMaster.update({
      where: { id },
      data: updateData,
    });
    return category;
  }

  async getPlanCategoryUsage(id: string): Promise<{ usageCount: number; canDelete: boolean }> {
    const category = await this.getPlanCategoryById(id);
    // Check if category name is used in any subscription plan names
    const usageCount = await prisma.gymSubscriptionPlan.count({
      where: { name: { contains: category.categoryName, mode: 'insensitive' } },
    });
    return { usageCount, canDelete: usageCount === 0 };
  }

  async deletePlanCategory(id: string): Promise<PlanCategory> {
    const category = await this.getPlanCategoryById(id);
    const usageCount = await prisma.gymSubscriptionPlan.count({
      where: { name: { contains: category.categoryName, mode: 'insensitive' } },
    });
    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete this plan category. It is currently used by ${usageCount} subscription plan(s). Please update those plans first.`
      );
    }
    const updatedCategory = await prisma.planCategoryMaster.update({
      where: { id },
      data: { isActive: false },
    });
    return updatedCategory;
  }

  // Enquiry Type Master CRUD
  async getEnquiryTypes(): Promise<EnquiryType[]> {
    const enquiryTypes = await prisma.enquiryTypeMaster.findMany({
      orderBy: { name: 'asc' },
    });

    return enquiryTypes;
  }

  async getEnquiryTypeById(id: string): Promise<EnquiryType> {
    const enquiryType = await prisma.enquiryTypeMaster.findUnique({ where: { id } });
    if (!enquiryType) throw new NotFoundException('Enquiry type not found');
    return enquiryType;
  }

  async createEnquiryType(data: CreateEnquiryTypeRequest, createdBy?: string): Promise<EnquiryType> {
    // Check if enquiry type with same name exists
    const existingEnquiryType = await prisma.enquiryTypeMaster.findUnique({
      where: { name: data.name },
    });
    if (existingEnquiryType) {
      throw new ConflictException('Enquiry type with this name already exists');
    }

    const enquiryType = await prisma.enquiryTypeMaster.create({
      data: {
        name: data.name,
        createdBy: createdBy,
      },
    });

    return enquiryType;
  }

  async updateEnquiryType(id: string, data: UpdateEnquiryTypeRequest): Promise<EnquiryType> {
    await this.getEnquiryTypeById(id);

    // Check for duplicate name if updating name
    if (data.name) {
      const existingEnquiryType = await prisma.enquiryTypeMaster.findFirst({
        where: {
          name: data.name,
          NOT: { id },
        },
      });
      if (existingEnquiryType) {
        throw new ConflictException('Enquiry type with this name already exists');
      }
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const enquiryType = await prisma.enquiryTypeMaster.update({
      where: { id },
      data: updateData,
    });

    return enquiryType;
  }

  async getEnquiryTypeUsage(id: string): Promise<{ usageCount: number; canDelete: boolean }> {
    // Check if enquiry type exists
    await this.getEnquiryTypeById(id);

    // Check if enquiry type is used in any gym inquiries
    const usageCount = await prisma.gymInquiry.count({
      where: { enquiryTypeId: id },
    });

    return {
      usageCount,
      canDelete: usageCount === 0,
    };
  }

  async deleteEnquiryType(id: string): Promise<EnquiryType> {
    // Check if enquiry type exists
    await this.getEnquiryTypeById(id);

    // Check if enquiry type is used in any gym inquiries
    const usageCount = await prisma.gymInquiry.count({
      where: { enquiryTypeId: id },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete this enquiry type. It is currently used in ${usageCount} gym inquiry record(s). Please reassign or remove those inquiries first.`
      );
    }

    // Soft delete - set isActive to false
    const enquiryType = await prisma.enquiryTypeMaster.update({
      where: { id },
      data: { isActive: false },
    });

    return enquiryType;
  }

  // Payment Type Master CRUD
  async getPaymentTypes(): Promise<PaymentType[]> {
    const paymentTypes = await prisma.paymentTypeMaster.findMany({
      orderBy: { paymentTypeName: 'asc' },
    });

    return paymentTypes;
  }

  async getPaymentTypeById(id: string): Promise<PaymentType> {
    const paymentType = await prisma.paymentTypeMaster.findUnique({ where: { id } });
    if (!paymentType) throw new NotFoundException('Payment type not found');
    return paymentType;
  }

  async createPaymentType(data: CreatePaymentTypeRequest, createdBy?: string): Promise<PaymentType> {
    // Check if payment type with same name exists
    const existingPaymentType = await prisma.paymentTypeMaster.findUnique({
      where: { paymentTypeName: data.paymentTypeName },
    });
    if (existingPaymentType) {
      throw new ConflictException('Payment type with this name already exists');
    }

    const paymentType = await prisma.paymentTypeMaster.create({
      data: {
        paymentTypeName: data.paymentTypeName,
        description: data.description,
        createdBy: createdBy,
      },
    });

    return paymentType;
  }

  async updatePaymentType(id: string, data: UpdatePaymentTypeRequest): Promise<PaymentType> {
    await this.getPaymentTypeById(id);

    // Check for duplicate name if updating paymentTypeName
    if (data.paymentTypeName) {
      const existingPaymentType = await prisma.paymentTypeMaster.findFirst({
        where: {
          paymentTypeName: data.paymentTypeName,
          NOT: { id },
        },
      });
      if (existingPaymentType) {
        throw new ConflictException('Payment type with this name already exists');
      }
    }

    const updateData: any = {};
    if (data.paymentTypeName) updateData.paymentTypeName = data.paymentTypeName;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const paymentType = await prisma.paymentTypeMaster.update({
      where: { id },
      data: updateData,
    });

    return paymentType;
  }

  async getPaymentTypeUsage(id: string): Promise<{ usageCount: number; canDelete: boolean; details: { subscriptions: number; settlements: number; expenses: number } }> {
    // Check if payment type exists
    const paymentType = await this.getPaymentTypeById(id);

    // Check usage across different tables that use payment type name
    const [subscriptionCount, settlementCount, expenseCount] = await Promise.all([
      // Check gym subscription history
      prisma.gymSubscriptionHistory.count({
        where: { paymentMode: paymentType.paymentTypeName },
      }),
      // Check trainer salary settlements (uses PaymentMode enum, but we check string match)
      prisma.trainerSalarySettlement.count({
        where: { paymentMode: paymentType.paymentTypeName as any },
      }),
      // Check expense master
      prisma.expenseMaster.count({
        where: { paymentMode: paymentType.paymentTypeName as any },
      }),
    ]);

    const usageCount = subscriptionCount + settlementCount + expenseCount;

    return {
      usageCount,
      canDelete: usageCount === 0,
      details: {
        subscriptions: subscriptionCount,
        settlements: settlementCount,
        expenses: expenseCount,
      },
    };
  }

  async deletePaymentType(id: string): Promise<PaymentType> {
    // Check if payment type exists
    const paymentType = await this.getPaymentTypeById(id);

    // Check usage
    const usage = await this.getPaymentTypeUsage(id);

    if (!usage.canDelete) {
      const usageDetails: string[] = [];
      if (usage.details.subscriptions > 0) usageDetails.push(`${usage.details.subscriptions} subscription(s)`);
      if (usage.details.settlements > 0) usageDetails.push(`${usage.details.settlements} salary settlement(s)`);
      if (usage.details.expenses > 0) usageDetails.push(`${usage.details.expenses} expense(s)`);

      throw new ConflictException(
        `Cannot delete this payment type. It is currently used in ${usageDetails.join(', ')}. Please update those records first.`
      );
    }

    // Soft delete - set isActive to false
    const updatedPaymentType = await prisma.paymentTypeMaster.update({
      where: { id },
      data: { isActive: false },
    });

    return updatedPaymentType;
  }

  // =============================================
  // Gym Subscription History
  // =============================================

  private async generateSubscriptionNumber(tx: any): Promise<string> {
    const lastRecord = await tx.gymSubscriptionHistory.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { subscriptionNumber: true },
    });

    let nextNumber = 1;
    if (lastRecord?.subscriptionNumber) {
      const match = lastRecord.subscriptionNumber.match(/GSUB-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    return `GSUB-${String(nextNumber).padStart(5, '0')}`;
  }

  async renewGymSubscription(gymId: string, data: RenewGymSubscriptionRequest, adminUserId?: string) {
    // Fetch gym with current plan
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      include: { subscriptionPlan: true },
    });
    if (!gym) throw new NotFoundException('Gym not found');

    // Fetch new plan
    const newPlan = await prisma.gymSubscriptionPlan.findUnique({
      where: { id: data.subscriptionPlanId },
    });
    if (!newPlan) throw new NotFoundException('Subscription plan not found');
    if (!newPlan.isActive) throw new ConflictException('Subscription plan is not active');

    // Determine renewal type
    let renewalType: 'NEW' | 'RENEWAL' | 'UPGRADE' | 'DOWNGRADE' = 'NEW';
    if (gym.subscriptionPlanId && gym.subscriptionPlan) {
      const oldPrice = Number(gym.subscriptionPlan.price);
      const newPrice = Number(newPlan.price);
      if (gym.subscriptionPlanId === data.subscriptionPlanId) {
        renewalType = 'RENEWAL';
      } else if (newPrice > oldPrice) {
        renewalType = 'UPGRADE';
      } else if (newPrice < oldPrice) {
        renewalType = 'DOWNGRADE';
      } else {
        renewalType = 'RENEWAL';
      }
    }

    // Calculate dates
    const subscriptionStart = data.subscriptionStart ? new Date(data.subscriptionStart) : new Date();
    const subscriptionEnd = new Date(subscriptionStart);
    subscriptionEnd.setDate(subscriptionEnd.getDate() + newPlan.durationDays);

    // Calculate payment with extra discount
    const planPrice = Number(newPlan.price);
    const extraDiscount = data.extraDiscount || 0;
    if (extraDiscount < 0 || extraDiscount > planPrice) {
      throw new ConflictException('Extra discount must be between 0 and the plan price');
    }
    const amount = planPrice - extraDiscount;
    const paidAmount = data.paidAmount || 0;
    const pendingAmount = Math.max(0, amount - paidAmount);
    let paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL' = 'PENDING';
    if (paidAmount >= amount && amount > 0) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIAL';
    } else if (amount === 0) {
      paymentStatus = 'PAID';
    }

    // Transaction
    const historyRecord = await prisma.$transaction(async (tx) => {
      // Backfill: if no history records exist for this gym (gym created before history feature),
      // create an initial "NEW" record for the original subscription
      const existingHistoryCount = await tx.gymSubscriptionHistory.count({ where: { gymId } });
      if (existingHistoryCount === 0 && gym.subscriptionPlanId && gym.subscriptionPlan && gym.subscriptionStart && gym.subscriptionEnd) {
        const initialSubNumber = await this.generateSubscriptionNumber(tx);
        const initialPlanPrice = Number(gym.subscriptionPlan.price);
        await tx.gymSubscriptionHistory.create({
          data: {
            subscriptionNumber: initialSubNumber,
            gymId,
            subscriptionPlanId: gym.subscriptionPlanId,
            subscriptionStart: gym.subscriptionStart,
            subscriptionEnd: gym.subscriptionEnd,
            renewalDate: gym.subscriptionStart,
            renewalType: 'NEW',
            planAmount: initialPlanPrice,
            extraDiscount: 0,
            amount: initialPlanPrice,
            paymentStatus: 'PAID',
            paidAmount: initialPlanPrice,
            pendingAmount: 0,
            isActive: true,
          },
        });
      }

      // Deactivate all previous active history records
      await tx.gymSubscriptionHistory.updateMany({
        where: { gymId, isActive: true },
        data: { isActive: false },
      });

      // Generate subscription number
      const subscriptionNumber = await this.generateSubscriptionNumber(tx);

      // Create new history record
      const record = await tx.gymSubscriptionHistory.create({
        data: {
          subscriptionNumber,
          gymId,
          subscriptionPlanId: data.subscriptionPlanId,
          subscriptionStart,
          subscriptionEnd,
          renewalType,
          planAmount: planPrice,
          extraDiscount,
          amount,
          paymentMode: data.paymentMode,
          paymentStatus,
          paidAmount,
          pendingAmount,
          isActive: true,
          notes: data.notes,
          previousPlanId: gym.subscriptionPlanId,
          previousPlanName: gym.subscriptionPlan?.name,
          previousSubscriptionEnd: gym.subscriptionEnd,
          createdBy: adminUserId,
        },
        include: {
          subscriptionPlan: { select: { name: true, price: true, durationDays: true } },
        },
      });

      // Update gym table
      await tx.gym.update({
        where: { id: gymId },
        data: {
          subscriptionPlanId: data.subscriptionPlanId,
          subscriptionStart,
          subscriptionEnd,
        },
      });

      return record;
    });

    return historyRecord;
  }

  async getGymSubscriptionHistory(gymId: string, params: GymSubscriptionHistoryParams) {
    const { page = 1, limit = 10, search, sortBy = 'renewalDate', sortOrder = 'desc', paymentStatus, renewalType } = params;
    const skip = (page - 1) * limit;

    // Verify gym exists
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      include: { subscriptionPlan: true },
    });
    if (!gym) throw new NotFoundException('Gym not found');

    // Backfill: if history records exist but no "NEW" record, create initial record from earliest renewal's previous plan data
    const hasNewRecord = await prisma.gymSubscriptionHistory.findFirst({
      where: { gymId, renewalType: 'NEW' },
    });

    if (!hasNewRecord) {
      // Find the earliest record which should have previousPlan data
      const earliestRecord = await prisma.gymSubscriptionHistory.findFirst({
        where: { gymId },
        orderBy: { renewalDate: 'asc' },
      });

      if (earliestRecord && earliestRecord.previousPlanId) {
        // Reconstruct the initial subscription from the earliest renewal's previous plan info
        const previousPlan = await prisma.gymSubscriptionPlan.findUnique({
          where: { id: earliestRecord.previousPlanId },
        });

        if (previousPlan) {
          const initialPlanPrice = Number(previousPlan.price);
          const initialStart = earliestRecord.previousSubscriptionEnd
            ? new Date(new Date(earliestRecord.previousSubscriptionEnd).getTime() - previousPlan.durationDays * 24 * 60 * 60 * 1000)
            : new Date(earliestRecord.createdAt.getTime() - previousPlan.durationDays * 24 * 60 * 60 * 1000);
          const initialEnd = earliestRecord.previousSubscriptionEnd || earliestRecord.subscriptionStart;

          const subscriptionNumber = await this.generateSubscriptionNumber(prisma as any);
          await prisma.gymSubscriptionHistory.create({
            data: {
              subscriptionNumber,
              gymId,
              subscriptionPlanId: earliestRecord.previousPlanId,
              subscriptionStart: initialStart,
              subscriptionEnd: initialEnd,
              renewalDate: initialStart,
              renewalType: 'NEW',
              planAmount: initialPlanPrice,
              extraDiscount: 0,
              amount: initialPlanPrice,
              paymentStatus: 'PAID',
              paidAmount: initialPlanPrice,
              pendingAmount: 0,
              isActive: false,
            },
          });
        }
      }
    }

    const where: any = { gymId };
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (renewalType) where.renewalType = renewalType;
    if (search) {
      where.OR = [
        { subscriptionNumber: { contains: search, mode: 'insensitive' } },
        { subscriptionPlan: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [history, total] = await Promise.all([
      prisma.gymSubscriptionHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          subscriptionPlan: { select: { name: true, price: true, durationDays: true } },
        },
      }),
      prisma.gymSubscriptionHistory.count({ where }),
    ]);

    return { history, total };
  }

  async getGymSubscriptionHistoryById(id: string) {
    const record = await prisma.gymSubscriptionHistory.findUnique({
      where: { id },
      include: {
        subscriptionPlan: { select: { name: true, price: true, durationDays: true } },
        gym: { select: { name: true } },
      },
    });
    if (!record) throw new NotFoundException('Subscription history record not found');
    return record;
  }

  // =============================================
  // Gym Inquiry
  // =============================================

  async getGymInquiries(params: GymInquiryParams) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', subscriptionPlanId, isActive } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { gymName: { contains: search, mode: 'insensitive' } },
        { mobileNo: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { sellerName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (subscriptionPlanId) where.subscriptionPlanId = subscriptionPlanId;
    if (isActive !== undefined) where.isActive = isActive;

    const [inquiries, total] = await Promise.all([
      prisma.gymInquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          subscriptionPlan: { select: { id: true, name: true, price: true, durationDays: true } },
          enquiryType: { select: { id: true, name: true } },
          _count: { select: { followups: true } },
        },
      }),
      prisma.gymInquiry.count({ where }),
    ]);

    return { inquiries, total };
  }

  async getGymInquiryById(id: string) {
    const inquiry = await prisma.gymInquiry.findUnique({
      where: { id },
      include: {
        subscriptionPlan: { select: { id: true, name: true, price: true, durationDays: true } },
        enquiryType: { select: { id: true, name: true } },
        followups: { orderBy: { followupDate: 'desc' } },
        _count: { select: { followups: true } },
      },
    });
    if (!inquiry) throw new NotFoundException('Gym inquiry not found');
    return inquiry;
  }

  async createGymInquiry(data: CreateGymInquiryRequest, createdBy?: string) {
    // Verify subscription plan exists
    const plan = await prisma.gymSubscriptionPlan.findUnique({ where: { id: data.subscriptionPlanId } });
    if (!plan) throw new NotFoundException('Subscription plan not found');

    // Verify enquiry type exists
    const enquiryType = await prisma.enquiryTypeMaster.findUnique({ where: { id: data.enquiryTypeId } });
    if (!enquiryType) throw new NotFoundException('Enquiry type not found');

    const inquiry = await prisma.gymInquiry.create({
      data: {
        gymName: data.gymName,
        address1: data.address1,
        address2: data.address2,
        state: data.state,
        city: data.city,
        mobileNo: data.mobileNo,
        email: data.email || null,
        subscriptionPlanId: data.subscriptionPlanId,
        note: data.note,
        sellerName: data.sellerName,
        sellerMobileNo: data.sellerMobileNo || null,
        nextFollowupDate: data.nextFollowupDate ? new Date(data.nextFollowupDate) : null,
        memberSize: data.memberSize || null,
        enquiryTypeId: data.enquiryTypeId,
        createdBy,
      },
      include: {
        subscriptionPlan: { select: { id: true, name: true, price: true, durationDays: true } },
        enquiryType: { select: { id: true, name: true } },
        _count: { select: { followups: true } },
      },
    });

    return inquiry;
  }

  async updateGymInquiry(id: string, data: UpdateGymInquiryRequest, updatedBy?: string) {
    const existing = await prisma.gymInquiry.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Gym inquiry not found');

    // Verify plan if changing
    if (data.subscriptionPlanId) {
      const plan = await prisma.gymSubscriptionPlan.findUnique({ where: { id: data.subscriptionPlanId } });
      if (!plan) throw new NotFoundException('Subscription plan not found');
    }

    // Verify enquiry type if changing
    if (data.enquiryTypeId) {
      const enquiryType = await prisma.enquiryTypeMaster.findUnique({ where: { id: data.enquiryTypeId } });
      if (!enquiryType) throw new NotFoundException('Enquiry type not found');
    }

    const updateData: any = { updatedBy };
    if (data.gymName !== undefined) updateData.gymName = data.gymName;
    if (data.address1 !== undefined) updateData.address1 = data.address1;
    if (data.address2 !== undefined) updateData.address2 = data.address2;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.mobileNo !== undefined) updateData.mobileNo = data.mobileNo;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.subscriptionPlanId !== undefined) updateData.subscriptionPlanId = data.subscriptionPlanId;
    if (data.note !== undefined) updateData.note = data.note;
    if (data.sellerName !== undefined) updateData.sellerName = data.sellerName;
    if (data.sellerMobileNo !== undefined) updateData.sellerMobileNo = data.sellerMobileNo || null;
    if (data.nextFollowupDate !== undefined) updateData.nextFollowupDate = data.nextFollowupDate ? new Date(data.nextFollowupDate) : null;
    if (data.memberSize !== undefined) updateData.memberSize = data.memberSize || null;
    if (data.enquiryTypeId !== undefined) updateData.enquiryTypeId = data.enquiryTypeId;

    const inquiry = await prisma.gymInquiry.update({
      where: { id },
      data: updateData,
      include: {
        subscriptionPlan: { select: { id: true, name: true, price: true, durationDays: true } },
        enquiryType: { select: { id: true, name: true } },
        _count: { select: { followups: true } },
      },
    });

    return inquiry;
  }

  async toggleGymInquiryStatus(id: string) {
    const existing = await prisma.gymInquiry.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Gym inquiry not found');

    const inquiry = await prisma.gymInquiry.update({
      where: { id },
      data: { isActive: !existing.isActive },
      include: {
        subscriptionPlan: { select: { id: true, name: true, price: true, durationDays: true } },
        enquiryType: { select: { id: true, name: true } },
        _count: { select: { followups: true } },
      },
    });

    return inquiry;
  }

  async getGymInquiryFollowups(inquiryId: string) {
    const inquiry = await prisma.gymInquiry.findUnique({ where: { id: inquiryId } });
    if (!inquiry) throw new NotFoundException('Gym inquiry not found');

    const followups = await prisma.gymInquiryFollowup.findMany({
      where: { gymInquiryId: inquiryId },
      orderBy: { followupDate: 'desc' },
    });

    return followups;
  }

  async createGymInquiryFollowup(inquiryId: string, data: CreateGymInquiryFollowupRequest, createdBy?: string) {
    const inquiry = await prisma.gymInquiry.findUnique({ where: { id: inquiryId } });
    if (!inquiry) throw new NotFoundException('Gym inquiry not found');

    const followupDate = data.followupDate ? new Date(data.followupDate) : new Date();

    const followup = await prisma.gymInquiryFollowup.create({
      data: {
        gymInquiryId: inquiryId,
        followupDate,
        note: data.note,
        createdBy,
      },
    });

    // Update nextFollowupDate on the inquiry
    if (data.followupDate) {
      await prisma.gymInquiry.update({
        where: { id: inquiryId },
        data: { nextFollowupDate: new Date(data.followupDate) },
      });
    }

    return followup;
  }

  // =============================================
  // Admin Members List by Gym/GymOwner
  // =============================================

  async getMembersByGymOrOwner(params: AdminMembersParams): Promise<{ members: AdminMemberDetails[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      gymId,
      gymOwnerId,
      membershipStatus,
      memberType,
      isActive,
    } = params;
    const skip = (page - 1) * limit;

    // Determine gymId from gymOwnerId if provided
    let targetGymId = gymId;
    if (!gymId && gymOwnerId) {
      const gym = await prisma.gym.findFirst({
        where: { ownerId: gymOwnerId },
        select: { id: true },
      });
      if (!gym) {
        throw new NotFoundException('No gym found for this gym owner');
      }
      targetGymId = gym.id;
    }

    if (!targetGymId) {
      throw new NotFoundException('Either gymId or gymOwnerId is required');
    }

    // Verify gym exists
    const gym = await prisma.gym.findUnique({
      where: { id: targetGymId },
      select: { id: true, name: true, email: true, mobileNo: true, ownerPassword: true },
    });
    if (!gym) throw new NotFoundException('Gym not found');

    // Build where clause
    const where: any = {
      gymId: targetGymId,
      ...(search && {
        OR: [
          { user: { name: { contains: search, mode: 'insensitive' as const } } },
          { user: { email: { contains: search, mode: 'insensitive' as const } } },
          { phone: { contains: search, mode: 'insensitive' as const } },
          { memberId: { contains: search, mode: 'insensitive' as const } },
          { address: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(membershipStatus && { membershipStatus }),
      ...(memberType && { memberType }),
      ...(isActive !== undefined && { isActive }),
    };

    // Dynamic orderBy
    let orderBy: any;
    if (sortBy === 'name' || sortBy === 'email') {
      orderBy = { user: { [sortBy]: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    // Fetch members with all related data
    const [memberRecords, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
            },
          },
          gym: {
            select: {
              id: true,
              name: true,
              email: true,
              mobileNo: true,
              ownerPassword: true,
            },
          },
          trainerAssignments: {
            where: { isActive: true },
            include: {
              trainer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  specialization: true,
                },
              },
            },
            take: 1,
          },
          ptMember: {
            include: {
              trainer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  specialization: true,
                },
              },
            },
          },
          balancePayments: {
            where: { isActive: true },
            orderBy: { paymentDate: 'desc' },
            select: {
              id: true,
              paidFees: true,
              paymentDate: true,
              paymentFor: true,
            },
          },
          assignedDiets: {
            where: { isActive: true },
            orderBy: { startDate: 'desc' },
            take: 1,
            include: {
              dietTemplate: {
                select: {
                  id: true,
                  name: true,
                },
              },
              meals: {
                orderBy: { mealNo: 'asc' },
                select: {
                  mealNo: true,
                  title: true,
                  description: true,
                  time: true,
                },
              },
            },
          },
        },
      }),
      prisma.member.count({ where }),
    ]);

    // Fetch course package names for members that have coursePackageId
    const coursePackageIds = memberRecords
      .map((m) => m.coursePackageId)
      .filter((id): id is string => id !== null);

    const coursePackages = coursePackageIds.length > 0
      ? await prisma.coursePackage.findMany({
          where: { id: { in: coursePackageIds } },
          select: { id: true, packageName: true },
        })
      : [];

    const coursePackageMap = new Map(coursePackages.map((p) => [p.id, p.packageName]));

    // Transform members to response format
    const members: AdminMemberDetails[] = memberRecords.map((member) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(member.membershipEnd);
      endDate.setHours(0, 0, 0, 0);
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate payment summary
      const regularPayments = member.balancePayments
        .filter((p) => p.paymentFor === 'REGULAR')
        .reduce((sum, p) => sum + Number(p.paidFees || 0), 0);
      const ptPayments = member.balancePayments
        .filter((p) => p.paymentFor === 'PT')
        .reduce((sum, p) => sum + Number(p.paidFees || 0), 0);

      const regularTotal = Number(member.finalFees || 0);
      const ptTotal = member.hasPTAddon ? Number(member.ptFinalFees || 0) : 0;
      const totalAmount = regularTotal + ptTotal;
      const totalPaid = regularPayments + ptPayments;
      const totalPending = Math.max(0, totalAmount - totalPaid);

      let paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING';
      if (totalPaid >= totalAmount && totalAmount > 0) {
        paymentStatus = 'PAID';
      } else if (totalPaid > 0) {
        paymentStatus = 'PARTIAL';
      }

      const lastPayment = member.balancePayments[0];

      // Get active trainer (from PT member or trainer assignment)
      const activeTrainer = member.ptMember?.trainer || member.trainerAssignments[0]?.trainer || null;

      // Get active diet plan
      const activeDiet = member.assignedDiets[0];

      // Get course package name from map
      const coursePackageName = member.coursePackageId
        ? coursePackageMap.get(member.coursePackageId) || null
        : null;

      return {
        id: member.id,
        memberId: member.memberId,
        name: member.user.name,
        email: member.user.email,
        phone: member.phone,
        altContactNo: member.altContactNo,
        dateOfBirth: member.dateOfBirth,
        gender: member.gender,
        bloodGroup: member.bloodGroup,
        address: member.address,
        occupation: member.occupation,
        memberPhoto: member.memberPhoto,
        memberType: member.memberType,
        isActive: member.isActive,

        user: {
          id: member.user.id,
          email: member.user.email,
          name: member.user.name,
          passwordHint: maskPassword(member.gym.ownerPassword),
          isActive: member.user.isActive,
        },

        gym: {
          id: member.gym.id,
          name: member.gym.name,
          email: member.gym.email,
          mobileNo: member.gym.mobileNo,
        },

        subscription: {
          membershipStart: member.membershipStart,
          membershipEnd: member.membershipEnd,
          membershipStatus: member.membershipStatus,
          daysRemaining,
        },

        package: {
          coursePackageId: member.coursePackageId,
          coursePackageName,
          packageFees: Number(member.packageFees || 0),
          maxDiscount: Number(member.maxDiscount || 0),
          afterDiscount: Number(member.afterDiscount || 0),
          extraDiscount: Number(member.extraDiscount || 0),
          finalFees: Number(member.finalFees || 0),
        },

        ptAddon: member.hasPTAddon
          ? {
              hasPTAddon: true,
              ptPackageName: member.ptPackageName,
              ptPackageFees: Number(member.ptPackageFees || 0),
              ptMaxDiscount: Number(member.ptMaxDiscount || 0),
              ptAfterDiscount: Number(member.ptAfterDiscount || 0),
              ptExtraDiscount: Number(member.ptExtraDiscount || 0),
              ptFinalFees: Number(member.ptFinalFees || 0),
            }
          : null,

        payment: {
          totalAmount,
          totalPaid,
          totalPending,
          paymentStatus,
          lastPaymentDate: lastPayment?.paymentDate || null,
        },

        trainer: activeTrainer
          ? {
              id: activeTrainer.id,
              name: activeTrainer.name,
              email: activeTrainer.email,
              phone: activeTrainer.phone,
              specialization: activeTrainer.specialization,
            }
          : null,

        ptDetails: member.ptMember
          ? {
              id: member.ptMember.id,
              packageName: member.ptMember.packageName,
              sessionsTotal: member.ptMember.sessionsTotal,
              sessionsUsed: member.ptMember.sessionsUsed,
              sessionsRemaining: member.ptMember.sessionsTotal - member.ptMember.sessionsUsed,
              startDate: member.ptMember.startDate,
              endDate: member.ptMember.endDate,
              goals: member.ptMember.goals,
            }
          : null,

        dietPlan: activeDiet
          ? {
              id: activeDiet.id,
              templateId: activeDiet.dietTemplateId,
              templateName: activeDiet.dietTemplate.name,
              startDate: activeDiet.startDate,
              endDate: activeDiet.endDate,
              meals: activeDiet.meals.map((m) => ({
                mealNo: m.mealNo,
                title: m.title,
                description: m.description,
                time: m.time,
              })),
            }
          : null,

        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      };
    });

    return { members, total };
  }

  // =============================================
  // Admin Expense Group Master CRUD
  // =============================================

  async getAdminExpenseGroups(): Promise<AdminExpenseGroup[]> {
    const expenseGroups = await prisma.adminExpenseGroupMaster.findMany({
      orderBy: { expenseGroupName: 'asc' },
    });
    return expenseGroups;
  }

  async getAdminExpenseGroupById(id: string): Promise<AdminExpenseGroup> {
    const expenseGroup = await prisma.adminExpenseGroupMaster.findUnique({
      where: { id },
    });
    if (!expenseGroup) throw new NotFoundException('Expense group not found');
    return expenseGroup;
  }

  async createAdminExpenseGroup(data: CreateAdminExpenseGroupRequest): Promise<AdminExpenseGroup> {
    // Check if expense group with same name exists
    const existing = await prisma.adminExpenseGroupMaster.findFirst({
      where: { expenseGroupName: data.expenseGroupName },
    });
    if (existing) {
      throw new ConflictException('Expense group with this name already exists');
    }

    const expenseGroup = await prisma.adminExpenseGroupMaster.create({
      data: {
        expenseGroupName: data.expenseGroupName,
      },
    });
    return expenseGroup;
  }

  async updateAdminExpenseGroup(id: string, data: UpdateAdminExpenseGroupRequest): Promise<AdminExpenseGroup> {
    await this.getAdminExpenseGroupById(id);

    // Check for duplicate name
    if (data.expenseGroupName) {
      const existing = await prisma.adminExpenseGroupMaster.findFirst({
        where: {
          expenseGroupName: data.expenseGroupName,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('Expense group with this name already exists');
      }
    }

    const expenseGroup = await prisma.adminExpenseGroupMaster.update({
      where: { id },
      data: {
        expenseGroupName: data.expenseGroupName,
      },
    });
    return expenseGroup;
  }

  async deleteAdminExpenseGroup(id: string): Promise<void> {
    await this.getAdminExpenseGroupById(id);

    // Check if expense group has active expenses
    const expenseCount = await prisma.adminExpenseMaster.count({
      where: { expenseGroupId: id, isActive: true },
    });

    if (expenseCount > 0) {
      throw new BadRequestException(
        `Cannot delete expense group. It has ${expenseCount} active expense(s) associated with it.`
      );
    }

    await prisma.adminExpenseGroupMaster.delete({
      where: { id },
    });
  }

  // =============================================
  // Admin Expense Management CRUD
  // =============================================

  async createAdminExpense(
    userId: string,
    data: CreateAdminExpenseRequest,
    attachmentPaths?: string[]
  ): Promise<AdminExpense> {
    // Verify expense group exists
    const expenseGroup = await prisma.adminExpenseGroupMaster.findUnique({
      where: { id: data.expenseGroupId },
    });
    if (!expenseGroup) {
      throw new NotFoundException('Expense group not found');
    }

    const expense = await prisma.adminExpenseMaster.create({
      data: {
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
        name: data.name,
        expenseGroupId: data.expenseGroupId,
        description: data.description,
        paymentMode: data.paymentMode,
        amount: data.amount,
        attachments: attachmentPaths || [],
        createdBy: userId,
      },
      include: {
        expenseGroup: true,
      },
    });

    return {
      id: expense.id,
      expenseDate: expense.expenseDate,
      name: expense.name,
      expenseGroupId: expense.expenseGroupId,
      expenseGroupName: expense.expenseGroup.expenseGroupName,
      description: expense.description || undefined,
      paymentMode: expense.paymentMode as AdminPaymentMode,
      amount: Number(expense.amount),
      attachments: expense.attachments || undefined,
      createdBy: expense.createdBy,
      isActive: expense.isActive,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  async updateAdminExpense(
    expenseId: string,
    data: UpdateAdminExpenseRequest,
    newAttachmentPaths?: string[]
  ): Promise<AdminExpense> {
    const existing = await prisma.adminExpenseMaster.findUnique({
      where: { id: expenseId },
    });
    if (!existing) {
      throw new NotFoundException('Expense not found');
    }

    // If updating expense group, verify it exists
    if (data.expenseGroupId) {
      const expenseGroup = await prisma.adminExpenseGroupMaster.findUnique({
        where: { id: data.expenseGroupId },
      });
      if (!expenseGroup) {
        throw new NotFoundException('Expense group not found');
      }
    }

    // Handle attachments update
    let finalAttachments: string[] = [];

    const deleteAttachmentFile = (filePath: string | null | undefined): void => {
      if (filePath) {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
          } catch (error) {
            console.error('Error deleting expense attachment:', error);
          }
        }
      }
    };

    if (data.keepAttachments) {
      const keepAttachmentsArray = typeof data.keepAttachments === 'string'
        ? data.keepAttachments.split(',').filter(Boolean)
        : [];

      const attachmentsToDelete = existing.attachments.filter(
        (att: string) => !keepAttachmentsArray.includes(att)
      );
      attachmentsToDelete.forEach((att: string) => deleteAttachmentFile(att));
      finalAttachments = keepAttachmentsArray;
    } else if (newAttachmentPaths && newAttachmentPaths.length > 0) {
      existing.attachments.forEach((att: string) => deleteAttachmentFile(att));
      finalAttachments = [];
    } else {
      finalAttachments = existing.attachments;
    }

    if (newAttachmentPaths && newAttachmentPaths.length > 0) {
      finalAttachments = [...finalAttachments, ...newAttachmentPaths];
    }

    const expense = await prisma.adminExpenseMaster.update({
      where: { id: expenseId },
      data: {
        ...(data.expenseDate && { expenseDate: new Date(data.expenseDate) }),
        ...(data.name && { name: data.name }),
        ...(data.expenseGroupId && { expenseGroupId: data.expenseGroupId }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.paymentMode && { paymentMode: data.paymentMode }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        attachments: finalAttachments,
      },
      include: {
        expenseGroup: true,
      },
    });

    return {
      id: expense.id,
      expenseDate: expense.expenseDate,
      name: expense.name,
      expenseGroupId: expense.expenseGroupId,
      expenseGroupName: expense.expenseGroup.expenseGroupName,
      description: expense.description || undefined,
      paymentMode: expense.paymentMode as AdminPaymentMode,
      amount: Number(expense.amount),
      attachments: expense.attachments || undefined,
      createdBy: expense.createdBy,
      isActive: expense.isActive,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  async softDeleteAdminExpense(expenseId: string, deleteFiles: boolean = true): Promise<void> {
    const expense = await prisma.adminExpenseMaster.findUnique({
      where: { id: expenseId },
    });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (deleteFiles && expense.attachments && expense.attachments.length > 0) {
      expense.attachments.forEach((filePath: string) => {
        if (filePath) {
          const fullPath = path.join(process.cwd(), filePath);
          if (fs.existsSync(fullPath)) {
            try {
              fs.unlinkSync(fullPath);
            } catch (error) {
              console.error('Error deleting expense attachment:', error);
            }
          }
        }
      });
    }

    await prisma.adminExpenseMaster.update({
      where: { id: expenseId },
      data: { isActive: false },
    });
  }

  async getAdminExpenseById(expenseId: string): Promise<AdminExpense> {
    const expense = await prisma.adminExpenseMaster.findFirst({
      where: { id: expenseId },
      include: {
        expenseGroup: true,
      },
    });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return {
      id: expense.id,
      expenseDate: expense.expenseDate,
      name: expense.name,
      expenseGroupId: expense.expenseGroupId,
      expenseGroupName: expense.expenseGroup.expenseGroupName,
      description: expense.description || undefined,
      paymentMode: expense.paymentMode as AdminPaymentMode,
      amount: Number(expense.amount),
      attachments: expense.attachments || undefined,
      createdBy: expense.createdBy,
      isActive: expense.isActive,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  async getAdminExpenses(params: AdminExpenseListParams): Promise<AdminExpenseListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'expenseDate',
      sortOrder = 'desc',
      year,
      dateFrom,
      dateTo,
      expenseGroupId,
      paymentMode,
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { expenseGroup: { expenseGroupName: { contains: search, mode: 'insensitive' as const } } },
      ];
    }

    if (year) {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59);
      where.expenseDate = {
        gte: yearStart,
        lte: yearEnd,
      };
    }

    if (dateFrom || dateTo) {
      where.expenseDate = {};
      if (dateFrom) {
        const fromDateObj = new Date(dateFrom);
        fromDateObj.setHours(0, 0, 0, 0);
        where.expenseDate.gte = fromDateObj;
      }
      if (dateTo) {
        const toDateObj = new Date(dateTo);
        toDateObj.setHours(23, 59, 59, 999);
        where.expenseDate.lte = toDateObj;
      }
    }

    if (expenseGroupId) {
      where.expenseGroupId = expenseGroupId;
    }

    if (paymentMode) {
      where.paymentMode = paymentMode;
    }

    const [expenseRecords, total, totalAmountResult] = await Promise.all([
      prisma.adminExpenseMaster.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          expenseGroup: true,
        },
      }),
      prisma.adminExpenseMaster.count({ where }),
      prisma.adminExpenseMaster.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    const expenses: AdminExpense[] = expenseRecords.map((e) => ({
      id: e.id,
      expenseDate: e.expenseDate,
      name: e.name,
      expenseGroupId: e.expenseGroupId,
      expenseGroupName: e.expenseGroup.expenseGroupName,
      description: e.description || undefined,
      paymentMode: e.paymentMode as AdminPaymentMode,
      amount: Number(e.amount),
      attachments: e.attachments || undefined,
      createdBy: e.createdBy,
      isActive: e.isActive,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

    return {
      expenses,
      total,
      page,
      limit,
      totalAmount: Number(totalAmountResult._sum.amount || 0),
    };
  }

  // =============================================
  // Admin Dashboard V2 - Counts + Detail APIs
  // =============================================

  async getAdminDashboardCounts(): Promise<AdminDashboardCounts> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalActiveGyms,
      totalActiveGymInquiries,
      todaysFollowupGymInquiries,
      twoDaysLeftExpiredGyms,
      totalExpiredGyms,
      totalRenewalGyms,
      totalMembers,
      recentRegisteredGyms,
      totalIncomeResult,
      thisMonthsIncomeResult,
      totalExpenseResult,
      thisMonthsExpenseResult,
    ] = await Promise.all([
      // 1. Total Active Gyms
      prisma.gym.count({ where: { isActive: true, subscriptionEnd: { gte: now } } }),

      // 2. Total Active Gym Inquiries
      prisma.gymInquiry.count({ where: { isActive: true } }),

      // 3. Today's Followup Gym Inquiries
      prisma.gymInquiry.count({
        where: {
          isActive: true,
          nextFollowupDate: { gte: todayStart, lte: todayEnd },
        },
      }),

      // 4. Two Days Left Expired Total Gyms (expiring within next 2 days)
      prisma.gym.count({
        where: {
          isActive: true,
          subscriptionEnd: { gte: now, lte: twoDaysFromNow },
        },
      }),

      // 5. Total Expired Gyms
      prisma.gym.count({
        where: {
          subscriptionEnd: { lt: now },
        },
      }),

      // 6. Total Renewal Gyms (subscription history with renewal type RENEWAL)
      prisma.gymSubscriptionHistory.count({
        where: {
          renewalType: 'RENEWAL',
          isActive: true,
        },
      }),

      // 7. Total Members
      prisma.member.count(),

      // 9. Recent Registered New Gyms (Last 7 Days)
      prisma.gym.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),

      // 10. Total Income (sum of paidAmount from GymSubscriptionHistory)
      prisma.gymSubscriptionHistory.aggregate({
        _sum: { paidAmount: true },
        where: { isActive: true },
      }),

      // 12. This Month's Income
      prisma.gymSubscriptionHistory.aggregate({
        _sum: { paidAmount: true },
        where: {
          isActive: true,
          renewalDate: { gte: monthStart, lte: monthEnd },
        },
      }),

      // 11. Total Expense (sum of admin expenses)
      prisma.adminExpenseMaster.aggregate({
        _sum: { amount: true },
        where: { isActive: true },
      }),

      // 13. This Month's Expense
      prisma.adminExpenseMaster.aggregate({
        _sum: { amount: true },
        where: {
          isActive: true,
          expenseDate: { gte: monthStart, lte: monthEnd },
        },
      }),
    ]);

    // 8. Most Popular Subscription Plan (by active gym count)
    const popularPlan = await prisma.gymSubscriptionPlan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            gyms: {
              where: { isActive: true, subscriptionEnd: { gte: now } },
            },
          },
        },
      },
      orderBy: { gyms: { _count: 'desc' } },
      take: 1,
    });

    const mostPopularSubscriptionPlan = popularPlan.length > 0 && popularPlan[0]._count.gyms > 0
      ? {
          planId: popularPlan[0].id,
          planName: popularPlan[0].name,
          activeGymCount: popularPlan[0]._count.gyms,
        }
      : null;

    return {
      totalActiveGyms,
      totalActiveGymInquiries,
      todaysFollowupGymInquiries,
      twoDaysLeftExpiredGyms,
      totalExpiredGyms,
      totalRenewalGyms,
      totalMembers,
      mostPopularSubscriptionPlan,
      recentRegisteredGyms,
      totalIncome: Number(totalIncomeResult._sum.paidAmount || 0),
      totalExpense: Number(totalExpenseResult._sum.amount || 0),
      thisMonthsIncome: Number(thisMonthsIncomeResult._sum.paidAmount || 0),
      thisMonthsExpense: Number(thisMonthsExpenseResult._sum.amount || 0),
    };
  }

  // Detail: Active Gyms
  async getActiveGymsDetail(params: DashboardDetailParams): Promise<{ items: ActiveGymDetail[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: any = {
      isActive: true,
      subscriptionEnd: { gte: now },
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [gyms, total] = await Promise.all([
      prisma.gym.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          subscriptionPlan: { select: { name: true } },
          owner: { select: { name: true, email: true } },
          _count: { select: { members: true } },
        },
      }),
      prisma.gym.count({ where }),
    ]);

    const items: ActiveGymDetail[] = gyms.map((g) => ({
      id: g.id,
      name: g.name,
      email: g.email,
      mobileNo: g.mobileNo,
      city: g.city,
      state: g.state,
      isActive: g.isActive,
      subscriptionPlanName: g.subscriptionPlan?.name || null,
      subscriptionStart: g.subscriptionStart,
      subscriptionEnd: g.subscriptionEnd,
      ownerName: g.owner?.name || null,
      ownerEmail: g.owner?.email || null,
      memberCount: g._count.members,
      createdAt: g.createdAt,
    }));

    return { items, total };
  }

  // Detail: Active Gym Inquiries
  async getActiveGymInquiriesDetail(params: DashboardDetailParams): Promise<{ items: GymInquiryDetail[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { gymName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobileNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [inquiries, total] = await Promise.all([
      prisma.gymInquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          subscriptionPlan: { select: { name: true } },
          enquiryType: { select: { name: true } },
          _count: { select: { followups: true } },
        },
      }),
      prisma.gymInquiry.count({ where }),
    ]);

    const items: GymInquiryDetail[] = inquiries.map((i) => ({
      id: i.id,
      gymName: i.gymName,
      mobileNo: i.mobileNo,
      email: i.email,
      city: i.city,
      state: i.state,
      subscriptionPlanName: i.subscriptionPlan?.name || null,
      enquiryTypeName: i.enquiryType?.name || null,
      sellerName: i.sellerName,
      nextFollowupDate: i.nextFollowupDate,
      memberSize: i.memberSize,
      note: i.note,
      followupCount: i._count.followups,
      isActive: i.isActive,
      createdAt: i.createdAt,
    }));

    return { items, total };
  }

  // Detail: Today's Followup Gym Inquiries
  async getTodaysFollowupInquiriesDetail(params: DashboardDetailParams): Promise<{ items: GymInquiryDetail[]; total: number }> {
    const { page, limit, search, sortBy = 'nextFollowupDate', sortOrder = 'asc' } = params;
    const skip = (page - 1) * limit;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const where: any = {
      isActive: true,
      nextFollowupDate: { gte: todayStart, lte: todayEnd },
    };
    if (search) {
      where.OR = [
        { gymName: { contains: search, mode: 'insensitive' } },
        { mobileNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [inquiries, total] = await Promise.all([
      prisma.gymInquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          subscriptionPlan: { select: { name: true } },
          enquiryType: { select: { name: true } },
          _count: { select: { followups: true } },
        },
      }),
      prisma.gymInquiry.count({ where }),
    ]);

    const items: GymInquiryDetail[] = inquiries.map((i) => ({
      id: i.id,
      gymName: i.gymName,
      mobileNo: i.mobileNo,
      email: i.email,
      city: i.city,
      state: i.state,
      subscriptionPlanName: i.subscriptionPlan?.name || null,
      enquiryTypeName: i.enquiryType?.name || null,
      sellerName: i.sellerName,
      nextFollowupDate: i.nextFollowupDate,
      memberSize: i.memberSize,
      note: i.note,
      followupCount: i._count.followups,
      isActive: i.isActive,
      createdAt: i.createdAt,
    }));

    return { items, total };
  }

  // Detail: Two Days Left Expiring Gyms
  async getTwoDaysLeftExpiringGymsDetail(params: DashboardDetailParams): Promise<{ items: ExpiringGymDetail[]; total: number }> {
    const { page, limit, search, sortBy = 'subscriptionEnd', sortOrder = 'asc' } = params;
    const skip = (page - 1) * limit;
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const where: any = {
      isActive: true,
      subscriptionEnd: { gte: now, lte: twoDaysFromNow },
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [gyms, total] = await Promise.all([
      prisma.gym.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          subscriptionPlan: { select: { name: true } },
          owner: { select: { name: true, email: true } },
        },
      }),
      prisma.gym.count({ where }),
    ]);

    const items: ExpiringGymDetail[] = gyms.map((g) => {
      const daysLeft = Math.max(0, Math.ceil((new Date(g.subscriptionEnd!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      return {
        id: g.id,
        name: g.name,
        email: g.email,
        mobileNo: g.mobileNo,
        city: g.city,
        state: g.state,
        subscriptionPlanName: g.subscriptionPlan?.name || null,
        subscriptionStart: g.subscriptionStart,
        subscriptionEnd: g.subscriptionEnd,
        daysLeft,
        ownerName: g.owner?.name || null,
        ownerEmail: g.owner?.email || null,
      };
    });

    return { items, total };
  }

  // Detail: Expired Gyms
  async getExpiredGymsDetail(params: DashboardDetailParams): Promise<{ items: ExpiredGymDetail[]; total: number }> {
    const { page, limit, search, sortBy = 'subscriptionEnd', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: any = {
      subscriptionEnd: { lt: now },
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [gyms, total] = await Promise.all([
      prisma.gym.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          subscriptionPlan: { select: { name: true } },
          owner: { select: { name: true, email: true } },
        },
      }),
      prisma.gym.count({ where }),
    ]);

    const items: ExpiredGymDetail[] = gyms.map((g) => {
      const expiredDaysAgo = Math.ceil((now.getTime() - new Date(g.subscriptionEnd!).getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: g.id,
        name: g.name,
        email: g.email,
        mobileNo: g.mobileNo,
        city: g.city,
        state: g.state,
        subscriptionPlanName: g.subscriptionPlan?.name || null,
        subscriptionStart: g.subscriptionStart,
        subscriptionEnd: g.subscriptionEnd,
        expiredDaysAgo,
        ownerName: g.owner?.name || null,
        ownerEmail: g.owner?.email || null,
      };
    });

    return { items, total };
  }

  // Detail: Renewal Gyms
  async getRenewalGymsDetail(params: DashboardDetailParams): Promise<{ items: RenewalGymDetail[]; total: number }> {
    const { page, limit, search, sortBy = 'renewalDate', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      renewalType: 'RENEWAL',
      isActive: true,
    };
    if (search) {
      where.gym = { name: { contains: search, mode: 'insensitive' } };
    }

    const [renewals, total] = await Promise.all([
      prisma.gymSubscriptionHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          gym: { select: { name: true } },
          subscriptionPlan: { select: { name: true } },
        },
      }),
      prisma.gymSubscriptionHistory.count({ where }),
    ]);

    const items: RenewalGymDetail[] = renewals.map((r) => ({
      id: r.id,
      subscriptionNumber: r.subscriptionNumber,
      gymName: r.gym.name,
      subscriptionPlanName: r.subscriptionPlan.name,
      renewalType: r.renewalType,
      renewalDate: r.renewalDate,
      subscriptionStart: r.subscriptionStart,
      subscriptionEnd: r.subscriptionEnd,
      amount: Number(r.amount),
      paidAmount: r.paidAmount ? Number(r.paidAmount) : null,
      pendingAmount: r.pendingAmount ? Number(r.pendingAmount) : null,
      paymentStatus: r.paymentStatus,
      paymentMode: r.paymentMode,
    }));

    return { items, total };
  }

  // Detail: Total Members
  async getMembersDetail(params: DashboardDetailParams): Promise<{ items: MemberDetail[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { memberId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          gym: { select: { name: true } },
        },
      }),
      prisma.member.count({ where }),
    ]);

    const items: MemberDetail[] = members.map((m) => ({
      id: m.id,
      memberId: m.memberId,
      name: m.name,
      email: m.email,
      phone: m.phone,
      gender: m.gender,
      memberType: m.memberType,
      membershipStatus: m.membershipStatus,
      membershipStart: m.membershipStart,
      membershipEnd: m.membershipEnd,
      gymName: m.gym.name,
      isActive: m.isActive,
      createdAt: m.createdAt,
    }));

    return { items, total };
  }

  // Detail: Most Popular Subscription Plan Gyms
  async getPopularPlanGymsDetail(params: DashboardDetailParams): Promise<{ items: PopularPlanGymDetail[]; total: number; planName: string }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;
    const now = new Date();

    // Find the most popular plan
    const popularPlan = await prisma.gymSubscriptionPlan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            gyms: {
              where: { isActive: true, subscriptionEnd: { gte: now } },
            },
          },
        },
      },
      orderBy: { gyms: { _count: 'desc' } },
      take: 1,
    });

    if (popularPlan.length === 0) {
      return { items: [], total: 0, planName: 'N/A' };
    }

    const planId = popularPlan[0].id;
    const planName = popularPlan[0].name;

    const where: any = {
      isActive: true,
      subscriptionEnd: { gte: now },
      subscriptionPlanId: planId,
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [gyms, total] = await Promise.all([
      prisma.gym.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: { select: { name: true } },
        },
      }),
      prisma.gym.count({ where }),
    ]);

    const items: PopularPlanGymDetail[] = gyms.map((g) => ({
      id: g.id,
      name: g.name,
      email: g.email,
      mobileNo: g.mobileNo,
      city: g.city,
      state: g.state,
      subscriptionStart: g.subscriptionStart,
      subscriptionEnd: g.subscriptionEnd,
      ownerName: g.owner?.name || null,
    }));

    return { items, total, planName };
  }

  // Detail: Recent Registered Gyms (Last 7 Days)
  async getRecentGymsDetail(params: DashboardDetailParams): Promise<{ items: ActiveGymDetail[]; total: number }> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;
    const sevenDaysAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);

    const where: any = {
      createdAt: { gte: sevenDaysAgo },
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [gyms, total] = await Promise.all([
      prisma.gym.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          subscriptionPlan: { select: { name: true } },
          owner: { select: { name: true, email: true } },
          _count: { select: { members: true } },
        },
      }),
      prisma.gym.count({ where }),
    ]);

    const items: ActiveGymDetail[] = gyms.map((g) => ({
      id: g.id,
      name: g.name,
      email: g.email,
      mobileNo: g.mobileNo,
      city: g.city,
      state: g.state,
      isActive: g.isActive,
      subscriptionPlanName: g.subscriptionPlan?.name || null,
      subscriptionStart: g.subscriptionStart,
      subscriptionEnd: g.subscriptionEnd,
      ownerName: g.owner?.name || null,
      ownerEmail: g.owner?.email || null,
      memberCount: g._count.members,
      createdAt: g.createdAt,
    }));

    return { items, total };
  }

  // Detail: Total Income
  async getIncomeDetail(params: DashboardDetailParams & { thisMonth?: boolean }): Promise<{ items: IncomeDetail[]; total: number; totalAmount: number }> {
    const { page, limit, search, sortBy = 'renewalDate', sortOrder = 'desc', thisMonth } = params;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (thisMonth) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      where.renewalDate = { gte: monthStart, lte: monthEnd };
    }

    if (search) {
      where.gym = { name: { contains: search, mode: 'insensitive' } };
    }

    const [records, total, totalAmountResult] = await Promise.all([
      prisma.gymSubscriptionHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          gym: { select: { name: true } },
          subscriptionPlan: { select: { name: true } },
        },
      }),
      prisma.gymSubscriptionHistory.count({ where }),
      prisma.gymSubscriptionHistory.aggregate({
        _sum: { paidAmount: true },
        where,
      }),
    ]);

    const items: IncomeDetail[] = records.map((r) => ({
      id: r.id,
      subscriptionNumber: r.subscriptionNumber,
      gymName: r.gym.name,
      subscriptionPlanName: r.subscriptionPlan.name,
      amount: Number(r.amount),
      paidAmount: r.paidAmount ? Number(r.paidAmount) : null,
      paymentMode: r.paymentMode,
      paymentStatus: r.paymentStatus,
      renewalType: r.renewalType,
      renewalDate: r.renewalDate,
    }));

    return {
      items,
      total,
      totalAmount: Number(totalAmountResult._sum.paidAmount || 0),
    };
  }

  // Detail: Total Expense
  async getExpenseDetail(params: DashboardDetailParams & { thisMonth?: boolean }): Promise<{ items: ExpenseDetail[]; total: number; totalAmount: number }> {
    const { page, limit, search, sortBy = 'expenseDate', sortOrder = 'desc', thisMonth } = params;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (thisMonth) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      where.expenseDate = { gte: monthStart, lte: monthEnd };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [expenses, total, totalAmountResult] = await Promise.all([
      prisma.adminExpenseMaster.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          expenseGroup: { select: { expenseGroupName: true } },
        },
      }),
      prisma.adminExpenseMaster.count({ where }),
      prisma.adminExpenseMaster.aggregate({
        _sum: { amount: true },
        where,
      }),
    ]);

    const items: ExpenseDetail[] = expenses.map((e) => ({
      id: e.id,
      name: e.name,
      expenseGroupName: e.expenseGroup?.expenseGroupName,
      description: e.description,
      amount: Number(e.amount),
      paymentMode: e.paymentMode,
      expenseDate: e.expenseDate,
      createdAt: e.createdAt,
    }));

    return {
      items,
      total,
      totalAmount: Number(totalAmountResult._sum.amount || 0),
    };
  }
}

export default new AdminService();
