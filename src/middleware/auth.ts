import { Request, Response, NextFunction } from 'express';

const API_KEY = process.env['API_KEY'] || 'loan-api-key-atlas';

export const authenticateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    res.status(401).json({ error: 'API key is required' });
    return;
  }
  
  if (apiKey !== API_KEY) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }
  
  next();
};
