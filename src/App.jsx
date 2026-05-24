import { useState } from 'react'
import './App.css'

const navItems = [
  { label: 'Acceuil', href: '/' },
  { label: 'Boutique', href: '/boutique' },
  { label: 'Collection', href: '/collection' },
  { label: 'Liked Products', href: '/liked', icon: '❤️' },
  { label: 'Panier', href: '/panier', icon: '🛒' },
]

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
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
            <span>ZHOR</span>
            <small>DZ</small>
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

      <main className="shop-preview" aria-label="Shop preview">
        <p>ZHOR PARFUMS</p>
      </main>
    </>
  )
}

export default App
