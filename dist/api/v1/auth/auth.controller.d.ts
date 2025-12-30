import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../common/middleware';
declare class AuthController {
    login(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    refreshToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    logoutAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: AuthController;
export default _default;
//# sourceMappingURL=auth.controller.d.ts.map