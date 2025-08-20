import { Routes, Route } from 'react-router-dom'
import Store from './pages/Store'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Store />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </CartProvider>
  )
}

export default App
