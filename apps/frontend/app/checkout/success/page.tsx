import { Check } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'

export const metadata = { title: 'Order confirmed' }

export default function CheckoutSuccessPage() {
  return (
    <div className="flex justify-center py-16">
      <div className="flex max-w-md animate-scale-in flex-col items-center gap-4 rounded-[1.4rem] border border-separator bg-gradient-to-b from-success/10 via-surface to-surface p-8 text-center shadow-[var(--surface-shadow)]">
        <div className="relative">
          <div className="aurora aurora-accent -inset-8 opacity-30" />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-success/15 animate-pop">
            <Check className="size-8 text-success" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold">Payment successful</h1>
        <p className="text-foreground/60">
          Thanks for your order! Your payment was processed and stock has been reserved. You can keep shopping while your
          order is prepared.
        </p>
        <div className="flex gap-3">
          <ButtonLink href="/products" className="shine">
            Continue shopping
          </ButtonLink>
          <ButtonLink href="/" variant="tertiary">
            Back home
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}