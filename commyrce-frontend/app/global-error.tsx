'use client'

import { Button } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'

/**
 * Root error boundary. Unlike app/error.tsx, this also covers errors thrown
 * from the root layout itself, so it must render its own <html>.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-danger/15">
            <AlertTriangle className="size-6 text-danger" />
          </div>
          <h1 className="text-2xl font-semibold">Application error</h1>
          <p className="text-sm text-foreground/70">
            {error.message || 'An unexpected error occurred. Please reload the page.'}
          </p>
          <Button onPress={reset}>Reload page</Button>
        </div>
      </body>
    </html>
  )
}