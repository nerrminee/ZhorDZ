import { useState } from 'react'
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../config/adminCredentials'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('auth') === '1'
  )

  function login(username, password) {
    // Simple client-side check (DEV ONLY). Replace with server auth for production.
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('auth', '1')
      setIsAuthenticated(true)
      return { ok: true }
    }
    return { ok: false, message: 'Identifiants invalides' }
  }

  function logout() {
    sessionStorage.removeItem('auth')
    setIsAuthenticated(false)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
