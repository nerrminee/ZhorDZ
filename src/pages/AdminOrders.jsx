import { useContext, useEffect, useMemo, useState } from 'react'
import '../components/AdminPanel.css'
import { AuthContext } from '../context/AuthContextValue'
import { deleteOrder, subscribeOrders } from '../services/orders'
import { formatPrice } from '../utils/cart'

function AdminOrders() {
  const { isAuthenticated, logout } = useContext(AuthContext)
  const [orders, setOrders] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return undefined
    const unsubscribe = subscribeOrders((list) => setOrders(list))
    return () => unsubscribe()
  }, [isAuthenticated])

  const selectedCount = selectedIds.length
  const allSelected = orders.length > 0 && selectedCount === orders.length
  const orderStats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
    const totalItems = orders.reduce(
      (sum, order) => sum + (order.items || []).reduce((itemSum, item) => itemSum + Number(item.quantity || 1), 0),
      0
    )
    const wilayas = new Set(orders.map((order) => order.customer?.wilaya).filter(Boolean)).size

    return [
      { label: 'Commandes', value: orders.length },
      { label: 'Revenu', value: formatPrice(totalRevenue) },
      { label: 'Articles', value: totalItems },
      { label: 'Wilayas', value: wilayas },
    ]
  }, [orders])

  const toggleSelected = (orderId) => {
    setSelectedIds((current) =>
      current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]
    )
  }

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : orders.map((order) => order.id))
  }

  const handleDeleteOrders = async (ids) => {
    const orderIds = Array.isArray(ids) ? ids : [ids]
    const preparedIds = orderIds.filter(Boolean)
    if (!preparedIds.length) return

    const label = preparedIds.length === 1 ? 'cette commande' : `${preparedIds.length} commandes`
    if (!window.confirm(`Supprimer ${label} ?`)) return

    setIsDeleting(true)
    try {
      await Promise.all(preparedIds.map((orderId) => deleteOrder(orderId)))
      setSelectedIds((current) => current.filter((id) => !preparedIds.includes(id)))
    } catch (error) {
      console.error('Échec de la suppression des commandes :', error)
      window.alert(`Échec de la suppression des commandes : ${error.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="admin-container admin-orders-shell">
      <header className="admin-header admin-console-header">
        <div className="admin-header-copy">
          <span className="admin-eyebrow">Atelier des commandes ZHOR</span>
          <div className="logo-section">
            <span className="logo-icon">ZHOR</span>
            <h1>Commandes</h1>
          </div>
          <p className="subtitle">Examinez les demandes des clients, les détails de livraison et les pièces sélectionnées dans une vue d'ensemble.</p>
        </div>
        <div className="admin-header-actions">
          <a className="edit-btn" href="/admin">Produits</a>
          <a className="edit-btn" href="/admin/comments">Commentaires</a>
          <a className="edit-btn" href="/admin/clients">Clients</a>
          <a className="cancel-btn" href="/">Voir la boutique</a>
          <button type="button" onClick={logout} className="cancel-btn">Déconnexion</button>
        </div>
        <div className="admin-stat-grid" aria-label="Aperçu des commandes">
          {orderStats.map((stat) => (
            <div className="admin-stat" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </header>

      <section className="orders-card admin-orders-page">
        <div className="orders-card-header">
          <div>
            <span className="admin-eyebrow">Liste des commandes</span>
            <h2>Commandes clients</h2>
          </div>
          <div className="orders-toolbar">
            <label className="order-select-all">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                disabled={!orders.length || isDeleting}
              />
              <span>Tout sélectionner</span>
            </label>
            <button
              type="button"
              className="delete-btn order-delete-selected"
              disabled={!selectedCount || isDeleting}
              onClick={() => handleDeleteOrders(selectedIds)}
            >
              {isDeleting ? 'Suppression...' : `Supprimer la sélection (${selectedCount})`}
            </button>
          </div>
        </div>

        {orders.length ? (
          <div className="orders-list">
            {orders.map((order) => (
              <article className={`order-card ${selectedIds.includes(order.id) ? 'is-selected' : ''}`} key={order.id}>
                <div className="order-card-top">
                  <div className="order-title-row">
                    <label className="order-select">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => toggleSelected(order.id)}
                        disabled={isDeleting}
                        aria-label={`Sélectionner la commande ${order.id}`}
                      />
                    </label>
                    <div>
                      <h3>{order.customer?.lastName} {order.customer?.firstName}</h3>
                      <p>{order.customer?.phone} - {order.customer?.wilaya}</p>
                    </div>
                  </div>
                  <div className="order-total-actions">
                    <span className="order-total-label">Total</span>
                    <strong>{formatPrice(order.total)}</strong>
                    <button
                      type="button"
                      className="delete-btn order-delete-btn"
                      onClick={() => handleDeleteOrders(order.id)}
                      disabled={isDeleting}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <div className="order-items">
                  {order.items?.map((item) => (
                    <div className="order-item" key={item.cartId || item.productId}>
                      <div className="order-thumb">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : null}
                      </div>
                      <div>
                        <h4>{item.name}</h4>
                        <p>
                          Qté {item.quantity}
                          {item.color ? ` / ${item.color}` : ''}
                          {item.size ? ` / ${item.size}` : ''}
                        </p>
                        <span>{formatPrice(Number(item.price) * Number(item.quantity || 1))}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-meta">
                  <span>Produits : {formatPrice(order.subtotal || 0)}</span>
                  <span>Livraison : {formatPrice(order.deliveryPrice)}</span>
                  <span>Paiement à la livraison</span>
                  {order.customer?.note ? <span>Note: {order.customer.note}</span> : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-inventory">
            <p>Aucune commande pour le moment.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminOrders
