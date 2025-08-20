import { useState } from 'react'
import { useCart } from '../context/CartContext'
import axios from 'axios'

const CheckoutModal = ({ onClose, onSuccess }) => {
  const { items, getTotal, clearCart } = useCart()
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_lastname: '',
    customer_email: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validar stock antes de enviar la orden
      const response = await axios.get('/api/products')
      const currentProducts = response.data
      
      const stockErrors = []
      const validItems = []
      
      for (const item of items) {
        const currentProduct = currentProducts.find(p => p.id === item.id)
        
        if (!currentProduct) {
          stockErrors.push(`Producto "${item.name}" ya no existe`)
        } else if (currentProduct.active !== 1) {
          stockErrors.push(`Producto "${item.name}" no está disponible`)
        } else if (currentProduct.stock < item.quantity) {
          stockErrors.push(`Producto "${item.name}" - Stock insuficiente. Disponible: ${currentProduct.stock}`)
        } else {
          validItems.push(item)
        }
      }
      
      if (stockErrors.length > 0) {
        setError(`Productos no disponibles: ${stockErrors.join(', ')}`)
        setLoading(false)
        return
      }
      
      if (validItems.length === 0) {
        setError('No hay productos válidos para procesar')
        setLoading(false)
        return
      }

      const orderData = {
        ...formData,
        items: validItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      }

      await axios.post('/api/orders', orderData)
      
      clearCart()
      onSuccess()
    } catch (error) {
      setError(error.response?.data?.error || 'Error al procesar la orden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Completar Compra</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4">
          {/* Resumen de productos */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Resumen de tu pedido:</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity)?.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 mt-3">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${getTotal()?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                name="customer_lastname"
                value={formData.customer_lastname}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2 px-4 rounded-md font-medium ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[var(--primary)] text-white hover:opacity-90'
                }`}
              >
                {loading ? 'Procesando...' : 'Confirmar Compra'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CheckoutModal
