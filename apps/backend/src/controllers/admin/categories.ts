import { Category } from '../../models/Category.js'
import { Product } from '../../models/Product.js'
import { uniqueSlug } from '../../services/catalogService.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { conflict, notFound } from '../../utils/ApiError.js'

function toDto(doc: { _id: unknown; name: string; slug: string }) {
  return { id: doc._id, name: doc.name, slug: doc.slug }
}

export const index = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean()
  const counts = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ])
  const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]))

  res.json({
    success: true,
    categories: categories.map((c) => ({
      ...toDto(c),
      productCount: countMap.get(c._id.toString()) ?? 0
    }))
  })
})

export const create = asyncHandler(async (req, res) => {
  const slug = await uniqueSlug(Category, req.body.name)
  const category = await Category.create({ name: req.body.name, slug })
  res.status(201).json({ success: true, category: toDto(category) })
})

export const update = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) throw notFound('Category not found')

  const slug = req.body.name !== category.name ? await uniqueSlug(Category, req.body.name, category.id) : category.slug
  category.set({ name: req.body.name, slug })
  await category.save()
  res.json({ success: true, category: toDto(category) })
})

export const remove = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) throw notFound('Category not found')

  const productCount = await Product.countDocuments({ category: category.id })
  if (productCount > 0) throw conflict(`Cannot delete: ${productCount} product(s) reference this category`)

  await category.deleteOne()
  res.json({ success: true })
})