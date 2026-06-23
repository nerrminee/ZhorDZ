import { useEffect, useState } from 'react'
import { addComment } from '../services/comments'
import { subscribeCurrentClient } from '../services/clients'
import './CommentsSection.css'

export default function CommentsSection() {
  const [currentClient, setCurrentClient] = useState(null)
  const [isCheckingClient, setIsCheckingClient] = useState(true)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', text: '' })

  useEffect(() => {
    const unsubscribe = subscribeCurrentClient((user) => {
      setCurrentClient(user)
      setIsCheckingClient(false)
    })

    return () => unsubscribe()
  }, [])

  const showAlert = (type, text) => {
    setFeedback({ type, text })
    setTimeout(() => setFeedback({ type: '', text: '' }), 4000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentClient) {
      window.location.href = '/compte'
      return
    }

    if (!message.trim()) {
      showAlert('error', 'Veuillez ecrire votre message.')
      return
    }

    setIsSubmitting(true)

    try {
      await addComment(currentClient, message)
      setMessage('')
      showAlert('success', 'Merci pour votre message. Il a ete envoye avec succes.')
    } catch (error) {
      console.error('Error submitting comment:', error)
      showAlert('error', `Erreur: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="comments-section">
      <div className="max-w-[1800px] mx-auto px-4 md:px-10">
        <header className="comments-header">
          <div>
            <span className="text-[10px] uppercase tracking-[0.5em] text-[#c6a77d] mb-4 block font-sans">Votre Avis</span>
            <h2 className="font-heading text-4xl md:text-5xl text-[#111] tracking-tight font-bold">Partagez Votre Experience</h2>
          </div>
          <p className="text-[#111]/70 font-sans text-sm md:text-base max-w-lg mt-4 md:mt-0">
            Nous aimerions entendre votre avis sur nos produits et services.
          </p>
        </header>

        <div className="comments-form-card">
          {!isCheckingClient && !currentClient ? (
            <div className="signin-required">
              <h3>Connectez-vous pour laisser un avis</h3>
              <p>Les commentaires sont reserves aux clients connectes.</p>
              <a href="/compte">Se connecter ou creer un compte</a>
            </div>
          ) : null}

          {feedback.text && (
            <div className={`feedback-message ${feedback.type}`}>
              {feedback.text}
            </div>
          )}

          {currentClient ? (
            <form onSubmit={handleSubmit} className="comments-form">
              <div className="signed-comment-author">
                <span>Connecte en tant que</span>
                <strong>{currentClient.displayName || currentClient.email}</strong>
              </div>

              <div className="form-group">
                <label htmlFor="comment-message">Votre Message</label>
                <textarea
                  id="comment-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Partagez votre experience avec ZHOR..."
                  rows="6"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi...' : 'Envoyer le Message'}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  )
}
