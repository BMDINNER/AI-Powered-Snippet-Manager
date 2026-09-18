import { Request, Response } from 'express';
import { config } from '../config/index.js';
import axios from 'axios';
import { authRequestConfig } from '../services/auth-service.js';
import { forcePing } from '../services/ping-service.js';

const isProduction = process.env.NODE_ENV === 'production';

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 15 * 60 * 1000,
  path: '/'
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
};

const setAuthCookies = (res: Response, token: string, refreshToken: string) => {
  if (token) res.cookie('token', token, accessTokenCookieOptions);
  if (refreshToken) res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    path: '/'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    path: '/'
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!config.projectId || !config.apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const response = await axios.post(
      `${config.authServiceUrl}/auth/project/login`,
      { email, password, projectId: config.projectId },
      authRequestConfig()
    );

    const { token, refreshToken, user, project } = response.data;

    if (token && refreshToken) {
      setAuthCookies(res, token, refreshToken);
    }

    return res.json({
      success: true,
      user,
      project
    });
  } catch (error: any) {
    console.error('Login error:', error.message);

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.log('[Login] Auth service appears to be sleeping, force pinging...');
      await forcePing();

      await new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        const retryResponse = await axios.post(
          `${config.authServiceUrl}/auth/project/login`,
          {
            email: req.body.email,
            password: req.body.password,
            projectId: config.projectId
          },
          { ...authRequestConfig(), timeout: 30000 }
        );

        const { token, refreshToken, user, project } = retryResponse.data;

        if (token && refreshToken) {
          setAuthCookies(res, token, refreshToken);
        }

        return res.json({
          success: true,
          user,
          project
        });
      } catch (retryError: any) {
        console.error('Login retry error:', retryError.message);
        return res.status(503).json({
          success: false,
          message: 'Authentication service is starting up. Please wait 15 seconds and try again.',
          retryAfter: 15
        });
      }
    }

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error;

      if (status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      if (status === 429) {
        return res.status(503).json({
          success: false,
          message: 'Too many requests. Please wait a moment and try again.',
          retryAfter: 5
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
    const { email, password, username } = req.body as {
      email: string;
      password: string;
      username: string;
    };

    if (!config.projectId || !config.apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const response = await axios.post(
      `${config.authServiceUrl}/auth/project/register`,
      { email, password, username, projectId: config.projectId },
      authRequestConfig()
    );

    const { token, refreshToken, user, project } = response.data;

    if (token && refreshToken) {
      setAuthCookies(res, token, refreshToken);
    }

    return res.json({
      success: true,
      user,
      project
    });
  } catch (error: any) {
    console.error('Register error:', error.message);

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.log('[Register] Auth service appears to be sleeping, force pinging...');
      await forcePing();

      await new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        const retryResponse = await axios.post(
          `${config.authServiceUrl}/auth/project/register`,
          {
            email: req.body.email,
            password: req.body.password,
            username: req.body.username,
            projectId: config.projectId
          },
          { ...authRequestConfig(), timeout: 30000 }
        );

        const { token, refreshToken, user, project } = retryResponse.data;

        if (token && refreshToken) {
          setAuthCookies(res, token, refreshToken);
        }

        return res.json({
          success: true,
          user,
          project
        });
      } catch (retryError: any) {
        console.error('Register retry error:', retryError.message);
        return res.status(503).json({
          success: false,
          message: 'Authentication service is starting up. Please wait 15 seconds and try again.',
          retryAfter: 15
        });
      }
    }

    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        'Registration failed';

      if (status === 400 && message.includes('already exists')) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      if (status === 429) {
        return res.status(503).json({
          success: false,
          message: 'Too many requests. Please wait a moment and try again.',
          retryAfter: 5
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

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshTokenValue = req.cookies?.refreshToken;

    if (!refreshTokenValue) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    const response = await axios.post(
      `${config.authServiceUrl}/auth/refresh`,
      { refreshToken: refreshTokenValue },
      authRequestConfig()
    );

    const { token } = response.data;

    if (token) {
      res.cookie('token', token, accessTokenCookieOptions);
    }

    return res.json({
      success: true,
      message: 'Token refreshed'
    });
  } catch (error: any) {
    console.error('Refresh token error:', error.message);

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.log('[RefreshToken] Auth service appears to be sleeping, force pinging...');
      await forcePing();

      await new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        const retryResponse = await axios.post(
          `${config.authServiceUrl}/auth/refresh`,
          { refreshToken: req.cookies?.refreshToken },
          { ...authRequestConfig(), timeout: 30000 }
        );

        const { token } = retryResponse.data;

        if (token) {
          res.cookie('token', token, accessTokenCookieOptions);
        }

        return res.json({
          success: true,
          message: 'Token refreshed'
        });
      } catch (retryError: any) {
        console.error('Refresh token retry error:', retryError.message);
        clearAuthCookies(res);
        return res.status(503).json({
          success: false,
          message: 'Authentication service is starting up. Please wait 15 seconds and try again.',
          retryAfter: 15
        });
      }
    }

    clearAuthCookies(res);

    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }

    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;

    return res.status(status).json({
      success: false,
      message
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  let token: string | undefined;

  try {
    token = req.cookies?.token;
    const refreshTokenValue = req.cookies?.refreshToken;

    const response = await axios.post(
      `${config.authServiceUrl}/auth/logout`,
      { refreshToken: refreshTokenValue },
      {
        ...authRequestConfig(),
        headers: {
          ...authRequestConfig().headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      }
    );

    clearAuthCookies(res);

    return res.json(response.data);
  } catch (error: any) {
    console.error('Logout error:', error.message);

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.log('[Logout] Auth service appears to be sleeping, force pinging...');
      await forcePing();

      await new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        const retryResponse = await axios.post(
          `${config.authServiceUrl}/auth/logout`,
          { refreshToken: req.cookies?.refreshToken },
          {
            ...authRequestConfig(),
            timeout: 30000,
            headers: {
              ...authRequestConfig().headers,
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          }
        );

        clearAuthCookies(res);

        return res.json(retryResponse.data);
      } catch (retryError: any) {
        console.error('Logout retry error:', retryError.message);
        clearAuthCookies(res);
        return res.status(503).json({
          success: false,
          message: 'Authentication service is starting up. Please wait 15 seconds and try again.',
          retryAfter: 15
        });
      }
    }

    clearAuthCookies(res);

    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }

    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;

    return res.status(status).json({
      success: false,
      message
    });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  let token: string | undefined;

  try {
    token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const response = await axios.get(`${config.authServiceUrl}/auth/token/verify`, {
      ...authRequestConfig(),
      headers: {
        ...authRequestConfig().headers,
        Authorization: `Bearer ${token}`
      }
    });

    return res.json(response.data);
  } catch (error: any) {
    console.error('Verify token error:', error.message);

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.log('[VerifyToken] Auth service appears to be sleeping, force pinging...');
      await forcePing();

      await new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        const retryResponse = await axios.get(
          `${config.authServiceUrl}/auth/token/verify`,
          {
            ...authRequestConfig(),
            timeout: 30000,
            headers: {
              ...authRequestConfig().headers,
              Authorization: `Bearer ${token}`
            }
          }
        );

        return res.json(retryResponse.data);
      } catch (retryError: any) {
        console.error('Verify token retry error:', retryError.message);
        return res.status(503).json({
          success: false,
          message: 'Authentication service is starting up. Please wait 15 seconds and try again.',
          retryAfter: 15
        });
      }
    }

    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }

    const status = error.response?.status || 401;
    const message = error.response?.data?.message || 'Invalid token';

    return res.status(status).json({
      success: false,
      message
    });
  }
};

export const updateEmail = async (req: Request, res: Response) => {
  let token: string | undefined;

  try {
    const { newEmail, password } = req.body as { newEmail: string; password: string };
    token = req.cookies?.token;

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

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.log('[UpdateEmail] Auth service appears to be sleeping, force pinging...');
      await forcePing();

      await new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        const retryResponse = await axios.put(
          `${config.authServiceUrl}/auth/email`,
          { newEmail: req.body.newEmail, password: req.body.password },
          {
            ...authRequestConfig(),
            timeout: 30000,
            headers: {
              ...authRequestConfig().headers,
              Authorization: `Bearer ${token}`
            }
          }
        );

        return res.json(retryResponse.data);
      } catch (retryError: any) {
        console.error('Update email retry error:', retryError.message);
        return res.status(503).json({
          success: false,
          message: 'Authentication service is starting up. Please wait 15 seconds and try again.',
          retryAfter: 15
        });
      }
    }

    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }

    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;

    return res.status(status).json({
      success: false,
      message
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  let token: string | undefined;

  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };
    token = req.cookies?.token;

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

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.log('[ChangePassword] Auth service appears to be sleeping, force pinging...');
      await forcePing();

      await new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        const retryResponse = await axios.put(
          `${config.authServiceUrl}/auth/change-password`,
          {
            currentPassword: req.body.currentPassword,
            newPassword: req.body.newPassword
          },
          {
            ...authRequestConfig(),
            timeout: 30000,
            headers: {
              ...authRequestConfig().headers,
              Authorization: `Bearer ${token}`
            }
          }
        );

        return res.json(retryResponse.data);
      } catch (retryError: any) {
        console.error('Change password retry error:', retryError.message);
        return res.status(503).json({
          success: false,
          message: 'Authentication service is starting up. Please wait 15 seconds and try again.',
          retryAfter: 15
        });
      }
    }

    if (error.response) {
      console.error('Auth service response:', error.response.data);
    }

    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;

    return res.status(status).json({
      success: false,
      message
    });
  }
};