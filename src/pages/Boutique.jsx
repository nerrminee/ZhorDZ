import { useEffect, useState, useContext } from 'react'
import '../App.css'
import { getProducts, subscribeProducts, updateProduct, createProductSlug } from '../services/products'
import { AuthContext } from '../context/AuthContextValue'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getColorValue, getProductImages } from '../utils/productOptions'
import { createCartItem, formatPrice, writeCheckout } from '../utils/cart'

function Boutique() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useLocalStorage('zhordz-liked', [])
  const [selectedOptions, setSelectedOptions] = useState({})

  const toggleLike = (id) => {
    setLikedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  const isLiked = (id) => likedIds.includes(id)

  const selectOption = (productId, field, value) => {
    setSelectedOptions((current) => ({
      ...current,
      [productId]: {
        ...(current[productId] || {}),
        [field]: value,
      },
    }))
  }

  useEffect(() => {
    let unsub
    async function load() {
      setLoading(true)
      try {
        const list = await getProducts()
        setProducts(list)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    load()
    unsub = subscribeProducts((list) => setProducts(list))

    return () => unsub && unsub()
  }, [])

  const { isAuthenticated } = useContext(AuthContext)
  const activeCollection = new URLSearchParams(window.location.search).get('collection') || ''
  const visibleProducts = (isAuthenticated ? products : products.filter((p) => p.isPublished))
    .filter((p) => !activeCollection || p.category === activeCollection)

  const newProductIds = products
    .filter((p) => p.isPublished)
    .slice(0, 3)
    .map((p) => p.id)

  async function handlePublish(id) {
    try {
      await updateProduct(id, { isPublished: true })
    } catch (e) {
      console.error('publish failed', e)
    }
  }

  const buyProduct = (product, color, size) => {
    writeCheckout([createCartItem(product, { color, size, quantity: 1 })], 'direct')
    window.location.assign('/checkout')
  }

  const scrollProductImages = (productId, direction) => {
    const reel = document.getElementById(`product-reel-${productId}`)
    if (!reel) return
    reel.scrollBy({ left: direction * reel.clientWidth, behavior: 'smooth' })
  }

  return (
    <main className="shop-preview boutique-page" aria-label="Page Boutique">
      <div className="boutique-shell">
        <div className="boutique-header">
          <div>
            <p className="boutique-subtitle">Boutique</p>
            <h1>{activeCollection || 'Collection'}</h1>
          </div>
          <p>Découvrez une sélection raffinée de parfums et de vêtements.</p>
        </div>

        <div className="shop-grid">
          {loading && products.length === 0 ? (
            Array.from({ length: 9 }).map((_, index) => (
              <article className="shop-card" key={index} style={{ animationDelay: `${index * 80}ms` }}>
                <div className="shop-card-image" />
                <div className="shop-card-body">
                  <span className="shop-card-tag">Nouveau</span>
                  <h2>Produit {index + 1}</h2>
                  <p>Un produit élégant avec une silhouette épurée et une finition premium.</p>
                  <div className="shop-card-meta">
                    <span>8900 DA</span>
                    <button className="shop-card-btn">Voir</button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            visibleProducts.map((p, index) => {
              const productUrl = `/en/product/${encodeURIComponent(p.slug || createProductSlug(p.name) || p.id)}`
              const productImages = getProductImages(p)
              const selected = selectedOptions[p.id] || {}
              const activeColor = selected.color || p.colors?.[0] || ''
              const activeSize = selected.size || p.sizes?.[0] || ''
              const inStock = p.isInStock ?? true
              const isNew = newProductIds.includes(p.id)

              return (
                <article className="shop-card" key={p.id || index} style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="shop-card-image">
                    <a className="shop-card-link" href={productUrl}>
                      {productImages.length ? (
                        <div id={`product-reel-${p.id}`} className="shop-image-reel" style={{ '--image-count': productImages.length }}>
                          {productImages.map((image, imageIndex) => (
                            <img src={image} alt={imageIndex === 0 ? p.name : ''} key={image} />
                          ))}
                        </div>
                      ) : null}
                    </a>
                    {productImages.length > 1 ? (
                      <div className="shop-image-arrows" aria-label="Contrôles de l'image du produit">
                        <button type="button" onClick={() => scrollProductImages(p.id, -1)} aria-label="Image précédente">‹</button>
                        <button type="button" onClick={() => scrollProductImages(p.id, 1)} aria-label="Image suivante">›</button>
                      </div>
                    ) : null}
                    {productImages.length > 1 ? <span className="shop-image-hint">Défiler</span> : null}
                    {isNew && <span className="product-badge new-badge">New</span>}
                    {p.isSale && <span className="product-badge sale-badge">Sold</span>}
                  </div>
                  <div className="shop-card-body">
                    <h2>
                      <a className="product-title-link" href={productUrl}>{p.name}</a>
                    </h2>
                    <span className={`product-stock-pill ${inStock ? 'in-stock' : 'rupture'}`}>
                      {inStock ? 'En stock' : 'En rupture'}
                    </span>
                    <div className="shop-card-meta">
                      {p.isSale ? (
                        <div className="product-price-group">
                          <span className="old-price">{formatPrice(p.oldPrice)}</span>
                          <span className="new-price">{formatPrice(p.price)}</span>
                        </div>
                      ) : (
                        <span>{p.price ? formatPrice(p.price) : ''}</span>
                      )}
                      {isAuthenticated && !p.isPublished && (
                        <div className="shop-card-actions">
                          <button className="shop-card-btn" onClick={() => handlePublish(p.id)}>Publier</button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}

export default Boutique
