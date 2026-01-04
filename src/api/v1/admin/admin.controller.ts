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

  async assignGymOwner(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ownerId } = req.body;
      const gym = await adminService.assignGymOwner(req.params.id, ownerId);
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

  async deleteOccupation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const occupation = await adminService.deleteOccupation(req.params.id);
      successResponse(res, occupation, 'Occupation deleted successfully (soft delete)');
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

  async deletePaymentType(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const paymentType = await adminService.deletePaymentType(req.params.id);
      successResponse(res, paymentType, 'Payment type deleted successfully (soft delete)');
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
