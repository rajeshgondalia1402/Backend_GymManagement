"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../../../config/database");
const exceptions_1 = require("../../../common/exceptions");
class AdminService {
    async getDashboardStats() {
        const gymOwnerRole = await database_1.prisma.rolemaster.findFirst({ where: { rolename: 'GYM_OWNER' } });
        const memberRole = await database_1.prisma.rolemaster.findFirst({ where: { rolename: 'MEMBER' } });
        const trainerRole = await database_1.prisma.rolemaster.findFirst({ where: { rolename: 'TRAINER' } });
        const [totalGyms, totalGymOwners, totalMembers, totalTrainers, activeSubscriptions] = await Promise.all([
            database_1.prisma.gym.count(),
            gymOwnerRole ? database_1.prisma.user.count({ where: { roleId: gymOwnerRole.Id } }) : 0,
            memberRole ? database_1.prisma.member.count() : 0,
            trainerRole ? database_1.prisma.trainer.count() : 0,
            database_1.prisma.gym.count({ where: { isActive: true } }),
        ]);
        return {
            totalGyms,
            totalGymOwners,
            totalMembers,
            totalTrainers,
            activeSubscriptions,
            revenueThisMonth: 0,
        };
    }
    async getSubscriptionPlans(params) {
        const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
        const skip = (page - 1) * limit;
        const where = search
            ? { OR: [{ name: { contains: search, mode: 'insensitive' } }] }
            : {};
        const [dbPlans, total] = await Promise.all([
            database_1.prisma.gymSubscriptionPlan.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            database_1.prisma.gymSubscriptionPlan.count({ where }),
        ]);
        const plans = dbPlans.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || undefined,
            price: Number(p.price),
            currency: p.priceCurrency,
            durationDays: p.durationDays,
            maxMembers: 0,
            maxTrainers: 0,
            features: p.features ? [p.features] : [],
            isActive: p.isActive,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        }));
        return { plans, total };
    }
    async getSubscriptionPlanById(id) {
        const plan = await database_1.prisma.gymSubscriptionPlan.findUnique({ where: { id } });
        if (!plan)
            throw new exceptions_1.NotFoundException('Subscription plan not found');
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
    async createSubscriptionPlan(data) {
        const plan = await database_1.prisma.gymSubscriptionPlan.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                priceCurrency: data.currency || 'INR',
                durationDays: data.durationDays,
                features: data.features?.join('\n') || '',
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
            maxMembers: data.maxMembers,
            maxTrainers: data.maxTrainers,
            features: data.features || [],
            isActive: plan.isActive,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
        };
    }
    async updateSubscriptionPlan(id, data) {
        await this.getSubscriptionPlanById(id);
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.description)
            updateData.description = data.description;
        if (data.price)
            updateData.price = data.price;
        if (data.currency)
            updateData.priceCurrency = data.currency;
        if (data.durationDays)
            updateData.durationDays = data.durationDays;
        if (data.features)
            updateData.features = data.features.join('\n');
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        const plan = await database_1.prisma.gymSubscriptionPlan.update({
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
            features: plan.features ? plan.features.split('\n') : [],
            isActive: plan.isActive,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
        };
    }
    async deleteSubscriptionPlan(id) {
        await this.getSubscriptionPlanById(id);
        const gymsUsingPlan = await database_1.prisma.gym.count({ where: { subscriptionPlanId: id } });
        if (gymsUsingPlan > 0) {
            throw new exceptions_1.ConflictException('Cannot delete plan with active gyms');
        }
        await database_1.prisma.gymSubscriptionPlan.delete({ where: { id } });
    }
    async getGyms(params) {
        const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const [gyms, total] = await Promise.all([
            database_1.prisma.gym.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    subscriptionPlan: true,
                    owner: { select: { id: true, name: true, email: true } },
                },
            }),
            database_1.prisma.gym.count({ where }),
        ]);
        return { gyms: gyms, total };
    }
    async getGymById(id) {
        const gym = await database_1.prisma.gym.findUnique({
            where: { id },
            include: {
                subscriptionPlan: true,
                owner: { select: { id: true, name: true, email: true } },
            },
        });
        if (!gym)
            throw new exceptions_1.NotFoundException('Gym not found');
        return gym;
    }
    async createGym(data) {
        if (data.email) {
            const existingGym = await database_1.prisma.gym.findFirst({ where: { email: data.email } });
            if (existingGym)
                throw new exceptions_1.ConflictException('Gym with this email already exists');
        }
        const gym = await database_1.prisma.gym.create({
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
        return gym;
    }
    async updateGym(id, data) {
        await this.getGymById(id);
        const gym = await database_1.prisma.gym.update({
            where: { id },
            data,
            include: { subscriptionPlan: true },
        });
        return gym;
    }
    async deleteGym(id) {
        await this.getGymById(id);
        await database_1.prisma.gym.delete({ where: { id } });
    }
    async toggleGymStatus(id) {
        const gym = await this.getGymById(id);
        const updated = await database_1.prisma.gym.update({
            where: { id },
            data: { isActive: !gym.isActive },
            include: { subscriptionPlan: true },
        });
        return updated;
    }
    async getGymOwners(params) {
        const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
        const skip = (page - 1) * limit;
        const gymOwnerRole = await database_1.prisma.rolemaster.findFirst({ where: { rolename: 'GYM_OWNER' } });
        if (!gymOwnerRole)
            return { owners: [], total: 0 };
        const where = {
            roleId: gymOwnerRole.Id,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };
        const [users, total] = await Promise.all([
            database_1.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: { ownedGym: { select: { id: true } } },
            }),
            database_1.prisma.user.count({ where }),
        ]);
        const owners = users.map((u) => ({
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
    async createGymOwner(data) {
        const existingUser = await database_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser)
            throw new exceptions_1.ConflictException('User with this email already exists');
        const gymOwnerRole = await database_1.prisma.rolemaster.findFirst({ where: { rolename: 'GYM_OWNER' } });
        if (!gymOwnerRole)
            throw new exceptions_1.NotFoundException('GYM_OWNER role not found');
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const user = await database_1.prisma.user.create({
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
    async toggleUserStatus(id) {
        const user = await database_1.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new exceptions_1.NotFoundException('User not found');
        const updated = await database_1.prisma.user.update({
            where: { id },
            data: { isActive: !user.isActive },
        });
        return { isActive: updated.isActive };
    }
}
exports.default = new AdminService();
//# sourceMappingURL=admin.service.js.map