'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Card, Chip, Separator, Spinner } from '@heroui/react'
import { LogOut, ShoppingBag } from 'lucide-react'
import { useSession } from '@/lib/hooks'
import { apiFetch, isAuthError } from '@/lib/api'
import ButtonLink from '@/components/ButtonLink'
import ErrorState from '@/components/ErrorState'

export default function AccountPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: user, isPending, isError, error, refetch } = useSession()
  const [loggingOut, setLoggingOut] = useState(false)

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" color="accent" />
      </div>
    )
  }

  if (isError || !user) {
    // A real 401 just means "not signed in" — show the sign-in prompt.
    // Any other failure (backend down, etc.) surfaces the actual error with retry.
    if (!isAuthError(error)) {
      return <ErrorState title="Account unavailable" message={error instanceof Error ? error.message : 'Failed to load your profile.'} onRetry={() => void refetch()} />
    }
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Sign in required</h1>
        <p className="text-foreground/60">Log in or create an account to view your profile.</p>
        <div className="flex gap-3">
          <ButtonLink href="/login">Sign in</ButtonLink>
          <ButtonLink href="/register" variant="tertiary">
            Create account
          </ButtonLink>
        </div>
      </div>
    )
  }

  async function handleLogout() {
    setLoggingOut(true)
    await apiFetch('/api/auth/logout', { method: 'POST' })
    queryClient.invalidateQueries({ queryKey: ['me'] })
    router.push('/')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">My account</h1>
      <Card className="p-4">
        <Card.Content className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-foreground/10 text-lg font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-foreground/60">{user.email}</p>
            </div>
          </div>
          <Chip color="success" variant="soft" size="sm">
            Active
          </Chip>
        </Card.Content>
      </Card>

      <Card className="p-4">
        <Card.Content className="space-y-4">
          <h2 className="text-lg font-semibold">Shopping</h2>
          <div className="flex items-center gap-3">
            <ShoppingBag className="size-5 text-foreground/50" />
            <p className="text-sm text-foreground/60">Continue where you left off.</p>
            <ButtonLink variant="tertiary" href="/products" className="ml-auto">
              Browse products
            </ButtonLink>
          </div>
        </Card.Content>
        <Card.Footer>
          <Separator className="mb-4" />
          <Button variant="danger-soft" isPending={loggingOut} onPress={handleLogout}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </Card.Footer>
      </Card>
    </div>
  )
}