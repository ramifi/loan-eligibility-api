// src/routes/agent.ts
import { Router } from "express";
import { z } from "zod";
import { gradeAddressWithAgent } from "../services/AgentService";

const router = Router();

const Body = z.object({ address: z.string().min(3) });

/**
 * @swagger
 * /agent/grade:
 *   post:
 *     summary: Grade an address for crime safety using AI agent
 *     tags: [Agent]
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
 *                 minLength: 3
 *                 description: Address to grade for crime safety
 *                 example: "123 Main St, Anytown, USA"
 *     responses:
 *       200:
 *         description: Address graded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrimeGradeResult'
 *             example:
 *               address: "123 Main St, Anytown, USA"
 *               zip: "12345"
 *               overall_grade: "B+"
 *               components:
 *                 violent_crime: "A-"
 *                 property_crime: "B"
 *               notes: "Generally safe area with low violent crime rates"
 *               evidence:
 *                 - source: "Local Police Department"
 *                   snippet: "Crime rates below city average"
 *       400:
 *         description: Bad request - invalid address format
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
router.post("/grade", async (req, res, next) => {
  try {
    const { address } = Body.parse(req.body);
    const result = await gradeAddressWithAgent(address);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;