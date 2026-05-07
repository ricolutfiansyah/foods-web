import * as foodService from '../services/foodService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/response.js';
import { createFoodSchema, updateFoodSchema } from '../validators/foodValidator.js';
import { invalidateCache } from '../middlewares/cacheMiddleware.js';

export const getAllFoods = asyncHandler(async (req, res) => {
    const { data, meta } = await foodService.getAllFoods(req.query);
    return sendResponse(res, 200, 'Foods retrieved successfully', data, meta);
});

export const getFoodById = asyncHandler(async (req, res) => {
    const food = await foodService.getFoodById(req.params.id);
    return sendResponse(res, 200, 'Food retrieved successfully', food);
});

export const createFood = asyncHandler(async (req, res) => {
    const parsed = createFoodSchema.safeParse(req.body);
    if (!parsed.success) {
        const errors = parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
        return sendError(res, 400, 'Validation error', errors);
    }

    const food = await foodService.createFood(parsed.data, req.file);
    await invalidateCache('foods:all');
    return sendResponse(res, 201, 'Food created successfully', food);
});

export const updateFood = asyncHandler(async (req, res) => {
    const parsed = updateFoodSchema.safeParse(req.body);
    if (!parsed.success) {
        const errors = parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
        return sendError(res, 400, 'Validation error', errors);
    }

    const food = await foodService.updateFood(req.params.id, parsed.data, req.file);
    await invalidateCache('foods:all', `foods:${req.params.id}`);
    return sendResponse(res, 200, 'Food updated successfully', food);
});

export const deleteFood = asyncHandler(async (req, res) => {
    await foodService.deleteFood(req.params.id);
    await invalidateCache('foods:all', `foods:${req.params.id}`);
    return sendResponse(res, 200, 'Food deleted successfully');
});