import { Router } from 'express';
import { 
  generateSnippet, 
  explainCode, 
  optimizeCode,
  chat,
  getAIStatus
} from '../controllers/ai-controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/generate-snippet', authenticate, generateSnippet);
router.post('/explain-code', authenticate, explainCode);
router.post('/optimize-code', authenticate, optimizeCode);
router.post('/chat', authenticate, chat);
router.get('/status', authenticate, getAIStatus);

export default router;