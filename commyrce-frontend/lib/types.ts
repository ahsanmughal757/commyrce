export interface Category {
  id: string
  name: string
  slug: string
}

export interface Product {
  id: string
  slug: string
  name: string
  description?: string
  priceCents: number
  discountPercent: number
  salePriceCents: number
  images: string[]
  coverImage?: string | null
  stock: number
  sku?: string
  tags: string[]
  published?: boolean
  featured?: boolean
  category?: Category | string
  categoryId?: string
  categoryName?: string
  categorySlug?: string
  createdAt?: string
  updatedAt?: string
}

export interface Paginated<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SessionUser {
  id: string
  name: string
  email: string
}

export interface AdminSession {
  id: string
  name: string
  email: string
  role: 'admin' | 'superadmin'
}

export interface DashboardStats {
  productCount: number
  publishedCount: number
  lowStockCount: number
  ordersLast30Days: number
  revenueLast30DaysCents: number
}

export interface DashboardSummary {
  stats: DashboardStats
  lowStockProducts: Product[]
  recentOrders: RecentOrder[]
}

export interface RecentOrder {
  id: string
  orderNumber: string
  customerEmail: string
  customerName?: string
  status: string
  totalCents: number
  itemCount: number
  createdAt: string
}