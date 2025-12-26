const adminService = require('../services/admin.service');
const { successResponse, paginatedResponse } = require('../utils/response.utils');

class AdminController {
  // Dashboard
  async getDashboard(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }

  // Subscription Plans
  async createSubscriptionPlan(req, res, next) {
    try {
      const plan = await adminService.createSubscriptionPlan(req.body);
      return successResponse(res, plan, 'Subscription plan created', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllSubscriptionPlans(req, res, next) {
    try {
      const plans = await adminService.getAllSubscriptionPlans();
      return successResponse(res, plans);
    } catch (error) {
      next(error);
    }
  }

  async updateSubscriptionPlan(req, res, next) {
    try {
      const plan = await adminService.updateSubscriptionPlan(req.params.id, req.body);
      return successResponse(res, plan, 'Subscription plan updated');
    } catch (error) {
      next(error);
    }
  }

  async deleteSubscriptionPlan(req, res, next) {
    try {
      await adminService.deleteSubscriptionPlan(req.params.id);
      return successResponse(res, null, 'Subscription plan deleted');
    } catch (error) {
      next(error);
    }
  }

  // Gyms
  async createGym(req, res, next) {
    try {
      const gym = await adminService.createGym(req.body);
      return successResponse(res, gym, 'Gym created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllGyms(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const result = await adminService.getAllGyms(
        parseInt(page), 
        parseInt(limit), 
        search
      );
      return paginatedResponse(res, result.gyms, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getGymById(req, res, next) {
    try {
      const gym = await adminService.getGymById(req.params.id);
      return successResponse(res, gym);
    } catch (error) {
      next(error);
    }
  }

  async updateGym(req, res, next) {
    try {
      const gym = await adminService.updateGym(req.params.id, req.body);
      return successResponse(res, gym, 'Gym updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteGym(req, res, next) {
    try {
      await adminService.deleteGym(req.params.id);
      return successResponse(res, null, 'Gym deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleGymStatus(req, res, next) {
    try {
      const gym = await adminService.toggleGymStatus(req.params.id);
      return successResponse(res, gym, `Gym ${gym.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      next(error);
    }
  }

  // Gym Owners
  async createGymOwner(req, res, next) {
    try {
      const owner = await adminService.createGymOwner(req.body);
      return successResponse(res, owner, 'Gym owner created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async assignGymOwner(req, res, next) {
    try {
      const { ownerId } = req.body;
      const gym = await adminService.assignGymOwner(req.params.id, ownerId);
      return successResponse(res, gym, 'Gym owner assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllGymOwners(req, res, next) {
    try {
      const owners = await adminService.getAllGymOwners();
      return successResponse(res, owners);
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const user = await adminService.toggleUserStatus(req.params.id);
      return successResponse(res, user, `User ${user.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
