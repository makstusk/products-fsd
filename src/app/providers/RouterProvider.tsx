import { RouterProvider as RRProvider } from 'react-router-dom'
import { router } from '@app/router/router'

export function RouterProvider() {
  return <RRProvider router={router} />
}
