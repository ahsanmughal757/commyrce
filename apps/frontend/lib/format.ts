export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export function categoryNameOf(p: {
  category?: { name?: string } | string
  categoryName?: string
}): string {
  if (typeof p.category === 'string') return p.category
  return p.categoryName ?? p.category?.name ?? ''
}

export function toDollarsInput(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function fromDollarsInput(input: string): number {
  return Math.round(parseFloat(input) * 100)
}