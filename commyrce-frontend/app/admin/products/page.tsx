'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  Chip,
  Form,
  Modal,
  Spinner,
  Table,
  TextField,
  Input,
  Label,
  Select,
  ListBox,
  Pagination
} from '@heroui/react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useAdminCategories, useAdminProducts } from '@/lib/hooks'
import { apiFetch, ApiError } from '@/lib/api'
import { formatCents } from '@/lib/format'
import ButtonLink from '@/components/ButtonLink'
import ErrorState from '@/components/ErrorState'

const ADMIN_SORTS = [
  { id: 'newest', textValue: 'Newest' },
  { id: 'price-asc', textValue: 'Price: Low to High' },
  { id: 'price-desc', textValue: 'Price: High to Low' },
  { id: 'name-asc', textValue: 'Name A–Z' },
  { id: 'low-stock', textValue: 'Low stock' }
] as const

export default function AdminProductsPage() {
  const queryClient = useQueryClient()
  const { data: categories } = useAdminCategories()
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    sort: 'newest',
    q: '',
    category: '',
    published: ''
  })
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data, isPending, error, refetch } = useAdminProducts(params as { page: number; limit: number; sort: string })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      setDeleteTarget(null)
    },
    onError: (err) => {
      alert(err instanceof ApiError ? err.message : 'Failed to delete product.')
    }
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      apiFetch(`/api/admin/products/${id}/toggle`, { method: 'PATCH', body: JSON.stringify({ published }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <ButtonLink href="/admin/products/new">
          <Plus className="size-4" />
          New product
        </ButtonLink>
      </div>

      <Form
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          setParams((prev) => ({ ...prev, page: 1, q: String(fd.get('q') ?? '') }))
        }}
      >
        <div className="flex flex-wrap items-end gap-3">
          <TextField name="q" aria-label="Search products" className="w-full sm:w-56">
            <Label>Search</Label>
            <Input placeholder="Search by name or SKU…" />
          </TextField>
          <Select
            value={params.sort}
            onChange={(value) => setParams((prev) => ({ ...prev, page: 1, sort: String(value ?? 'newest') }))}
            className="w-44"
            aria-label="Sort"
          >
            <Label>Sort</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {ADMIN_SORTS.map((s) => (
                  <ListBox.Item key={s.id} id={s.id} textValue={s.textValue}>
                    {s.textValue}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
          <Select
            value={params.category || 'all'}
            onChange={(value) => setParams((prev) => ({ ...prev, page: 1, category: String(value === 'all' ? '' : value) }))}
            className="w-44"
            aria-label="Filter by category"
          >
            <Label>Category</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="All categories">
                  All categories
                </ListBox.Item>
                {(categories ?? []).map((category) => (
                  <ListBox.Item key={category.id} id={category.id} textValue={category.name}>
                    {category.name}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
          <Select
            value={params.published || 'all'}
            onChange={(value) => setParams((prev) => ({ ...prev, page: 1, published: String(value === 'all' ? '' : value) }))}
            className="w-40"
            aria-label="Filter by status"
          >
            <Label>Status</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="All statuses">
                  All statuses
                </ListBox.Item>
                <ListBox.Item id="true" textValue="Published">
                  Published
                </ListBox.Item>
                <ListBox.Item id="false" textValue="Draft">
                  Draft
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <Button type="submit" variant="secondary">
            Apply
          </Button>
        </div>
      </Form>

      <Card className="p-2">
        {isPending ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" color="accent" />
          </div>
        ) : error ? (
          <ErrorState message={error instanceof Error ? error.message : 'Failed to load products.'} onRetry={() => void refetch()} />
        ) : (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Products" className="min-w-[760px]">
                <Table.Header>
                  <Table.Column isRowHeader>Product</Table.Column>
                  <Table.Column>Category</Table.Column>
                  <Table.Column>Price</Table.Column>
                  <Table.Column>Stock</Table.Column>
                  <Table.Column>Status</Table.Column>
                  <Table.Column>Actions</Table.Column>
                </Table.Header>
                <Table.Body items={data?.items ?? []} renderEmptyState={() => <p className="p-6 text-center text-sm text-foreground/50">No products found.</p>}>
                  {(product) => (
                    <Table.Row id={product.id}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          {product.images?.[0] ? (
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                              <Image src={product.images[0]} alt="" fill sizes="48px" className="object-cover" />
                            </div>
                          ) : (
                            <div className="h-12 w-12 shrink-0 rounded-md bg-foreground/5" />
                          )}
                          <div className="min-w-0">
                            <Link href={`/admin/products/${product.id}`} className="block max-w-[220px] truncate font-medium hover:underline">
                              {product.name}
                            </Link>
                            <p className="text-xs text-foreground/50">{product.sku || '—'}</p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-foreground/70">{product.categoryName || '—'}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm font-medium">{formatCents(product.salePriceCents)}</span>
                      </Table.Cell>
                      <Table.Cell>
                        {product.stock === 0 ? (
                          <Chip color="danger" size="sm" variant="soft">
                            Out of stock
                          </Chip>
                        ) : product.stock <= 5 ? (
                          <Chip color="warning" size="sm" variant="soft">
                            {product.stock}
                          </Chip>
                        ) : (
                          <Chip color="success" size="sm" variant="soft">
                            {product.stock}
                          </Chip>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Chip size="sm" variant={product.published ? 'primary' : 'tertiary'}>
                          {product.published ? 'Published' : 'Draft'}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onPress={() => toggleMutation.mutate({ id: product.id, published: !product.published })}
                          >
                            {product.published ? 'Unpublish' : 'Publish'}
                          </Button>
                          <ButtonLink isIconOnly size="sm" variant="ghost" href={`/admin/products/${product.id}`} ariaLabel={`Edit ${product.name}`}>
                            <Pencil className="size-4" />
                          </ButtonLink>
                          <Button isIconOnly size="sm" variant="ghost" className="text-danger" aria-label={`Delete ${product.name}`} onPress={() => setDeleteTarget(product.id)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
            {data && data.totalPages > 1 && (
              <Table.Footer>
                <Pagination size="sm">
                  <Pagination.Summary>
                    {data.total > 0 ? `${(data.page - 1) * data.limit + 1}–${Math.min(data.page * data.limit, data.total)} of ${data.total}` : ''}
                  </Pagination.Summary>
                  <Pagination.Content>
                    <Pagination.Item>
                      <Pagination.Previous isDisabled={data.page === 1} onPress={() => setParams((prev) => ({ ...prev, page: prev.page - 1 }))}>
                        <Pagination.PreviousIcon />
                      </Pagination.Previous>
                    </Pagination.Item>
                    {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
                      <Pagination.Item key={page}>
                        <Pagination.Link isActive={page === data.page} onPress={() => setParams((prev) => ({ ...prev, page }))}>
                          {page}
                        </Pagination.Link>
                      </Pagination.Item>
                    ))}
                    <Pagination.Item>
                      <Pagination.Next isDisabled={data.page === data.totalPages} onPress={() => setParams((prev) => ({ ...prev, page: prev.page + 1 }))}>
                        <Pagination.NextIcon />
                      </Pagination.Next>
                    </Pagination.Item>
                  </Pagination.Content>
                </Pagination>
              </Table.Footer>
            )}
          </Table>
        )}
      </Card>

      <Modal>
        <Modal.Backdrop isOpen={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)} variant="blur">
          <Modal.Container size="sm" placement="center">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Delete product?</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p>This permanently removes the product. This action cannot be undone.</p>
              </Modal.Body>
              <Modal.Footer>
                <Button slot="close" variant="secondary">
                  Cancel
                </Button>
                <Button
                  slot="close"
                  variant="danger"
                  isPending={deleteMutation.isPending}
                  onPress={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
                >
                  {({ isPending }) => (isPending ? <Spinner color="current" size="sm" /> : 'Delete')}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  )
}