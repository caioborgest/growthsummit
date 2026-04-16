import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Registration } from '@/types';
import { logger } from '@/lib/logger';

export function useAdminRegistrations(projectId: string) {
  const [data, setData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Não autenticado');
        setLoading(false);
        return;
      }

      // 1. Verifica se é admin (Usa user_id, não id)
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profileErr || profile?.role !== 'admin') {
        logger.error('[useAdminRegistrations] Access denied or profile error:', profileErr);
        setError('Acesso negado');
        setLoading(false);
        return;
      }

      // 2. Busca os registros se autorizado
      const { data: regs, error: fetchError } = await supabase
        .from('growth_experience_registrations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setData(regs || []);
    } catch (err: any) {
      logger.error('[useAdminRegistrations] Error:', err);
      setError(err.message || 'Erro ao carregar inscrições');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  return { data, loading, error, refetch: fetchRegistrations };
}
