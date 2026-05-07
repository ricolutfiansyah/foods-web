import * as categoryService from '../services/categoryService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/response.js';
import { invalidateCache } from '../middlewares/cacheMiddleware.js';
import { createCategorySchema, updateCategorySchema } from '../validators/categoryValidator.js';

export const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await categoryService.getAllCategories();
    return sendResponse(res, 200, 'Categories retrieved successfully', categories);
});

export const getCategoryById = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);
    return sendResponse(res, 200, 'Category retrieved successfully', category);
});

export const createCategory = asyncHandler(async (req, res) => {
    const validation = createCategorySchema.safeParse(req.body);
    if (!validation.success) {
        return sendError(res, 400, 'Validation Error', validation.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        })));
    }
    const category = await categoryService.createCategory(validation.data);
    await invalidateCache('categories:all');
    return sendResponse(res, 201, 'Category created successfully', category);
});

export const updateCategory = asyncHandler(async (req, res) => {
    const validation = updateCategorySchema.safeParse(req.body);
    if (!validation.success) {
        return sendError(res, 400, 'Validation Error', validation.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        })));
    }
    const category = await categoryService.updateCategory(req.params.id, validation.data);
    await invalidateCache('categories:all', `categories:${req.params.id}`);
    return sendResponse(res, 200, 'Category updated successfully', category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
    await categoryService.deleteCategory(req.params.id);
    await invalidateCache('categories:all', `categories:${req.params.id}`);
    return sendResponse(res, 200, 'Category deleted successfully');
});
