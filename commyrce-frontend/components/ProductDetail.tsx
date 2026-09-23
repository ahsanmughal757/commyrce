'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useDispatch } from 'react-redux'
import { Button, Chip, Separator, Spinner } from '@heroui/react'
import { Minus, Plus, ShoppingCart, TrendingDown } from 'lucide-react'
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
    <div className="grid gap-8 lg:grid-cols-2">
      {images.length > 0 ? (
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-separator">
            <Image src={images[imageIndex] ?? images[0]} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  className={cn(
                    'relative aspect-square w-20 overflow-hidden rounded-md border',
                    index === imageIndex ? 'border-accent ring-1 ring-accent' : 'border-separator'
                  )}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex aspect-square items-center justify-center rounded-lg border border-separator text-foreground/40">No image</div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-foreground/50">
          {product.categoryName && <span>{product.categoryName}</span>}
          {product.tags?.map((tag) => (
            <Chip key={tag} size="sm" variant="soft">
              {tag}
            </Chip>
          ))}
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>

        <div className="flex items-center gap-3">
          <PriceDisplay priceCents={product.priceCents} salePriceCents={product.salePriceCents} className="text-2xl" />
          {product.discountPercent > 0 && (
            <Chip color="accent" size="sm" variant="primary">
              <TrendingDown className="size-3" /> {product.discountPercent}% off
            </Chip>
          )}
        </div>

        <Separator />

        <p className="text-foreground/80">{product.description || 'No description available.'}</p>

        <div className="mt-2 space-y-2 text-sm text-foreground/70">
          <p>
            Status:{' '}
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
          {product.sku && <p>SKU: {product.sku}</p>}
        </div>

        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button isIconOnly variant="outline" isDisabled={disabled || quantity <= 1} aria-label="Decrease quantity" onPress={() => setQuantity((n) => n - 1)}>
              <Minus className="size-4" />
            </Button>
            <span className="w-10 text-center text-lg font-semibold">{quantity}</span>
            <Button isIconOnly variant="outline" isDisabled={disabled || quantity >= 99} aria-label="Increase quantity" onPress={() => setQuantity((n) => n + 1)}>
              <Plus className="size-4" />
            </Button>
          </div>
          <Button
            fullWidth
            isDisabled={disabled}
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
            <ShoppingCart className="size-4" />
            Add to cart
          </Button>
        </div>

        {product.category && typeof product.category === 'object' && (
          <p className="text-sm text-foreground/50">
            Category: <span className="text-foreground">{categoryNameOf(product)}</span>
          </p>
        )}
      </div>
    </div>
  )
}