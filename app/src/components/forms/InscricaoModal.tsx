import { useState } from 'react';
import { X, Loader2, CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';

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
        confirmarSenha: '',
        cupom: '' // Novo campo
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [cupomValido, setCupomValido] = useState<{ porcentagem: number; nome: string; tipo: string } | null>(null);
    const [validandoCupom, setValidandoCupom] = useState(false);
    const { projectId } = useProject();

    if (!isOpen) return null;

    const handleValidarCupom = async (codigo: string) => {
        if (!codigo || codigo.length < 3) return;
        setValidandoCupom(true);
        try {
            const { data, error: cError } = await (supabase
                .from('cupons_parceria_social') as any)
                .select('*')
                .eq('codigo', codigo.toUpperCase())
                .eq('ativo', true)
                .single();

            if (cError || !data) {
                setCupomValido(null);
                return;
            }

            // Verificar validade por data
            if (data.vencimento && new Date(data.vencimento) < new Date()) {
                setCupomValido(null);
                setError('Este código de voucher já expirou.');
                return;
            }

            // Verificar limite de uso
            if (data.uso_limite && data.uso_atual >= data.uso_limite) {
                setCupomValido(null);
                setError('Este código atingiu o limite de utilizações.');
                return;
            }

            setCupomValido({
                porcentagem: data.porcentagem_desconto,
                nome: data.indicacao_nome,
                tipo: data.indicacao_tipo
            });
            setError('');
        } catch (err) {
            console.error('Erro cupom:', err);
        } finally {
            setValidandoCupom(false);
        }
    };

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

    const valorOriginal = 179.99;
    const getValor = () => {
        if (tipo !== 'palestra') return 'Gratuito';
        if (cupomValido) {
            const desconto = (valorOriginal * cupomValido.porcentagem) / 100;
            const final = valorOriginal - desconto;

            const labelMap: Record<string, string> = {
                'prefeitura': 'Convênio Prefeitura',
                'politico': 'Cota Liderança',
                'empresa': 'Voucher Empresarial',
                'influenciador': 'Cópia VIP',
                'associacao': 'Parceria Associação',
                'instituicao': 'Convênio Institucional',
                'promocional': 'Lote Especial'
            };

            const label = labelMap[cupomValido.tipo] || 'Voucher Especial';
            return final === 0 ? `GRATUITO (${label})` : `R$ ${final.toFixed(2).replace('.', ',')}`;
        }
        return 'R$ 179,99';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Validações
            if (!formData.nome || !formData.email || !formData.telefone || !formData.senha) {
                throw new Error('Preencha os campos obrigatórios');
            }

            const { data: { session } } = await supabase.auth.getSession();
            let user = session?.user;

            if (!user) {
                const { data: authData, error: sError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.senha,
                    options: { data: { name: formData.nome, phone: formData.telefone, role: 'participante' } }
                });

                if (sError) {
                    if (sError.message.toLowerCase().includes('already registered')) {
                        console.log('Usuário já existe, tentando login...');
                        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                            email: formData.email,
                            password: formData.senha
                        });
                        if (!signInError) {
                            user = signInData.user;
                        } else {
                            console.log('Login falhou, prosseguindo sem vincular ID de usuário');
                        }
                    } else {
                        throw sError;
                    }
                } else {
                    user = authData?.user || null;
                }
            }

            // Prosseguindo (user_id pode ser null se auth falhou)
            console.log('Prosseguindo com inscrição. User ID:', user?.id || 'nenhum');

            // 2. Inserir Inscrição
            const valorFinal = tipo === 'palestra'
                ? (cupomValido ? valorOriginal * (1 - cupomValido.porcentagem / 100) : valorOriginal)
                : 0;

            const { error: insError } = await (supabase.from('inscricoes_growth_experience') as any).insert({
                project_id: projectId,
                user_id: user?.id || null,
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone,
                empresa: formData.empresa || cupomValido?.nome || null,
                tipo_inscricao: tipo,
                evento: eventoNome,
                valor_pago: valorFinal,
                status_pagamento: valorFinal === 0 ? 'pago' : 'pendente',
                status: 'ativo',
                codigo_social: formData.cupom || null
            });

            if (insError) throw insError;

            // 3. Atualizar uso do cupom se existir
            if (formData.cupom && cupomValido) {
                await supabase.rpc('increment_coupon_usage', { coupon_code: formData.cupom.toUpperCase() });
            }

            // 4. Redirecionamento ou Sucesso
            if (tipo === 'palestra' && valorFinal > 0) {
                const mensagem = encodeURIComponent(`Olá! Quero finalizar meu pagamento da Palestra Noturna.\nNome: ${formData.nome}\nEmail: ${formData.email}`);
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensagem}`, '_blank');
            }

            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 3000);

        } catch (err: any) {
            setError(err.message || 'Erro ao processar');
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

                            {tipo === 'palestra' && (
                                <div className="pt-2">
                                    <label htmlFor="cupom" className="block text-sm font-medium text-gray-300 mb-2">
                                        Possui um Código de Voucher ou Equipe?
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="cupom"
                                            name="cupom"
                                            value={formData.cupom}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, cupom: val });
                                                if (val.length >= 3) handleValidarCupom(val);
                                                else setCupomValido(null);
                                            }}
                                            className={`w-full px-4 py-3 bg-dark-200 border ${cupomValido ? 'border-green-500' : 'border-dark-300'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                                            placeholder="Ex: EQUIPE-123"
                                        />
                                        {validandoCupom && (
                                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500 animate-spin" />
                                        )}
                                        {cupomValido && (
                                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                                        )}
                                    </div>
                                    {cupomValido && (
                                        <p className="text-xs text-green-500 mt-2 font-medium">
                                            Voucher aplicado: {cupomValido.porcentagem}% de desconto para {cupomValido.nome}
                                        </p>
                                    )}
                                </div>
                            )}

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
                                            {tipo === 'palestra' && getValor().includes('R$') && <MessageCircle className="h-4 w-4 mr-2" />}
                                            {tipo === 'palestra' && getValor().includes('R$') ? 'Pagar via WhatsApp' : 'Confirmar Inscrição'}
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
