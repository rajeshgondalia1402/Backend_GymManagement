export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        gymId?: string;
    };
    accessToken: string;
    refreshToken: string;
}
export interface RefreshTokenRequest {
    refreshToken: string;
}
export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    isActive: boolean;
    gymId?: string;
    gym?: {
        id: string;
        name: string;
    };
    createdAt: Date;
}
//# sourceMappingURL=auth.types.d.ts.map