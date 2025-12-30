"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gym_owner_service_1 = __importDefault(require("./gym-owner.service"));
const utils_1 = require("../../../common/utils");
const exceptions_1 = require("../../../common/exceptions");
class GymOwnerController {
    getGymId(req) {
        if (!req.user?.gymId) {
            throw new exceptions_1.BadRequestException('No gym associated with this account');
        }
        return req.user.gymId;
    }
    async getDashboard(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const stats = await gym_owner_service_1.default.getDashboardStats(gymId);
            (0, utils_1.successResponse)(res, stats, 'Dashboard stats retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getTrainers(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query;
            const { trainers, total } = await gym_owner_service_1.default.getTrainers(gymId, {
                page: Number(page),
                limit: Number(limit),
                search,
                sortBy,
                sortOrder,
            });
            (0, utils_1.paginatedResponse)(res, trainers, Number(page), Number(limit), total, 'Trainers retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getTrainerById(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const trainer = await gym_owner_service_1.default.getTrainerById(gymId, req.params.id);
            (0, utils_1.successResponse)(res, trainer, 'Trainer retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createTrainer(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const trainer = await gym_owner_service_1.default.createTrainer(gymId, req.body);
            (0, utils_1.successResponse)(res, trainer, 'Trainer created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateTrainer(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const trainer = await gym_owner_service_1.default.updateTrainer(gymId, req.params.id, req.body);
            (0, utils_1.successResponse)(res, trainer, 'Trainer updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTrainer(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            await gym_owner_service_1.default.deleteTrainer(gymId, req.params.id);
            (0, utils_1.successResponse)(res, null, 'Trainer deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getMembers(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query;
            const { members, total } = await gym_owner_service_1.default.getMembers(gymId, {
                page: Number(page),
                limit: Number(limit),
                search,
                sortBy,
                sortOrder,
            });
            (0, utils_1.paginatedResponse)(res, members, Number(page), Number(limit), total, 'Members retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getMemberById(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const member = await gym_owner_service_1.default.getMemberById(gymId, req.params.id);
            (0, utils_1.successResponse)(res, member, 'Member retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createMember(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const member = await gym_owner_service_1.default.createMember(gymId, req.body);
            (0, utils_1.successResponse)(res, member, 'Member created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateMember(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const member = await gym_owner_service_1.default.updateMember(gymId, req.params.id, req.body);
            (0, utils_1.successResponse)(res, member, 'Member updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async deleteMember(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            await gym_owner_service_1.default.deleteMember(gymId, req.params.id);
            (0, utils_1.successResponse)(res, null, 'Member deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getDietPlans(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query;
            const { plans, total } = await gym_owner_service_1.default.getDietPlans(gymId, {
                page: Number(page),
                limit: Number(limit),
                search,
                sortBy,
                sortOrder,
            });
            (0, utils_1.paginatedResponse)(res, plans, Number(page), Number(limit), total, 'Diet plans retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getDietPlanById(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const plan = await gym_owner_service_1.default.getDietPlanById(gymId, req.params.id);
            (0, utils_1.successResponse)(res, plan, 'Diet plan retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createDietPlan(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const plan = await gym_owner_service_1.default.createDietPlan(gymId, req.body);
            (0, utils_1.successResponse)(res, plan, 'Diet plan created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateDietPlan(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const plan = await gym_owner_service_1.default.updateDietPlan(gymId, req.params.id, req.body);
            (0, utils_1.successResponse)(res, plan, 'Diet plan updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async deleteDietPlan(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            await gym_owner_service_1.default.deleteDietPlan(gymId, req.params.id);
            (0, utils_1.successResponse)(res, null, 'Diet plan deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getExercisePlans(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query;
            const { plans, total } = await gym_owner_service_1.default.getExercisePlans(gymId, {
                page: Number(page),
                limit: Number(limit),
                search,
                sortBy,
                sortOrder,
            });
            (0, utils_1.paginatedResponse)(res, plans, Number(page), Number(limit), total, 'Exercise plans retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getExercisePlanById(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const plan = await gym_owner_service_1.default.getExercisePlanById(gymId, req.params.id);
            (0, utils_1.successResponse)(res, plan, 'Exercise plan retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createExercisePlan(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const plan = await gym_owner_service_1.default.createExercisePlan(gymId, req.body);
            (0, utils_1.successResponse)(res, plan, 'Exercise plan created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateExercisePlan(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const plan = await gym_owner_service_1.default.updateExercisePlan(gymId, req.params.id, req.body);
            (0, utils_1.successResponse)(res, plan, 'Exercise plan updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async deleteExercisePlan(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            await gym_owner_service_1.default.deleteExercisePlan(gymId, req.params.id);
            (0, utils_1.successResponse)(res, null, 'Exercise plan deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async assignDietPlan(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            await gym_owner_service_1.default.assignDietPlan(gymId, req.body);
            (0, utils_1.successResponse)(res, null, 'Diet plan assigned successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async assignExercisePlan(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            await gym_owner_service_1.default.assignExercisePlan(gymId, req.body);
            (0, utils_1.successResponse)(res, null, 'Exercise plan assigned successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async assignTrainer(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const { memberId, trainerId } = req.body;
            const member = await gym_owner_service_1.default.assignTrainer(gymId, memberId, trainerId);
            (0, utils_1.successResponse)(res, member, 'Trainer assigned successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new GymOwnerController();
//# sourceMappingURL=gym-owner.controller.js.map