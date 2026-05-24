import React from 'react'
import '../App.css'

function Contact() {
  return (
    <main className="shop-preview boutique-page contact-page" aria-label="Contact page">
      <div className="hero-welcome">
        <div>
          <p className="hero-subtitle">Contact</p>
          <h1 className="hero-title">Contactez la boutique</h1>
        </div>
        <p className="hero-description">
          Nous sommes là pour vous aider. Voici les informations pour nous joindre.
        </p>

        <section className="contact-card">
          <div className="contact-row">
            <strong>Adresse</strong>
            <span>123 Rue de la Mode, Alger, Algérie</span>
          </div>
          <div className="contact-row">
            <strong>Téléphone</strong>
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
