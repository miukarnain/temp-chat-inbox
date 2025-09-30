import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Simple authentication middleware (extend based on your needs)
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // In production, verify JWT token here
  // For now, we'll just attach the user ID from header
  req.userId = req.headers['user-id'] as string;
  
  if (!req.userId) {
    res.status(401).json({ error: 'User ID required' });
    return;
  }

  next();
}; 