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
import { getProductImages } from './utils/productOptions'
import { formatPrice } from './utils/cart'
import editorialVideo from './assets/editorial-video.mp4'
import lookbookOne from './assets/lookbook-1.mp4'
import lookbookTwo from './assets/lookbook-2.mp4'
import lookbookThree from './assets/lookbook-3.mp4'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isPreloading, setIsPreloading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [path, setPath] = useState(window.location.pathname)
  const [searchTerm, setSearchTerm] = useState(
    () => new URLSearchParams(window.location.search).get('q') || ''
  )
  const [searchProducts, setSearchProducts] = useState([])
  
  const productSlug = path.startsWith('/en/product/')
    ? path.replace('/en/product/', '')
    : path.startsWith('/product/')
      ? path.replace('/product/', '')
      : ''

  // Scroll listener for sticky transparent header transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 2-second Preloader Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPreloading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

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

  const navigateTo = (href, e) => {
    e.preventDefault()
    window.history.pushState(null, '', href)
    setPath(href)
    setIsMenuOpen(false)
  }

  // Determine if current route is home
  const isHome = !productSlug && ![
    '/boutique', '/panier', '/checkout', '/liked', '/contact', '/collection', '/search'
  ].includes(path) && !path.startsWith('/admin')

  // Filter sold products for the home page bottom section
  const soldProducts = searchProducts.filter((p) => p.isSale)

  return (
    <>
      <div className="noise"></div>

      {/* Luxury Preloading Screen */}
      {isPreloading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#faf8f5] preloader-container">
          <div className="relative flex flex-col items-center">
            <div className="preloader-title">ZHOR</div>
            <div className="h-px w-24 bg-[#c6a77d] mt-4 preloader-line"></div>
            <p className="mt-4 font-sans text-xs uppercase tracking-[0.3em] text-[#666] preloader-subtitle">Maison de Couture</p>
          </div>
        </div>
      )}

      {!path.startsWith('/admin') ? (
        <>
          {/* Transparent to Sticky Header */}
          <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 luxury-navbar ${isScrolled ? 'is-scrolled' : 'is-transparent'} ${!isHome ? 'always-dark' : ''}`}>
            <div className="max-w-[1800px] mx-auto px-6 md:px-10 h-20 md:h-24 flex items-center justify-between">
              
              {/* Left Navigation (Desktop) / Hamburger (Mobile) */}
              <div className="flex-1 flex items-center gap-8">
                <button 
                  className="md:hidden p-2 transition-colors nav-burger-btn"
                  onClick={() => setIsMenuOpen(true)}
                  aria-label="Ouvrir le menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <div className="hidden md:flex items-center gap-8">
                  <a className="text-[10px] uppercase tracking-[0.3em] nav-link-custom" href="/" onClick={(e) => navigateTo('/', e)}>Accueil</a>
                  <a className="text-[10px] uppercase tracking-[0.3em] nav-link-custom" href="/boutique" onClick={(e) => navigateTo('/boutique', e)}>Boutique</a>
                  <a className="text-[10px] uppercase tracking-[0.3em] nav-link-custom" href="/collection" onClick={(e) => navigateTo('/collection', e)}>Collections</a>
                </div>
              </div>

              {/* Center Logo */}
              <div className="flex-1 flex justify-center">
                <a href="/" onClick={(e) => navigateTo('/', e)}>
                  <div className="font-heading tracking-tighter select-none cursor-pointer text-3xl md:text-4xl logo-brand">ZHOR</div>
                </a>
              </div>

              {/* Right Navigation Icons */}
              <div className="flex-1 flex items-center justify-end gap-6 md:gap-8">
                <a className="hidden md:block text-[10px] uppercase tracking-[0.3em] nav-link-custom" href="/contact" onClick={(e) => navigateTo('/contact', e)}>Contact</a>
                
                {/* Search Toggle */}
                <button className="p-2 -mr-2 md:mr-0 hover:text-[#c6a77d] transition-colors" onClick={() => setIsSearchOpen(true)} aria-label="Rechercher">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
                </button>
                
                {/* Liked / Wishlist */}
                <a className="p-2 -mr-2 md:mr-0 hover:text-[#c6a77d] transition-colors relative" href="/liked" onClick={(e) => navigateTo('/liked', e)} aria-label="Favoris">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"></path></svg>
                </a>
                
                {/* Admin / Login */}
                <a className="p-2 -mr-2 md:mr-0 hover:text-[#c6a77d] transition-colors" href="/admin/login" onClick={(e) => navigateTo('/admin/login', e)} aria-label="Profil Admin">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </a>
                
                {/* Cart */}
                <a className="p-2 -mr-2 md:mr-0 hover:text-[#c6a77d] transition-colors" href="/panier" onClick={(e) => navigateTo('/panier', e)} aria-label="Panier">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 10a4 4 0 0 1-8 0"></path><path d="M3.103 6.034h17.794"></path><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"></path></svg>
                </a>
              </div>
            </div>
          </nav>

          {/* Full Screen Menu Drawer for Mobile */}
          <div className={`mobile-nav-drawer-new ${isMenuOpen ? 'is-open' : ''}`}>
            <div className="flex justify-between items-center mb-20">
              <div className="font-heading tracking-tighter text-2xl logo-brand">ZHOR</div>
              <button className="p-2 hover:text-[#c6a77d] transition-colors" onClick={() => setIsMenuOpen(false)} aria-label="Fermer le menu">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="flex flex-col gap-10 mobile-drawer-links">
              <a className="text-4xl font-heading" href="/" onClick={(e) => navigateTo('/', e)}>Accueil</a>
              <a className="text-4xl font-heading" href="/boutique" onClick={(e) => navigateTo('/boutique', e)}>Boutique</a>
              <a className="text-4xl font-heading" href="/collection" onClick={(e) => navigateTo('/collection', e)}>Collections</a>
              <a className="text-4xl font-heading" href="/contact" onClick={(e) => navigateTo('/contact', e)}>Contact</a>
            </div>
            <div className="mt-auto border-t border-[#111]/10 pt-10 drawer-footer">
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-4">Suivez-nous</p>
              <div className="flex gap-6 font-sans text-xs uppercase tracking-widest">
                <a href="https://www.instagram.com/zhor.algerie" target="_blank" rel="noopener noreferrer" className="hover:text-[#c6a77d] transition-colors">Instagram</a>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#c6a77d] transition-colors">Facebook</a>
              </div>
            </div>
          </div>

          {/* Full-Screen Search Overlay */}
          {isSearchOpen && (
            <div className="fixed inset-0 bg-[#faf8f5]/98 z-[100] flex flex-col p-10 search-overlay-fullscreen">
              <div className="flex justify-between items-center mb-20 max-w-[1800px] mx-auto w-full">
                <div className="font-heading tracking-tighter text-2xl logo-brand">ZHOR</div>
                <button className="p-2 hover:text-[#c6a77d] transition-colors" onClick={() => setIsSearchOpen(false)} aria-label="Fermer la recherche">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto w-full">
                <form onSubmit={handleSearchSubmit} className="w-full flex items-center border-b border-[#111]/20 pb-4 mb-8">
                  <input
                    type="search"
                    autoFocus
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Rechercher des collections, des robes..."
                    className="w-full bg-transparent border-none outline-none font-heading text-3xl md:text-5xl text-foreground placeholder:text-foreground/20 search-fullscreen-input"
                  />
                  <button type="submit" className="p-2 hover:text-[#c6a77d] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"></path></svg>
                  </button>
                </form>
                {searchSuggestions.length > 0 && (
                  <div className="w-full flex flex-col items-start gap-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#666]">Suggestions</p>
                    <div className="flex flex-wrap gap-3">
                      {searchSuggestions.map((suggestion) => (
                        <a
                          href={`/search?q=${encodeURIComponent(suggestion)}`}
                          key={suggestion}
                          className="px-4 py-2 border border-[#111]/10 hover:border-[#c6a77d] hover:text-[#c6a77d] transition-all text-xs uppercase tracking-wider"
                        >
                          {suggestion}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
            <main className="relative min-h-screen">
              
              {/* Premium Hero Section */}
              <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#faf8f5] home-hero-section">
                
                {/* Desktop Image Background */}
                <div className="absolute inset-0 z-0 hidden md:block hero-image-container">
                  <img src={backgroundImage} alt="Arrière-plan Zhor" className="w-full h-full object-cover brightness-[0.85] hero-desktop-image"/>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#faf8f5]/20 pointer-events-none"></div>
                </div>

                {/* Mobile Video Background */}
                <div className="absolute inset-0 z-0 md:hidden flex items-center justify-center overflow-hidden">
                  <video autoPlay loop muted playsInline className="h-full w-full object-cover brightness-[0.85]">
                    <source src={editorialVideo} type="video/mp4"/>
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#faf8f5]/30 pointer-events-none"></div>
                </div>

                {/* Hero Center Text */}
                <div className="relative z-10 text-center px-4 hero-content-wrapper">
                  <div className="hero-text-anim">
                    <h1 className="font-heading text-[16vw] md:text-[11vw] leading-none text-[#111] tracking-tighter logo-brand hero-title-heading">ZHOR</h1>
                    <p className="mt-6 font-sans text-xs md:text-sm uppercase tracking-[0.4em] text-[#111]/70 max-w-2xl mx-auto">Style, chic &amp; qualité à votre service</p>
                    <a href="/boutique" onClick={(e) => navigateTo('/boutique', e)}>
                      <button className="mt-12 px-10 py-4 bg-[#111] text-[#faf8f5] font-sans text-[10px] uppercase tracking-[0.3em] hover:bg-[#c6a77d] transition-colors duration-500 btn-hero-explore">Tous les vêtements</button>
                    </a>
                  </div>
                </div>

                {/* Mobile Scroll Indicator */}
                <div className="absolute bottom-8 left-0 w-full flex flex-col items-center pointer-events-none md:hidden">
                  <div className="relative mb-4 flex flex-col items-center">
                    <div className="font-heading tracking-tighter text-2xl text-warm-white/40 mb-2 logo-brand">ZHOR</div>
                    <div className="flex flex-col items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#faf8f5]/60 animate-bounce"><path d="M12 5v14"></path><path d="M19 12l-7 7-7-7"></path></svg>
                      <div className="w-px h-10 bg-[#faf8f5]/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[#c6a77d] hero-indicator-scanner"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#111]/40 animate-bounce"><path d="M12 5v14"></path><path d="M19 12l-7 7-7-7"></path></svg>
                  <div className="w-px h-12 bg-[#111]/15 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#c6a77d] hero-indicator-scanner"></div>
                  </div>
                </div>
              </section>

              {/* Heritage Section (Desktop only) */}
              <section className="py-32 bg-[#f2ece6] overflow-hidden hidden md:block heritage-section">
                <div className="max-w-[1800px] mx-auto px-4 md:px-10">
                  <div className="flex flex-col md:flex-row items-center gap-16 md:gap-32">
                    
                    {/* Left: Video */}
                    <div className="w-full md:w-1/2 relative">
                      <div className="relative aspect-[4/5] overflow-hidden heritage-video-box">
                        <div className="absolute inset-0 h-[120%] -top-[10%] bg-[#111]/5 will-animate heritage-video-translate">
                          <video src={editorialVideo} autoPlay muted loop playsInline className="w-full h-full object-cover"></video>
                        </div>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 border border-[#c6a77d]/30 hidden md:block"></div>
                    </div>

                    {/* Right: Text */}
                    <div className="w-full md:w-1/2">
                      <div className="heritage-content-box">
                        <span className="text-xs uppercase tracking-[0.5em] text-[#c6a77d] mb-6 block font-sans">L'Héritage</span>
                        <h2 className="font-heading text-5xl md:text-7xl text-[#111] leading-tight mb-10 font-bold">Une Élégance <br/> Sans Frontières</h2>
                        <div className="space-y-6 max-w-lg">
                          <p className="font-sans text-lg text-[#111]/80 leading-relaxed italic">Il était une fois…<br/>une robe blanche, un champ de tournesols,<br/>et une femme qui se souvenait.</p>
                          <p className="font-sans text-base text-[#111]/60 leading-relaxed">De l’enfance, de la liberté,<br/>et du rêve d’élégance.</p>
                          <p className="font-sans text-base text-[#111]/80 leading-relaxed font-bold mt-8">Aujourd’hui, ce rêve porte un nom : <span className="font-heading tracking-tight">ZHOR</span>.<br/>Bienvenue dans son histoire.</p>
                        </div>
                        <div className="mt-12 group cursor-pointer inline-block" onClick={(e) => navigateTo('/collection', e)}>
                          <span className="text-[9px] uppercase tracking-[0.4em] font-sans border-b border-[#111]/20 pb-2 group-hover:border-[#c6a77d] transition-colors duration-500">Notre Histoire</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* Experience Section */}
              <section className="py-32 bg-[#faf8f5] border-t border-[#111]/5 experience-section">
                <div className="max-w-[1800px] mx-auto px-4 md:px-10">
                  
                  {/* Header */}
                  <header className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.5em] text-[#c6a77d] mb-4 block font-sans">Immersion</span>
                      <h2 className="font-heading text-4xl md:text-5xl text-[#111] tracking-tight font-bold">L'Expérience ZHOR</h2>
                    </div>
                    <div>
                      <a className="group flex items-center gap-4 text-[10px] uppercase tracking-widest text-[#111] hover:text-[#c6a77d] transition-colors font-sans" href="/collection" onClick={(e) => navigateTo('/collection', e)}>
                        Découvrir les pièces
                        <span className="w-12 h-px bg-[#111] group-hover:bg-[#c6a77d] transition-colors"></span>
                      </a>
                    </div>
                  </header>

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                    
                    {/* Lookbook 1 */}
                    <div className="group relative aspect-[3/4] overflow-hidden bg-[#111]/5 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-700 lookbook-item-card" onClick={(e) => navigateTo('/boutique', e)}>
                      <video src={lookbookOne} autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100"></video>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111]/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                      <div className="absolute inset-0 p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="text-[8px] uppercase tracking-[0.4em] bg-[#faf8f5]/10 backdrop-blur-md text-[#faf8f5] px-3 py-1.5 border border-[#faf8f5]/20">Editorial</span>
                          <span className="text-[8px] uppercase tracking-[0.4em] text-[#c6a77d] font-sans">Lookbook</span>
                        </div>
                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <div className="w-12 h-12 rounded-full border border-[#faf8f5]/30 flex items-center justify-center mb-6 backdrop-blur-sm group-hover:bg-[#c6a77d] group-hover:border-[#c6a77d] transition-all duration-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play text-[#faf8f5] ml-1"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path></svg>
                          </div>
                          <h3 className="font-heading text-2xl text-[#faf8f5] mb-2">Collection Automne</h3>
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c6a77d] font-sans">Regarder</p>
                            <span className="w-8 h-px bg-[#c6a77d]/50"></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lookbook 2 */}
                    <div className="group relative aspect-[3/4] overflow-hidden bg-[#111]/5 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-700 lookbook-item-card" onClick={(e) => navigateTo('/boutique', e)}>
                      <video src={lookbookTwo} autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100"></video>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111]/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                      <div className="absolute inset-0 p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="text-[8px] uppercase tracking-[0.4em] bg-[#faf8f5]/10 backdrop-blur-md text-[#faf8f5] px-3 py-1.5 border border-[#faf8f5]/20">Editorial</span>
                          <span className="text-[8px] uppercase tracking-[0.4em] text-[#c6a77d] font-sans">Lookbook</span>
                        </div>
                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <div className="w-12 h-12 rounded-full border border-[#faf8f5]/30 flex items-center justify-center mb-6 backdrop-blur-sm group-hover:bg-[#c6a77d] group-hover:border-[#c6a77d] transition-all duration-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-play text-[#faf8f5] ml-1"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path></svg>
                          </div>
                          <h3 className="font-heading text-2xl text-[#faf8f5] mb-2">Dans l'Atelier</h3>
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c6a77d] font-sans">Regarder</p>
                            <span className="w-8 h-px bg-[#c6a77d]/50"></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lookbook 3 */}
                    <div className="group relative aspect-[3/4] overflow-hidden bg-[#111]/5 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-700 lookbook-item-card" onClick={(e) => navigateTo('/boutique', e)}>
                      <video src={lookbookThree} autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100"></video>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111]/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                      <div className="absolute inset-0 p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="text-[8px] uppercase tracking-[0.4em] bg-[#faf8f5]/10 backdrop-blur-md text-[#faf8f5] px-3 py-1.5 border border-[#faf8f5]/20">Editorial</span>
                          <span className="text-[8px] uppercase tracking-[0.4em] text-[#c6a77d] font-sans">Lookbook</span>
                        </div>
                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <div className="w-12 h-12 rounded-full border border-[#faf8f5]/30 flex items-center justify-center mb-6 backdrop-blur-sm group-hover:bg-[#c6a77d] group-hover:border-[#c6a77d] transition-all duration-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-play text-[#faf8f5] ml-1"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path></svg>
                          </div>
                          <h3 className="font-heading text-2xl text-[#faf8f5] mb-2">La Boutique</h3>
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c6a77d] font-sans">Regarder</p>
                            <span className="w-8 h-px bg-[#c6a77d]/50"></span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* Nos Pièces en Solde */}
              {soldProducts.length > 0 && (
                <section className="py-32 bg-[#faf8f5] border-t border-[#111]/5 home-sold-section">
                  <div className="max-w-[1800px] mx-auto px-4 md:px-10">
                    <header className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.5em] text-[#d93838] mb-4 block font-sans">Offres Spéciales</span>
                        <h2 className="font-heading text-4xl md:text-5xl text-[#111] tracking-tight font-bold">Nos Pièces en Solde</h2>
                      </div>
                      <div>
                        <a className="group flex items-center gap-4 text-[10px] uppercase tracking-widest text-[#111] hover:text-[#c6a77d] transition-colors font-sans" href="/boutique">
                          Voir toute la boutique
                          <span className="w-12 h-px bg-[#111] group-hover:bg-[#c6a77d] transition-colors"></span>
                        </a>
                      </div>
                    </header>

                    <div className="shop-grid">
                      {soldProducts.map((p, index) => {
                        const productUrl = `/en/product/${encodeURIComponent(p.slug || p.id)}`
                        const productImages = getProductImages(p)
                        const inStock = p.isInStock ?? true

                        return (
                          <article className="shop-card" key={p.id || index} style={{ animationDelay: `${index * 80}ms` }}>
                            <div className="shop-card-image">
                              <a className="shop-card-link" href={productUrl}>
                                {productImages.length ? (
                                  <img src={productImages[0]} alt={p.name} className="w-full h-full object-cover" />
                                ) : null}
                              </a>
                              <span className="product-badge sale-badge">Sold</span>
                            </div>
                            <div className="shop-card-body">
                              <h2>
                                <a className="product-title-link" href={productUrl}>{p.name}</a>
                              </h2>
                              <span className={`product-stock-pill ${inStock ? 'in-stock' : 'rupture'}`}>
                                {inStock ? 'En stock' : 'En rupture'}
                              </span>
                              <div className="shop-card-meta">
                                {p.isSale ? (
                                  <div className="product-price-group">
                                    <span className="old-price">{formatPrice(p.oldPrice)}</span>
                                    <span className="new-price">{formatPrice(p.price)}</span>
                                  </div>
                                ) : (
                                  <span>{p.price ? formatPrice(p.price) : ''}</span>
                                )}
                              </div>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                </section>
              )}

            </main>
          )}

          {/* New Luxury Footer */}
          <footer className="bg-[#111] text-[#faf8f5] py-24 px-6 md:px-10 site-footer-new">
            <div className="max-w-[1800px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 mb-24">
                <div className="md:col-span-1">
                  <div className="font-heading tracking-tighter text-4xl mb-6 logo-brand footer-brand-title">ZHOR</div>
                  <p className="text-[#faf8f5]/60 font-sans text-sm leading-relaxed max-w-xs">
                    ZHOR | Maison de Haute Couture<br/>Style, chic &amp; qualité à votre service<br/>Livraison Rapide 🇩🇿
                  </p>
                </div>
                <div className="md:col-span-1">
                  <h4 className="text-[10px] uppercase tracking-[0.4em] text-[#c6a77d] mb-8 font-bold">Navigation</h4>
                  <ul className="space-y-4 list-none p-0 footer-nav-links">
                    <li><a className="text-sm font-sans hover:text-[#c6a77d] transition-colors" href="/" onClick={(e) => navigateTo('/', e)}>Accueil</a></li>
                    <li><a className="text-sm font-sans hover:text-[#c6a77d] transition-colors" href="/boutique" onClick={(e) => navigateTo('/boutique', e)}>Boutique</a></li>
                    <li><a className="text-sm font-sans hover:text-[#c6a77d] transition-colors" href="/collection" onClick={(e) => navigateTo('/collection', e)}>Collections</a></li>
                    <li><a className="text-sm font-sans hover:text-[#c6a77d] transition-colors" href="/contact" onClick={(e) => navigateTo('/contact', e)}>Contact</a></li>
                  </ul>
                </div>
                <div className="md:col-span-1">
                  <h4 className="text-[10px] uppercase tracking-[0.4em] text-[#c6a77d] mb-8 font-bold">Contact</h4>
                  <ul className="space-y-4 font-sans text-sm text-[#faf8f5]/85 list-none p-0 footer-contact-details">
                    <li><a href="https://maps.google.com/?q=Mostaganem,Algeria" target="_blank" rel="noopener noreferrer" className="hover:text-[#c6a77d] transition-colors">Centre Ville, Mostaganem, Algérie</a></li>
                    <li><a href="mailto:contact@zhor.dz" className="hover:text-[#c6a77d] transition-colors">contact@zhor.dz</a></li>
                    <li><a href="tel:+213555000000" className="hover:text-[#c6a77d] transition-colors">+213 555 00 00 00</a></li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#faf8f5]/10 gap-8">
                <p className="text-[9px] uppercase tracking-widest text-[#faf8f5]/40 font-sans">© {new Date().getFullYear()} <span className="font-heading tracking-tight">ZHOR</span>. TOUS DROITS RÉSERVÉS.</p>
                <div className="flex gap-8 text-[9px] uppercase tracking-widest text-[#faf8f5]/40 font-sans footer-bottom-links">
                  <a className="hover:text-white transition-colors" href="#">Politique de Confidentialité</a>
                  <a className="hover:text-white transition-colors" href="#">Mentions Légales</a>
                </div>
              </div>
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
