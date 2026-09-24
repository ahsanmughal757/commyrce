'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useDispatch } from 'react-redux'
import { Button, Card, Chip } from '@heroui/react'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '@commyrce/shared'
import { categoryNameOf } from '@/lib/format'
import { addItem } from '@/store/cartSlice'
import { PriceDisplay } from './Price'

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useDispatch()
  const onSale = product.discountPercent > 0
  const image = product.images?.[0] ?? product.coverImage

  return (
    <Card
      variant="default"
      className="group card-lift h-full overflow-hidden border-separator/70"
    >
      <div className="media-zoom relative aspect-[4/5] overflow-hidden bg-foreground/5">
        <Link href={`/products/${product.slug}`} className="absolute inset-0" aria-label={product.name}>
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-foreground/40">No image</div>
          )}
        </Link>

        {/* Legibility gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
          {onSale && (
            <Chip color="accent" size="sm" variant="primary" className="animate-pop font-bold uppercase tracking-wide">
              {product.discountPercent}% off
            </Chip>
          )}
        </div>
        {product.stock <= 0 && (
          <div className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            Out of stock
          </div>
        )}

        {/* Quick add */}
        <div className="quick-add absolute inset-x-3 bottom-3">
          <Button
            fullWidth
            isDisabled={product.stock <= 0}
            size="lg"
            className="shine h-11 bg-foreground text-background"
            onPress={() =>
              dispatch(
                addItem({
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  coverImage: image ?? '',
                  priceCents: product.salePriceCents,
                  quantity: 1
                })
              )
            }
          >
            <ShoppingCart className="size-4" />
            Add to cart
          </Button>
        </div>
      </div>

      <Card.Content className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
          {categoryNameOf(product) || 'Comm:rce'}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors duration-200 hover:text-accent"
        >
          {product.name}
        </Link>
        <div className="mt-auto">
          <PriceDisplay priceCents={product.priceCents} salePriceCents={product.salePriceCents} className="text-[15px]" />
        </div>
      </Card.Content>
    </Card>
  )
}