import { Schema, model, type Types, type InferSchemaType } from 'mongoose'

const PRODUCT_SORT_FIELDS = ['newest', 'price-asc', 'price-desc', 'name-asc', 'name-desc', 'most-discounted'] as const
export type ProductSort = (typeof PRODUCT_SORT_FIELDS)[number]

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '' },
    priceCents: { type: Number, required: true, min: 0, integer: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    images: { type: [String], default: [] },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    stock: { type: Number, default: 0, min: 0, integer: true },
    sku: { type: String, trim: true, sparse: true, unique: true },
    tags: { type: [String], default: [] },
    published: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false, index: true }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

productSchema.virtual('salePriceCents').get(function () {
  if (!this.discountPercent) return this.priceCents
  return Math.round(this.priceCents * (1 - this.discountPercent / 100))
})

productSchema.virtual('coverImage').get(function () {
  return this.images && this.images.length > 0 ? this.images[0] : null
})

export type ProductDoc = InferSchemaType<typeof productSchema> & {
  salePriceCents: number
  coverImage: string | null
}
export type ProductId = Types.ObjectId

export const Product = model('Product', productSchema)
export { PRODUCT_SORT_FIELDS }