import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import RestaurantsPage from './pages/RestaurantsPage'
import RestaurantDetailPage from './pages/RestaurantDetailPage'
import RestaurantFormPage from './pages/RestaurantFormPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import HelpdeskPage from './pages/HelpdeskPage'
import './index.css'

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e1b4b', color: '#fff', border: '1px solid rgba(99,102,241,0.3)' }
      }} />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — requires login */}
          <Route path="/" element={<PrivateRoute><RestaurantsPage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboardPage /></PrivateRoute>} />
          <Route path="/helpdesk" element={<PrivateRoute><HelpdeskPage /></PrivateRoute>} />
          <Route path="/restaurants/new" element={<PrivateRoute><RestaurantFormPage /></PrivateRoute>} />
          <Route path="/restaurants/:id" element={<PrivateRoute><RestaurantDetailPage /></PrivateRoute>} />
          <Route path="/restaurants/:id/edit" element={<PrivateRoute><RestaurantFormPage /></PrivateRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
