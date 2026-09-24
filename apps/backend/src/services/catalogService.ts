import type { Model } from 'mongoose'
import { Category } from '../models/Category.js'
import { badRequest } from '../utils/ApiError.js'
import { slugify } from '../utils/slugify.js'

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/

export async function resolveCategory(input: string) {
  const isId = OBJECT_ID_RE.test(input)
  const doc = await Category.findOne(isId ? { _id: input } : { slug: slugify(input) }).lean()
  if (!doc) throw badRequest(`Category "${input}" does not exist`)
  return doc._id
}

export async function uniqueSlug(
  model: Model<any>,
  base: string,
  excludeId?: string
): Promise<string> {
  const root = slugify(base) || 'item'
  let slug = root
  let i = 2
  for (;;) {
    const exists = await model.exists(excludeId ? { slug, _id: { $ne: excludeId } } : { slug })
    if (!exists) return slug
    slug = `${root}-${i}`
    i += 1
  }
}