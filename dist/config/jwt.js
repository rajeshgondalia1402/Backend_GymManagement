"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRefreshTokenExpiry = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("./env"));
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, env_1.default.env.JWT_SECRET, {
        expiresIn: env_1.default.env.JWT_EXPIRATION,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, env_1.default.env.JWT_REFRESH_SECRET, {
        expiresIn: env_1.default.env.JWT_REFRESH_EXPIRATION,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.default.env.JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.default.env.JWT_REFRESH_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const getRefreshTokenExpiry = () => {
    const expiresIn = env_1.default.env.JWT_REFRESH_EXPIRATION;
    const days = parseInt(expiresIn) || 7;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};
exports.getRefreshTokenExpiry = getRefreshTokenExpiry;
//# sourceMappingURL=jwt.js.map