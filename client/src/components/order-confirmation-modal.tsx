import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
}

export function OrderConfirmationModal({ isOpen, orderId, onClose }: OrderConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" data-testid="modal-order-confirmation">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-2xl text-emerald-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Pedido confirmado!</h3>
            <p className="text-gray-600 mb-6">
              Tu pedido ha sido registrado exitosamente. Te contactaremos pronto para coordinar la entrega.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Número de pedido:</strong>{' '}
                <span data-testid="text-order-id" className="font-mono">
                  #{orderId.slice(0, 8).toUpperCase()}
                </span>
              </p>
            </div>
            <Button 
              onClick={onClose}
              className="w-full"
              data-testid="button-continue-shopping"
            >
              Continuar comprando
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
