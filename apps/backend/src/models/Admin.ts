import { Schema, model } from 'mongoose'

export type AdminRole = 'admin' | 'superadmin'

export interface AdminDoc {
  name: string
  email: string
  passwordHash: string
  role: AdminRole
  createdAt?: Date
  updatedAt?: Date
}

const adminSchema = new Schema<AdminDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' }
  },
  { timestamps: true }
)

export const Admin = model<AdminDoc>('Admin', adminSchema)