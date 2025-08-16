import { ShoppingCartIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProducts, useRefreshProducts } from '@/hooks/use-products';
import { useCart } from '@/contexts/cart-context';
import { CartItem } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function ProductGrid() {
  const { data: products = [], isLoading, error } = useProducts();
  const refreshMutation = useRefreshProducts();
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: any) => {
    if (product.stock <= 0) {
      toast({
        title: "Producto agotado",
        description: "Este producto no está disponible en este momento.",
        variant: "destructive",
      });
      return;
    }

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1,
      image: product.image,
      stock: product.stock,
    };

    addItem(cartItem);
    
    toast({
      title: "Producto agregado",
      description: `${product.name} se agregó a tu carrito.`,
    });
  };

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error al cargar los productos</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Refresh */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-2xl font-bold text-gray-900">Nuestros Productos</h3>
          <Button 
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
            variant="outline"
            size="sm"
            data-testid="button-refresh-products"
          >
            <RefreshCw className={`h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-gray-600">Cargando productos...</span>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="overflow-hidden hover:shadow-md transition-shadow"
              data-testid={`card-product-${product.id}`}
            >
              {product.image && (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className={`w-full h-48 object-cover ${product.stock <= 0 ? 'grayscale' : ''}`}
                  data-testid={`img-product-${product.id}`}
                />
              )}
              <CardContent className="p-4">
                <h4 
                  className="font-semibold text-gray-900 mb-2"
                  data-testid={`text-product-name-${product.id}`}
                >
                  {product.name}
                </h4>
                {product.description && (
                  <p 
                    className="text-gray-600 text-sm mb-3"
                    data-testid={`text-product-description-${product.id}`}
                  >
                    {product.description}
                  </p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span 
                    className="text-2xl font-bold text-gray-900"
                    data-testid={`text-product-price-${product.id}`}
                  >
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  <Badge 
                    variant={product.stock > 0 ? "secondary" : "destructive"}
                    data-testid={`badge-stock-${product.id}`}
                  >
                    {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
                  </Badge>
                </div>
                <Button 
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className="w-full"
                  data-testid={`button-add-cart-${product.id}`}
                >
                  <ShoppingCartIcon className="mr-2 h-4 w-4" />
                  {product.stock > 0 ? 'Agregar al carrito' : 'No disponible'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No hay productos disponibles en este momento.</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar productos
          </Button>
        </div>
      )}
    </div>
  );
}
