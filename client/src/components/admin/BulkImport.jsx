  import { useState } from 'react'
import axios from 'axios'

const BulkImport = ({ onSuccess, onCancel }) => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile)
      setError('')
      
      // Leer y mostrar preview del archivo
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          setPreview({
            totalProducts: Array.isArray(data) ? data.length : 0,
            sampleProduct: Array.isArray(data) && data.length > 0 ? data[0] : null
          })
        } catch (error) {
          setError('El archivo JSON no es válido')
          setPreview(null)
        }
      }
      reader.readAsText(selectedFile)
    } else {
      setError('Por favor selecciona un archivo JSON válido')
      setFile(null)
      setPreview(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const products = JSON.parse(event.target.result)
          
          if (!Array.isArray(products)) {
            throw new Error('El archivo debe contener un array de productos')
          }

          const token = localStorage.getItem('adminToken')
          const response = await axios.post('/api/products/bulk-import', 
            { products }, 
            { headers: { Authorization: `Bearer ${token}` } }
          )

          alert(`✅ ${response.data.message}`)
          if (onSuccess) onSuccess()
        } catch (error) {
          console.error('Error importing products:', error)
          setError(error.response?.data?.error || error.message || 'Error al importar productos')
        } finally {
          setLoading(false)
        }
      }
      reader.readAsText(file)
    } catch (error) {
      setError('Error al procesar el archivo')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Importación Masiva de Productos</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-medium text-blue-900 mb-2">Instrucciones:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• El archivo debe ser un JSON con un array de productos</li>
                <li>• Las categorías que no existan se crearán automáticamente</li>
                <li>• Campos soportados: Nombre, Categorias, Descripción, Marca, Precio original, Margen, Precio, Talle, Stock, Activo</li>
                <li>• Ejemplo de formato en el archivo products.json</li>
              </ul>
            </div>

            {/* Selección de archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar archivo JSON
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              />
            </div>

            {/* Preview */}
            {preview && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="font-medium text-gray-900 mb-2">Vista previa:</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Total de productos a importar: <span className="font-semibold">{preview.totalProducts}</span>
                </p>
                {preview.sampleProduct && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Ejemplo del primer producto:</p>
                    <pre className="mt-2 bg-white p-2 rounded border text-xs overflow-x-auto">
                      {JSON.stringify(preview.sampleProduct, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!file || loading}
                className={`px-4 py-2 rounded-md text-white ${
                  !file || loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[var(--primary)] hover:opacity-90'
                }`}
              >
                {loading ? 'Importando...' : 'Importar Productos'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BulkImport
