import type { PipelineStage } from 'mongoose'
import { Product, type ProductSort } from '../models/Product.js'
import { Category } from '../models/Category.js'
import { notFound } from '../utils/ApiError.js'

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/

export interface ProductIndexFilters {
  page: number
  limit: number
  sort: ProductSort
  q?: string
  category?: string
  minDiscount?: number
  minPriceCents?: number
  maxPriceCents?: number
}

export interface AdminProductFilters extends ProductIndexFilters {
  published?: 'true' | 'false'
  minStock?: number
  maxStock?: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function sortStage(sort: ProductSort): Record<string, 1 | -1> {
  switch (sort) {
    case 'price-asc':
      return { effectivePriceCents: 1, createdAt: -1 }
    case 'price-desc':
      return { effectivePriceCents: -1, createdAt: -1 }
    case 'name-asc':
      return { name: 1 }
    case 'name-desc':
      return { name: -1 }
    case 'most-discounted':
      return { discountPercent: -1, createdAt: -1 }
    case 'newest':
    default:
      return { createdAt: -1 }
  }
}

function effectivePriceField() {
  return {
    $cond: [
      { $gt: ['$discountPercent', 0] },
      {
        $round: [
          {
            $subtract: [
              '$priceCents',
              { $divide: [{ $multiply: ['$priceCents', '$discountPercent'] }, 100] }
            ]
          }
        ]
      },
      '$priceCents'
    ]
  }
}

async function resolveCategoryId(category: string) {
  const isId = OBJECT_ID_RE.test(category)
  const doc = await Category.findOne(isId ? { _id: category } : { slug: category }).lean()
  return doc?._id ?? null
}

async function runPipeline<T>(
  filters: ProductIndexFilters,
  publishedOnly: boolean,
  admin?: AdminProductFilters
): Promise<PaginatedResult<T>> {
  const match: Record<string, unknown> = {}

  if (publishedOnly) match.published = true
  if (admin?.published) match.published = admin.published === 'true'

  if (filters.category) {
    const categoryId = await resolveCategoryId(filters.category)
    if (!categoryId) {
      return { items: [], total: 0, page: filters.page, limit: filters.limit, totalPages: 0 }
    }
    match.category = categoryId
  }

  if (filters.q) {
    const regex = new RegExp(escapeRegex(filters.q), 'i')
    match.$or = [{ name: regex }, { sku: regex }, { tags: regex }]
  }

  if (filters.minDiscount !== undefined && filters.minDiscount > 0) {
    match.discountPercent = { $gte: filters.minDiscount }
  }

  if (admin?.minStock !== undefined) match.stock = { ...(match.stock as object), $gte: admin.minStock }
  if (admin?.maxStock !== undefined) match.stock = { ...(match.stock as object), $lte: admin.maxStock }

  const pipeline: PipelineStage[] = [
    { $match: match as never },
    { $addFields: { effectivePriceCents: effectivePriceField() } }
  ]

  if (filters.minPriceCents !== undefined || filters.maxPriceCents !== undefined) {
    const range: Record<string, number> = {}
    if (filters.minPriceCents !== undefined) range.$gte = filters.minPriceCents
    if (filters.maxPriceCents !== undefined) range.$lte = filters.maxPriceCents
    pipeline.push({ $match: { effectivePriceCents: range } as never })
  }

  const countStage: PipelineStage[] = [...pipeline, { $count: 'total' }]
  const pageStage: PipelineStage[] = [
    ...pipeline,
    { $sort: sortStage(filters.sort) as never },
    { $skip: (filters.page - 1) * filters.limit },
    { $limit: filters.limit },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryRef'
      }
    },
    { $unwind: { path: '$categoryRef', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: { $toString: '$_id' },
        name: 1,
        slug: 1,
        description: 1,
        priceCents: 1,
        discountPercent: 1,
        effectivePriceCents: 1,
        images: 1,
        coverImage: { $arrayElemAt: ['$images', 0] },
        stock: 1,
        sku: 1,
        tags: 1,
        published: 1,
        featured: 1,
        createdAt: 1,
        updatedAt: 1,
        categoryId: '$categoryRef._id',
        categoryName: '$categoryRef.name',
        categorySlug: '$categoryRef.slug'
      } as never
    }
  ]

  const [countResult, items] = await Promise.all([
    Product.aggregate(countStage),
    Product.aggregate(pageStage)
  ])

  const total = countResult.length > 0 ? Number(countResult[0].total) : 0
  return {
    items: items as unknown as T[],
    page: filters.page,
    limit: filters.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.limit))
  }
}

export function listPublishedProducts(filters: ProductIndexFilters): Promise<PaginatedResult<unknown>> {
  return runPipeline<unknown>(filters, true)
}

export function listAdminProducts(filters: AdminProductFilters): Promise<PaginatedResult<unknown>> {
  return runPipeline<unknown>(filters, false, filters)
}

export async function findPublishedBySlug(slug: string) {
  const doc = await Product.findOne({ slug, published: true }).populate('category', 'name slug').lean()
  if (!doc) throw notFound('Product not found')
  return normalize(doc as unknown as Record<string, unknown>)
}

export async function findAdminById(id: string) {
  const doc = await Product.findById(id).populate('category', 'name slug').lean()
  if (!doc) throw notFound('Product not found')
  return normalize(doc as unknown as Record<string, unknown>)
}

function normalize(doc: Record<string, unknown>) {
  const { _id: id, ...rest } = doc
  const category = rest.category as { name?: string; slug?: string; _id?: unknown } | null
  const priceCents = Number(rest.priceCents)
  const discountPercent = Number(rest.discountPercent ?? 0)
  const salePriceCents =
    discountPercent > 0 ? Math.round(priceCents * (1 - discountPercent / 100)) : priceCents
  const images = Array.isArray(rest.images) ? (rest.images as string[]) : []
  return {
    id,
    ...rest,
    priceCents,
    discountPercent,
    salePriceCents,
    coverImage: images[0] ?? null,
    category: category ? { id: category._id, name: category.name, slug: category.slug } : null
  }
}