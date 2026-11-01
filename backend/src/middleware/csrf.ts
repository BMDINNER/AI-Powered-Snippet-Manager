import { NextFunction, Request, Response } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3005',
  'http://localhost:5173',
  'https://snippet-frontend.onrender.com',
  'https://snippet-frontend-ujc2.onrender.com',
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN
].filter(Boolean) as string[];

function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true;
  return allowedOrigins.includes(origin.trim());
}

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase())) {
    return next();
  }

  const origin = req.get('origin');

  if (origin) {
    const normalizedOrigin = origin.trim();
    if (!isAllowedOrigin(normalizedOrigin)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: invalid origin'
      });
    }

    // Mailbox/axios/browser clients from trusted origins often cannot read a backend cookie
    // when the frontend and API are hosted on different domains, so we allow trusted-origin
    // browser requests to proceed without a token while still rejecting untrusted origins.
    return next();
  }

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.get('x-csrf-token') || req.get('x-xsrf-token');

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing or invalid'
    });
  }

  return next();
};

export const setCsrfCookie = (res: Response, token: string) => {
  res.cookie('csrfToken', token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 60 * 60 * 1000,
    path: '/'
  });
};
