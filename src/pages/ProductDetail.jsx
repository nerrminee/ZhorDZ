import { useContext, useEffect, useMemo, useState } from 'react'
import '../App.css'
import { AuthContext } from '../context/AuthContext'
import { getProducts, subscribeProducts, createProductSlug } from '../services/products'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getColorValue, getProductImages } from '../utils/productOptions'
import { CART_STORAGE_KEY, createCartItem, writeCheckout } from '../utils/cart'

function ProductDetail({ slug }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [likedIds, setLikedIds] = useLocalStorage('zhordz-liked', [])
  const [, setCartItems] = useLocalStorage(CART_STORAGE_KEY, [])
  const { isAuthenticated } = useContext(AuthContext)

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

  const product = useMemo(() => {
    const targetSlug = createProductSlug(decodeURIComponent(slug || ''))
    return products.find((item) => {
      const itemSlug = item.slug || createProductSlug(item.name)
      return item.id === slug || itemSlug === targetSlug
    })
  }, [products, slug])

  function toggleLike(id) {
    setLikedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  if (loading && products.length === 0) {
    return (
      <main className="product-detail-page" aria-label="Product detail page">
        <div className="product-detail-shell product-detail-loading">Chargement du produit...</div>
      </main>
    )
  }

  if (!product || (!product.isPublished && !isAuthenticated)) {
    return (
      <main className="product-detail-page" aria-label="Product detail page">
        <div className="product-detail-shell product-not-found">
          <p className="boutique-subtitle">Produit</p>
          <h1>Produit introuvable</h1>
          <a className="hero-button" href="/boutique">Retour a la boutique</a>
        </div>
      </main>
    )
  }

  const hasDetails = product.detailDescription || product.fabric || product.care || product.category || product.sku
  const productImages = getProductImages(product)
  const activeColor = product.colors?.includes(selectedColor) ? selectedColor : product.colors?.[0] || ''
  const activeSize = product.sizes?.includes(selectedSize) ? selectedSize : product.sizes?.[0] || ''
  const activeImage = productImages.includes(selectedImage) ? selectedImage : productImages[0] || ''

  const selectedItem = () => createCartItem(product, {
    color: activeColor,
    size: activeSize,
    quantity,
  })

  const addToCart = () => {
    setCartItems((current) => [...current, selectedItem()])
  }

  const buyNow = () => {
    writeCheckout([selectedItem()], 'direct')
    window.location.assign('/checkout')
  }

  return (
    <main className="product-detail-page" aria-label="Product detail page">
      <div className="product-detail-shell">
        <nav className="product-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Accueil</a>
          <span>/</span>
          <a href="/boutique">Boutique</a>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <section className="product-detail-layout">
          <div className="product-gallery">
            <div className="product-media">
              {activeImage ? <img src={activeImage} alt={product.name} /> : null}
            </div>
            {productImages.length > 1 ? (
              <div className="product-thumbnails" aria-label="Product images">
                {productImages.map((image, index) => (
                  <button
                    type="button"
                    key={image}
                    className={(activeImage || productImages[0]) === image ? 'is-selected' : ''}
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="product-info-panel">
            {product.category ? <p className="product-category">{product.category}</p> : null}
            <h1>{product.name}</h1>
            <p className="product-price">{product.price ? `\u20ac${Number(product.price).toFixed(2)}` : ''}</p>
            <p className="product-summary">{product.description}</p>

            {product.colors?.length ? (
              <div className="product-option-group">
                <span>Couleur</span>
                <div className="option-list">
                  {product.colors.map((color) => (
                    <button
                      type="button"
                      key={color}
                      className={`color-option ${activeColor === color ? 'is-selected' : ''}`}
                      style={{ '--swatch-color': getColorValue(color) }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Selectionner ${color}`}
                      title={color}
                    >
                      <span>{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {product.sizes?.length ? (
              <div className="product-option-group">
                <span>Taille</span>
                <div className="option-list">
                  {product.sizes.map((size) => (
                    <button
                      type="button"
                      key={size}
                      className={activeSize === size ? 'is-selected' : ''}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="product-purchase-row">
              <div className="quantity-control" aria-label="Quantite">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>-</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((value) => value + 1)}>+</button>
              </div>
              <button type="button" className="add-cart-btn" onClick={addToCart}>Ajouter au panier</button>
              <button type="button" className="add-cart-btn buy-now-btn" onClick={buyNow}>Buy now</button>
              <button
                type="button"
                className={`like-toggle product-like ${likedIds.includes(product.id) ? 'liked' : ''}`}
                aria-label={likedIds.includes(product.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                onClick={() => toggleLike(product.id)}
              >
                {likedIds.includes(product.id) ? '\u2665' : '\u2661'}
              </button>
            </div>

            {hasDetails ? (
              <div className="product-detail-notes">
                {product.detailDescription ? (
                  <section>
                    <h2>Details</h2>
                    <p>{product.detailDescription}</p>
                  </section>
                ) : null}
                {product.fabric ? (
                  <section>
                    <h2>Matiere</h2>
                    <p>{product.fabric}</p>
                  </section>
                ) : null}
                {product.care ? (
                  <section>
                    <h2>Entretien</h2>
                    <p>{product.care}</p>
                  </section>
                ) : null}
                {product.sku ? (
                  <section>
                    <h2>Reference</h2>
                    <p>{product.sku}</p>
                  </section>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  )
}

export default ProductDetail
