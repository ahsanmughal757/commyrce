'use client'

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
  productId: string
  slug: string
  name: string
  coverImage: string
  priceCents: number
  quantity: number
}

export const CART_STORAGE_KEY = 'commyrce_cart'

function loadInitial(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

interface CartState {
  items: CartItem[]
}

const initialState: CartState = { items: loadInitial() }

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.productId === action.payload.productId)
      if (existing) {
        existing.quantity = Math.min(existing.quantity + action.payload.quantity, 99)
      } else {
        state.items.push(action.payload)
      }
    },
    setQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find((i) => i.productId === action.payload.productId)
      if (item) {
        item.quantity = Math.max(1, Math.min(action.payload.quantity, 99))
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload)
    },
    clearCart(state) {
      state.items = []
    }
  }
})

export const { addItem, setQuantity, removeItem, clearCart } = cartSlice.actions

export const selectCartCount = (state: { cart: CartState }): number =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)

export const selectCartSubtotal = (state: { cart: CartState }): number =>
  state.cart.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0)