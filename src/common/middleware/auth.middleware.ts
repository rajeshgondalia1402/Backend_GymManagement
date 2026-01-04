import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../../config/jwt';
import { prisma } from '../../config/database';
import { UnauthorizedException, ForbiddenException } from '../exceptions';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    gymId?: string;
    trainerId?: string;
    memberId?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { 
        role: true,
        ownedGym: { select: { id: true } },
        memberProfile: { select: { id: true, gymId: true } },
        trainerProfile: { select: { id: true, gymId: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const roleName = user.role?.rolename || 'MEMBER';

    // Get gym ID and profile IDs based on role
    let gymId: string | undefined;
    let trainerId: string | undefined;
    let memberId: string | undefined;

    if (roleName === 'ADMIN') {
      // Admin has no gymId
      gymId = undefined;
    } else if (roleName === 'GYM_OWNER' && user.ownedGym) {
      gymId = user.ownedGym.id;
    } else if (roleName === 'TRAINER' && user.trainerProfile) {
      gymId = user.trainerProfile.gymId;
      trainerId = user.trainerProfile.id;
    } else if (roleName === 'MEMBER' && user.memberProfile) {
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
  } catch (error) {
    next(error);
  }
};

/**
 * Basic role authorization - checks if user has one of the specified roles
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedException('Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenException('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Gym-scoped authorization - ensures user can only access their own gym's data
 * Admin bypasses this check
 */
export const authorizeGymAccess = (paramName: string = 'gymId') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedException('Not authenticated');
      }

      // Admin has full access
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Get gymId from params, body, or query
      const requestedGymId = req.params[paramName] || req.body[paramName] || req.query[paramName];

      if (requestedGymId && req.user.gymId !== requestedGymId) {
        throw new ForbiddenException('Access denied to this gym');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Resource ownership check - ensures user can only access their own resources
 * Useful for member/trainer accessing their own data
 */
export const authorizeOwnership = (resourceType: 'member' | 'trainer') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedException('Not authenticated');
      }

      // Admin and GYM_OWNER have full access within their scope
      if (req.user.role === 'ADMIN' || req.user.role === 'GYM_OWNER') {
        return next();
      }

      const resourceId = req.params.id || req.params.memberId || req.params.trainerId;

      if (resourceType === 'member') {
        if (req.user.role === 'MEMBER' && req.user.memberId !== resourceId) {
          throw new ForbiddenException('Access denied to this member');
        }
        // Trainers can access their assigned members
        if (req.user.role === 'TRAINER' && req.user.trainerId) {
          const assignment = await prisma.memberTrainerAssignment.findFirst({
            where: {
              memberId: resourceId,
              trainerId: req.user.trainerId,
              isActive: true,
            },
          });
          if (!assignment) {
            throw new ForbiddenException('Access denied to this member');
          }
        }
      }

      if (resourceType === 'trainer') {
        if (req.user.role === 'TRAINER' && req.user.trainerId !== resourceId) {
          throw new ForbiddenException('Access denied to this trainer');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Ensures the target resource belongs to the user's gym
 * For GYM_OWNER, TRAINER accessing gym-scoped resources
 */
export const authorizeGymResource = (resourceType: 'member' | 'trainer' | 'dietPlan' | 'exercisePlan') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedException('Not authenticated');
      }

      // Admin has full access
      if (req.user.role === 'ADMIN') {
        return next();
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return next();
      }

      let resourceGymId: string | null = null;

      switch (resourceType) {
        case 'member':
          const member = await prisma.member.findUnique({ where: { id: resourceId } });
          resourceGymId = member?.gymId || null;
          break;
        case 'trainer':
          const trainer = await prisma.trainer.findUnique({ where: { id: resourceId } });
          resourceGymId = trainer?.gymId || null;
          break;
        case 'dietPlan':
          const dietPlan = await prisma.dietPlan.findUnique({ where: { id: resourceId } });
          resourceGymId = dietPlan?.gymId || null;
          break;
        case 'exercisePlan':
          const exercisePlan = await prisma.exercisePlan.findUnique({ where: { id: resourceId } });
          resourceGymId = exercisePlan?.gymId || null;
          break;
      }

      if (resourceGymId && req.user.gymId !== resourceGymId) {
        throw new ForbiddenException('Access denied to this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
