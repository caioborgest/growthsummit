import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/PageLoader';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

export function AuthCallback() {
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            logger.info('[AuthCallback] Evento detectado:', event);
            
            if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
                logger.info('[AuthCallback] Sessão confirmada. Redirecionando para Home...');
                // Redireciona para / e deixa o componente Home (App.tsx) lidar com a role
                navigate('/', { replace: true });
            }
        });

        // Fallback: se em 10 segundos nada acontecer, volta pro login
        const timer = setTimeout(() => {
            supabase.auth.getSession().then(({ data }) => {
                if (!data.session) {
                    logger.warn('[AuthCallback] Timeout atingido sem sessão detectada.');
                    navigate('/login', { replace: true });
                }
            });
        }, 10000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, [navigate]);

    return <PageLoader />;
}
