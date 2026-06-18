import { useMemo, useState, useEffect } from 'react'
import './AdminPanel.css'
import { addProduct, deleteProduct, subscribeProducts, updateProduct } from '../services/products'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { formatPrice } from '../utils/cart'

const DEFAULT_COLLECTIONS = ['Ensembles', 'Robes', 'Parfums', 'Accessoires']
const DEFAULT_PRODUCT_CATEGORIES = ['Dress', 'Set', 'Perfume', 'Accessory', 'Abaya', 'Top']

export default function AdminPanel({ onLogout }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [detailDescription, setDetailDescription] = useState('')
  const [category, setCategory] = useState('')
  const [productCategory, setProductCategory] = useState('')
  const [fabric, setFabric] = useState('')
  const [care, setCare] = useState('')
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])
  const [isInStock, setIsInStock] = useState(true)
  const [sizeDraft, setSizeDraft] = useState('')
  const [colorDraft, setColorDraft] = useState('')
  const [colorPicker, setColorPicker] = useState('#7b6759')
  const [newCollection, setNewCollection] = useState('')
  const [newProductCategory, setNewProductCategory] = useState('')
  const [customCollections, setCustomCollections] = useLocalStorage('zhordz-collections', DEFAULT_COLLECTIONS)
  const [customProductCategories, setCustomProductCategories] = useLocalStorage('zhordz-product-categories', DEFAULT_PRODUCT_CATEGORIES)
  const [images, setImages] = useState([])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [isSale, setIsSale] = useState(false)
  const [oldPrice, setOldPrice] = useState('')

  const [imagePreviews, setImagePreviews] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [products, setProducts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editState, setEditState] = useState({})
  const [editImagePreviews, setEditImagePreviews] = useState([])
  const [activeTab, setActiveTab] = useState('create')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCollection, setFilterCollection] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const unsubscribe = subscribeProducts((list) => setProducts(list))
    return () => unsubscribe()
  }, [])

  const collectionOptions = useMemo(() => {
    const productCollections = products.map((product) => product.category).filter(Boolean)
    return Array.from(new Set([...customCollections, ...productCollections])).sort((a, b) => a.localeCompare(b))
  }, [customCollections, products])

  const collectionCounts = useMemo(() => {
    return products.reduce((counts, product) => {
      const productCategory = product.category?.trim()
      if (!productCategory) return counts
      counts[productCategory] = (counts[productCategory] || 0) + 1
      return counts
    }, {})
  }, [products])

  const productCategoryOptions = useMemo(() => {
    const productCategories = products.map((product) => product.productCategory).filter(Boolean)
    return Array.from(new Set([...customProductCategories, ...productCategories])).sort((a, b) => a.localeCompare(b))
  }, [customProductCategories, products])

  const dashboardStats = useMemo(() => {
    const inStock = products.filter((product) => product.isInStock ?? true).length
    const published = products.filter((product) => product.isPublished ?? true).length
    const collections = new Set(products.map((product) => product.category).filter(Boolean)).size

    return [
      { label: 'Products', value: products.length },
      { label: 'Published', value: published },
      { label: 'In stock', value: inStock },
      { label: 'Collections', value: collections },
    ]
  }, [products])

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = searchQuery === '' ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCollection = filterCollection === '' || product.category === filterCollection
      return matchesSearch && matchesCollection
    })

    if (sortBy === 'newest') {
      filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
    }

    return filtered
  }, [products, searchQuery, filterCollection, sortBy])

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

  const handleAddProductCategory = () => {
    const prepared = newProductCategory.trim()
    if (!prepared) return
    setCustomProductCategories((current) => current.includes(prepared) ? current : [...current, prepared])
    setProductCategory(prepared)
    setNewProductCategory('')
  }

  const handleDeleteCollection = async (collectionName) => {
    const affectedProducts = products.filter((product) => product.category === collectionName)
    const message = affectedProducts.length
      ? `Delete collection "${collectionName}" and remove it from ${affectedProducts.length} product${affectedProducts.length > 1 ? 's' : ''}?`
      : `Delete collection "${collectionName}"?`

    if (!window.confirm(message)) return

    try {
      setCustomCollections((current) => current.filter((collection) => collection !== collectionName))
      if (category === collectionName) setCategory('')

      await Promise.all(
        affectedProducts.map((product) => updateProduct(product.id, { category: '' }))
      )

      showAlert('success', 'Collection deleted successfully.')
    } catch (error) {
      console.error('Failed to delete collection:', error)
      showAlert('error', `Failed to delete collection: ${error.message}`)
    }
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
        isSale,
        oldPrice: isSale ? oldPrice : 0,
        description,
        detailDescription,
        category,
        productCategory,
        sku: '',
        fabric,
        care,
        sizes,
        colors,
        isInStock,
        files: images,
        imageUrls: imageUrlInput,
        onUploadProgress: setUploadProgress,
        isPublished: true,
      })

      setName('')
      setPrice('')
      setIsSale(false)
      setOldPrice('')
      setDescription('')
      setDetailDescription('')
      setCategory('')
      setProductCategory('')
      setFabric('')
      setCare('')
      setSizes([])
      setColors([])
      setIsInStock(true)
      setSizeDraft('')
      setColorDraft('')
      setColorPicker('#7b6759')
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
      isSale: product.isSale ?? false,
      oldPrice: product.oldPrice || '',
      description: product.description || '',
      detailDescription: product.detailDescription || product.details || '',
      category: product.category || '',
      productCategory: product.productCategory || '',
      fabric: product.fabric || '',
      care: product.care || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
      isInStock: product.isInStock ?? true,
      files: [],
      imageUrls: Array.isArray(product.images)
        ? product.images.map((image) => image.url).join('\n')
        : product.imageUrl || '',
    })
    setEditImagePreviews([])
  }

  const handleEditChange = (field, value) => {
    setEditState((current) => ({ ...current, [field]: value }))
  }

  const handleEditImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (!selectedFiles.length) return

    if (selectedFiles.some((file) => !file.type.startsWith('image/'))) {
      showAlert('error', 'Please select valid image files (PNG, JPG, WebP).')
      return
    }

    setEditState((current) => ({ ...current, files: selectedFiles }))

    Promise.all(
      selectedFiles.map((file) => new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(file)
      }))
    ).then((previews) => setEditImagePreviews(previews))
  }

  const handleSaveEdit = async (productId) => {
    try {
      await updateProduct(productId, {
        ...editState,
        sizes: editState.sizes.split(',').map((item) => item.trim()).filter(Boolean),
        colors: editState.colors.split(',').map((item) => item.trim()).filter(Boolean),
        isInStock: !!editState.isInStock,
        isSale: !!editState.isSale,
        oldPrice: editState.isSale ? (Number(editState.oldPrice) || 0) : 0,
      })
      setEditingId(null)
      setEditState({})
      setEditImagePreviews([])
      showAlert('success', 'Product details updated successfully.')
    } catch (error) {
      console.error('Failed to update product:', error)
      showAlert('error', `Failed to update product: ${error.message}`)
    }
  }

  return (
    <div className="admin-container">
      <header className="admin-header admin-console-header">
        <div className="admin-header-copy">
          <span className="admin-eyebrow">ZHOR atelier console</span>
          <div className="logo-section">
            <span className="logo-icon">ZHOR</span>
            <h1>Store Console</h1>
          </div>
          <p className="subtitle">Publish and manage the catalog with the same quiet precision as the boutique.</p>
        </div>
        <div className="admin-header-actions">
          <a href="/admin/orders" className="edit-btn">📋 Orders</a>
          <a href="/" className="cancel-btn">👁️ View store</a>
          {onLogout ? (
            <button type="button" onClick={onLogout} className="cancel-btn">🚪 Logout</button>
          ) : null}
        </div>
        <div className="admin-stat-grid" aria-label="Catalog overview">
          {dashboardStats.map((stat) => (
            <div className="admin-stat" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="admin-tabs-container">
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            ➕ Add New Product
          </button>
          <button
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 Published Products ({products.length})
          </button>
        </div>
      </div>

      {/* Create Product Tab */}
      {activeTab === 'create' && (
        <div className="admin-content">
        <section className="form-card">
          <h2>📸 Product Information</h2>
          {message.text && <div className={`alert-message ${message.type}`}>{message.text}</div>}
          <form onSubmit={handleSubmit} className="admin-form">

            {/* Basic Info Section */}
            <div className="form-section">
              <h3 className="section-title">📝 Basic Information</h3>
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
                  <label htmlFor="product-price">💰 {isSale ? 'Sale Price (DA)' : 'Price (DA)'}</label>
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
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isSale}
                      onChange={(e) => {
                        setIsSale(e.target.checked)
                        if (!e.target.checked) setOldPrice('')
                      }}
                    />
                    <span>🏷️ On Sale</span>
                  </label>
                </div>
              </div>

              {isSale && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="product-old-price">Original Price (DA)</label>
                    <input
                      id="product-old-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      placeholder="ex. 89.90"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="product-desc">📄 Description</label>
                <textarea
                  id="product-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product features, texture, or mood."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="product-detail-desc">📖 Detailed Description</label>
                <textarea
                  id="product-detail-desc"
                  value={detailDescription}
                  onChange={(e) => setDetailDescription(e.target.value)}
                  placeholder="Longer product details shown on the product page."
                  rows="3"
                />
              </div>
            </div>

            {/* Categories & Type Section */}
            <div className="form-section">
              <h3 className="section-title">🏷️ Categories & Type</h3>
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
                {collectionOptions.length ? (
                  <div className="collection-manager" aria-label="Manage collections">
                    {collectionOptions.map((collection) => (
                      <div className="collection-manager-row" key={collection}>
                        <span>
                          {collection}
                          <small>{collectionCounts[collection] || 0} product{collectionCounts[collection] === 1 ? '' : 's'}</small>
                        </span>
                        <button type="button" onClick={() => handleDeleteCollection(collection)}>
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product-type">Product Category</label>
                <select
                  id="product-type"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                >
                  <option value="">Choose product category</option>
                  {productCategoryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            </div>

            {/* Options Section */}
            <div className="form-section">
              <h3 className="section-title">👕 Sizes & Colors</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="product-sizes">📏 Sizes</label>
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
                      <button type="button" onClick={() => addListItem(sizeDraft, setSizes, setSizeDraft)}>Add</button>
                    </div>
                    {sizes.length ? (
                      <div className="option-chip-list" aria-label="Selected sizes">
                        {sizes.map((size) => (
                          <button type="button" key={size} onClick={() => removeListItem(size, setSizes)}>
                            {size}<span aria-hidden="true">×</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="product-colors">🎨 Colors</label>
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
                      <button type="button" onClick={() => addListItem(colorDraft, setColors, setColorDraft)}>Add</button>
                    </div>
                    <div className="color-picker-entry">
                      <input
                        type="color"
                        value={colorPicker}
                        onChange={(e) => setColorPicker(e.target.value)}
                        aria-label="Choose precise color"
                      />
                      <span>{colorPicker}</span>
                      <button type="button" onClick={() => addListItem(colorPicker, setColors, setColorDraft)}>Add color</button>
                    </div>
                    {colors.length ? (
                      <div className="option-chip-list" aria-label="Selected colors">
                        {colors.map((color) => (
                          <button type="button" key={color} onClick={() => removeListItem(color, setColors)}>
                            {color}<span aria-hidden="true">×</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Materials Section */}
            <div className="form-section">
              <h3 className="section-title">✨ Materials & Care</h3>
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
                  <label htmlFor="product-care">Care Instructions</label>
                  <input
                    id="product-care"
                    type="text"
                    value={care}
                    onChange={(e) => setCare(e.target.value)}
                    placeholder="Wash cold, dry flat"
                  />
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="form-section">
              <h3 className="section-title">📸 Product Images</h3>
              <div className="form-group">
                <label htmlFor="file-upload">Upload Images</label>
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
                        <span className="upload-button-text">Upload Images</span>
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
            </div>

            {/* Availability Section */}
            <div className="form-section">
              <h3 className="section-title">📦 Availability & Status</h3>
              <div className="form-group">
                <label>Stock Status</label>
                <div className="availability-toggle-group" role="group" aria-label="Product availability">
                  <label className="availability-check">
                    <input
                      type="checkbox"
                      checked={isInStock}
                      onChange={() => setIsInStock(true)}
                    />
                    <span>✅ In stock</span>
                  </label>
                  <label className="availability-check">
                    <input
                      type="checkbox"
                      checked={!isInStock}
                      onChange={() => setIsInStock(false)}
                    />
                    <span>❌ Out of stock</span>
                  </label>
                </div>
              </div>
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
              {isSubmitting ? '⏳ Publishing...' : '✨ Publish Product'}
            </button>
          </form>
        </section>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <section className="inventory-card">
          <div className="inventory-header">
            <h2>📦 Published Products</h2>
            <span className="product-count">{filteredProducts.length} of {products.length}</span>
          </div>

          {products.length > 0 && (
            <div className="inventory-toolbar">
              <div className="search-box">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search products by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="clear-search"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="filter-controls">
                <select
                  value={filterCollection}
                  onChange={(e) => setFilterCollection(e.target.value)}
                  className="filter-select"
                  aria-label="Filter by collection"
                >
                  <option value="">📂 All Collections</option>
                  {collectionOptions.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                  aria-label="Sort products"
                >
                  <option value="newest">⏱️ Newest First</option>
                  <option value="oldest">📅 Oldest First</option>
                  <option value="name-asc">A→Z Name</option>
                  <option value="name-desc">Z→A Name</option>
                  <option value="price-low">💰 Price: Low to High</option>
                  <option value="price-high">💰 Price: High to Low</option>
                </select>
              </div>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="empty-inventory">
              {searchQuery || filterCollection ? (
                <>
                  <span className="empty-icon">🔍</span>
                  <p>No products match your filters. Try adjusting your search.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setFilterCollection('')
                    }}
                    className="reset-filters-btn"
                  >
                    Reset Filters
                  </button>
                </>
              ) : (
                <>
                  <span className="empty-icon">📦</span>
                  <p>No products published yet. Create one to populate your store!</p>
                </>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="card-image-wrapper">
                    {(product.images?.[0]?.url || product.imageUrl) ? (
                      <img src={product.images?.[0]?.url || product.imageUrl} alt={product.name} className="card-image" />
                    ) : null}
                    {product.images?.length > 1 ? <span className="image-count">🖼️ {product.images.length}</span> : null}
                  </div>
                  <div className="card-body">
                    {editingId === product.id ? (
                      <div className="inventory-edit-form">
                        <input value={editState.name} onChange={(e) => handleEditChange('name', e.target.value)} aria-label="Product name" />
                        <label className="checkbox-label" style={{ margin: '4px 0' }}>
                          <input
                            type="checkbox"
                            checked={!!editState.isSale}
                            onChange={(e) => {
                              handleEditChange('isSale', e.target.checked)
                              if (!e.target.checked) handleEditChange('oldPrice', '')
                            }}
                          />
                          <span>🏷️ On Sale</span>
                        </label>
                        {editState.isSale && (
                          <input
                            type="number"
                            value={editState.oldPrice}
                            onChange={(e) => handleEditChange('oldPrice', e.target.value)}
                            placeholder="Original Price"
                            aria-label="Original Price"
                          />
                        )}
                        <input type="number" value={editState.price} onChange={(e) => handleEditChange('price', e.target.value)} aria-label={editState.isSale ? 'Sale Price' : 'Product price'} placeholder={editState.isSale ? 'Sale Price' : 'Price'} />
                        <textarea value={editState.description} onChange={(e) => handleEditChange('description', e.target.value)} aria-label="Product description" />
                        <textarea value={editState.detailDescription} onChange={(e) => handleEditChange('detailDescription', e.target.value)} aria-label="Product details" />
                        <input value={editState.category} onChange={(e) => handleEditChange('category', e.target.value)} aria-label="Product category" placeholder="Category" />
                        <input value={editState.productCategory} onChange={(e) => handleEditChange('productCategory', e.target.value)} aria-label="Product type" placeholder="Product category" />
                        <input value={editState.fabric} onChange={(e) => handleEditChange('fabric', e.target.value)} aria-label="Product fabric" placeholder="Fabric" />
                        <input value={editState.care} onChange={(e) => handleEditChange('care', e.target.value)} aria-label="Product care" placeholder="Care" />
                        <input value={editState.sizes} onChange={(e) => handleEditChange('sizes', e.target.value)} aria-label="Product sizes" placeholder="Sizes" />
                        <input value={editState.colors} onChange={(e) => handleEditChange('colors', e.target.value)} aria-label="Product colors" placeholder="Colors" />
                        <div className="availability-toggle-group compact" role="group" aria-label="Product availability">
                          <label className="availability-check">
                            <input
                              type="checkbox"
                              checked={!!editState.isInStock}
                              onChange={() => handleEditChange('isInStock', true)}
                            />
                            <span>✅ In stock</span>
                          </label>
                          <label className="availability-check">
                            <input
                              type="checkbox"
                              checked={!editState.isInStock}
                              onChange={() => handleEditChange('isInStock', false)}
                            />
                            <span>❌ Out of stock</span>
                          </label>
                        </div>
                        <div className="edit-image-upload">
                          <input
                            id={`edit-images-${product.id}`}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleEditImageChange}
                            className="edit-file-input-hidden"
                          />
                          <label htmlFor={`edit-images-${product.id}`} className="add-image-btn">📸 Upload Images</label>
                          <span className="edit-image-help">Upload one or more pictures from device</span>
                          {editImagePreviews.length ? (
                            <div className="edit-image-preview-grid">
                              {editImagePreviews.map((preview, index) => (
                                <img src={preview} alt={`New preview ${index + 1}`} key={preview} />
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <textarea value={editState.imageUrls} onChange={(e) => handleEditChange('imageUrls', e.target.value)} aria-label="Product image URLs" placeholder="Image URLs, one per line" />
                        <div className="inventory-edit-actions">
                          <button type="button" onClick={() => handleSaveEdit(product.id)} className="save-btn">💾 Save</button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null)
                              setEditImagePreviews([])
                            }}
                            className="cancel-btn"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="card-title">{product.name || 'Untitled'}</h3>
                        <span className={`stock-badge ${product.isInStock ? 'in-stock' : 'rupture'}`}>
                          {product.isInStock ? '✅ In stock' : '❌ Out of stock'}
                        </span>
                        {product.isSale ? (
                          <div className="product-sale-price-group" style={{ marginBottom: '0.75rem' }}>
                            <span className="admin-sale-badge">🏷️ On Sale</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="old-price" style={{ textDecoration: 'line-through', color: '#8c7e72', fontSize: '0.9rem' }}>{formatPrice(product.oldPrice || 0)}</span>
                              <span className="new-price card-price" style={{ margin: 0 }}>{formatPrice(product.price || 0)}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="card-price">💰 {formatPrice(product.price || 0)}</p>
                        )}
                        {product.productCategory ? <span className="stock-badge category-badge">📂 {product.productCategory}</span> : null}
                        {product.category ? <span className="stock-badge category-badge">🏷️ {product.category}</span> : null}
                        <p className="card-description">{product.description}</p>
                        <div className="inventory-actions">
                          <button onClick={() => startEditing(product)} className="edit-btn" aria-label="Edit product">
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="delete-btn" aria-label="Delete product">
                            🗑️ Delete
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
      )}
    </div>
  )
}
