import { useEffect, useState } from 'react'
import axios from 'axios'

const Customers = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [customers, setCustomers] = useState([])
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await axios.get('/api/customers')
        setCustomers(data)
      } catch (e) {
        setError('No se pudieron cargar los clientes')
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')) return
    try {
      setDeletingId(id)
      await axios.delete(`/api/customers/${id}`)
      setCustomers(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      alert(e.response?.data?.error || 'No se pudo eliminar el cliente')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
  }

  if (customers.length === 0) {
    return <p className="text-gray-500">Aún no hay clientes.</p>
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {customers.map((c) => (
          <li key={c.email} className="px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{c.customerName} {c.customerLastname}</p>
                <p className="text-sm text-gray-500 break-all">{c.email}</p>
              </div>
              <div className="sm:ml-4 text-left sm:text-right text-sm text-gray-600 flex items-center gap-4">
                <p>Órdenes: <span className="font-semibold">{c.orders}</span></p>
                <p>Total gastado: <span className="font-semibold">${(c.total_spent || 0).toLocaleString()}</span></p>
                {c.firstConnection && (
                  <p className="text-xs text-gray-400">
                    Primera conexión: {new Date(c.firstConnection).toLocaleDateString('es-ES')}
                  </p>
                )}
                {c.lastConnection && (
                  <p className="text-xs text-gray-400">
                    Última conexión: {new Date(c.lastConnection).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                )}
                {c.first_order && (
                  <p className="text-xs text-gray-400">
                    Primera orden: {new Date(c.first_order).toLocaleDateString('es-ES')}
                  </p>
                )}
                {c.last_order && (
                  <p className="text-xs text-gray-400">
                    Última orden: {new Date(c.last_order).toLocaleDateString('es-ES')}
                  </p>
                )}
                {c.orders === 0 && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    className={`px-3 py-1 rounded-md border text-sm ${deletingId === c.id ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'border-red-300 text-red-600 hover:bg-red-50'}`}
                  >
                    {deletingId === c.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Customers
