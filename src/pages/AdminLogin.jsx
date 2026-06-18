import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContextValue'
import '../components/AdminPanel.css'
import backgroundImage from '../assets/backgroud.jpg'

function AdminLogin() {
  const { login } = useContext(AuthContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const res = login(username, password)
    if (res.ok) {
      window.location.href = '/admin'
    } else {
      setError(res.message || 'Échec de la connexion')
    }
  }

  return (
    <div className="admin-login">
      <section className="admin-login-hero" aria-label="Connexion administrateur ZHOR">
        <div className="admin-login-media" aria-hidden="true">
          <img src={backgroundImage} alt="" />
        </div>

        <div className="admin-login-brand">
          <a className="admin-login-logo" href="/">ZHOR</a>
          <span>Maison de Couture</span>
        </div>

        <div className="admin-login-copy">
          <p>Atelier privé</p>
          <h1>Console</h1>
          <span>Gérez les produits, les commandes et les détails de la boutique avec la même précision sereine que la vitrine.</span>
        </div>

        <div className="card admin-login-panel">
          <span className="admin-eyebrow">Accès sécurisé</span>
          <h2>Connexion Admin</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Nom d'utilisateur
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez le nom d'utilisateur"
                autoComplete="username"
              />
            </label>

            <label>
              Mot de passe
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez le mot de passe"
                autoComplete="current-password"
              />
            </label>

            {error ? <p className="admin-login-error">{error}</p> : null}

            <div className="actions">
              <button className="hero-button" type="submit">Entrer dans la console</button>
            </div>
          </form>
          <a className="admin-login-store-link" href="/">Retour à la boutique</a>
        </div>
      </section>
    </div>
  )
}

export default AdminLogin
