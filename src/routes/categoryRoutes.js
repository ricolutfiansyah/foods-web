import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', authMiddleware, roleMiddleware, categoryController.createCategory);
router.patch('/:id', authMiddleware, roleMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, roleMiddleware, categoryController.deleteCategory);

export default router;