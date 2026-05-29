import { useContext } from 'react'
import '../App.css'
import { AuthContext } from '../context/AuthContextValue'
import AdminPanel from '../components/AdminPanel'

function Admin() {
  const { isAuthenticated, logout } = useContext(AuthContext)

  if (!isAuthenticated) return null

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin</h1>
        <div className="admin-header-actions">
          <a href="/admin/orders" className="shop-card-btn">List of orders</a>
          <button onClick={logout} className="shop-card-btn">Logout</button>
        </div>
      </div>

      <AdminPanel />
    </div>
  )
}

export default Admin
