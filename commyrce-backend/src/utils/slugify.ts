export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function generateOrderNumber(): string {
  const date = new Date()
  const yymmdd = [
    date.getFullYear().toString().slice(2),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('')
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `CM-${yymmdd}-${rand}`
}

export function formatCents(cents: number): string {
  return (cents / 100).toFixed(2)
}