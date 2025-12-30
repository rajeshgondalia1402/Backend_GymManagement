"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const member_controller_1 = __importDefault(require("./member.controller"));
const middleware_1 = require("../../../common/middleware");
const router = (0, express_1.Router)();
router.use(middleware_1.authenticate, (0, middleware_1.authorize)('MEMBER'));
router.get('/dashboard', member_controller_1.default.getDashboard);
router.get('/profile', member_controller_1.default.getProfile);
router.put('/profile', (0, middleware_1.validate)(middleware_1.updateProfileSchema), member_controller_1.default.updateProfile);
router.get('/trainer', member_controller_1.default.getTrainer);
router.get('/diet-plan', member_controller_1.default.getDietPlan);
router.get('/exercise-plans', member_controller_1.default.getExercisePlans);
router.get('/membership', member_controller_1.default.getMembership);
exports.default = router;
//# sourceMappingURL=member.routes.js.map