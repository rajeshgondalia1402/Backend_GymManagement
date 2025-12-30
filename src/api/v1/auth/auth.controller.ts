import { Response, NextFunction } from 'express';
import authService from './auth.service';
import { successResponse } from '../../../common/utils';
import { AuthRequest } from '../../../common/middleware';

class AuthController {
  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      successResponse(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.refreshToken(req.body);
      successResponse(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      successResponse(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logoutAll(req.user!.id);
      successResponse(res, null, 'Logged out from all devices');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.changePassword(req.user!.id, req.body);
      successResponse(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await authService.getProfile(req.user!.id);
      successResponse(res, profile, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
