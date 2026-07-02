import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPendingUsers, getAllUsers, approveUser, deleteUser, getAdminStats } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'users'
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/')
      return
    }
    fetchData()
  }, [user, navigate])

  const fetchData = async () => {
    try {
      const [pendingRes, allRes, statsRes] = await Promise.all([
        getPendingUsers(),
        getAllUsers(),
        getAdminStats()
      ])
      setPending(pendingRes.data)
      setAll(allRes.data)
      setStats(statsRes.data)
    } catch (err) {
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (userId, action) => {
    try {
      if (action === 'approve') {
        await approveUser(userId, true)
        toast.success("User approved")
      } else if (action === 'reject' || action === 'delete') {
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return
        await deleteUser(userId)
        toast.success(`User ${action}ed`)
      }
      fetchData()
    } catch (err) {
      toast.error(`Failed to ${action} user.`)
    }
  }

  if (loading || !stats) return (
    <>
      <Navbar />
      <div className="flex-center" style={{ padding: 120 }}>
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></div>
      </div>
    </>
  )

  const leadTotal = stats.restaurants.leads.cold + stats.restaurants.leads.contacted + stats.restaurants.leads.interested + stats.restaurants.leads.converted + stats.restaurants.leads.not_interested

  return (
    <>
      <Navbar />
      
      {/* Dashboard Sub-nav */}
      <div style={{ background: 'var(--surface-light)', borderBottom: '1px solid var(--border)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 32 }}>
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            style={{ padding: '16px 0', border: 'none', background: 'transparent', color: activeTab === 'overview' ? 'var(--primary-light)' : 'var(--text-secondary)', fontWeight: 600, borderBottom: activeTab === 'overview' ? '2px solid var(--primary-light)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            📊 Analytics Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            style={{ padding: '16px 0', border: 'none', background: 'transparent', color: activeTab === 'users' ? 'var(--primary-light)' : 'var(--text-secondary)', fontWeight: 600, borderBottom: activeTab === 'users' ? '2px solid var(--primary-light)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            👥 User Management
            {pending.length > 0 && <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: 12, fontSize: 11, marginLeft: 8 }}>{pending.length}</span>}
          </button>
        </div>
      </div>

      <div className="page-wrapper" style={{ maxWidth: 1200, paddingTop: 32, paddingBottom: 64 }}>
        
        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h1 style={{ marginBottom: 24, fontSize: 24 }}>Platform Reports & KPIs</h1>
            
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 32 }}>
              <StatCard title="Total Restaurants" value={stats.restaurants.total} icon="🍽️" />
              <StatCard title="Total Users" value={stats.users.total} icon="👥" sub={`Active: ${stats.users.active} | Pending: ${stats.users.pending}`} />
              <StatCard title="AI Summaries Generated" value={stats.ai_summaries.total} icon="🤖" />
              <StatCard title="Support Tickets" value={stats.tickets.total} icon="🎧" sub={`Open: ${stats.tickets.open} | Resolved: ${stats.tickets.resolved}`} />
            </div>

            {/* Complex Report: Lead Status Funnel */}
            <div className="card" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>Lead Conversion Funnel</h2>
              {leadTotal === 0 ? (
                <p className="text-muted">No leads exist yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <ProgressBar label="Cold Leads" count={stats.restaurants.leads.cold} total={leadTotal} color="#3b82f6" />
                  <ProgressBar label="Contacted" count={stats.restaurants.leads.contacted} total={leadTotal} color="#8b5cf6" />
                  <ProgressBar label="Interested" count={stats.restaurants.leads.interested} total={leadTotal} color="#f59e0b" />
                  <ProgressBar label="Converted (Won)" count={stats.restaurants.leads.converted} total={leadTotal} color="#10b981" />
                  <ProgressBar label="Not Interested (Lost)" count={stats.restaurants.leads.not_interested} total={leadTotal} color="#ef4444" />
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.2)' }}>
                <h3 style={{ marginBottom: 12 }}>Pending Approvals</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>You have {pending.length} users waiting for account access.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('users')}>Review Now</button>
              </div>
              <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(16,185,129,0.2)' }}>
                <h3 style={{ marginBottom: 12 }}>System Status</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>All AI microservices and database connections are operating normally.</p>
                <span className="btn btn-secondary" style={{ display: 'inline-block', opacity: 0.8, cursor: 'default' }}>Operational 🟢</span>
              </div>
            </div>
          </div>
        )}

        {/* ── USER MANAGEMENT TAB ── */}
        {activeTab === 'users' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="page-header" style={{ marginBottom: 32 }}>
              <h1>User Access Management</h1>
              <p>Approve new registrations or revoke access for existing users.</p>
            </div>

            {/* Pending Approvals */}
            <div className="card" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, marginBottom: 16 }}>Pending Approvals ({pending.length})</h2>
              {pending.length === 0 ? (
                <p className="text-muted">No pending user requests.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pending.map(pUser => (
                    <div key={pUser.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{pUser.username}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{pUser.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
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
                          Revoke Access
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function StatCard({ title, value, icon, sub }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '24px 16px', background: 'var(--surface-light)' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{sub}</div>}
    </div>
  )
}

function ProgressBar({ label, count, total, color }) {
  const percentage = total === 0 ? 0 : Math.round((count / total) * 100)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span style={{ color: 'var(--text-secondary)' }}>{count} ({percentage}%)</span>
      </div>
      <div style={{ height: 8, background: 'var(--surface)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, background: color, borderRadius: 4, transition: 'width 1s ease-in-out' }} />
      </div>
    </div>
  )
}
