import * as categoryService from '../services/categoryService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';
import { invalidateCache } from '../middlewares/cacheMiddleware.js';

export const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await categoryService.getAllCategories();
    sendResponse(res, 200, 'Categories retrieved successfully', categories);
});

export const getCategoryById = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);
    sendResponse(res, 200, 'Category retrieved successfully', category);
});

export const createCategory = asyncHandler(async (req, res) => {
    if (!req.body.name) {
        throw new AppError('Category name is required', 400);
    }
    const category = await categoryService.createCategory(req.body);
    await invalidateCache('categories:all');
    sendResponse(res, 201, 'Category created successfully', category);
});

export const updateCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    await invalidateCache('categories:all', `categories:${req.params.id}`);
    sendResponse(res, 200, 'Category updated successfully', category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
    await categoryService.deleteCategory(req.params.id);
    await invalidateCache('categories:all', `categories:${req.params.id}`);
    sendResponse(res, 200, 'Category deleted successfully');
});