import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['/api/products'],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRefreshProducts() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/products/refresh');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/products'], data);
    },
  });
}
