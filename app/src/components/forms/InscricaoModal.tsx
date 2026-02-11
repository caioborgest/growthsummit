import { useState } from 'react';
import { X, Loader2, CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface InscricaoModalProps {
    isOpen: boolean;
    onClose: () => void;
    tipo: 'palestra' | 'mentor' | 'cursos';
    eventoNome: string;
}

const WHATSAPP_NUMBER = '5588988432310';

export function InscricaoModal({ isOpen, onClose, tipo, eventoNome }: InscricaoModalProps) {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        empresa: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const getTitulo = () => {
        switch (tipo) {
            case 'palestra':
                return 'Inscrição Palestra Noturna';
            case 'mentor':
                return 'Inscrição Mentor 1:1';
            case 'cursos':
                return 'Inscrição Cursos e Treinamentos';
            default:
                return 'Inscrição';
        }
    };

    const getValor = () => {
        return tipo === 'palestra' ? 'R$ 179,99' : 'Gratuito';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Validação básica
            if (!formData.nome || !formData.email || !formData.telefone) {
                throw new Error('Por favor, preencha todos os campos obrigatórios');
            }

            // Validação de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error('Por favor, insira um email válido');
            }

            // Inserir no Supabase
            const { error: supabaseError } = await supabase
                .from('inscricoes_growth_experience_triunfo')
                .insert([
                    {
                        nome: formData.nome,
                        email: formData.email,
                        telefone: formData.telefone,
                        empresa: formData.empresa || null,
                        tipo_inscricao: tipo,
                        evento: eventoNome,
                        valor: tipo === 'palestra' ? 179.99 : 0,
                        status: 'pendente',
                        created_at: new Date().toISOString(),
                    },
                ]);

            if (supabaseError) throw supabaseError;

            // Analytics tracking
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'inscricao_enviada', {
                    event_category: 'Growth Experience Triunfo',
                    event_label: tipo,
                    value: tipo === 'palestra' ? 179.99 : 0,
                });
            }

            // Se for palestra, redirecionar para WhatsApp para pagamento
            if (tipo === 'palestra') {
                const mensagem = encodeURIComponent(
                    `Olá! Gostaria de finalizar minha inscrição para a Palestra Noturna do Growth Experience Triunfo-PE.\n\n` +
                    `Nome: ${formData.nome}\n` +
                    `Email: ${formData.email}\n` +
                    `Telefone: ${formData.telefone}\n` +
                    `Valor: R$ 179,99`
                );

                // Abrir WhatsApp em nova aba
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensagem}`, '_blank');
            }

            setIsSuccess(true);

            // Resetar formulário após 3 segundos
            setTimeout(() => {
                setFormData({ nome: '', email: '', telefone: '', empresa: '' });
                setIsSuccess(false);
                onClose();
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar inscrição. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-card max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Fechar"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Success State */}
                {isSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-teal-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {tipo === 'palestra' ? 'Redirecionando para Pagamento!' : 'Inscrição Enviada!'}
                        </h3>
                        <p className="text-gray-400">
                            {tipo === 'palestra'
                                ? 'Você será redirecionado para o WhatsApp para finalizar o pagamento.'
                                : 'Você receberá um email de confirmação em breve.'
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">{getTitulo()}</h2>
                            <p className="text-gray-400">Growth Experience Triunfo-PE</p>
                            <div className="mt-3 inline-block px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                                <span className="text-orange-400 font-semibold">{getValor()}</span>
                            </div>
                            {tipo === 'palestra' && (
                                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5 text-green-400" />
                                    <p className="text-sm text-green-400">
                                        Pagamento via WhatsApp
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-2">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="Seu nome completo"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="telefone" className="block text-sm font-medium text-gray-300 mb-2">
                                    Telefone/WhatsApp *
                                </label>
                                <input
                                    type="tel"
                                    id="telefone"
                                    name="telefone"
                                    value={formData.telefone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            <div>
                                <label htmlFor="empresa" className="block text-sm font-medium text-gray-300 mb-2">
                                    Empresa (opcional)
                                </label>
                                <input
                                    type="text"
                                    id="empresa"
                                    name="empresa"
                                    value={formData.empresa}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="Nome da sua empresa"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1 border-dark-300 text-gray-300 hover:text-white"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            {tipo === 'palestra' && <MessageCircle className="h-4 w-4 mr-2" />}
                                            {tipo === 'palestra' ? 'Pagar via WhatsApp' : 'Confirmar Inscrição'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Ao se inscrever, você concorda com nossos termos de uso e política de privacidade.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
