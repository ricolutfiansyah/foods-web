import * as categoryRepository from '../repositories/categoryRepository.js';
import { AppError } from '../utils/AppError.js';

export const getAllCategories = async () => {
    return categoryRepository.findAll();
};

export const getCategoryById = async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    return category;
};

export const createCategory = async (data) => {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existingCategory = await categoryRepository.findBySlug(slug);
    if (existingCategory) {
        throw new AppError('Category with this name already exists', 409);
    }

    return categoryRepository.create({ name: data.name, slug });
};

export const updateCategory = async (id, data) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }

    const updateData = { ...data };

    if (data.name && data.name !== category.name) {
        updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const existingCategory = await categoryRepository.findBySlug(updateData.slug);
        if (existingCategory && existingCategory.id !== id) {
            throw new AppError('Category with this name already exists', 409);
        }
    }

    return categoryRepository.update(id, updateData);
};

export const deleteCategory = async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }

    return categoryRepository.deleteCategory(id);
};