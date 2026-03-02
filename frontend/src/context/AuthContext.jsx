import { createContext, useContext, useState, useEffect } from 'react'
import { authApi, token as tokenStore } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const t = tokenStore.get()
    if (!t) { setLoading(false); return }
    authApi.me()
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const { token, user } = await authApi.login(email, password)
    tokenStore.set(token)
    setUser(user)
    return user
  }

  async function register(data) {
    const { token, user } = await authApi.register(data)
    tokenStore.set(token)
    setUser(user)
    return user
  }

  function logout() {
    tokenStore.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
