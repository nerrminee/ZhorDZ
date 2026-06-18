import { useMemo, useState } from 'react'
import '../App.css'
import { addOrder } from '../services/orders'
import { ALGERIA_WILAYAS } from '../constants/wilayas'
import { CART_STORAGE_KEY, CHECKOUT_SOURCE_KEY, CHECKOUT_STORAGE_KEY, formatPrice, getOrderTotals } from '../utils/cart'

const initialCustomer = {
  firstName: '',
  lastName: '',
  phone: '',
  wilaya: '',
  note: '',
}

function readCheckoutItems() {
  const checkoutItems = JSON.parse(window.localStorage.getItem(CHECKOUT_STORAGE_KEY) || '[]')
  if (checkoutItems.length) return checkoutItems

  return JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]')
}

function Checkout() {
  const [items, setItems] = useState(readCheckoutItems)
  const [customer, setCustomer] = useState(initialCustomer)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const totals = useMemo(() => getOrderTotals(items), [items])

  const handleChange = (field, value) => {
    setCustomer((current) => ({ ...current, [field]: value }))
  }

  const handleConfirm = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!items.length) {
      setError('Votre panier est vide.')
      return
    }

    if (!customer.firstName.trim() || !customer.lastName.trim() || !customer.phone.trim() || !customer.wilaya) {
      setError('Veuillez remplir le nom, le prénom, le téléphone et la wilaya.')
      return
    }

    const phone = customer.phone.replace(/\s/g, '')
    if (!/^(\+213|0)(5|6|7)[0-9]{8}$/.test(phone)) {
      setError('Veuillez entrer un numéro de téléphone algérien valide.')
      return
    }

    setIsSubmitting(true)

    try {
      await addOrder({
        customer: {
          firstName: customer.firstName.trim(),
          lastName: customer.lastName.trim(),
          phone,
          wilaya: customer.wilaya,
          note: customer.note.trim(),
        },
        items,
        subtotal: totals.subtotal,
        deliveryPrice: totals.deliveryPrice,
        total: totals.total,
      })

      const source = window.localStorage.getItem(CHECKOUT_SOURCE_KEY)
      window.localStorage.removeItem(CHECKOUT_STORAGE_KEY)
      window.localStorage.removeItem(CHECKOUT_SOURCE_KEY)
      if (source === 'cart') window.localStorage.setItem(CART_STORAGE_KEY, '[]')

      setItems([])
      setCustomer(initialCustomer)
      setMessage('Votre commande a été confirmée. Paiement en espèces à la livraison.')
    } catch (err) {
      console.error(err)
      setError(`Impossible de confirmer la commande : ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="checkout-page" aria-label="Page de commande">
      <div className="checkout-shell">
        <section className="checkout-form-panel">
          <p className="boutique-subtitle">Commande</p>
          <h1>Informations de livraison</h1>

          {message ? <div className="checkout-alert success">{message}</div> : null}
          {error ? <div className="checkout-alert error">{error}</div> : null}

          <form className="checkout-form" onSubmit={handleConfirm}>
            <div className="checkout-row">
              <label>
                Nom
                <input value={customer.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required />
              </label>
              <label>
                Prénom
                <input value={customer.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required />
              </label>
            </div>

            <label>
              Numéro de téléphone algérien
              <input
                value={customer.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="0550123456"
                required
              />
            </label>

            <label>
              Wilaya
              <select value={customer.wilaya} onChange={(e) => handleChange('wilaya', e.target.value)} required>
                <option value="">Sélectionner une wilaya</option>
                {ALGERIA_WILAYAS.map((wilaya) => (
                  <option key={wilaya} value={wilaya}>{wilaya}</option>
                ))}
              </select>
            </label>

            <label>
              Note
              <textarea
                value={customer.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="Adresse précise, horaires préférés..."
                rows="4"
              />
            </label>

            <p className="cash-delivery-note">Le paiement se fait en espèces à la livraison.</p>

            <button className="confirm-order-btn" type="submit" disabled={isSubmitting || !items.length}>
              {isSubmitting ? 'Confirmation...' : 'Confirmer la commande'}
            </button>
          </form>
        </section>

        <aside className="order-summary-panel" aria-label="Récapitulatif de la commande">
          <h2>Récapitulatif</h2>
          {items.length ? (
            <div className="summary-items">
              {items.map((item) => (
                <div className="summary-item" key={item.cartId || item.productId}>
                  <div className="summary-thumb">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : null}
                  </div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      {item.color ? `Couleur: ${item.color}` : null}
                      {item.color && item.size ? ' / ' : null}
                      {item.size ? `Taille: ${item.size}` : null}
                    </p>
                    <p>Quantité : {item.quantity}</p>
                  </div>
                  <strong>{formatPrice(Number(item.price) * Number(item.quantity || 1))}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-summary">Aucun produit sélectionné.</p>
          )}

          <div className="summary-totals">
            <div><span>Produits</span><strong>{formatPrice(totals.subtotal)}</strong></div>
            <div><span>Livraison</span><strong>{formatPrice(totals.deliveryPrice)}</strong></div>
            <div className="summary-total"><span>Total</span><strong>{formatPrice(totals.total)}</strong></div>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default Checkout
