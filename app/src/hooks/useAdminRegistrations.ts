import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Registration } from '@/types';

export function useAdminRegistrations(projectId: string) {
  const [data, setData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Verifica se é admin (Usa user_id, não id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profile?.role !== 'admin') {
          console.warn('[useAdminRegistrations] Access denied: user is not admin');
          setLoading(false);
          return;
        }

        // Busca os registros
        const { data: regs, error } = await supabase
          .from('growth_experience_registrations')
          .select('*')
          .eq('project_id', projectId)
          .order('name');

        if (error) throw error;

        setData(regs || []);
      } catch (error) {
        console.error('[useAdminRegistrations] Error fetching registrations:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (projectId) {
      fetch();
    }
  }, [projectId]);

  return { data, loading };
}
