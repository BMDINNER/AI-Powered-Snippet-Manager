import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import axios from 'axios';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    provider?: string;
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
    const response = await axios.get(`${config.authServiceUrl}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    (req as AuthRequest).user = {
      userId: response.data.id,
      email: response.data.email
    };
    
    return next();
  } catch (err) {
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
    const response = await axios.get(`${config.authServiceUrl}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    (req as AuthRequest).user = {
      userId: response.data.id,
      email: response.data.email
    };
  } catch (err) {
  } finally {
    return next();
  }
};