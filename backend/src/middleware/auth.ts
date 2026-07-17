import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { config } from '../config/index.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username?: string;
    projectId?: string;
  };
}

const getAuthHeaders = () => ({
  'x-api-key': config.apiKey,
  'x-project-id': config.projectId,
  'Content-Type': 'application/json'
});

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
    const response = await axios.get(
      `${config.authServiceUrl}/auth/token/verify`,
      {
        headers: {
          ...getAuthHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );

    
    const { user } = response.data;
    
    (req as AuthRequest).user = {
      userId: user.userId,
      email: user.email,
      username: user.username || user.email?.split('@')[0] || 'User',
      projectId: user.projectId
    };
    
    return next();
  } catch (err: any) {
    console.error('Token verification failed:');
    console.error('Error message:', err.message);
    if (err.response) {
      console.error('Auth service error status:', err.response.status);
      console.error('Auth service error data:', err.response.data);
    }
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
    const response = await axios.get(
      `${config.authServiceUrl}/auth/token/verify`,
      {
        headers: {
          ...getAuthHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );

    const { user } = response.data;
    
    (req as AuthRequest).user = {
      userId: user.userId,
      email: user.email,
      username: user.username || user.email?.split('@')[0] || 'User',
      projectId: user.projectId
    };
  } catch (err) {
    console.error('Optional auth error:', err);
  } finally {
    return next();
  }
};