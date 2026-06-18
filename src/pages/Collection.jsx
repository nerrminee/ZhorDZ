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
    <main className="collections-page" aria-label="Page des collections">
      <section className="collections-hero">
        <p className="boutique-subtitle">Collections</p>
        <h1>Explorez chaque collection</h1>
        <p>Découvrez chaque ligne à travers les produits, les couleurs et les textures déjà disponibles dans la boutique.</p>
      </section>

      {loading && !collections.length ? (
        <div className="collections-empty">Chargement des collections...</div>
      ) : collections.length ? (
        <>
          <section className="collections-showcase" aria-label="Collections vedettes">
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

          <section className="collections-grid" aria-label="Collections de produits">
            {collections.map((collection, index) => {
              const previewProducts = collection.items.slice(0, 4)

              return (
                <article className="collection-card" key={collection.name} style={{ '--delay': `${index * 120}ms` }}>
                  <a href={`/boutique?collection=${encodeURIComponent(collection.name)}`} className="collection-media" aria-label={`Ouvrir ${collection.name}`}>
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
                      <p>{collection.items.length} produit{collection.items.length > 1 ? 's' : ''}</p>
                    </div>
                    <a className="collection-link" href={`/boutique?collection=${encodeURIComponent(collection.name)}`}>Voir les produits</a>
                  </div>
                </article>
              )
            })}
          </section>
        </>
      ) : (
        <div className="collections-empty">
          <h2>Aucune collection pour le moment</h2>
          <p>Ajoutez des produits avec une collection depuis le panneau d'administration pour les afficher ici.</p>
        </div>
      )}
    </main>
  )
}

export default Collection
