import '../App.css'

function Contact() {
  const orderParams = new URLSearchParams(window.location.search)
  const product = orderParams.get('product')
  const color = orderParams.get('color')
  const size = orderParams.get('size')
  const quantity = orderParams.get('quantity')
  const reference = orderParams.get('reference')

  return (
    <main className="shop-preview boutique-page contact-page" aria-label="Contact page">
      <div className="hero-welcome">
        <div>
          <p className="hero-subtitle">Contact</p>
          <h1 className="hero-title">Contactez la boutique</h1>
        </div>
        <p className="hero-description">
          Nous sommes la pour vous aider. Voici les informations pour nous joindre.
        </p>

        {product ? (
          <section className="contact-order-card" aria-label="Purchase request">
            <p className="boutique-subtitle">Buy now</p>
            <h2>{product}</h2>
            <div className="contact-order-details">
              {color ? <span>Couleur: {color}</span> : null}
              {size ? <span>Taille: {size}</span> : null}
              {quantity ? <span>Quantite: {quantity}</span> : null}
              {reference ? <span>Reference: {reference}</span> : null}
            </div>
          </section>
        ) : null}

        <section className="contact-card">
          <div className="contact-row">
            <strong>Adresse</strong>
            <span>123 Rue de la Mode, Alger, Algerie</span>
          </div>
          <div className="contact-row">
            <strong>Telephone</strong>
            <span>+213 21 234 567</span>
          </div>
          <div className="contact-row">
            <strong>Email</strong>
            <span>contact@zhordz.com</span>
          </div>
          <div className="contact-row">
            <strong>Horaires</strong>
            <span>Lundi - Vendredi : 10h00 - 19h00</span>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Contact
