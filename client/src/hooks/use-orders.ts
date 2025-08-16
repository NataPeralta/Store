import { useMutation } from '@tanstack/react-query';
import { InsertOrder } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (order: InsertOrder) => {
      const response = await apiRequest('POST', '/api/orders', order);
      return response.json();
    },
  });
}
