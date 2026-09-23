'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Card, Separator } from '@heroui/react'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import type { RootState } from '@/store'
import { removeItem, setQuantity, selectCartSubtotal } from '@/store/cartSlice'
import { PriceDisplay } from '@/components/Price'
import ButtonLink from '@/components/ButtonLink'

export default function CartPage() {
  const dispatch = useDispatch()
  const items = useSelector((state: RootState) => state.cart.items)
  const subtotal = useSelector(selectCartSubtotal)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingCart className="size-10 text-foreground/40" />
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="text-foreground/60">Browse the catalog and add something you love.</p>
        <ButtonLink href="/products">Start shopping</ButtonLink>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Cart</h1>
        {items.map((item) => (
          <Card key={item.productId} className="p-3">
            <Card.Content className="flex items-center gap-4">
              {item.coverImage ? (
                <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-md">
                  <Image src={item.coverImage} alt={item.name} fill sizes="80px" className="object-cover" />
                </div>
              ) : (
                <div className="flex aspect-square w-20 shrink-0 items-center justify-center rounded-md bg-foreground/5 text-xs text-foreground/40">
                  No image
                </div>
              )}
              <div className="flex flex-1 flex-col gap-1">
                <Link href={`/products/${item.slug}`} className="font-medium hover:underline">
                  {item.name}
                </Link>
                <span className="text-sm text-foreground/60">
                  <PriceDisplay priceCents={item.priceCents} salePriceCents={item.priceCents} />
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="outline"
                    aria-label="Decrease quantity"
                    onPress={() => dispatch(setQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="outline"
                    aria-label="Increase quantity"
                    onPress={() => dispatch(setQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                  >
                    <Plus className="size-3" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label="Remove item"
                    className="ml-auto text-danger"
                    onPress={() => dispatch(removeItem(item.productId))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      <div>
        <Card className="p-4">
          <Card.Header>
            <h2 className="text-lg font-semibold">Summary</h2>
          </Card.Header>
          <Card.Content className="space-y-3">
            <div className="flex justify-between text-foreground/70">
              <span>Items</span>
              <span>{items.reduce((n, i) => n + i.quantity, 0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subtotal / 100)}</span>
            </div>
            <p className="text-xs text-foreground/50">Shipping and taxes are calculated at checkout.</p>
          </Card.Content>
          <Card.Footer>
            <ButtonLink href="/checkout" size="lg" fullWidth>
              Checkout
            </ButtonLink>
          </Card.Footer>
        </Card>
      </div>
    </div>
  )
}