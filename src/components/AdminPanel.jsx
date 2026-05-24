import React, { useState, useEffect } from 'react'
import { db, storage } from '../firebase'
import './AdminPanel.css'
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

export default function AdminPanel() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)

  const [imagePreview, setImagePreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [products, setProducts] = useState([])

  useEffect(() => {
    if (!db) return
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData = []
        snapshot.forEach((d) => productsData.push({ id: d.id, ...d.data() }))
        setProducts(productsData)
      },
      (error) => {
        console.error('Error fetching products: ', error)
      }
    )
    return () => unsubscribe()
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        showAlert('error', 'Please select a valid image file (PNG, JPG, WebP).')
        return
      }
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const showAlert = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !price || !description.trim()) {
      showAlert('error', 'All text fields are required.')
      return
    }
    if (!image) {
      showAlert('error', 'Please upload a product image.')
      return
    }
    setIsSubmitting(true)
    setUploadProgress(0)
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${image.name}`)
      const uploadTask = uploadBytesResumable(storageRef, image)
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          setUploadProgress(progress)
        },
        (error) => {
          console.error('Upload error:', error)
          showAlert('error', `Image upload failed: ${error.message}`)
          setIsSubmitting(false)
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          await addDoc(collection(db, 'products'), {
            name: name.trim(),
            price: parseFloat(price),
            description: description.trim(),
            imageUrl: downloadURL,
            createdAt: serverTimestamp(),
            isPublished: true,
          })
          setName('')
          setPrice('')
          setDescription('')
          setImage(null)
          setImagePreview(null)
          setUploadProgress(0)
          setIsSubmitting(false)
          showAlert('success', '🎉 Product successfully published to your store!')
        }
      )
    } catch (error) {
      console.error('Database save error:', error)
      showAlert('error', `Failed to save product: ${error.message}`)
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId))
        showAlert('success', 'Product deleted successfully.')
      } catch (error) {
        console.error('Error deleting product:', error)
        showAlert('error', `Failed to delete product: ${error.message}`)
      }
    }
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="logo-section">
          <span className="logo-icon">🛍️</span>
          <h1>Store Console</h1>
        </div>
        <p className="subtitle">Publish and manage your store's catalog</p>
      </header>
      <div className="admin-grid">
        <section className="form-card">
          <h2>Publish New Product</h2>
          {message.text && <div className={`alert-message ${message.type}`}>{message.text}</div>}
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="product-name">Product Name</label>
              <input id="product-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wireless Noise-Cancelling Headphones" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product-price">Price ($)</label>
                <input id="product-price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="99.99" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="product-desc">Description</label>
              <textarea id="product-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write a compelling description for this product..." rows="4" required></textarea>
            </div>
            <div className="form-group">
              <label>Product Image</label>
              <div className={`upload-zone ${imagePreview ? 'has-preview' : ''}`}>
                <input type="file" id="file-upload" accept="image/*" onChange={handleImageChange} className="file-input-hidden" />
                <label htmlFor="file-upload" className="upload-label">
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <div className="upload-overlay"><span>Change Image</span></div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📸</span>
                      <span className="upload-text">Drag & drop or click to upload image</span>
                      <span className="upload-hint">PNG, JPG, or WebP format</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
            {isSubmitting && uploadProgress > 0 && (
              <div className="progress-container">
                <div className="progress-bar-wrapper">
                  <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <div className="progress-text">Uploading Image: {uploadProgress}%</div>
              </div>
            )}
            <button type="submit" className={`submit-btn ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>{isSubmitting ? 'Publishing Product...' : 'Publish Product'}</button>
          </form>
        </section>
        <section className="inventory-card">
          <h2>Active Inventory ({products.length})</h2>
          {products.length === 0 ? (
            <div className="empty-inventory"><span className="empty-icon">📦</span><p>No products published yet. Create one to populate your store!</p></div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="card-image-wrapper">
                    <img src={product.imageUrl} alt={product.name} className="card-image" />
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{product.name || 'Untitled'}</h3>
                    <p className="card-price">€{(product.price || 0).toFixed(2)}</p>
                    <p className="card-description">{product.description}</p>
                    <button onClick={() => handleDelete(product.id)} className="delete-btn" aria-label="Delete product">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
