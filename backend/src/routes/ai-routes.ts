import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as aiController from '../controllers/ai-controller';

const router = Router();

router.post('/generate', authenticate, aiController.generateSnippet);
router.post('/improve', authenticate, aiController.improveSnippet);
router.post('/explain', authenticate, aiController.explainCode);
router.get('/health', aiController.checkHealth);

export default router;