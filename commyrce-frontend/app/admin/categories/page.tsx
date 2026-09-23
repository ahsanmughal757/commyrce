'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Form, Spinner, TextField, Input, Label, Modal } from '@heroui/react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useAdminCategories } from '@/lib/hooks'
import { apiFetch, ApiError } from '@/lib/api'
import type { Category } from '@/lib/types'
import ErrorState from '@/components/ErrorState'

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient()
  const { data: categories, isPending, isError, error, refetch } = useAdminCategories()
  const [editing, setEditing] = useState<Category | null>(null)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    queryClient.invalidateQueries({ queryKey: ['categories'] })
  }

  const createMutation = useMutation({
    mutationFn: (name: string) => apiFetch('/api/admin/categories', { method: 'POST', body: JSON.stringify({ name }) }),
    onSuccess: invalidate
  })

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; name: string }) =>
      apiFetch(`/api/admin/categories/${payload.id}`, { method: 'PATCH', body: JSON.stringify({ name: payload.name }) }),
    onSuccess: () => {
      invalidate()
      setEditing(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate
  })

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" color="accent" />
      </div>
    )
  }

  if (isError || !categories) {
    return <ErrorState message={error instanceof Error ? error.message : 'Failed to load categories.'} onRetry={() => void refetch()} />
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Categories</h1>

      <Form
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          const name = String(fd.get('name') ?? '').trim()
          if (name) createMutation.mutate(name)
          e.currentTarget.reset()
        }}
      >
        <div className="flex max-w-md items-end gap-2">
          <TextField name="name" isRequired aria-label="New category name" className="flex-1">
            <Label>New category</Label>
            <Input placeholder="e.g. Accessories" />
          </TextField>
          <Button type="submit" isPending={createMutation.isPending}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </Form>

      <Card className="divide-y divide-separator p-2">
        {categories.length === 0 && <p className="p-6 text-center text-sm text-foreground/50">No categories yet.</p>}
        {categories.map((category) => (
          <div key={category.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{category.name}</p>
              <p className="text-xs text-foreground/50">/{category.slug}</p>
            </div>
            <Button isIconOnly size="sm" variant="ghost" aria-label={`Edit ${category.name}`} onPress={() => setEditing(category)}>
              <Pencil className="size-4" />
            </Button>
            <Button isIconOnly size="sm" variant="ghost" className="text-danger" aria-label={`Delete ${category.name}`} onPress={() => deleteMutation.mutate(category.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </Card>

      <Modal>
        <Modal.Backdrop isOpen={editing !== null} onOpenChange={(open) => !open && setEditing(null)} variant="blur">
          <Modal.Container size="sm" placement="center">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Rename category</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    const name = String(fd.get('name') ?? '').trim()
                    if (editing && name) updateMutation.mutate({ id: editing.id, name })
                  }}
                  className="space-y-3"
                >
                  <TextField name="name" defaultValue={editing?.name ?? ''} isRequired>
                    <Label>Name</Label>
                    <Input />
                  </TextField>
                  {updateMutation.isError && (
                    <p className="text-sm text-danger">
                      {updateMutation.error instanceof ApiError ? updateMutation.error.message : 'Failed to rename category.'}
                    </p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button slot="close" variant="secondary">
                      Cancel
                    </Button>
                    <Button type="submit" slot="close" isPending={updateMutation.isPending}>
                      {({ isPending }) => (isPending ? <Spinner color="current" size="sm" /> : 'Save')}
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  )
}