import { useState, useEffect } from 'react'
import './App.css'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import Boutique from './pages/Boutique'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Contact from './pages/Contact'
import Liked from './pages/Liked'
import ProductDetail from './pages/ProductDetail'

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
  const productSlug = path.startsWith('/en/product/')
    ? path.replace('/en/product/', '')
    : path.startsWith('/product/')
      ? path.replace('/product/', '')
      : ''

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <>
      {path !== '/admin' && path !== '/admin/login' ? (
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
                <button className="icon-button" type="button" aria-label="Search">
                  <span className="search-icon"></span>
                </button>
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
          ) : (
            <main className="shop-preview" aria-label="Shop preview">
              <div className="hero-welcome">
                <p className="hero-subtitle">Bienvenue chez</p>
                <h1 className="hero-title">
                  <span className="hero-text">ZHOR</span>
                  <span className="hero-text hero-dz">DZ</span>
                </h1>
                <div className="hero-actions">
                  <a className="hero-button" href="/boutique">Tous les vêtements</a>
                </div>
                <div className="hero-badges">
                  <span>Élégance</span>
                  <span>Qualité</span>
                  <span>Authenticité</span>
                </div>
              </div>
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
      ) : path === '/admin/login' ? (
        <AdminLogin />
      ) : null}
    </>
  )
}

export default App
