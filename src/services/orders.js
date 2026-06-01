import { db } from '../config/firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'

const ORDERS_COLL = 'orders'

export async function addOrder(orderData) {
  const payload = {
    ...orderData,
    status: orderData.status || 'new',
    paymentMethod: 'cash_on_delivery',
    createdAt: serverTimestamp(),
  }

  const docRef = await addDoc(collection(db, ORDERS_COLL), payload)
  return { id: docRef.id, ...payload }
}

export function subscribeOrders(cb) {
  const q = query(collection(db, ORDERS_COLL), orderBy('createdAt', 'desc'))
  const unsub = onSnapshot(q, (snap) => {
    cb(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
  })

  return unsub
}

export async function deleteOrder(orderId) {
  await deleteDoc(doc(db, ORDERS_COLL, orderId))
  return orderId
}
