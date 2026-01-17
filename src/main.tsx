import React from 'react'
import ReactDOM from 'react-dom/client'
import { StoreProvider } from '@app/providers/StoreProvider'
import { RouterProvider } from '@app/providers/RouterProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <RouterProvider />
    </StoreProvider>
  </React.StrictMode>,
)
