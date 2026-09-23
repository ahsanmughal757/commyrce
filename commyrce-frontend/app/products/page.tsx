import { Suspense } from 'react'
import ShopPage from '@/components/ShopPage'

export const metadata = { title: 'Shop' }

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="py-24 text-center text-foreground/50">Loading…</p>}>
      <ShopPage />
    </Suspense>
  )
}