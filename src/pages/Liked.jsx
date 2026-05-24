import React, { useEffect, useState } from 'react'
import '../App.css'
import { getProducts, subscribeProducts } from '../services/products'
import { useLocalStorage } from '../hooks/useLocalStorage'

function Liked() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useLocalStorage('zhordz-liked', [])

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
            {likedProducts.map((product, index) => (
              <article className="shop-card" key={product.id} style={{ animationDelay: `${index * 80}ms` }}>
                <div className="shop-card-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : null}
                </div>
                <div className="shop-card-body">
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <div className="shop-card-meta">
                    <span>{product.price ? `€${product.price}` : ''}</span>
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
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Liked
