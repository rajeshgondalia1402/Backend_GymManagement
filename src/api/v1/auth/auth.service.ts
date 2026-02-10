import bcrypt from 'bcryptjs';
import { prisma } from '../../../config/database';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry
} from '../../../config/jwt';
import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException
} from '../../../common/exceptions';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  UserProfile
} from './auth.types';

class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        role: true,
        ownedGym: {
          include: {
            subscriptionPlan: true
          }
        }
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roleName = user.role?.rolename || 'MEMBER';

    // Check subscription expiry for GYM_OWNER role only
    if (roleName === 'GYM_OWNER' && user.ownedGym) {
      const gym = user.ownedGym;

      // Check if gym has a subscription plan assigned
      if (gym.subscriptionPlan && gym.subscriptionStart) {
        const subscriptionStartDate = new Date(gym.subscriptionStart);
        const durationDays = gym.subscriptionPlan.durationDays;
        const currentDate = new Date();

        // Calculate subscription end date based on start date + duration days
        const subscriptionEndDate = new Date(subscriptionStartDate);
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + durationDays);

        // If subscriptionEnd is explicitly set in the database, use that instead
        const effectiveEndDate = gym.subscriptionEnd
          ? new Date(gym.subscriptionEnd)
          : subscriptionEndDate;

        // Check if subscription has expired
        if (currentDate > effectiveEndDate) {
          throw new UnauthorizedException(
            'Your subscription has expired. Please renew your plan or contact the administrator.'
          );
        }
      } else if (!gym.subscriptionPlan) {
        // No subscription plan assigned - block login
        throw new UnauthorizedException(
          'No subscription plan assigned to your gym. Please contact the administrator.'
        );
      }
    }

    const payload = { userId: user.id, role: roleName };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    // Get gym ID and subscription name based on role
    let gymId: string | undefined;
    let subscriptionName: string | undefined;
    if (user.ownedGym) {
      gymId = user.ownedGym.id;
      subscriptionName = user.ownedGym.subscriptionPlan?.name;
    } else {
      // Check if user is a member or trainer
      const member = await prisma.member.findUnique({ where: { userId: user.id } });
      if (member) gymId = member.gymId;
      else {
        const trainer = await prisma.trainer.findUnique({ where: { userId: user.id } });
        if (trainer) gymId = trainer.gymId;
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.name.split(' ')[0] || user.name,
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        role: roleName,
        gymId,
        subscriptionName,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const decoded = verifyRefreshToken(data.refreshToken);
    if (!decoded) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find the refresh token in database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: data.refreshToken,
        userId: decoded.userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      // Check if this is a recently used token (race condition handling)
      // Look for any valid refresh tokens for this user
      const existingValidToken = await prisma.refreshToken.findFirst({
        where: {
          userId: decoded.userId,
          expiresAt: { gt: new Date() },
          // Token created in the last 5 seconds (grace period for race conditions)
          createdAt: { gt: new Date(Date.now() - 5000) },
        },
      });

      if (existingValidToken) {
        // A new token was just created - this is likely a race condition
        // Return the existing tokens instead of creating new ones
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: { role: true },
        });

        if (!user || !user.isActive) {
          throw new UnauthorizedException('User not found or deactivated');
        }

        const roleName = user.role?.rolename || 'MEMBER';
        const payload = { userId: user.id, role: roleName };
        const accessToken = generateAccessToken(payload);

        return {
          accessToken,
          refreshToken: existingValidToken.token,
        };
      }

      throw new UnauthorizedException('Refresh token not found or expired. Please login again.');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    // Delete old token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    const roleName = user.role?.rolename || 'MEMBER';
    const payload = { userId: user.id, role: roleName };
    const accessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async changePassword(userId: string, data: ChangePasswordRequest): Promise<void> {
    // Include ownedGym relation to find gym owner's gym (same approach as resetGymOwnerPassword)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        trainerProfile: true,
        memberProfile: true,
        role: true,
        ownedGym: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Determine where the current password is stored based on role
    let currentHashedPassword = user.password;
    const roleName = user.role?.rolename || 'MEMBER';

    // For Trainer/Member, the hashed password is in their own table
    if (user.trainerProfile && user.trainerProfile.password) {
      currentHashedPassword = user.trainerProfile.password;
    } else if (user.memberProfile && user.memberProfile.password) {
      currentHashedPassword = user.memberProfile.password;
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, currentHashedPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Use transaction to update all password fields atomically
    await prisma.$transaction(async (tx) => {
      // Always update password in User table (for token/auth compatibility)
      await tx.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      // If user is a trainer, update password in Trainer table
      if (user.trainerProfile) {
        await tx.trainer.update({
          where: { id: user.trainerProfile.id },
          data: { password: hashedPassword },
        });
      }

      // If user is a member, update password in Member table
      if (user.memberProfile) {
        await tx.member.update({
          where: { id: user.memberProfile.id },
          data: { password: hashedPassword },
        });
      }

      // If user owns a gym (via ownedGym relation), update ownerPassword
      if (user.ownedGym) {
        await tx.gym.update({
          where: { id: user.ownedGym.id },
          data: { ownerPassword: data.newPassword },
        });
      }

      // Log the password change in PasswordResetHistory
      await tx.passwordResetHistory.create({
        data: {
          userId: userId,
          email: user.email,
          roleId: user.roleId || undefined,
          roleName: roleName,
          resetBy: userId,
          resetByEmail: user.email,
          resetMethod: 'SELF',
          targetTable: user.trainerProfile ? 'TRAINER' : user.memberProfile ? 'MEMBER' : 'USER',
          gymId: user.ownedGym?.id || user.trainerProfile?.gymId || user.memberProfile?.gymId || undefined,
        },
      });
    });

    // Invalidate all refresh tokens
    await this.logoutAll(userId);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        ownedGym: { select: { id: true, name: true } }
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get gym ID and phone based on role
    let gymId: string | undefined;
    let gym: { id: string; name: string } | undefined;
    let phone: string | undefined;

    if (user.ownedGym) {
      gymId = user.ownedGym.id;
      gym = { id: user.ownedGym.id, name: user.ownedGym.name };
    } else {
      const member = await prisma.member.findUnique({
        where: { userId: user.id },
        include: { gym: { select: { id: true, name: true } } }
      });
      if (member) {
        gymId = member.gymId;
        gym = { id: member.gym.id, name: member.gym.name };
        phone = member.phone || undefined;
      } else {
        const trainer = await prisma.trainer.findUnique({
          where: { userId: user.id },
          include: { gym: { select: { id: true, name: true } } }
        });
        if (trainer) {
          gymId = trainer.gymId;
          gym = { id: trainer.gym.id, name: trainer.gym.name };
          phone = trainer.phone || undefined;
        }
      }
    }

    const roleName = user.role?.rolename || 'MEMBER';

    return {
      id: user.id,
      email: user.email,
      firstName: user.name.split(' ')[0] || user.name,
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      role: roleName,
      phone,
      isActive: user.isActive,
      gymId,
      gym,
      createdAt: user.createdAt,
    };
  }
}

export default new AuthService();
