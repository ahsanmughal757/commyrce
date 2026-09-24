'use client'

import { configureStore } from '@reduxjs/toolkit'
import { CART_STORAGE_KEY, cartSlice } from './cartSlice'

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      cart: cartSlice.reducer
    }
  })

  store.subscribe(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(store.getState().cart.items))
    } catch {
      // localStorage unavailable — cart persistence is best-effort
    }
  })

  return store
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']