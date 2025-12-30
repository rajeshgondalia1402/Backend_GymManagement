"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = require("jsonwebtoken");
const exceptions_1 = require("../exceptions");
const response_util_1 = require("../utils/response.util");
const logger_util_1 = __importDefault(require("../utils/logger.util"));
const env_1 = __importDefault(require("../../config/env"));
const errorHandler = (err, req, res, next) => {
    logger_util_1.default.error(err);
    if (err instanceof exceptions_1.BaseException) {
        (0, response_util_1.errorResponse)(res, err.message, err.statusCode);
        return;
    }
    if (err instanceof zod_1.ZodError) {
        const errors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
        return;
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                (0, response_util_1.errorResponse)(res, 'A record with this value already exists', 409);
                return;
            case 'P2025':
                (0, response_util_1.errorResponse)(res, 'Record not found', 404);
                return;
            case 'P2003':
                (0, response_util_1.errorResponse)(res, 'Foreign key constraint failed', 400);
                return;
            default:
                (0, response_util_1.errorResponse)(res, 'Database error', 500);
                return;
        }
    }
    if (err instanceof jsonwebtoken_1.TokenExpiredError) {
        (0, response_util_1.errorResponse)(res, 'Token has expired', 401);
        return;
    }
    if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        (0, response_util_1.errorResponse)(res, 'Invalid token', 401);
        return;
    }
    const message = env_1.default.isDevelopment ? err.message : 'Internal server error';
    (0, response_util_1.errorResponse)(res, message, 500);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map