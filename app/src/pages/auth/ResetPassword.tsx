import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';

export function ResetPassword() {
    const navigate = useNavigate();
    const { isLoading: authLoading, session } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Log para debug de token
        const hash = window.location.hash;
        const query = window.location.search;
        logger.debug('ResetPassword Mount:', { hasHash: !!hash, hasQuery: !!query });

        if (!authLoading && !session && !hash.includes('access_token')) {
            logger.warn('ResetPassword: Sem sessão ou token detectado');
            // Opcional: Redirecionar se realmente não tiver nada
        }
    }, [authLoading, session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);
        setError('');

        try {
            logger.info('Tentando atualizar senha...', { hasSession: !!session });

            // Garantir que temos uma sessão ativa antes de tentar o update
            const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                logger.error('Erro ao buscar sessão:', sessionError);
                throw sessionError;
            }

            if (!currentSession) {
                logger.warn('ResetPassword: Nenhuma sessão ativa encontrada via getSession()');
                throw new Error('Sessão expirada ou link inválido. Por favor, solicite um novo link de recuperação de senha.');
            }

            logger.info('Sessão validada. Chamando auth.updateUser...');

            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                logger.error('Erro retornado pelo supabase.auth.updateUser:', updateError);
                throw updateError;
            }

            setSuccess(true);
            toast.success('Senha atualizada com sucesso!');

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            logger.error('Erro ao atualizar senha:', err);
            setError(err.message || 'Erro ao atualizar senha. O link pode ter expirado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen h-[100dvh] bg-dark flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-orange-coral/10 rounded-full blur-3xl opacity-50" />

            <div className="relative z-10 w-full max-w-md">
                <div className="glass-card p-8 w-full border-white/10 shadow-2xl">
                    {!success ? (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-brand-orange-coral/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Lock className="h-8 w-8 text-brand-orange-coral" />
                                </div>
                                <h1 className="text-2xl font-black text-white tracking-tight">Nova Senha</h1>
                                <p className="text-gray-400 mt-2 text-sm font-medium">
                                    Crie uma nova senha segura para sua conta.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">
                                        Nova Senha
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-12 pr-12 bg-white/5 border-white/10 text-white h-14 rounded-xl focus:border-brand-orange-coral/50 transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">
                                        Confirmar Nova Senha
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-12 bg-white/5 border-white/10 text-white h-14 rounded-xl focus:border-brand-orange-coral/50 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                        <p className="text-xs text-red-400 font-medium leading-relaxed">{error}</p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading || authLoading}
                                    className="w-full h-14 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-xl shadow-lg shadow-brand-orange-coral/20 transition-all mt-4"
                                >
                                    {loading || authLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>{authLoading ? 'Validando link...' : 'Atualizando...'}</span>
                                        </div>
                                    ) : (
                                        'Redefinir Senha'
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6 space-y-6">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/10">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white tracking-tight">Sucesso!</h3>
                                <p className="text-gray-400 font-medium leading-relaxed">
                                    Sua senha foi redefinida. Você será redirecionado para o login em instantes.
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate('/login')}
                                className="w-full h-14 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl"
                            >
                                Ir para Login Agora
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
