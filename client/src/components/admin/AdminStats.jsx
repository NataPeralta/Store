import { useEffect, useState } from 'react'
import axios from 'axios'

const formatCurrency = (n) => (n || 0).toLocaleString('es-AR', { style: 'currency', currency: 'USD' })

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-semibold text-gray-900">{value}</p>
  </div>
)

const AdminStats = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ productCount: 0, orderCount: 0, valueInStock: 0, totalSold: 0, valueInvested: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/admin/stats')
        setStats(data)
      } catch (e) {
        setError('No se pudieron cargar las estadísticas')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Productos" value={stats.productCount} />
      <StatCard label="Órdenes" value={stats.orderCount} />
      <StatCard label="Valor en stock" value={formatCurrency(stats.valueInStock)} />
      <StatCard label="Vendido total" value={formatCurrency(stats.totalSold)} />
      <StatCard label="Valor invertido" value={formatCurrency(stats.valueInvested)} />
    </div>
  )
}

export default AdminStats
