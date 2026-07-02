import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../services/api'
import { useAuth } from '../context/AuthContext'

// Phone number formatter: strips non-digits, formats as (XXX) XXX-XXXX
function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
}

// Password strength checker
function getPasswordStrength(pw) {
  if (!pw) return null
  if (pw.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { label: 'Weak', color: '#f97316', width: '35%' }
  if (score === 2) return { label: 'Fair', color: '#eab308', width: '60%' }
  if (score === 3) return { label: 'Good', color: '#22c55e', width: '80%' }
  return { label: 'Strong', color: '#10b981', width: '100%' }
}

export default function LoginPage() {
  const [tab, setTab] = useState('login') // 'login' | 'register'

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState(false)
  const [regLoading, setRegLoading] = useState(false)

  const { loginUser } = useAuth()
  const navigate = useNavigate()

  // ── Login submit ──
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await login(loginEmail, loginPassword)
      const { access_token, role } = res.data
      loginUser(access_token, { email: loginEmail, role })
      navigate('/')
    } catch (err) {
      const detail = err.response?.data?.detail
      setLoginError(detail || 'Login failed. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  // ── Register submit ──
  const handleRegister = async (e) => {
    e.preventDefault()
    setRegError('')

    // Client-side validation
    if (regUsername.trim().length < 2) {
      return setRegError('Username must be at least 2 characters.')
    }
    if (regPassword.length < 6) {
      return setRegError('Password must be at least 6 characters.')
    }
    if (regPassword !== regConfirm) {
      return setRegError('Passwords do not match.')
    }

    setRegLoading(true)
    try {
      await register(regEmail, regUsername.trim(), regPassword, 'USER')
      setRegSuccess(true)
    } catch (err) {
      const detail = err.response?.data?.detail
      setRegError(detail || 'Registration failed. Please try again.')
    } finally {
      setRegLoading(false)
    }
  }

  const pwStrength = getPasswordStrength(regPassword)

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 440 }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon-lg">🍽️</div>
          <h1>RestaurantIQ</h1>
          <p>AI-Powered Discovery Platform</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 }}>
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setLoginError(''); setRegError(''); setRegSuccess(false) }}
              style={{
                flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                background: tab === t ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
                color: tab === t ? 'white' : 'var(--text-secondary)',
              }}
            >
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* ── LOGIN FORM ── */}
        {tab === 'login' && (
          <>
            {loginError && <div className="auth-error">⚠️ {loginError}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email</label>
                <input
                  id="login-email" type="email" className="form-input"
                  placeholder="admin@restaurant.com"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  required autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password" type="password" className="form-input"
                  placeholder="••••••••"
                  value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit" className="btn btn-primary" id="login-submit"
                disabled={loginLoading}
                style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              >
                {loginLoading
                  ? <><span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Signing in...</>
                  : 'Sign In →'}
              </button>
            </form>
            <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 20 }}>
              Demo: admin@restaurant.com / Admin1234
            </p>
          </>
        )}

        {/* ── REGISTER FORM ── */}
        {tab === 'register' && (
          <>
            {regSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ marginBottom: 8, color: 'var(--success)' }}>Request Submitted!</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Your account is <strong>pending admin approval</strong>. You will be able to log in once an administrator reviews your request.
                </p>
                <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={() => setTab('login')}>
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                {regError && <div className="auth-error">⚠️ {regError}</div>}
                <div className="auth-info" style={{
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                  fontSize: 13, color: 'var(--text-secondary)'
                }}>
                  ℹ️ New accounts require admin approval before you can log in.
                </div>
                <form onSubmit={handleRegister}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-username">Full Name *</label>
                    <input
                      id="reg-username" type="text" className="form-input"
                      placeholder="John Smith"
                      value={regUsername} onChange={e => setRegUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-email">Email *</label>
                    <input
                      id="reg-email" type="email" className="form-input"
                      placeholder="you@example.com"
                      value={regEmail} onChange={e => setRegEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-password">Password *</label>
                    <input
                      id="reg-password" type="password" className="form-input"
                      placeholder="Min 6 characters"
                      value={regPassword} onChange={e => setRegPassword(e.target.value)}
                      required
                    />
                    {/* Password strength bar */}
                    {pwStrength && (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: pwStrength.width, background: pwStrength.color, borderRadius: 2, transition: 'all 0.3s' }} />
                        </div>
                        <div style={{ fontSize: 11, color: pwStrength.color, marginTop: 4 }}>{pwStrength.label}</div>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-confirm">Confirm Password *</label>
                    <input
                      id="reg-confirm" type="password" className="form-input"
                      placeholder="Repeat password"
                      value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                      required
                    />
                    {regConfirm && regPassword !== regConfirm && (
                      <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Passwords do not match</div>
                    )}
                  </div>
                  <button
                    type="submit" className="btn btn-primary"
                    disabled={regLoading}
                    style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                  >
                    {regLoading
                      ? <><span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Submitting...</>
                      : 'Create Account →'}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
