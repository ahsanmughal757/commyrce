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

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const cartCount = useSelector(selectCartCount)
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === 'dark'

  const linkClass = (href: string) =>
    cn(
      'text-sm font-medium text-foreground/70 transition-colors hover:text-foreground',
      href.split('?')[0] === pathname && 'text-foreground'
    )

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-separator bg-background/80 backdrop-blur-lg">
      <header className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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
          <Link href="/" className="text-lg font-bold tracking-tight">
            Comm:rce
          </Link>
        </div>

        <ul className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            variant="ghost"
            aria-label="Toggle theme"
            onPress={() => setTheme(dark ? 'light' : 'dark')}
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <ButtonLink isIconOnly variant="ghost" href="/account" ariaLabel="Account">
            <User className="size-4" />
          </ButtonLink>
          <Badge.Anchor>
            <ButtonLink isIconOnly variant="ghost" href="/cart" ariaLabel={`Shopping cart (${cartCount} items)`}>
              <ShoppingCart className="size-4" />
            </ButtonLink>
            {cartCount > 0 && (
              <Badge color="accent" size="sm" placement="top-right">
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
                <Link href={item.href} onClick={() => setOpen(false)} className="block py-2">
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
  )
}