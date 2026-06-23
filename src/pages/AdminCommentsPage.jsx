import { useContext } from 'react'
import '../components/AdminPanel.css'
import AdminComments from '../components/AdminComments'
import { AuthContext } from '../context/AuthContextValue'

function AdminCommentsPage() {
  const { isAuthenticated, logout } = useContext(AuthContext)

  if (!isAuthenticated) return null

  return (
    <div className="admin-container admin-orders-shell">
      <header className="admin-header admin-console-header">
        <div className="admin-header-copy">
          <span className="admin-eyebrow">Atelier des commentaires ZHOR</span>
          <div className="logo-section">
            <span className="logo-icon">ZHOR</span>
            <h1>Commentaires</h1>
          </div>
          <p className="subtitle">Consultez les messages envoyes par les clientes depuis la page d'accueil.</p>
        </div>
        <div className="admin-header-actions">
          <a className="edit-btn" href="/admin">Produits</a>
          <a className="edit-btn" href="/admin/orders">Commandes</a>
          <a className="edit-btn" href="/admin/clients">Clients</a>
          <a className="cancel-btn" href="/">Voir la boutique</a>
          <button type="button" onClick={logout} className="cancel-btn">Deconnexion</button>
        </div>
      </header>

      <AdminComments />
    </div>
  )
}

export default AdminCommentsPage
