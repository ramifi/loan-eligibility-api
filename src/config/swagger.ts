import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Loan Eligibility API',
      version: '1.0.0',
      description: 'A Node.js TypeScript API for loan eligibility assessment',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication'
        }
      },
      schemas: {
        LoanApplication: {
          type: 'object',
          required: ['applicantName', 'propertyAddress', 'creditScore', 'monthlyIncome', 'requestedAmount', 'loanTermMonths'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the loan application'
            },
            applicantName: {
              type: 'string',
              description: 'Full name of the loan applicant'
            },
            propertyAddress: {
              type: 'string',
              description: 'Address of the property for the loan'
            },
            creditScore: {
              type: 'number',
              minimum: 300,
              maximum: 850,
              description: 'Credit score of the applicant'
            },
            monthlyIncome: {
              type: 'number',
              minimum: 0,
              description: 'Monthly income of the applicant'
            },
            requestedAmount: {
              type: 'number',
              minimum: 0,
              description: 'Amount of loan requested'
            },
            loanTermMonths: {
              type: 'number',
              minimum: 1,
              description: 'Loan term in months'
            },
            eligible: {
              type: 'boolean',
              description: 'Whether the loan application is eligible'
            },
            reason: {
              type: 'string',
              description: 'Reason for eligibility decision'
            },
            crimeGrade: {
              type: 'string',
              enum: ['A', 'B', 'C', 'D', 'F'],
              description: 'Crime grade of the property area'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the application was created'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        CrimeGradeResult: {
          type: 'object',
          required: ['address', 'overall_grade'],
          properties: {
            address: {
              type: 'string',
              description: 'The address that was graded'
            },
            zip: {
              type: 'string',
              description: 'ZIP code of the address (optional)'
            },
            overall_grade: {
              type: 'string',
              enum: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
              description: 'Overall crime safety grade for the address'
            },
            components: {
              type: 'object',
              properties: {
                violent_crime: {
                  type: 'string',
                  enum: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
                  description: 'Grade for violent crime in the area'
                },
                property_crime: {
                  type: 'string',
                  enum: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
                  description: 'Grade for property crime in the area'
                }
              }
            },
            notes: {
              type: 'string',
              description: 'Additional notes about the crime analysis'
            },
            evidence: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  source: {
                    type: 'string',
                    description: 'Source of the evidence'
                  },
                  snippet: {
                    type: 'string',
                    description: 'Evidence snippet or description'
                  }
                },
                required: ['snippet']
              },
              description: 'Evidence supporting the crime grade'
            }
          }
        }
      }
    },
    security: [
      {
        ApiKeyAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts'] // Path to the API files
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Loan Eligibility API Documentation'
  }));
};

export default specs;
