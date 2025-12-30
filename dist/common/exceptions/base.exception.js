"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictException = exports.ForbiddenException = exports.UnauthorizedException = exports.BadRequestException = exports.NotFoundException = exports.BaseException = void 0;
class BaseException extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BaseException = BaseException;
class NotFoundException extends BaseException {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundException = NotFoundException;
class BadRequestException extends BaseException {
    constructor(message = 'Bad request') {
        super(message, 400);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends BaseException {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends BaseException {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}
exports.ForbiddenException = ForbiddenException;
class ConflictException extends BaseException {
    constructor(message = 'Conflict') {
        super(message, 409);
    }
}
exports.ConflictException = ConflictException;
//# sourceMappingURL=base.exception.js.map