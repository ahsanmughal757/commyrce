'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { Button, Card, Form, TextField, Input, Label, FieldError, Spinner, Separator } from '@heroui/react'
import { CreditCard } from 'lucide-react'
import type { RootState } from '@/store'
import { selectCartSubtotal } from '@/store/cartSlice'
import { apiFetch, ApiError } from '@/lib/api'
import { PriceDisplay } from '@/components/Price'
import ButtonLink from '@/components/ButtonLink'

export default function CheckoutPage() {
  const items = useSelector((state: RootState) => state.cart.items)
  const subtotal = useSelector(selectCartSubtotal)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0 && !pending) {
    return (
      <div className="flex animate-fade-in flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Nothing to check out</h1>
        <p className="text-foreground/60">Your cart is empty.</p>
        <ButtonLink href="/products" className="shine">
          Start shopping
        </ButtonLink>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setPending(true)
    setError('')
    try {
      const data = await apiFetch<{ url: string }>('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          name: String(fd.get('name') ?? ''),
          email: String(fd.get('email') ?? '').toLowerCase()
        })
      })
      window.location.assign(data.url)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Checkout failed. Please try again.')
      setPending(false)
    }
  }

  return (
    <div className="grid animate-fade-in gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <Card className="card-lift border-separator/70 p-4">
          <Card.Header>
            <h2 className="text-lg font-semibold">Contact details</h2>
          </Card.Header>
          <Card.Content>
            <Form onSubmit={onSubmit} className="space-y-4" validationBehavior="native">
              <TextField name="name" type="text" aria-label="Name" isRequired>
                <Label>Full name</Label>
                <Input placeholder="Jane Doe" />
                <FieldError />
              </TextField>
              <TextField name="email" type="email" aria-label="Email" isRequired>
                <Label>Email</Label>
                <Input placeholder="jane@example.com" />
                <FieldError />
              </TextField>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button type="submit" size="lg" fullWidth isPending={pending}>
                {({ isPending }) =>
                  isPending ? (
                    <Spinner color="current" size="sm" />
                  ) : (
                    <>
                      <CreditCard className="size-4" />
                      Pay with Stripe
                    </>
                  )
                }
              </Button>
              <p className="text-xs text-foreground/50">
                You will be redirected to Stripe to complete payment securely. We only place your order when payment succeeds.
              </p>
            </Form>
          </Card.Content>
        </Card>
      </div>

      <div>
        <Card className="card-lift sticky top-32 border-separator/70 p-4">
          <Card.Header>
            <h2 className="text-lg font-semibold">Order summary</h2>
          </Card.Header>
          <Card.Content className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                {item.coverImage ? (
                  <div className="relative aspect-square w-12 shrink-0 overflow-hidden rounded-md">
                    <Image src={item.coverImage} alt={item.name} fill sizes="48px" className="object-cover" />
                  </div>
                ) : (
                  <div className="aspect-square w-12 shrink-0 rounded-md bg-foreground/5" />
                )}
                <div className="flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-foreground/50">
                    ×{item.quantity}
                  </p>
                </div>
                <span className="text-sm">
                  <PriceDisplay priceCents={item.priceCents} salePriceCents={item.priceCents} />
                </span>
              </div>
            ))}
          </Card.Content>
          <Card.Footer className="space-y-2">
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subtotal / 100)}</span>
            </div>
          </Card.Footer>
        </Card>
      </div>
    </div>
  )
}