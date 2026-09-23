import mongoose from 'mongoose'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Product } from '../models/Product.js'
import { Order } from '../models/Order.js'
import { badRequest, notFound } from '../utils/ApiError.js'
import { generateOrderNumber } from '../utils/slugify.js'
import { createCheckoutSession, verifyWebhookSignature } from '../services/stripeService.js'
import { env } from '../config/env.js'
import type { Request, Response } from 'express'

function salePriceCents(priceCents: number, discountPercent: number): number {
  if (!discountPercent) return priceCents
  return Math.round(priceCents * (1 - discountPercent / 100))
}

export const createSession = asyncHandler(async (req, res) => {
  const items = req.body.items as { productId: string; quantity: number }[]

  const orderItems = []
  let totalCents = 0

  for (const item of items) {
    const product = await Product.findById(item.productId).lean()
    if (!product) throw notFound('A product in your cart no longer exists')
    if (!product.published) throw badRequest(`"${product.name}" is no longer available`)
    if (product.stock < item.quantity) {
      throw badRequest(
        `Only ${product.stock} left in stock for "${product.name}". Please adjust your cart.`
      )
    }

    const priceCents = salePriceCents(product.priceCents, product.discountPercent ?? 0)
    orderItems.push({
      productId: product._id,
      name: product.name,
      image: product.images?.[0] ?? null,
      priceCents,
      quantity: item.quantity
    })
    totalCents += priceCents * item.quantity
  }

  const customerEmail =
    req.user?.email ?? (req.body.email as string | undefined)?.toLowerCase() ?? 'guest@commyrce.local'

  const orderNumber = generateOrderNumber()
  const order = await Order.create({
    orderNumber,
    customerEmail,
    customerName: req.body.name,
    items: orderItems,
    subtotalCents: totalCents,
    totalCents,
    currency: env.STRIPE_CURRENCY
  })

  const url = await createCheckoutSession({
    orderNumber,
    customerEmail,
    items: orderItems.map((o) => ({
      productId: o.productId.toString(),
      name: o.name,
      image: o.image ?? null,
      priceCents: o.priceCents,
      quantity: o.quantity
    })),
    totalCents,
    strippedBaseUrl: env.FRONTEND_ORIGIN
  })

  order.stripeSessionId = url.sessionId
  await order.save()

  res.json({ success: true, url: url.url })
})

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = String(req.headers['stripe-signature'] ?? '')
  if (!signature) {
    res.status(400).json({ success: false, message: 'Missing stripe-signature header' })
    return
  }

  let event
  try {
    event = verifyWebhookSignature(req.body as Buffer, signature)
  } catch {
    res.status(400).json({ success: false, message: 'Invalid webhook signature' })
    return
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    if (typeof session === 'object' && session !== null && 'metadata' in session) {
      const metadata = session.metadata ?? {}
      const orderNumber = String(metadata.orderNumber ?? '')
      if (orderNumber) {
        await markOrderPaid(orderNumber, session.payment_intent?.toString())
      }
    }
  }

  res.json({ received: true })
}

async function markOrderPaid(orderNumber: string, paymentIntentId: string | undefined): Promise<void> {
  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({ orderNumber }).session(session)
      if (!order) throw new Error(`Order ${orderNumber} not found`)
      if (order.status === 'paid') return

      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        ).session(session)
      }

      order.status = 'paid'
      order.stripePaymentIntentId = paymentIntentId
      await order.save({ session })
    })
  } finally {
    await session.endSession()
  }
}