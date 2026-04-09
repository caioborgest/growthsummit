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
        // O Supabase Auth Helper geralmente cuida da troca do código/hash por sessão
        // Mas precisamos redirecionar o usuário para a área correta baseada na role

        const handleAuthCallback = async () => {
            try {
                // 1. Verificar se há um código na URL para troca (PKCE)
                const params = new URLSearchParams(window.location.search);
                const code = params.get('code');

                if (code) {
                    logger.info('[AuthCallback] Código detectado, trocando por sessão...');
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;
                }

                // 2. Tentar obter a sessão atual (já trocada ou via hash/token)
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;

                if (!session) {
                    logger.warn('[AuthCallback] Nenhuma sessão encontrada após processamento');
                    // Aguardar um pouco para o AuthContext processar se necessário
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    const { data: { session: secondTry } } = await supabase.auth.getSession();
                    if (!secondTry) {
                        navigate('/login', { replace: true });
                        return;
                    }
                }

                // 3. Redirecionamento baseado na Role
                // Se o AuthContext já carregou o usuário, usamos ele, senão forçamos uma espera curta
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
                    logger.info('[AuthCallback] Login bem sucedido! Redirecionando para:', targetPath);
                    navigate(targetPath, { replace: true });
                }
            } catch (err: any) {
                logger.error('[AuthCallback] Erro crítico no callback:', err.message);
                toast.error('Falha na autenticação. Tente novamente.');
                navigate('/login', { replace: true });
            }
        };

        handleAuthCallback();
    }, [user, isLoading, navigate]);

    return <PageLoader />;
}
