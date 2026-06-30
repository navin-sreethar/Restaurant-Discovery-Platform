import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="logo-icon">🍽️</div>
        <span>RestaurantIQ</span>
      </Link>

      <div className="navbar-actions">
        {user && (
          <div className="nav-user">
            <span>{user.email}</span>
            <span className={`role-badge ${user.role?.toLowerCase()}`}>{user.role}</span>
          </div>
        )}
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  )
}
