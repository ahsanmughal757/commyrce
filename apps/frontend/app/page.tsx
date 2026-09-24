import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowRight, CloudOff, RefreshCw, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { API_BASE } from '@/lib/api'
import type { Product } from '@commyrce/shared'
import ProductCard from '@/components/ProductCard'
import ButtonLink from '@/components/ButtonLink'
import Reveal from '@/components/Reveal'

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

const TRUST = [
  { icon: ShieldCheck, label: 'Secure checkout' },
  { icon: Truck, label: 'Fast shipping' },
  { icon: RefreshCw, label: '30-day returns' }
]

function Hero({ products, categories }: { products: Product[]; categories: CategoryItem[] }) {
  const anchor = products[0]?.coverImage ?? products[0]?.images?.[0]
  const floaters = products.slice(0, 3).map((p) => p.coverImage ?? p.images?.[0]).filter(Boolean)
  const heroImage = anchor ?? floaters[0]

  return (
    <section className="noise relative -mx-4 overflow-hidden sm:-mx-6 lg:-mx-8">
      <div className="grid-lines absolute inset-0" />
      <div className="aurora aurora-accent -left-32 -top-24 h-[28rem] w-[28rem] opacity-70 animate-float-slow" />
      <div className="aurora aurora-cyan -right-24 top-16 h-[26rem] w-[26rem] opacity-50 animate-float" />
      <div className="aurora aurora-violet left-[38%] bottom-[-8rem] h-[24rem] w-[24rem] opacity-30 animate-float-slow" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
        {/* Copy */}
        <div>
          <span className="eyebrow inline-flex animate-fade-down items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5">
            <span className="size-1.5 rounded-full bg-accent animate-pop" />
            New season · Fresh drops
          </span>
          <h1 className="mt-6 animate-fade-up text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ animationDelay: '90ms' }}>
            Everything you need.
            <br />
            <span className="text-gradient">Delivered beautifully.</span>
          </h1>
          <p
            className="mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-foreground/60 sm:text-lg"
            style={{ animationDelay: '180ms' }}
          >
            A carefully curated catalog with honest pricing, live stock, and checkout so smooth it feels like magic.
            Browse fresh arrivals, grab today's deals, and track every order from one place.
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3" style={{ animationDelay: '270ms' }}>
            <ButtonLink href="/products" className="shine">
              <ShoppingBag className="size-4" />
              Shop now
            </ButtonLink>
            <ButtonLink href="/products?minDiscount=15" variant="tertiary" className="group press">
              View deals
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </ButtonLink>
          </div>
          <div className="mt-10 flex animate-fade-up flex-wrap items-center gap-x-6 gap-y-3" style={{ animationDelay: '360ms' }}>
            {TRUST.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2 text-sm font-medium text-foreground/60">
                <Icon className="size-4 text-accent" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Visual anchor — floating product art */}
        <div className="relative hidden h-[26rem] lg:block">
          <div className="absolute inset-0" aria-hidden>
            <div className="absolute right-24 top-0 h-44 w-44 rounded-full bg-accent/20 blur-2xl" />
            <div className="absolute bottom-6 left-6 h-40 w-40 rounded-full bg-cyan-500/20 blur-2xl" />
          </div>
          {heroImage && (
            <div className="media-zoom absolute right-0 top-2 z-10 ml-6 h-[20rem] w-[17rem] animate-float-slow overflow-hidden rounded-[1.6rem] border border-separator bg-surface p-2 shadow-[var(--overlay-shadow)]">
              <div className="relative h-full w-full overflow-hidden rounded-[1.1rem]">
                <Image src={heroImage} alt="" fill sizes="320px" className="object-cover" />
              </div>
            </div>
          )}
          {floaters[1] && (
            <div className="absolute -left-2 top-16 z-20 h-28 w-28 animate-float overflow-hidden rounded-2xl border border-separator bg-surface p-1 shadow-[var(--overlay-shadow)]">
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <Image src={floaters[1]} alt="" fill sizes="112px" className="object-cover" />
              </div>
            </div>
          )}
          {floaters[2] && (
            <div className="absolute bottom-4 right-40 z-20 h-32 w-32 animate-float-slow overflow-hidden rounded-2xl border border-separator bg-surface p-1 shadow-[var(--overlay-shadow)]" style={{ animationDelay: '1.2s' }}>
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <Image src={floaters[2]} alt="" fill sizes="128px" className="object-cover" />
              </div>
            </div>
          )}
          <div className="glass-strong absolute bottom-2 right-0 z-30 flex animate-fade-in items-center gap-3 rounded-2xl border border-separator px-4 py-3 shadow-sm" style={{ animationDelay: '500ms' }}>
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent/15 text-sm font-bold text-accent">
              {(products[0]?.discountPercent ?? 0) > 0 ? `${products[0]?.discountPercent}%` : '★'}
            </span>
            <div>
              <p className="text-xs font-semibold">{products[0]?.name ?? 'Fresh arrivals'}</p>
              <p className="text-[11px] text-foreground/50">Rated by real customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category band */}
      {categories.length > 0 && (
        <div className="relative border-t border-separator/70 bg-surface/40">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="marquee">
              <div className="marquee-track items-center gap-10 py-1">
                {[...categories, ...categories].map((category, i) => (
                  <Link
                    key={`${category.slug}-${i}`}
                    href={`/products?category=${category.slug}`}
                    className="text-display flex items-center gap-10 whitespace-nowrap text-sm font-semibold tracking-wide text-foreground/55 transition-colors duration-200 hover:text-accent"
                    aria-hidden={i >= categories.length}
                  >
                    {category.name}
                    <span className="text-accent/60">✦</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function SectionHeader({ title, href, label }: { title: string; href: string; label: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow mb-2">{label}</p>
        <h2 className="text-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      <Link href={href} className="group flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
        View all
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  )
}

export default async function HomePage() {
  const [newArrivals, deals, categoriesRes] = await Promise.all([
    fetchProducts({ sort: 'newest' }),
    fetchProducts({ minDiscount: '15', sort: 'most-discounted' }),
    safeFetch<{ categories?: CategoryItem[] }>(`${API_BASE}/api/products/categories`, {})
  ])
  const categories = categoriesRes?.categories ?? []
  const catalogUnavailable = newArrivals.length === 0

  return (
    <div className="space-y-16 sm:space-y-20">
      {catalogUnavailable && (
        <div className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <CloudOff className="size-4 shrink-0" />
          <span>We're having trouble reaching the store right now. Please try again shortly.</span>
        </div>
      )}

      <Hero products={newArrivals} categories={categories} />

      {newArrivals.length > 0 && (
        <section className="space-y-8">
          <Reveal>
            <SectionHeader title="New arrivals" href="/products" label="Just landed" />
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {newArrivals.map((product, i) => (
              <Reveal key={product.id} delay={i * 70} className="h-full">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {deals.length > 0 && (
        <section className="space-y-8">
          <Reveal>
            <SectionHeader title="Today's deals" href="/products?minDiscount=15" label="Biggest discounts" />
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {deals.map((product, i) => (
              <Reveal key={product.id} delay={i * 70} className="h-full">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}