import { Request, Response } from 'express';
import { config } from '../config/index.js';
import axios from 'axios';

const getAuthHeaders = () => ({
  'x-api-key': config.apiKey,
  'x-project-id': config.projectId,
  'Content-Type': 'application/json'
});

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!config.projectId) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Project ID missing'
      });
    }
    
    if (!config.apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: API Key missing'
      });
    }
    
    const response = await axios.post(
      `${config.authServiceUrl}/auth/project/login`,
      { 
        email, 
        password, 
        projectId: config.projectId 
      },
      { headers: getAuthHeaders() }
    );
    
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ success: false, message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    
    if (!config.projectId) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Project ID missing'
      });
    }
    
    if (!config.apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: API Key missing'
      });
    }
    
    const response = await axios.post(
      `${config.authServiceUrl}/auth/project/register`,
      { 
        email, 
        password, 
        username, 
        projectId: config.projectId 
      },
      { headers: getAuthHeaders() }
    );
    
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }
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
    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }
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
    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }
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
    
    const response = await axios.get(
      `${config.authServiceUrl}/auth/token/verify`,
      { 
        headers: {
          ...getAuthHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }
    const status = error.response?.status || 401;
    const message = error.response?.data?.message || 'Invalid token';
    res.status(status).json({ success: false, message });
  }
};

export const updateEmail = async (req: Request, res: Response) => {
  try {
    const { newEmail, password } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!newEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'New email and password are required'
      });
    }

    const response = await axios.put(
      `${config.authServiceUrl}/auth/email`,
      { newEmail, password },
      {
        headers: {
          ...getAuthHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ success: false, message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const response = await axios.put(
      `${config.authServiceUrl}/auth/change-password`,
      { currentPassword, newPassword },
      {
        headers: {
          ...getAuthHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ success: false, message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const response = await axios.post(
      `${config.authServiceUrl}/auth/forgot-password`,
      { email },
      { headers: getAuthHeaders() }
    );
    
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ success: false, message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const response = await axios.post(
      `${config.authServiceUrl}/auth/reset-password`,
      { token, newPassword },
      { headers: getAuthHeaders() }
    );
    
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ success: false, message });
  }
};