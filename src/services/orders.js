import { db, isFirebaseConfigured } from '../config/firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'

const ORDERS_COLL = 'orders'

export async function addOrder(orderData) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured')

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
  if (!isFirebaseConfigured) return () => {}

  const q = query(collection(db, ORDERS_COLL), orderBy('createdAt', 'desc'))
  const unsub = onSnapshot(q, (snap) => {
    cb(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
  })

  return unsub
}

export async function deleteOrder(orderId) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured')
  await deleteDoc(doc(db, ORDERS_COLL, orderId))
  return orderId
}
