"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("./auth.controller"));
const middleware_1 = require("../../../common/middleware");
const router = (0, express_1.Router)();
router.post('/login', (0, middleware_1.validate)(middleware_1.loginSchema), auth_controller_1.default.login);
router.post('/refresh-token', (0, middleware_1.validate)(middleware_1.refreshTokenSchema), auth_controller_1.default.refreshToken);
router.post('/logout', (0, middleware_1.validate)(middleware_1.refreshTokenSchema), auth_controller_1.default.logout);
router.post('/logout-all', middleware_1.authenticate, auth_controller_1.default.logoutAll);
router.post('/change-password', middleware_1.authenticate, (0, middleware_1.validate)(middleware_1.changePasswordSchema), auth_controller_1.default.changePassword);
router.get('/profile', middleware_1.authenticate, auth_controller_1.default.getProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map