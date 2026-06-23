import { useState, useEffect } from 'react'
import { subscribeComments, deleteComment } from '../services/comments'
import './AdminComments.css'

export default function AdminComments() {
  const [comments, setComments] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const unsubscribe = subscribeComments((list) => setComments(list))
    return () => unsubscribe()
  }, [])

  const showAlert = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Etes-vous sur de vouloir supprimer ce commentaire ?')) return

    try {
      await deleteComment(commentId)
      showAlert('success', 'Commentaire supprime avec succes.')
    } catch (error) {
      console.error('Error deleting comment:', error)
      showAlert('error', `Erreur: ${error.message}`)
    }
  }

  const filteredComments = comments.filter((comment) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      comment.clientName?.toLowerCase().includes(searchLower) ||
      comment.email?.toLowerCase().includes(searchLower) ||
      comment.message?.toLowerCase().includes(searchLower)
    )
  })

  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sortBy === 'newest') {
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    } else if (sortBy === 'oldest') {
      return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
    } else if (sortBy === 'name-asc') {
      return (a.clientName || '').localeCompare(b.clientName || '')
    } else if (sortBy === 'name-desc') {
      return (b.clientName || '').localeCompare(a.clientName || '')
    }
    return 0
  })

  return (
    <section className="admin-comments-card">
      <div className="comments-header-section">
        <h2>Commentaires des clients</h2>
        <span className="comment-count">{sortedComments.length} au total</span>
      </div>

      {message.text && <div className={`alert-message ${message.type}`}>{message.text}</div>}

      {comments.length > 0 && (
        <div className="comments-toolbar">
          <div className="search-box">
            <span aria-hidden="true">Rechercher</span>
            <input
              type="text"
              placeholder="Rechercher par nom, email ou message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="clear-search"
                aria-label="Effacer la recherche"
              >
                X
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
            aria-label="Trier les commentaires"
          >
            <option value="newest">Plus recent</option>
            <option value="oldest">Plus ancien</option>
            <option value="name-asc">A-Z Nom</option>
            <option value="name-desc">Z-A Nom</option>
          </select>
        </div>
      )}

      {sortedComments.length === 0 ? (
        <div className="empty-comments">
          {searchQuery ? (
            <>
              <p>Aucun commentaire ne correspond a votre recherche.</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="reset-filters-btn"
              >
                Reinitialiser la recherche
              </button>
            </>
          ) : (
            <>
              <p>Aucun commentaire pour l'instant. Les commentaires s'afficheront ici.</p>
            </>
          )}
        </div>
      ) : (
        <div className="comments-list">
          {sortedComments.map((comment) => {
            const date = comment.createdAt?.toDate?.()
              ? new Date(comment.createdAt.toDate()).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Date inconnue'

            return (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <div className="comment-meta">
                    <h3 className="comment-name">{comment.clientName || 'Anonyme'}</h3>
                    <span className="comment-email">{comment.email || 'N/A'}</span>
                  </div>
                  <span className="comment-date">{date}</span>
                </div>

                <div className="comment-body">
                  <p className="comment-message">{comment.message}</p>
                </div>

                <div className="comment-actions">
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    className="delete-comment-btn"
                    aria-label="Supprimer le commentaire"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
