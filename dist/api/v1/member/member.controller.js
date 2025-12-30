"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const member_service_1 = __importDefault(require("./member.service"));
const utils_1 = require("../../../common/utils");
class MemberController {
    async getProfile(req, res, next) {
        try {
            const profile = await member_service_1.default.getProfile(req.user.id);
            (0, utils_1.successResponse)(res, profile, 'Profile retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const profile = await member_service_1.default.updateProfile(req.user.id, req.body);
            (0, utils_1.successResponse)(res, profile, 'Profile updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getDashboard(req, res, next) {
        try {
            const stats = await member_service_1.default.getDashboard(req.user.id);
            (0, utils_1.successResponse)(res, stats, 'Dashboard retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getTrainer(req, res, next) {
        try {
            const trainer = await member_service_1.default.getTrainer(req.user.id);
            (0, utils_1.successResponse)(res, trainer, 'Trainer retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getDietPlan(req, res, next) {
        try {
            const dietPlan = await member_service_1.default.getDietPlan(req.user.id);
            (0, utils_1.successResponse)(res, dietPlan, 'Diet plan retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getExercisePlans(req, res, next) {
        try {
            const exercisePlans = await member_service_1.default.getExercisePlans(req.user.id);
            (0, utils_1.successResponse)(res, exercisePlans, 'Exercise plans retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getMembership(req, res, next) {
        try {
            const membership = await member_service_1.default.getMembership(req.user.id);
            (0, utils_1.successResponse)(res, membership, 'Membership retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new MemberController();
//# sourceMappingURL=member.controller.js.map