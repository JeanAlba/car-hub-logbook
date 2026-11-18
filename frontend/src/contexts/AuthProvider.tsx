import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { setUnauthorizedHandler } from '@/services/api'
import * as authService from '@/services/authService'
import type { User } from '@/types'
import { AuthContext, type AuthContextValue, type AuthStatus } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const clearSession = useCallback(() => {
    setUser(null)
    setStatus('anonymous')
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    authService
      .fetchCurrentUser()
      .then((currentUser) => {
        setUser(currentUser)
        setStatus('authenticated')
      })
      .catch(() => setStatus('anonymous'))
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
      toast.error('Sua sessão expirou. Entre novamente.')
    })
  }, [clearSession])

  const login = useCallback<AuthContextValue['login']>(async (input) => {
    setUser(await authService.login(input))
    setStatus('authenticated')
  }, [])

  const register = useCallback<AuthContextValue['register']>(
    async (input) => {
      await authService.register(input)
      await login({ email: input.email, password: input.password })
    },
    [login],
  )

  const logout = useCallback<AuthContextValue['logout']>(async () => {
    try {
      await authService.logout()
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
