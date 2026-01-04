// =============================================
// Trainer Controller - Request Handlers
// =============================================

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../common/middleware';
import { trainerService } from './trainer.service';
import { successResponse } from '../../../common/utils';
import { BadRequestException } from '../../../common/exceptions';

export class TrainerController {
  /**
   * GET /trainer/profile
   * Get trainer's own profile
   */
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.trainerId) {
        throw new BadRequestException('Trainer profile not found');
      }

      const profile = await trainerService.getProfile(req.user.trainerId);
      successResponse(res, profile, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /trainer/members
   * Get all members assigned to this trainer
   */
  async getAssignedMembers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.trainerId) {
        throw new BadRequestException('Trainer profile not found');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await trainerService.getAssignedMembers(req.user.trainerId, page, limit, search);
      successResponse(res, result, 'Members retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /trainer/members/:memberId
   * Get a specific member's details
   */
  async getMemberDetails(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.trainerId) {
        throw new BadRequestException('Trainer profile not found');
      }

      const { memberId } = req.params;
      const member = await trainerService.getMemberDetails(req.user.trainerId, memberId);
      successResponse(res, member, 'Member details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /trainer/diet-plans
   * Get all diet plans for trainer's gym
   */
  async getDietPlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.gymId) {
        throw new BadRequestException('Gym not found');
      }

      const plans = await trainerService.getDietPlans(req.user.gymId);
      successResponse(res, plans, 'Diet plans retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /trainer/exercise-plans
   * Get all exercise plans for trainer's gym
   */
  async getExercisePlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.gymId) {
        throw new BadRequestException('Gym not found');
      }

      const plans = await trainerService.getExercisePlans(req.user.gymId);
      successResponse(res, plans, 'Exercise plans retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /trainer/diet-plans
   * Create a new diet plan
   */
  async createDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.gymId) {
        throw new BadRequestException('Gym not found');
      }

      const plan = await trainerService.createDietPlan(req.user.gymId, req.body);
      successResponse(res, plan, 'Diet plan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /trainer/exercise-plans
   * Create a new exercise plan
   */
  async createExercisePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.gymId) {
        throw new BadRequestException('Gym not found');
      }

      const plan = await trainerService.createExercisePlan(req.user.gymId, req.body);
      successResponse(res, plan, 'Exercise plan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /trainer/diet-plans/:id
   * Update a diet plan
   */
  async updateDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.gymId) {
        throw new BadRequestException('Gym not found');
      }

      const { id } = req.params;
      const plan = await trainerService.updateDietPlan(id, req.user.gymId, req.body);
      successResponse(res, plan, 'Diet plan updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /trainer/exercise-plans/:id
   * Update an exercise plan
   */
  async updateExercisePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.gymId) {
        throw new BadRequestException('Gym not found');
      }

      const { id } = req.params;
      const plan = await trainerService.updateExercisePlan(id, req.user.gymId, req.body);
      successResponse(res, plan, 'Exercise plan updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /trainer/members/:memberId/diet-plans
   * Assign a diet plan to a member
   */
  async assignDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.trainerId) {
        throw new BadRequestException('Trainer profile not found');
      }

      const { memberId } = req.params;
      const { dietPlanId, startDate, endDate } = req.body;

      const assignment = await trainerService.assignDietPlan(
        req.user.trainerId,
        memberId,
        dietPlanId,
        startDate,
        endDate
      );
      successResponse(res, assignment, 'Diet plan assigned successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /trainer/members/:memberId/exercise-plans
   * Assign an exercise plan to a member
   */
  async assignExercisePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.trainerId) {
        throw new BadRequestException('Trainer profile not found');
      }

      const { memberId } = req.params;
      const { exercisePlanId, dayOfWeek, startDate, endDate } = req.body;

      const assignment = await trainerService.assignExercisePlan(
        req.user.trainerId,
        memberId,
        exercisePlanId,
        dayOfWeek,
        startDate,
        endDate
      );
      successResponse(res, assignment, 'Exercise plan assigned successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /trainer/members/:memberId/diet-assignments
   * Get member's diet assignments
   */
  async getMemberDietAssignments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.trainerId) {
        throw new BadRequestException('Trainer profile not found');
      }

      const { memberId } = req.params;
      const assignments = await trainerService.getMemberDietAssignments(req.user.trainerId, memberId);
      successResponse(res, assignments, 'Diet assignments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /trainer/members/:memberId/exercise-assignments
   * Get member's exercise assignments
   */
  async getMemberExerciseAssignments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.trainerId) {
        throw new BadRequestException('Trainer profile not found');
      }

      const { memberId } = req.params;
      const assignments = await trainerService.getMemberExerciseAssignments(req.user.trainerId, memberId);
      successResponse(res, assignments, 'Exercise assignments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /trainer/diet-assignments/:assignmentId
   * Remove a diet assignment
   */
  async removeDietAssignment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.trainerId) {
        throw new BadRequestException('Trainer profile not found');
      }

      const { assignmentId } = req.params;
      await trainerService.removeDietAssignment(req.user.trainerId, assignmentId);
      successResponse(res, null, 'Diet assignment removed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /trainer/exercise-assignments/:assignmentId
   * Remove an exercise assignment
   */
  async removeExerciseAssignment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.trainerId) {
        throw new BadRequestException('Trainer profile not found');
      }

      const { assignmentId } = req.params;
      await trainerService.removeExerciseAssignment(req.user.trainerId, assignmentId);
      successResponse(res, null, 'Exercise assignment removed successfully');
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // PT Member Methods
  // =============================================

  /**
   * GET /trainer/pt-members
   * Get PT members assigned to this trainer
   */
  async getPTMembers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.trainerId) {
        throw new BadRequestException('Trainer profile not found');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await trainerService.getPTMembers(req.user.trainerId, page, limit, search);
      successResponse(res, result, 'PT Members retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /trainer/pt-members/:id
   * Get PT member by ID
   */
  async getPTMemberById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.trainerId) {
        throw new BadRequestException('Trainer profile not found');
      }

      const { id } = req.params;
      const ptMember = await trainerService.getPTMemberById(req.user.trainerId, id);
      successResponse(res, ptMember, 'PT Member retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // Diet Plan Methods (Read-Only)
  // =============================================

  /**
   * GET /trainer/pt-members/:ptMemberId/diet-plans
   * Get diet plans for a PT member (read-only)
   */
  async getDietPlanForPTMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.trainerId) {
        throw new BadRequestException('Trainer profile not found');
      }

      const { ptMemberId } = req.params;
      const dietPlans = await trainerService.getDietPlanForPTMember(
        req.user.trainerId,
        ptMemberId
      );
      successResponse(res, dietPlans, 'Diet plans retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // Supplement Methods (Read-Only)
  // =============================================

  /**
   * GET /trainer/pt-members/:ptMemberId/supplements
   * Get supplements for a PT member (read-only)
   */
  async getSupplementsForPTMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.trainerId) {
        throw new BadRequestException('Trainer profile not found');
      }

      const { ptMemberId } = req.params;
      const supplements = await trainerService.getSupplementsForPTMember(
        req.user.trainerId,
        ptMemberId
      );
      successResponse(res, supplements, 'Supplements retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const trainerController = new TrainerController();
