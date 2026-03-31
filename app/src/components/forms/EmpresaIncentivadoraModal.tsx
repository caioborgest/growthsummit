
import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, Trophy, Building2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';
import { EVENT_CONFIG } from '@/config/eventConfig';

interface EmpresaIncentivadoraModalProps {
    isOpen: boolean;
    onClose: () => void;
    isAdmin?: boolean;
    editingData?: any; // New prop for editing
}

export function EmpresaIncentivadoraModal({ isOpen, onClose, isAdmin = false, editingData }: EmpresaIncentivadoraModalProps) {
    const DRAFT_KEY = 'empresa_form_draft';
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const { projectId } = useProject();

    const [formData, setFormData] = useState({
        nomeResponsavel: '',
        email: '',
        phone: '',
        nomeEmpresa: '',
        quantidadeNoite: '',
        objetivo: '',
        amount: ''
    });

    useEffect(() => {
        if (editingData) {
            setFormData({
                nomeResponsavel: editingData.nomeResponsavel || '',
                email: editingData.email || '',
                phone: editingData.phone || editingData.telefone || '',
                nomeEmpresa: editingData.nomeEmpresa || '',
                quantidadeNoite: String(editingData.quantidadeNoite || '0'),
                objetivo: editingData.objetivo || '',
                amount: String(editingData.amount || editingData.valorInvestido || '0')
            });
        } else {
            clearDraft();
        }
    }, [editingData, isOpen]);

    // Carregar rascunho
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, ...parsed.data }));
                logger.debug('Rascunho de empresa carregado');
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : String(e);
                logger.warn('Erro ao carregar rascunho de empresa:', { error: message });
            }
        }
    }, []);

    // Salvar rascunho
    useEffect(() => {
        if (isOpen && !isSuccess) {
            const draftData = {
                data: formData,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        }
    }, [formData, isOpen, isSuccess]);

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setFormData({
            nomeResponsavel: '', email: '', phone: '',
            nomeEmpresa: '',
            quantidadeNoite: '',
            objetivo: '',
            amount: ''
        });
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');

        try {
            logger.info('Iniciando inscrição de empresa incentivadora...');

            // 1. Tentar sincronizar usuário se estiver logado
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                // @ts-expect-error - bypass never type inference issue
                await supabase.from('users').upsert({
                    id: authUser.id,
                    email: formData.email,
                    name: formData.nomeResponsavel,
                    phone: formData.phone,
                    role: 'company' as const,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' }).then(({ error }: { error: unknown }) => {
                    if (error && typeof error === 'object' && 'message' in error) {
                        logger.warn('Sync users failed in EmpresaForm (expected if RLS):', { msg: (error as { message: string }).message });
                    }
                });
            }

            // 2. Salvar na tabela de inscrições
            const dbData = {
                project_id: projectId || null,
                nome_responsavel: formData.nomeResponsavel,
                email: formData.email,
                telefone: formData.phone,
                nome_empresa: formData.nomeEmpresa,
                quantidade_noite: parseInt(formData.quantidadeNoite) || 0,
                objetivo: formData.objetivo,
                valor_investido: parseFloat(formData.amount) || 0,
                status: isAdmin ? (editingData?.status || 'aprovado') : 'pendente'
            };

            if (editingData?.id) {
                const { error: dbError } = await (supabase as any)
                    .from('inscricoes_empresas_incentivadoras')
                    .update(dbData)
                    .eq('id', editingData.id);
                if (dbError) throw dbError;
                logger.info('Empresa atualizada com sucesso');
            } else {
                const { error: dbError } = await (supabase as any)
                    .from('inscricoes_empresas_incentivadoras')
                    .insert([dbData]);
                if (dbError) throw dbError;
                logger.info('Nova empresa inserida com sucesso');
            }

            if (dbError) {
                logger.error('Erro ao salvar no banco (Empresa):', dbError);
                throw dbError;
            }

            const qtdNoite = parseInt(formData.quantidadeNoite) || 0;
            const valorTotal = parseFloat(formData.amount) || 0;
            const valorFormatado = valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            if (!isAdmin && !editingData) {
                const mensagem = encodeURIComponent(
                    `🚀 *INSCRIÇÃO EM LOTE - GE TRIUNFO*\n\n` +
                    `Olá! Acabo de finalizar a inscrição da minha equipe e gostaria de receber o *QR Code para pagamento* e o meu *Cupom de Acesso*.\n\n` +
                    `*DADOS DA EMPRESA:*\n` +
                    `• *Empresa:* ${formData.nomeEmpresa}\n` +
                    `• *Responsável:* ${formData.nomeResponsavel}\n` +
                    `• *WhatsApp:* ${formData.phone}\n` +
                    `• *Vagas (Noite):* ${qtdNoite} pessoas\n` +
                    `• *Valor Total:* ${valorFormatado}\n\n` +
                    `_Aguardando o QR Code para liberar meus vouchers._`
                );
                window.open(`https://wa.me/${EVENT_CONFIG.whatsapp.number}?text=${mensagem}`, '_blank');
            }

            setIsSuccess(true);
            localStorage.removeItem(DRAFT_KEY);

            // Agora mantemos o formulário aberto por 5s ou deixamos o usuário fechar
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                clearDraft();
            }, 8000);

        } catch (err: unknown) {
            logger.error('Erro crítico no formulário de empresa:', err);
            setError(err instanceof Error ? err.message : 'Erro ao processar inscrição');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
            <div className="glass-card max-w-xl w-full max-h-[88dvh] sm:max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300 border-brand-orange-coral/20 rounded-2xl sm:rounded-3xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-white transition-colors z-10 p-2"
                >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                <div className="p-4 sm:p-8">
                    {isSuccess ? (
                        <div className="text-center py-10 sm:py-12">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-400" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight">Inscrição Enviada! 🎉</h2>
                            <p className="text-sm sm:text-lg text-gray-400 mb-6 sm:mb-8 leading-relaxed">
                                Estamos te redirecionando para o **WhatsApp oficial** para gerarmos o seu **QR Code de Pagamento**.<br /><br />
                                Após a confirmação do Pix, nosso sistema gerará um **Cupom Exclusivo** para que seus colaboradores possam se inscrever no site sem custo adicional.
                            </p>
                            <Button onClick={onClose} className="bg-brand-orange-coral text-white px-8 h-12">
                                Voltar ao Site
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 sm:mb-8">
                                <Badge className="mb-3 sm:mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30">
                                    <Trophy className="h-3 w-3 mr-2" />
                                    {editingData ? 'Editar Registro' : 'Voucher Corporativo'}
                                </Badge>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 leading-tight">
                                    {editingData ? `Editar ${formData.nomeEmpresa}` : 'Inscrição em Lote (Equipe)'}
                                </h2>
                                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">Garante desconto de 30% para sua equipe atingir o próximo nível.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Empresa</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        <input
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none text-sm sm:text-base"
                                            value={formData.nomeEmpresa}
                                            onChange={e => setFormData({ ...formData, nomeEmpresa: e.target.value })}
                                            placeholder="Nome da sua empresa"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Vagas para Noite</label>
                                        <div className="relative">
                                            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            <input
                                                required
                                                type="number"
                                                min="1"
                                                className="w-full pl-10 pr-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none text-sm sm:text-base font-bold"
                                                value={formData.quantidadeNoite}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    const qNoite = parseInt(val) || 0;
                                                    const unitPrice = 179.99;
                                                    const discount = qNoite >= 5 ? 0.3 : 0;
                                                    const calculatedAmount = Number((qNoite * unitPrice * (1 - discount)).toFixed(2));
                                                    
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        quantidadeNoite: val,
                                                        amount: calculatedAmount.toString()
                                                    }));
                                                }}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="text-sm font-medium text-gray-300">Resumo do Lote</label>
                                            {parseInt(formData.quantidadeNoite) >= 5 && (
                                                <Badge className="bg-green-500/10 text-green-500 border-none px-2 py-0 text-[8px] animate-pulse">
                                                    -30% OFF
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="bg-dark-300/50 p-3 rounded-xl border border-white/5 space-y-1">
                                            <div className="flex justify-between text-[10px] text-gray-500">
                                                <span>Subtotal:</span>
                                                <span>{( (parseInt(formData.quantidadeNoite) || 0) * 179.99 ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                            </div>
                                            {parseInt(formData.quantidadeNoite) >= 5 && (
                                                <div className="flex justify-between text-[10px] text-green-500/70">
                                                    <span>Desconto Lote (30%):</span>
                                                    <span>-{( (parseInt(formData.quantidadeNoite) || 0) * 179.99 * 0.3 ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-1 border-t border-white/5">
                                                <span className="text-[10px] font-bold text-white uppercase">Total Final:</span>
                                                <span className="text-sm font-black text-brand-orange-coral tracking-tight">
                                                    {(parseFloat(formData.amount) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Responsável</label>
                                        <input
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none text-sm sm:text-base"
                                            value={formData.nomeResponsavel}
                                            onChange={e => setFormData({ ...formData, nomeResponsavel: e.target.value })}
                                            placeholder="Nome completo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">WhatsApp</label>
                                        <input
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none text-sm sm:text-base"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Email Corporativo</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="seu@empresa.com.br"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Observações / Objetivos</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none resize-none"
                                        value={formData.objetivo}
                                        onChange={e => setFormData({ ...formData, objetivo: e.target.value })}
                                        placeholder="Motivo da inscrição ou dúvidas..."
                                    />
                                </div>

                                <div className="bg-brand-orange-coral/10 p-4 rounded-xl border border-brand-orange-coral/20 flex gap-3">
                                    <Trophy className="h-5 w-5 text-brand-orange-coral flex-shrink-0 mt-1" />
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        Empresas que inscrevem equipes acima de **5 pessoas** para a **programação paga**, ganham **30% de desconto** imediato e concorrem ao prêmio oficial. A empresa com maior engajamento total (Dia + Noite) ganha o troféu **"Melhor empresa incentivadora da educação empreendedora"**.
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-bold h-14 rounded-xl shadow-glow-orange"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        editingData ? 'Salvar Alterações' : 'Finalizar Inscrição de Equipe'
                                    )}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
