import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { useState } from 'react';

interface CartModalProps {
  onCheckout: () => void;
}

export function CartModal({ onCheckout }: CartModalProps) {
  const { items, isOpen, closeCart, updateQuantity, removeItem, total } = useCart();

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (items.length === 0) return;
    closeCart();
    onCheckout();
  };

  return (
    <div className="fixed inset-0 z-50" data-testid="modal-cart">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeCart}
        data-testid="overlay-cart"
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Carrito de compras</h3>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={closeCart}
              data-testid="button-close-cart"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center space-x-4 py-4 border-b last:border-b-0"
                    data-testid={`cart-item-${item.id}`}
                  >
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        data-testid={`img-cart-item-${item.id}`}
                      />
                    )}
                    <div className="flex-1">
                      <h4 
                        className="font-medium text-gray-900"
                        data-testid={`text-cart-item-name-${item.id}`}
                      >
                        {item.name}
                      </h4>
                      <p 
                        className="text-gray-600"
                        data-testid={`text-cart-item-price-${item.id}`}
                      >
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span 
                          className="px-2 py-1 bg-gray-100 rounded min-w-[2rem] text-center"
                          data-testid={`text-quantity-${item.id}`}
                        >
                          {item.quantity}
                        </span>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 ml-4"
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t p-6">
              <div className="flex justify-between text-lg font-semibold mb-4">
                <span>Total:</span>
                <span data-testid="text-cart-total">${total.toFixed(2)}</span>
              </div>
              <Button 
                onClick={handleCheckout}
                className="w-full"
                data-testid="button-checkout"
              >
                Proceder al checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
