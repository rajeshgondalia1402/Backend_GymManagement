"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = exports.Database = exports.prisma = exports.config = void 0;
var env_1 = require("./env");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return __importDefault(env_1).default; } });
var database_1 = require("./database");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return database_1.prisma; } });
Object.defineProperty(exports, "Database", { enumerable: true, get: function () { return __importDefault(database_1).default; } });
__exportStar(require("./jwt"), exports);
var swagger_1 = require("./swagger");
Object.defineProperty(exports, "swaggerSpec", { enumerable: true, get: function () { return __importDefault(swagger_1).default; } });
//# sourceMappingURL=index.js.map