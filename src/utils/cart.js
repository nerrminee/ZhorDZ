import { getProductImages } from './productOptions'

export const CART_STORAGE_KEY = 'zhordz-cart'
export const CHECKOUT_STORAGE_KEY = 'zhordz-checkout-items'
export const CHECKOUT_SOURCE_KEY = 'zhordz-checkout-source'
export const DELIVERY_PRICE = 500

export function createCartItem(product, options = {}) {
  const images = getProductImages(product)

  return {
    cartId: `${product.id || product.slug}-${options.color || 'default'}-${options.size || 'default'}-${Date.now()}`,
    productId: product.id || '',
    slug: product.slug || '',
    name: product.name || 'Produit',
    sku: product.sku || '',
    imageUrl: images[0] || '',
    color: options.color || '',
    size: options.size || '',
    quantity: Number(options.quantity) || 1,
    price: Number(product.price) || 0,
  }
}

export function formatPrice(value) {
  return `${Number(value || 0).toFixed(2)} DA`
}

export function getOrderTotals(items = []) {
  const subtotal = items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 1), 0)
  const deliveryPrice = items.length ? DELIVERY_PRICE : 0

  return {
    subtotal,
    deliveryPrice,
    total: subtotal + deliveryPrice,
  }
}

export function writeCheckout(items, source = 'direct') {
  window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(items))
  window.localStorage.setItem(CHECKOUT_SOURCE_KEY, source)
}
