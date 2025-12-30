export interface JWTPayload {
    userId: string;
    role?: string;
}
export declare const generateAccessToken: (payload: JWTPayload) => string;
export declare const generateRefreshToken: (payload: JWTPayload) => string;
export declare const verifyAccessToken: (token: string) => JWTPayload | null;
export declare const verifyRefreshToken: (token: string) => JWTPayload | null;
export declare const getRefreshTokenExpiry: () => Date;
//# sourceMappingURL=jwt.d.ts.map