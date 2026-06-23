import { useEffect, useState } from 'react'
import {
  loginClient,
  logoutClient,
  registerClient,
  subscribeCurrentClient,
} from '../services/clients'
import './ClientAccount.css'

function ClientAccount() {
  const [mode, setMode] = useState('login')
  const [currentClient, setCurrentClient] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const unsubscribe = subscribeCurrentClient((user) => setCurrentClient(user))
    return () => unsubscribe()
  }, [])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
  }

  const validateRegister = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
      return 'Veuillez remplir tous les champs.'
    }

    if (form.password.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caracteres.'
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage({ type: '', text: '' })

    if (mode === 'register') {
      const validationError = validateRegister()
      if (validationError) {
        showMessage('error', validationError)
        return
      }
    } else if (!form.email.trim() || !form.password) {
      showMessage('error', 'Veuillez entrer votre email et votre mot de passe.')
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'register') {
        await registerClient(form)
        showMessage('success', 'Compte cree avec succes.')
      } else {
        await loginClient(form.email, form.password)
        showMessage('success', 'Connexion reussie.')
      }
      setForm({ name: '', email: '', phone: '', password: '' })
    } catch (error) {
      console.error('Client account error:', error)
      showMessage('error', getFriendlyAuthError(error.code) || error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    setIsSubmitting(true)
    try {
      await logoutClient()
      showMessage('success', 'Vous etes deconnecte.')
    } catch (error) {
      showMessage('error', error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (currentClient) {
    return (
      <main className="client-account-page">
        <section className="client-account-panel">
          <span className="client-account-eyebrow">Compte client</span>
          <h1>Bienvenue {currentClient.displayName || 'chez ZHOR'}</h1>
          <p>Vous etes connecte avec {currentClient.email}.</p>
          {message.text ? <div className={`client-message ${message.type}`}>{message.text}</div> : null}
          <div className="client-account-actions">
            <a className="client-primary-link" href="/boutique">Voir la boutique</a>
            <button type="button" onClick={handleLogout} disabled={isSubmitting}>
              Deconnexion
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="client-account-page">
      <section className="client-account-panel">
        <span className="client-account-eyebrow">Compte client</span>
        <h1>{mode === 'register' ? 'Creer un compte' : 'Connexion'}</h1>
        <p>
          {mode === 'register'
            ? 'Creez votre compte avec votre email et votre numero de telephone.'
            : 'Connectez-vous a votre compte client ZHOR.'}
        </p>

        <div className="client-account-tabs" role="tablist" aria-label="Compte client">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Connexion
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Inscription
          </button>
        </div>

        {message.text ? <div className={`client-message ${message.type}`}>{message.text}</div> : null}

        <form className="client-account-form" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <>
              <label htmlFor="client-name">Nom complet</label>
              <input
                id="client-name"
                type="text"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                autoComplete="name"
              />

              <label htmlFor="client-phone">Telephone</label>
              <input
                id="client-phone"
                type="tel"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                autoComplete="tel"
              />
            </>
          ) : null}

          <label htmlFor="client-email">Email</label>
          <input
            id="client-email"
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            autoComplete="email"
          />

          <label htmlFor="client-password">Mot de passe</label>
          <input
            id="client-password"
            type="password"
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Veuillez patienter...' : mode === 'register' ? 'Creer le compte' : 'Se connecter'}
          </button>
        </form>
      </section>
    </main>
  )
}

function getFriendlyAuthError(code) {
  const messages = {
    'auth/email-already-in-use': 'Cet email est deja utilise.',
    'auth/invalid-email': 'Veuillez entrer un email valide.',
    'auth/invalid-credential': 'Email ou mot de passe incorrect.',
    'auth/weak-password': 'Le mot de passe est trop faible.',
  }

  return messages[code]
}

export default ClientAccount
