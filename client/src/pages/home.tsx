import { useState } from 'react';
import { Header } from '@/components/header';
import { ProductGrid } from '@/components/product-grid';
import { CartModal } from '@/components/cart-modal';
import { CheckoutModal } from '@/components/checkout-modal';
import { OrderConfirmationModal } from '@/components/order-confirmation-modal';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';

export default function Home() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const { openCart, itemCount } = useCart();

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleCheckoutClose = () => {
    setIsCheckoutOpen(false);
  };

  const handleOrderSuccess = (newOrderId: string) => {
    setIsCheckoutOpen(false);
    setOrderId(newOrderId);
    setIsConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false);
    setOrderId('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">Bienvenido a nuestra tienda virtual</h2>
            <p className="text-lg opacity-90 mb-6">
              Descubre nuestros productos y realiza tu compra con entrega contra reembolso
            </p>
            <Button 
              variant="secondary"
              onClick={() => {
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              data-testid="button-view-products"
            >
              Ver productos
            </Button>
          </div>
        </div>

        {/* Products Section */}
        <div id="products">
          <ProductGrid />
        </div>
      </main>

      {/* Floating Cart Button (Mobile) */}
      <button 
        onClick={openCart}
        className="fixed bottom-6 right-6 lg:hidden bg-primary hover:bg-primary/90 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all z-40"
        data-testid="button-floating-cart"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19" />
        </svg>
        {itemCount > 0 && (
          <span 
            className="absolute -top-2 -right-2 bg-white text-primary text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold"
            data-testid="text-floating-cart-count"
          >
            {itemCount}
          </span>
        )}
      </button>

      {/* Modals */}
      <CartModal onCheckout={handleCheckout} />
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={handleCheckoutClose}
        onSuccess={handleOrderSuccess}
      />
      <OrderConfirmationModal 
        isOpen={isConfirmationOpen}
        orderId={orderId}
        onClose={handleConfirmationClose}
      />
    </div>
  );
}
