// OpenAPI 3.0 specification generated from JSDoc annotations on route files.
// Served at /api/docs (Swagger UI) and /api/docs.json (raw spec).
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoNest API',
      version: '1.0.0',
      description: 'UK Housing & Rental Insights Platform API',
      contact: {
        name: 'EcoNest Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'Session Token',
        },
      },
    },
  },
  // Scan route files for @swagger JSDoc blocks
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
