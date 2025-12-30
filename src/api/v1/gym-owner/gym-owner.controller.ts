import { Response, NextFunction } from 'express';
import gymOwnerService from './gym-owner.service';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { AuthRequest } from '../../../common/middleware';
import { BadRequestException } from '../../../common/exceptions';

class GymOwnerController {
  private getGymId(req: AuthRequest): string {
    if (!req.user?.gymId) {
      throw new BadRequestException('No gym associated with this account');
    }
    return req.user.gymId;
  }

  // Dashboard
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const stats = await gymOwnerService.getDashboardStats(gymId);
      successResponse(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Trainers
  async getTrainers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query as any;
      const { trainers, total } = await gymOwnerService.getTrainers(gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, trainers, Number(page), Number(limit), total, 'Trainers retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTrainerById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const trainer = await gymOwnerService.getTrainerById(gymId, req.params.id);
      successResponse(res, trainer, 'Trainer retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createTrainer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const trainer = await gymOwnerService.createTrainer(gymId, req.body);
      successResponse(res, trainer, 'Trainer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateTrainer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const trainer = await gymOwnerService.updateTrainer(gymId, req.params.id, req.body);
      successResponse(res, trainer, 'Trainer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteTrainer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteTrainer(gymId, req.params.id);
      successResponse(res, null, 'Trainer deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Members
  async getMembers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query as any;
      const { members, total } = await gymOwnerService.getMembers(gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, members, Number(page), Number(limit), total, 'Members retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMemberById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const member = await gymOwnerService.getMemberById(gymId, req.params.id);
      successResponse(res, member, 'Member retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const member = await gymOwnerService.createMember(gymId, req.body);
      successResponse(res, member, 'Member created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const member = await gymOwnerService.updateMember(gymId, req.params.id, req.body);
      successResponse(res, member, 'Member updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteMember(gymId, req.params.id);
      successResponse(res, null, 'Member deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Diet Plans
  async getDietPlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query as any;
      const { plans, total } = await gymOwnerService.getDietPlans(gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, plans, Number(page), Number(limit), total, 'Diet plans retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDietPlanById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const plan = await gymOwnerService.getDietPlanById(gymId, req.params.id);
      successResponse(res, plan, 'Diet plan retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const plan = await gymOwnerService.createDietPlan(gymId, req.body);
      successResponse(res, plan, 'Diet plan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const plan = await gymOwnerService.updateDietPlan(gymId, req.params.id, req.body);
      successResponse(res, plan, 'Diet plan updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteDietPlan(gymId, req.params.id);
      successResponse(res, null, 'Diet plan deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Exercise Plans
  async getExercisePlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query as any;
      const { plans, total } = await gymOwnerService.getExercisePlans(gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, plans, Number(page), Number(limit), total, 'Exercise plans retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getExercisePlanById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const plan = await gymOwnerService.getExercisePlanById(gymId, req.params.id);
      successResponse(res, plan, 'Exercise plan retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createExercisePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const plan = await gymOwnerService.createExercisePlan(gymId, req.body);
      successResponse(res, plan, 'Exercise plan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateExercisePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const plan = await gymOwnerService.updateExercisePlan(gymId, req.params.id, req.body);
      successResponse(res, plan, 'Exercise plan updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteExercisePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteExercisePlan(gymId, req.params.id);
      successResponse(res, null, 'Exercise plan deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Assignments
  async assignDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.assignDietPlan(gymId, req.body);
      successResponse(res, null, 'Diet plan assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  async assignExercisePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.assignExercisePlan(gymId, req.body);
      successResponse(res, null, 'Exercise plan assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  async assignTrainer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { memberId, trainerId } = req.body;
      const member = await gymOwnerService.assignTrainer(gymId, memberId, trainerId);
      successResponse(res, member, 'Trainer assigned successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new GymOwnerController();
