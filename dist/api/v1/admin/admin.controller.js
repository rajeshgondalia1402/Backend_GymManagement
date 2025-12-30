"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_service_1 = __importDefault(require("./admin.service"));
const utils_1 = require("../../../common/utils");
class AdminController {
    async getDashboard(req, res, next) {
        try {
            const stats = await admin_service_1.default.getDashboardStats();
            (0, utils_1.successResponse)(res, stats, 'Dashboard stats retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getSubscriptionPlans(req, res, next) {
        try {
            const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query;
            const { plans, total } = await admin_service_1.default.getSubscriptionPlans({
                page: Number(page),
                limit: Number(limit),
                search,
                sortBy,
                sortOrder,
            });
            (0, utils_1.paginatedResponse)(res, plans, Number(page), Number(limit), total, 'Subscription plans retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    async getSubscriptionPlanById(req, res, next) {
        try {
            const plan = await admin_service_1.default.getSubscriptionPlanById(req.params.id);
            (0, utils_1.successResponse)(res, plan, 'Subscription plan retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createSubscriptionPlan(req, res, next) {
        try {
            const plan = await admin_service_1.default.createSubscriptionPlan(req.body);
            (0, utils_1.successResponse)(res, plan, 'Subscription plan created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateSubscriptionPlan(req, res, next) {
        try {
            const plan = await admin_service_1.default.updateSubscriptionPlan(req.params.id, req.body);
            (0, utils_1.successResponse)(res, plan, 'Subscription plan updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async deleteSubscriptionPlan(req, res, next) {
        try {
            await admin_service_1.default.deleteSubscriptionPlan(req.params.id);
            (0, utils_1.successResponse)(res, null, 'Subscription plan deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getGyms(req, res, next) {
        try {
            const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query;
            const { gyms, total } = await admin_service_1.default.getGyms({
                page: Number(page),
                limit: Number(limit),
                search,
                sortBy,
                sortOrder,
            });
            (0, utils_1.paginatedResponse)(res, gyms, Number(page), Number(limit), total, 'Gyms retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getGymById(req, res, next) {
        try {
            const gym = await admin_service_1.default.getGymById(req.params.id);
            (0, utils_1.successResponse)(res, gym, 'Gym retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createGym(req, res, next) {
        try {
            const gym = await admin_service_1.default.createGym(req.body);
            (0, utils_1.successResponse)(res, gym, 'Gym created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateGym(req, res, next) {
        try {
            const gym = await admin_service_1.default.updateGym(req.params.id, req.body);
            (0, utils_1.successResponse)(res, gym, 'Gym updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async deleteGym(req, res, next) {
        try {
            await admin_service_1.default.deleteGym(req.params.id);
            (0, utils_1.successResponse)(res, null, 'Gym deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async toggleGymStatus(req, res, next) {
        try {
            const gym = await admin_service_1.default.toggleGymStatus(req.params.id);
            (0, utils_1.successResponse)(res, gym, 'Gym status updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getGymOwners(req, res, next) {
        try {
            const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query;
            const { owners, total } = await admin_service_1.default.getGymOwners({
                page: Number(page),
                limit: Number(limit),
                search,
                sortBy,
                sortOrder,
            });
            (0, utils_1.paginatedResponse)(res, owners, Number(page), Number(limit), total, 'Gym owners retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createGymOwner(req, res, next) {
        try {
            const owner = await admin_service_1.default.createGymOwner(req.body);
            (0, utils_1.successResponse)(res, owner, 'Gym owner created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async toggleUserStatus(req, res, next) {
        try {
            const result = await admin_service_1.default.toggleUserStatus(req.params.id);
            (0, utils_1.successResponse)(res, result, 'User status updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new AdminController();
//# sourceMappingURL=admin.controller.js.map