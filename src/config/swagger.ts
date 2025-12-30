import swaggerJsdoc from 'swagger-jsdoc';
import config from './env';

const options: swaggerJsdoc.Options = {
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
        url: `http://localhost:${config.env.PORT}`, 
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

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
