import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, CloudOff, ShoppingBag } from 'lucide-react'
import { API_BASE } from '@/lib/api'
import type { Product } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
import ButtonLink from '@/components/ButtonLink'

interface CategoryItem {
  slug: string
  name: string
}

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return fallback
    const data = await res.json()
    return (data ?? fallback) as T
  } catch {
    return fallback
  }
}

async function fetchProducts(query: Record<string, string>): Promise<Product[]> {
  const sp = new URLSearchParams({ limit: '8', page: '1', ...query })
  const data = await safeFetch<{ items?: Product[] }>(`${API_BASE}/api/products?${sp.toString()}`, {})
  return data?.items ?? []
}

export const revalidate = 60

export const metadata: Metadata = { title: 'Home' }

export default async function HomePage() {
  const [newArrivals, deals, categoriesRes] = await Promise.all([
    fetchProducts({ sort: 'newest' }),
    fetchProducts({ minDiscount: '15', sort: 'most-discounted' }),
    safeFetch<{ categories?: CategoryItem[] }>(`${API_BASE}/api/products/categories`, {})
  ])
  const categories = categoriesRes?.categories ?? []
  const catalogUnavailable = newArrivals.length === 0

  return (
    <div className="space-y-12">
      {catalogUnavailable && (
        <div className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <CloudOff className="size-4 shrink-0" />
          <span>We&apos;re having trouble reaching the store right now. Please try again shortly.</span>
        </div>
      )}

      <section className="flex flex-col items-center gap-4 rounded-2xl border border-separator bg-linear-to-r from-foreground/5 to-transparent px-6 py-16 text-center">
        <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-medium text-accent">New season</span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Everything you need, delivered.</h1>
        <p className="max-w-xl text-foreground/60">
          Browse a carefully curated catalog, check out securely with Stripe, and track your orders from one place.
        </p>
        <div className="flex items-center gap-3">
          <ButtonLink href="/products">
            <ShoppingBag className="size-4" />
            Shop now
          </ButtonLink>
          <ButtonLink href="/products?minDiscount=15" variant="tertiary">
            View deals
            <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Categories</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link key={category.slug} href={`/products?category=${category.slug}`}>
                <span className="inline-block rounded-full border border-separator px-4 py-1.5 text-sm transition-colors hover:bg-foreground/5">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">New arrivals</h2>
            <Link href="/products" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {deals.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Today&apos;s deals</h2>
            <Link href="/products?minDiscount=15" className="text-sm text-accent hover:underline">
              View all deals
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {deals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}