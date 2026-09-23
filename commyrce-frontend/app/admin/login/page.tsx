'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Card, Form, TextField, Input, Label, FieldError } from '@heroui/react'
import { Shield } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'

export default function AdminLoginPage() {
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
      await apiFetch('/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') })
      })
      queryClient.invalidateQueries({ queryKey: ['admin-me'] })
      router.replace('/admin')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Admin sign-in failed.')
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6">
        <Card.Content className="flex flex-col items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-accent/15">
            <Shield className="size-6 text-accent" />
          </div>
          <h1 className="text-xl font-semibold">Admin sign in</h1>
          <Form onSubmit={onSubmit} className="w-full space-y-4" validationBehavior="native">
            <TextField name="email" type="email" isRequired>
              <Label>Email</Label>
              <Input placeholder="admin@commyrce.com" autoComplete="email" />
              <FieldError />
            </TextField>
            <TextField name="password" type="password" isRequired>
              <Label>Password</Label>
              <Input placeholder="••••••••" autoComplete="current-password" />
              <FieldError />
            </TextField>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" fullWidth isPending={pending} size="lg">
              {({ isPending }) => (isPending ? 'Signing in…' : 'Sign in')}
            </Button>
          </Form>
          <p className="text-center text-xs text-foreground/50">
            Demo admin: admin@commyrce.com / Admin123!
          </p>
        </Card.Content>
      </Card>
    </div>
  )
}