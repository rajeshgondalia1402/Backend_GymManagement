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
            },
            schemas: {
                Occupation: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Unique identifier'
                        },
                        occupationName: {
                            type: 'string',
                            description: 'Name of the occupation'
                        },
                        description: {
                            type: 'string',
                            nullable: true,
                            description: 'Description of the occupation'
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Active status'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        },
                        createdBy: {
                            type: 'string',
                            format: 'uuid',
                            nullable: true,
                            description: 'ID of the user who created this occupation'
                        }
                    }
                },
                EnquiryType: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Unique identifier'
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the enquiry type'
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Active status'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        },
                        createdBy: {
                            type: 'string',
                            format: 'uuid',
                            nullable: true,
                            description: 'ID of the user who created this enquiry type'
                        }
                    }
                },
                PaymentType: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Unique identifier'
                        },
                        paymentTypeName: {
                            type: 'string',
                            description: 'Name of the payment type'
                        },
                        description: {
                            type: 'string',
                            nullable: true,
                            description: 'Description of the payment type'
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Active status'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        },
                        createdBy: {
                            type: 'string',
                            format: 'uuid',
                            nullable: true,
                            description: 'ID of the user who created this payment type'
                        }
                    }
                },
                ExpenseGroup: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Unique identifier'
                        },
                        expenseGroupName: {
                            type: 'string',
                            description: 'Name of the expense group'
                        },
                        gymId: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID of the gym this expense group belongs to'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                Designation: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Unique identifier'
                        },
                        designationName: {
                            type: 'string',
                            description: 'Name of the designation'
                        },
                        gymId: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID of the gym this designation belongs to'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
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