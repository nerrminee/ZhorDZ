import { useEffect, useMemo, useState } from 'react'
import '../App.css'
import { getProducts, subscribeProducts, createProductSlug } from '../services/products'
import { getProductImages } from '../utils/productOptions'
import { formatPrice } from '../utils/cart'

const DEFAULT_COLLECTION = 'Collection'

function normalize(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function productMatches(product, query) {
  const haystack = [
    product.name,
    product.description,
    product.detailDescription,
    product.category,
    product.productCategory,
    product.fabric,
    product.care,
    ...(product.colors || []),
    ...(product.sizes || []),
  ]
    .map(normalize)
    .join(' ')

  return haystack.includes(query)
}

function Search() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [localSearch, setLocalSearch] = useState(new URLSearchParams(window.location.search).get('q') || '')
  const query = normalize(new URLSearchParams(window.location.search).get('q') || '')
  const displayQuery = new URLSearchParams(window.location.search).get('q') || ''

  const submitSearch = (event) => {
    event.preventDefault()
    const prepared = localSearch.trim()
    if (!prepared) return
    window.location.assign(`/search?q=${encodeURIComponent(prepared)}`)
  }

  useEffect(() => {
    let unsub

    async function load() {
      setLoading(true)
      try {
        const list = await getProducts()
        setProducts(list)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    load()
    unsub = subscribeProducts((list) => setProducts(list))

    return () => unsub && unsub()
  }, [])

  const publishedProducts = useMemo(
    () => products.filter((product) => product.isPublished),
    [products]
  )

  const matchedProducts = useMemo(() => {
    if (!query) return []
    return publishedProducts.filter((product) => productMatches(product, query))
  }, [publishedProducts, query])

  const matchedCollections = useMemo(() => {
    if (!query) return []
    const grouped = new Map()

    publishedProducts.forEach((product) => {
      const name = product.category?.trim() || DEFAULT_COLLECTION
      if (!grouped.has(name)) grouped.set(name, [])
      grouped.get(name).push(product)
    })

    return Array.from(grouped.entries())
      .map(([name, items]) => ({ name, items }))
      .filter((collection) => (
        normalize(collection.name).includes(query)
        || collection.items.some((product) => productMatches(product, query))
      ))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [publishedProducts, query])

  const searchSuggestions = useMemo(() => {
    const values = new Set()

    publishedProducts.forEach((product) => {
      if (product.productCategory) values.add(product.productCategory)
      if (product.category) values.add(product.category)
      if (product.name) values.add(product.name)
    })

    return Array.from(values)
      .filter((value) => !query || normalize(value).includes(query) || normalize(value).startsWith(query.slice(0, 3)))
      .slice(0, 8)
  }, [publishedProducts, query])

  return (
    <main className="search-page" aria-label="Résultats de recherche">
      <section className="search-hero">
        <p className="boutique-subtitle">Recherche</p>
        <h1>{displayQuery ? `Résultats pour "${displayQuery}"` : 'Rechercher dans la boutique'}</h1>
        <form className="search-hero-form" onSubmit={submitSearch} role="search">
          <span className="search-icon"></span>
          <input
            type="search"
            value={localSearch}
            onChange={(event) => setLocalSearch(event.target.value)}
            placeholder="Rechercher des robes, des collections, des catégories..."
            aria-label="Rechercher des produits, des collections ou des catégories"
          />
          <button type="submit">Rechercher</button>
        </form>
        {searchSuggestions.length ? (
          <div className="search-suggestions" aria-label="Suggestions de recherche">
            {searchSuggestions.map((suggestion) => (
              <a href={`/search?q=${encodeURIComponent(suggestion)}`} key={suggestion}>
                {suggestion}
              </a>
            ))}
          </div>
        ) : null}
      </section>

      {loading ? (
        <div className="elegant-loader" role="status" aria-live="polite">
          <span></span>
          <strong>Recherche dans la collection</strong>
        </div>
      ) : !query ? (
        <div className="collections-empty">
          <h2>Saisissez un terme de recherche</h2>
          <p>Recherchez par nom de produit, collection, couleur, tissu ou description.</p>
        </div>
      ) : (
        <>
          <section className="search-section" aria-label="Collections correspondantes">
            <div className="search-section-title">
              <h2>Collections</h2>
              <span>{matchedCollections.length}</span>
            </div>
            {matchedCollections.length ? (
              <div className="search-collection-list">
                {matchedCollections.map((collection) => {
                  const image = getProductImages(collection.items[0])[0]
                  return (
                    <a
                      className="search-collection-card"
                      href={`/boutique?collection=${encodeURIComponent(collection.name)}`}
                      key={collection.name}
                    >
                      {image ? <img src={image} alt={collection.name} /> : null}
                      <div>
                        <strong>{collection.name}</strong>
                        <span>{collection.items.length} produit{collection.items.length > 1 ? 's' : ''}</span>
                      </div>
                    </a>
                  )
                })}
              </div>
            ) : (
              <p className="search-empty-line">Aucune collection ne correspond à cette recherche.</p>
            )}
          </section>

          <section className="search-section" aria-label="Produits correspondants">
            <div className="search-section-title">
              <h2>Produits</h2>
              <span>{matchedProducts.length}</span>
            </div>
            {matchedProducts.length ? (
              <div className="search-product-grid">
                {matchedProducts.map((product) => {
                  const image = getProductImages(product)[0]
                  const productUrl = `/en/product/${encodeURIComponent(product.slug || createProductSlug(product.name) || product.id)}`

                  return (
                    <a className="search-product-card" href={productUrl} key={product.id}>
                      <div className="search-product-image">
                        {image ? <img src={image} alt={product.name} /> : null}
                      </div>
                      <div>
                        <span>{product.productCategory || product.category || DEFAULT_COLLECTION}</span>
                        <strong>{product.name}</strong>
                        <p>{product.description}</p>
                        {product.isSale ? (
                          <div className="product-sale-price-group" style={{ marginTop: '4px' }}>
                            <span className="sale-text">Sold</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="old-price">{formatPrice(product.oldPrice)}</span>
                              <em className="new-price" style={{ margin: 0 }}>{formatPrice(product.price)}</em>
                            </div>
                          </div>
                        ) : (
                          <em>{formatPrice(product.price)}</em>
                        )}
                      </div>
                    </a>
                  )
                })}
              </div>
            ) : (
              <p className="search-empty-line">Aucun produit ne correspond à cette recherche.</p>
            )}
          </section>
        </>
      )}
    </main>
  )
}

export default Search
