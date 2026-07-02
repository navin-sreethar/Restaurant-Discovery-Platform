import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getRestaurant, deleteRestaurant, generateAI, customAIPrompt } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const AI_TYPES = [
  { key: 'summary', label: '📄 Summary', desc: 'General overview' },
  { key: 'sentiment', label: '💬 Sentiment', desc: 'Customer sentiment analysis' },
  { key: 'marketing', label: '📣 Marketing', desc: 'Promo copy' },
  { key: 'outreach', label: '✉️ Outreach', desc: 'Cold email template' },
]

export default function RestaurantDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Standard AI State
  const [aiResults, setAiResults] = useState({})
  const [aiLoading, setAiLoading] = useState('')
  
  // Custom AI State
  const [customPrompt, setCustomPrompt] = useState('')
  const [customResult, setCustomResult] = useState(null)
  const [customLoading, setCustomLoading] = useState(false)
  
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    getRestaurant(id)
      .then(res => setRestaurant(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleAI = async (type) => {
    setAiLoading(type)
    try {
      const res = await generateAI(id, type)
      setAiResults(prev => ({ ...prev, [type]: { result: res.data.result, cached: res.data.cached } }))
      toast.success(`${AI_TYPES.find(t => t.key === type).label.split(' ')[1]} generated!`)
    } catch (err) {
      const detail = err.response?.data?.detail || 'AI request failed'
      toast.error(detail)
      setAiResults(prev => ({ ...prev, [type]: { result: `Error: ${detail}`, cached: false } }))
    } finally {
      setAiLoading('')
    }
  }

  const handleCustomPrompt = async (e) => {
    e.preventDefault()
    if (customPrompt.length < 10) return toast.error('Prompt must be at least 10 characters')
    
    setCustomLoading(true)
    try {
      const res = await customAIPrompt(id, customPrompt)
      setCustomResult({ prompt: customPrompt, result: res.data.result })
      setCustomPrompt('')
      toast.success('Custom answer generated!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate custom answer')
    } finally {
      setCustomLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteRestaurant(id)
      toast.success('Restaurant deleted successfully')
      navigate('/')
    } catch (err) {
      toast.error('Failed to delete restaurant')
    }
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="flex-center" style={{ padding: '120px' }}>
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></div>
      </div>
    </>
  )

  if (!restaurant) return null

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ maxWidth: 900, paddingTop: 32, paddingBottom: 64 }}>

        {/* Back link */}
        <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }}>← Back to Restaurants</Link>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {restaurant.name}
            </h1>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="rating-stars">★ {restaurant.rating}</span>
              <span className={`lead-badge ${restaurant.lead_status}`}>{restaurant.lead_status}</span>
            </div>
          </div>
          {user?.role === 'ADMIN' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to={`/restaurants/${id}/edit`} className="btn btn-secondary btn-sm">✏️ Edit</Link>
              <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(true)}>🗑️ Delete</button>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px 32px' }}>
            {restaurant.cuisine && <InfoRow label="Cuisine" value={restaurant.cuisine} />}
            <InfoRow label="Address" value={`${restaurant.address}, ${restaurant.city}, ${restaurant.state}, ${restaurant.country}`} />
            {restaurant.phone && <InfoRow label="Phone" value={restaurant.phone} />}
            {restaurant.email && <InfoRow label="Email" value={restaurant.email} />}
            {restaurant.opening_hours && <InfoRow label="Opening Hours" value={restaurant.opening_hours} />}
            {restaurant.website && <InfoRow label="Website" value={restaurant.website} link />}
          </div>
          {restaurant.notes && (
            <>
              <hr className="divider" />
              <div>
                <div className="form-label">Notes</div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>{restaurant.notes}</p>
              </div>
            </>
          )}
        </div>

        {/* AI Section */}
        <div className="ai-section">
          <h3>🤖 AI Insights <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>Powered by Gemini 2.5 Flash</span></h3>
          <div className="ai-buttons">
            {AI_TYPES.map(({ key, label, desc }) => (
              <button
                key={key}
                className="btn btn-secondary btn-sm"
                onClick={() => handleAI(key)}
                disabled={!!aiLoading}
                title={desc}
              >
                {aiLoading === key ? <span className="spinner"></span> : null}
                {label}
                {aiResults[key]?.cached && <span style={{ fontSize: 10, color: 'var(--success)', marginLeft: 4 }}>cached</span>}
              </button>
            ))}
          </div>

          {aiLoading && (
            <div className="ai-loading">
              <div className="spinner"></div>
              Generating AI content...
            </div>
          )}

          {Object.entries(aiResults).map(([type, data]) => (
            <div key={type} style={{ marginBottom: 16 }}>
              <div className="form-label" style={{ marginBottom: 8 }}>
                {AI_TYPES.find(t => t.key === type)?.label}
                {data.cached && <span style={{ marginLeft: 8, color: 'var(--success)', fontSize: 11 }}>✓ cached</span>}
              </div>
              <div className="ai-result">{data.result}</div>
            </div>
          ))}

          {/* Custom Prompt Form */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <h4 style={{ marginBottom: 12 }}>Ask a Custom Question</h4>
            <form onSubmit={handleCustomPrompt} style={{ display: 'flex', gap: 12 }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., What are the best marketing channels for this specific location?"
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={customLoading}>
                {customLoading ? <span className="spinner"></span> : 'Ask AI'}
              </button>
            </form>
            
            {customResult && (
              <div style={{ marginTop: 16 }}>
                <div className="form-label" style={{ marginBottom: 8 }}>Q: {customResult.prompt}</div>
                <div className="ai-result">{customResult.result}</div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 400 }}>
              <h2 style={{ marginBottom: 12 }}>Delete Restaurant?</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                This will permanently delete <strong>{restaurant.name}</strong> and all its AI summaries. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function InfoRow({ label, value, link }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div className="form-label">{label}</div>
      {link
        ? <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-light)', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{value}</a>
        : <p style={{ color: 'var(--text-primary)', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</p>
      }
    </div>
  )
}
