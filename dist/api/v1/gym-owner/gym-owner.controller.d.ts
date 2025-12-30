import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../common/middleware';
declare class GymOwnerController {
    private getGymId;
    getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getTrainers(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getTrainerById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createTrainer(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateTrainer(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteTrainer(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMembers(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMemberById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getDietPlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getDietPlanById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getExercisePlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getExercisePlanById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createExercisePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateExercisePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteExercisePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    assignDietPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    assignExercisePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    assignTrainer(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: GymOwnerController;
export default _default;
//# sourceMappingURL=gym-owner.controller.d.ts.map