'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { Button, Chip, Separator, Spinner } from '@heroui/react'
import { ChevronRight, Minus, Plus, ShieldCheck, ShoppingCart, TrendingDown, Truck } from 'lucide-react'
import { useProduct } from '@/lib/hooks'
import { categoryNameOf, cn } from '@/lib/format'
import { addItem } from '@/store/cartSlice'
import { PriceDisplay } from './Price'
import ErrorState from './ErrorState'

export default function ProductDetail({ slug }: { slug: string }) {
  const dispatch = useDispatch()
  const { data: product, isPending, isError, error, refetch } = useProduct(slug)
  const [imageIndex, setImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" color="accent" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <ErrorState
        title="Product unavailable"
        message={error instanceof Error ? error.message : 'Product not found.'}
        onRetry={() => void refetch()}
      />
    )
  }

  const images = product.images?.length ? product.images : [product.coverImage ?? ''].filter(Boolean)
  const disabled = product.stock <= 0

  return (
    <div className="animate-fade-in space-y-4">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-x-auto text-xs text-foreground/50">
        <Link href="/" className="transition-colors hover:text-accent">
          Home
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <Link href="/products" className="transition-colors hover:text-accent">
          Shop
        </Link>
        {product.categoryName && (
          <>
            <ChevronRight className="size-3.5 shrink-0" />
            <Link
              href={`/products?category=${product.categorySlug ?? ''}`}
              className="max-w-[8rem] truncate transition-colors hover:text-accent"
            >
              {product.categoryName}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="max-w-[12rem] truncate font-medium text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="media-zoom relative aspect-square overflow-hidden rounded-[1.4rem] border border-separator bg-surface shadow-[var(--surface-shadow)]">
            {images.length > 0 ? (
              <Image
                key={imageIndex}
                src={images[imageIndex] ?? images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover animate-scale-in"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-foreground/40">No image</div>
            )}
            {disabled && (
              <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                Out of stock
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2.5">
              {images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                  className={cn(
                    'media-zoom relative aspect-square w-20 overflow-hidden rounded-xl border-2 transition-all duration-300',
                    index === imageIndex
                      ? 'border-accent ring-2 ring-accent/30'
                      : 'border-separator opacity-70 hover:opacity-100'
                  )}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase panel */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
          <div className="space-y-3">
            {product.tags?.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {product.tags.map((tag) => (
                  <Chip key={tag} size="sm" variant="soft" className="uppercase tracking-wide">
                    {tag}
                  </Chip>
                ))}
              </div>
            ) : null}
            <h1 className="text-display text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>

            <div className="flex items-center gap-3">
              <PriceDisplay priceCents={product.priceCents} salePriceCents={product.salePriceCents} className="text-3xl" />
              {product.discountPercent > 0 && (
                <Chip color="accent" size="sm" variant="primary" className="animate-pop font-bold uppercase tracking-wide">
                  <TrendingDown className="size-3" /> {product.discountPercent}% off
                </Chip>
              )}
            </div>
          </div>

          <Separator />

          <p className="leading-relaxed text-foreground/75">{product.description || 'No description available.'}</p>

          <div className="space-y-2 text-sm text-foreground/70">
            <p className="flex items-center gap-2">
              <span className="font-medium text-foreground">Status:</span>
              {disabled ? (
                <Chip color="danger" size="sm" variant="soft">
                  Out of stock
                </Chip>
              ) : product.stock <= 5 ? (
                <Chip color="warning" size="sm" variant="soft">
                  Only {product.stock} left in stock
                </Chip>
              ) : (
                <Chip color="success" size="sm" variant="soft">
                  In stock ({product.stock})
                </Chip>
              )}
            </p>
            {product.sku && (
              <p>
                <span className="font-medium text-foreground">SKU:</span> {product.sku}
              </p>
            )}
          </div>

          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-xl border border-separator bg-surface p-1.5">
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                className="press"
                isDisabled={disabled || quantity <= 1}
                aria-label="Decrease quantity"
                onPress={() => setQuantity((n) => n - 1)}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-10 text-center text-base font-bold">{quantity}</span>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                className="press"
                isDisabled={disabled || quantity >= 99}
                aria-label="Increase quantity"
                onPress={() => setQuantity((n) => n + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <Button
              fullWidth
              size="lg"
              isDisabled={disabled}
              className="shine h-[3.25rem] text-base"
              onPress={() =>
                dispatch(
                  addItem({
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    coverImage: product.coverImage ?? product.images?.[0] ?? '',
                    priceCents: product.salePriceCents,
                    quantity
                  })
                )
              }
            >
              <ShoppingCart className="size-5" />
              Add to cart
            </Button>
          </div>

          <div className="mt-1 flex flex-wrap gap-x-6 gap-y-2 text-xs text-foreground/55">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-accent" /> Secure checkout
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="size-4 text-accent" /> Free shipping over $50
            </span>
          </div>

          {product.category && typeof product.category === 'object' && (
            <p className="text-sm text-foreground/50">
              Category: <span className="font-medium text-foreground">{categoryNameOf(product)}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}