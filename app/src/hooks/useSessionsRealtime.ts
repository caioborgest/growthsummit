/**
 * Hook que combina useSessions com subscription em tempo real.
 * Quando o admin altera programação (INSERT/UPDATE/DELETE), o PWA reflete imediatamente.
 */
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSessions } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';

export function useSessionsRealtime() {
  const { projectId } = useProject();
  const { data, isLoading, error, refetch } = useSessions();

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`event_schedule_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_schedule',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, refetch]);

  return { data, isLoading, error, refetch };
}
