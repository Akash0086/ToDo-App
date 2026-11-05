// swagger.ts  (or swagger-config.ts)
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo & Auth API',
      version: '1.0.0',
      description:
        'REST API with JWT authentication, refresh tokens (httpOnly cookie), ' +
        'and todo list management (CRUD with pagination, filtering & sorting)',
      contact: {
        name: 'Jai',
        // email: 'your.email@example.com',    // optional
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development / Local',
      },
      // Uncomment when you deploy
      // {
      //   url: 'https://api.yourdomain.com',
      //   description: 'Production',
      // },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'JWT Access Token obtained from /auth/login – put in Authorization header as: Bearer <token>',
        },

        //if you want to document the refresh cookie (recommended)
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refresh_token',
          description: 'httpOnly refresh token cookie (automatically sent by browser)',
        },
      },

      schemas: {

  Todo: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "task1712345678900"
      },
      task: {
        type: "string",
        example: "Finish project documentation"
      },
      category: {
        type: "string",
        example: "Work"
      },
      status: {
        type: "string",
        enum: ["pending", "in-progress", "completed"],
        example: "pending"
      },
      created_at: {
        type: "string",
        format: "date-time",
        example: "2026-03-13T10:20:30Z"
      },
      userId: {
        type: "integer",
        example: 6
      }
    }
  },

  TodoCreateResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "task1712345678900"
      },
      task: {
        type: "string",
        example: "Finish project documentation"
      },
      category: {
        type: "string",
        example: "Work"
      },
      status: {
        type: "string",
        example: "pending"
      }
    }
  },

  Pagination: {
    type: "object",
    properties: {
      page: {
        type: "integer",
        example: 1
      },
      limit: {
        type: "integer",
        example: 5
      },
      total: {
        type: "integer",
        example: 25
      },
      totalPages: {
        type: "integer",
        example: 5
      }
    }
  },

  TodoListResponse: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Todo"
        }
      },
      pagination: {
        $ref: "#/components/schemas/Pagination"
      }
    }
  },

  SuccessResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      }
    }
  },

  ErrorResponse: {
    type: "object",
    properties: {
      error: {
        type: "string",
        example: "Invalid request"
      }
    }
  },

  UnauthorizedError: {
    type: "object",
    properties: {
      error: {
        type: "string",
        example: "Unauthorized"
      }
    }
  }

}

      // Optional: move shared schemas here if you want them available everywhere
      // schemas: {
      //   ErrorResponse: { ... },
      //   Todo: { ... },
      //   // etc.
      // },
    },

    // Optional but very useful: global security (can be overridden per endpoint)
    // security: [
    //   { bearerAuth: [] },   // most endpoints require this
    // ],
  },

  // Where swagger-jsdoc should look for your @swagger comments
  apis: [
    // Root files (if any)
    './router.ts',           // if you have a main router.ts

    // Auth folder (login, register, etc.)
    './auth/*.ts',

    // If refresh & admin are in a "routes" folder (you wrote both ways)
    './routes/*.ts',         // catches refresh.ts + adminRoute.ts + future files

    // If they are directly in root or different folders, add them explicitly:
    // './refresh.ts',
    // './adminRoute.ts',

    // If you have the todos router in its own file/folder:
    // './todos/*.ts',       // or './routes/todos.ts' etc.
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;