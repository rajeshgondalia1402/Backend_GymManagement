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
  UpdateGymOwnerRequest,
  DashboardStats,
  PaginationParams,
  Occupation,
  CreateOccupationRequest,
  UpdateOccupationRequest,
  EnquiryType,
  CreateEnquiryTypeRequest,
  UpdateEnquiryTypeRequest,
  PaymentType,
  CreatePaymentTypeRequest,
  UpdatePaymentTypeRequest,
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
            { city: { contains: search, mode: 'insensitive' as const } },
            { state: { contains: search, mode: 'insensitive' as const } },
            { gstRegNo: { contains: search, mode: 'insensitive' as const } },
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

    // Calculate subscription dates if a plan is assigned
    let subscriptionStart: Date | undefined;
    let subscriptionEnd: Date | undefined;
    if (data.subscriptionPlanId) {
      const plan = await prisma.gymSubscriptionPlan.findUnique({
        where: { id: data.subscriptionPlanId },
      });
      if (plan) {
        subscriptionStart = new Date();
        subscriptionEnd = new Date();
        subscriptionEnd.setDate(subscriptionEnd.getDate() + plan.durationDays);
      }
    }

    const gym = await prisma.gym.create({
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
        note: data.note,
        gymLogo: data.gymLogo,
        subscriptionPlanId: data.subscriptionPlanId,
        ownerId: data.ownerId,
        subscriptionStart,
        subscriptionEnd,
      },
      include: { subscriptionPlan: true },
    });

    return gym as unknown as Gym;
  }

  async updateGym(id: string, data: UpdateGymRequest): Promise<Gym> {
    await this.getGymById(id);
    
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
    if (data.note !== undefined) updateData.note = data.note;
    if (data.gymLogo !== undefined) updateData.gymLogo = data.gymLogo || null;
    if (data.subscriptionPlanId !== undefined) {
      updateData.subscriptionPlanId = data.subscriptionPlanId;

      // When subscription plan changes, reset subscription dates
      const plan = await prisma.gymSubscriptionPlan.findUnique({
        where: { id: data.subscriptionPlanId },
      });
      if (plan) {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + plan.durationDays);
        updateData.subscriptionStart = now;
        updateData.subscriptionEnd = endDate;
      }
    }
    if (data.ownerId !== undefined) updateData.ownerId = data.ownerId;

    const gym = await prisma.gym.update({
      where: { id },
      data: updateData,
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

  async assignGymOwner(gymId: string, ownerId: string): Promise<Gym> {
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

    // Assign owner to gym
    const gym = await prisma.gym.update({
      where: { id: gymId },
      data: { ownerId },
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
        include: { ownedGym: { select: { id: true, name: true } } },
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
      include: { ownedGym: true },
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
      include: { ownedGym: true },
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

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: fullName,
        email: data.email || user.email,
        isActive: data.isActive !== undefined ? data.isActive : user.isActive,
      },
      include: { ownedGym: true },
    });

    const nameParts = updatedUser.name.split(' ');
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: nameParts[0] || updatedUser.name,
      lastName: nameParts.slice(1).join(' ') || '',
      phone: data.phone,
      isActive: updatedUser.isActive,
      gymId: updatedUser.ownedGym?.id || '',
      gymName: updatedUser.ownedGym?.name || '',
      createdAt: updatedUser.createdAt,
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

  async deleteOccupation(id: string): Promise<Occupation> {
    // Soft delete - set isActive to false
    await this.getOccupationById(id);

    const occupation = await prisma.occupationMaster.update({
      where: { id },
      data: { isActive: false },
    });

    return occupation;
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

  async deleteEnquiryType(id: string): Promise<EnquiryType> {
    // Soft delete - set isActive to false
    await this.getEnquiryTypeById(id);

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

  async deletePaymentType(id: string): Promise<PaymentType> {
    // Soft delete - set isActive to false
    await this.getPaymentTypeById(id);

    const paymentType = await prisma.paymentTypeMaster.update({
      where: { id },
      data: { isActive: false },
    });

    return paymentType;
  }
}

export default new AdminService();
