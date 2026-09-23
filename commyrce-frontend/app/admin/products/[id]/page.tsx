'use client'

import { use } from 'react'
import { Spinner } from '@heroui/react'
import ProductForm from '@/components/admin/ProductForm'
import { useAdminProduct } from '@/lib/hooks'
import ErrorState from '@/components/ErrorState'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: product, isPending, isError, error, refetch } = useAdminProduct(id)

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" color="accent" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <ErrorState
        title={error instanceof Error && (error as { status?: number }).status === 404 ? 'Product not found' : 'Product unavailable'}
        message={error instanceof Error ? error.message : 'Product not found.'}
        onRetry={() => void refetch()}
      />
    )
  }

  return <ProductForm mode="edit" initial={product} />
}