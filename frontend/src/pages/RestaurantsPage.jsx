import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getRestaurants } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const LEAD_STATUSES = ['COLD', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED']

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Search/filter state
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [leadStatus, setLeadStatus] = useState('')
  const [minRating, setMinRating] = useState('')
  const [page, setPage] = useState(1)

  const { user } = useAuth()

  const fetchRestaurants = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 12 }
      if (search) params.name = search
      if (city) params.city = city
      if (cuisine) params.cuisine = cuisine
      if (leadStatus) params.lead_status = leadStatus
      if (minRating) params.min_rating = minRating

      const res = await getRestaurants(params)
      setRestaurants(res.data.data)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } catch (err) {
      console.error('Failed to load restaurants', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, city, cuisine, leadStatus, minRating])

  useEffect(() => { fetchRestaurants() }, [fetchRestaurants])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchRestaurants()
  }

  const clearFilters = () => {
    setSearch(''); setCity(''); setCuisine('')
    setLeadStatus(''); setMinRating(''); setPage(1)
  }

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Restaurants</h1>
            <p>{total} restaurants found</p>
          </div>
          {user?.role === 'ADMIN' && (
            <Link to="/restaurants/new" className="btn btn-primary">+ Add Restaurant</Link>
          )}
        </div>

        {/* Search & Filter Bar */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            className="form-input"
            placeholder="🔍 Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <input
            className="form-input"
            placeholder="City"
            value={city}
            onChange={e => setCity(e.target.value)}
            style={{ maxWidth: '150px' }}
          />
          <input
            className="form-input"
            placeholder="Cuisine"
            value={cuisine}
            onChange={e => setCuisine(e.target.value)}
            style={{ maxWidth: '150px' }}
          />
          <select
            className="form-select"
            value={leadStatus}
            onChange={e => setLeadStatus(e.target.value)}
            style={{ maxWidth: '160px' }}
          >
            <option value="">All Statuses</option>
            {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            className="form-input"
            type="number"
            placeholder="Min Rating"
            min="0" max="5" step="0.1"
            value={minRating}
            onChange={e => setMinRating(e.target.value)}
            style={{ maxWidth: '120px' }}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
        </form>

        {/* Restaurant Grid */}
        {loading ? (
          <div className="flex-center" style={{ padding: '80px' }}>
            <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>No restaurants found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="restaurants-grid">
            {restaurants.map(r => (
              <Link key={r.id} to={`/restaurants/${r.id}`} className="restaurant-card">
                <div className="restaurant-card-header">
                  <div>
                    <div className="restaurant-name">{r.name}</div>
                    <div className="restaurant-cuisine">{r.cuisine}</div>
                  </div>
                  <span className={`lead-badge ${r.lead_status}`}>{r.lead_status}</span>
                </div>
                <div className="restaurant-meta">
                  <span className="rating-stars">★ {r.rating}</span>
                  <span>📍 {r.city}, {r.state}</span>
                  {r.phone && <span>📞 {r.phone}</span>}
                </div>
                {r.notes && (
                  <p className="text-sm text-muted" style={{ marginTop: '10px', lineHeight: 1.5 }}>
                    {r.notes.length > 80 ? r.notes.slice(0, 80) + '...' : r.notes}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>›</button>
          </div>
        )}
      </div>
    </>
  )
}
