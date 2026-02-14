import { Response, NextFunction } from 'express';
import memberService from './member.service';
import { successResponse, paginatedResponse } from '../../../common/utils';
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

  // Get personal diet plan (MemberDietPlan)
  async getMyDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dietPlan = await memberService.getMyDietPlan(req.user!.id);
      successResponse(res, dietPlan, 'Personal diet plan retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get diet plan history
  async getMyDietPlanHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dietPlans = await memberService.getMyDietPlanHistory(req.user!.id);
      successResponse(res, dietPlans, 'Diet plan history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get my supplements (PT members only)
  async getMySupplements(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const supplements = await memberService.getMySupplements(req.user!.id);
      successResponse(res, supplements, 'Supplements retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get PT membership details
  async getMyPTMembership(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ptMembership = await memberService.getMyPTMembership(req.user!.id);
      successResponse(res, ptMembership, 'PT membership retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get assigned diet plans list with pagination and search
  async getMyDietPlanList(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search, sortBy, sortOrder, isActive } = req.query as any;
      const { dietPlans, total } = await memberService.getMyDietPlanList(req.user!.id, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
        isActive, // Already transformed to boolean by paginationSchema validation
      });
      paginatedResponse(res, dietPlans, Number(page), Number(limit), total, 'Diet plans retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get complete member details including payments, renewals, and membership info
  async getMyCompleteDetails(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const details = await memberService.getMyCompleteDetails(req.user!.id);
      successResponse(res, details, 'Member details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get comprehensive dashboard data
  async getComprehensiveDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dashboard = await memberService.getComprehensiveDashboard(req.user!.id);
      successResponse(res, dashboard, 'Dashboard retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new MemberController();
