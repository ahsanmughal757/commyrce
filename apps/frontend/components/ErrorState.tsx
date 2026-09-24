'use client'

import { Button } from '@heroui/react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
}

/**
 * Friendly fallback for failed API queries / render-time errors.
 */
export default function ErrorState({ title = 'Something went wrong', message, onRetry, retryLabel = 'Try again' }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-danger/15">
        <AlertTriangle className="size-6 text-danger" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-foreground/70">{message}</p>
      {onRetry && (
        <Button variant="secondary" onPress={onRetry}>
          <RefreshCw className="size-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  )
}