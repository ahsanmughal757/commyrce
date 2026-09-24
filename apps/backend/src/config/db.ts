import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true)
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(env.MONGO_URI)
  console.log('🔌 MongoDB connected')
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
}