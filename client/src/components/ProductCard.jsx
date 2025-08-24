import { useState } from 'react'
import { useCart } from '../context/CartContext'
import ImageGallery from './ImageGallery'

const ProductCard = ({ product }) => {
  
  const { addItem, items } = useCart()
  const [showGallery, setShowGallery] = useState(false)
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0)

  // Verificar si el producto ya está en el carrito
  const isInCart = items.some(item => item.id === product.id)

  const handleAddToCart = () => {
    addItem(product)
  }

  const openImageGallery = () => {
    
    if (product.images && product.images.length > 0) {  
      setGalleryInitialIndex(0)
      setShowGallery(true)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagen del producto */}
      <div className="aspect-w-1 aspect-h-1 w-full relative">
        {product.images && product.images.length > 0 ? (
          <>
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                openImageGallery()
              }}
            />
            {/* Indicador de múltiples imágenes */}
            {product.images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                +{product.images.length - 1}
              </div>
            )}
            {/* Botón de prueba para galería */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                openImageGallery()
              }}
              className="absolute top-2 left-2 bg-[var(--primary)] text-white px-3 py-1 rounded text-sm font-medium hover:opacity-90 z-10"
            >
              Ver Galería
            </button>
            
            {/* Indicador de click */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center pointer-events-none">
              <div className="opacity-0 hover:opacity-100 transition-opacity text-white text-sm font-medium">
                Ver galería
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        
        {((Array.isArray(product.category_names) && product.category_names.length > 0) || product.category_name) && (
          <p className="text-sm text-gray-500 mb-2">
            {Array.isArray(product.category_names) && product.category_names.length > 0
              ? product.category_names.join(', ')
              : product.category_name}
          </p>
        )}

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {product.brand && (
          <p className="text-sm text-gray-500 mb-2">
            Marca: {product.brand}
          </p>
        )}

        {product.size && (
          <p className="text-sm text-gray-500 mb-2">
            Talle: {product.size}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
              {`USD ${product.price?.toLocaleString()}${(typeof product.price_ars !== 'undefined' && product.price_ars !== null) ? ` / ARS ${product.price_ars.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}`}
            </p>
            {product.original_price && product.original_price > product.price && (
              <p className="text-sm text-gray-500 line-through">
                {`USD ${product.original_price?.toLocaleString()}${(typeof product.original_price_ars !== 'undefined' && product.original_price_ars !== null) ? ` / ARS ${product.original_price_ars.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}`}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || isInCart}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            product.stock > 0 && !isInCart
              ? 'bg-[var(--primary)] text-white hover:opacity-90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.stock > 0 
            ? isInCart 
              ? `En carrito`
              : 'Agregar al carrito'
            : 'Sin stock'
          }
        </button>
      </div>
      
      {/* Galería de imágenes */}
      {showGallery && product.images && product.images.length > 0 && (
        <>
          <ImageGallery
            images={product.images}
            initialIndex={galleryInitialIndex}
            onClose={() => setShowGallery(false)}
          />
        </>
      )}
    </div>
  )
}

export default ProductCard
