import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';
import * as aiController from '../controllers/ai-controller.js';

const router = Router();

router.post('/generate', authenticate, csrfProtection, aiController.generateSnippet);
router.post('/improve', authenticate, csrfProtection, aiController.improveSnippet);
router.post('/explain', authenticate, csrfProtection, aiController.explainCode);
router.post('/chat', authenticate, csrfProtection, aiController.chatWithAI);
router.get('/health', aiController.checkHealth);

export default router;