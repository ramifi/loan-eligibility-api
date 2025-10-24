import { Router, Request, Response } from 'express';
import { AppDataSource } from '@config/database';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: Returns the health status of the API and database connection
 *     responses:
 *       200:
 *         description: Health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-12-01T10:30:00.000Z"
 *                 database:
 *                   type: string
 *                   enum: [connected, disconnected]
 *                   example: "connected"
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? 'connected' : 'disconnected'
  });
});

export default router;
