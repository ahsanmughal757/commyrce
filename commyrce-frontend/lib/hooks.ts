'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './api'
import type {
  AdminSession,
  Category,
  DashboardSummary,
  Paginated,
  Product,
  SessionUser
} from './types'

export interface ProductIndexParams {
  page?: number
  limit?: number
  sort?: string
  q?: string
  category?: string
  minDiscount?: number
  minPriceCents?: number
  maxPriceCents?: number
}

export const useProducts = (params: ProductIndexParams) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: () =>
      apiFetch<Paginated<Product>>('/api/products', {
        query: params as Record<string, string | number | boolean | undefined>
      }),
    placeholderData: (prev) => prev
  })

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiFetch<{ product: Product }>(`/api/products/${encodeURIComponent(slug)}`).then((d) => d.product),
    enabled: Boolean(slug)
  })

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<{ categories: Category[] }>('/api/products/categories').then((d) => d.categories)
  })

export const useSession = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<{ user: SessionUser }>('/api/auth/me').then((d) => d.user),
    retry: false
  })

export const useAdminSession = () =>
  useQuery({
    queryKey: ['admin-me'],
    queryFn: () => apiFetch<{ admin: AdminSession }>('/api/admin/auth/check').then((d) => d.admin),
    retry: false
  })

export interface AdminProductParams {
  page?: number
  limit?: number
  sort?: string
  q?: string
  category?: string
  published?: string
}

export const useAdminProducts = (params: AdminProductParams) =>
  useQuery({
    queryKey: ['admin-products', params],
    queryFn: () =>
      apiFetch<Paginated<Product>>('/api/admin/products', {
        query: params as Record<string, string | number | boolean | undefined>
      })
  })

export const useAdminProduct = (id: string) =>
  useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => apiFetch<{ product: Product }>(`/api/admin/products/${encodeURIComponent(id)}`).then((d) => d.product),
    enabled: Boolean(id)
  })

export const useAdminCategories = () =>
  useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => apiFetch<{ categories: Category[] }>('/api/admin/categories').then((d) => d.categories)
  })

export const useDashboard = () =>
  useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiFetch<DashboardSummary>('/api/admin/dashboard')
  })