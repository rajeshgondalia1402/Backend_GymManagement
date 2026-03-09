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
    const username = (data.email || data.mobileNo || '').trim();
    // Detect if username looks like an email (contains @ but not our internal system emails)
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username) && !username.endsWith('@gym-internal.local');

    let userId: string | undefined;
    let roleName: string = 'MEMBER';
    let gymId: string | undefined;
    let subscriptionName: string | undefined;
    let displayEmail: string = '';
    let displayName: string = '';
    let ownedGym: any = null;

    if (isEmail) {
      // ── Email login: ADMIN or GYM_OWNER ──────────────────────────────────────
      const user = await prisma.user.findUnique({
        where: { email: username },
        include: {
          role: true,
          ownedGym: { include: { subscriptionPlan: true } },
        },
      });

      if (!user) throw new UnauthorizedException('Invalid email or password');

      const role = user.role?.rolename || '';
      if (role !== 'GYM_OWNER' && role !== 'ADMIN') {
        throw new UnauthorizedException('Email login is only available for admins and gym owners. Use your mobile number to log in.');
      }

      if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) throw new UnauthorizedException('Invalid email or password');

      userId = user.id;
      roleName = role;
      displayEmail = user.email;
      displayName = user.name;
      ownedGym = user.ownedGym;
      gymId = user.ownedGym?.id;
      subscriptionName = user.ownedGym?.subscriptionPlan?.name;
    } else {
      // ── Mobile number login ──────────────────────────────────────────────────

      // 1. Try MEMBER by phone
      const member = await prisma.member.findFirst({
        where: { phone: username, isActive: true },
        include: { user: { include: { role: true } } },
      });

      if (member) {
        if (!member.password) throw new UnauthorizedException('Invalid mobile number or password');
        const valid = await bcrypt.compare(data.password, member.password);
        if (!valid) throw new UnauthorizedException('Invalid mobile number or password');
        if (!member.user.isActive) throw new UnauthorizedException('Account is deactivated');
        userId = member.user.id;
        roleName = member.user.role?.rolename || 'MEMBER';
        displayEmail = member.email || member.user.email;
        displayName = member.name || member.user.name;
        gymId = member.gymId;
      }

      // 2. Try TRAINER by phone
      if (!userId) {
        const trainer = await prisma.trainer.findFirst({
          where: { phone: username, isActive: true },
          include: { user: { include: { role: true } } },
        });

        if (trainer) {
          if (!trainer.user.password) throw new UnauthorizedException('Invalid mobile number or password');
          const valid = await bcrypt.compare(data.password, trainer.user.password);
          if (!valid) throw new UnauthorizedException('Invalid mobile number or password');
          if (!trainer.user.isActive) throw new UnauthorizedException('Account is deactivated');
          userId = trainer.user.id;
          roleName = trainer.user.role?.rolename || 'TRAINER';
          displayEmail = trainer.email || trainer.user.email;
          displayName = trainer.name || trainer.user.name;
          gymId = trainer.gymId;
        }
      }

      // 3. Try GYM_OWNER by gym mobileNo / phoneNo
      if (!userId) {
        const gym = await prisma.gym.findFirst({
          where: { OR: [{ mobileNo: username }, { phoneNo: username }] },
          include: {
            owner: {
              include: {
                role: true,
                ownedGym: { include: { subscriptionPlan: true } },
              },
            },
            subscriptionPlan: true,
          },
        });

        if (gym?.owner) {
          const user = gym.owner;
          if (!user.isActive) throw new UnauthorizedException('Account is deactivated');
          const valid = await bcrypt.compare(data.password, user.password);
          if (!valid) throw new UnauthorizedException('Invalid mobile number or password');
          userId = user.id;
          roleName = user.role?.rolename || 'GYM_OWNER';
          displayEmail = user.email;
          displayName = user.name;
          ownedGym = user.ownedGym;
          gymId = gym.id;
          subscriptionName = gym.subscriptionPlan?.name;
        }
      }

      if (!userId) throw new UnauthorizedException('Invalid mobile number or password');
    }

    // ── Subscription check for GYM_OWNER ────────────────────────────────────
    if (roleName === 'GYM_OWNER' && ownedGym) {
      const gym = ownedGym;
      if (gym.subscriptionPlan && gym.subscriptionStart) {
        const subscriptionStartDate = new Date(gym.subscriptionStart);
        const durationDays = gym.subscriptionPlan.durationDays;
        const currentDate = new Date();
        const subscriptionEndDate = new Date(subscriptionStartDate);
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + durationDays);
        const effectiveEndDate = gym.subscriptionEnd ? new Date(gym.subscriptionEnd) : subscriptionEndDate;
        if (currentDate > effectiveEndDate) {
          throw new UnauthorizedException('Your subscription has expired. Please renew your plan or contact the administrator.');
        }
      } else if (!gym.subscriptionPlan) {
        throw new UnauthorizedException('No subscription plan assigned to your gym. Please contact the administrator.');
      }
    }

    // ── Generate tokens ──────────────────────────────────────────────────────
    const payload = { userId: userId!, role: roleName };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId!,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      user: {
        id: userId!,
        email: displayEmail,
        firstName: displayName.split(' ')[0] || displayName,
        lastName: displayName.split(' ').slice(1).join(' ') || '',
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
