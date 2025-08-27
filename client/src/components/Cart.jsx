import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import axios from 'axios'

const Cart = ({ onClose, onCheckout }) => {
  const { items, removeItem, getTotal, clearCart } = useCart()
  const [stockValidation, setStockValidation] = useState([])
  const [validating, setValidating] = useState(true)
  const [customer, setCustomer] = useState({
    name: localStorage.getItem('customerName') || '',
    lastname: localStorage.getItem('customerLastname') || '',
    email: localStorage.getItem('customerEmail') || ''
  })

  // Validar stock cuando se abre el carrito
  useEffect(() => {
    const validateStock = async () => {
      if (items.length === 0) {
        setValidating(false)
        return
      }

      try {
        const response = await axios.get('/api/products')
        const currentProducts = response.data
        
        const validation = items.map(item => {
          const currentProduct = currentProducts.find(p => p.id === item.id)
          const isActive = currentProduct?.active === true || currentProduct?.active === 1
          return {
            ...item,
            currentStock: currentProduct?.stock || 0,
            isAvailable: currentProduct?.stock > 0 && isActive,
            productExists: !!currentProduct
          }
        })

        setStockValidation(validation)
        
        // Eliminar productos no disponibles automáticamente
        const unavailableItems = validation.filter(item => !item.isAvailable)
        if (unavailableItems.length > 0) {
            unavailableItems.forEach(item => {
            const currentProduct = currentProducts.find(p => p.id === item.id)
            if (currentProduct?.stock <= 0) {
              alert(`❌ Producto ${item.name} eliminado: Sin stock (stock: ${currentProduct?.stock})`)
            } else if (!(currentProduct?.active === true || currentProduct?.active === 1)) {
              alert(`❌ Producto ${item.name} eliminado: No está activo (active: ${currentProduct?.active})`)
            }
            removeItem(item.id)
          })
          
          const stockItems = unavailableItems.filter(item => {
            const currentProduct = currentProducts.find(p => p.id === item.id)
            return currentProduct?.stock <= 0
          })
          
          const inactiveItems = unavailableItems.filter(item => {
            const currentProduct = currentProducts.find(p => p.id === item.id)
            return currentProduct?.stock > 0 && !(currentProduct?.active === true || currentProduct?.active === 1)
          })
          
          let message = ''
          if (stockItems.length > 0) {
            message += `${stockItems.length} producto(s) sin stock`
          }
          if (inactiveItems.length > 0) {
            if (message) message += ' y '
            message += `${inactiveItems.length} producto(s) no disponibles`
          }
          message += ' fueron eliminados del carrito'
          
          alert(message)
        }
      } catch (error) {
        console.error('Error validando stock:', error)
      } finally {
        setValidating(false)
      }
    }

    validateStock()
  }, []) // Solo se ejecuta cuando se monta el componente

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Carrito de Compras</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Datos del cliente */}
          {(customer.name || customer.lastname || customer.email) && (
            <div className="mb-4 p-3 border rounded-md bg-gray-50">
              <p className="text-sm text-gray-700 font-medium">Tus datos</p>
              <p className="text-sm text-gray-800">{customer.name} {customer.lastname}</p>
              <p className="text-sm text-gray-600">{customer.email}</p>
            </div>
          )}
          {validating ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--primary)' }}></div>
              <p className="text-gray-500">Validando productos...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                  {/* Imagen */}
                  <div className="flex-shrink-0">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={`/uploads/${item.images[0].gallery?.previewPath || item.images[0]}`}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          console.error('Error loading cart image:', item.images[0])
                          e.target.src = '/placeholder-image.jpg'
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Sin imagen</span>
                      </div>
                    )}
                  </div>

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ${item.price?.toLocaleString()}
                    </p>
                  </div>

                  {/* Precio */}
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${item.price?.toLocaleString()}
                    </p>
                  </div>

                  {/* Eliminar */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                ${getTotal()?.toLocaleString()}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={clearCart}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Vaciar
              </button>
              <button
                onClick={onCheckout}
                className="flex-1 py-2 px-4 bg-[var(--primary)] text-white rounded-md hover:opacity-90"
              >
                Comprar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
