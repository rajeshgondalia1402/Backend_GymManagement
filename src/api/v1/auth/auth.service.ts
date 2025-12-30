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
        ownedGym: true 
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

    // Get gym ID based on role
    let gymId: string | undefined;
    if (user.ownedGym) {
      gymId = user.ownedGym.id;
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

    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: data.refreshToken,
        userId: decoded.userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found or expired');
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
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
