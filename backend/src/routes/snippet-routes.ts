import { Router } from 'express';
import { snippetController } from '../controllers/snippet-controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';

const router = Router();
const controller = snippetController;

// Public routes (optional auth)
router.get('/', optionalAuth, controller.getSnippets.bind(controller));
router.get('/languages', optionalAuth, controller.getLanguages.bind(controller));
router.get('/tags', optionalAuth, controller.getTags.bind(controller));
router.get('/categories', optionalAuth, controller.getCategories.bind(controller));
router.get('/:id', optionalAuth, controller.getSnippet.bind(controller));

// Protected routes (require authentication)
router.post('/', authenticate, csrfProtection, controller.createSnippet.bind(controller));
router.put('/:id', authenticate, csrfProtection, controller.updateSnippet.bind(controller));
router.delete('/:id', authenticate, csrfProtection, controller.deleteSnippet.bind(controller));

export default router;