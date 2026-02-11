import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { Registration } from '@/types';

// Query keys
export const registrationKeys = {
  all: ['registrations'] as const,
  lists: () => [...registrationKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...registrationKeys.lists(), filters] as const,
  my: () => [...registrationKeys.all, 'my'] as const,
  detail: (id: string) => [...registrationKeys.all, 'detail', id] as const,
  qrCode: (id: string) => [...registrationKeys.all, 'qr', id] as const,
};

// Hook para listar inscrições (admin)
export function useRegistrationsQuery(filters?: Record<string, any>) {
  return useQuery({
    queryKey: registrationKeys.list(filters),
    queryFn: async () => {
      const response = await apiClient.get(endpoints.registrations.base, {
        params: filters,
      });
      return response.data as Registration[];
    },
  });
}

// Hook para minhas inscrições (participante)
export function useMyRegistrationsQuery() {
  return useQuery({
    queryKey: registrationKeys.my(),
    queryFn: async () => {
      const response = await apiClient.get(endpoints.registrations.my);
      return response.data as Registration[];
    },
  });
}

// Hook para detalhes da inscrição
export function useRegistrationQuery(id: string) {
  return useQuery({
    queryKey: registrationKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(endpoints.registrations.byId(id));
      return response.data as Registration;
    },
    enabled: !!id,
  });
}

// Hook para QR Code
export function useRegistrationQRQuery(id: string) {
  return useQuery({
    queryKey: registrationKeys.qrCode(id),
    queryFn: async () => {
      const response = await apiClient.get(endpoints.registrations.qrCode(id));
      return response.data as { qrCode: string; ticketNumber: string };
    },
    enabled: !!id,
  });
}

// Hook para mutations de inscrições
export function useRegistrationsMutation() {
  const queryClient = useQueryClient();
  
  // Criar checkout
  const checkoutMutation = useMutation({
    mutationFn: async (data: {
      ticketType: 'standard' | 'pro' | 'vip';
      paymentMethod: 'credit_card' | 'pix' | 'boleto';
      projectId: string;
    }) => {
      const response = await apiClient.post(endpoints.registrations.checkout, data);
      return response.data;
    },
  });
  
  // Verificar pagamento
  const verifyPaymentMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      const response = await apiClient.post(endpoints.registrations.verifyPayment, {
        registrationId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.my() });
    },
  });
  
  // Cancelar inscrição
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(endpoints.registrations.byId(id), {
        status: 'cancelled',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.my() });
    },
  });
  
  return {
    checkout: checkoutMutation.mutateAsync,
    verifyPayment: verifyPaymentMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    isLoading: checkoutMutation.isPending || verifyPaymentMutation.isPending,
  };
}
