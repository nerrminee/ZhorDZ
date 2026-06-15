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
      setError(res.message || 'Login failed')
    }
  }

  return (
    <div className="admin-login">
      <section className="admin-login-hero" aria-label="ZHOR admin sign in">
        <div className="admin-login-media" aria-hidden="true">
          <img src={backgroundImage} alt="" />
        </div>

        <div className="admin-login-brand">
          <a className="admin-login-logo" href="/">ZHOR</a>
          <span>Maison de Couture</span>
        </div>

        <div className="admin-login-copy">
          <p>Atelier prive</p>
          <h1>Console</h1>
          <span>Manage products, orders, and boutique details with the same calm precision as the storefront.</span>
        </div>

        <div className="card admin-login-panel">
          <span className="admin-eyebrow">Secure access</span>
          <h2>Admin Login</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Username
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </label>

            {error ? <p className="admin-login-error">{error}</p> : null}

            <div className="actions">
              <button className="hero-button" type="submit">Enter console</button>
            </div>
          </form>
          <a className="admin-login-store-link" href="/">Back to boutique</a>
        </div>
      </section>
    </div>
  )
}

export default AdminLogin
