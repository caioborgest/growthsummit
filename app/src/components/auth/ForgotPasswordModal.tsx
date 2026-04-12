import { useState } from 'react';
import { Mail, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (resetError) throw resetError;

            setSubmitted(true);
            toast.success('Link de recuperação enviado!');
        } catch (err: any) {
            logger.error('Erro ao recuperar senha:', err);
            setError(err.message || 'Erro ao processar solicitação. Verifique o email informado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-dark-100 border-white/10 text-white max-w-md rounded-2xl sm:rounded-3xl shadow-2xl">
                {!submitted ? (
                    <>
                        <DialogHeader className="space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-brand-orange-coral/20 flex items-center justify-center mb-2">
                                <Mail className="h-6 w-6 text-brand-orange-coral" />
                            </div>
                            <DialogTitle className="text-2xl font-black tracking-tight">Recuperar Senha</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Digite seu email para receber um link de redefinição de senha.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 pt-4 custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">
                                    Seu Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <Input
                                        type="email"
                                        placeholder="exemplo@gmail.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-12 bg-white/5 border-white/10 text-white h-14 rounded-xl focus:border-brand-orange-coral/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                    <p className="text-xs text-red-400 font-medium leading-relaxed">{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="h-14 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-xl shadow-lg shadow-brand-orange-coral/20 transition-all group"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Enviar Link de Recuperação
                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white hover:bg-white/5 font-bold"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8 space-y-6">
                        <DialogTitle className="sr-only">Email de Recuperação Enviado</DialogTitle>
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/10">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">Email Enviado!</h3>
                            <p className="text-gray-400">
                                Se o email <strong className="text-white">{email}</strong> estiver cadastrado, você receberá um link em alguns instantes.
                            </p>
                        </div>
                        <div className="pt-4 border-t border-white/5 space-y-4">
                            <p className="text-xs text-gray-500 leading-relaxed italic">
                                Não esqueça de verificar sua caixa de <strong className="text-gray-400">Spam</strong> ou <strong className="text-gray-400">Promoções</strong>.
                            </p>
                            <Button
                                onClick={onClose}
                                className="w-full h-14 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl"
                            >
                                Voltar ao Login
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
