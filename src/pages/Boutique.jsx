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
    <main className="shop-preview boutique-page" aria-label="Boutique page">
      <div className="boutique-shell">
        <div className="boutique-header">
          <div>
            <p className="boutique-subtitle">Shop</p>
            <h1>{activeCollection || 'Collection'}</h1>
          </div>
          <p>Decouvrez une selection raffinee de parfums et de vetements.</p>
        </div>

        <div className="shop-grid">
          {loading && products.length === 0 ? (
            Array.from({ length: 9 }).map((_, index) => (
              <article className="shop-card" key={index} style={{ animationDelay: `${index * 80}ms` }}>
                <div className="shop-card-image" />
                <div className="shop-card-body">
                  <span className="shop-card-tag">Nouveau</span>
                  <h2>Produit {index + 1}</h2>
                  <p>Un produit elegant avec une silhouette epuree et une finition premium.</p>
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
                      <div className="shop-image-arrows" aria-label="Product image controls">
                        <button type="button" onClick={() => scrollProductImages(p.id, -1)} aria-label="Previous image">‹</button>
                        <button type="button" onClick={() => scrollProductImages(p.id, 1)} aria-label="Next image">›</button>
                      </div>
                    ) : null}
                    {productImages.length > 1 ? <span className="shop-image-hint">Scroll</span> : null}
                  </div>
                  <div className="shop-card-body">
                    <h2>
                      <a className="product-title-link" href={productUrl}>{p.name}</a>
                    </h2>
                    <span className={`product-stock-pill ${inStock ? 'in-stock' : 'rupture'}`}>
                      {inStock ? 'In stock' : 'Rupture'}
                    </span>
                    <p>{p.description}</p>
                    {(p.fabric || p.care) ? (
                      <div className="shop-card-details">
                        {p.fabric ? (
                          <span><strong>Fabric</strong>{p.fabric}</span>
                        ) : null}
                        {p.care ? (
                          <span><strong>Care</strong>{p.care}</span>
                        ) : null}
                      </div>
                    ) : null}
                    {(p.colors?.length || p.sizes?.length) ? (
                      <div className="shop-card-options" aria-label="Product options">
                        {p.colors?.length ? (
                          <div className="shop-color-list" aria-label="Available colors">
                            {p.colors.map((color) => (
                              <button
                                type="button"
                                key={color}
                                className={`color-swatch ${activeColor === color ? 'is-selected' : ''}`}
                                style={{ '--swatch-color': getColorValue(color) }}
                                aria-label={`Select ${color}`}
                                title={color}
                                onClick={() => selectOption(p.id, 'color', color)}
                              />
                            ))}
                          </div>
                        ) : null}
                        {p.sizes?.length ? (
                          <div className="shop-size-list" aria-label="Available sizes">
                            {p.sizes.map((size) => (
                              <button
                                type="button"
                                key={size}
                                className={activeSize === size ? 'is-selected' : ''}
                                onClick={() => selectOption(p.id, 'size', size)}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="shop-card-meta">
                      <span>{p.price ? formatPrice(p.price) : ''}</span>
                      <div className="shop-card-actions">
                        <button
                          type="button"
                          className={`like-toggle ${isLiked(p.id) ? 'liked' : ''}`}
                          aria-label={isLiked(p.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                          onClick={() => toggleLike(p.id)}
                        >
                          {isLiked(p.id) ? '♥' : '♡'}
                        </button>
                        {isAuthenticated && !p.isPublished ? (
                          <button className="shop-card-btn" onClick={() => handlePublish(p.id)}>Publier</button>
                        ) : (
                          <>
                            <button className="shop-card-btn" type="button" onClick={() => buyProduct(p, activeColor, activeSize)} disabled={!inStock}>
                              {inStock ? 'Buy' : 'Rupture'}
                            </button>
                            <a className="shop-card-btn" href={productUrl}>Voir</a>
                          </>
                        )}
                      </div>
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
