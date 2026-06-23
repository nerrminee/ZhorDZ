import { useContext, useEffect, useState } from 'react'
import '../components/AdminPanel.css'
import { AuthContext } from '../context/AuthContextValue'
import { subscribeClients } from '../services/clients'

function AdminClients() {
  const { isAuthenticated, logout } = useContext(AuthContext)
  const [clients, setClients] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return undefined
    const unsubscribe = subscribeClients(
      (list) => {
        setClients(list)
        setError('')
      },
      (snapshotError) => {
        console.error('Failed to load clients:', snapshotError)
        setError(snapshotError.message)
      }
    )
    return () => unsubscribe()
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  return (
    <div className="admin-container admin-orders-shell">
      <header className="admin-header admin-console-header">
        <div className="admin-header-copy">
          <span className="admin-eyebrow">Atelier des clients ZHOR</span>
          <div className="logo-section">
            <span className="logo-icon">ZHOR</span>
            <h1>Clients</h1>
          </div>
          <p className="subtitle">Consultez les clientes inscrites avec leur nom, email et telephone.</p>
        </div>
        <div className="admin-header-actions">
          <a className="edit-btn" href="/admin">Produits</a>
          <a className="edit-btn" href="/admin/orders">Commandes</a>
          <a className="edit-btn" href="/admin/comments">Commentaires</a>
          <a className="cancel-btn" href="/">Voir la boutique</a>
          <button type="button" onClick={logout} className="cancel-btn">Deconnexion</button>
        </div>
      </header>

      <section className="orders-card admin-orders-page">
        <div className="orders-card-header">
          <div>
            <span className="admin-eyebrow">Liste des clients</span>
            <h2>Clients inscrits</h2>
          </div>
          <span className="product-count">{clients.length} au total</span>
        </div>

        {error ? (
          <div className="alert-message error">
            Impossible de charger les clients: {error}
          </div>
        ) : clients.length ? (
          <div className="orders-list">
            {clients.map((client) => (
              <article className="order-card" key={client.id}>
                <div className="order-card-top">
                  <div>
                    <h3>{client.name || 'Client sans nom'}</h3>
                    <p>{client.email || 'Email indisponible'}</p>
                  </div>
                  <div className="order-total-actions">
                    <span className="order-total-label">Telephone</span>
                    <strong>{client.phone || 'N/A'}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-inventory">
            <p>Aucun client inscrit pour le moment.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminClients
