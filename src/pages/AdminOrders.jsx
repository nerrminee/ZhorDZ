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
      { label: 'Orders', value: orders.length },
      { label: 'Revenue', value: formatPrice(totalRevenue) },
      { label: 'Items', value: totalItems },
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

    const label = preparedIds.length === 1 ? 'this order' : `${preparedIds.length} orders`
    if (!window.confirm(`Delete ${label}?`)) return

    setIsDeleting(true)
    try {
      await Promise.all(preparedIds.map((orderId) => deleteOrder(orderId)))
      setSelectedIds((current) => current.filter((id) => !preparedIds.includes(id)))
    } catch (error) {
      console.error('Failed to delete orders:', error)
      window.alert(`Failed to delete orders: ${error.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="admin-container admin-orders-shell">
      <header className="admin-header admin-console-header">
        <div className="admin-header-copy">
          <span className="admin-eyebrow">ZHOR order atelier</span>
          <div className="logo-section">
            <span className="logo-icon">ZHOR</span>
            <h1>Orders</h1>
          </div>
          <p className="subtitle">Review customer requests, delivery details, and selected pieces in one composed view.</p>
        </div>
        <div className="admin-header-actions">
          <a className="edit-btn" href="/admin">Products</a>
          <a className="cancel-btn" href="/">View store</a>
          <button type="button" onClick={logout} className="cancel-btn">Logout</button>
        </div>
        <div className="admin-stat-grid" aria-label="Orders overview">
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
            <span className="admin-eyebrow">Order list</span>
            <h2>Customer orders</h2>
          </div>
          <div className="orders-toolbar">
            <label className="order-select-all">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                disabled={!orders.length || isDeleting}
              />
              <span>Select all</span>
            </label>
            <button
              type="button"
              className="delete-btn order-delete-selected"
              disabled={!selectedCount || isDeleting}
              onClick={() => handleDeleteOrders(selectedIds)}
            >
              {isDeleting ? 'Deleting...' : `Delete selected (${selectedCount})`}
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
                        aria-label={`Select order ${order.id}`}
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
                      Delete
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
                          Qty {item.quantity}
                          {item.color ? ` / ${item.color}` : ''}
                          {item.size ? ` / ${item.size}` : ''}
                        </p>
                        <span>{formatPrice(Number(item.price) * Number(item.quantity || 1))}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-meta">
                  <span>Products: {formatPrice(order.subtotal || 0)}</span>
                  <span>Livraison: {formatPrice(order.deliveryPrice)}</span>
                  <span>Cash on delivery</span>
                  {order.customer?.note ? <span>Note: {order.customer.note}</span> : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-inventory">
            <p>No orders yet.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminOrders
