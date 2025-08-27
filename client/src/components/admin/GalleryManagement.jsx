import { useState, useEffect } from 'react'
import axios from 'axios'

const GalleryManagement = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [newName, setNewName] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/gallery')
      
      const imagesData = response.data.items || response.data

      setImages(imagesData)
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length !== files.length) {
      alert('Algunos archivos no son imágenes válidas y han sido omitidos')
    }
    
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles)
    } else {
      alert('Por favor selecciona archivos de imagen válidos')
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Por favor selecciona al menos una imagen')
      return
    }

    try {
      setUploading(true)
      
      // Subir cada imagen individualmente
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const formData = new FormData()
        formData.append('image', file)

        await axios.post('/api/gallery/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }

      setSelectedFiles([])
      fetchImages()
      alert(`¡${selectedFiles.length} imagen${selectedFiles.length > 1 ? 'es' : ''} subida${selectedFiles.length > 1 ? 's' : ''} exitosamente!`)
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Error al subir las imágenes')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return
    }

    try {
      await axios.delete(`/api/gallery/${imageId}`)
      fetchImages()
      alert('Imagen eliminada exitosamente')
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Error al eliminar la imagen')
    }
  }

  const handleEdit = (image) => {
    setEditingImage(image)
    setNewName(image.name)
  }

  const handleSaveEdit = async () => {
    if (!newName.trim()) {
      alert('El nombre no puede estar vacío')
      return
    }

    try {
      await axios.put(`/api/gallery/${editingImage.id}`, {
        name: newName.trim()
      })
      setEditingImage(null)
      setNewName('')
      fetchImages()
      alert('Nombre actualizado exitosamente')
    } catch (error) {
      console.error('Error updating image:', error)
      alert('Error al actualizar el nombre')
    }
  }

  const handleCancelEdit = () => {
    setEditingImage(null)
    setNewName('')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestión de Galería</h2>
        
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-4">
            <div>
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-1 text-sm text-gray-600">
                Arrastra imágenes aquí o haz clic para seleccionar múltiples imágenes
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Seleccionar imágenes
            </label>
            {selectedFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  {selectedFiles.length} imagen{selectedFiles.length > 1 ? 'es' : ''} seleccionada{selectedFiles.length > 1 ? 's' : ''}:
                </p>
                <div className="mt-1 max-h-20 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <p key={index} className="text-xs text-gray-500">• {file.name}</p>
                  ))}
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {uploading ? `Subiendo ${selectedFiles.length} imagen${selectedFiles.length > 1 ? 'es' : ''}...` : `Subir ${selectedFiles.length} imagen${selectedFiles.length > 1 ? 'es' : ''}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Imágenes de la Galería ({images.length})</h3>
        </div>
        
        {images.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay imágenes</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza subiendo tu primera imagen.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                  <div key={image.id} className="group relative bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.thumb || '/placeholder-image.jpg'}
                    alt={image.name || 'Imagen'}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      console.error('Error loading image:', image.thumb)
                      e.target.src = '/placeholder-image.jpg'
                    }}
                  />
                  
                  {/* Overlay with actions - only show when not editing */}
                  {(!editingImage || editingImage.id !== image.id) && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2">
                        <button
                          onClick={() => handleEdit(image)}
                          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                          title="Editar nombre"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(image.id)}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Image name */}
                  <div className="p-3 bg-white">
                    {editingImage?.id === image.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                          onKeyDown={(e) => e.key === 'Escape' && handleCancelEdit()}
                          autoFocus
                        />
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                            title="Guardar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Cancelar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {image.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GalleryManagement
