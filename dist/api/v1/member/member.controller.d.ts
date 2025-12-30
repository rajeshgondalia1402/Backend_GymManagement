import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../common/middleware';
declare class MemberController {
    getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getTrainer(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getExercisePlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMembership(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: MemberController;
export default _default;
//# sourceMappingURL=member.controller.d.ts.map