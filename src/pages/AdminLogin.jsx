import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContextValue'

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
      <div className="card">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
          </label>

          {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

          <div className="actions">
            <button className="hero-button" type="submit">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
