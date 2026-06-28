import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    projectId?: string;
  };
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Token error' });
  }

  const [scheme, token] = parts;
  
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Token malformatted' });
  }

  try {
    const response = await axios.post(
      `${config.authServiceUrl}/auth/token/verify`,
      null,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const { user } = response.data;
    
    (req as AuthRequest).user = {
      userId: user.userId,
      email: user.email,
      projectId: user.projectId
    };
    
    return next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return next();
  }

  const [scheme, token] = parts;
  
  if (!/^Bearer$/i.test(scheme)) {
    return next();
  }

  try {
    const response = await axios.post(
      `${config.authServiceUrl}/auth/token/verify`,
      null,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const { user } = response.data;
    
    (req as AuthRequest).user = {
      userId: user.userId,
      email: user.email,
      projectId: user.projectId
    };
  } catch (err) {
    // Ignore error, user stays undefined, maybe guest
  } finally {
    return next();
  }
};