import { useState, useEffect } from 'react'
import { getMyTickets, getAllTickets, createTicket, updateTicketStatus } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

export default function HelpdeskPage() {
  const { user } = useAuth()
  
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // New ticket form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [showForm, setShowForm] = useState(false)

  const fetchTickets = async () => {
    try {
      const res = user.role === 'ADMIN' ? await getAllTickets() : await getMyTickets()
      setTickets(res.data)
    } catch (err) {
      toast.error('Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchTickets()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (title.length < 5 || description.length < 10) {
      return toast.error('Please provide a more detailed title and description.')
    }
    
    setSubmitting(true)
    try {
      await createTicket({ title, description, priority })
      toast.success('Support ticket submitted successfully!')
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setShowForm(false)
      fetchTickets()
    } catch (err) {
      toast.error('Failed to submit ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus)
      toast.success('Ticket status updated')
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
    } catch (err) {
      toast.error('Failed to update ticket status')
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      OPEN: 'var(--primary-light)',
      IN_PROGRESS: '#f59e0b',
      RESOLVED: 'var(--success)',
      CLOSED: 'var(--text-secondary)'
    }
    return (
      <span style={{ 
        background: `${colors[status]}22`, 
        color: colors[status], 
        padding: '4px 10px', 
        borderRadius: 20, 
        fontSize: 11, 
        fontWeight: 600,
        border: `1px solid ${colors[status]}44`
      }}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  const getPriorityBadge = (prio) => {
    const colors = {
      LOW: '#3b82f6',
      MEDIUM: '#f59e0b',
      HIGH: '#ef4444',
      URGENT: '#dc2626'
    }
    return <span style={{ color: colors[prio], fontSize: 12, fontWeight: 600 }}>{prio}</span>
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
      <div className="page-wrapper" style={{ maxWidth: 1000, paddingTop: 32, paddingBottom: 64 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>Support Helpdesk</h1>
            <p>{user.role === 'ADMIN' ? 'Manage customer support requests' : 'Submit and track your support requests'}</p>
          </div>
          {user.role === 'USER' && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '＋ New Ticket'}
            </button>
          )}
        </div>

        {/* User New Ticket Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 32, border: '1px solid var(--primary)' }}>
            <h3 style={{ marginBottom: 16 }}>Submit a Ticket</h3>
            <div className="form-group">
              <label className="form-label">Subject Title *</label>
              <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g., Cannot access AI summaries" required />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-textarea" rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Please describe your issue in detail..." required />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        )}

        {/* Ticket List */}
        <div className="card">
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>
            {user.role === 'ADMIN' ? 'All Support Tickets' : 'My Tickets'} ({tickets.length})
          </h2>
          
          {tickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              No tickets found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {tickets.map(ticket => (
                <div key={ticket.id} style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 12, 
                  padding: 20 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6 }}>
                        <h3 style={{ fontSize: 16, margin: 0 }}>{ticket.title}</h3>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 16 }}>
                        <span>Ticket #{ticket.id}</span>
                        <span>•</span>
                        <span>Priority: {getPriorityBadge(ticket.priority)}</span>
                        <span>•</span>
                        <span>Date: {new Date(ticket.created_at).toLocaleDateString()}</span>
                        {user.role === 'ADMIN' && (
                          <>
                            <span>•</span>
                            <span style={{ color: 'var(--primary-light)' }}>User: {ticket.user_email}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Admin Status Controls */}
                    {user.role === 'ADMIN' && (
                      <select 
                        className="form-select" 
                        style={{ width: 'auto', padding: '4px 12px', fontSize: 13 }}
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    )}
                  </div>
                  
                  <div style={{ 
                    background: 'rgba(0,0,0,0.2)', 
                    padding: 16, 
                    borderRadius: 8, 
                    fontSize: 14, 
                    color: 'var(--text-primary)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {ticket.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  )
}
