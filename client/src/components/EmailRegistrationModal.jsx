import { useState, useEffect } from 'react'
import axios from 'axios'

const EmailRegistrationModal = ({ onClose, onSaved }) => {
  const [email, setEmail] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [lastname, setLastname] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const storedEmail = localStorage.getItem('customerEmail')
    const storedName = localStorage.getItem('customerName')
    const storedLastname = localStorage.getItem('customerLastname')
    if (storedEmail) setEmail(storedEmail)
    if (storedName) setName(storedName)
    if (storedLastname) setLastname(storedLastname)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !lastname.trim()) {
      setError('Nombre y apellido son requeridos')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido')
      return
    }
    if (!accepted) {
      setError('Debes aceptar el aviso para continuar')
      return
    }

    try {
      setLoading(true)
      const resp = await axios.post('/api/customers/register-or-get', {
        email,
        customerName: name,
        customerLastname: lastname
      })
      const customer = resp.data
      localStorage.setItem('customerId', String(customer.id))
      localStorage.setItem('customerEmail', customer.email)
      localStorage.setItem('customerName', customer.customerName || name)
      localStorage.setItem('customerLastname', customer.customerLastname || lastname)
      onSaved(customer)
    } catch (er) {
      setError(er.response?.data?.error || 'Error registrando cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Tus datos para agendar el pedido</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu apellido"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="tu@email.com"
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              id="accept"
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="accept" className="text-sm text-gray-700">
              Confirmo que este correo y el agendamiento se usarán al realizar el pedido.
            </label>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-md text-white ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[var(--primary)] hover:opacity-90'}`}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmailRegistrationModal


