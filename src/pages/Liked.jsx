import { useEffect, useState } from 'react'
import '../App.css'
import { getProducts, subscribeProducts } from '../services/products'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getColorValue, getProductImages } from '../utils/productOptions'
import { formatPrice } from '../utils/cart'

function Liked() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useLocalStorage('zhordz-liked', [])
  const [selectedOptions, setSelectedOptions] = useState({})

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

  const likedProducts = products.filter((product) => likedIds.includes(product.id))

  const newProductIds = products
    .filter((p) => p.isPublished)
    .slice(0, 3)
    .map((p) => p.id)

  const selectOption = (productId, field, value) => {
    setSelectedOptions((current) => ({
      ...current,
      [productId]: {
        ...(current[productId] || {}),
        [field]: value,
      },
    }))
  }

  function toggleLike(id) {
    setLikedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  return (
    <main className="shop-preview boutique-page wishlist-page" aria-label="Page des favoris">
      <div className="boutique-shell">
        <div className="hero-welcome">
          <div>
            <p className="hero-subtitle">Favoris</p>
            <h1 className="hero-title">Mes favoris</h1>
          </div>
          <p className="hero-description">Retrouvez ici les produits que vous avez ajoutés à votre liste de souhaits.</p>
        </div>

        {loading && products.length === 0 ? (
          <div className="wishlist-empty">Chargement de vos produits préférés...</div>
        ) : likedProducts.length === 0 ? (
          <div className="wishlist-empty">
            <h2>Votre liste de souhaits est vide</h2>
            <p>Ajoutez des produits à vos favoris depuis la boutique pour les retrouver ici.</p>
          </div>
        ) : (
          <div className="shop-grid wishlist-grid">
            {likedProducts.map((product, index) => {
              const productImages = getProductImages(product)
              const selected = selectedOptions[product.id] || {}
              const activeColor = selected.color || product.colors?.[0] || ''
              const activeSize = selected.size || product.sizes?.[0] || ''
              const inStock = product.isInStock ?? true

              const productUrl = `/en/product/${encodeURIComponent(product.slug || product.id)}`
              const isNew = newProductIds.includes(product.id)

              return (
                <article className="shop-card" key={product.id} style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="shop-card-image">
                    <a className="shop-card-link" href={productUrl}>
                      {productImages.length ? (
                        <div className="shop-image-reel" style={{ '--image-count': productImages.length }}>
                          {productImages.map((image, imageIndex) => (
                            <img src={image} alt={imageIndex === 0 ? product.name : ''} key={image} />
                          ))}
                        </div>
                      ) : null}
                    </a>
                    {productImages.length > 1 ? <span className="shop-image-hint">Défiler</span> : null}
                    {isNew && <span className="product-badge new-badge">New</span>}
                    {product.isSale && <span className="product-badge sale-badge">Sold</span>}
                  </div>
                  <div className="shop-card-body">
                    <h2>
                      <a className="product-title-link" href={productUrl}>{product.name}</a>
                    </h2>
                    <span className={`product-stock-pill ${inStock ? 'in-stock' : 'rupture'}`}>
                      {inStock ? 'En stock' : 'En rupture'}
                    </span>
                    <div className="shop-card-meta">
                      <span>{product.price ? formatPrice(product.price) : ''}</span>
                      <button
                        type="button"
                        className="shop-card-btn remove-from-wishlist"
                        onClick={() => toggleLike(product.id)}
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default Liked
