import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CreatedProduct } from '../types/product'
import { readLS, writeLS } from '@shared/lib/storage'
import { STORAGE_KEYS } from '@shared/constants/storageKeys'

export type CreatedFilter = 'all' | 'published' | 'unpublished'

type CreatedProductsState = {
  items: CreatedProduct[]
  filter: CreatedFilter
}

const initialState: CreatedProductsState = {
  items: readLS<CreatedProduct[]>(STORAGE_KEYS.CREATED_PRODUCTS, []),
  filter: readLS<CreatedFilter>(STORAGE_KEYS.CREATED_FILTER, 'all'),
}

function persist(state: CreatedProductsState) {
  writeLS(STORAGE_KEYS.CREATED_PRODUCTS, state.items)
  writeLS(STORAGE_KEYS.CREATED_FILTER, state.filter)
}

const createdProductsSlice = createSlice({
  name: 'createdProducts',
  initialState,
  reducers: {
    addCreatedProduct(state, action: PayloadAction<CreatedProduct>) {
      state.items.unshift(action.payload)
      persist(state)
    },
    updateCreatedProduct(state, action: PayloadAction<CreatedProduct>) {
      const idx = state.items.findIndex((p) => p.id === action.payload.id)
      if (idx >= 0) state.items[idx] = action.payload
      persist(state)
    },
    deleteCreatedProduct(state, action: PayloadAction<string>) {
      state.items = state.items.filter((p) => p.id !== action.payload)
      persist(state)
    },
    setCreatedFilter(state, action: PayloadAction<CreatedFilter>) {
      state.filter = action.payload
      persist(state)
    },
  },
})

export const {
  addCreatedProduct,
  updateCreatedProduct,
  deleteCreatedProduct,
  setCreatedFilter,
} = createdProductsSlice.actions

export const createdProductsReducer = createdProductsSlice.reducer
