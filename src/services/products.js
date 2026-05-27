import { db, storage, isFirebaseConfigured } from '../config/firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'

const PRODUCTS_COLL = 'products'

export async function uploadImage(file, onProgress) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured')
  if (!file) throw new Error('No file provided for upload')

  const imagePath = `products/${Date.now()}_${file.name}`
  const storageRef = ref(storage, imagePath)
  const uploadTask = uploadBytesResumable(storageRef, file)

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          onProgress(progress)
        }
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        resolve({
          image_url: url,
          imageUrl: url,
          imagePath,
        })
      }
    )
  })
}

export async function addProduct(productData) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured')

  const {
    name,
    description,
    price,
    sizes = [],
    colors = [],
    file,
    isPublished = true,
    onUploadProgress,
  } = productData

  const preparedSizes = Array.isArray(sizes)
    ? sizes.filter(Boolean).map((item) => item.trim())
    : String(sizes).split(',').map((item) => item.trim()).filter(Boolean)

  const preparedColors = Array.isArray(colors)
    ? colors.filter(Boolean).map((item) => item.trim())
    : String(colors).split(',').map((item) => item.trim()).filter(Boolean)

  let imagePayload = {
    image_url: productData.imageUrl || null,
    imageUrl: productData.imageUrl || null,
    imagePath: null,
  }

  if (file) {
    imagePayload = await uploadImage(file, onUploadProgress)
  }

  const payload = {
    name: (name || '').trim(),
    description: (description || '').trim(),
    price: Number(price) || 0,
    sizes: preparedSizes,
    colors: preparedColors,
    createdAt: serverTimestamp(),
    isPublished: !!isPublished,
    ...imagePayload,
  }

  const docRef = await addDoc(collection(db, PRODUCTS_COLL), payload)
  return { id: docRef.id, ...payload }
}

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
      imageUrl: data.imageUrl || data.image_url || null,
      image_url: data.image_url || data.imageUrl || null,
      imagePath: data.imagePath || null,
      createdAt: data.createdAt || null,
      sizes: Array.isArray(data.sizes) ? data.sizes : [],
      colors: Array.isArray(data.colors) ? data.colors : [],
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
        imageUrl: data.imageUrl || data.image_url || null,
        image_url: data.image_url || data.imageUrl || null,
        imagePath: data.imagePath || null,
        createdAt: data.createdAt || null,
        sizes: Array.isArray(data.sizes) ? data.sizes : [],
        colors: Array.isArray(data.colors) ? data.colors : [],
        isPublished: data.isPublished ?? data.published ?? false,
        ...data,
      }
    })
    cb(docs)
  })
  return unsub
}

export async function updateProduct(id, updates = {}) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured')

  const docRef = doc(db, PRODUCTS_COLL, id)
  const { file, removeImage, price } = updates
  const toUpdate = { ...updates }

  if (price !== undefined) {
    toUpdate.price = Number(price) || 0
  }

  if (file) {
    const imagePayload = await uploadImage(file)
    toUpdate.imageUrl = imagePayload.imageUrl
    toUpdate.image_url = imagePayload.image_url
    toUpdate.imagePath = imagePayload.imagePath
  }

  if (removeImage) {
    toUpdate.imageUrl = null
    toUpdate.image_url = null
    toUpdate.imagePath = null
  }

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
      console.warn('deleteProduct: failed deleting image', e.message)
    }
  }
  await deleteDoc(doc(db, PRODUCTS_COLL, id))
}
