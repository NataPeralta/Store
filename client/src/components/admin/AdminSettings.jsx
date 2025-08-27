import { useEffect, useState } from 'react'
import axios from 'axios'

const AdminSettings = () => {
  const [exchangeRate, setExchangeRate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadRate = async () => {
    try {
      setLoading(true)
      setError('')
      const resp = await axios.get('/api/settings/exchange-rate')
      setExchangeRate(String(resp.data?.exchange_rate ?? ''))
    } catch (e) {
      setError('No se pudo cargar el tipo de cambio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRate()
  }, [])

  const saveRate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      const rate = parseFloat(exchangeRate)
      
      if (!Number.isFinite(rate) || rate <= 0) {
        setError('Ingrese un número válido (> 0)')
        setLoading(false)
        return
      }
      
      await axios.put('/api/settings/exchange-rate', { exchange_rate: rate })
      setSuccess('Tipo de cambio actualizado')
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo guardar el tipo de cambio')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(''), 1500)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4 max-w-xl">
        <h3 className="text-lg font-semibold mb-3">Ajustes generales</h3>
        <form onSubmit={saveRate} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Valor del dólar (ARS)</label>
          <input
            type="number"
            step="0.01"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-300' : 'bg-[var(--primary)] hover:opacity-90'}`}
            >
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={loadRate}
              disabled={loading}
              className="px-4 py-2 rounded-md border hover:bg-gray-50"
            >
              Recargar
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
        </form>
      </div>
    </div>
  )
}

export default AdminSettings


