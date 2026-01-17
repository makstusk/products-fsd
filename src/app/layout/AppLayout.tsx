import { NavLink, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@app/store/hooks'
import { login, logout } from '@features/auth/model/authSlice'

export function AppLayout() {
  const isAuth = useAppSelector((s) => s.auth.isAuth)
  const dispatch = useAppDispatch()

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <strong>Products App</strong>
          <nav style={{ display: 'flex', gap: 12 }}>
            <NavLink to="/products">Products</NavLink>
          </nav>
        </div>

        <div>
          {isAuth ? (
            <button onClick={() => dispatch(logout())}>Logout</button>
          ) : (
            <button onClick={() => dispatch(login())}>Login</button>
          )}
        </div>
      </header>

      <main style={{ marginTop: 16 }}>
        <Outlet />
      </main>
    </div>
  )
}
