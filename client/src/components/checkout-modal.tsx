import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/cart-context';
import { useCreateOrder } from '@/hooks/use-orders';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OrderFormData, orderFormSchema } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export function CheckoutModal({ isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const { items, total, clearCart } = useCart();
  const createOrderMutation = useCreateOrder();
  const { toast } = useToast();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      deliveryAddress: '',
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: OrderFormData) => {
    try {
      const orderData = {
        ...data,
        items: JSON.stringify(items),
        total: total.toString(),
      };

      const result = await createOrderMutation.mutateAsync(orderData);
      
      toast({
        title: "Pedido confirmado",
        description: "Tu pedido ha sido registrado exitosamente.",
      });

      clearCart();
      onSuccess(result.orderId);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar tu pedido. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50" data-testid="modal-checkout">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Finalizar compra</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose}
                data-testid="button-close-checkout"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="customerName">Nombre completo</Label>
                <Input 
                  id="customerName"
                  {...form.register('customerName')}
                  placeholder="Tu nombre completo"
                  data-testid="input-customer-name"
                />
                {form.formState.errors.customerName && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.customerName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customerEmail">Correo electrónico</Label>
                <Input 
                  id="customerEmail"
                  type="email"
                  {...form.register('customerEmail')}
                  placeholder="tu@email.com"
                  data-testid="input-customer-email"
                />
                {form.formState.errors.customerEmail && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.customerEmail.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customerPhone">Teléfono (opcional)</Label>
                <Input 
                  id="customerPhone"
                  type="tel"
                  {...form.register('customerPhone')}
                  placeholder="+1 (555) 123-4567"
                  data-testid="input-customer-phone"
                />
              </div>

              <div>
                <Label htmlFor="deliveryAddress">Dirección de entrega</Label>
                <Textarea 
                  id="deliveryAddress"
                  {...form.register('deliveryAddress')}
                  rows={3}
                  placeholder="Dirección completa para la entrega"
                  data-testid="textarea-delivery-address"
                />
                {form.formState.errors.deliveryAddress && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.deliveryAddress.message}
                  </p>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Resumen del pedido</h4>
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center py-2"
                    data-testid={`summary-item-${item.id}`}
                  >
                    <span className="text-gray-600">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total:</span>
                    <span data-testid="text-checkout-total">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start">
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Pago contra reembolso</p>
                    <p>Pagarás cuando recibas tu pedido. Nos pondremos en contacto contigo para coordinar la entrega.</p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full mt-6"
                data-testid="button-submit-order"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Confirmar pedido'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
