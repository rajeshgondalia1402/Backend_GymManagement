"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeGymAccess = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../../config/jwt");
const database_1 = require("../../config/database");
const exceptions_1 = require("../exceptions");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new exceptions_1.UnauthorizedException('Access token is required');
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded) {
            throw new exceptions_1.UnauthorizedException('Invalid or expired token');
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                role: true,
                ownedGym: { select: { id: true } }
            },
        });
        if (!user) {
            throw new exceptions_1.UnauthorizedException('User not found');
        }
        if (!user.isActive) {
            throw new exceptions_1.UnauthorizedException('Account is deactivated');
        }
        let gymId;
        if (user.ownedGym) {
            gymId = user.ownedGym.id;
        }
        else {
            const member = await database_1.prisma.member.findUnique({ where: { userId: user.id } });
            if (member)
                gymId = member.gymId;
            else {
                const trainer = await database_1.prisma.trainer.findUnique({ where: { userId: user.id } });
                if (trainer)
                    gymId = trainer.gymId;
            }
        }
        const roleName = user.role?.rolename || 'MEMBER';
        req.user = {
            id: user.id,
            email: user.email,
            role: roleName,
            gymId,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new exceptions_1.UnauthorizedException('Not authenticated'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new exceptions_1.ForbiddenException('Insufficient permissions'));
        }
        next();
    };
};
exports.authorize = authorize;
const authorizeGymAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new exceptions_1.UnauthorizedException('Not authenticated');
        }
        if (req.user.role === 'ADMIN') {
            return next();
        }
        const gymId = req.params.gymId || req.body.gymId;
        if (gymId && req.user.gymId !== gymId) {
            throw new exceptions_1.ForbiddenException('Access denied to this gym');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authorizeGymAccess = authorizeGymAccess;
//# sourceMappingURL=auth.middleware.js.map