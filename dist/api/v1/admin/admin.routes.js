"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = __importDefault(require("./admin.controller"));
const middleware_1 = require("../../../common/middleware");
const router = (0, express_1.Router)();
router.use(middleware_1.authenticate, (0, middleware_1.authorize)('ADMIN'));
router.get('/dashboard', admin_controller_1.default.getDashboard);
router.get('/subscription-plans', (0, middleware_1.validate)(middleware_1.paginationSchema, 'query'), admin_controller_1.default.getSubscriptionPlans);
router.get('/subscription-plans/:id', (0, middleware_1.validate)(middleware_1.idParamSchema, 'params'), admin_controller_1.default.getSubscriptionPlanById);
router.post('/subscription-plans', (0, middleware_1.validate)(middleware_1.createSubscriptionPlanSchema), admin_controller_1.default.createSubscriptionPlan);
router.put('/subscription-plans/:id', (0, middleware_1.validate)(middleware_1.idParamSchema, 'params'), (0, middleware_1.validate)(middleware_1.updateSubscriptionPlanSchema), admin_controller_1.default.updateSubscriptionPlan);
router.delete('/subscription-plans/:id', (0, middleware_1.validate)(middleware_1.idParamSchema, 'params'), admin_controller_1.default.deleteSubscriptionPlan);
router.get('/gyms', (0, middleware_1.validate)(middleware_1.paginationSchema, 'query'), admin_controller_1.default.getGyms);
router.get('/gyms/:id', (0, middleware_1.validate)(middleware_1.idParamSchema, 'params'), admin_controller_1.default.getGymById);
router.post('/gyms', (0, middleware_1.validate)(middleware_1.createGymSchema), admin_controller_1.default.createGym);
router.put('/gyms/:id', (0, middleware_1.validate)(middleware_1.idParamSchema, 'params'), (0, middleware_1.validate)(middleware_1.updateGymSchema), admin_controller_1.default.updateGym);
router.delete('/gyms/:id', (0, middleware_1.validate)(middleware_1.idParamSchema, 'params'), admin_controller_1.default.deleteGym);
router.patch('/gyms/:id/toggle-status', (0, middleware_1.validate)(middleware_1.idParamSchema, 'params'), admin_controller_1.default.toggleGymStatus);
router.get('/gym-owners', (0, middleware_1.validate)(middleware_1.paginationSchema, 'query'), admin_controller_1.default.getGymOwners);
router.post('/gym-owners', (0, middleware_1.validate)(middleware_1.createGymOwnerSchema), admin_controller_1.default.createGymOwner);
router.patch('/users/:id/toggle-status', (0, middleware_1.validate)(middleware_1.idParamSchema, 'params'), admin_controller_1.default.toggleUserStatus);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map