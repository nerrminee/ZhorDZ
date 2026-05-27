import { useMemo, useState, useEffect } from 'react'
import './AdminPanel.css'
import { addProduct, deleteProduct, subscribeProducts, updateProduct } from '../services/products'
import { subscribeOrders } from '../services/orders'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { formatPrice } from '../utils/cart'

const DEFAULT_COLLECTIONS = ['Ensembles', 'Robes', 'Parfums', 'Accessoires']

export default function AdminPanel() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [detailDescription, setDetailDescription] = useState('')
  const [category, setCategory] = useState('')
  const [sku, setSku] = useState('')
  const [fabric, setFabric] = useState('')
  const [care, setCare] = useState('')
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])
  const [sizeDraft, setSizeDraft] = useState('')
  const [colorDraft, setColorDraft] = useState('')
  const [newCollection, setNewCollection] = useState('')
  const [customCollections, setCustomCollections] = useLocalStorage('zhordz-collections', DEFAULT_COLLECTIONS)
  const [images, setImages] = useState([])
  const [imageUrlInput, setImageUrlInput] = useState('')

  const [imagePreviews, setImagePreviews] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [isOrdersOpen, setIsOrdersOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editState, setEditState] = useState({})

  useEffect(() => {
    const unsubscribe = subscribeProducts((list) => setProducts(list))
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeOrders((list) => setOrders(list))
    return () => unsubscribe()
  }, [])

  const collectionOptions = useMemo(() => {
    const productCollections = products.map((product) => product.category).filter(Boolean)
    return Array.from(new Set([...customCollections, ...productCollections])).sort((a, b) => a.localeCompare(b))
  }, [customCollections, products])

  const addListItem = (value, setter, resetter) => {
    const prepared = value.trim()
    if (!prepared) return
    setter((current) => current.includes(prepared) ? current : [...current, prepared])
    resetter('')
  }

  const removeListItem = (value, setter) => {
    setter((current) => current.filter((item) => item !== value))
  }

  const handleDraftKeyDown = (event, value, setter, resetter) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    addListItem(value, setter, resetter)
  }

  const handleAddCollection = () => {
    const prepared = newCollection.trim()
    if (!prepared) return
    setCustomCollections((current) => current.includes(prepared) ? current : [...current, prepared])
    setCategory(prepared)
    setNewCollection('')
  }

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (!selectedFiles.length) return

    if (selectedFiles.some((file) => !file.type.startsWith('image/'))) {
      showAlert('error', 'Please select valid image files (PNG, JPG, WebP).')
      return
    }

    setImages(selectedFiles)
    setImageUrlInput('')

    Promise.all(
      selectedFiles.map((file) => new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(file)
      }))
    ).then((previews) => setImagePreviews(previews))
  }

  const showAlert = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim() || !price || !description.trim()) {
      showAlert('error', 'Name, price, and description are required.')
      return
    }

    if (images.length === 0 && !imageUrlInput.trim()) {
      showAlert('error', 'Please upload at least one image or paste web image links.')
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      await addProduct({
        name,
        price,
        description,
        detailDescription,
        category,
        sku,
        fabric,
        care,
        sizes,
        colors,
        files: images,
        imageUrls: imageUrlInput,
        onUploadProgress: setUploadProgress,
        isPublished: true,
      })

      setName('')
      setPrice('')
      setDescription('')
      setDetailDescription('')
      setCategory('')
      setSku('')
      setFabric('')
      setCare('')
      setSizes([])
      setColors([])
      setSizeDraft('')
      setColorDraft('')
      setImages([])
      setImageUrlInput('')
      setImagePreviews([])
      setUploadProgress(0)
      showAlert('success', '🎉 Product saved to Firestore successfully.')
    } catch (error) {
      console.error('Failed to save product:', error)
      showAlert('error', `Failed to save product: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    try {
      const product = products.find((item) => item.id === productId)
      const imagePaths = Array.isArray(product?.images)
        ? product.images.map((image) => image.path).filter(Boolean)
        : product?.imagePath
      await deleteProduct(productId, imagePaths)
      showAlert('success', 'Product deleted successfully.')
    } catch (error) {
      console.error('Error deleting product:', error)
      showAlert('error', `Failed to delete product: ${error.message}`)
    }
  }

  const startEditing = (product) => {
    setEditingId(product.id)
    setEditState({
      name: product.name || product.title || '',
      price: product.price || '',
      description: product.description || '',
      detailDescription: product.detailDescription || product.details || '',
      category: product.category || '',
      sku: product.sku || '',
      fabric: product.fabric || '',
      care: product.care || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
      imageUrls: Array.isArray(product.images)
        ? product.images.map((image) => image.url).join('\n')
        : product.imageUrl || '',
    })
  }

  const handleEditChange = (field, value) => {
    setEditState((current) => ({ ...current, [field]: value }))
  }

  const handleSaveEdit = async (productId) => {
    try {
      await updateProduct(productId, {
        ...editState,
        sizes: editState.sizes.split(',').map((item) => item.trim()).filter(Boolean),
        colors: editState.colors.split(',').map((item) => item.trim()).filter(Boolean),
      })
      setEditingId(null)
      setEditState({})
      showAlert('success', 'Product details updated successfully.')
    } catch (error) {
      console.error('Failed to update product:', error)
      showAlert('error', `Failed to update product: ${error.message}`)
    }
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="logo-section">
          <span className="logo-icon">🛍️</span>
          <h1>Store Console</h1>
        </div>
        <p className="subtitle">Publish and manage your store catalog</p>
      </header>

      <div className="admin-grid">
        <section className="form-card">
          <h2>Publish New Product</h2>
          {message.text && <div className={`alert-message ${message.type}`}>{message.text}</div>}
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="product-name">Product Name</label>
              <input
                id="product-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cashmere Scented Candle"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product-price">Price (€)</label>
                <input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="49.90"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="product-sizes">Sizes</label>
                <div className="option-builder">
                  <div className="option-entry">
                    <input
                      id="product-sizes"
                      type="text"
                      value={sizeDraft}
                      onChange={(e) => setSizeDraft(e.target.value)}
                      onKeyDown={(e) => handleDraftKeyDown(e, sizeDraft, setSizes, setSizeDraft)}
                      placeholder="S, M, L, 38..."
                    />
                    <button type="button" onClick={() => addListItem(sizeDraft, setSizes, setSizeDraft)}>Add size</button>
                  </div>
                  {sizes.length ? (
                    <div className="option-chip-list" aria-label="Selected sizes">
                      {sizes.map((size) => (
                        <button type="button" key={size} onClick={() => removeListItem(size, setSizes)}>
                          {size}<span aria-hidden="true">x</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product-colors">Colors</label>
                <div className="option-builder">
                  <div className="option-entry">
                    <input
                      id="product-colors"
                      type="text"
                      value={colorDraft}
                      onChange={(e) => setColorDraft(e.target.value)}
                      onKeyDown={(e) => handleDraftKeyDown(e, colorDraft, setColors, setColorDraft)}
                      placeholder="Beige, Gold, #c5a34f..."
                    />
                    <button type="button" onClick={() => addListItem(colorDraft, setColors, setColorDraft)}>Add color</button>
                  </div>
                  {colors.length ? (
                    <div className="option-chip-list" aria-label="Selected colors">
                      {colors.map((color) => (
                        <button type="button" key={color} onClick={() => removeListItem(color, setColors)}>
                          {color}<span aria-hidden="true">x</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="product-desc">Description</label>
              <textarea
                id="product-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the product features, texture, or mood."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-detail-desc">Details Page Description</label>
              <textarea
                id="product-detail-desc"
                value={detailDescription}
                onChange={(e) => setDetailDescription(e.target.value)}
                placeholder="Longer product details shown on the product page."
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product-category">Collection</label>
                <select
                  id="product-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Choose collection</option>
                  {collectionOptions.map((collection) => (
                    <option key={collection} value={collection}>{collection}</option>
                  ))}
                </select>
                <div className="option-entry collection-entry">
                  <input
                    type="text"
                    value={newCollection}
                    onChange={(e) => setNewCollection(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      e.preventDefault()
                      handleAddCollection()
                    }}
                    placeholder="New collection"
                    aria-label="New collection"
                  />
                  <button type="button" onClick={handleAddCollection}>Add collection</button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="product-sku">Reference</label>
                <input
                  id="product-sku"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="ZHOR-001"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product-fabric">Fabric</label>
                <input
                  id="product-fabric"
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="Cotton blend"
                />
              </div>
              <div className="form-group">
                <label htmlFor="product-care">Care</label>
                <input
                  id="product-care"
                  type="text"
                  value={care}
                  onChange={(e) => setCare(e.target.value)}
                  placeholder="Wash cold, dry flat"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="file-upload">Product Images</label>
              <div className={`upload-zone ${imagePreviews.length ? 'has-preview' : ''}`}>
                <input id="file-upload" type="file" accept="image/*" multiple onChange={handleImageChange} className="file-input-hidden" />
                <label htmlFor="file-upload" className="upload-label">
                  {imagePreviews.length ? (
                    <div className="image-preview-grid">
                      {imagePreviews.map((preview, index) => (
                        <div className="image-preview-container" key={preview}>
                          <img src={preview} alt={`Preview ${index + 1}`} className="image-preview" />
                          <div className="upload-overlay"><span>Change Images</span></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📸</span>
                      <span className="upload-text">Click to upload images</span>
                      <span className="upload-hint">PNG, JPG, or WebP</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="product-image-url">Or Paste Image URLs</label>
              <textarea
                id="product-image-url"
                value={imageUrlInput}
                onChange={(e) => {
                  const url = e.target.value
                  setImageUrlInput(url)
                  if (url.trim()) {
                    setImagePreviews(url.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean))
                    setImages([])
                  } else {
                    setImagePreviews([])
                  }
                }}
                placeholder="https://example.com/front.jpg&#10;https://example.com/back.jpg"
                rows="3"
              />
            </div>

            {isSubmitting && (
              <div className="progress-container">
                <div className="progress-bar-wrapper">
                  <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
                <div className="progress-text">
                  {uploadProgress === 0 ? 'Connecting to Firebase...' : `Uploading: ${uploadProgress}%`}
                </div>
              </div>
            )}

            <button type="submit" className={`submit-btn ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Product'}
            </button>
          </form>
        </section>

        <section className="orders-card">
          <div className="orders-card-header">
            <h2>Orders ({orders.length})</h2>
            <button type="button" className="edit-btn" onClick={() => setIsOrdersOpen((open) => !open)}>
              {isOrdersOpen ? 'Hide orders' : 'List of orders'}
            </button>
          </div>

          {isOrdersOpen ? (
            orders.length ? (
              <div className="orders-list">
                {orders.map((order) => (
                  <article className="order-card" key={order.id}>
                    <div className="order-card-top">
                      <div>
                        <h3>{order.customer?.lastName} {order.customer?.firstName}</h3>
                        <p>{order.customer?.phone} - {order.customer?.wilaya}</p>
                      </div>
                      <strong>{formatPrice(order.total)}</strong>
                    </div>
                    <div className="order-items">
                      {order.items?.map((item) => (
                        <div className="order-item" key={item.cartId || item.productId}>
                          <div className="order-thumb">
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : null}
                          </div>
                          <div>
                            <h4>{item.name}</h4>
                            <p>
                              Qty {item.quantity}
                              {item.color ? ` / ${item.color}` : ''}
                              {item.size ? ` / ${item.size}` : ''}
                            </p>
                            <span>{formatPrice(Number(item.price) * Number(item.quantity || 1))}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="order-meta">
                      <span>Livraison: {formatPrice(order.deliveryPrice)}</span>
                      <span>Cash on delivery</span>
                      {order.customer?.note ? <span>Note: {order.customer.note}</span> : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-inventory">
                <p>No orders yet.</p>
              </div>
            )
          ) : null}
        </section>

        <section className="inventory-card">
          <h2>Active Inventory ({products.length})</h2>
          {products.length === 0 ? (
            <div className="empty-inventory">
              <span className="empty-icon">📦</span>
              <p>No products published yet. Create one to populate your store!</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="card-image-wrapper">
                    {(product.images?.[0]?.url || product.imageUrl) ? (
                      <img src={product.images?.[0]?.url || product.imageUrl} alt={product.name} className="card-image" />
                    ) : null}
                    {product.images?.length > 1 ? <span className="image-count">{product.images.length} images</span> : null}
                  </div>
                  <div className="card-body">
                    {editingId === product.id ? (
                      <div className="inventory-edit-form">
                        <input value={editState.name} onChange={(e) => handleEditChange('name', e.target.value)} aria-label="Product name" />
                        <input type="number" value={editState.price} onChange={(e) => handleEditChange('price', e.target.value)} aria-label="Product price" />
                        <textarea value={editState.description} onChange={(e) => handleEditChange('description', e.target.value)} aria-label="Product description" />
                        <textarea value={editState.detailDescription} onChange={(e) => handleEditChange('detailDescription', e.target.value)} aria-label="Product details" />
                        <input value={editState.category} onChange={(e) => handleEditChange('category', e.target.value)} aria-label="Product category" placeholder="Category" />
                        <input value={editState.sku} onChange={(e) => handleEditChange('sku', e.target.value)} aria-label="Product reference" placeholder="Reference" />
                        <input value={editState.fabric} onChange={(e) => handleEditChange('fabric', e.target.value)} aria-label="Product fabric" placeholder="Fabric" />
                        <input value={editState.care} onChange={(e) => handleEditChange('care', e.target.value)} aria-label="Product care" placeholder="Care" />
                        <input value={editState.sizes} onChange={(e) => handleEditChange('sizes', e.target.value)} aria-label="Product sizes" placeholder="Sizes" />
                        <input value={editState.colors} onChange={(e) => handleEditChange('colors', e.target.value)} aria-label="Product colors" placeholder="Colors" />
                        <textarea value={editState.imageUrls} onChange={(e) => handleEditChange('imageUrls', e.target.value)} aria-label="Product image URLs" placeholder="Image URLs, one per line" />
                        <div className="inventory-edit-actions">
                          <button type="button" onClick={() => handleSaveEdit(product.id)} className="save-btn">Save</button>
                          <button type="button" onClick={() => setEditingId(null)} className="cancel-btn">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="card-title">{product.name || 'Untitled'}</h3>
                        <p className="card-price">€{(product.price || 0).toFixed(2)}</p>
                        <p className="card-description">{product.description}</p>
                        <p className="card-description">{product.detailDescription || product.category || product.sku || 'No detail page fields yet.'}</p>
                        <div className="inventory-actions">
                          <button onClick={() => startEditing(product)} className="edit-btn" aria-label="Edit product">
                            Edit Details
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="delete-btn" aria-label="Delete product">
                            Delete
                          </button>
                        </div>
                      </>
                    )}
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
