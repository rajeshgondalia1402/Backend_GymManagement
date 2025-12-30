"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../../../config/database");
const exceptions_1 = require("../../../common/exceptions");
class GymOwnerService {
    async getDashboardStats(gymId) {
        const [totalMembers, totalTrainers, totalDietPlans, totalExercisePlans] = await Promise.all([
            database_1.prisma.member.count({ where: { gymId } }),
            database_1.prisma.trainer.count({ where: { gymId } }),
            database_1.prisma.dietPlan.count({ where: { gymId } }),
            database_1.prisma.exercisePlan.count({ where: { gymId } }),
        ]);
        const activeMembers = await database_1.prisma.member.count({
            where: {
                gymId,
                membershipStatus: 'ACTIVE',
                user: { isActive: true }
            }
        });
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const expiringMemberships = await database_1.prisma.member.count({
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
    async getTrainers(gymId, params) {
        const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
        const skip = (page - 1) * limit;
        const where = {
            gymId,
            ...(search && {
                OR: [
                    { user: { name: { contains: search, mode: 'insensitive' } } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
                ],
            }),
        };
        const [trainerRecords, total] = await Promise.all([
            database_1.prisma.trainer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    user: { select: { id: true, name: true, email: true, isActive: true } }
                }
            }),
            database_1.prisma.trainer.count({ where }),
        ]);
        const trainers = trainerRecords.map((t) => ({
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
    async getTrainerById(gymId, trainerId) {
        const trainer = await database_1.prisma.trainer.findFirst({
            where: { id: trainerId, gymId },
            include: {
                user: { select: { id: true, name: true, email: true, isActive: true } }
            }
        });
        if (!trainer)
            throw new exceptions_1.NotFoundException('Trainer not found');
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
    async createTrainer(gymId, data) {
        const existingUser = await database_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser)
            throw new exceptions_1.ConflictException('User with this email already exists');
        const gym = await database_1.prisma.gym.findUnique({ where: { id: gymId } });
        if (!gym)
            throw new exceptions_1.NotFoundException('Gym not found');
        const trainerRole = await database_1.prisma.rolemaster.findFirst({ where: { rolename: 'TRAINER' } });
        if (!trainerRole)
            throw new exceptions_1.NotFoundException('TRAINER role not found');
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const result = await database_1.prisma.$transaction(async (tx) => {
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
    async updateTrainer(gymId, trainerId, data) {
        const existingTrainer = await database_1.prisma.trainer.findFirst({
            where: { id: trainerId, gymId },
            include: { user: true }
        });
        if (!existingTrainer)
            throw new exceptions_1.NotFoundException('Trainer not found');
        const result = await database_1.prisma.$transaction(async (tx) => {
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
    async deleteTrainer(gymId, trainerId) {
        const trainer = await database_1.prisma.trainer.findFirst({
            where: { id: trainerId, gymId }
        });
        if (!trainer)
            throw new exceptions_1.NotFoundException('Trainer not found');
        await database_1.prisma.$transaction(async (tx) => {
            await tx.trainer.delete({ where: { id: trainerId } });
            await tx.user.delete({ where: { id: trainer.userId } });
        });
    }
    async getMembers(gymId, params) {
        const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
        const skip = (page - 1) * limit;
        const where = {
            gymId,
            ...(search && {
                OR: [
                    { user: { name: { contains: search, mode: 'insensitive' } } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
                ],
            }),
        };
        const [memberRecords, total] = await Promise.all([
            database_1.prisma.member.findMany({
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
            database_1.prisma.member.count({ where }),
        ]);
        const members = memberRecords.map((m) => {
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
    async getMemberById(gymId, memberId) {
        const member = await database_1.prisma.member.findFirst({
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
        if (!member)
            throw new exceptions_1.NotFoundException('Member not found');
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
    async createMember(gymId, data) {
        const existingUser = await database_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser)
            throw new exceptions_1.ConflictException('User with this email already exists');
        const gym = await database_1.prisma.gym.findUnique({ where: { id: gymId } });
        if (!gym)
            throw new exceptions_1.NotFoundException('Gym not found');
        const memberRole = await database_1.prisma.rolemaster.findFirst({ where: { rolename: 'MEMBER' } });
        if (!memberRole)
            throw new exceptions_1.NotFoundException('MEMBER role not found');
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const membershipEnd = data.membershipEndDate
            ? new Date(data.membershipEndDate)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const result = await database_1.prisma.$transaction(async (tx) => {
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
    async updateMember(gymId, memberId, data) {
        const existingMember = await database_1.prisma.member.findFirst({
            where: { id: memberId, gymId },
            include: { user: true }
        });
        if (!existingMember)
            throw new exceptions_1.NotFoundException('Member not found');
        const result = await database_1.prisma.$transaction(async (tx) => {
            if (data.firstName || data.lastName) {
                const currentName = existingMember.user.name.split(' ');
                const newFirst = data.firstName || currentName[0];
                const newLast = data.lastName || currentName.slice(1).join(' ');
                await tx.user.update({
                    where: { id: existingMember.userId },
                    data: { name: `${newFirst} ${newLast}` }
                });
            }
            const updateData = {};
            if (data.phone)
                updateData.phone = data.phone;
            if (data.membershipStartDate)
                updateData.membershipStart = new Date(data.membershipStartDate);
            if (data.membershipEndDate)
                updateData.membershipEnd = new Date(data.membershipEndDate);
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
            if (data.trainerId) {
                await tx.memberTrainerAssignment.updateMany({
                    where: { memberId, isActive: true },
                    data: { isActive: false }
                });
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
    async deleteMember(gymId, memberId) {
        const member = await database_1.prisma.member.findFirst({
            where: { id: memberId, gymId }
        });
        if (!member)
            throw new exceptions_1.NotFoundException('Member not found');
        await database_1.prisma.$transaction(async (tx) => {
            await tx.member.delete({ where: { id: memberId } });
            await tx.user.delete({ where: { id: member.userId } });
        });
    }
    async getDietPlans(gymId, params) {
        const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
        const skip = (page - 1) * limit;
        const where = {
            gymId,
            ...(search && { name: { contains: search, mode: 'insensitive' } }),
        };
        const [dbPlans, total] = await Promise.all([
            database_1.prisma.dietPlan.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            database_1.prisma.dietPlan.count({ where }),
        ]);
        const plans = dbPlans.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || undefined,
            meals: p.meals,
            totalCalories: p.calories || undefined,
            isActive: p.isActive,
            gymId: p.gymId,
            createdAt: p.createdAt,
        }));
        return { plans, total };
    }
    async getDietPlanById(gymId, planId) {
        const plan = await database_1.prisma.dietPlan.findFirst({ where: { id: planId, gymId } });
        if (!plan)
            throw new exceptions_1.NotFoundException('Diet plan not found');
        return {
            id: plan.id,
            name: plan.name,
            description: plan.description || undefined,
            meals: plan.meals,
            totalCalories: plan.calories || undefined,
            isActive: plan.isActive,
            gymId: plan.gymId,
            createdAt: plan.createdAt,
        };
    }
    async createDietPlan(gymId, data) {
        const plan = await database_1.prisma.dietPlan.create({
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
            meals: plan.meals,
            totalCalories: plan.calories || undefined,
            isActive: plan.isActive,
            gymId: plan.gymId,
            createdAt: plan.createdAt,
        };
    }
    async updateDietPlan(gymId, planId, data) {
        await this.getDietPlanById(gymId, planId);
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.description)
            updateData.description = data.description;
        if (data.meals)
            updateData.meals = data.meals;
        if (data.totalCalories)
            updateData.calories = data.totalCalories;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        const plan = await database_1.prisma.dietPlan.update({
            where: { id: planId },
            data: updateData,
        });
        return {
            id: plan.id,
            name: plan.name,
            description: plan.description || undefined,
            meals: plan.meals,
            totalCalories: plan.calories || undefined,
            isActive: plan.isActive,
            gymId: plan.gymId,
            createdAt: plan.createdAt,
        };
    }
    async deleteDietPlan(gymId, planId) {
        await this.getDietPlanById(gymId, planId);
        await database_1.prisma.dietPlan.delete({ where: { id: planId } });
    }
    async getExercisePlans(gymId, params) {
        const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
        const skip = (page - 1) * limit;
        const where = {
            gymId,
            ...(search && { name: { contains: search, mode: 'insensitive' } }),
        };
        const [dbPlans, total] = await Promise.all([
            database_1.prisma.exercisePlan.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            database_1.prisma.exercisePlan.count({ where }),
        ]);
        const plans = dbPlans.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || undefined,
            exercises: p.exercises,
            durationMinutes: undefined,
            difficulty: p.type || undefined,
            isActive: p.isActive,
            gymId: p.gymId,
            createdAt: p.createdAt,
        }));
        return { plans, total };
    }
    async getExercisePlanById(gymId, planId) {
        const plan = await database_1.prisma.exercisePlan.findFirst({ where: { id: planId, gymId } });
        if (!plan)
            throw new exceptions_1.NotFoundException('Exercise plan not found');
        return {
            id: plan.id,
            name: plan.name,
            description: plan.description || undefined,
            exercises: plan.exercises,
            durationMinutes: undefined,
            difficulty: plan.type || undefined,
            isActive: plan.isActive,
            gymId: plan.gymId,
            createdAt: plan.createdAt,
        };
    }
    async createExercisePlan(gymId, data) {
        const plan = await database_1.prisma.exercisePlan.create({
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
            exercises: plan.exercises,
            durationMinutes: data.durationMinutes,
            difficulty: plan.type || undefined,
            isActive: plan.isActive,
            gymId: plan.gymId,
            createdAt: plan.createdAt,
        };
    }
    async updateExercisePlan(gymId, planId, data) {
        await this.getExercisePlanById(gymId, planId);
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.description)
            updateData.description = data.description;
        if (data.exercises)
            updateData.exercises = data.exercises;
        if (data.difficulty)
            updateData.type = data.difficulty;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        const plan = await database_1.prisma.exercisePlan.update({
            where: { id: planId },
            data: updateData,
        });
        return {
            id: plan.id,
            name: plan.name,
            description: plan.description || undefined,
            exercises: plan.exercises,
            durationMinutes: data.durationMinutes,
            difficulty: plan.type || undefined,
            isActive: plan.isActive,
            gymId: plan.gymId,
            createdAt: plan.createdAt,
        };
    }
    async deleteExercisePlan(gymId, planId) {
        await this.getExercisePlanById(gymId, planId);
        await database_1.prisma.exercisePlan.delete({ where: { id: planId } });
    }
    async assignDietPlan(gymId, data) {
        await this.getMemberById(gymId, data.memberId);
        await this.getDietPlanById(gymId, data.planId);
        await database_1.prisma.memberDietAssignment.create({
            data: {
                memberId: data.memberId,
                dietPlanId: data.planId,
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    }
    async assignExercisePlan(gymId, data) {
        await this.getMemberById(gymId, data.memberId);
        await this.getExercisePlanById(gymId, data.planId);
        await database_1.prisma.memberExerciseAssignment.create({
            data: {
                memberId: data.memberId,
                exercisePlanId: data.planId,
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    }
    async assignTrainer(gymId, memberId, trainerId) {
        const member = await this.getMemberById(gymId, memberId);
        await this.getTrainerById(gymId, trainerId);
        await database_1.prisma.memberTrainerAssignment.updateMany({
            where: { memberId, isActive: true },
            data: { isActive: false }
        });
        await database_1.prisma.memberTrainerAssignment.create({
            data: { memberId, trainerId }
        });
        return { ...member, trainerId };
    }
}
exports.default = new GymOwnerService();
//# sourceMappingURL=gym-owner.service.js.map