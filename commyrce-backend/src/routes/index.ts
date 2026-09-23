import { Router } from 'express'
import type { Response } from 'express'
import mongoose from 'mongoose'
import { authRouter } from './auth.js'
import { productsRouter } from './products.js'
import { checkoutRouter } from './checkout.js'
import { adminRouter } from './admin.js'

export const apiRouter = Router()

apiRouter.get('/health', async (_req, res: Response) => {
  const dbState = mongoose.connection.readyState
  res.status(dbState === 1 ? 200 : 503).json({
    success: true,
    service: 'commyrce-api',
    uptime: process.uptime(),
    db: dbState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  })
})

apiRouter.use('/auth', authRouter)
apiRouter.use('/products', productsRouter)
apiRouter.use('/checkout', checkoutRouter)
apiRouter.use('/admin', adminRouter)