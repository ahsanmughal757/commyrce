import { cn } from '@/lib/format'

export function formatCentsShort(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

/**
 * Renders the effective (sale) price, with the original price struck through when discounted.
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
  const onSale = salePriceCents < priceCents
  return (
    <span className={cn('flex items-baseline gap-2', className)}>
      <span className="text-base font-semibold">{formatCentsShort(salePriceCents)}</span>
      {onSale && <span className="text-sm text-foreground/50 line-through">{formatCentsShort(priceCents)}</span>}
    </span>
  )
}