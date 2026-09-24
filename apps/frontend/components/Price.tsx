import { cn } from '@/lib/format'

export function formatCentsShort(cents: number): string {
  if (!Number.isFinite(cents)) return ''
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

/**
 * Renders the effective (sale) price, with the original price struck through when discounted.
 * Falls back to the list price whenever the sale price is missing or invalid so the UI can
 * never render a broken "NaN" value.
 */
export function PriceDisplay({
  priceCents,
  salePriceCents,
  className
}: {
  priceCents: number
  salePriceCents: number
  className?: string
}) {
  const listPrice = Number.isFinite(priceCents) ? priceCents : 0
  const hasSale = Number.isFinite(salePriceCents) && salePriceCents >= 0 && salePriceCents < listPrice
  const shownPrice = hasSale ? salePriceCents : listPrice
  return (
    <span className={cn('flex items-baseline gap-2', className)}>
      <span className="text-base font-semibold">{formatCentsShort(shownPrice)}</span>
      {hasSale && <span className="text-sm text-foreground/50 line-through">{formatCentsShort(listPrice)}</span>}
    </span>
  )
}