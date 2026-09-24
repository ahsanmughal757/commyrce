'use client'

import { Button } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AdminErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-danger/15">
        <AlertTriangle className="size-6 text-danger" />
      </div>
      <h1 className="text-2xl font-semibold">Admin error</h1>
      <p className="max-w-md text-sm text-foreground/70">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <div className="flex gap-3">
        <Button onPress={reset}>Try again</Button>
        <Link href="/admin/login" className="text-sm text-accent hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}