import { z } from 'zod'

export const checkoutLineItemSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product id'),
  quantity: z.coerce.number().int('Quantity must be a whole number').min(1, 'Quantity must be at least 1').max(999)
})

export const checkoutSchema = z.object({
  items: z.array(checkoutLineItemSchema).min(1, 'Cart is empty').max(100),
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().email().max(254).optional()
})

export const adminIndexQueryValidator = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    sort: z.enum(['newest', 'price-asc', 'price-desc', 'name-asc', 'name-desc', 'low-stock']).default('newest'),
    q: z.string().trim().max(200).optional(),
    category: z.string().trim().max(100).optional(),
    published: z.enum(['true', 'false']).optional(),
    minStock: z.coerce.number().int().min(0).optional(),
    maxStock: z.coerce.number().int().min(0).optional()
  })
  .strip()