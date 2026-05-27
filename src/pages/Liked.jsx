import { useEffect, useState } from 'react'
import '../App.css'
import { getProducts, subscribeProducts } from '../services/products'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getColorValue, getProductImages } from '../utils/productOptions'

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
    <main className="shop-preview boutique-page wishlist-page" aria-label="Wishlist page">
      <div className="boutique-shell">
        <div className="hero-welcome">
          <div>
            <p className="hero-subtitle">Wishlist</p>
            <h1 className="hero-title">Mes favoris</h1>
          </div>
          <p className="hero-description">Retrouvez ici les produits que vous avez ajoutes a votre liste de souhaits.</p>
        </div>

        {loading && products.length === 0 ? (
          <div className="wishlist-empty">Chargement de vos produits preferes...</div>
        ) : likedProducts.length === 0 ? (
          <div className="wishlist-empty">
            <h2>Votre liste de souhaits est vide</h2>
            <p>Ajoutez des produits a vos favoris depuis la boutique pour les retrouver ici.</p>
          </div>
        ) : (
          <div className="shop-grid wishlist-grid">
            {likedProducts.map((product, index) => {
              const productImages = getProductImages(product)
              const selected = selectedOptions[product.id] || {}
              const activeColor = selected.color || product.colors?.[0] || ''
              const activeSize = selected.size || product.sizes?.[0] || ''

              return (
                <article className="shop-card" key={product.id} style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="shop-card-image">
                    {productImages[0] ? (
                      <img src={productImages[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                  </div>
                  <div className="shop-card-body">
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>
                    {(product.colors?.length || product.sizes?.length) ? (
                      <div className="shop-card-options" aria-label="Product options">
                        {product.colors?.length ? (
                          <div className="shop-color-list" aria-label="Available colors">
                            {product.colors.map((color) => (
                              <button
                                type="button"
                                key={color}
                                className={`color-swatch ${activeColor === color ? 'is-selected' : ''}`}
                                style={{ '--swatch-color': getColorValue(color) }}
                                aria-label={`Select ${color}`}
                                title={color}
                                onClick={() => selectOption(product.id, 'color', color)}
                              />
                            ))}
                          </div>
                        ) : null}
                        {product.sizes?.length ? (
                          <div className="shop-size-list" aria-label="Available sizes">
                            {product.sizes.map((size) => (
                              <button
                                type="button"
                                key={size}
                                className={activeSize === size ? 'is-selected' : ''}
                                onClick={() => selectOption(product.id, 'size', size)}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="shop-card-meta">
                      <span>{product.price ? `\u20ac${product.price}` : ''}</span>
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
