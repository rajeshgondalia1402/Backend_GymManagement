"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("./auth");
const admin_1 = require("./admin");
const gym_owner_1 = require("./gym-owner");
const member_1 = require("./member");
const router = (0, express_1.Router)();
router.use('/auth', auth_1.authRoutes);
router.use('/admin', admin_1.adminRoutes);
router.use('/gym-owner', gym_owner_1.gymOwnerRoutes);
router.use('/member', member_1.memberRoutes);
exports.default = router;
//# sourceMappingURL=index.js.map