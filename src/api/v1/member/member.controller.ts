import { Response, NextFunction } from 'express';
import memberService from './member.service';
import { successResponse } from '../../../common/utils';
import { AuthRequest } from '../../../common/middleware';

class MemberController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await memberService.getProfile(req.user!.id);
      successResponse(res, profile, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await memberService.updateProfile(req.user!.id, req.body);
      successResponse(res, profile, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await memberService.getDashboard(req.user!.id);
      successResponse(res, stats, 'Dashboard retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTrainer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const trainer = await memberService.getTrainer(req.user!.id);
      successResponse(res, trainer, 'Trainer retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dietPlan = await memberService.getDietPlan(req.user!.id);
      successResponse(res, dietPlan, 'Diet plan retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getExercisePlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const exercisePlans = await memberService.getExercisePlans(req.user!.id);
      successResponse(res, exercisePlans, 'Exercise plans retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMembership(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const membership = await memberService.getMembership(req.user!.id);
      successResponse(res, membership, 'Membership retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new MemberController();
