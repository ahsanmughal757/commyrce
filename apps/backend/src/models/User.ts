import { Schema, model } from 'mongoose'

export interface UserDoc {
  name: string
  email: string
  passwordHash: string
  createdAt?: Date
  updatedAt?: Date
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }
  },
  { timestamps: true }
)

export const User = model<UserDoc>('User', userSchema)