import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getRestaurant, createRestaurant, updateRestaurant } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const LEAD_STATUSES = ['COLD', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED']

const EMPTY_FORM = {
  name: '', address: '', city: '', state: '', country: 'USA',
  phone: '', email: '', website: '', cuisine: '',
  rating: '3.0', opening_hours: '', notes: '', lead_status: 'COLD'
}

// Format phone number to (XXX) XXX-XXXX
function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
}

export default function RestaurantFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      getRestaurant(id)
        .then(res => {
          const r = res.data
          setForm({
            name: r.name || '', address: r.address || '', city: r.city || '',
            state: r.state || '', country: r.country || 'USA', phone: r.phone || '',
            email: r.email || '', website: r.website || '', cuisine: r.cuisine || '',
            rating: String(r.rating || '3.0'), opening_hours: r.opening_hours || '',
            notes: r.notes || '', lead_status: r.lead_status || 'COLD'
          })
        })
        .finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const handleChange = (field) => (e) => {
    let value = e.target.value
    if (field === 'phone') value = formatPhone(value)
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    // Client side email validation
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setSaving(false)
      return toast.error('Please enter a valid email address')
    }

    try {
      const payload = { ...form, rating: parseFloat(form.rating) }
      if (isEdit) {
        await updateRestaurant(id, payload)
        toast.success('Restaurant updated successfully')
        navigate(`/restaurants/${id}`)
      } else {
        const res = await createRestaurant(payload)
        toast.success('Restaurant created successfully')
        navigate(`/restaurants/${res.data.id}`)
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      toast.error(typeof detail === 'string' ? detail : 'Failed to save. Check all required fields.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="flex-center" style={{ padding: 120 }}>
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></div>
      </div>
    </>
  )

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ maxWidth: 720, paddingTop: 32, paddingBottom: 64 }}>
        <Link to={isEdit ? `/restaurants/${id}` : '/'} className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }}>← Back</Link>

        <div className="page-header">
          <h1>{isEdit ? 'Edit Restaurant' : 'Add Restaurant'}</h1>
          <p>{isEdit ? 'Update restaurant details below' : 'Fill in the details to add a new restaurant'}</p>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Field label="Restaurant Name *" value={form.name} onChange={handleChange('name')} required placeholder="The Spice Route" fullWidth />
            <Field label="Cuisine *" value={form.cuisine} onChange={handleChange('cuisine')} required placeholder="Indian" />
            <Field label="Rating (0-5) *" type="number" value={form.rating} onChange={handleChange('rating')} required min="0" max="5" step="0.1" />
            <div className="form-group">
              <label className="form-label">Lead Status</label>
              <select className="form-select" value={form.lead_status} onChange={handleChange('lead_status')}>
                {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Field label="Address *" value={form.address} onChange={handleChange('address')} required placeholder="123 Main St" />
            <Field label="City *" value={form.city} onChange={handleChange('city')} required placeholder="Atlanta" />
            <Field label="State *" value={form.state} onChange={handleChange('state')} required placeholder="GA" />
            <Field label="Country *" value={form.country} onChange={handleChange('country')} required placeholder="USA" />
            <Field label="Phone" value={form.phone} onChange={handleChange('phone')} placeholder="404-555-0100" />
            <Field label="Email" type="email" value={form.email} onChange={handleChange('email')} placeholder="owner@restaurant.com" />
            <Field label="Website" value={form.website} onChange={handleChange('website')} placeholder="https://restaurant.com" fullWidth />
            <Field label="Opening Hours" value={form.opening_hours} onChange={handleChange('opening_hours')} placeholder="Mon-Fri 11am-10pm" fullWidth />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={form.notes} onChange={handleChange('notes')} placeholder="Internal notes about this restaurant..." rows={3} />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Link to={isEdit ? `/restaurants/${id}` : '/'} className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Restaurant')}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

function Field({ label, fullWidth, ...props }) {
  return (
    <div className="form-group" style={fullWidth ? { gridColumn: '1 / -1' } : {}}>
      <label className="form-label">{label}</label>
      <input className="form-input" {...props} />
    </div>
  )
}
