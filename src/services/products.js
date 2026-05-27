import { db, storage, isFirebaseConfigured } from '../config/firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'

const PRODUCTS_COLL = 'products'

export function createProductSlug(name = '') {
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

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

function prepareList(value = []) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean)
  }

  return String(value)
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeImages(data = {}) {
  const images = Array.isArray(data.images)
    ? data.images
        .map((image) => {
          if (typeof image === 'string') return { url: image, path: null }
          return { url: image.url || image.imageUrl || image.image_url || '', path: image.path || image.imagePath || null }
        })
        .filter((image) => image.url)
    : []

  const fallbackUrl = data.imageUrl || data.image_url || null
  const fallbackPath = data.imagePath || null

  if (fallbackUrl && !images.some((image) => image.url === fallbackUrl)) {
    images.unshift({ url: fallbackUrl, path: fallbackPath })
  }

  return images
}

async function uploadImages(files = [], onProgress) {
  const uploadFiles = Array.isArray(files) ? files.filter(Boolean) : files ? [files] : []
  const uploaded = []

  for (let index = 0; index < uploadFiles.length; index += 1) {
    const imagePayload = await uploadImage(uploadFiles[index], (progress) => {
      if (!onProgress) return
      const totalProgress = Math.round(((index + progress / 100) / uploadFiles.length) * 100)
      onProgress(totalProgress)
    })

    uploaded.push({ url: imagePayload.imageUrl, path: imagePayload.imagePath })
  }

  return uploaded
}

export async function addProduct(productData) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured')

  const {
    name,
    description,
    detailDescription,
    category,
    sku,
    fabric,
    care,
    price,
    sizes = [],
    colors = [],
    file,
    files = [],
    imageUrls = [],
    isPublished = true,
    onUploadProgress,
  } = productData

  const preparedSizes = prepareList(sizes)
  const preparedColors = prepareList(colors)
  const preparedImageUrls = prepareList(imageUrls)
  const uploadedImages = await uploadImages(files.length ? files : file ? [file] : [], onUploadProgress)
  const images = [
    ...uploadedImages,
    ...preparedImageUrls.map((url) => ({ url, path: null })),
  ]

  if (productData.imageUrl && !images.some((image) => image.url === productData.imageUrl)) {
    images.push({ url: productData.imageUrl, path: null })
  }

  const primaryImage = images[0] || { url: null, path: null }

  const payload = {
    name: (name || '').trim(),
    slug: createProductSlug(name),
    description: (description || '').trim(),
    detailDescription: (detailDescription || '').trim(),
    category: (category || '').trim(),
    sku: (sku || '').trim(),
    fabric: (fabric || '').trim(),
    care: (care || '').trim(),
    price: Number(price) || 0,
    sizes: preparedSizes,
    colors: preparedColors,
    images,
    image_url: primaryImage.url,
    imageUrl: primaryImage.url,
    imagePath: primaryImage.path,
    createdAt: serverTimestamp(),
    isPublished: !!isPublished,
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
      ...data,
      name: data.name || data.title || '',
      description: data.description || '',
      detailDescription: data.detailDescription || data.details || '',
      category: data.category || '',
      sku: data.sku || '',
      fabric: data.fabric || '',
      care: data.care || '',
      slug: data.slug || createProductSlug(data.name || data.title || ''),
      price: data.price || 0,
      imageUrl: data.imageUrl || data.image_url || null,
      image_url: data.image_url || data.imageUrl || null,
      imagePath: data.imagePath || null,
      images: normalizeImages(data),
      createdAt: data.createdAt || null,
      sizes: Array.isArray(data.sizes) ? data.sizes : [],
      colors: Array.isArray(data.colors) ? data.colors : [],
      isPublished: data.isPublished ?? data.published ?? false,
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
        ...data,
        name: data.name || data.title || '',
        description: data.description || '',
        detailDescription: data.detailDescription || data.details || '',
        category: data.category || '',
        sku: data.sku || '',
        fabric: data.fabric || '',
        care: data.care || '',
        slug: data.slug || createProductSlug(data.name || data.title || ''),
        price: data.price || 0,
        imageUrl: data.imageUrl || data.image_url || null,
        image_url: data.image_url || data.imageUrl || null,
        imagePath: data.imagePath || null,
        images: normalizeImages(data),
        createdAt: data.createdAt || null,
        sizes: Array.isArray(data.sizes) ? data.sizes : [],
        colors: Array.isArray(data.colors) ? data.colors : [],
        isPublished: data.isPublished ?? data.published ?? false,
      }
    })
    cb(docs)
  })
  return unsub
}

export async function updateProduct(id, updates = {}) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured')

  const docRef = doc(db, PRODUCTS_COLL, id)
  const { file, files = [], removeImage, price } = updates
  const toUpdate = { ...updates }

  if (price !== undefined) {
    toUpdate.price = Number(price) || 0
  }

  if (typeof toUpdate.name === 'string') {
    toUpdate.slug = createProductSlug(toUpdate.name)
  }

  if (file) {
    const imagePayload = await uploadImage(file)
    toUpdate.imageUrl = imagePayload.imageUrl
    toUpdate.image_url = imagePayload.image_url
    toUpdate.imagePath = imagePayload.imagePath
    toUpdate.images = [{ url: imagePayload.imageUrl, path: imagePayload.imagePath }]
  }

  if (files.length) {
    const uploadedImages = await uploadImages(files)
    toUpdate.images = uploadedImages
    toUpdate.imageUrl = uploadedImages[0]?.url || null
    toUpdate.image_url = uploadedImages[0]?.url || null
    toUpdate.imagePath = uploadedImages[0]?.path || null
  }

  if (toUpdate.imageUrls !== undefined) {
    const imageUrls = prepareList(toUpdate.imageUrls)
    toUpdate.images = imageUrls.map((url) => ({ url, path: null }))
    toUpdate.imageUrl = imageUrls[0] || null
    toUpdate.image_url = imageUrls[0] || null
    toUpdate.imagePath = null
  }

  if (removeImage) {
    toUpdate.imageUrl = null
    toUpdate.image_url = null
    toUpdate.imagePath = null
    toUpdate.images = []
  }

  delete toUpdate.file
  delete toUpdate.files
  delete toUpdate.removeImage
  delete toUpdate.imageUrls

  await updateDoc(docRef, toUpdate)
  return { id, ...toUpdate }
}

export async function deleteProduct(id, imagePath) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured')
  const imagePaths = Array.isArray(imagePath) ? imagePath.filter(Boolean) : imagePath ? [imagePath] : []

  for (const path of imagePaths) {
    try {
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
    } catch (e) {
      console.warn('deleteProduct: failed deleting image', e.message)
    }
  }
  await deleteDoc(doc(db, PRODUCTS_COLL, id))
}
