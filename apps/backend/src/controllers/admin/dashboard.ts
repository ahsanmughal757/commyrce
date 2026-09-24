import { asyncHandler } from '../../utils/asyncHandler.js'
import { Product } from '../../models/Product.js'
import { Order } from '../../models/Order.js'

export const summary = asyncHandler(async (_req, res) => {
  const [productCount, publishedCount, lowStock, orderLast30, revenueLast30] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ published: true }),
    Product.countDocuments({ stock: { $lte: 5 } }),
    Order.aggregate([
      { $match: { status: { $in: ['paid', 'fulfilled'] }, createdAt: { $gte: daysAgo(30) } } },
      { $count: 'count' }
    ]),
    Order.aggregate([
      { $match: { status: { $in: ['paid', 'fulfilled'] }, createdAt: { $gte: daysAgo(30) } } },
      { $group: { _id: null, total: { $sum: '$totalCents' } } }
    ])
  ])

  const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
    .select('name stock slug images priceCents discountPercent')
    .sort({ stock: 1 })
    .limit(8)
    .lean()

  const recentOrders = await Order.find({ status: 'paid' })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('orderNumber customerEmail totalCents createdAt status')
    .lean()

  res.json({
    success: true,
    stats: {
      productCount,
      publishedCount,
      lowStockCount: lowStock,
      ordersLast30Days: orderLast30[0]?.count ?? 0,
      revenueLast30DaysCents: revenueLast30[0]?.total ?? 0
    },
    lowStockProducts,
    recentOrders
  })
})

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}