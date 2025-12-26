const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return successResponse(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      return successResponse(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.logout(req.user.id, refreshToken);
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req, res, next) {
    try {
      const result = await authService.logoutAll(req.user.id);
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(
        req.user.id, 
        currentPassword, 
        newPassword
      );
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const result = await authService.getProfile(req.user.id);
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
