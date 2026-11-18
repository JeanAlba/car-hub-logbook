import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Splash } from './Splash'

export function GuestRoute() {
  const { status } = useAuth()

  if (status === 'loading') {
    return <Splash />
  }

  if (status === 'authenticated') {
    return <Navigate to="/visao-geral" replace />
  }

  return <Outlet />
}
