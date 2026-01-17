import { configureStore } from '@reduxjs/toolkit'
import { productsApi } from '@entities/product/api/productsApi'
import { authReducer } from '@features/auth/model/authSlice'
import { createdProductsReducer } from '@entities/product/model/createdProductsSlice'

export const store = configureStore({
  reducer: {
    [productsApi.reducerPath]: productsApi.reducer,
    auth: authReducer,
    createdProducts: createdProductsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
