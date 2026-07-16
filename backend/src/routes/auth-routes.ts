import { Router } from 'express';
import * as authController from '../controllers/auth-controller.js';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/verify', authController.verifyToken);

router.put('/email', authController.updateEmail);
router.put('/change-password', authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;