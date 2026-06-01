import { useMemo, useState, useEffect } from 'react'
import './App.css'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import Boutique from './pages/Boutique'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Contact from './pages/Contact'
import Collection from './pages/Collection'
import Liked from './pages/Liked'
import ProductDetail from './pages/ProductDetail'
import AdminOrders from './pages/AdminOrders'
import Search from './pages/Search'
import { subscribeProducts } from './services/products'
import backgroundImage from './assets/backgroud.jpg'
import editorialVideo from './assets/editorial-video.mp4'
import lookbookOne from './assets/lookbook-1.mp4'
import lookbookTwo from './assets/lookbook-2.mp4'
import lookbookThree from './assets/lookbook-3.mp4'

const navItems = [
  { label: 'Acceuil', href: '/' },
  { label: 'Boutique', href: '/boutique' },
  { label: 'Favoris', href: '/liked', icon: '❤️' },
  { label: 'Contact', href: '/contact' },
  { label: 'Collection', href: '/collection' },
  { label: 'Panier', href: '/panier', icon: '🛒' },
]

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [path, setPath] = useState(window.location.pathname)
  const [searchTerm, setSearchTerm] = useState(
    () => new URLSearchParams(window.location.search).get('q') || ''
  )
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchProducts, setSearchProducts] = useState([])
  const productSlug = path.startsWith('/en/product/')
    ? path.replace('/en/product/', '')
    : path.startsWith('/product/')
      ? path.replace('/product/', '')
      : ''

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname)
      setSearchTerm(new URLSearchParams(window.location.search).get('q') || '')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeProducts((list) => setSearchProducts(list.filter((product) => product.isPublished)))
    return () => unsubscribe()
  }, [])

  const searchSuggestions = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    const values = new Set()

    searchProducts.forEach((product) => {
      if (product.name) values.add(product.name)
      if (product.productCategory) values.add(product.productCategory)
      if (product.category) values.add(product.category)
    })

    return Array.from(values)
      .filter((value) => !normalized || value.toLowerCase().includes(normalized))
      .slice(0, 6)
  }, [searchProducts, searchTerm])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const prepared = searchTerm.trim()
    if (!prepared) return
    window.location.assign(`/search?q=${encodeURIComponent(prepared)}`)
  }

  return (
    <>
      {!path.startsWith('/admin') ? (
        <>
          <header className="site-header">
            <div className="nav-shell">
              <button
                className="icon-button menu-button"
                type="button"
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
              >
                <span></span>
                <span></span>
              </button>

              <a className="brand" href="/" aria-label="ZHOR DZ home">
                <span>ZHOR DZ</span>
              </a>

              <nav className="desktop-nav" aria-label="Main navigation">
                {navItems.map((item) => (
                  <a href={item.href} className="nav-link" key={item.label}>
                    {item.icon ? <span className="nav-icon" aria-hidden="true">{item.icon}</span> : null}
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="nav-actions">
                <form className="site-search" onSubmit={handleSearchSubmit} role="search">
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 160)}
                    placeholder="Search"
                    aria-label="Search products or collections"
                  />
                  <button className="icon-button" type="submit" aria-label="Search">
                    <span className="search-icon"></span>
                  </button>
                  {isSearchFocused && searchSuggestions.length ? (
                    <div className="site-search-suggestions">
                      {searchSuggestions.map((suggestion) => (
                        <a href={`/search?q=${encodeURIComponent(suggestion)}`} key={suggestion}>
                          {suggestion}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </form>
              </div>
            </div>

            <div className={`mobile-panel ${isMenuOpen ? 'is-open' : ''}`}>
              <nav aria-label="Mobile navigation">
                {navItems.map((item) => (
                  <a href={item.href} key={item.label}>
                    {item.icon ? <span className="nav-icon" aria-hidden="true">{item.icon}</span> : null}
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </header>

          {productSlug ? (
            <ProductDetail slug={productSlug} />
          ) : path === '/boutique' ? (
            <Boutique />
          ) : path === '/panier' ? (
            <Cart />
          ) : path === '/checkout' ? (
            <Checkout />
          ) : path === '/liked' ? (
            <Liked />
          ) : path === '/contact' ? (
            <Contact />
          ) : path === '/collection' ? (
            <Collection />
          ) : path === '/search' ? (
            <Search />
          ) : (
            <main className="home-page" aria-label="ZHOR DZ home">
              <section className="home-hero" style={{ '--hero-bg': `url(${backgroundImage})` }}>
                <div className="home-hero-overlay"></div>
                <div className="home-hero-copy">
                  <p className="home-kicker">Nouvelle saison</p>
                  <h1>ZHOR DZ</h1>
                  <p>
                    Robes lumineuses, textures douces et silhouettes pensees pour les beaux jours.
                  </p>
                  <div className="home-actions">
                    <a className="home-primary-link" href="/boutique">Voir la boutique</a>
                    <a className="home-secondary-link" href="/collection">Explorer la collection</a>
                  </div>
                </div>
                <div className="home-video-frame" aria-label="Editorial video">
                  <video src={editorialVideo} autoPlay muted loop playsInline poster={backgroundImage}></video>
                </div>
                <div className="home-marquee" aria-hidden="true">
                  <span>Sunflower edit</span>
                  <span>Summer dresses</span>
                  <span>ZHOR DZ</span>
                  <span>Natural elegance</span>
                </div>
              </section>

              <section className="home-lookbook" aria-label="Lookbook videos">
                <div className="home-section-heading">
                  <p>Lookbook</p>
                  <h2>Une collection en mouvement</h2>
                </div>
                <div className="lookbook-grid">
                  {[lookbookOne, lookbookTwo, lookbookThree].map((video, index) => (
                    <a
                      className="lookbook-tile"
                      href="/boutique"
                      key={video}
                      style={{ '--delay': `${index * 120}ms` }}
                    >
                      <video src={video} autoPlay muted loop playsInline></video>
                      <span>{index === 0 ? 'Détails brodés' : index === 1 ? 'Éclat solaire' : 'Silhouette fluide'}</span>
                    </a>
                  ))}
                </div>
              </section>
            </main>
          )}

          <footer className="site-footer">
            <div className="footer-shell">
              <div className="footer-brand">
                <span>ZHOR DZ</span>
                <p>Élégance, qualité et authenticité.</p>
              </div>
              <div className="footer-links">
                {navItems.map((item) => (
                  <a key={item.label} href={item.href} className="footer-link">
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="footer-meta">
                <p>Contact</p>
                <p>contact@zhordz.com</p>
                <p>+213 21 234 567</p>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© {new Date().getFullYear()} ZHORDZ. Tous droits réservés.</span>
            </div>
          </footer>
        </>
      ) : null}

      {path === '/admin' ? (
        <Admin />
      ) : path === '/admin/orders' ? (
        <AdminOrders />
      ) : path === '/admin/login' ? (
        <AdminLogin />
      ) : null}
    </>
  )
}

export default App
