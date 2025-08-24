import { useState, useEffect } from 'react'
import axios from 'axios'

const ProductForm = ({ product, categories, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    brand: '',
    original_price: '',
    margin: '',
    price: '',
    size: '',
    stock: '',
    active: true
  })
  const [images, setImages] = useState([])
  const [availableImages, setAvailableImages] = useState([]) // [{ original, thumb, filename }]
  const [selectedExistingImages, setSelectedExistingImages] = useState([])
  const [primaryImage, setPrimaryImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
  const [uploadsPage, setUploadsPage] = useState(1)
  const [uploadsTotal, setUploadsTotal] = useState(0)
  const [uploadsLimit] = useState(40)
  const [loadingUploads, setLoadingUploads] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(1)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category_id: product.category_id || '',
        description: product.description || '',
        brand: product.brand || '',
        original_price: product.original_price || '',
        margin: product.margin || '',
        price: product.price || '',
        size: product.size || '',
        stock: product.stock || '',
        active: product.active
      })
      if (Array.isArray(product.category_ids)) {
        setSelectedCategoryIds(product.category_ids)
      }
      // Cargar imágenes existentes del producto para edición
      const currentImages = Array.isArray(product.images) ? product.images : []
      setSelectedExistingImages(currentImages)
      setPrimaryImage(currentImages[0] || '')
    }
  }, [product])

  // Cargar imágenes disponibles del directorio uploads para selección y tipo de cambio
  useEffect(() => {
    const loadRate = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const resp = await axios.get('/api/admin/settings/exchange-rate', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
        setExchangeRate(resp.data?.exchange_rate || 1)
      } catch {}
    }
    loadRate()
    const loadUploads = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const resp = await axios.get('/api/admin/uploads/list', {
          params: { page: 1, limit: uploadsLimit },
          headers: { Authorization: `Bearer ${token}` },
        })
        const { items, total } = resp.data || { items: [], total: 0 }
        setAvailableImages(items)
        setUploadsTotal(total)
        setUploadsPage(1)
      } catch (e) {
        // Silencioso: si no hay imágenes disponibles
      }
    }
    loadUploads()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'original_price' || name === 'margin' || name === 'price') {
      const toNumber = (v) => {
        if (v === '' || v === null || typeof v === 'undefined') return NaN
        const n = parseFloat(String(v).replace(',', '.'))
        return Number.isNaN(n) ? NaN : n
      }
      const round2 = (n) => Math.round(n * 100) / 100

      const next = { ...formData, [name]: value }
      const original = name === 'original_price' ? toNumber(value) : toNumber(next.original_price)
      const margin = name === 'margin' ? toNumber(value) : toNumber(next.margin)
      const price = name === 'price' ? toNumber(value) : toNumber(next.price)

      if (name === 'original_price' || name === 'margin') {
        if (!Number.isNaN(original) && original > 0 && !Number.isNaN(margin)) {
          const computedPrice = round2(original * (1 + margin / 100))
          next.price = String(computedPrice)
        }
      }

      if (name === 'price') {
        if (!Number.isNaN(original) && original > 0 && !Number.isNaN(price)) {
          const computedMargin = round2(((price / original) - 1) * 100)
          next.margin = String(computedMargin)
        }
      }

      setFormData(next)
      return
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files))
  }

  const toggleExistingImage = (img) => {
    setSelectedExistingImages((prev) => {
      if (prev.includes(img)) {
        const next = prev.filter((i) => i !== img)
        if (primaryImage === img) {
          setPrimaryImage(next[0] || '')
        }
        return next
      }
      const next = [...prev, img]
      if (!primaryImage) setPrimaryImage(img)
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formDataToSend = new FormData()
      
      // Agregar datos del formulario
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          formDataToSend.append(key, formData[key])
        }
      })

      // Agregar imágenes
      images.forEach(image => {
        formDataToSend.append('images', image)
      })

      if (product) {
        // Actualizar datos del producto
        await axios.put(`/api/admin/products/${product.id}`, formData)
        // Actualizar categorías múltiples
        try {
          const token = localStorage.getItem('adminToken')
          await axios.put(
            `/api/admin/products/${product.id}/categories`,
            { category_ids: selectedCategoryIds },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        } catch (e) {
          console.error('Error updating product categories:', e)
        }
        // Si se eligieron imágenes existentes o principal, actualizar asociaciones
        if (selectedExistingImages.length > 0) {
          const token = localStorage.getItem('adminToken')
          await axios.put(
            `/api/admin/products/${product.id}/images`,
            { images: selectedExistingImages, primary: primaryImage },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        }
        // Si se suben archivos nuevos, adjuntarlas al producto existente
        if (images.length > 0) {
          const token = localStorage.getItem('adminToken')
          const fd = new FormData()
          images.forEach(image => fd.append('images', image))
          await axios.post(`/api/admin/products/${product.id}/images/upload`, fd, {
            headers: { Authorization: `Bearer ${token}` }
          })
        }
      } else {
        // Crear nuevo producto
        const createResp = await axios.post('/api/admin/products', formDataToSend)
        const newId = createResp.data?.productId
        if (newId && selectedCategoryIds.length > 0) {
          try {
            const token = localStorage.getItem('adminToken')
            await axios.put(
              `/api/admin/products/${newId}/categories`,
              { category_ids: selectedCategoryIds },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          } catch (e) {
            console.error('Error setting categories for new product:', e)
          }
        }
      }

      onSuccess()
    } catch (error) {
      setError(error.response?.data?.error || 'Error al guardar el producto')
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] flex flex-col sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Formulario (contenido scrollable) */}
        <form id="productForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categorías
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 border border-gray-200 rounded">
                {categories.map(category => {
                  const checked = selectedCategoryIds.includes(category.id)
                  return (
                    <label key={category.id} className="text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedCategoryIds(prev => {
                            if (e.target.checked) {
                              return [...new Set([...prev, category.id])]
                            }
                            return prev.filter(id => id !== category.id)
                          })
                        }}
                      />
                      <span>{category.name}</span>
                    </label>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">Puedes seleccionar múltiples categorías.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Talle
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Original
              </label>
              <input
                type="number"
                step="0.01"
                name="original_price"
                value={formData.original_price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margen (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="margin"
                value={formData.margin}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Final *
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                ≈ {(Number(formData.price || 0) * Number(exchangeRate || 1)).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio (ARS)
              </label>
              <input
                type="number"
                step="0.01"
                value={(() => {
                  const usd = parseFloat(String(formData.price || '').replace(',', '.'))
                  const rate = Number(exchangeRate || 1)
                  if (!Number.isFinite(usd) || !Number.isFinite(rate)) return ''
                  return Math.round(usd * rate * 100) / 100
                })()}
                onChange={(e) => {
                  const ars = parseFloat(e.target.value)
                  const rate = Number(exchangeRate || 1)
                  if (Number.isFinite(ars) && rate > 0) {
                    const usd = Math.round((ars / rate) * 100) / 100
                    handleInputChange({ target: { name: 'price', value: String(usd) } })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              />
              <p className="text-xs text-gray-500 mt-1">Modificar ARS recalcula USD y margen.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
            />
          </div>

          {/* Selección de imágenes existentes (uploads) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes existentes en servidor (uploads)
            </label>
            {availableImages.length === 0 ? (
              <p className="text-sm text-gray-500">No hay imágenes disponibles en <code className="px-1 bg-gray-100 rounded">/server/uploads</code>.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableImages.map((item) => {
                  const selected = selectedExistingImages.includes(item.original)
                  const isPrimary = primaryImage === item.original
                  return (
                    <div key={item.original} className={`relative border rounded p-2 ${selected ? 'border-[var(--primary)]' : 'border-gray-200'}`}>
                      <img src={item.thumb} alt="img" loading="lazy" className="w-full h-24 object-cover rounded" />
                      <div className="mt-2 flex items-center justify-between">
                        <label className="text-xs flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleExistingImage(item.original)}
                          />
                          <span>Usar</span>
                        </label>
                        <label className={`text-xs flex items-center space-x-1 ${!selected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="radio"
                            name="primaryImage"
                            disabled={!selected}
                            checked={isPrimary}
                            onChange={() => setPrimaryImage(item.original)}
                          />
                          <span>Principal</span>
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {availableImages.length < uploadsTotal && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setLoadingUploads(true)
                      const token = localStorage.getItem('adminToken')
                      const next = uploadsPage + 1
                      const resp = await axios.get('/api/admin/uploads/list', {
                        params: { page: next, limit: uploadsLimit },
                        headers: { Authorization: `Bearer ${token}` },
                      })
                      const { items } = resp.data || { items: [] }
                      setAvailableImages(prev => [...prev, ...items])
                      setUploadsPage(next)
                    } finally {
                      setLoadingUploads(false)
                    }
                  }}
                  disabled={loadingUploads}
                  className={`w-full py-2 px-3 rounded border ${loadingUploads ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'}`}
                >
                  {loadingUploads ? 'Cargando…' : 'Cargar más'}
                </button>
              </div>
            )}
          </div>

          {!product && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imágenes (máximo 5)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              />
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
              className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Producto activo
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}
        </form>
        {/* Footer fijo */}
        <div className="border-t p-4 flex space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="productForm"
            disabled={loading}
            className={`flex-1 py-2 px-4 rounded-md font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[var(--primary)] text-white hover:opacity-90'
            }`}
          >
            {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductForm
