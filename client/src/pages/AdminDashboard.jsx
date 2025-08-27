import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ProductManagement from '../components/admin/ProductManagement'
import OrderManagement from '../components/admin/OrderManagement'
import AdminStats from '../components/admin/AdminStats'
import Customers from '../components/admin/Customers'
import AdminCategories from '../components/admin/AdminCategories'
import AdminSettings from '../components/admin/AdminSettings'
import GalleryManagement from '../components/admin/GalleryManagement'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const userData = localStorage.getItem('adminUser')
    
    if (!token || !userData) {
      navigate('/admin')
      return
    }

    setUser(JSON.parse(userData))
    
    // Configurar axios para incluir el token en todas las peticiones
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    delete axios.defaults.headers.common['Authorization']
    navigate('/admin')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-600">Bienvenido, {user.username}</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="text-sm hover:opacity-90"
                style={{ color: 'var(--primary)' }}
              >
                Ver tienda
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-6 overflow-x-auto">
          <nav className="-mb-px flex space-x-6 min-w-max">
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Estadísticas
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Órdenes de Compra
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gestión de Productos
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'customers'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Clientes
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categorías
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'gallery'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Galería
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ajustes
            </button>
          </nav>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'stats' && <AdminStats />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'customers' && <Customers />}
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'gallery' && <GalleryManagement />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
