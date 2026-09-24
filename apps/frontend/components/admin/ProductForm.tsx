'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  Form,
  TextField,
  Input,
  Label,
  TextArea,
  Select,
  ListBox,
  Switch,
  Spinner,
  FieldError,
  Separator
} from '@heroui/react'
import { ImagePlus, Trash2, Upload } from 'lucide-react'
import type { Product } from '@commyrce/shared'
import { useAdminCategories } from '@/lib/hooks'
import { apiFetch, ApiError } from '@/lib/api'
import { fromDollarsInput, toDollarsInput } from '@/lib/format'

interface ProductFormData {
  name: string
  description: string
  priceCents: number
  discountPercent: number
  stock: number
  sku: string
  category: string
  tags: string
  images: string[]
  published: boolean
  featured: boolean
}

interface ProductFormProps {
  mode: 'create' | 'edit'
  initial?: Product
}

export default function ProductForm({ mode, initial }: ProductFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: categories } = useAdminCategories()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<ProductFormData>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    priceCents: initial?.priceCents ?? 0,
    discountPercent: initial?.discountPercent ?? 0,
    stock: initial?.stock ?? 0,
    sku: initial?.sku ?? '',
    category: initial ? String(initial.categoryId ?? (typeof initial.category === 'object' && initial.category ? initial.category.id : '') ?? '') : '',
    tags: (initial?.tags ?? []).join(', '),
    images: initial?.images ?? [],
    published: initial?.published ?? true,
    featured: initial?.featured ?? false
  })
  const [serverError, setServerError] = useState('')
  const [clientError, setClientError] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description,
        priceCents: form.priceCents,
        discountPercent: form.discountPercent,
        category: form.category,
        stock: form.stock,
        sku: form.sku || undefined,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        images: form.images,
        published: form.published,
        featured: form.featured
      }
      if (mode === 'create') {
        return apiFetch('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) })
      }
      return apiFetch(`/api/admin/products/${initial?.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      router.push('/admin/products')
      router.refresh()
    },
    onError: (err) => {
      setServerError(err instanceof ApiError ? err.message : 'Failed to save product.')
    }
  })

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    const fd = new FormData()
    Array.from(files).forEach((file) => fd.append('images', file))
    setClientError('')
    try {
      const data = await apiFetch<{ urls: string[] }>('/api/admin/uploads', { method: 'POST', body: fd })
      setForm((prev) => ({ ...prev, images: [...prev.images, ...data.urls] }))
    } catch (err) {
      setClientError(err instanceof ApiError ? err.message : 'Image upload failed. Cloudinary may not be configured.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="max-w-3xl">
      <Card.Header>
        <h1 className="text-xl font-semibold">{mode === 'create' ? 'New product' : `Edit: ${initial?.name ?? ''}`}</h1>
      </Card.Header>
      <Card.Content>
        <Form
          onSubmit={(e) => {
            e.preventDefault()
            setServerError('')
            mutation.mutate()
          }}
          className="space-y-5"
          validationBehavior="native"
        >
          <TextField
            value={form.name}
            onChange={(value) => set('name', value)}
            isRequired
            isInvalid={!form.name.trim() || form.name.trim().length < 2}
          >
            <Label>Name</Label>
            <Input placeholder="Wireless Headphones" />
            <FieldError>Name must be at least 2 characters.</FieldError>
          </TextField>

          <TextField value={form.description} onChange={(value) => set('description', value)}>
            <Label>Description</Label>
            <TextArea rows={4} placeholder="Short product description…" />
          </TextField>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              value={toDollarsInput(form.priceCents)}
              onChange={(value) => {
                const cents = fromDollarsInput(value)
                if (Number.isFinite(cents)) set('priceCents', Math.max(0, cents))
              }}
              type="number"
              isRequired
              aria-label="Price"
            >
              <Label>Price (USD)</Label>
              <Input placeholder="49.99" step="0.01" min="0.01" />
              <FieldError />
            </TextField>
            <TextField
              value={String(form.discountPercent)}
              onChange={(value) => {
                const n = Number(value)
                if (Number.isFinite(n)) set('discountPercent', Math.max(0, Math.min(100, n)))
              }}
              type="number"
              aria-label="Discount percentage"
            >
              <Label>Discount %</Label>
              <Input placeholder="0" min="0" max="100" />
              <FieldError />
            </TextField>
            <TextField
              value={String(form.stock)}
              onChange={(value) => {
                const n = Math.round(Number(value))
                if (Number.isFinite(n)) set('stock', Math.max(0, n))
              }}
              type="number"
              isRequired
              aria-label="Stock"
            >
              <Label>Stock</Label>
              <Input placeholder="0" min="0" />
              <FieldError />
            </TextField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              isRequired
              value={form.category}
              onChange={(value) => set('category', String(value ?? ''))}
              aria-label="Category"
            >
              <Label>Category</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {(categories ?? []).map((category) => (
                    <ListBox.Item key={category.id} id={category.id} textValue={category.name}>
                      {category.name}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>

            <TextField value={form.sku} onChange={(value) => set('sku', value)}>
              <Label>SKU</Label>
              <Input placeholder="EL-AUD-001" />
            </TextField>
          </div>

          <TextField value={form.tags} onChange={(value) => set('tags', value)}>
            <Label>Tags</Label>
            <Input placeholder="audio, wireless, headphones" />
            <p className="text-xs text-foreground/50">Comma separated.</p>
          </TextField>

          <Separator />

          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {form.images.map((url) => (
                <div key={url} className="relative h-20 w-20 overflow-hidden rounded-md border border-separator">
                  <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => set('images', form.images.filter((u) => u !== url))}
                    className="absolute right-1 top-1 rounded-full bg-background p-1 text-danger"
                    aria-label={`Remove ${url}`}
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => handleUpload(e.target.files)}
              />
              <Button type="button" variant="secondary" onPress={() => fileInputRef.current?.click()}>
                <Upload className="size-4" />
                Upload images
              </Button>
              <p className="text-xs text-foreground/50">Max 8 images. Uploads go to Cloudinary.</p>
            </div>

            {clientError && <p className="text-sm text-danger">{clientError}</p>}

            <div className="flex gap-2">
              <TextField
                className="flex-1"
                value={imageUrl}
                onChange={setImageUrl}
                aria-label="Image URL"
              >
                <Label>Add image by URL</Label>
                <Input placeholder="https://…" />
              </TextField>
              <Button
                type="button"
                variant="outline"
                className="self-end"
                onPress={() => {
                  const url = imageUrl.trim()
                  if (url) {
                    set('images', [...form.images, url])
                    setImageUrl('')
                  }
                }}
              >
                <ImagePlus className="size-4" />
                Add URL
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Switch isSelected={form.published} onChange={(value) => set('published', value)}>
              Published
            </Switch>
            <Switch isSelected={form.featured} onChange={(value) => set('featured', value)}>
              Featured
            </Switch>
          </div>

          {serverError && <p className="text-sm text-danger">{serverError}</p>}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" isPending={mutation.isPending} size="lg">
              {({ isPending }) => (isPending ? <Spinner color="current" size="sm" /> : 'Save product')}
            </Button>
            <Button type="button" variant="tertiary" onPress={() => router.back()}>
              Cancel
            </Button>
          </div>
        </Form>
      </Card.Content>
    </Card>
  )
}