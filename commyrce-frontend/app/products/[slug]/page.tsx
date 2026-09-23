import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { API_BASE } from '@/lib/api'
import type { Product } from '@/lib/types'
import ProductDetail from '@/components/ProductDetail'

interface FetchResult {
  product: Product | null
  /** true when the API reported a 404 (product genuinely missing) */
  missing: boolean
}

async function fetchProduct(slug: string): Promise<FetchResult> {
  try {
    const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(slug)}`, { cache: 'no-store' })
    if (res.status === 404) return { product: null, missing: true }
    if (!res.ok) return { product: null, missing: false }
    const data = await res.json()
    return { product: data?.product ?? null, missing: false }
  } catch {
    // Backend unreachable — fall through to the client component, which will
    // render a friendly, retryable error instead of crashing the page.
    return { product: null, missing: false }
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { product } = await fetchProduct(slug)
  if (!product) return { title: 'Product not found' }
  return { title: product.name, description: product.description }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { missing } = await fetchProduct(slug)

  if (missing) notFound()

  return (
    <div className="space-y-8">
      {/* ProductDetail owns loading/error/retry states for the client fetch. */}
      <ProductDetail slug={slug} />
    </div>
  )
}