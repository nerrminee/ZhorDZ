import { requestJson } from './apiClient.js'

const CLOUDINARY_CLOUD_NAME = 'djw220fcf'
const CLOUDINARY_UPLOAD_PRESET = 'zhordz'
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
const PRODUCTS_API = '/api/products'

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
  if (!file) throw new Error('No file provided for upload')

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  if (onProgress) onProgress(10)

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('[api] Request failed', {
      url: CLOUDINARY_UPLOAD_URL,
      method: 'POST',
      status: response.status,
      responseBody: data,
    })
    throw new Error(data.error?.message || 'Cloudinary upload failed')
  }

  if (onProgress) onProgress(100)

  return {
    image_url: data.secure_url,
    imageUrl: data.secure_url,
    imagePath: null,
    publicId: data.public_id || null,
    provider: 'cloudinary',
  }
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
          return {
            url: image.url || image.imageUrl || image.image_url || '',
            path: image.path || image.imagePath || null,
            publicId: image.publicId || image.public_id || null,
            provider: image.provider || null,
          }
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

    uploaded.push({
      url: imagePayload.imageUrl,
      path: imagePayload.imagePath,
      publicId: imagePayload.publicId,
      provider: imagePayload.provider,
    })
  }

  return uploaded
}

export async function addProduct(productData) {
  const {
    name,
    description,
    detailDescription,
    category,
    productCategory,
    sku,
    fabric,
    care,
    price,
    sizes = [],
    colors = [],
    isInStock = true,
    file,
    files = [],
    imageUrls = [],
    isPublished = true,
    onUploadProgress,
    isSale = false,
    oldPrice = 0,
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
    productCategory: (productCategory || '').trim(),
    sku: (sku || '').trim(),
    fabric: (fabric || '').trim(),
    care: (care || '').trim(),
    price: Number(price) || 0,
    isSale: !!isSale,
    oldPrice: Number(oldPrice) || 0,
    sizes: preparedSizes,
    colors: preparedColors,
    availability: isInStock ? 'in-stock' : 'rupture',
    isInStock: !!isInStock,
    images,
    image_url: primaryImage.url,
    imageUrl: primaryImage.url,
    imagePath: primaryImage.path,
    isPublished: !!isPublished,
  }

  return requestJson(PRODUCTS_API, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getProducts() {
  const products = await requestJson(PRODUCTS_API)
  return products.map((data) => {
    return {
      id: data.id,
      ...data,
      name: data.name || data.title || '',
      description: data.description || '',
      detailDescription: data.detailDescription || data.details || '',
      category: data.category || '',
      productCategory: data.productCategory || data.type || '',
      sku: data.sku || '',
      fabric: data.fabric || '',
      care: data.care || '',
      slug: data.slug || createProductSlug(data.name || data.title || ''),
      price: data.price || 0,
      isSale: data.isSale ?? false,
      oldPrice: data.oldPrice || 0,
      imageUrl: data.imageUrl || data.image_url || null,
      image_url: data.image_url || data.imageUrl || null,
      imagePath: data.imagePath || null,
      images: normalizeImages(data),
      createdAt: data.createdAt || null,
      sizes: Array.isArray(data.sizes) ? data.sizes : [],
      colors: Array.isArray(data.colors) ? data.colors : [],
      availability: data.availability || ((data.isInStock ?? true) ? 'in-stock' : 'rupture'),
      isInStock: data.isInStock ?? (data.availability !== 'rupture'),
      isPublished: data.isPublished ?? data.published ?? false,
    }
  })
}

export function subscribeProducts(cb) {
  let isActive = true
  let timeoutId

  const load = async () => {
    try {
      const products = await getProducts()
      if (isActive) cb(products)
    } catch (error) {
      console.error('Failed to load products:', error)
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

export async function updateProduct(id, updates = {}) {
  const { file, files = [], removeImage, price } = updates
  const toUpdate = { ...updates }

  if (price !== undefined) {
    toUpdate.price = Number(price) || 0
  }

  if (updates.oldPrice !== undefined) {
    toUpdate.oldPrice = Number(updates.oldPrice) || 0
  }

  if (updates.isSale !== undefined) {
    toUpdate.isSale = !!updates.isSale
  }

  if (typeof toUpdate.name === 'string') {
    toUpdate.slug = createProductSlug(toUpdate.name)
  }

  if (toUpdate.isInStock !== undefined) {
    toUpdate.isInStock = !!toUpdate.isInStock
    toUpdate.availability = toUpdate.isInStock ? 'in-stock' : 'rupture'
  } else if (toUpdate.availability !== undefined) {
    toUpdate.availability = toUpdate.availability === 'rupture' ? 'rupture' : 'in-stock'
    toUpdate.isInStock = toUpdate.availability !== 'rupture'
  }

  const updateFiles = files.length ? files : file ? [file] : []

  if (updateFiles.length || toUpdate.imageUrls !== undefined) {
    const uploadedImages = updateFiles.length ? await uploadImages(updateFiles) : []
    const imageUrls = toUpdate.imageUrls !== undefined ? prepareList(toUpdate.imageUrls) : []
    const images = [
      ...uploadedImages,
      ...imageUrls.map((url) => ({ url, path: null })),
    ]

    toUpdate.images = images
    toUpdate.imageUrl = images[0]?.url || null
    toUpdate.image_url = images[0]?.url || null
    toUpdate.imagePath = images[0]?.path || null
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

  return requestJson(`${PRODUCTS_API}?id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(toUpdate),
  })
}

export async function deleteProduct(id) {
  await requestJson(`${PRODUCTS_API}?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  return id
}
