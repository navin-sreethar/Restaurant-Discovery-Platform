import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
})

// Automatically attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If we get a 401, token expired — log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──
export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const register = (email, username, password, role) =>
  api.post('/auth/register', { email, username, password, role })

export const getMe = () => api.get('/auth/me')

// ── Restaurants ──
export const getRestaurants = (params) =>
  api.get('/restaurants', { params })

export const getRestaurant = (id) =>
  api.get(`/restaurants/${id}`)

export const createRestaurant = (data) =>
  api.post('/restaurants', data)

export const updateRestaurant = (id, data) =>
  api.put(`/restaurants/${id}`, data)

export const deleteRestaurant = (id) =>
  api.delete(`/restaurants/${id}`)

// ── AI ──
export const generateAI = (restaurantId, type) =>
  api.post(`/restaurants/${restaurantId}/ai/${type}`)

export const getAILogs = (restaurantId) =>
  api.get(`/restaurants/${restaurantId}/ai/logs`)

export default api
