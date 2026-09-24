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
    <Card className="overflow-hidden" variant="default">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square bg-foreground/5">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-foreground/40">No image</div>
        )}
        {onSale && (
          <Chip color="accent" size="sm" variant="primary" className="absolute left-2 top-2">
            {product.discountPercent}% off
          </Chip>
        )}
        {product.stock <= 0 && (
          <Chip color="danger" size="sm" variant="soft" className="absolute right-2 top-2">
            Out of stock
          </Chip>
        )}
      </Link>
      <Card.Header>
        <Link href={`/products/${product.slug}`} className="text-base font-semibold leading-snug hover:underline">
          {product.name}
        </Link>
        <Card.Description className="text-sm">{categoryNameOf(product)}</Card.Description>
      </Card.Header>
      <Card.Content className="flex items-center justify-between">
        <PriceDisplay priceCents={product.priceCents} salePriceCents={product.salePriceCents} />
      </Card.Content>
      <Card.Footer>
        <Button
          fullWidth
          isDisabled={product.stock <= 0}
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
      </Card.Footer>
    </Card>
  )
}