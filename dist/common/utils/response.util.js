"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.paginatedResponse = exports.successResponse = void 0;
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    const response = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(response);
};
exports.successResponse = successResponse;
const paginatedResponse = (res, items, page, limit, total, message = 'Success') => {
    const response = {
        success: true,
        message,
        data: {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        },
    };
    return res.status(200).json(response);
};
exports.paginatedResponse = paginatedResponse;
const errorResponse = (res, message = 'Error', statusCode = 500, error) => {
    const response = {
        success: false,
        message,
        error,
    };
    return res.status(statusCode).json(response);
};
exports.errorResponse = errorResponse;
//# sourceMappingURL=response.util.js.map