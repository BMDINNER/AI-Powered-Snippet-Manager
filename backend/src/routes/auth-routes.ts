import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateProjectApiKey } from '../middleware/project-auth.js';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();
const authController = new AuthController();

let isServiceReady = false;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
    max: 20,
    message: 'Too many login attempts, please try again later',
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
    if (!isServiceReady) return true;
    return false;
    }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
    max: 10,
    message: 'Too many registration attempts, please try again later',
    skip: (req) => {
    if (!isServiceReady) return true;
    return false;
    }
});


const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5,
    message: 'Too many attempts for this action, please try again later',
    skip: (req) => {
    if (!isServiceReady) return true;
    return false;
    }
});


const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
    max: 60,
    message: 'Too many requests, please slow down',
    skip: (req) => {
    if (!isServiceReady) return true;
    return false;
    }
});


router.use(generalLimiter);

export const enableRateLimiting = () => {
    isServiceReady = true;
    console.log('Rate limiting enabled');
};


// Public auth route'ları
router.post('/register', registerLimiter, asyncHandler(authController.register.bind(authController)));
router.post('/login', loginLimiter, asyncHandler(authController.login.bind(authController)));
router.post('/refresh', asyncHandler(authController.refreshToken.bind(authController))); // refresh genelde limiter gerektirmez ama generalLimiter altında

// Korumalı auth route'ları
router.post('/logout', authenticate, asyncHandler(authController.logout.bind(authController)));
router.get('/verify', authenticate, asyncHandler(authController.verify.bind(authController)));

// Hassas işlemler (şifre değiştirme, e-posta güncelleme)
router.put('/email', authenticate, sensitiveActionLimiter, asyncHandler(authController.updateEmail.bind(authController)));
router.put('/change-password', authenticate, sensitiveActionLimiter, asyncHandler(authController.changePassword.bind(authController)));

// Proje oluşturma (korumalı)
router.post('/projects', authenticate, asyncHandler(authController.createProject.bind(authController)));

// Proje kapsamlı auth route'ları (API key doğrulamalı)
router.post('/project/register', validateProjectApiKey, registerLimiter, asyncHandler(authController.register.bind(authController)));
router.post('/project/login', validateProjectApiKey, loginLimiter, asyncHandler(authController.login.bind(authController)));

export default router;