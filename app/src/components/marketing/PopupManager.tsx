import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';
import { NewsletterPopup } from './NewsletterPopup';

export function PopupManager() {
  const { pathname } = useLocation();
  const { projectId } = useProject();
  const [activePopup, setActivePopup] = useState<any>(null);
  const [hasShownThisSession, setHasShownThisSession] = useState(false);

  useEffect(() => {
    // Reset para debugar ou se mudar de projeto (opcional)
    // Se quiser que mude de página resete o estado de exibição, remova hasShownThisSession da verificação
    
    async function checkPopups() {
      if (!projectId || hasShownThisSession) return;

      // Buscar popups ativos para este projeto
      const { data: popups, error } = await supabase
        .from('project_popups' as any)
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'active')
        .order('priority', { ascending: false });

      if (error || !popups || popups.length === 0) return;

      // Filtrar por página alvo
      const match = popups.find(p => {
        const targets = Array.isArray(p.target_pages) ? p.target_pages : ['*'];
        
        // Regra de match: * ou caminho exato
        return targets.includes('*') || 
               targets.includes(pathname) || 
               targets.some(t => t.endsWith('*') && pathname.startsWith(t.replace('*', '')));
      });

      if (match) {
        const delay = (match.show_after_seconds || 5) * 1000;
        
        const timer = setTimeout(() => {
          setActivePopup(match);
          setHasShownThisSession(true);
        }, delay);

        return () => clearTimeout(timer);
      }
    }

    checkPopups();
  }, [pathname, projectId, hasShownThisSession]);

  if (!activePopup) return null;

  return (
    <NewsletterPopup 
      config={activePopup} 
      onClose={() => setActivePopup(null)} 
    />
  );
}
