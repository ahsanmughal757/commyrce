import { Check } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'

export const metadata = { title: 'Order confirmed' }

export default function CheckoutSuccessPage() {
  return (
    <div className="flex justify-center py-16">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-separator p-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-success/15">
          <Check className="size-8 text-success" />
        </div>
        <h1 className="text-2xl font-semibold">Payment successful</h1>
        <p className="text-foreground/60">
          Thanks for your order! Your payment was processed and stock has been reserved. You can keep shopping while your
          order is prepared.
        </p>
        <div className="flex gap-3">
          <ButtonLink href="/products">Continue shopping</ButtonLink>
          <ButtonLink href="/" variant="tertiary">
            Back home
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}