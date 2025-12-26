const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  getRefreshTokenExpiry 
} = require('../utils/jwt.utils');

class AuthService {
  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        ownedGym: { select: { id: true, name: true } },
        memberProfile: { 
          select: { 
            id: true, 
            gymId: true,
            gym: { select: { id: true, name: true } }
          } 
        }
      }
    });

    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    if (!user.isActive) {
      throw { statusCode: 403, message: 'Account is deactivated' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry()
      }
    });

    // Prepare user data (exclude password)
    const { password: _, ...userData } = user;

    return {
      user: userData,
      accessToken,
      refreshToken
    };
  }

  async refreshToken(token) {
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw { statusCode: 401, message: 'Invalid refresh token' };
    }

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!storedToken) {
      throw { statusCode: 401, message: 'Refresh token not found' };
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw { statusCode: 401, message: 'Refresh token expired' };
    }

    if (!storedToken.user.isActive) {
      throw { statusCode: 403, message: 'Account is deactivated' };
    }

    // Generate new access token
    const accessToken = generateAccessToken({ 
      userId: storedToken.user.id, 
      role: storedToken.user.role 
    });

    return { accessToken };
  }

  async logout(userId, refreshToken) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken, userId }
      });
    }
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId) {
    await prisma.refreshToken.deleteMany({
      where: { userId }
    });
    return { message: 'Logged out from all devices' };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Current password is incorrect' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({ where: { userId } });

    return { message: 'Password changed successfully' };
  }

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        ownedGym: { select: { id: true, name: true } },
        memberProfile: {
          include: {
            gym: { select: { id: true, name: true } },
            trainerAssignments: {
              where: { isActive: true },
              include: {
                trainer: {
                  include: { user: { select: { name: true, email: true } } }
                }
              }
            },
            dietAssignments: {
              where: { isActive: true },
              include: { dietPlan: true }
            },
            exerciseAssignments: {
              where: { isActive: true },
              include: { exercisePlan: true }
            }
          }
        }
      }
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return user;
  }
}

module.exports = new AuthService();
