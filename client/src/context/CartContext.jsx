import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext()

// Función para cargar el carrito desde localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('sheetCart')
    return savedCart ? JSON.parse(savedCart) : { items: [] }
  } catch (error) {
    console.error('Error cargando carrito desde localStorage:', error)
    return { items: [] }
  }
}

// Función para guardar el carrito en localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('sheetCart', JSON.stringify(cart))
  } catch (error) {
    console.error('Error guardando carrito en localStorage:', error)
  }
}

const cartReducer = (state, action) => {
  let newState

  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id)
      if (!existingItem) {
        newState = {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }]
        }
      } else {
        // Si ya existe, no hacer nada (no duplicar)
        newState = state
      }
      break

    case 'REMOVE_ITEM':
      newState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      }
      break

    case 'CLEAR_CART':
      newState = {
        ...state,
        items: []
      }
      break

    default:
      return state
  }

  // Guardar en localStorage después de cada cambio
  saveCartToStorage(newState)
  return newState
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, loadCartFromStorage())

  const addItem = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product })
  }

  const removeItem = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const getTotal = () => {
    return state.items.reduce((total, item) => total + item.price, 0)
  }

  const getItemCount = () => {
    return state.items.length
  }

  return (
    <CartContext.Provider value={{
      items: state.items,
      addItem,
      removeItem,
      clearCart,
      getTotal,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider')
  }
  return context
}
