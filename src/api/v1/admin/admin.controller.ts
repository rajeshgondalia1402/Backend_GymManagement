import { Response, NextFunction } from 'express';
import adminService from './admin.service';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { AuthRequest } from '../../../common/middleware';

class AdminController {
  // Dashboard
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getDashboardStats();
      successResponse(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Subscription Plans
  async getSubscriptionPlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query as any;
      const { plans, total } = await adminService.getSubscriptionPlans({
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, plans, Number(page), Number(limit), total, 'Subscription plans retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptionPlanById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await adminService.getSubscriptionPlanById(req.params.id);
      successResponse(res, plan, 'Subscription plan retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createSubscriptionPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await adminService.createSubscriptionPlan(req.body);
      successResponse(res, plan, 'Subscription plan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateSubscriptionPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await adminService.updateSubscriptionPlan(req.params.id, req.body);
      successResponse(res, plan, 'Subscription plan updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteSubscriptionPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminService.deleteSubscriptionPlan(req.params.id);
      successResponse(res, null, 'Subscription plan deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Gyms
  async getGyms(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query as any;
      const { gyms, total } = await adminService.getGyms({
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, gyms, Number(page), Number(limit), total, 'Gyms retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getGymById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gym = await adminService.getGymById(req.params.id);
      successResponse(res, gym, 'Gym retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createGym(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gym = await adminService.createGym(req.body);
      successResponse(res, gym, 'Gym created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateGym(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gym = await adminService.updateGym(req.params.id, req.body);
      successResponse(res, gym, 'Gym updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteGym(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminService.deleteGym(req.params.id);
      successResponse(res, null, 'Gym deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleGymStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gym = await adminService.toggleGymStatus(req.params.id);
      successResponse(res, gym, 'Gym status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Gym Owners
  async getGymOwners(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query as any;
      const { owners, total } = await adminService.getGymOwners({
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, owners, Number(page), Number(limit), total, 'Gym owners retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createGymOwner(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const owner = await adminService.createGymOwner(req.body);
      successResponse(res, owner, 'Gym owner created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.toggleUserStatus(req.params.id);
      successResponse(res, result, 'User status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
