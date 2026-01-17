import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Product, ProductsListResponse } from '../types/product'

export type CategoryItem = {
  slug: string
  name: string
  url: string
}

type GetProductsArgs = { limit: number; skip: number }

type GetProductsByCategoryArgs = {
  category: string
  limit: number
  skip: number
}

type SearchProductsArgs = {
  q: string
  limit: number
  skip: number
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://dummyjson.com/products',
  }),
  tagTypes: ['Products', 'Product', 'Categories'],
  endpoints: (build) => ({
    getProducts: build.query<ProductsListResponse, GetProductsArgs>({
      query: ({ limit, skip }) => `?limit=${limit}&skip=${skip}`,
      providesTags: (result) =>
        result
          ? [
              { type: 'Products', id: 'LIST' },
              ...result.products.map((p) => ({ type: 'Product' as const, id: p.id })),
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),

    getProductsByCategory: build.query<ProductsListResponse, GetProductsByCategoryArgs>({
      query: ({ category, limit, skip }) =>
        `/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`,
      providesTags: (result) =>
        result
          ? [
              { type: 'Products', id: `CATEGORY:${result.products[0]?.category ?? 'UNKNOWN'}` },
              ...result.products.map((p) => ({ type: 'Product' as const, id: p.id })),
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),

    getCategories: build.query<CategoryItem[], void>({
      // Возвращает [{slug,name,url}, ...]
      query: () => `/categories`,
      providesTags: [{ type: 'Categories', id: 'LIST' }],
    }),

    getProductById: build.query<Product, number>({
      query: (id) => `/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Product', id }],
    }),

    createProduct: build.mutation<Product, Partial<Product>>({
      query: (body) => ({ url: `/add`, method: 'POST', body }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),

    updateProduct: build.mutation<Product, { id: number; body: Partial<Product> }>({
      query: ({ id, body }) => ({ url: `/${id}`, method: 'PUT', body }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Product', id: arg.id },
        { type: 'Products', id: 'LIST' },
      ],
    }),

    deleteProduct: build.mutation<{ isDeleted: boolean; id: number }, number>({
      query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Product', id },
        { type: 'Products', id: 'LIST' },
      ],
    }),

    searchProducts: build.query<ProductsListResponse, SearchProductsArgs>({
      query: ({ q, limit, skip }) =>
        `/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`,
      providesTags: (result, _error, arg) =>
        result
          ? [
              { type: 'Products', id: `SEARCH:${arg.q}` },
              ...result.products.map((p) => ({ type: 'Product' as const, id: p.id })),
            ]
          : [{ type: 'Products', id: `SEARCH:${arg.q}` }],
    }),


  }),
})

export const {
  useGetProductsQuery,
  useGetProductsByCategoryQuery,
  useGetCategoriesQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useSearchProductsQuery,
} = productsApi
