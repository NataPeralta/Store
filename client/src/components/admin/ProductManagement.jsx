import { useState, useEffect } from 'react'
import axios from 'axios'
import ProductForm from './ProductForm'

const ProductManagement = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/admin/products')
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
      const response = await axios.get('/api/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return
    }

    try {
      await axios.delete(`/api/admin/products/${productId}`)
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

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      await axios.put(`/api/admin/products/${productId}`, {
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Gestión de Productos</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          + Nuevo Producto
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay productos disponibles.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {products.map((product) => (
              <li key={product.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
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
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Categoría: {product.category_name || 'Sin categoría'}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Marca: {product.brand || 'Sin marca'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Precio: <span className="font-semibold">${product.price?.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Stock: {product.stock} unidades
                        </p>
                      </div>
                      {product.description && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 truncate">
                            {product.description}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
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
                        onClick={() => handleEdit(product)}
                        className="text-sm font-medium hover:opacity-90"
                        style={{ color: 'var(--primary)' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
    </div>
  )
}

export default ProductManagement
