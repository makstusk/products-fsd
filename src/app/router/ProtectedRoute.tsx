import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@app/store/hooks'

export function ProtectedRoute() {
  const isAuth = useAppSelector((s) => s.auth.isAuth)
  if (!isAuth) return <Navigate to="/login" replace />
  return <Outlet />
}
