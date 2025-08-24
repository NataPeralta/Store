import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import axios from 'axios'
import Cart from '../components/Cart'
import ProductCard from '../components/ProductCard'
import CheckoutModal from '../components/CheckoutModal'
import Banner from '../components/Banner'
import EmailRegistrationModal from '../components/EmailRegistrationModal'

const Store = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const { getItemCount } = useCart()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    const storedEmail = localStorage.getItem('customerEmail')
    if (!storedEmail) {
      setShowEmailModal(true)
    }
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => Array.isArray(product.category_ids)
      ? product.category_ids.includes(parseInt(selectedCategory))
      : product.category_id === parseInt(selectedCategory)
    )

  if (loading) {
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
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">SheetCart</h1>
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
            >
              🛒 Carrito
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Banner />
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por categoría:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Productos */}
        <div id="products-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron productos en esta categoría.</p>
          </div>
        )}
      </div>

      {/* Carrito lateral */}
      {showCart && (
        <Cart 
          onClose={() => setShowCart(false)}
          onCheckout={() => {
            setShowCart(false)
            const storedEmail = localStorage.getItem('customerEmail')
            if (!storedEmail) {
              setShowEmailModal(true)
            } else {
              setShowCheckout(true)
            }
          }}
        />
      )}

      {/* Modal de checkout */}
      {showCheckout && (
        <CheckoutModal 
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false)
            setShowCart(false)
          }}
        />
      )}

      {/* Modal de registro de email */}
      {showEmailModal && (
        <EmailRegistrationModal
          onClose={() => setShowEmailModal(false)}
          onSaved={() => {
            setShowEmailModal(false)
          }}
        />
      )}
    </div>
  )
}

export default Store
