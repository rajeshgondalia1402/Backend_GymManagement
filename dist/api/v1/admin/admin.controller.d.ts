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
    getGymOwners(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createGymOwner(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: AdminController;
export default _default;
//# sourceMappingURL=admin.controller.d.ts.map