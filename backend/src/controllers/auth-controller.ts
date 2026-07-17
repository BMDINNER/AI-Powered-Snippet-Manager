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
    
    console.log('=== BACKEND LOGIN ===');
    console.log('Email:', email);
    console.log('ProjectId from config:', config.projectId);
    console.log('ApiKey from config:', config.apiKey);
    
    if (!config.projectId) {
      console.error('Project ID not configured in environment');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Project ID missing'
      });
    }
    
    if (!config.apiKey) {
      console.error('API Key not configured in environment');
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
    console.error('Login error:', error.message);
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
    
    console.log('=== BACKEND REGISTER ===');
    console.log('Email:', email);
    console.log('Username:', username);
    console.log('ProjectId from config:', config.projectId);
    console.log('ApiKey from config:', config.apiKey);
    
    if (!config.projectId) {
      console.error('Project ID not configured in environment');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Project ID missing'
      });
    }
    
    if (!config.apiKey) {
      console.error('API Key not configured in environment');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: API Key missing'
      });
    }
    
    const requestData = {
      email: email,
      password: password,
      username: username,
      projectId: config.projectId 
    };
    
    const requestHeaders = {
      'x-api-key': config.apiKey,
      'x-project-id': config.projectId,
      'Content-Type': 'application/json'
    };
    
    console.log('=== SENDING TO AUTH-SERVICE ===');
    console.log('URL:', `${config.authServiceUrl}/auth/project/register`);
    console.log('Headers:', {
      'x-api-key': requestHeaders['x-api-key'],
      'x-project-id': requestHeaders['x-project-id']
    });
    console.log('Body:', {
      email: requestData.email,
      password: '[REDACTED]',
      username: requestData.username,
      projectId: requestData.projectId
    });
    
    const response = await axios.post(
      `${config.authServiceUrl}/auth/project/register`,
      requestData,
      { headers: requestHeaders }
    );
    
    console.log('=== AUTH-SERVICE RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    
    res.json(response.data);
  } catch (error: any) {
    console.error('=== REGISTER ERROR ===');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Auth service status:', error.response.status);
      console.error('Auth service data:', error.response.data);
    }
    if (error.request) {
      console.error('No response received from auth-service');
      console.error('Request was sent to:', `${config.authServiceUrl}/auth/project/register`);
    }
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ success: false, message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    console.log('=== BACKEND REFRESH TOKEN ===');
    console.log('Refresh token provided:', !!refreshToken);
    
    const response = await axios.post(
      `${config.authServiceUrl}/auth/refresh`,
      { refreshToken },
      { headers: getAuthHeaders() }
    );
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Refresh token error:', error.message);
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
    
    console.log('=== BACKEND LOGOUT ===');
    console.log('Refresh token provided:', !!refreshToken);
    console.log('Access token provided:', !!token);
    
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
    console.error('Logout error:', error.message);
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
    
    console.log('=== BACKEND VERIFY TOKEN ===');
    console.log('Token provided:', !!token);
    
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
    console.error('Verify token error:', error.message);
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
    
    console.log('=== BACKEND UPDATE EMAIL ===');
    console.log('New email:', newEmail);
    console.log('Token provided:', !!token);
    
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
    console.error('Update email error:', error.message);
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
    
    console.log('=== BACKEND CHANGE PASSWORD ===');
    console.log('Token provided:', !!token);
    
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
    console.error('Change password error:', error.message);
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
    
    console.log('=== BACKEND FORGOT PASSWORD ===');
    console.log('Email:', email);
    
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
    console.error('Forgot password error:', error.message);
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
    
    console.log('=== BACKEND RESET PASSWORD ===');
    console.log('Token provided:', !!token);
    
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
    console.error('Reset password error:', error.message);
    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ success: false, message });
  }
};