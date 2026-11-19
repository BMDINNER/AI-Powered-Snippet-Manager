import { Router } from 'express';
import * as authController from '../controllers/auth-controller.js';
import { csrfProtection } from '../middleware/csrf.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later' },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 10,
  message: { success: false, message: 'Too many registration attempts, please try again later' },
});


const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  message: { success: false, message: 'Too many attempts for this action, please try again later' },
});


const generalLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 60,
  message: { success: false, message: 'Too many requests, please slow down' },
});

router.use(generalLimiter);

router.get('/csrf-token', authController.getCsrfToken);

router.post('/login', loginLimiter, authController.login);
router.post('/register', registerLimiter, authController.register);

router.post('/refresh', csrfProtection, authController.refreshToken);
router.post('/logout', csrfProtection, authController.logout);

router.get('/verify', authController.verifyToken);

router.put('/email', csrfProtection, sensitiveActionLimiter, authController.updateEmail);
router.put('/change-password', csrfProtection, sensitiveActionLimiter, authController.changePassword);

export default router;