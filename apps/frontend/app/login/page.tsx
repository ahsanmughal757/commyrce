'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Card, Form, TextField, Input, Label, FieldError, Separator } from '@heroui/react'
import { apiFetch, ApiError } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setPending(true)
    setError('')
    try {
      await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') })
      })
      queryClient.invalidateQueries({ queryKey: ['me'] })
      router.push('/account')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.')
      setPending(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-12">
      <Card className="w-full p-6">
        <Card.Header>
          <h1 className="text-2xl font-semibold">Sign in</h1>
        </Card.Header>
        <Card.Content>
          <Form onSubmit={onSubmit} className="space-y-4" validationBehavior="native">
            <TextField name="email" type="email" aria-label="Email" isRequired>
              <Label>Email</Label>
              <Input placeholder="you@example.com" autoComplete="email" />
              <FieldError />
            </TextField>
            <TextField name="password" type="password" aria-label="Password" isRequired>
              <Label>Password</Label>
              <Input placeholder="••••••••" autoComplete="current-password" />
              <FieldError />
            </TextField>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" fullWidth isPending={pending} size="lg">
              {({ isPending }) => (isPending ? 'Signing in…' : 'Sign in')}
            </Button>
          </Form>
        </Card.Content>
        <Card.Footer>
          <Separator />
          <p className="text-center text-sm text-foreground/60">
            No account yet?{' '}
            <Link href="/register" className="text-accent hover:underline">
              Create one
            </Link>
          </p>
        </Card.Footer>
      </Card>
    </div>
  )
}