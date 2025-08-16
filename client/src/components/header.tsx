import { ShoppingCart, Store } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';

export function Header() {
  const { itemCount, openCart } = useCart();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              <Store className="inline-block text-primary mr-2" size={28} />
              <span>Tienda Virtual</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={openCart}
              data-testid="button-cart"
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span 
                  data-testid="text-cart-count"
                  className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
