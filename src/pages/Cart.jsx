import '../App.css'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { CART_STORAGE_KEY, formatPrice, getOrderTotals, writeCheckout } from '../utils/cart'

function Cart() {
  const [items, setItems] = useLocalStorage(CART_STORAGE_KEY, [])
  const totals = getOrderTotals(items)

  const updateQuantity = (cartId, quantity) => {
    setItems((current) =>
      current.map((item) => item.cartId === cartId ? { ...item, quantity: Math.max(1, quantity) } : item)
    )
  }

  const removeItem = (cartId) => {
    setItems((current) => current.filter((item) => item.cartId !== cartId))
  }

  const checkout = () => {
    writeCheckout(items, 'cart')
    window.location.assign('/checkout')
  }

  return (
    <main className="cart-page" aria-label="Page Panier">
      <div className="cart-shell">
        <section className="cart-panel">
          <p className="boutique-subtitle">Panier</p>
          <h1>Votre panier</h1>

          {items.length ? (
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={item.cartId}>
                  <div className="cart-thumb">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : null}
                  </div>
                  <div className="cart-item-info">
                    <h2>{item.name}</h2>
                    <p>
                      {item.color ? `Couleur: ${item.color}` : null}
                      {item.color && item.size ? ' / ' : null}
                      {item.size ? `Taille: ${item.size}` : null}
                    </p>
                    <strong>{formatPrice(item.price)}</strong>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-control" aria-label="Quantité">
                      <button type="button" onClick={() => updateQuantity(item.cartId, Number(item.quantity || 1) - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.cartId, Number(item.quantity || 1) + 1)}>+</button>
                    </div>
                    <button className="shop-card-btn" type="button" onClick={() => removeItem(item.cartId)}>Retirer</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="wishlist-empty">
              <h2>Votre panier est vide</h2>
              <p>Ajoutez un produit depuis la boutique pour commencer une commande.</p>
            </div>
          )}
        </section>

        <aside className="cart-summary">
          <h2>Total</h2>
          <div className="summary-totals">
            <div><span>Produits</span><strong>{formatPrice(totals.subtotal)}</strong></div>
            <div><span>Livraison</span><strong>{formatPrice(totals.deliveryPrice)}</strong></div>
            <div className="summary-total"><span>Total</span><strong>{formatPrice(totals.total)}</strong></div>
          </div>
          <button className="confirm-order-btn" type="button" onClick={checkout} disabled={!items.length}>Acheter</button>
        </aside>
      </div>
    </main>
  )
}

export default Cart
