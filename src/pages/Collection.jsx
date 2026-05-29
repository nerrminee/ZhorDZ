import { useEffect, useMemo, useState } from 'react'
import '../App.css'
import { getProducts, subscribeProducts } from '../services/products'
import { getProductImages } from '../utils/productOptions'

const DEFAULT_COLLECTION = 'Collection'

function Collection() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

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

  const collections = useMemo(() => {
    const grouped = new Map()

    products
      .filter((product) => product.isPublished)
      .forEach((product) => {
        const name = product.category?.trim() || DEFAULT_COLLECTION
        if (!grouped.has(name)) grouped.set(name, [])
        grouped.get(name).push(product)
      })

    return Array.from(grouped.entries())
      .map(([name, items]) => ({ name, items }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [products])

  return (
    <main className="collections-page" aria-label="Collections page">
      <section className="collections-hero">
        <p className="boutique-subtitle">Collections</p>
        <h1>Explore every collection</h1>
        <p>Discover each line through the products, colors, and textures already live in the boutique.</p>
      </section>

      {loading && !collections.length ? (
        <div className="collections-empty">Loading collections...</div>
      ) : collections.length ? (
        <>
          <section className="collections-showcase" aria-label="Featured collections">
            {collections.slice(0, 3).map((collection, index) => {
              const heroProduct = collection.items[0]
              const heroImage = getProductImages(heroProduct)[0]

              return (
                <a
                  className="collection-showcase-item"
                  href={`/boutique?collection=${encodeURIComponent(collection.name)}`}
                  key={collection.name}
                  style={{ '--delay': `${index * 140}ms` }}
                >
                  {heroImage ? <img src={heroImage} alt={collection.name} /> : null}
                  <span>{collection.name}</span>
                </a>
              )
            })}
          </section>

          <section className="collections-grid" aria-label="Product collections">
            {collections.map((collection, index) => {
              const previewProducts = collection.items.slice(0, 4)

              return (
                <article className="collection-card" key={collection.name} style={{ '--delay': `${index * 120}ms` }}>
                  <a href={`/boutique?collection=${encodeURIComponent(collection.name)}`} className="collection-media" aria-label={`Open ${collection.name}`}>
                    {previewProducts.map((product, imageIndex) => {
                      const image = getProductImages(product)[0]
                      return (
                        <div className="collection-image-tile" key={product.id || `${collection.name}-${imageIndex}`}>
                          {image ? <img src={image} alt={product.name} /> : null}
                        </div>
                      )
                    })}
                  </a>
                  <div className="collection-card-body">
                    <div>
                      <h2>{collection.name}</h2>
                      <p>{collection.items.length} product{collection.items.length > 1 ? 's' : ''}</p>
                    </div>
                    <a className="collection-link" href={`/boutique?collection=${encodeURIComponent(collection.name)}`}>View products</a>
                  </div>
                </article>
              )
            })}
          </section>
        </>
      ) : (
        <div className="collections-empty">
          <h2>No collections yet</h2>
          <p>Add products with a collection from the admin panel to show them here.</p>
        </div>
      )}
    </main>
  )
}

export default Collection
