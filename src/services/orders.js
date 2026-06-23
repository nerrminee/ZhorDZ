import { requestJson } from './apiClient.js'

const ORDERS_API = '/api/orders'

export async function addOrder(orderData) {
  return requestJson(ORDERS_API, {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
}

export function subscribeOrders(cb) {
  let isActive = true
  let timeoutId

  const load = async () => {
    try {
      const orders = await requestJson(ORDERS_API)
      if (isActive) cb(orders)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      if (isActive) timeoutId = window.setTimeout(load, 5000)
    }
  }

  load()

  return () => {
    isActive = false
    if (timeoutId) window.clearTimeout(timeoutId)
  }
}

export async function deleteOrder(orderId) {
  await requestJson(`${ORDERS_API}?id=${encodeURIComponent(orderId)}`, {
    method: 'DELETE',
  })
  return orderId
}
