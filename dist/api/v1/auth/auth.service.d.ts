import { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse, ChangePasswordRequest, UserProfile } from './auth.types';
declare class AuthService {
    login(data: LoginRequest): Promise<LoginResponse>;
    refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse>;
    logout(refreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    changePassword(userId: string, data: ChangePasswordRequest): Promise<void>;
    getProfile(userId: string): Promise<UserProfile>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map