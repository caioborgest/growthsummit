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
        senha: '',
        confirmarSenha: ''
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
                return 'Inscrição Mentorado 1:1';

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
            if (!formData.nome || !formData.email || !formData.telefone || !formData.senha || !formData.confirmarSenha) {
                throw new Error('Por favor, preencha todos os campos obrigatórios');
            }

            // Validação de senhas
            if (formData.senha !== formData.confirmarSenha) {
                throw new Error('As senhas não coincidem');
            }

            if (formData.senha.length < 6) {
                throw new Error('A senha deve ter pelo menos 6 caracteres');
            }

            // Validação de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error('Por favor, insira um email válido');
            }

            // 0. Verificar se já existe uma sessão ativa
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            let user = existingSession?.user;
            let authError = null;

            if (!user) {
                // 1. Criar usuário no Supabase Auth se não houver sessão
                const { data: authData, error: sError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.senha,
                    options: {
                        data: {
                            name: formData.nome,
                            phone: formData.telefone,
                            role: (tipo === 'mentor') ? 'mentor' : 'participante'
                        }
                    }
                });
                user = authData?.user || null;
                authError = sError;
            }

            if (authError) {
                if (authError.message.includes('already registered')) {
                    throw new Error('Este email já está cadastrado. Por favor, faça login ou use outro email.');
                }
                throw authError;
            }

            if (!user) {
                throw new Error('Erro ao identificar usuário para inscrição');
            }

            // 2. Inserir no Supabase dependendo do tipo
            let supabaseQuery;

            if (tipo === 'mentor') {
                supabaseQuery = supabase.from('mentorias_agendadas').insert({
                    mentorado_id: user.id,
                    nome_mentorado: formData.nome,
                    email_mentorado: formData.email,
                    telefone_mentorado: formData.telefone,
                    status: 'pendente'
                });
            } else {
                supabaseQuery = supabase.from('inscricoes_growth_experience').insert({
                    user_id: user.id,
                    nome: formData.nome,
                    email: formData.email,
                    telefone: formData.telefone,
                    empresa: formData.empresa || null,
                    tipo_inscricao: tipo,
                    evento: eventoNome,
                    valor_pago: tipo === 'palestra' ? 179.99 : 0,
                    status_pagamento: tipo === 'palestra' ? 'pendente' : 'pago',
                    status: 'ativo'
                });
            }

            const { error: supabaseError } = await supabaseQuery;
            if (supabaseError) throw supabaseError;

            // Analytics
            const win = window as Window & { gtag?: (type: string, name: string, data: Record<string, unknown>) => void };
            if (typeof window !== 'undefined' && win.gtag) {
                win.gtag('event', 'inscricao_enviada', {
                    event_category: 'Growth Experience Triunfo',
                    event_label: tipo,
                    value: tipo === 'palestra' ? 179.99 : 0,
                });
            }

            // Redirecionamento WhatsApp para palestra
            if (tipo === 'palestra') {
                const mensagem = encodeURIComponent(
                    `Olá! Gostaria de finalizar minha inscrição para a Palestra Noturna do Growth Experience Triunfo-PE.\n\n` +
                    `Nome: ${formData.nome}\n` +
                    `Email: ${formData.email}\n` +
                    `Telefone: ${formData.telefone}\n` +
                    `Valor: R$ 179,99`
                );
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensagem}`, '_blank');
            }

            setIsSuccess(true);

            setTimeout(() => {
                setFormData({
                    nome: '',
                    email: '',
                    telefone: '',
                    empresa: '',
                    senha: '',
                    confirmarSenha: ''
                });
                setIsSuccess(false);
                onClose();
            }, 3000);

        } catch (err: unknown) {
            console.error('Erro ao enviar inscrição:', err);
            let errorMessage = 'Ops! Houve um erro ao processar sua inscrição.';

            if (err instanceof Error) {
                if (err.message.includes('rate limit exceeded')) {
                    errorMessage = 'Muitas tentativas em pouco tempo. Por favor, aguarde 60 segundos e tente confirmar novamente.';
                } else {
                    errorMessage = err.message;
                }
            }
            setError(errorMessage);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-card max-w-md w-full p-4 sm:p-6 relative animate-in fade-in zoom-in duration-300 rounded-2xl sm:rounded-3xl max-h-[96vh] sm:max-h-[90vh] overflow-y-auto">
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
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 leading-tight">{getTitulo()}</h2>
                            <p className="text-xs sm:text-sm text-gray-400">Growth Experience Triunfo-PE</p>
                            <div className="mt-3 inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                                <span className="text-orange-400 text-sm sm:text-base font-semibold">{getValor()}</span>
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

                            <div>
                                <label htmlFor="senha" className="block text-sm font-medium text-gray-300 mb-2">
                                    Senha *
                                </label>
                                <input
                                    type="password"
                                    id="senha"
                                    name="senha"
                                    value={formData.senha}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="Crie uma senha segura"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-300 mb-2">
                                    Confirmar Senha *
                                </label>
                                <input
                                    type="password"
                                    id="confirmarSenha"
                                    name="confirmarSenha"
                                    value={formData.confirmarSenha}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="Confirme sua senha"
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
