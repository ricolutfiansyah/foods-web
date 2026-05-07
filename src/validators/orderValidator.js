import { z } from 'zod';

export const checkoutSchema = z.object({
  note: z.string().optional(),
  cartItemIds: z.array(z.string().uuid()).min(1, 'Pilih minimal 1 item untuk checkout').optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status tidak valid' })
  })
});
