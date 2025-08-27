import { useState, useEffect } from 'react'
import axios from 'axios'
import ProductForm from './ProductForm'
import BulkImport from './BulkImport'

const ProductManagement = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])
  
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products/admin')
      setProducts(response.data)
    } catch (error) {
      setError('Error al cargar los productos')
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories/active')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Derivados de filtrado
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const nameFilteredProducts = normalizedSearch
    ? products.filter((p) => {
        const haystack = `${p.name || ''} ${p.brand || ''}`.toLowerCase()
        return haystack.includes(normalizedSearch)
      })
    : products

  // Categorías disponibles según búsqueda por nombre
  const availableCategoryIds = new Set()
  nameFilteredProducts.forEach((p) => {
    if (Array.isArray(p.categories)) {
      p.categories.forEach((cat) => availableCategoryIds.add(cat.categoryId))
    }
  })
  const filteredCategoryOptions = categories.filter((c) => availableCategoryIds.has(c.id))

  // Asegurar que la categoría seleccionada siga siendo válida tras la búsqueda (sin setState en render)
  useEffect(() => {
    if (selectedCategory !== 'all' && !availableCategoryIds.has(parseInt(selectedCategory))) {
      setSelectedCategory('all')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, products])

  // Productos finales filtrados por nombre + categoría
  const filteredProducts = nameFilteredProducts.filter((p) => {
    if (selectedCategory === 'all') return true
    const catId = parseInt(selectedCategory)
    if (Array.isArray(p.categories)) {
      return p.categories.some(cat => cat.categoryId === catId)
    }
    return false
  })

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return
    }

    try {
      await axios.delete(`/api/products/${productId}`)
      fetchProducts()
    } catch (error) {
      setError('Error al eliminar el producto')
      console.error('Error deleting product:', error)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingProduct(null)
    fetchProducts()
  }

  const handleBulkImportSuccess = () => {
    setShowBulkImport(false)
    fetchProducts()
  }

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      await axios.put(`/api/products/${productId}`, {
        active: !currentStatus
      })
      fetchProducts()
    } catch (error) {
      setError('Error al actualizar el estado del producto')
      console.error('Error updating product status:', error)
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Gestión de Productos</h2>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end">
          <input
            type="text"
            placeholder="Buscar por nombre o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] md:min-w-[260px] md:w-72 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 md:w-56 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          >
            <option value="all">Todas</option>
            {filteredCategoryOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowBulkImport(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            📥 Importar Masivo
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            + Nuevo Producto
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay productos disponibles.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <li key={product.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    {/* Preview 256x256 */}
                    <div className="flex-shrink-0 sm:mr-4">
                      {Array.isArray(product.images) && product.images.length > 0 ? (
                        <img
                          src={`/uploads/${product.images[0].gallery.previewPath}`}
                          alt={product.name}
                          className="w-28 h-28 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-28 h-28 bg-gray-200 rounded border flex items-center justify-center">
                          <span className="text-gray-400">Sin imagen</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--primary)' }}>
                          {product.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Categorías:</span> {Array.isArray(product.categories) && product.categories.length > 0 ? product.categories.map(cat => cat.category.name).join(', ') : 'Sin categoría'}
                            </p>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Marca:</span> {product.brand || 'Sin marca'}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Precio USD:</span> <span className="font-semibold">${product.price?.toLocaleString()}</span>
                            </p>
                            {typeof product.price_ars !== 'undefined' && product.price_ars !== null && (
                              <p className="text-sm text-gray-500">
                                <span className="font-medium">Precio ARS:</span> <span className="font-semibold">{product.price_ars.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Stock:</span> {product.stock} unidades
                          </p>
                        </div>
                      </div>
                      {product.description && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 truncate">
                            {product.description}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="sm:ml-4 flex-shrink-0 flex flex-col order-last sm:order-none gap-2 ">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-sm font-medium hover:opacity-90 border rounded-md px-2 py-1"
                        style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleProductStatus(product.id, product.active)}
                        className={`text-sm px-3 py-1 rounded ${
                          product.active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {product.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium border border-red-600 rounded-md px-2 py-1"
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

      {/* Modal de formulario */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false)
            setEditingProduct(null)
          }}
        />
      )}

      {/* Modal de bulk import */}
      {showBulkImport && (
        <BulkImport
          onSuccess={handleBulkImportSuccess}
          onCancel={() => setShowBulkImport(false)}
        />
      )}
    </div>
  )
}

export default ProductManagement
