import { Router, Request, Response, NextFunction } from 'express';
import { LoanService } from '../services/LoanService';
import { authenticateApiKey } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateApiKey);

/**
 * @swagger
 * /loan:
 *   post:
 *     summary: Create a new loan application with eligibility evaluation
 *     tags: [Loan Applications]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicantName
 *               - propertyAddress
 *               - creditScore
 *               - monthlyIncome
 *               - requestedAmount
 *               - loanTermMonths
 *             properties:
 *               applicantName:
 *                 type: string
 *                 description: Full name of the loan applicant
 *                 example: "John Doe"
 *               propertyAddress:
 *                 type: string
 *                 description: Address of the property for the loan
 *                 example: "123 Main St, Anytown, USA"
 *               creditScore:
 *                 type: number
 *                 minimum: 300
 *                 maximum: 850
 *                 description: Credit score of the applicant
 *                 example: 750
 *               monthlyIncome:
 *                 type: number
 *                 minimum: 0
 *                 description: Monthly income of the applicant
 *                 example: 5000
 *               requestedAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Amount of loan requested
 *                 example: 200000
 *               loanTermMonths:
 *                 type: number
 *                 minimum: 1
 *                 description: Loan term in months
 *                 example: 360
 *     responses:
 *       201:
 *         description: Loan application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanApplication'
 *       400:
 *         description: Bad request - missing required fields
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
    const { applicantName, propertyAddress, creditScore, monthlyIncome, requestedAmount, loanTermMonths } = req.body;
    
    // Validate required fields
    const validation = LoanService.validateLoanApplicationData(req.body);
    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }
    
    // Create loan application using the service
    const result = await LoanService.createLoanApplication({
      applicantName,
      propertyAddress,
      creditScore,
      monthlyIncome,
      requestedAmount,
      loanTermMonths
    });
    
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /loan/{id}:
 *   get:
 *     summary: Get a specific loan application by ID
 *     tags: [Loan Applications]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the loan application
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Loan application retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanApplication'
 *       400:
 *         description: Bad request - missing ID parameter
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
 *       404:
 *         description: Loan application not found
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
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ error: 'ID parameter is required' });
      return;
    }
    
    const application = await LoanService.getLoanApplicationById(id);
    
    if (!application) {
      res.status(404).json({ error: 'Loan application not found' });
      return;
    }
    
    res.json(application);
  } catch (error) {
    next(error);
  }
});

export default router;
