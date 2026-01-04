import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        gymId?: string;
        trainerId?: string;
        memberId?: string;
    };
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const authorizeGymAccess: (paramName?: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeOwnership: (resourceType: "member" | "trainer") => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeGymResource: (resourceType: "member" | "trainer" | "dietPlan" | "exercisePlan") => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map