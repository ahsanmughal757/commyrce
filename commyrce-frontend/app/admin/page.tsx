'use client'

import Link from 'next/link'
import { Card, Chip, Spinner } from '@heroui/react'
import { AlertTriangle, Banknote, Package, ShoppingCart } from 'lucide-react'
import { useDashboard } from '@/lib/hooks'
import { formatCents } from '@/lib/format'
import { formatDate } from '@/lib/format'
import ButtonLink from '@/components/ButtonLink'
import ErrorState from '@/components/ErrorState'

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  paid: 'success',
  pending: 'warning',
  fulfilled: 'success',
  cancelled: 'danger'
}

export default function AdminDashboardPage() {
  const { data, isPending, isError, error, refetch } = useDashboard()

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" color="accent" />
      </div>
    )
  }

  if (isError || !data) {
    return <ErrorState message={error instanceof Error ? error.message : 'Failed to load dashboard.'} onRetry={() => void refetch()} />
  }

  const cards = [
    { label: 'Products', value: String(data.stats.productCount), icon: Package },
    { label: 'Published', value: String(data.stats.publishedCount), icon: Package },
    { label: 'Low stock', value: String(data.stats.lowStockCount), icon: AlertTriangle },
    { label: 'Orders (30d)', value: String(data.stats.ordersLast30Days), icon: ShoppingCart },
    { label: 'Revenue (30d)', value: formatCents(data.stats.revenueLast30DaysCents), icon: Banknote }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <ButtonLink href="/admin/products/new">New product</ButtonLink>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="p-3">
              <Card.Content className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-foreground/5">
                  <Icon className="size-5 text-foreground/70" />
                </div>
                <div>
                  <p className="text-xs text-foreground/50">{card.label}</p>
                  <p className="text-lg font-semibold">{card.value}</p>
                </div>
              </Card.Content>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <Card.Header>
            <h2 className="text-lg font-semibold">Low stock ({data.lowStockProducts.length})</h2>
          </Card.Header>
          <Card.Content className="space-y-2">
            {data.lowStockProducts.length === 0 && <p className="text-sm text-foreground/50">No products are low on stock.</p>}
            {data.lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-2 rounded-md bg-foreground/5 px-3 py-2">
                <div className="min-w-0">
                  <Link href={`/admin/products/${product.id}`} className="block truncate text-sm font-medium hover:underline">
                    {product.name}
                  </Link>
                  <p className="text-xs text-foreground/50">{product.sku || '—'}</p>
                </div>
                <Chip color="warning" size="sm" variant="soft">
                  {product.stock} left
                </Chip>
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card className="p-4">
          <Card.Header>
            <h2 className="text-lg font-semibold">Recent orders</h2>
          </Card.Header>
          <Card.Content className="space-y-2">
            {data.recentOrders.length === 0 && <p className="text-sm text-foreground/50">No orders yet.</p>}
            {data.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-2 rounded-md bg-foreground/5 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {order.orderNumber} — {order.customerName || order.customerEmail}
                  </p>
                  <p className="text-xs text-foreground/50">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{formatCents(order.totalCents)}</span>
                  <Chip color={STATUS_COLORS[order.status] ?? 'default'} size="sm" variant="soft">
                    {order.status}
                  </Chip>
                </div>
              </div>
            ))}
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}