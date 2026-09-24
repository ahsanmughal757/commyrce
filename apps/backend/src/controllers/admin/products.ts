import { Product } from '../../models/Product.js'
import { listAdminProducts, findAdminById } from '../../services/productQuery.js'
import { resolveCategory, uniqueSlug } from '../../services/catalogService.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { conflict, notFound } from '../../utils/ApiError.js'

export const index = asyncHandler(async (req, res) => {
  const { page, limit, sort, q, category, published, minStock, maxStock } = req.query as unknown as {
    page: number
    limit: number
    sort: 'newest'
    q?: string
    category?: string
    published?: 'true' | 'false'
    minStock?: number
    maxStock?: number
  }

  const result = await listAdminProducts({
    page,
    limit,
    sort,
    q,
    category,
    published,
    minStock,
    maxStock
  })
  res.json({ success: true, ...result })
})

export const get = asyncHandler(async (req, res) => {
  const product = await findAdminById(String(req.params.id))
  res.json({ success: true, product })
})

export const create = asyncHandler(async (req, res) => {
  const { name, description, priceCents, discountPercent, category, stock, sku, tags, images, published, featured } =
    req.body

  const slug = await uniqueSlug(Product, name)
  const categoryId = await resolveCategory(category)

  if (sku && (await Product.exists({ sku }))) throw conflict('SKU already exists')

  const product = await Product.create({
    name,
    slug,
    description,
    priceCents,
    discountPercent,
    category: categoryId,
    stock,
    sku: sku || undefined,
    tags,
    images,
    published,
    featured
  })

  const doc = await Product.findById(product.id).populate('category', 'name slug')
  res.status(201).json({ success: true, product: doc })
})

export const update = asyncHandler(async (req, res) => {
  const existing = await Product.findById(String(req.params.id))
  if (!existing) throw notFound('Product not found')

  const { name, description, priceCents, discountPercent, category, stock, sku, tags, images, published, featured } =
    req.body

  const slug =
    name && name !== existing.name ? await uniqueSlug(Product, name, existing.id) : existing.slug
  const categoryId = category ? await resolveCategory(category) : existing.category

  if (sku) {
    const dup = await Product.exists({ sku, _id: { $ne: existing.id } })
    if (dup) throw conflict('SKU already exists')
  }

  existing.set({
    name,
    slug,
    description,
    priceCents,
    discountPercent,
    category: categoryId,
    stock,
    sku: sku || undefined,
    tags,
    images,
    published,
    featured
  })
  await existing.save()

  const doc = await Product.findById(existing.id).populate('category', 'name slug')
  res.json({ success: true, product: doc })
})

export const remove = asyncHandler(async (req, res) => {
  const deleted = await Product.findByIdAndDelete(String(req.params.id))
  if (!deleted) throw notFound('Product not found')
  res.json({ success: true })
})

export const toggle = asyncHandler(async (req, res) => {
  const product = await Product.findById(String(req.params.id))
  if (!product) throw notFound('Product not found')

  if (typeof req.body.published === 'boolean') product.published = req.body.published
  if (typeof req.body.featured === 'boolean') product.featured = req.body.featured

  await product.save()
  res.json({
    success: true,
    product: { id: product.id, published: product.published, featured: product.featured }
  })
})