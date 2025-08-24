import { useEffect, useState } from 'react'
import axios from 'axios'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchCategories = async () => {
    try {
      const resp = await axios.get('/api/admin/categories', { headers: getAuthHeaders() })
      setCategories(resp.data || [])
    } catch (e) {
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        setError('Sesión expirada. Redirigiendo al login…')
        setTimeout(() => {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          window.location.href = '/admin'
        }, 800)
      } else {
        setError(e?.response?.data?.error || 'No se pudieron cargar las categorías')
      }
      console.error('Error cargando categorías:', e)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      setLoading(true)
      setError('')
      await axios.post('/api/admin/categories', { name: name.trim() }, { headers: getAuthHeaders() })
      setName('')
      await fetchCategories()
    } catch (e) {
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        setError('Sesión expirada. Redirigiendo al login…')
        setTimeout(() => {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          window.location.href = '/admin'
        }, 800)
      } else {
        setError(e?.response?.data?.error || 'Error al crear la categoría')
      }
      console.error('Error creando categoría:', e)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id, currentActive) => {
    try {
      setLoading(true)
      setError('')
      await axios.put(`/api/admin/categories/${id}/active`, { active: !currentActive }, { headers: getAuthHeaders() })
      await fetchCategories()
    } catch (e) {
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        setError('Sesión expirada. Redirigiendo al login…')
        setTimeout(() => {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          window.location.href = '/admin'
        }, 800)
      } else {
        setError(e?.response?.data?.error || 'Error al actualizar la categoría')
      }
      console.error('Error actualizando categoría:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Gestionar categorías</h3>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Nombre de categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className={`px-4 py-2 rounded-md text-white ${loading || !name.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-[var(--primary)] hover:opacity-90'}`}
          >
            {loading ? 'Guardando…' : 'Agregar'}
          </button>
        </form>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h4 className="font-medium">Categorías existentes</h4>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4">Productos</th>
                <th className="py-2 pr-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-t">
                  <td className="py-2 pr-4">
                    {editingId === cat.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                        <button
                          onClick={async () => {
                            const newName = editingName.trim()
                            if (!newName) return
                            try {
                              setLoading(true)
                              setError('')
                              await axios.put(`/api/admin/categories/${cat.id}`, { name: newName }, { headers: getAuthHeaders() })
                              setEditingId(null)
                              setEditingName('')
                              await fetchCategories()
                            } catch (e) {
                              if (e?.response?.status === 401 || e?.response?.status === 403) {
                                setError('Sesión expirada. Redirigiendo al login…')
                                setTimeout(() => {
                                  localStorage.removeItem('adminToken')
                                  localStorage.removeItem('adminUser')
                                  window.location.href = '/admin'
                                }, 800)
                              } else {
                                setError(e?.response?.data?.error || 'No se pudo renombrar la categoría')
                              }
                            } finally {
                              setLoading(false)
                            }
                          }}
                          className="px-2 py-1 rounded bg-[var(--primary)] text-white hover:opacity-90"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditingName('') }}
                          className="px-2 py-1 rounded border hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{cat.name}</span>
                        <button
                          onClick={() => { setEditingId(cat.id); setEditingName(cat.name) }}
                          className="text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-1 rounded text-xs ${cat.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {cat.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{cat.product_count ?? 0}</td>
                  <td className="py-2 pr-4">
                    <button
                      onClick={() => toggleActive(cat.id, !!cat.active)}
                      disabled={loading}
                      className={`px-3 py-1 rounded border ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                      {cat.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm('¿Eliminar categoría? Esta acción no se puede deshacer.')) return
                        try {
                          setLoading(true)
                          setError('')
                          await axios.delete(`/api/admin/categories/${cat.id}`, { headers: getAuthHeaders() })
                          await fetchCategories()
                        } catch (e) {
                          if (e?.response?.status === 401 || e?.response?.status === 403) {
                            setError('Sesión expirada. Redirigiendo al login…')
                            setTimeout(() => {
                              localStorage.removeItem('adminToken')
                              localStorage.removeItem('adminUser')
                              window.location.href = '/admin'
                            }, 800)
                          } else {
                            setError(e?.response?.data?.error || 'No se pudo eliminar la categoría')
                          }
                        } finally {
                          setLoading(false)
                        }
                      }}
                      disabled={loading || cat.active || (cat.product_count ?? 0) > 0}
                      className={`ml-2 px-3 py-1 rounded border ${cat.active || (cat.product_count ?? 0) > 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-red-50 border-red-300 text-red-700'}`}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-6 text-center text-gray-500">No hay categorías</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminCategories


