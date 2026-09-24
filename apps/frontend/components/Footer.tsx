'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUp, AtSign, Globe, Mail, Rss } from 'lucide-react'

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', href: '/products' },
      { label: 'Deals', href: '/products?minDiscount=15' },
      { label: 'Electronics', href: '/products?category=electronics' },
      { label: 'Home & Kitchen', href: '/products?category=home-and-kitchen' },
      { label: 'Fashion', href: '/products?category=fashion' }
    ]
  },
  {
    title: 'Account',
    links: [
      { label: 'My account', href: '/account' },
      { label: 'Sign in', href: '/login' },
      { label: 'Create account', href: '/register' },
      { label: 'Cart', href: '/cart' },
      { label: 'Checkout', href: '/checkout' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'Admin console', href: '/admin' },
      { label: 'Order success', href: '/checkout/success' }
    ]
  }
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  return (
    <footer className="relative border-t border-separator">
      {/* Newsletter band */}
      <div className="noise relative overflow-hidden border-b border-separator">
        <div className="aurora aurora-accent -left-24 top-0 h-64 w-64 opacity-60" />
        <div className="aurora aurora-cyan -right-16 bottom-0 h-56 w-56 opacity-40" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6 lg:flex-row lg:justify-between lg:px-8 lg:text-left">
          <div className="grid-lines absolute inset-0" />
          <div className="relative">
            <p className="eyebrow mb-2">Stay in the loop</p>
            <h2 className="text-display text-2xl font-bold tracking-tight sm:text-3xl">
              Get first access to drops &amp; deals
            </h2>
            <p className="mt-2 max-w-md text-sm text-foreground/60">
              Join the list for early access to new arrivals, exclusive discounts, and product guides. No spam, ever.
            </p>
          </div>
          <div className="relative w-full max-w-md">
            {subscribed ? (
              <div className="flex h-12 items-center justify-center rounded-xl border border-success/30 bg-success/10 text-sm font-medium text-success animate-scale-in">
                Thanks for subscribing — talk soon.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (email.trim()) setSubscribed(true)
                }}
                className="glass-strong flex items-center gap-2 rounded-xl p-1.5 shadow-sm"
              >
                <Mail className="ml-3 size-4 shrink-0 text-foreground/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/40"
                />
                <button
                  type="submit"
                  className="shine relative h-9 shrink-0 overflow-hidden rounded-lg bg-foreground px-4 text-xs font-bold uppercase tracking-widest text-background transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97]"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <Link href="/" className="text-display text-gradient text-2xl font-bold tracking-tight">
            Comm:rce
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-foreground/60">
            A modern commerce platform. Carefully curated products, secure checkout, and a storefront that feels like it
            was designed this decade.
          </p>
          <div className="flex gap-2 pt-1">
            {[
              { icon: Globe, label: 'Website' },
              { icon: AtSign, label: 'Social' },
              { icon: Rss, label: 'Updates feed' }
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                onClick={(e) => e.preventDefault()}
                className="flex size-10 items-center justify-center rounded-xl border border-separator bg-surface text-foreground/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="eyebrow mb-4">{column.title}</h3>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/70 transition-colors duration-200 hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-separator">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-foreground/50 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Comm:rce. Made with precision.</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center gap-1.5 rounded-full border border-separator bg-surface px-4 py-2 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
          >
            Back to top
            <ArrowUp className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  )
}