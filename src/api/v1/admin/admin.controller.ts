import { Response, NextFunction } from 'express';
import adminService from './admin.service';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { AuthRequest } from '../../../common/middleware';
import { getRelativeLogoPath, deleteOldLogo } from '../../../common/middleware/upload.middleware';

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
      const { page = 1, limit = 10, search, sortBy, sortOrder, subscriptionStatus } = req.query as any;
      const { gyms, total } = await adminService.getGyms({
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
        subscriptionStatus,
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

  async assignGymOwner(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ownerId, password } = req.body;
      const gym = await adminService.assignGymOwner(req.params.id, ownerId, password);
      successResponse(res, gym, 'Owner assigned to gym successfully');
    } catch (error) {
      next(error);
    }
  }

  async uploadGymLogo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = req.params.id;
      
      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded. Please upload a gym logo image.',
        });
        return;
      }

      // Get the gym to check if it exists and get old logo path
      const existingGym = await adminService.getGymById(gymId);
      
      // Delete old logo if exists
      if (existingGym.gymLogo) {
        deleteOldLogo(existingGym.gymLogo);
      }

      // Get relative path for the new logo
      const logoPath = getRelativeLogoPath(req.file.filename);

      // Update gym with new logo path
      const gym = await adminService.updateGym(gymId, { gymLogo: logoPath });

      successResponse(res, {
        gym,
        logoUrl: logoPath,
        message: 'Logo uploaded and saved successfully'
      }, 'Gym logo uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteGymLogo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = req.params.id;
      
      // Get the gym to check if it exists and get logo path
      const existingGym = await adminService.getGymById(gymId);
      
      // Delete the logo file if exists
      if (existingGym.gymLogo) {
        deleteOldLogo(existingGym.gymLogo);
      }

      // Update gym to remove logo path
      const gym = await adminService.updateGym(gymId, { gymLogo: undefined });

      successResponse(res, gym, 'Gym logo deleted successfully');
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

  async getGymOwnerById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const owner = await adminService.getGymOwnerById(req.params.id);
      successResponse(res, owner, 'Gym owner retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateGymOwner(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const owner = await adminService.updateGymOwner(req.params.id, req.body);
      successResponse(res, owner, 'Gym owner updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteGymOwner(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminService.deleteGymOwner(req.params.id);
      successResponse(res, null, 'Gym owner deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async resetGymOwnerPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.resetGymOwnerPassword(req.params.id);
      successResponse(res, result, 'Gym owner password reset successfully');
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

  // Occupation Master CRUD
  async getOccupations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const occupations = await adminService.getOccupations();
      successResponse(res, occupations, 'Occupations retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getOccupationById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const occupation = await adminService.getOccupationById(req.params.id);
      successResponse(res, occupation, 'Occupation retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createOccupation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const occupation = await adminService.createOccupation(req.body, req.user?.id);
      successResponse(res, occupation, 'Occupation created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateOccupation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const occupation = await adminService.updateOccupation(req.params.id, req.body);
      successResponse(res, occupation, 'Occupation updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getOccupationUsage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usage = await adminService.getOccupationUsage(req.params.id);
      successResponse(res, usage, 'Occupation usage retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteOccupation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const occupation = await adminService.deleteOccupation(req.params.id);
      successResponse(res, occupation, 'Occupation deleted successfully (soft delete)');
    } catch (error) {
      next(error);
    }
  }

  // Plan Category Master CRUD
  async getPlanCategories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await adminService.getPlanCategories();
      successResponse(res, categories, 'Plan categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPlanCategoryById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await adminService.getPlanCategoryById(req.params.id);
      successResponse(res, category, 'Plan category retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createPlanCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await adminService.createPlanCategory(req.body, req.user?.id);
      successResponse(res, category, 'Plan category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updatePlanCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await adminService.updatePlanCategory(req.params.id, req.body);
      successResponse(res, category, 'Plan category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPlanCategoryUsage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usage = await adminService.getPlanCategoryUsage(req.params.id);
      successResponse(res, usage, 'Plan category usage retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async deletePlanCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await adminService.deletePlanCategory(req.params.id);
      successResponse(res, category, 'Plan category deleted successfully (soft delete)');
    } catch (error) {
      next(error);
    }
  }

  // Enquiry Type Master CRUD
  async getEnquiryTypes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const enquiryTypes = await adminService.getEnquiryTypes();
      successResponse(res, enquiryTypes, 'Enquiry types retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getEnquiryTypeById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const enquiryType = await adminService.getEnquiryTypeById(req.params.id);
      successResponse(res, enquiryType, 'Enquiry type retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createEnquiryType(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const enquiryType = await adminService.createEnquiryType(req.body, req.user?.id);
      successResponse(res, enquiryType, 'Enquiry type created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateEnquiryType(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const enquiryType = await adminService.updateEnquiryType(req.params.id, req.body);
      successResponse(res, enquiryType, 'Enquiry type updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getEnquiryTypeUsage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usage = await adminService.getEnquiryTypeUsage(req.params.id);
      successResponse(res, usage, 'Enquiry type usage retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteEnquiryType(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const enquiryType = await adminService.deleteEnquiryType(req.params.id);
      successResponse(res, enquiryType, 'Enquiry type deleted successfully (soft delete)');
    } catch (error) {
      next(error);
    }
  }

  // Payment Type Master CRUD
  async getPaymentTypes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const paymentTypes = await adminService.getPaymentTypes();
      successResponse(res, paymentTypes, 'Payment types retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPaymentTypeById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const paymentType = await adminService.getPaymentTypeById(req.params.id);
      successResponse(res, paymentType, 'Payment type retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createPaymentType(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const paymentType = await adminService.createPaymentType(req.body, req.user?.id);
      successResponse(res, paymentType, 'Payment type created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updatePaymentType(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const paymentType = await adminService.updatePaymentType(req.params.id, req.body);
      successResponse(res, paymentType, 'Payment type updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPaymentTypeUsage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usage = await adminService.getPaymentTypeUsage(req.params.id);
      successResponse(res, usage, 'Payment type usage retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async deletePaymentType(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const paymentType = await adminService.deletePaymentType(req.params.id);
      successResponse(res, paymentType, 'Payment type deleted successfully (soft delete)');
    } catch (error) {
      next(error);
    }
  }

  // Gym Subscription History
  async renewGymSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await adminService.renewGymSubscription(req.params.gymId, req.body, req.user?.id);
      successResponse(res, record, 'Gym subscription renewed successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getGymSubscriptionHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search, sortBy, sortOrder, paymentStatus, renewalType } = req.query as any;
      const { history, total } = await adminService.getGymSubscriptionHistory(req.params.gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
        paymentStatus,
        renewalType,
      });
      paginatedResponse(res, history, Number(page), Number(limit), total, 'Gym subscription history retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getGymSubscriptionHistoryById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await adminService.getGymSubscriptionHistoryById(req.params.id);
      successResponse(res, record, 'Subscription history record retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Gym Inquiry
  async getGymInquiries(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search, sortBy, sortOrder, subscriptionPlanId, isActive } = req.query as any;
      const { inquiries, total } = await adminService.getGymInquiries({
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
        subscriptionPlanId,
        isActive,
      });
      paginatedResponse(res, inquiries, Number(page), Number(limit), total, 'Gym inquiries retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getGymInquiryById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const inquiry = await adminService.getGymInquiryById(req.params.id);
      successResponse(res, inquiry, 'Gym inquiry retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createGymInquiry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const inquiry = await adminService.createGymInquiry(req.body, req.user?.id);
      successResponse(res, inquiry, 'Gym inquiry created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateGymInquiry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const inquiry = await adminService.updateGymInquiry(req.params.id, req.body, req.user?.id);
      successResponse(res, inquiry, 'Gym inquiry updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleGymInquiryStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const inquiry = await adminService.toggleGymInquiryStatus(req.params.id);
      successResponse(res, inquiry, 'Gym inquiry status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getGymInquiryFollowups(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const followups = await adminService.getGymInquiryFollowups(req.params.id);
      successResponse(res, followups, 'Gym inquiry followups retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createGymInquiryFollowup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const followup = await adminService.createGymInquiryFollowup(req.params.id, req.body, req.user?.id);
      successResponse(res, followup, 'Gym inquiry followup created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // Admin Members List by Gym/GymOwner
  async getMembersByGymOrOwner(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy,
        sortOrder,
        gymId,
        gymOwnerId,
        membershipStatus,
        memberType,
        isActive,
      } = req.query as any;

      const { members, total } = await adminService.getMembersByGymOrOwner({
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
        gymId,
        gymOwnerId,
        membershipStatus,
        memberType,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });

      paginatedResponse(res, members, Number(page), Number(limit), total, 'Members retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
