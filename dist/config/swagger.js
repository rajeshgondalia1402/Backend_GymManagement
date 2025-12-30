"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const env_1 = __importDefault(require("./env"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Gym Management API',
            version: '1.0.0',
            description: 'API documentation for the Gym Management System',
            contact: {
                name: 'API Support',
                email: 'support@gymmanagement.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${env_1.default.env.PORT}`,
                description: 'Local Development Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                }
            }
        },
        tags: [
            { name: 'Authentication', description: 'User authentication endpoints' },
            { name: 'Admin', description: 'Admin operations' },
            { name: 'Gym Owner', description: 'Gym owner operations' },
            { name: 'Member', description: 'Member operations' }
        ]
    },
    apis: ['./src/api/**/*.ts']
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
//# sourceMappingURL=swagger.js.map