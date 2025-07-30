const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Course Management Platform API',
      version: '1.0.0',
      description: 'A comprehensive API for managing course allocations, facilitators, students, and activity tracking in an educational institution.',
      contact: {
        name: 'API Support',
        email: 'support@coursemanagement.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.coursemanagement.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            role: {
              type: 'string',
              enum: ['student', 'facilitator', 'manager'],
              description: 'User role in the system'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Student: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            userId: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            },
            classId: {
              type: 'string',
              format: 'uuid'
            },
            cohortId: {
              type: 'string',
              format: 'uuid'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Facilitator: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            userId: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            },
            qualification: {
              type: 'string'
            },
            location: {
              type: 'string'
            },
            managerId: {
              type: 'string',
              format: 'uuid'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Manager: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            userId: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Module: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            },
            half: {
              type: 'string',
              enum: ['H1', 'H2']
            }
          }
        },
        Class: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            },
            startDate: {
              type: 'string',
              format: 'date'
            },
            graduationDate: {
              type: 'string',
              format: 'date'
            }
          }
        },
        Cohort: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            }
          }
        },
        Mode: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              enum: ['Online', 'In-Person', 'Hybrid']
            }
          }
        },
        Allocation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            moduleId: {
              type: 'string',
              format: 'uuid'
            },
            classId: {
              type: 'string',
              format: 'uuid'
            },
            facilitatorId: {
              type: 'string',
              format: 'uuid'
            },
            modeId: {
              type: 'string',
              format: 'uuid'
            },
            trimester: {
              type: 'string',
              enum: ['HT1', 'HT2', 'FT']
            },
            year: {
              type: 'string',
              pattern: '^\\d{4}$'
            },
            module: {
              $ref: '#/components/schemas/Module'
            },
            facilitator: {
              $ref: '#/components/schemas/Facilitator'
            },
            mode: {
              $ref: '#/components/schemas/Mode'
            }
          }
        },
        ActivityLog: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            allocationId: {
              type: 'string',
              format: 'uuid'
            },
            week: {
              type: 'integer',
              minimum: 1
            },
            attendance: {
              type: 'array',
              items: {
                type: 'boolean'
              },
              description: 'Array of boolean values representing daily attendance'
            },
            formativeOneGrading: {
              type: 'string',
              enum: ['Done', 'Pending', 'Not Started']
            },
            formativeTwoGrading: {
              type: 'string',
              enum: ['Done', 'Pending', 'Not Started']
            },
            summativeGrading: {
              type: 'string',
              enum: ['Done', 'Pending', 'Not Started']
            },
            courseModeration: {
              type: 'string',
              enum: ['Done', 'Pending', 'Not Started']
            },
            intranetSync: {
              type: 'string',
              enum: ['Done', 'Pending', 'Not Started']
            },
            gradeBookStatus: {
              type: 'string',
              enum: ['Done', 'Pending', 'Not Started']
            },
            allocation: {
              $ref: '#/components/schemas/Allocation'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT token for authentication'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Detailed error information'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs; 