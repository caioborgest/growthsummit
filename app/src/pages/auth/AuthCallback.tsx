import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/PageLoader';
import { logger } from '@/lib/logger';

export function AuthCallback() {
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        // O Supabase Auth Helper geralmente cuida da troca do código/hash por sessão
        // Mas precisamos redirecionar o usuário para a área correta baseada na role

        const handleAuthCallback = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                logger.warn('[AuthCallback] Nenhuma sessão encontrada após callback');
                navigate('/login', { replace: true });
                return;
            }

            // Se o AuthContext já carregou o usuário, redirecionamos
            if (!isLoading && user) {
                const rolesToPaths: Record<string, string> = {
                    'admin': '/admin',
                    'mentor': '/mentor-area',
                    'company': '/empresa-area',
                    'startup': '/startup-area',
                    'sponsor': '/patrocinador-area',
                    'participant': '/minha-area',
                    'participante': '/minha-area'
                };

                const targetPath = rolesToPaths[user.role] || '/';
                logger.info('[AuthCallback] Redirecionando para:', targetPath);
                navigate(targetPath, { replace: true });
            }
        };

        handleAuthCallback();
    }, [user, isLoading, navigate]);

    return <PageLoader />;
}
