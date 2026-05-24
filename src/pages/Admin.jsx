import React, { useContext } from 'react'
import '../App.css'
import { AuthContext } from '../context/AuthContext'
import AdminPanel from '../components/AdminPanel'

function Admin() {
  const { isAuthenticated, logout } = useContext(AuthContext)

  if (!isAuthenticated) return null

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin</h1>
        <div>
          <button onClick={logout} className="shop-card-btn">Logout</button>
        </div>
      </div>

      <AdminPanel />
    </div>
  )
}

function AdminProduct({ product, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [state, setState] = useState({ ...product, file: null, removeImage: false })

  useEffect(() => setState({ ...product, file: null, removeImage: false }), [product])

  async function save() {
    await onUpdate(product.id, state)
    setEditing(false)
  }

  return (
    <article className="shop-card">
      <div className="shop-card-image">
        {state.imageUrl ? <img src={state.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      </div>
      <div className="shop-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <h2>{product.title}</h2>
          <div>
            <button className="shop-card-btn" onClick={() => setEditing((s) => !s)}>{editing ? 'Annuler' : 'Modifier'}</button>
            <button className="shop-card-btn" onClick={() => onDelete(product.id, product.imagePath)} style={{ marginLeft: 8 }}>Suppr</button>
          </div>
        </div>
        {editing ? (
          <div>
            <label>
              Titre
              <input value={state.title} onChange={(e) => setState({ ...state, title: e.target.value })} />
            </label>
            <label>
              Description
              <textarea value={state.description} onChange={(e) => setState({ ...state, description: e.target.value })} />
            </label>
            <label>
              Prix
              <input value={state.price} onChange={(e) => setState({ ...state, price: e.target.value })} />
            </label>
            <label>
              Image
              <input type="file" accept="image/*" onChange={(e) => setState({ ...state, file: e.target.files[0] })} />
            </label>
            <div style={{ marginTop: 8 }}>
              <button className="hero-button" onClick={save}>Enregistrer</button>
            </div>
          </div>
        ) : (
          <>
            <p style={{ color: '#645349' }}>{product.description}</p>
            <div className="shop-card-meta">
              <span>{product.price ? `€${product.price}` : ''}</span>
              <button className="shop-card-btn">Voir</button>
            </div>
          </>
        )}
      </div>
    </article>
  )
}

export default Admin
