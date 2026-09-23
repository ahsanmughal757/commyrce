import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import { ApiError } from '../utils/ApiError.js'

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`))
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message, details: err.details })
    return
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ success: false, message: 'Validation failed', details: err.errors })
    return
  }

  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    res.status(409).json({ success: false, message: 'Duplicate key — resource already exists' })
    return
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ success: false, message: 'Invalid JSON payload' })
    return
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image exceeds the 5MB size limit'
        : err.code === 'LIMIT_FILE_COUNT'
          ? `Up to ${'8'} images allowed`
          : `Upload failed: ${err.message}`
    res.status(400).json({ success: false, message })
    return
  }

  console.error('💥 Unhandled error:', err)
  res.status(500).json({ success: false, message: 'Internal server error' })
}