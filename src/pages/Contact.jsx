import '../App.css'

function Contact() {
  const orderParams = new URLSearchParams(window.location.search)
  const product = orderParams.get('product')
  const color = orderParams.get('color')
  const size = orderParams.get('size')
  const quantity = orderParams.get('quantity')
  const reference = orderParams.get('reference')

  return (
    <main className="shop-preview boutique-page contact-page" aria-label="Page de contact">
      <div className="hero-welcome">
        <div>
          <p className="hero-subtitle">Contact</p>
          <h1 className="hero-title">Contactez la boutique</h1>
        </div>
        <p className="hero-description">
          Nous sommes là pour vous aider. Voici les informations pour nous joindre.
        </p>

        {product ? (
          <section className="contact-order-card" aria-label="Demande d'achat">
            <p className="boutique-subtitle">Acheter maintenant</p>
            <h2>{product}</h2>
            <div className="contact-order-details">
              {color ? <span>Couleur: {color}</span> : null}
              {size ? <span>Taille: {size}</span> : null}
              {quantity ? <span>Quantité : {quantity}</span> : null}
              {reference ? <span>Référence : {reference}</span> : null}
            </div>
          </section>
        ) : null}

        <section className="contact-card">
          <div className="contact-row">
            <strong>Adresse</strong>
            <span>Centre Ville, Mostaganem, Algérie</span>
          </div>
          <div className="contact-row">
            <strong>Téléphone</strong>
            <span>+213 555 00 00 00</span>
          </div>
          <div className="contact-row">
            <strong>Email</strong>
            <span>contact@zhor.dz</span>
          </div>
          <div className="contact-row">
            <strong>Horaires</strong>
            <span>Samedi - Jeudi : 10h00 - 19h00</span>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Contact
