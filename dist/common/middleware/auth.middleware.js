"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeGymResource = exports.authorizeOwnership = exports.authorizeGymAccess = exports.authorize = exports.authenticate = void 0;
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
                ownedGym: { select: { id: true } },
                memberProfile: { select: { id: true, gymId: true } },
                trainerProfile: { select: { id: true, gymId: true } },
            },
        });
        if (!user) {
            throw new exceptions_1.UnauthorizedException('User not found');
        }
        if (!user.isActive) {
            throw new exceptions_1.UnauthorizedException('Account is deactivated');
        }
        const roleName = user.role?.rolename || 'MEMBER';
        let gymId;
        let trainerId;
        let memberId;
        if (roleName === 'ADMIN') {
            gymId = undefined;
        }
        else if (roleName === 'GYM_OWNER' && user.ownedGym) {
            gymId = user.ownedGym.id;
        }
        else if (roleName === 'TRAINER' && user.trainerProfile) {
            gymId = user.trainerProfile.gymId;
            trainerId = user.trainerProfile.id;
        }
        else if (roleName === 'MEMBER' && user.memberProfile) {
            gymId = user.memberProfile.gymId;
            memberId = user.memberProfile.id;
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: roleName,
            gymId,
            trainerId,
            memberId,
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
const authorizeGymAccess = (paramName = 'gymId') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new exceptions_1.UnauthorizedException('Not authenticated');
            }
            if (req.user.role === 'ADMIN') {
                return next();
            }
            const requestedGymId = req.params[paramName] || req.body[paramName] || req.query[paramName];
            if (requestedGymId && req.user.gymId !== requestedGymId) {
                throw new exceptions_1.ForbiddenException('Access denied to this gym');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorizeGymAccess = authorizeGymAccess;
const authorizeOwnership = (resourceType) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new exceptions_1.UnauthorizedException('Not authenticated');
            }
            if (req.user.role === 'ADMIN' || req.user.role === 'GYM_OWNER') {
                return next();
            }
            const resourceId = req.params.id || req.params.memberId || req.params.trainerId;
            if (resourceType === 'member') {
                if (req.user.role === 'MEMBER' && req.user.memberId !== resourceId) {
                    throw new exceptions_1.ForbiddenException('Access denied to this member');
                }
                if (req.user.role === 'TRAINER' && req.user.trainerId) {
                    const assignment = await database_1.prisma.memberTrainerAssignment.findFirst({
                        where: {
                            memberId: resourceId,
                            trainerId: req.user.trainerId,
                            isActive: true,
                        },
                    });
                    if (!assignment) {
                        throw new exceptions_1.ForbiddenException('Access denied to this member');
                    }
                }
            }
            if (resourceType === 'trainer') {
                if (req.user.role === 'TRAINER' && req.user.trainerId !== resourceId) {
                    throw new exceptions_1.ForbiddenException('Access denied to this trainer');
                }
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorizeOwnership = authorizeOwnership;
const authorizeGymResource = (resourceType) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new exceptions_1.UnauthorizedException('Not authenticated');
            }
            if (req.user.role === 'ADMIN') {
                return next();
            }
            const resourceId = req.params.id;
            if (!resourceId) {
                return next();
            }
            let resourceGymId = null;
            switch (resourceType) {
                case 'member':
                    const member = await database_1.prisma.member.findUnique({ where: { id: resourceId } });
                    resourceGymId = member?.gymId || null;
                    break;
                case 'trainer':
                    const trainer = await database_1.prisma.trainer.findUnique({ where: { id: resourceId } });
                    resourceGymId = trainer?.gymId || null;
                    break;
                case 'dietPlan':
                    const dietPlan = await database_1.prisma.dietPlan.findUnique({ where: { id: resourceId } });
                    resourceGymId = dietPlan?.gymId || null;
                    break;
                case 'exercisePlan':
                    const exercisePlan = await database_1.prisma.exercisePlan.findUnique({ where: { id: resourceId } });
                    resourceGymId = exercisePlan?.gymId || null;
                    break;
            }
            if (resourceGymId && req.user.gymId !== resourceGymId) {
                throw new exceptions_1.ForbiddenException('Access denied to this resource');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorizeGymResource = authorizeGymResource;
//# sourceMappingURL=auth.middleware.js.map