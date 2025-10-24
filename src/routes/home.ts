import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: API root endpoint
 *     tags: [General]
 *     description: Returns basic information about the Loan Eligibility API
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Loan Eligibility API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 status:
 *                   type: string
 *                   example: "running"
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Loan Eligibility API',
    version: '1.0.0',
    status: 'running'
  });
});

export default router;
