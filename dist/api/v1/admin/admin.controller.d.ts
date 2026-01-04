import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../common/middleware';
declare class AdminController {
    getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getSubscriptionPlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getSubscriptionPlanById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createSubscriptionPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateSubscriptionPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteSubscriptionPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getGyms(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getGymById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createGym(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateGym(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteGym(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    toggleGymStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    assignGymOwner(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getGymOwners(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createGymOwner(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getOccupations(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getOccupationById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createOccupation(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateOccupation(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteOccupation(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getEnquiryTypes(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getEnquiryTypeById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createEnquiryType(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateEnquiryType(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteEnquiryType(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getPaymentTypes(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getPaymentTypeById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createPaymentType(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updatePaymentType(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deletePaymentType(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: AdminController;
export default _default;
//# sourceMappingURL=admin.controller.d.ts.map