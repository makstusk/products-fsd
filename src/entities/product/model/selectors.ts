import type { RootState } from '@app/store/store'
import type { CreatedProduct } from '../types/product'

export const selectCreatedProducts = (s: RootState): CreatedProduct[] =>
  s.createdProducts.items

export const selectCreatedFilter = (s: RootState) => s.createdProducts.filter
