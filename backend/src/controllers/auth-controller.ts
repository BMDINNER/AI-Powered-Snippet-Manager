import { Request, Response } from 'express';
import axios from 'axios';
import { config } from '../config';

const getAuthHeaders = () => ({
  'x-api-key': config.apiKey,
  'x-project-id': config.projectId,
  'Content-Type': 'application/json'
});

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const response = await axios.post(
      `${config.authServiceUrl}/auth/project/login`,
      { email, password, projectId: config.projectId },
      { headers: getAuthHeaders() }
    );
    
    res.json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ success: false, message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    
    const response = await axios.post(
      `${config.authServiceUrl}/auth/project/register`,
      { email, password, username, projectId: config.projectId },
      { headers: getAuthHeaders() }
    );
    
    res.json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ success: false, message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    const response = await axios.post(
      `${config.authServiceUrl}/auth/refresh`,
      { refreshToken },
      { headers: getAuthHeaders() }
    );
    
    res.json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ success: false, message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    const response = await axios.post(
      `${config.authServiceUrl}/auth/logout`,
      { refreshToken },
      { 
        headers: {
          ...getAuthHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    res.json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ success: false, message });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const response = await axios.post(
      `${config.authServiceUrl}/auth/token/verify`,
      null,
      { 
        headers: {
          ...getAuthHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    res.json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 401;
    const message = error.response?.data?.message || 'Invalid token';
    res.status(status).json({ success: false, message });
  }
};