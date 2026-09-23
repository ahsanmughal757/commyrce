import express, { type Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { corsOrigins, isProduction } from './config/env.js'
import { configureCloudinary } from './config/cloudinary.js'
import { apiRouter } from './routes/index.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'

export function createApp(): Express {
  const app = express()
  app.disable('x-powered-by')

  configureCloudinary()

  app.set('trust proxy', 1)

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  )

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true
    })
  )

  // Webhook must receive the raw body (unparsed JSON) for signature verification.
  app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }))
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))
  app.use(cookieParser())
  app.use(compression())

  if (!isProduction) {
    app.use(morgan('dev'))
  } else {
    app.use(morgan('combined'))
  }

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' }
  })
  app.use('/api/auth', authLimiter)
  app.use('/api/admin/auth', authLimiter)

  app.use('/api', apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}