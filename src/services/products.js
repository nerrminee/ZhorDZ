import { db, storage, isFirebaseConfigured } from '../config/firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const PRODUCTS_COLL = 'products'

export async function getProducts() {
  if (!isFirebaseConfigured) return []
  const q = query(collection(db, PRODUCTS_COLL), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name || data.title || '',
      description: data.description || '',
      price: data.price || 0,
      imageUrl: data.imageUrl || null,
      imagePath: data.imagePath || null,
      createdAt: data.createdAt || null,
      isPublished: data.isPublished ?? data.published ?? false,
      ...data,
    }
  })
}

export function subscribeProducts(cb) {
  if (!isFirebaseConfigured) return () => {}
  const q = query(collection(db, PRODUCTS_COLL), orderBy('createdAt', 'desc'))
  const unsub = onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name || data.title || '',
        description: data.description || '',
        price: data.price || 0,
        imageUrl: data.imageUrl || null,
        imagePath: data.imagePath || null,
        createdAt: data.createdAt || null,
        isPublished: data.isPublished ?? data.published ?? false,
        ...data,
      }
    })
    cb(docs)
  })
  return unsub
}

export async function addProduct({ name, description, price, file, isPublished = false }) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured')

  let imageUrl = null
  let imagePath = null
  if (file) {
    const path = `products/${Date.now()}_${file.name}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    imageUrl = await getDownloadURL(storageRef)
    imagePath = path
  }

  const payload = {
    name,
    description,
    price: Number(price) || 0,
    imageUrl,
    imagePath,
    isPublished: !!isPublished,
    createdAt: new Date(),
  }

  const docRef = await addDoc(collection(db, PRODUCTS_COLL), payload)
  return { id: docRef.id, ...payload }
}

export async function updateProduct(id, updates = {}) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured')

  const docRef = doc(db, PRODUCTS_COLL, id)

  // handle file upload if present
  const { file, removeImage, price } = updates
  const toUpdate = { ...updates }

  if (price !== undefined) {
    toUpdate.price = Number(price) || 0
  }

  if (file) {
    const path = `products/${Date.now()}_${file.name}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const imageUrl = await getDownloadURL(storageRef)
    toUpdate.imageUrl = imageUrl
    toUpdate.imagePath = path
  }

  if (removeImage) {
    toUpdate.imageUrl = null
    toUpdate.imagePath = null
  }

  // remove helper-only keys
  delete toUpdate.file
  delete toUpdate.removeImage

  await updateDoc(docRef, toUpdate)
  return { id, ...toUpdate }
}

export async function deleteProduct(id, imagePath) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured')
  if (imagePath) {
    try {
      const storageRef = ref(storage, imagePath)
      await deleteObject(storageRef)
    } catch (e) {
      // ignore missing object
      console.warn('deleteProduct: failed deleting image', e.message)
    }
  }
  await deleteDoc(doc(db, PRODUCTS_COLL, id))
}
