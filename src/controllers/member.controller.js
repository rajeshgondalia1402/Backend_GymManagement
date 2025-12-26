const memberService = require('../services/member.service');
const { successResponse } = require('../utils/response.utils');

class MemberController {
  // Helper to get member ID from authenticated user
  getMemberId(req) {
    if (!req.user.memberProfile?.id) {
      throw { statusCode: 403, message: 'Member profile not found' };
    }
    return req.user.memberProfile.id;
  }

  async getDashboard(req, res, next) {
    try {
      const memberId = this.getMemberId(req);
      const dashboard = await memberService.getDashboard(memberId);
      return successResponse(res, dashboard);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const memberId = this.getMemberId(req);
      const profile = await memberService.getProfile(memberId);
      return successResponse(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async getAssignedTrainer(req, res, next) {
    try {
      const memberId = this.getMemberId(req);
      const trainer = await memberService.getAssignedTrainer(memberId);
      return successResponse(res, trainer);
    } catch (error) {
      next(error);
    }
  }

  async getDietPlan(req, res, next) {
    try {
      const memberId = this.getMemberId(req);
      const dietPlan = await memberService.getDietPlan(memberId);
      return successResponse(res, dietPlan);
    } catch (error) {
      next(error);
    }
  }

  async getExercisePlans(req, res, next) {
    try {
      const memberId = this.getMemberId(req);
      const exercisePlans = await memberService.getExercisePlans(memberId);
      return successResponse(res, exercisePlans);
    } catch (error) {
      next(error);
    }
  }

  async getTodayExercise(req, res, next) {
    try {
      const memberId = this.getMemberId(req);
      const exercise = await memberService.getTodayExercise(memberId);
      return successResponse(res, exercise);
    } catch (error) {
      next(error);
    }
  }

  async getMembershipStatus(req, res, next) {
    try {
      const memberId = this.getMemberId(req);
      const status = await memberService.getMembershipStatus(memberId);
      return successResponse(res, status);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MemberController();
