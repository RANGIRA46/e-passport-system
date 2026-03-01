import { createContext, useContext, useState } from 'react'
import { MOCK_USERS } from '../data/mockData.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  function login(email) {
    if (email === 'uwase@dgie.gov.rw' || email === 'officer@dgie.gov.rw') {
      setUser(MOCK_USERS.officer)
      return MOCK_USERS.officer
    }
    if (email === 'admin@dgie.gov.rw') {
      setUser(MOCK_USERS.admin)
      return MOCK_USERS.admin
    }
    setUser(MOCK_USERS.citizen)
    return MOCK_USERS.citizen
  }

  function logout() { setUser(null) }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
