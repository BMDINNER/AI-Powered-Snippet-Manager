import { Request, Response } from 'express';
import { config } from '../config/index.js';
import axios from 'axios';
import {
  waitForAuthService,
  authRequestConfig
} from '../services/auth-service.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!config.projectId || !config.apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Auth-service uyuyorsa önce uyandır ve hazır olmasını bekle.
    /*const authReady = await waitForAuthService();

    if (!authReady) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service is temporarily unavailable. Please try again shortly.'
      });
    }
*/
    const response = await axios.post(
      `${config.authServiceUrl}/auth/project/login`,
      {
        email,
        password,
        projectId: config.projectId
      },
      authRequestConfig()
    );

    return res.json(response.data);

  } catch (error: any) {
    console.error('Login error:', error.message);

    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message ||
        error.response.data?.error;

      if (status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Burada 429'u "çok fazla login yaptın" olarak
      // yanlış yorumlamıyoruz.
      if (status === 429) {
        return res.status(503).json({
          success: false,
          message:
            'Authentication service is temporarily unavailable. Please try again shortly.'
        });
      }

      if (message) {
        return res.status(status).json({
          success: false,
          message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};


export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    if (!config.projectId || !config.apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const authReady = await waitForAuthService();

    if (!authReady) {
      return res.status(503).json({
        success: false,
        message:
          'Authentication service is temporarily unavailable. Please try again shortly.'
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
      authRequestConfig()
    );

    return res.json(response.data);

  } catch (error: any) {
    console.error('Register error:', error.message);

    if (error.response) {
      const status = error.response.status;

      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        'Registration failed';

      if (
        status === 400 &&
        message.includes('already exists')
      ) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      if (status === 429) {
        return res.status(503).json({
          success: false,
          message:
            'Authentication service is temporarily unavailable. Please try again shortly.'
        });
      }

      return res.status(status).json({
        success: false,
        message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};


export const refreshToken = async (
  req: Request,
  res: Response
) => {
  try {
    const { refreshToken } = req.body;

    const authReady = await waitForAuthService();

    if (!authReady) {
      return res.status(503).json({
        success: false,
        message:
          'Authentication service is temporarily unavailable.'
      });
    }

    const response = await axios.post(
      `${config.authServiceUrl}/auth/refresh`,
      { refreshToken },
      authRequestConfig()
    );

    return res.json(response.data);

  } catch (error: any) {
    console.error('Refresh token error:', error.message);

    if (error.response) {
      console.error(
        'Auth service response:',
        error.response.data
      );
    }

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || error.message;

    return res.status(status).json({
      success: false,
      message
    });
  }
};


export const logout = async (
  req: Request,
  res: Response
) => {
  try {
    const { refreshToken } = req.body;
    const token =
      req.headers.authorization?.split(' ')[1];

    const authReady = await waitForAuthService();

    if (!authReady) {
      return res.status(503).json({
        success: false,
        message:
          'Authentication service is temporarily unavailable.'
      });
    }

    const response = await axios.post(
      `${config.authServiceUrl}/auth/logout`,
      { refreshToken },
      {
        ...authRequestConfig(),
        headers: {
          ...authRequestConfig().headers,
          Authorization: `Bearer ${token}`
        }
      }
    );

    return res.json(response.data);

  } catch (error: any) {
    console.error('Logout error:', error.message);

    if (error.response) {
      console.error(
        'Auth service response:',
        error.response.data
      );
    }

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || error.message;

    return res.status(status).json({
      success: false,
      message
    });
  }
};


export const verifyToken = async (
  req: Request,
  res: Response
) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const authReady = await waitForAuthService();

    if (!authReady) {
      return res.status(503).json({
        success: false,
        message:
          'Authentication service is temporarily unavailable.'
      });
    }

    const response = await axios.get(
      `${config.authServiceUrl}/auth/token/verify`,
      {
        ...authRequestConfig(),
        headers: {
          ...authRequestConfig().headers,
          Authorization: `Bearer ${token}`
        }
      }
    );

    return res.json(response.data);

  } catch (error: any) {
    console.error('Verify token error:', error.message);

    if (error.response) {
      console.error(
        'Auth service response:',
        error.response.data
      );
    }

    const status = error.response?.status || 401;
    const message =
      error.response?.data?.message || 'Invalid token';

    return res.status(status).json({
      success: false,
      message
    });
  }
};


export const updateEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const { newEmail, password } = req.body;
    const token =
      req.headers.authorization?.split(' ')[1];

    if (!newEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'New email and password are required'
      });
    }

    const authReady = await waitForAuthService();

    if (!authReady) {
      return res.status(503).json({
        success: false,
        message:
          'Authentication service is temporarily unavailable.'
      });
    }

    const response = await axios.put(
      `${config.authServiceUrl}/auth/email`,
      { newEmail, password },
      {
        ...authRequestConfig(),
        headers: {
          ...authRequestConfig().headers,
          Authorization: `Bearer ${token}`
        }
      }
    );

    return res.json(response.data);

  } catch (error: any) {
    console.error('Update email error:', error.message);

    if (error.response) {
      console.error(
        'Auth service response:',
        error.response.data
      );
    }

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || error.message;

    return res.status(status).json({
      success: false,
      message
    });
  }
};


export const changePassword = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      currentPassword,
      newPassword
    } = req.body;

    const token =
      req.headers.authorization?.split(' ')[1];

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          'New password must be at least 6 characters'
      });
    }

    const authReady = await waitForAuthService();

    if (!authReady) {
      return res.status(503).json({
        success: false,
        message:
          'Authentication service is temporarily unavailable.'
      });
    }

    const response = await axios.put(
      `${config.authServiceUrl}/auth/change-password`,
      { currentPassword, newPassword },
      {
        ...authRequestConfig(),
        headers: {
          ...authRequestConfig().headers,
          Authorization: `Bearer ${token}`
        }
      }
    );

    return res.json(response.data);

  } catch (error: any) {
    console.error('Change password error:', error.message);

    if (error.response) {
      console.error(
        'Auth service response:',
        error.response.data
      );
    }

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || error.message;

    return res.status(status).json({
      success: false,
      message
    });
  }
};