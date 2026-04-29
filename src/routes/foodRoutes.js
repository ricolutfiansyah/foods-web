import { Router } from 'express';
import * as foodController from '../controllers/foodController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.get('/', foodController.getAllFoods);
router.get('/:id', foodController.getFoodById);
router.post('/', authMiddleware, roleMiddleware, upload.single('image'), foodController.createFood);
router.patch('/:id', authMiddleware, roleMiddleware, upload.single('image'), foodController.updateFood);
router.delete('/:id', authMiddleware, roleMiddleware, foodController.deleteFood);

export default router;