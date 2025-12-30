export declare class BaseException extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export declare class NotFoundException extends BaseException {
    constructor(message?: string);
}
export declare class BadRequestException extends BaseException {
    constructor(message?: string);
}
export declare class UnauthorizedException extends BaseException {
    constructor(message?: string);
}
export declare class ForbiddenException extends BaseException {
    constructor(message?: string);
}
export declare class ConflictException extends BaseException {
    constructor(message?: string);
}
//# sourceMappingURL=base.exception.d.ts.map