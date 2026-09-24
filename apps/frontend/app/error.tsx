'use client'

import { Button } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-danger/15">
        <AlertTriangle className="size-6 text-danger" />
      </div>
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-foreground/70">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <div className="flex gap-3">
        <Button onPress={reset}>Try again</Button>
        <ButtonLink href="/" variant="tertiary">
          Back home
        </ButtonLink>
      </div>
    </div>
  )
}