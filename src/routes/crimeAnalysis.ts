import { Router, Request, Response, NextFunction } from 'express';
import { CrimeAnalysisService } from '../services/CrimeAnalysisService';
import { authenticateApiKey } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateApiKey);

/**
 * @swagger
 * /crime-analysis:
 *   post:
 *     summary: Analyze crime grade for a given address
 *     tags: [Crime Analysis]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *                 description: Property address to analyze
 *                 example: "123 Main St, New York, NY 10001"
 *     responses:
 *       200:
 *         description: Crime analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 crimeGrade:
 *                   type: string
 *                   description: Crime grade (A-F)
 *                   example: "B"
 *                 crimeScore:
 *                   type: number
 *                   description: Numeric crime score
 *                   example: 75
 *                 confidence:
 *                   type: number
 *                   description: Confidence level (0-1)
 *                   example: 0.8
 *                 source:
 *                   type: string
 *                   description: Data source used
 *                   example: "crimegrade.org"
 *                 details:
 *                   type: object
 *                   description: Additional analysis details
 *       400:
 *         description: Bad request - missing or invalid address
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.body;
    
    // Validate address
    const validation = CrimeAnalysisService.validateAddress(address);
    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }
    
    // Analyze crime for the address
    const result = await CrimeAnalysisService.analyzeCrimeForAddress(address);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /crime-analysis/validate:
 *   post:
 *     summary: Validate address format
 *     tags: [Crime Analysis]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *                 description: Address to validate
 *                 example: "123 Main St, New York, NY 10001"
 *     responses:
 *       200:
 *         description: Address validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isValid:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: Bad request - missing address
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      res.status(400).json({ error: 'Address is required' });
      return;
    }
    
    const validation = CrimeAnalysisService.validateAddress(address);
    res.json(validation);
  } catch (error) {
    next(error);
  }
});

export default router;
