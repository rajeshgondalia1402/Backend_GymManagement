"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../../../config/database");
const jwt_1 = require("../../../config/jwt");
const exceptions_1 = require("../../../common/exceptions");
class AuthService {
    async login(data) {
        const user = await database_1.prisma.user.findUnique({
            where: { email: data.email },
            include: {
                role: true,
                ownedGym: true
            },
        });
        if (!user) {
            throw new exceptions_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.isActive) {
            throw new exceptions_1.UnauthorizedException('Account is deactivated');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new exceptions_1.UnauthorizedException('Invalid email or password');
        }
        const roleName = user.role?.rolename || 'MEMBER';
        const payload = { userId: user.id, role: roleName };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        await database_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: (0, jwt_1.getRefreshTokenExpiry)(),
            },
        });
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
    async refreshToken(data) {
        const decoded = (0, jwt_1.verifyRefreshToken)(data.refreshToken);
        if (!decoded) {
            throw new exceptions_1.UnauthorizedException('Invalid refresh token');
        }
        const storedToken = await database_1.prisma.refreshToken.findFirst({
            where: {
                token: data.refreshToken,
                userId: decoded.userId,
                expiresAt: { gt: new Date() },
            },
        });
        if (!storedToken) {
            throw new exceptions_1.UnauthorizedException('Refresh token not found or expired');
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { role: true },
        });
        if (!user || !user.isActive) {
            throw new exceptions_1.UnauthorizedException('User not found or deactivated');
        }
        await database_1.prisma.refreshToken.delete({ where: { id: storedToken.id } });
        const roleName = user.role?.rolename || 'MEMBER';
        const payload = { userId: user.id, role: roleName };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(payload);
        await database_1.prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: user.id,
                expiresAt: (0, jwt_1.getRefreshTokenExpiry)(),
            },
        });
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(refreshToken) {
        await database_1.prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });
    }
    async logoutAll(userId) {
        await database_1.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }
    async changePassword(userId, data) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new exceptions_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(data.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new exceptions_1.BadRequestException('Current password is incorrect');
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.newPassword, 10);
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        await this.logoutAll(userId);
    }
    async getProfile(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: true,
                ownedGym: { select: { id: true, name: true } }
            },
        });
        if (!user) {
            throw new exceptions_1.NotFoundException('User not found');
        }
        let gymId;
        let gym;
        let phone;
        if (user.ownedGym) {
            gymId = user.ownedGym.id;
            gym = { id: user.ownedGym.id, name: user.ownedGym.name };
        }
        else {
            const member = await database_1.prisma.member.findUnique({
                where: { userId: user.id },
                include: { gym: { select: { id: true, name: true } } }
            });
            if (member) {
                gymId = member.gymId;
                gym = { id: member.gym.id, name: member.gym.name };
                phone = member.phone || undefined;
            }
            else {
                const trainer = await database_1.prisma.trainer.findUnique({
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
exports.default = new AuthService();
//# sourceMappingURL=auth.service.js.map