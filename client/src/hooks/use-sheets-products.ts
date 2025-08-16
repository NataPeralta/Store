import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicSheetsService, type SheetsProduct } from '@/services/google-sheets';

// Hook para leer productos directamente desde Google Sheets
export function useSheetsProducts() {
  return useQuery<SheetsProduct[]>({
    queryKey: ['sheets-products'],
    queryFn: () => publicSheetsService.getProducts(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useRefreshSheetsProducts() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await publicSheetsService.getProducts();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['sheets-products'], data);
    },
  });
}