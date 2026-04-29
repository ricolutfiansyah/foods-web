import * as foodRepository from '../repositories/foodRepository.js';
import supabase from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { getPaginationOptions, formatPaginationMeta } from '../utils/pagination.js';
import crypto from 'crypto';

export const getAllFoods = async (query) => {
  const { page, limit, search, categoryId, isAvailable } = query;
  const { skip, take, page: parsedPage, limit: parsedLimit } = getPaginationOptions(page, limit);

  const { data, total } = await foodRepository.findAll({
    skip,
    take,
    search,
    categoryId,
    isAvailable
  });

  const meta = formatPaginationMeta(parsedPage, parsedLimit, total);
  return { data, meta };
};

export const getFoodById = async (id) => {
  const food = await foodRepository.findById(id);
  if (!food) {
    throw new AppError('Food not found', 404);
  }
  return food;
};

export const createFood = async (data, file) => {
  const foodData = { ...data };

  if (file) {
    const uuid = crypto.randomUUID();
    const originalname = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const imageKey = `foods/${uuid}-${originalname}`;

    const { error } = await supabase.storage
      .from('foods')
      .upload(imageKey, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new AppError(`Failed to upload image: ${error.message}`, 500);
    }

    const { data: publicUrlData } = supabase.storage
      .from('foods')
      .getPublicUrl(imageKey);

    foodData.imageUrl = publicUrlData.publicUrl;
    foodData.imageKey = imageKey;
  }

  return foodRepository.create(foodData);
};

export const updateFood = async (id, data, file) => {
  const food = await foodRepository.findById(id);
  if (!food) {
    throw new AppError('Food not found', 404);
  }

  const updateData = { ...data };

  if (file) {
    const uuid = crypto.randomUUID();
    const originalname = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const imageKey = `foods/${uuid}-${originalname}`;

    const { error } = await supabase.storage
      .from('foods')
      .upload(imageKey, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new AppError(`Failed to upload image: ${error.message}`, 500);
    }

    const { data: publicUrlData } = supabase.storage
      .from('foods')
      .getPublicUrl(imageKey);

    updateData.imageUrl = publicUrlData.publicUrl;
    updateData.imageKey = imageKey;

    if (food.imageKey) {
      await supabase.storage.from('foods').remove([food.imageKey]);
    }
  }

  return foodRepository.update(id, updateData);
};

export const deleteFood = async (id) => {
  const food = await foodRepository.findById(id);
  if (!food) {
    throw new AppError('Food not found', 404);
  }

  if (food.imageKey) {
    await supabase.storage.from('foods').remove([food.imageKey]);
  }

  return foodRepository.deleteFood(id);
};