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
        ownedGym: { select: { id: true } }
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Get gym ID based on role
    let gymId: string | undefined;
    if (user.ownedGym) {
      gymId = user.ownedGym.id;
    } else {
      const member = await prisma.member.findUnique({ where: { userId: user.id } });
      if (member) gymId = member.gymId;
      else {
        const trainer = await prisma.trainer.findUnique({ where: { userId: user.id } });
        if (trainer) gymId = trainer.gymId;
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
  } catch (error) {
    next(error);
  }
};

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

export const authorizeGymAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedException('Not authenticated');
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    const gymId = req.params.gymId || req.body.gymId;
    
    if (gymId && req.user.gymId !== gymId) {
      throw new ForbiddenException('Access denied to this gym');
    }

    next();
  } catch (error) {
    next(error);
  }
};
