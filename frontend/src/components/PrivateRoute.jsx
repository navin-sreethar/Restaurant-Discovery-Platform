import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wraps routes that require the user to be logged in
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
    </div>
  )

  return user ? children : <Navigate to="/login" replace />
}
