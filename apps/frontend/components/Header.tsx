'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'
import { useTheme } from 'next-themes'
import { Badge, Button } from '@heroui/react'
import { Menu, Moon, ShoppingCart, Sun, User, X } from 'lucide-react'
import { selectCartCount } from '@/store/cartSlice'
import { cn } from '@/lib/format'
import ButtonLink from './ButtonLink'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/products?minDiscount=15', label: 'Deals' }
]

const ANNOUNCEMENTS = [
  'Free shipping on orders over $50',
  'New arrivals dropped every week',
  'Secure checkout powered by Stripe',
  '30-day hassle-free returns'
]

function AnnouncementBar() {
  const items = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS]
  return (
    <div className="marquee bg-gradient-to-r from-[var(--accent)] via-[var(--brand-violet)] to-[var(--accent)] text-[color:var(--accent-foreground)]">
      <div className="marquee-track items-center py-1.5">
        {items.map((text, i) => (
          <span key={i} aria-hidden={i >= ANNOUNCEMENTS.length} className="flex items-center gap-6 px-6 text-[11px] font-semibold uppercase tracking-[0.22em]">
            {text}
            <span className="text-[color:color-mix(in_oklab,var(--accent-foreground)_60%,transparent)]">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const cartCount = useSelector(selectCartCount)
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === 'dark'

  const linkClass = (href: string) =>
    cn(
      'nav-underline text-sm font-medium text-foreground/70 transition-colors duration-300 hover:text-foreground',
      href.split('?')[0] === pathname && 'text-foreground'
    )

  return (
    <div className="sticky top-0 z-40 w-full">
      <AnnouncementBar />
      <nav className="glass w-full border-b border-separator">
        <header className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="md:hidden"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link href="/" className="group relative text-2xl font-bold tracking-tight">
              <span className="text-display text-gradient">
                Comm:rce
              </span>
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-accent to-[var(--brand-cyan)] transition-transform duration-500 group-hover:scale-x-100" />
            </Link>
          </div>

          <ul className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => {
              const active = item.href.split('?')[0] === pathname
              return (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass(item.href)} data-active={active || undefined}>
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-1.5">
            <Button
              isIconOnly
              variant="ghost"
              aria-label="Toggle theme"
              className="press"
              onPress={() => setTheme(dark ? 'light' : 'dark')}
            >
              {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </Button>
            <ButtonLink isIconOnly variant="ghost" href="/account" ariaLabel="Account" className="press">
              <User className="size-[18px]" />
            </ButtonLink>
            <Badge.Anchor>
              <ButtonLink isIconOnly variant="ghost" href="/cart" ariaLabel={`Shopping cart (${cartCount} items)`} className="press">
                <ShoppingCart className="size-[18px]" />
              </ButtonLink>
              {cartCount > 0 && (
                <Badge key={cartCount} color="accent" size="sm" placement="top-right" className="animate-pop">
                  {cartCount}
                </Badge>
              )}
            </Badge.Anchor>
          </div>
        </header>

        {open && (
          <div className="border-t border-separator md:hidden">
            <ul className="flex flex-col gap-1 p-4">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 transition-colors hover:bg-foreground/5">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 flex items-center gap-2 border-t border-separator pt-4">
                <ButtonLink variant="tertiary" size="sm" href="/account" onNavigate={() => setOpen(false)}>
                  Account
                </ButtonLink>
                <ButtonLink variant="tertiary" size="sm" href="/cart" onNavigate={() => setOpen(false)}>
                  Cart ({cartCount})
                </ButtonLink>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </div>
  )
}