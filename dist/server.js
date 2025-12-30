"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const utils_1 = require("./common/utils");
const startServer = async () => {
    try {
        await config_1.Database.connect();
        const server = app_1.default.listen(config_1.config.env.PORT, () => {
            utils_1.logger.info(`🚀 Server is running on port ${config_1.config.env.PORT}`);
            utils_1.logger.info(`📚 API Documentation available at http://localhost:${config_1.config.env.PORT}/api-docs`);
            utils_1.logger.info(`🌍 Environment: ${config_1.config.env.NODE_ENV}`);
        });
        const gracefulShutdown = async (signal) => {
            utils_1.logger.info(`${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                utils_1.logger.info('HTTP server closed');
                await config_1.Database.disconnect();
                process.exit(0);
            });
            setTimeout(() => {
                utils_1.logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        utils_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map