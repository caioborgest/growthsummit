import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { registrationService } from '@/services/registrationService';
import type { Registration } from '@/types';
import { logger } from '@/lib/logger';

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
      let query: any = supabase.from('registrations' as any).select('*, coupon_code, discount_type, discount_amount, final_price');
      
      if (filters?.email) query = query.eq('email', filters.email);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.projectId) query = query.eq('project_id', filters.projectId);

      const { data, error } = await query;
      if (error) throw error;
      return data as Registration[];
    },
  });
}

// Hook para minhas inscrições (participante)
export function useMyRegistrationsQuery() {
  return useQuery({
    queryKey: registrationKeys.my(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await (supabase
        .from('registrations' as any)
        .select('*, coupon_code, discount_type, discount_amount, final_price')
        .eq('user_id', user.id));

      if (error) throw error;
      return data as Registration[];
    },
  });
}

// Hook para detalhes da inscrição
export function useRegistrationQuery(id: string) {
  return useQuery({
    queryKey: registrationKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('registrations' as any)
        .select('*, coupon_code, discount_type, discount_amount, final_price')
        .eq('id', id)
        .single());

      if (error) throw error;
      return data as Registration;
    },
    enabled: !!id,
  });
}

// Hook para QR Code (Simulado via metadata por enquanto ou campo qr_code)
export function useRegistrationQRQuery(id: string) {
  return useQuery({
    queryKey: registrationKeys.qrCode(id),
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('registrations' as any)
        .select('id, ticket_number, qr_code')
        .eq('id', id)
        .single());

      if (error) throw error;
      const row = data as { qr_code?: string | null; ticket_number?: string | null; id: string };
      return {
        qrCode: row.qr_code ?? null,
        ticketNumber: row.ticket_number || '0000',
        registrationId: row.id,
      };
    },
    enabled: !!id,
  });
}

// Hook para mutations de inscrições
export function useRegistrationsMutation() {
  const queryClient = useQueryClient();
  
  // Criar checkout (Mapeia para a lógica de inscrição do Supabase)
  const checkoutMutation = useMutation({
    mutationFn: async (data: {
      ticketType: 'standard' | 'pro' | 'vip';
      paymentMethod: 'credit_card' | 'pix' | 'boleto';
      projectId: string;
      dadosInscricao?: any; // Dados extras necessários para o Supabase
    }) => {
      logger.info('[useRegistrationsMutation] Iniciando checkout via Supabase');
      
      // Se tivermos os dados brutos da inscrição, usamos o service
      if (data.dadosInscricao) {
        return registrationService.registerWithSlots(data.dadosInscricao);
      }

      // Fallback básico para checkout via API simulada no client
      throw new Error('Assinatura de checkout requer dados completos da inscrição para processar via Supabase.');
    },
  });
  
  // Verificar pagamento (Polling local ou trigger de confirmação)
  const verifyPaymentMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      const { data, error } = await (supabase
        .from('registrations' as any)
        .select('payment_status')
        .eq('id', registrationId)
        .single());

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.my() });
    },
  });
  
  // Cancelar inscrição
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await (supabase
        .from('registrations' as any)
        .update({ status: 'cancelled' })
        .eq('id', id));

      if (error) throw error;
      return data;
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
