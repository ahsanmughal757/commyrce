import { Schema, model, type Types } from 'mongoose'

export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled'

export interface OrderItem {
  productId: Types.ObjectId
  name: string
  image: string | null
  priceCents: number
  quantity: number
}

export interface OrderDoc {
  orderNumber: string
  customerEmail: string
  customerName?: string
  items: OrderItem[]
  subtotalCents: number
  totalCents: number
  currency: string
  status: OrderStatus
  stripeSessionId?: string
  stripePaymentIntentId?: string
  createdAt?: Date
  updatedAt?: Date
}

const orderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, default: null },
    priceCents: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
)

const orderSchema = new Schema<OrderDoc>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerName: { type: String, trim: true },
    items: { type: [orderItemSchema], required: true },
    subtotalCents: { type: Number, required: true, min: 0 },
    totalCents: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'usd', lowercase: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'fulfilled', 'cancelled'],
      default: 'pending',
      index: true
    },
    stripeSessionId: { type: String, sparse: true, unique: true },
    stripePaymentIntentId: { type: String }
  },
  { timestamps: true }
)

export const Order = model<OrderDoc>('Order', orderSchema)