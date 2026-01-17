import { createHashRouter } from 'react-router-dom'

import { AppLayout } from '@app/layout/AppLayout'
import { ProtectedRoute } from '@app/router/ProtectedRoute'

import { ProductsPage } from '@pages/ProductsPage/ProductsPage'
import { ProductDetailsPage } from '@pages/ProductDetailsPage/ProductDetailsPage'
import { CreateProductPage } from '@pages/CreateProductPage/CreateProductPage'
import { EditProductPage } from '@pages/EditProductPage/EditProductPage'
import { LoginPage } from '@pages/LoginPage/LoginPage'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export const router = createHashRouter(
  [
    {
      element: <AppLayout />,
      children: [
        { path: '/login', element: <LoginPage /> },

        {
          element: <ProtectedRoute />,
          children: [
            { path: '/', element: <ProductsPage /> },
            { path: '/products', element: <ProductsPage /> },
            { path: '/products/create', element: <CreateProductPage /> },
            { path: '/products/:id', element: <ProductDetailsPage /> },
            { path: '/products/:id/edit', element: <EditProductPage /> },
          ],
        },
      ],
    },
  ],
  { basename },
)