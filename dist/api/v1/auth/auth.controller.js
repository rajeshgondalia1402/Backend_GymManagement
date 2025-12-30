"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("./auth.service"));
const utils_1 = require("../../../common/utils");
class AuthController {
    async login(req, res, next) {
        try {
            const result = await auth_service_1.default.login(req.body);
            (0, utils_1.successResponse)(res, result, 'Login successful');
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const result = await auth_service_1.default.refreshToken(req.body);
            (0, utils_1.successResponse)(res, result, 'Token refreshed successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            await auth_service_1.default.logout(refreshToken);
            (0, utils_1.successResponse)(res, null, 'Logged out successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async logoutAll(req, res, next) {
        try {
            await auth_service_1.default.logoutAll(req.user.id);
            (0, utils_1.successResponse)(res, null, 'Logged out from all devices');
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            await auth_service_1.default.changePassword(req.user.id, req.body);
            (0, utils_1.successResponse)(res, null, 'Password changed successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const profile = await auth_service_1.default.getProfile(req.user.id);
            (0, utils_1.successResponse)(res, profile, 'Profile retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map