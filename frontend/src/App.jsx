import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import RestaurantsPage from './pages/RestaurantsPage'
import RestaurantDetailPage from './pages/RestaurantDetailPage'
import RestaurantFormPage from './pages/RestaurantFormPage'
import './index.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — requires login */}
          <Route path="/" element={<PrivateRoute><RestaurantsPage /></PrivateRoute>} />
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
