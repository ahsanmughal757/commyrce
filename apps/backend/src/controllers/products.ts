import { asyncHandler } from '../utils/asyncHandler.js'
import { findPublishedBySlug, listPublishedProducts } from '../services/productQuery.js'
import { Category } from '../models/Category.js'

export const index = asyncHandler(async (req, res) => {
  const { page, limit, sort, q, category, minDiscount, minPriceCents, maxPriceCents } =
    req.query as unknown as {
      page: number
      limit: number
      sort: 'newest'
      q?: string
      category?: string
      minDiscount?: number
      minPriceCents?: number
      maxPriceCents?: number
    }

  const result = await listPublishedProducts({
    page,
    limit,
    sort,
    q,
    category,
    minDiscount,
    minPriceCents,
    maxPriceCents
  })

  res.json({ success: true, ...result })
})

export const getBySlug = asyncHandler(async (req, res) => {
  const product = await findPublishedBySlug(String(req.params.slug))
  res.json({ success: true, product })
})

export const categories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean()
  res.json({
    success: true,
    categories: categories.map((c) => ({
      id: c._id,
      name: c.name,
      slug: c.slug
    }))
  })
})