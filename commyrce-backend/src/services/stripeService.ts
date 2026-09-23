import type Stripe from 'stripe'
import { env } from '../config/env.js'
import { stripe } from '../config/stripe.js'
import { ApiError } from '../utils/ApiError.js'

export interface CheckoutPayloadItem {
  productId: string
  name: string
  image: string | null
  priceCents: number
  quantity: number
}

export async function createCheckoutSession(input: {
  orderNumber: string
  customerEmail: string
  items: CheckoutPayloadItem[]
  totalCents: number
  strippedBaseUrl: string
}): Promise<{ url: string; sessionId: string }> {
  const lineItems = input.items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: env.STRIPE_CURRENCY,
      unit_amount: item.priceCents,
      product_data: {
        name: item.name,
        ...(item.image ? { images: [item.image] } : {})
      }
    }
  }))

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: input.customerEmail,
    line_items: lineItems,
    success_url: `${input.strippedBaseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.strippedBaseUrl}/cart`,
    client_reference_id: input.orderNumber,
    metadata: { orderNumber: input.orderNumber }
  })

  if (!session.url) {
    throw new ApiError(502, 'Stripe did not return a checkout URL')
  }
  return { url: session.url, sessionId: session.id }
}

export function verifyWebhookSignature(rawBody: Buffer, signature: string): Stripe.Event {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new ApiError(500, 'STRIPE_WEBHOOK_SECRET is not configured')
  }
  return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET)
}