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

      // Handle file uploads
      const files: { trainerPhoto?: string; idProofDocument?: string } = {};
      if (req.files && typeof req.files === 'object') {
        const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (uploadedFiles.trainerPhoto && uploadedFiles.trainerPhoto[0]) {
          files.trainerPhoto = `/uploads/trainer-photos/${uploadedFiles.trainerPhoto[0].filename}`;
        }
        if (uploadedFiles.idProofDocument && uploadedFiles.idProofDocument[0]) {
          files.idProofDocument = `/uploads/trainer-documents/${uploadedFiles.idProofDocument[0].filename}`;
        }
      }

      const trainer = await gymOwnerService.createTrainer(gymId, req.body, files);
      successResponse(res, trainer, 'Trainer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateTrainer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);

      // Handle file uploads
      const files: { trainerPhoto?: string; idProofDocument?: string } = {};
      if (req.files && typeof req.files === 'object') {
        const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (uploadedFiles.trainerPhoto && uploadedFiles.trainerPhoto[0]) {
          files.trainerPhoto = `/uploads/trainer-photos/${uploadedFiles.trainerPhoto[0].filename}`;
        }
        if (uploadedFiles.idProofDocument && uploadedFiles.idProofDocument[0]) {
          files.idProofDocument = `/uploads/trainer-documents/${uploadedFiles.idProofDocument[0].filename}`;
        }
      }

      const trainer = await gymOwnerService.updateTrainer(gymId, req.params.id, req.body, files);
      successResponse(res, trainer, 'Trainer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteTrainer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteTrainer(gymId, req.params.id);
      successResponse(res, null, 'Trainer deactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  async resetTrainerPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const result = await gymOwnerService.resetTrainerPassword(gymId, req.params.id);
      successResponse(res, result, 'Trainer password reset successfully');
    } catch (error) {
      next(error);
    }
  }

  async resetMemberPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const result = await gymOwnerService.resetMemberPassword(gymId, req.params.id);
      successResponse(res, result, 'Member password reset successfully');
    } catch (error) {
      next(error);
    }
  }


  // Members
  async getMembers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const {
        page = 1,
        limit = 10,
        search,
        sortBy,
        sortOrder,
        status,
        isActive,
        memberType,
        gender,
        bloodGroup,
        maritalStatus,
        smsFacility,
        membershipStartFrom,
        membershipStartTo,
        membershipEndFrom,
        membershipEndTo,
        coursePackageId,
      } = req.query as any;

      const { members, total } = await gymOwnerService.getMembers(gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
        status,
        isActive,
        memberType,
        gender,
        bloodGroup,
        maritalStatus,
        smsFacility,
        membershipStartFrom,
        membershipStartTo,
        membershipEndFrom,
        membershipEndTo,
        coursePackageId,
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

  async getMemberMembershipDetails(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const membershipDetails = await gymOwnerService.getMemberMembershipDetails(gymId, req.params.id);
      successResponse(res, membershipDetails, 'Member membership details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);

      // Handle file uploads
      const files: { memberPhoto?: string; idProofDocument?: string } = {};
      if (req.files && typeof req.files === 'object') {
        const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (uploadedFiles.memberPhoto && uploadedFiles.memberPhoto[0]) {
          files.memberPhoto = `/uploads/member-photos/${uploadedFiles.memberPhoto[0].filename}`;
        }
        if (uploadedFiles.idProofDocument && uploadedFiles.idProofDocument[0]) {
          files.idProofDocument = `/uploads/member-documents/${uploadedFiles.idProofDocument[0].filename}`;
        }
      }

      const member = await gymOwnerService.createMember(gymId, req.body, files);
      successResponse(res, member, 'Member created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);

      // Handle file uploads
      const files: { memberPhoto?: string; idProofDocument?: string } = {};
      if (req.files && typeof req.files === 'object') {
        const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (uploadedFiles.memberPhoto && uploadedFiles.memberPhoto[0]) {
          files.memberPhoto = `/uploads/member-photos/${uploadedFiles.memberPhoto[0].filename}`;
        }
        if (uploadedFiles.idProofDocument && uploadedFiles.idProofDocument[0]) {
          files.idProofDocument = `/uploads/member-documents/${uploadedFiles.idProofDocument[0].filename}`;
        }
      }

      const member = await gymOwnerService.updateMember(gymId, req.params.id, req.body, files);
      successResponse(res, member, 'Member updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteMember(gymId, req.params.id);
      successResponse(res, null, 'Member deactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleMemberStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const member = await gymOwnerService.toggleMemberStatus(gymId, req.params.id);
      successResponse(res, member, `Member ${member.isActive ? 'activated' : 'deactivated'} successfully`);
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

  // Toggle status methods
  async toggleTrainerStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const result = await gymOwnerService.toggleTrainerStatus(gymId, req.params.id);
      successResponse(res, result, `Trainer ${result.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // PT Member Methods
  // =============================================

  async getPTMembers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query as any;
      const { ptMembers, total } = await gymOwnerService.getPTMembers(gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, ptMembers, Number(page), Number(limit), total, 'PT Members retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPTMemberById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const ptMember = await gymOwnerService.getPTMemberById(gymId, req.params.id);
      successResponse(res, ptMember, 'PT Member retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /gym-owner/trainers/:trainerId/pt-members
   * Get all PT members assigned to a specific trainer
   */
  async getPTMembersByTrainerId(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { trainerId } = req.params;
      const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query as any;

      const { ptMembers, total, trainer } = await gymOwnerService.getPTMembersByTrainerId(gymId, trainerId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: 'PT Members retrieved successfully',
        data: {
          trainer,
          items: ptMembers,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createPTMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const ptMember = await gymOwnerService.createPTMember(gymId, userId, req.body);
      successResponse(res, ptMember, 'PT Member created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updatePTMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const ptMember = await gymOwnerService.updatePTMember(gymId, userId, req.params.id, req.body);
      successResponse(res, ptMember, 'PT Member updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // Supplement Methods
  // =============================================

  async getSupplements(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const supplements = await gymOwnerService.getSupplements(gymId, req.params.ptMemberId);
      successResponse(res, supplements, 'Supplements retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createSupplement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const supplement = await gymOwnerService.createSupplement(gymId, userId, req.params.ptMemberId, req.body);
      successResponse(res, supplement, 'Supplement created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateSupplement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const supplement = await gymOwnerService.updateSupplement(gymId, userId, req.params.id, req.body);
      successResponse(res, supplement, 'Supplement updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // Member Diet Plan Methods (per member)
  // =============================================

  async getMemberDietPlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const plans = await gymOwnerService.getMemberDietPlans(gymId, req.params.memberId);
      successResponse(res, plans, 'Member diet plans retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createMemberDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const plan = await gymOwnerService.createMemberDietPlan(gymId, userId, req.params.memberId, req.body);
      successResponse(res, plan, 'Member diet plan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateMemberDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const plan = await gymOwnerService.updateMemberDietPlan(gymId, userId, req.params.id, req.body);
      successResponse(res, plan, 'Member diet plan updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // Inquiry Methods
  // =============================================

  async getInquiries(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, search, sortBy, sortOrder, status } = req.query as any;
      const { inquiries, total } = await gymOwnerService.getInquiries(gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
        status,
      });
      paginatedResponse(res, inquiries, Number(page), Number(limit), total, 'Inquiries retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createInquiry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const inquiry = await gymOwnerService.createInquiry(gymId, userId, req.body);
      successResponse(res, inquiry, 'Inquiry created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateInquiry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const inquiry = await gymOwnerService.updateInquiry(gymId, userId, req.params.id, req.body);
      successResponse(res, inquiry, 'Inquiry updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // Report Methods
  // =============================================

  async getMemberReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const report = await gymOwnerService.getMemberReport(gymId);
      successResponse(res, report, 'Member report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPTProgressReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const report = await gymOwnerService.getPTProgressReport(gymId);
      successResponse(res, report, 'PT progress report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTrainerReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const report = await gymOwnerService.getTrainerReport(gymId);
      successResponse(res, report, 'Trainer report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRevenueReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const report = await gymOwnerService.getRevenueReport(gymId);
      successResponse(res, report, 'Revenue report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Expense Group Master CRUD
  async getExpenseGroups(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const expenseGroups = await gymOwnerService.getExpenseGroups(gymId);
      successResponse(res, expenseGroups, 'Expense groups retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getExpenseGroupById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const expenseGroup = await gymOwnerService.getExpenseGroupById(gymId, req.params.id);
      successResponse(res, expenseGroup, 'Expense group retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createExpenseGroup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const expenseGroup = await gymOwnerService.createExpenseGroup(gymId, req.body);
      successResponse(res, expenseGroup, 'Expense group created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateExpenseGroup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const expenseGroup = await gymOwnerService.updateExpenseGroup(gymId, req.params.id, req.body);
      successResponse(res, expenseGroup, 'Expense group updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteExpenseGroup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteExpenseGroup(gymId, req.params.id);
      successResponse(res, null, 'Expense group deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // Expense Management CRUD
  // =============================================

  async createExpense(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;

      // Handle file uploads
      let attachmentPaths: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        attachmentPaths = req.files.map((file: Express.Multer.File) =>
          `/uploads/expense-attachments/${file.filename}`
        );
      }

      const expense = await gymOwnerService.createExpense(gymId, userId, req.body, attachmentPaths);
      successResponse(res, expense, 'Expense created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateExpense(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);

      // Handle new file uploads
      let newAttachmentPaths: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        newAttachmentPaths = req.files.map((file: Express.Multer.File) =>
          `/uploads/expense-attachments/${file.filename}`
        );
      }

      const expense = await gymOwnerService.updateExpense(
        gymId,
        req.params.id,
        req.body,
        newAttachmentPaths.length > 0 ? newAttachmentPaths : undefined
      );
      successResponse(res, expense, 'Expense updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteExpense(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.softDeleteExpense(gymId, req.params.id);
      successResponse(res, null, 'Expense deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getExpenseById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const expense = await gymOwnerService.getExpenseById(gymId, req.params.id);
      successResponse(res, expense, 'Expense retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getExpenses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const params = req.query as any;
      const result = await gymOwnerService.getExpenses(gymId, params);

      // Return paginated response with summary
      res.status(200).json({
        status: 'success',
        message: 'Expenses retrieved successfully',
        data: result.expenses,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
        summary: {
          totalAmount: result.totalAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Designation Master CRUD
  async getDesignations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const designations = await gymOwnerService.getDesignations(gymId);
      successResponse(res, designations, 'Designations retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDesignationById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const designation = await gymOwnerService.getDesignationById(gymId, req.params.id);
      successResponse(res, designation, 'Designation retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createDesignation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const designation = await gymOwnerService.createDesignation(gymId, req.body);
      successResponse(res, designation, 'Designation created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateDesignation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const designation = await gymOwnerService.updateDesignation(gymId, req.params.id, req.body);
      successResponse(res, designation, 'Designation updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteDesignation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteDesignation(gymId, req.params.id);
      successResponse(res, null, 'Designation deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Body Part Master CRUD
  async getBodyParts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const bodyParts = await gymOwnerService.getBodyParts(gymId);
      successResponse(res, bodyParts, 'Body parts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getBodyPartById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const bodyPart = await gymOwnerService.getBodyPartById(gymId, req.params.id);
      successResponse(res, bodyPart, 'Body part retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createBodyPart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const bodyPart = await gymOwnerService.createBodyPart(gymId, req.body);
      successResponse(res, bodyPart, 'Body part created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateBodyPart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const bodyPart = await gymOwnerService.updateBodyPart(gymId, req.params.id, req.body);
      successResponse(res, bodyPart, 'Body part updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteBodyPart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteBodyPart(gymId, req.params.id);
      successResponse(res, null, 'Body part deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Workout Exercise Master CRUD
  async getWorkoutExercises(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const exercises = await gymOwnerService.getWorkoutExercises(gymId);
      successResponse(res, exercises, 'Workout exercises retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getWorkoutExerciseById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const exercise = await gymOwnerService.getWorkoutExerciseById(gymId, req.params.id);
      successResponse(res, exercise, 'Workout exercise retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createWorkoutExercise(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const exercise = await gymOwnerService.createWorkoutExercise(gymId, req.body);
      successResponse(res, exercise, 'Workout exercise created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateWorkoutExercise(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const exercise = await gymOwnerService.updateWorkoutExercise(gymId, req.params.id, req.body);
      successResponse(res, exercise, 'Workout exercise updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleWorkoutExerciseStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const exercise = await gymOwnerService.toggleWorkoutExerciseStatus(gymId, req.params.id);
      successResponse(res, exercise, `Workout exercise ${exercise.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  // Member Inquiry CRUD
  async getMemberInquiries(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query as any;
      const { inquiries, total } = await gymOwnerService.getMemberInquiries(gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, inquiries, Number(page), Number(limit), total, 'Member inquiries retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMemberInquiriesByUserId(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.params.userId;
      const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query as any;
      const { inquiries, total } = await gymOwnerService.getMemberInquiriesByUserId(gymId, userId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, inquiries, Number(page), Number(limit), total, 'Member inquiries retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMemberInquiryById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const inquiry = await gymOwnerService.getMemberInquiryById(gymId, req.params.id);
      successResponse(res, inquiry, 'Member inquiry retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createMemberInquiry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const inquiry = await gymOwnerService.createMemberInquiry(gymId, userId, req.body);
      successResponse(res, inquiry, 'Member inquiry created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateMemberInquiry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const inquiry = await gymOwnerService.updateMemberInquiry(gymId, req.params.id, userId, req.body);
      successResponse(res, inquiry, 'Member inquiry updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteMemberInquiry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteMemberInquiry(gymId, req.params.id);
      successResponse(res, null, 'Member inquiry deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleMemberInquiryStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const inquiry = await gymOwnerService.toggleMemberInquiryStatus(gymId, req.params.id);
      successResponse(res, inquiry, `Member inquiry ${inquiry.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // Course Package Methods
  // =============================================

  async getAllActiveCoursePackages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const packages = await gymOwnerService.getAllActiveCoursePackages(gymId);
      successResponse(res, packages, 'Active course packages retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCoursePackages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, search, sortBy, sortOrder, isActive, coursePackageType } = req.query as any;
      const { packages, total } = await gymOwnerService.getCoursePackages(gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        coursePackageType: coursePackageType || undefined,
      });
      paginatedResponse(res, packages, Number(page), Number(limit), total, 'Course packages retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCoursePackageById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const coursePackage = await gymOwnerService.getCoursePackageById(gymId, req.params.id);
      successResponse(res, coursePackage, 'Course package retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createCoursePackage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const coursePackage = await gymOwnerService.createCoursePackage(gymId, userId, req.body);
      successResponse(res, coursePackage, 'Course package created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateCoursePackage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const coursePackage = await gymOwnerService.updateCoursePackage(gymId, userId, req.params.id, req.body);
      successResponse(res, coursePackage, 'Course package updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteCoursePackage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      await gymOwnerService.deleteCoursePackage(gymId, req.params.id);
      successResponse(res, null, 'Course package deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleCoursePackageStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const coursePackage = await gymOwnerService.toggleCoursePackageStatus(gymId, req.params.id);
      successResponse(res, coursePackage, `Course package ${coursePackage.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  async getCoursePackageWithActiveMembers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const result = await gymOwnerService.getCoursePackageWithActiveMembers(gymId, req.params.id);
      successResponse(res, result, 'Course package with active members retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // Member Balance Payment Methods
  // =============================================

  async createMemberBalancePayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const payment = await gymOwnerService.createMemberBalancePayment(gymId, userId, req.params.memberId, req.body);
      successResponse(res, payment, 'Balance payment created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateMemberBalancePayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const payment = await gymOwnerService.updateMemberBalancePayment(gymId, userId, req.params.id, req.body);
      successResponse(res, payment, 'Balance payment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMemberBalancePaymentById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const payment = await gymOwnerService.getMemberBalancePaymentById(gymId, req.params.id);
      successResponse(res, payment, 'Balance payment retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMemberBalancePayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const result = await gymOwnerService.getMemberBalancePayments(gymId, req.params.memberId);
      successResponse(res, result, 'Member balance payments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllMemberBalancePayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query as any;
      const { payments, total } = await gymOwnerService.getAllMemberBalancePayments(gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, payments, Number(page), Number(limit), total, 'Balance payments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // Membership Renewal Methods
  // =============================================

  async createMembershipRenewal(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const renewal = await gymOwnerService.createMembershipRenewal(gymId, userId, req.body);
      successResponse(res, renewal, 'Membership renewed successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getMembershipRenewals(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const {
        page = 1,
        limit = 10,
        search,
        sortBy,
        sortOrder,
        renewalType,
        paymentStatus,
        renewalDateFrom,
        renewalDateTo,
      } = req.query as any;

      const { renewals, total } = await gymOwnerService.getMembershipRenewals(gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
        renewalType,
        paymentStatus,
        renewalDateFrom,
        renewalDateTo,
      });
      paginatedResponse(res, renewals, Number(page), Number(limit), total, 'Membership renewals retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMembershipRenewalById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const renewal = await gymOwnerService.getMembershipRenewalById(gymId, req.params.id);
      successResponse(res, renewal, 'Membership renewal retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMemberRenewalHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const history = await gymOwnerService.getMemberRenewalHistory(gymId, req.params.memberId);
      successResponse(res, history, 'Member renewal history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateMembershipRenewal(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const renewal = await gymOwnerService.updateMembershipRenewal(gymId, userId, req.params.id, req.body);
      successResponse(res, renewal, 'Membership renewal updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRenewalRateReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const report = await gymOwnerService.getRenewalRateReport(gymId);
      successResponse(res, report, 'Renewal rate report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // PT Addon Management Methods
  // =============================================

  // Add PT addon to existing member
  async addPTAddon(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const member = await gymOwnerService.addPTAddon(gymId, userId, req.params.memberId, req.body);
      successResponse(res, member, 'PT addon added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // Update PT addon for existing member
  async updatePTAddon(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const member = await gymOwnerService.updatePTAddon(gymId, userId, req.params.memberId, req.body);
      successResponse(res, member, 'PT addon updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Remove PT addon from member
  async removePTAddon(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const member = await gymOwnerService.removePTAddon(gymId, userId, req.params.memberId, req.body);
      successResponse(res, member, 'PT addon removed successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get combined payment summary for member
  async getMemberPaymentSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const summary = await gymOwnerService.getMemberPaymentSummary(gymId, req.params.memberId);
      successResponse(res, summary, 'Member payment summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get session credits for a member
  async getMemberSessionCredits(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const credits = await gymOwnerService.getMemberSessionCredits(gymId, req.params.memberId);
      successResponse(res, credits, 'Member session credits retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // Diet Template Methods
  // =============================================

  // Create a new diet template
  async createDietTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const template = await gymOwnerService.createDietTemplate(gymId, userId, req.body);
      successResponse(res, template, 'Diet template created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // Get all diet templates
  async getDietTemplates(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, search, sortBy, sortOrder, mealsPerDay, isActive } = req.query as any;
      const { templates, total } = await gymOwnerService.getDietTemplates(gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
        mealsPerDay,
        isActive,
      });
      paginatedResponse(res, templates, Number(page), Number(limit), total, 'Diet templates retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get a single diet template by ID
  async getDietTemplateById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const template = await gymOwnerService.getDietTemplateById(gymId, req.params.id);
      successResponse(res, template, 'Diet template retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Update a diet template
  async updateDietTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const template = await gymOwnerService.updateDietTemplate(gymId, req.params.id, req.body);
      successResponse(res, template, 'Diet template updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Toggle diet template active status
  async toggleDietTemplateActive(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      let { isActive } = req.body;
      
      // If isActive is not provided, fetch current status and toggle it
      if (isActive === undefined || isActive === null) {
        const currentTemplate = await gymOwnerService.getDietTemplateById(gymId, req.params.id);
        isActive = !currentTemplate.isActive;
      }
      
      const template = await gymOwnerService.toggleDietTemplateActive(gymId, req.params.id, isActive);
      successResponse(res, template, `Diet template ${template.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // Member Diet Methods
  // =============================================

  // Assign diet to multiple members
  async createMemberDiet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = req.user!.id;
      const memberDiets = await gymOwnerService.createMemberDiet(gymId, userId, req.body);
      const memberCount = memberDiets.length;
      successResponse(res, memberDiets, `Diet assigned to ${memberCount} member${memberCount > 1 ? 's' : ''} successfully`, 201);
    } catch (error) {
      next(error);
    }
  }

  // Get all diets for a member
  async getMemberDiets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, sortBy, sortOrder } = req.query as any;
      const { diets, total } = await gymOwnerService.getMemberDiets(gymId, req.params.memberUuid, {
        page: Number(page),
        limit: Number(limit),
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, diets, Number(page), Number(limit), total, 'Member diets retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get a single member diet by ID
  async getMemberDietById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const memberDiet = await gymOwnerService.getMemberDietById(gymId, req.params.id);
      successResponse(res, memberDiet, 'Member diet retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Update a member diet
  async updateMemberDiet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const memberDiet = await gymOwnerService.updateMemberDiet(gymId, req.params.id, req.body);
      successResponse(res, memberDiet, 'Member diet updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Deactivate a member diet
  async deactivateMemberDiet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { reason } = req.body;
      const memberDiet = await gymOwnerService.deactivateMemberDiet(gymId, req.params.id, reason);
      successResponse(res, memberDiet, 'Member diet deactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Remove multiple assigned members from diet templates (bulk delete)
  async removeAssignedMembers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { memberDietIds } = req.body;
      const result = await gymOwnerService.removeAssignedMembers(gymId, memberDietIds);
      successResponse(res, result, `${result.deletedCount} assigned member(s) removed successfully`);
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // Trainer Salary Settlement Methods
  // =============================================

  // Get trainers dropdown for salary settlement
  async getTrainersDropdown(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const trainers = await gymOwnerService.getTrainersDropdown(gymId);
      successResponse(res, trainers, 'Trainers retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Calculate salary for a trainer
  async calculateSalary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const calculation = await gymOwnerService.calculateSalary(gymId, req.body);
      successResponse(res, calculation, 'Salary calculated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Create salary settlement
  async createSalarySettlement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const createdBy = req.user?.id;
      if (!createdBy) {
        throw new BadRequestException('User ID not found');
      }
      const settlement = await gymOwnerService.createSalarySettlement(gymId, createdBy, req.body);
      successResponse(res, settlement, 'Salary settlement created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // Get salary settlements list
  async getSalarySettlements(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const result = await gymOwnerService.getSalarySettlements(gymId, req.query as any);
      // Using successResponse with custom structure since we need to include totalAmount
      res.status(200).json({
        success: true,
        message: 'Salary settlements retrieved successfully',
        data: {
          items: result.settlements,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: Math.ceil(result.total / result.limit),
          },
          totalAmount: result.totalAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get salary settlement by ID
  async getSalarySettlementById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const settlement = await gymOwnerService.getSalarySettlementById(gymId, req.params.id);
      successResponse(res, settlement, 'Salary settlement retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Update salary settlement
  async updateSalarySettlement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const settlement = await gymOwnerService.updateSalarySettlement(gymId, req.params.id, req.body);
      successResponse(res, settlement, 'Salary settlement updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Generate salary slip (accessible by GYM_OWNER for any trainer)
  async generateSalarySlip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const salarySlip = await gymOwnerService.generateSalarySlip(gymId, req.params.id);
      successResponse(res, salarySlip, 'Salary slip generated successfully');
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // Gym Subscription History Methods
  // =============================================

  async getMySubscriptionHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, sortBy, sortOrder } = req.query as any;
      const { history, total } = await gymOwnerService.getMySubscriptionHistory(gymId, {
        page: Number(page),
        limit: Number(limit),
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, history, Number(page), Number(limit), total, 'Subscription history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCurrentSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const subscription = await gymOwnerService.getCurrentSubscription(gymId);
      successResponse(res, subscription, 'Current subscription retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new GymOwnerController();
