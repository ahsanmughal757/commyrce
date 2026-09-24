'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Pagination, Select, ListBox, TextField, Input, Label, Form } from '@heroui/react'
import { useProducts, useCategories, type ProductIndexParams } from '@/lib/hooks'
import ProductCard from './ProductCard'
import ErrorState from './ErrorState'
import Reveal from './Reveal'

const SORTS = [
  { id: 'newest', textValue: 'Newest' },
  { id: 'price-asc', textValue: 'Price: Low to High' },
  { id: 'price-desc', textValue: 'Price: High to Low' },
  { id: 'most-discounted', textValue: 'Biggest discount' },
  { id: 'name-asc', textValue: 'Name A–Z' }
] as const

export default function ShopPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [applied, setApplied] = useState(() => ({
    q: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    sort: searchParams.get('sort') ?? 'newest',
    page: Number(searchParams.get('page') ?? 1)
  }))

  const { data: categories } = useCategories()
  const params: ProductIndexParams = {
    page: applied.page,
    limit: 12,
    sort: applied.sort,
    q: applied.q,
    category: applied.category,
    minDiscount: searchParams.get('minDiscount') ? Number(searchParams.get('minDiscount')) : undefined
  }
  const { data, isFetching, error, refetch } = useProducts(params)

  const syncUrl = (next: Partial<typeof applied>) => {
    const merged = { ...applied, ...next }
    const sp = new URLSearchParams()
    if (merged.q) sp.set('q', merged.q)
    if (merged.category) sp.set('category', merged.category)
    if (merged.sort !== 'newest') sp.set('sort', String(merged.sort))
    if (merged.page > 1) sp.set('page', String(merged.page))
    const minDiscount = searchParams.get('minDiscount')
    if (minDiscount) sp.set('minDiscount', minDiscount)
    router.replace(`/products${sp.toString() ? `?${sp.toString()}` : ''}`)
    setApplied(merged)
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page heading */}
      <div className="grid-lines relative overflow-hidden rounded-[1.4rem] border border-separator bg-gradient-to-br from-accent/10 via-transparent to-cyan-500/10 px-6 py-10">
        <div className="aurora aurora-accent right-0 top-0 h-40 w-40 opacity-40" />
        <div className="relative">
          <p className="eyebrow mb-2">The catalog</p>
          <h1 className="text-display text-3xl font-bold tracking-tight sm:text-4xl">
            {searchParams.get('minDiscount') ? "Today's deals" : 'Shop everything'}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-foreground/60">
            {searchParams.get('minDiscount')
              ? 'The biggest markdowns across the catalog, updated in real time.'
              : 'Filter by category, search by name or SKU, and sort the way you shop.'}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="glass-strong sticky top-[7.5rem] z-30 rounded-2xl border border-separator/80 p-3 shadow-sm">
        <Form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            syncUrl({ q: String(fd.get('q') ?? '').trim(), page: 1 })
          }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <TextField name="q" aria-label="Search products" className="min-w-0 flex-1">
              <Label className="sr-only">Search</Label>
              <Input placeholder="Search products…" className="h-11 w-full" />
            </TextField>
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={applied.category ?? 'all'}
                onChange={(value) => syncUrl({ category: value === 'all' ? undefined : String(value), page: 1 })}
                className="w-44"
                aria-label="Category"
              >
                <Label className="sr-only">Category</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="all" textValue="All categories">
                      All categories
                    </ListBox.Item>
                    {(categories ?? []).map((c) => (
                      <ListBox.Item key={c.slug} id={c.slug} textValue={c.name}>
                        {c.name}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              <Select
                value={applied.sort}
                onChange={(value) => syncUrl({ sort: String(value ?? 'newest'), page: 1 })}
                className="w-52"
                aria-label="Sort"
              >
                <Label className="sr-only">Sort</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {SORTS.map((s) => (
                      <ListBox.Item key={s.id} id={s.id} textValue={s.textValue}>
                        {s.textValue}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
              <Button type="submit" variant="secondary" className="h-11">
                Search
              </Button>
            </div>
          </div>
        </Form>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground/50">
          {data ? (
            <>
              Showing <span className="font-semibold text-foreground">{data.total}</span> product{data.total === 1 ? '' : 's'}
            </>
          ) : (
            'Loading catalog…'
          )}
        </span>
      </div>

      {error ? (
        <ErrorState message={error instanceof Error ? error.message : 'Failed to load products.'} onRetry={() => void refetch()} />
      ) : (
        <>
          {isFetching && !data ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton aspect-[4/5] rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                {data?.items.map((product, i) => (
                  <Reveal key={product.id} delay={(i % 4) * 70} className="h-full">
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
              {data && data.total === 0 && (
                <p className="py-16 text-center text-foreground/50">No products match your filters.</p>
              )}
              {data && data.totalPages > 1 && (
                <Pagination size="sm" className="justify-center">
                  <Pagination.Summary>
                    {data.total > 0 ? `${(data.page - 1) * data.limit + 1}–${Math.min(data.page * data.limit, data.total)} of ${data.total}` : ''}
                  </Pagination.Summary>
                  <Pagination.Content>
                    <Pagination.Item>
                      <Pagination.Previous isDisabled={data.page === 1} onPress={() => syncUrl({ page: data.page - 1 })}>
                        <Pagination.PreviousIcon />
                      </Pagination.Previous>
                    </Pagination.Item>
                    {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
                      <Pagination.Item key={page}>
                        <Pagination.Link isActive={page === data.page} onPress={() => syncUrl({ page })}>
                          {page}
                        </Pagination.Link>
                      </Pagination.Item>
                    ))}
                    <Pagination.Item>
                      <Pagination.Next isDisabled={data.page === data.totalPages} onPress={() => syncUrl({ page: data.page + 1 })}>
                        <Pagination.NextIcon />
                      </Pagination.Next>
                    </Pagination.Item>
                  </Pagination.Content>
                </Pagination>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}