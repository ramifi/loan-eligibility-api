import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env['NODE_ENV'] === 'development' ? err.message : 'Internal server error'
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
};
