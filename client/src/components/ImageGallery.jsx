import { useState, useEffect } from 'react'

const ImageGallery = ({ images, initialIndex = 0, onClose }) => {
  console.log('ImageGallery component rendered')
  console.log('images:', images)
  console.log('initialIndex:', initialIndex)
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowLeft') {
      goToPrevious()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (images.length === 0) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
      style={{ 
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div className="relative w-full h-full p-8 flex items-center justify-center">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-white text-2xl font-bold hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
        >
          ×
        </button>

        {/* Botón anterior */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 text-white text-3xl font-bold hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
          >
            ‹
          </button>
        )}

        {/* Imagen principal */}
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src={images[currentIndex]} 
            alt={`Imagen ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            style={{ 
              maxHeight: 'calc(100vh - 4rem)',
              maxWidth: 'calc(100vw - 4rem)'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Botón siguiente */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-white text-3xl font-bold hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
          >
            ›
          </button>
        )}

        {/* Indicador de posición */}
        {images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Miniaturas en la parte inferior */}
        {images.length > 1 && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Miniatura ${index + 1}`}
                className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                  index === currentIndex ? 'border-white' : 'border-transparent'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageGallery
