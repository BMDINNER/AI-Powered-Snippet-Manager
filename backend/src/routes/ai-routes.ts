import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as aiController from '../controllers/ai-controller.js';

const router = Router();

router.post('/generate', authenticate, aiController.generateSnippet);
router.post('/improve', authenticate, aiController.improveSnippet);
router.post('/explain', authenticate, aiController.explainCode);
router.post('/chat', authenticate, aiController.chatWithAI);
router.get('/health', aiController.checkHealth);

export default router;