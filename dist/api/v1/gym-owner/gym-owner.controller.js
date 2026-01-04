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
    async toggleTrainerStatus(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const result = await gym_owner_service_1.default.toggleTrainerStatus(gymId, req.params.id);
            (0, utils_1.successResponse)(res, result, `Trainer ${result.isActive ? 'activated' : 'deactivated'} successfully`);
        }
        catch (error) {
            next(error);
        }
    }
    async toggleMemberStatus(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const result = await gym_owner_service_1.default.toggleMemberStatus(gymId, req.params.id);
            (0, utils_1.successResponse)(res, result, `Member ${result.isActive ? 'activated' : 'deactivated'} successfully`);
        }
        catch (error) {
            next(error);
        }
    }
    async getPTMembers(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query;
            const { ptMembers, total } = await gym_owner_service_1.default.getPTMembers(gymId, {
                page: Number(page),
                limit: Number(limit),
                search,
                sortBy,
                sortOrder,
            });
            (0, utils_1.paginatedResponse)(res, ptMembers, Number(page), Number(limit), total, 'PT Members retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getPTMemberById(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const ptMember = await gym_owner_service_1.default.getPTMemberById(gymId, req.params.id);
            (0, utils_1.successResponse)(res, ptMember, 'PT Member retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createPTMember(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const userId = req.user.id;
            const ptMember = await gym_owner_service_1.default.createPTMember(gymId, userId, req.body);
            (0, utils_1.successResponse)(res, ptMember, 'PT Member created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updatePTMember(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const userId = req.user.id;
            const ptMember = await gym_owner_service_1.default.updatePTMember(gymId, userId, req.params.id, req.body);
            (0, utils_1.successResponse)(res, ptMember, 'PT Member updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getSupplements(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const supplements = await gym_owner_service_1.default.getSupplements(gymId, req.params.ptMemberId);
            (0, utils_1.successResponse)(res, supplements, 'Supplements retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createSupplement(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const userId = req.user.id;
            const supplement = await gym_owner_service_1.default.createSupplement(gymId, userId, req.params.ptMemberId, req.body);
            (0, utils_1.successResponse)(res, supplement, 'Supplement created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateSupplement(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const userId = req.user.id;
            const supplement = await gym_owner_service_1.default.updateSupplement(gymId, userId, req.params.id, req.body);
            (0, utils_1.successResponse)(res, supplement, 'Supplement updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getMemberDietPlans(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const plans = await gym_owner_service_1.default.getMemberDietPlans(gymId, req.params.memberId);
            (0, utils_1.successResponse)(res, plans, 'Member diet plans retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createMemberDietPlan(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const userId = req.user.id;
            const plan = await gym_owner_service_1.default.createMemberDietPlan(gymId, userId, req.params.memberId, req.body);
            (0, utils_1.successResponse)(res, plan, 'Member diet plan created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateMemberDietPlan(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const userId = req.user.id;
            const plan = await gym_owner_service_1.default.updateMemberDietPlan(gymId, userId, req.params.id, req.body);
            (0, utils_1.successResponse)(res, plan, 'Member diet plan updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getInquiries(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const { page = 1, limit = 10, search, sortBy, sortOrder, status } = req.query;
            const { inquiries, total } = await gym_owner_service_1.default.getInquiries(gymId, {
                page: Number(page),
                limit: Number(limit),
                search,
                sortBy,
                sortOrder,
                status,
            });
            (0, utils_1.paginatedResponse)(res, inquiries, Number(page), Number(limit), total, 'Inquiries retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createInquiry(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const userId = req.user.id;
            const inquiry = await gym_owner_service_1.default.createInquiry(gymId, userId, req.body);
            (0, utils_1.successResponse)(res, inquiry, 'Inquiry created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateInquiry(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const userId = req.user.id;
            const inquiry = await gym_owner_service_1.default.updateInquiry(gymId, userId, req.params.id, req.body);
            (0, utils_1.successResponse)(res, inquiry, 'Inquiry updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getMemberReport(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const report = await gym_owner_service_1.default.getMemberReport(gymId);
            (0, utils_1.successResponse)(res, report, 'Member report retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getPTProgressReport(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const report = await gym_owner_service_1.default.getPTProgressReport(gymId);
            (0, utils_1.successResponse)(res, report, 'PT progress report retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getTrainerReport(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const report = await gym_owner_service_1.default.getTrainerReport(gymId);
            (0, utils_1.successResponse)(res, report, 'Trainer report retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getRevenueReport(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const report = await gym_owner_service_1.default.getRevenueReport(gymId);
            (0, utils_1.successResponse)(res, report, 'Revenue report retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getExpenseGroups(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const expenseGroups = await gym_owner_service_1.default.getExpenseGroups(gymId);
            (0, utils_1.successResponse)(res, expenseGroups, 'Expense groups retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getExpenseGroupById(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const expenseGroup = await gym_owner_service_1.default.getExpenseGroupById(gymId, req.params.id);
            (0, utils_1.successResponse)(res, expenseGroup, 'Expense group retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createExpenseGroup(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const expenseGroup = await gym_owner_service_1.default.createExpenseGroup(gymId, req.body);
            (0, utils_1.successResponse)(res, expenseGroup, 'Expense group created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateExpenseGroup(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const expenseGroup = await gym_owner_service_1.default.updateExpenseGroup(gymId, req.params.id, req.body);
            (0, utils_1.successResponse)(res, expenseGroup, 'Expense group updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async deleteExpenseGroup(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            await gym_owner_service_1.default.deleteExpenseGroup(gymId, req.params.id);
            (0, utils_1.successResponse)(res, null, 'Expense group deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getDesignations(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const designations = await gym_owner_service_1.default.getDesignations(gymId);
            (0, utils_1.successResponse)(res, designations, 'Designations retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getDesignationById(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const designation = await gym_owner_service_1.default.getDesignationById(gymId, req.params.id);
            (0, utils_1.successResponse)(res, designation, 'Designation retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createDesignation(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const designation = await gym_owner_service_1.default.createDesignation(gymId, req.body);
            (0, utils_1.successResponse)(res, designation, 'Designation created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateDesignation(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            const designation = await gym_owner_service_1.default.updateDesignation(gymId, req.params.id, req.body);
            (0, utils_1.successResponse)(res, designation, 'Designation updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async deleteDesignation(req, res, next) {
        try {
            const gymId = this.getGymId(req);
            await gym_owner_service_1.default.deleteDesignation(gymId, req.params.id);
            (0, utils_1.successResponse)(res, null, 'Designation deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new GymOwnerController();
//# sourceMappingURL=gym-owner.controller.js.map