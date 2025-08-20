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
  const [availableImages, setAvailableImages] = useState([])
  const [selectedExistingImages, setSelectedExistingImages] = useState([])
  const [primaryImage, setPrimaryImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      // Cargar imágenes existentes del producto para edición
      const currentImages = Array.isArray(product.images) ? product.images : []
      setSelectedExistingImages(currentImages)
      setPrimaryImage(currentImages[0] || '')
    }
  }, [product])

  // Cargar imágenes disponibles del directorio uploads para selección
  useEffect(() => {
    const loadUploads = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const resp = await axios.get('/api/admin/uploads', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setAvailableImages(resp.data || [])
      } catch (e) {
        // Silencioso: si no hay imágenes disponibles
      }
    }
    loadUploads()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
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
        await axios.post('/api/admin/products', formDataToSend)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
                Categoría
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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
                {availableImages.map((img) => {
                  const selected = selectedExistingImages.includes(img)
                  const isPrimary = primaryImage === img
                  return (
                    <div key={img} className={`relative border rounded p-2 ${selected ? 'border-[var(--primary)]' : 'border-gray-200'}`}>
                      <img src={img} alt="img" className="w-full h-24 object-cover rounded" />
                      <div className="mt-2 flex items-center justify-between">
                        <label className="text-xs flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleExistingImage(img)}
                          />
                          <span>Usar</span>
                        </label>
                        <label className={`text-xs flex items-center space-x-1 ${!selected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="radio"
                            name="primaryImage"
                            disabled={!selected}
                            checked={isPrimary}
                            onChange={() => setPrimaryImage(img)}
                          />
                          <span>Principal</span>
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {selectedExistingImages.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">Seleccionadas: {selectedExistingImages.length}. Principal: {primaryImage || '—'}</p>
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

          <div className="flex space-x-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
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
              {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm
