import { Router } from 'express';
import { snippetController } from '../controllers/snippet-controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();
const controller = snippetController;

router.post('/', authenticate, controller.createSnippet.bind(controller));
router.get('/', optionalAuth, controller.getSnippets.bind(controller));
router.get('/languages', optionalAuth, controller.getLanguages.bind(controller));
router.get('/tags', optionalAuth, controller.getTags.bind(controller));
router.get('/categories', optionalAuth, controller.getCategories.bind(controller));
router.get('/:id', optionalAuth, controller.getSnippet.bind(controller));
router.put('/:id', authenticate, controller.updateSnippet.bind(controller));
router.delete('/:id', authenticate, controller.deleteSnippet.bind(controller));

export default router;