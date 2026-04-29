import { z } from 'zod';

export const createFoodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be a positive number'),
  stock: z.coerce.number().int().nonnegative('Stock must be zero or a positive integer'),
  categoryId: z.string().uuid('Invalid category ID'),
  isAvailable: z.coerce.boolean().optional().default(true),
});

export const updateFoodSchema = createFoodSchema.partial();