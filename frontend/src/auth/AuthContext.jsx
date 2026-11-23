import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, UNAUTHORIZED_EVENT } from '../api'
import { clearSession, loadSession, saveSession } from './session'

const AuthContext = createContext(null)

/**
 * Holds the logged-in user for the whole app.
 * Pages call useAuth() instead of receiving `user` as a prop.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession)
  const navigate = useNavigate()

  const signIn = useCallback((data) => {
    saveSession(data)
    setUser(data)
    return data
  }, [])

  const login = useCallback(async (email, password) => signIn(await authApi.login(email, password)), [signIn])

  const register = useCallback(async (form) => signIn(await authApi.register(form)), [signIn])

  const logout = useCallback((redirectTo = '/') => {
    clearSession()
    setUser(null)
    navigate(redirectTo)
  }, [navigate])

  // The server said our token is invalid or expired: sign out and go to login.
  useEffect(() => {
    const onUnauthorized = () => logout('/login')
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [logout])

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** @returns {{ user: object|null, login: Function, register: Function, logout: Function }} */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
