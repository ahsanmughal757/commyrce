import { z } from 'zod'
import { validateParams, validateQuery } from '../middlewares/validate.js'

const slugSchema = z.string().trim().min(1).max(200)

export const categoryRefSchema = z.union([
  z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id'),
  z.string().trim().min(1).max(100)
])

export const productUpsertSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(200),
  description: z.string().trim().max(5000).default(''),
  priceCents: z.coerce.number().int('Price must be a whole number of cents').min(1, 'Price must be greater than zero'),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  category: categoryRefSchema,
  stock: z.coerce.number().int().min(0).default(0),
  sku: z.string().trim().max(64).optional().or(z.literal('')),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  images: z.array(z.string().url('Each image must be a valid URL')).max(8).default([]),
  published: z.boolean().default(true),
  featured: z.boolean().default(false)
})

export const productParamsSchema = { id: slugSchema, slug: slugSchema }

export const productByIdParamsValidator = validateParams(
  z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product id') })
)

export const productSlugParamsValidator = validateParams(
  z.object({ slug: z.string().trim().min(1).max(200) })
)

export const categoryUpsertSchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(100)
})

export const categoryByIdParamsValidator = validateParams(
  z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id') })
)

export const productIndexQueryValidator = validateQuery(
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(60).default(20),
    sort: z
      .enum(['newest', 'price-asc', 'price-desc', 'name-asc', 'name-desc', 'most-discounted'])
      .default('newest'),
    q: z.string().trim().max(200).optional(),
    category: z.string().trim().max(100).optional(),
    minDiscount: z.coerce.number().min(0).max(100).optional(),
    minPriceCents: z.coerce.number().int().min(0).optional(),
    maxPriceCents: z.coerce.number().int().min(0).optional()
  })
)

export const categoryIndexQueryValidator = validateQuery(z.object({}))

export const adminIndexQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  sort: z
    .enum(['newest', 'price-asc', 'price-desc', 'name-asc', 'name-desc', 'low-stock'])
    .default('newest'),
  q: z.string().trim().max(200).optional(),
  category: z.string().trim().max(100).optional(),
  published: z.enum(['true', 'false']).optional(),
  minStock: z.coerce.number().int().min(0).optional(),
  maxStock: z.coerce.number().int().min(0).optional()
})

export const adminIndexQueryValidator = validateQuery(adminIndexQuerySchema)

export const productToggleSchema = z.object({
  published: z.boolean().optional(),
  featured: z.boolean().optional()
})

export { slugSchema }