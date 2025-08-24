import { useState, useEffect } from 'react'
import axios from 'axios'

const OrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/admin/orders')
      setOrders(response.data)
    } catch (error) {
      setError('Error al cargar las órdenes')
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, { status: newStatus })
      fetchOrders() // Recargar órdenes
    } catch (error) {
      setError('Error al actualizar el estado de la orden')
      console.error('Error updating order status:', error)
    }
  }

  const deleteOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta orden?')) {
      return
    }

    try {
      await axios.delete(`/api/admin/orders/${orderId}`)
      fetchOrders() // Recargar órdenes
    } catch (error) {
      setError('Error al eliminar la orden')
      console.error('Error deleting order:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'processing':
        return 'En Proceso'
      case 'shipped':
        return 'Enviado'
      case 'delivered':
        return 'Entregado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Órdenes de Compra</h2>
        <button
          onClick={fetchOrders}
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay órdenes disponibles.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--primary)' }}>
                          Orden #{order.id}
                        </p>
                        <div className="sm:ml-2 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:items-center">
                        <div className="sm:flex sm:items-center">
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="font-medium">{order.customer_name} {order.customer_lastname}</span>
                          </p>
                          <p className="mt-1 sm:mt-0 sm:ml-6 flex items-center text-sm text-gray-500 break-all">
                            📧 {order.customer_email}
                          </p>
                        </div>
                        <div className="sm:justify-end flex items-center text-sm text-gray-500">
                          <p>
                            Total: <span className="font-semibold">${order.total?.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Productos: {order.products || 'Sin productos'}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Fecha: {new Date(order.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <div className="md:ml-4 flex-shrink-0 flex space-x-2">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 max-w-full"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="processing">En Proceso</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default OrderManagement
