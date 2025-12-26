const gymOwnerService = require('../services/gymOwner.service');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response.utils');

class GymOwnerController {
  // Helper to get gym ID from authenticated user
  getGymId(req) {
    if (!req.user.ownedGym?.id) {
      throw { statusCode: 403, message: 'No gym assigned to this owner' };
    }
    return req.user.ownedGym.id;
  }

  // Dashboard
  async getDashboard(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const stats = await gymOwnerService.getDashboardStats(gymId);
      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }

  // Trainers
  async createTrainer(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const trainer = await gymOwnerService.createTrainer(gymId, req.body);
      return successResponse(res, trainer, 'Trainer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllTrainers(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const trainers = await gymOwnerService.getAllTrainers(gymId);
      return successResponse(res, trainers);
    } catch (error) {
      next(error);
    }
  }

  async getTrainerById(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const trainer = await gymOwnerService.getTrainerById(gymId, req.params.id);
      return successResponse(res, trainer);
    } catch (error) {
      next(error);
    }
  }

  async updateTrainer(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const trainer = await gymOwnerService.updateTrainer(gymId, req.params.id, req.body);
      return successResponse(res, trainer, 'Trainer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteTrainer(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteTrainer(gymId, req.params.id);
      return successResponse(res, null, 'Trainer deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Members
  async createMember(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const member = await gymOwnerService.createMember(gymId, req.body);
      return successResponse(res, member, 'Member created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllMembers(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, status } = req.query;
      const result = await gymOwnerService.getAllMembers(
        gymId,
        parseInt(page),
        parseInt(limit),
        status
      );
      return paginatedResponse(res, result.members, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getMemberById(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const member = await gymOwnerService.getMemberById(gymId, req.params.id);
      return successResponse(res, member);
    } catch (error) {
      next(error);
    }
  }

  async updateMember(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const member = await gymOwnerService.updateMember(gymId, req.params.id, req.body);
      return successResponse(res, member, 'Member updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteMember(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteMember(gymId, req.params.id);
      return successResponse(res, null, 'Member deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Diet Plans
  async createDietPlan(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const plan = await gymOwnerService.createDietPlan(gymId, req.body);
      return successResponse(res, plan, 'Diet plan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllDietPlans(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const plans = await gymOwnerService.getAllDietPlans(gymId);
      return successResponse(res, plans);
    } catch (error) {
      next(error);
    }
  }

  async updateDietPlan(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const plan = await gymOwnerService.updateDietPlan(gymId, req.params.id, req.body);
      return successResponse(res, plan, 'Diet plan updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteDietPlan(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteDietPlan(gymId, req.params.id);
      return successResponse(res, null, 'Diet plan deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Exercise Plans
  async createExercisePlan(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const plan = await gymOwnerService.createExercisePlan(gymId, req.body);
      return successResponse(res, plan, 'Exercise plan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllExercisePlans(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const plans = await gymOwnerService.getAllExercisePlans(gymId);
      return successResponse(res, plans);
    } catch (error) {
      next(error);
    }
  }

  async updateExercisePlan(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const plan = await gymOwnerService.updateExercisePlan(gymId, req.params.id, req.body);
      return successResponse(res, plan, 'Exercise plan updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteExercisePlan(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteExercisePlan(gymId, req.params.id);
      return successResponse(res, null, 'Exercise plan deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Assignments
  async assignTrainer(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const { memberId, trainerId } = req.body;
      const assignment = await gymOwnerService.assignTrainerToMember(gymId, memberId, trainerId);
      return successResponse(res, assignment, 'Trainer assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  async assignDietPlan(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const { memberId, dietPlanId, startDate, endDate } = req.body;
      const assignment = await gymOwnerService.assignDietPlanToMember(
        gymId, memberId, dietPlanId, startDate, endDate
      );
      return successResponse(res, assignment, 'Diet plan assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  async assignExercisePlan(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const { memberId, exercisePlanId, dayOfWeek, startDate, endDate } = req.body;
      const assignment = await gymOwnerService.assignExercisePlanToMember(
        gymId, memberId, exercisePlanId, dayOfWeek, startDate, endDate
      );
      return successResponse(res, assignment, 'Exercise plan assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  async removeAssignment(req, res, next) {
    try {
      const gymId = this.getGymId(req);
      const { type, id } = req.params;
      await gymOwnerService.removeAssignment(gymId, type, id);
      return successResponse(res, null, 'Assignment removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GymOwnerController();
