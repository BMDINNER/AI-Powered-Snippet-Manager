import { Router } from 'express';
import * as authController from '../controllers/auth-controller.js';
import { csrfProtection } from '../middleware/csrf.js';

const router = Router();

router.get('/csrf-token', authController.getCsrfToken);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', csrfProtection, authController.refreshToken);
router.post('/logout', csrfProtection, authController.logout);
router.get('/verify', authController.verifyToken);

router.put('/email', csrfProtection, authController.updateEmail);
router.put('/change-password', csrfProtection, authController.changePassword);

export default router;