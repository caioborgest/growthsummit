import { useState } from 'react';
import { X, Loader2, CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';
import { emailService } from '@/services/emailService';
import { getOrCreateUser, waitForUserSync } from '@/lib/auth-helpers';

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface InscricaoModalProps {
    isOpen: boolean;
    onClose: () => void;
    tipo: 'palestra' | 'mentor' | 'cursos';
    eventoNome: string;
}

const WHATSAPP_NUMBER = '5588988432310';

export function InscricaoModal({ isOpen, onClose, tipo, eventoNome }: InscricaoModalProps) {
    const { selectedProject, projectId } = useProject();
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        phone: '',
        empresa: '',
        senha: '',
        confirmarSenha: '',
        code: '' // Novo campo
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [cupomValido, setCupomValido] = useState<{ porcentagem: number; nome: string; tipo: string } | null>(null);
    const [validandoCupom, setValidandoCupom] = useState(false);

    if (!isOpen) return null;

    const handleValidarCupom = async (codigo: string) => {
        if (!codigo || codigo.length < 3) return;
        setValidandoCupom(true);
        try {
            const { data, error: cError } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('social_partnership_coupons') as any)
                .select('id,code,discount_percentage,usage_limit,current_usage,is_active,expires_at,referral_name,referral_type')
                .eq('code', codigo.toUpperCase())
                .eq('is_active', true)
                .single();

            if (cError || !data) {
                setCupomValido(null);
                return;
            }

            // Verificar validade por data
            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                setCupomValido(null);
                setError('Este código de voucher já expirou.');
                return;
            }

            // Verificar limite de uso
            if (data.usage_limit && data.current_usage >= data.usage_limit) {
                setCupomValido(null);
                setError('Este código atingiu o limite de utilizações.');
                return;
            }

            setCupomValido({
                porcentagem: data.discount_percentage,
                nome: data.referral_name,
                tipo: data.referral_type
            });
            setError('');
        } catch (err) {
            logger.error('Erro cupom:', err);
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
            if (!formData.nome || !formData.email || !formData.phone || !formData.senha) {
                throw new Error('Preencha os campos obrigatórios');
            }

            const { userId } = await getOrCreateUser({
                email: formData.email,
                password: formData.senha,
                name: formData.nome,
                phone: formData.phone,
                role: 'participant'
            });

            if (!userId) throw new Error('Falha ao identificar usuário');

            // 1.5. Sincronização robusta com public.users (Para FK)
            await waitForUserSync(userId);

            // Prosseguindo (user_id pode ser null se auth falhou)

            // 2. Inserir Inscrição
            const valorFinal = tipo === 'palestra'
                ? (cupomValido ? valorOriginal * (1 - cupomValido.porcentagem / 100) : valorOriginal)
                : 0;

            const { error: insError } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('growth_experience_registrations') as any).insert({
                    project_id: projectId,
                    user_id: userId || null,
                    name: formData.nome,
                    email: formData.email,
                    phone: formData.phone,
                    empresa: formData.empresa || cupomValido?.nome || null,
                    registration_type: tipo,
                    event_name: eventoNome,
                    paid_amount: valorFinal,
                    payment_status: valorFinal === 0 ? 'pago' : 'pendente',
                    status: 'ativo',
                    social_code: formData.code || null
                });

            if (insError) throw insError;
            
            // 2.5. Enviar e-mail de Boas-vindas (Automação Resend)
            await emailService.sendWelcome(formData.email, formData.nome).catch(e => logger.warn('Erro ao enviar boas-vindas:', e));

            // 3. Atualizar uso do cupom se existir
            if (formData.code && cupomValido) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase.rpc as any)('increment_coupon_usage', { coupon_code: formData.code.toUpperCase() });
            }

            // 4. Redirecionamento ou Sucesso
            if (tipo === 'palestra' && valorFinal > 0) {
                const valorFormatado = valorFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const mensagem = encodeURIComponent(
                    `*Growth Experience - Pagamento Palestra*\n\n` +
                    `Olá! Quero finalizar meu pagamento da Palestra Noturna.\n\n` +
                    `*Dados da Inscrição:*\n` +
                    `• *Nome:* ${formData.nome}\n` +
                    `• *Email:* ${formData.email}\n` +
                    `• *WhatsApp:* ${formData.phone}\n` +
                    `• *Empresa:* ${formData.empresa || 'Não informada'}\n` +
                    `• *Evento:* ${eventoNome}\n` +
                    `• *Valor a Pagar:* ${valorFormatado}\n` +
                    (formData.code ? `• *Voucher:* ${formData.code.toUpperCase()}\n` : '') +
                    `\nPor favor, me envie as instruções de PIX.`
                );
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensagem}`, '_blank');
            }

            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
                window.location.href = '/login';
            }, 3000);

        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'Erro ao processar');
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="admin-modal-content max-w-md bg-dark-200 border-none p-0 overflow-hidden shadow-2xl">

                {/* Success State */}
                {isSuccess ? (
                    <div className="text-center py-12 px-8">
                        <div className="w-20 h-20 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-teal-400" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-white mb-2 uppercase italic tracking-tighter">
                            {tipo === 'palestra' ? 'Redirecionando!' : 'Sucesso!'}
                        </DialogTitle>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {tipo === 'palestra'
                                ? 'Finalize o seu pagamento no WhatsApp para garantir sua vaga.'
                                : 'Sua inscrição foi confirmada com sucesso!'
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="admin-modal-header">
                            <div className="flex-1">
                                <DialogTitle className="text-xl sm:text-2xl font-bold text-white leading-tight uppercase italic tracking-tighter">
                                    {getTitulo()}
                                </DialogTitle>
                                <DialogDescription className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic mt-1">
                                    {selectedProject?.name || 'Growth Experience 2026'}
                                </DialogDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-10 w-10 rounded-xl text-gray-500 hover:text-white hover:bg-white/5"
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        <div className="admin-modal-body bg-dark-200">
                            <div className="mb-6 flex flex-wrap gap-2">
                                <div className="px-4 py-2 rounded-xl bg-brand-orange-coral/10 border border-brand-orange-coral/20">
                                    <span className="text-brand-orange-coral text-sm font-black italic uppercase tracking-widest">{getValor()}</span>
                                </div>
                                {tipo === 'palestra' && (
                                    <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4 text-green-400" />
                                        <span className="text-[10px] text-green-400 font-black uppercase tracking-widest">
                                            Pagamento WhatsApp
                                        </span>
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
                                    value={formData.phone}
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
                                            value={formData.code}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, code: val });
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

                            </div>
                        </form>

                        <div className="admin-modal-footer">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="flex-1 h-12 text-gray-500 font-black uppercase text-[10px] tracking-widest"
                                disabled={isSubmitting}
                            >
                                CANCELAR
                            </Button>
                            <Button
                                onClick={(e) => handleSubmit(e as any)}
                                className="flex-[2] h-14 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-2xl shadow-glow-orange uppercase tracking-widest text-[10px]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        ENVIANDO...
                                    </>
                                ) : (
                                    <>
                                        {tipo === 'palestra' && getValor().includes('R$') && <MessageCircle className="h-5 w-5 mr-2" />}
                                        {tipo === 'palestra' && getValor().includes('R$') ? 'PAGAR WHATSAPP' : 'CONFIRMAR INSCRIÇÃO'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
