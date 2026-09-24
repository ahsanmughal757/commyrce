import { Schema, model } from 'mongoose'

export interface CategoryDoc {
  name: string
  slug: string
  createdAt?: Date
  updatedAt?: Date
}

const categorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true }
  },
  { timestamps: true }
)

export const Category = model<CategoryDoc>('Category', categorySchema)