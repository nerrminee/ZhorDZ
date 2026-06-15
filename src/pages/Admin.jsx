import { useContext } from 'react'
import '../App.css'
import '../components/AdminPanel.css'
import { AuthContext } from '../context/AuthContextValue'
import AdminPanel from '../components/AdminPanel'

function Admin() {
  const { isAuthenticated, logout } = useContext(AuthContext)

  if (!isAuthenticated) return null

  return (
    <AdminPanel onLogout={logout} />
  )
}

export default Admin
