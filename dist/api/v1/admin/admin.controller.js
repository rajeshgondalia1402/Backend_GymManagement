"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_service_1 = __importDefault(require("./admin.service"));
const utils_1 = require("../../../common/utils");
const upload_middleware_1 = require("../../../common/middleware/upload.middleware");
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
    async assignGymOwner(req, res, next) {
        try {
            const { ownerId } = req.body;
            const gym = await admin_service_1.default.assignGymOwner(req.params.id, ownerId);
            (0, utils_1.successResponse)(res, gym, 'Owner assigned to gym successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async uploadGymLogo(req, res, next) {
        try {
            const gymId = req.params.id;
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: 'No file uploaded. Please upload a gym logo image.',
                });
                return;
            }
            const existingGym = await admin_service_1.default.getGymById(gymId);
            if (existingGym.gymLogo) {
                (0, upload_middleware_1.deleteOldLogo)(existingGym.gymLogo);
            }
            const logoPath = (0, upload_middleware_1.getRelativeLogoPath)(req.file.filename);
            const gym = await admin_service_1.default.updateGym(gymId, { gymLogo: logoPath });
            (0, utils_1.successResponse)(res, {
                gym,
                logoUrl: logoPath,
                message: 'Logo uploaded and saved successfully'
            }, 'Gym logo uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async deleteGymLogo(req, res, next) {
        try {
            const gymId = req.params.id;
            const existingGym = await admin_service_1.default.getGymById(gymId);
            if (existingGym.gymLogo) {
                (0, upload_middleware_1.deleteOldLogo)(existingGym.gymLogo);
            }
            const gym = await admin_service_1.default.updateGym(gymId, { gymLogo: undefined });
            (0, utils_1.successResponse)(res, gym, 'Gym logo deleted successfully');
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
    async getOccupations(req, res, next) {
        try {
            const occupations = await admin_service_1.default.getOccupations();
            (0, utils_1.successResponse)(res, occupations, 'Occupations retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getOccupationById(req, res, next) {
        try {
            const occupation = await admin_service_1.default.getOccupationById(req.params.id);
            (0, utils_1.successResponse)(res, occupation, 'Occupation retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createOccupation(req, res, next) {
        try {
            const occupation = await admin_service_1.default.createOccupation(req.body, req.user?.id);
            (0, utils_1.successResponse)(res, occupation, 'Occupation created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateOccupation(req, res, next) {
        try {
            const occupation = await admin_service_1.default.updateOccupation(req.params.id, req.body);
            (0, utils_1.successResponse)(res, occupation, 'Occupation updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async deleteOccupation(req, res, next) {
        try {
            const occupation = await admin_service_1.default.deleteOccupation(req.params.id);
            (0, utils_1.successResponse)(res, occupation, 'Occupation deleted successfully (soft delete)');
        }
        catch (error) {
            next(error);
        }
    }
    async getEnquiryTypes(req, res, next) {
        try {
            const enquiryTypes = await admin_service_1.default.getEnquiryTypes();
            (0, utils_1.successResponse)(res, enquiryTypes, 'Enquiry types retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getEnquiryTypeById(req, res, next) {
        try {
            const enquiryType = await admin_service_1.default.getEnquiryTypeById(req.params.id);
            (0, utils_1.successResponse)(res, enquiryType, 'Enquiry type retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createEnquiryType(req, res, next) {
        try {
            const enquiryType = await admin_service_1.default.createEnquiryType(req.body, req.user?.id);
            (0, utils_1.successResponse)(res, enquiryType, 'Enquiry type created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateEnquiryType(req, res, next) {
        try {
            const enquiryType = await admin_service_1.default.updateEnquiryType(req.params.id, req.body);
            (0, utils_1.successResponse)(res, enquiryType, 'Enquiry type updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async deleteEnquiryType(req, res, next) {
        try {
            const enquiryType = await admin_service_1.default.deleteEnquiryType(req.params.id);
            (0, utils_1.successResponse)(res, enquiryType, 'Enquiry type deleted successfully (soft delete)');
        }
        catch (error) {
            next(error);
        }
    }
    async getPaymentTypes(req, res, next) {
        try {
            const paymentTypes = await admin_service_1.default.getPaymentTypes();
            (0, utils_1.successResponse)(res, paymentTypes, 'Payment types retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getPaymentTypeById(req, res, next) {
        try {
            const paymentType = await admin_service_1.default.getPaymentTypeById(req.params.id);
            (0, utils_1.successResponse)(res, paymentType, 'Payment type retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async createPaymentType(req, res, next) {
        try {
            const paymentType = await admin_service_1.default.createPaymentType(req.body, req.user?.id);
            (0, utils_1.successResponse)(res, paymentType, 'Payment type created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updatePaymentType(req, res, next) {
        try {
            const paymentType = await admin_service_1.default.updatePaymentType(req.params.id, req.body);
            (0, utils_1.successResponse)(res, paymentType, 'Payment type updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async deletePaymentType(req, res, next) {
        try {
            const paymentType = await admin_service_1.default.deletePaymentType(req.params.id);
            (0, utils_1.successResponse)(res, paymentType, 'Payment type deleted successfully (soft delete)');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new AdminController();
//# sourceMappingURL=admin.controller.js.map