'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Spinner } from '@heroui/react'
import { LayoutDashboard, LogOut, Package, Store, Tags } from 'lucide-react'
import { useAdminSession } from '@/lib/hooks'
import { apiFetch, isAuthError } from '@/lib/api'
import { cn } from '@/lib/format'
import ButtonLink from '@/components/ButtonLink'
import ErrorState from '@/components/ErrorState'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags }
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: admin, isPending, isError, error, refetch } = useAdminSession()

  useEffect(() => {
    // Only bounce to the login page when the session is actually unauthenticated.
    // Backend-down (network) errors render an inline retry screen instead.
    if (!isPending && isError && isAuthError(error) && pathname !== '/admin/login') {
      router.replace('/admin/login')
    }
  }, [isPending, isError, error, pathname, router])

  if (pathname === '/admin/login') {
    return <div className="min-h-screen">{children}</div>
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" color="accent" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          <ErrorState
            title="Can&apos;t load admin session"
            message={error instanceof Error ? error.message : 'Failed to verify your session.'}
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-foreground/60">Redirecting to sign in…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-separator bg-surface p-4 sm:flex">
        <Link href="/admin" className="mb-6 flex items-center gap-2 px-2 text-lg font-bold">
          Comm:rce
          <span className="rounded bg-accent/15 px-1.5 py-0.5 text-xs font-medium text-accent">Admin</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground',
                  active && 'bg-foreground/5 text-foreground'
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <div className="rounded-md bg-foreground/5 px-3 py-2">
            <p className="text-sm font-medium">{admin.name}</p>
            <p className="text-xs text-foreground/50">{admin.role}</p>
          </div>
          <ButtonLink variant="ghost" fullWidth href="/">
            <Store className="size-4" />
            View store
          </ButtonLink>
          <Button
            variant="danger-soft"
            fullWidth
            onPress={async () => {
              await apiFetch('/api/admin/auth/logout', { method: 'POST' })
              queryClient.invalidateQueries({ queryKey: ['admin-me'] })
              router.replace('/admin/login')
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1">
        <nav className="flex items-center gap-2 border-b border-separator px-4 py-2 sm:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium text-foreground/70 hover:bg-foreground/5',
                pathname.startsWith(item.href) && 'bg-foreground/5 text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}