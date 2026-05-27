import { useEffect, useState, useContext } from 'react'
import '../App.css'
import { getProducts, subscribeProducts, updateProduct, createProductSlug } from '../services/products'
import { AuthContext } from '../context/AuthContext'
import { useLocalStorage } from '../hooks/useLocalStorage'

function Boutique() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useLocalStorage('zhordz-liked', [])

  const toggleLike = (id) => {
    setLikedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  const isLiked = (id) => likedIds.includes(id)

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

    // subscribe for realtime updates
    unsub = subscribeProducts((list) => setProducts(list))

    return () => unsub && unsub()
  }, [])

  const { isAuthenticated } = useContext(AuthContext)
  const visibleProducts = isAuthenticated ? products : products.filter((p) => p.isPublished)

  async function handlePublish(id) {
    try {
      await updateProduct(id, { isPublished: true })
    } catch (e) {
      console.error('publish failed', e)
    }
  }

  return (
    <main className="shop-preview boutique-page" aria-label="Boutique page">
      <div className="boutique-shell">
        <div className="boutique-header">
          <div>
            <p className="boutique-subtitle">Shop</p>
            <h1>Collection</h1>
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
                    <span>€89</span>
                    <button className="shop-card-btn">Voir</button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            visibleProducts.map((p, index) => {
              const productUrl = `/en/product/${encodeURIComponent(p.slug || createProductSlug(p.name) || p.id)}`

              return (
              <article className="shop-card" key={p.id || index} style={{ animationDelay: `${index * 80}ms` }}>
                <a className="shop-card-image shop-card-link" href={productUrl}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : null}
                </a>
                <div className="shop-card-body">
                  <h2>
                    <a className="product-title-link" href={productUrl}>{p.name}</a>
                  </h2>
                  <p>{p.description}</p>
                  <div className="shop-card-meta">
                    <span>{p.price ? `€${p.price}` : ''}</span>
                    <div className="shop-card-actions">
                      <button
                        type="button"
                        className={`like-toggle ${isLiked(p.id) ? 'liked' : ''}`}
                        aria-label={isLiked(p.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        onClick={() => toggleLike(p.id)}
                      >
                        {isLiked(p.id) ? '❤' : '♡'}
                      </button>
                      {isAuthenticated && !p.isPublished ? (
                        <button className="shop-card-btn" onClick={() => handlePublish(p.id)}>Publier</button>
                      ) : (
                        <a className="shop-card-btn" href={productUrl}>Voir</a>
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
