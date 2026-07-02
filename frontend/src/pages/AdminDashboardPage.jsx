import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPendingUsers, getAllUsers, approveUser, deleteUser } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [pending, setPending] = useState([])
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/')
      return
    }

    const fetchData = async () => {
      try {
        const [pendingRes, allRes] = await Promise.all([
          getPendingUsers(),
          getAllUsers()
        ])
        setPending(pendingRes.data)
        setAll(allRes.data)
      } catch (err) {
        console.error("Failed to load users")
      } finally {
        setLoading(false)
      }
    }
    
    if (user) fetchData()
  }, [user, navigate])

  const handleAction = async (userId, action) => {
    try {
      if (action === 'approve') {
        await approveUser(userId, true)
      } else if (action === 'reject' || action === 'delete') {
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return
        await deleteUser(userId)
      }
      
      // Refresh
      const [pendingRes, allRes] = await Promise.all([getPendingUsers(), getAllUsers()])
      setPending(pendingRes.data)
      setAll(allRes.data)
    } catch (err) {
      alert(`Failed to ${action} user.`)
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
      <div className="page-wrapper" style={{ maxWidth: 900 }}>
        <div className="page-header" style={{ marginBottom: 32 }}>
          <h1>Admin Dashboard</h1>
          <p>Manage users and platform access</p>
        </div>

        {/* Pending Approvals */}
        <div className="card" style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Pending Approvals ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className="text-muted">No pending user requests.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pending.map(pUser => (
                <div key={pUser.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{pUser.username}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{pUser.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleAction(pUser.id, 'approve')}>Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleAction(pUser.id, 'reject')}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Active Users */}
        <div className="card">
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>All Registered Users ({all.length})</h2>
          {all.length === 0 ? (
            <p className="text-muted">No users found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {all.map(aUser => (
                <div key={aUser.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{aUser.username}</span>
                      {!aUser.is_approved && <span className="role-badge user" style={{ background: '#f59e0b', color: '#fff' }}>PENDING</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{aUser.email}</div>
                  </div>
                  {aUser.id !== user.id && (
                    <button className="btn btn-secondary btn-sm" onClick={() => handleAction(aUser.id, 'delete')} style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                      Delete Account
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
