
import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, Trophy, Building2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
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
                nomeResponsavel: editingData.responsibleName || '',
                email: editingData.email || '',
                phone: editingData.phone || '',
                nomeEmpresa: editingData.companyName || '',
                quantidadeNoite: String(editingData.nightQuantity || '0'),
                objetivo: editingData.objetivo || '',
                amount: String(editingData.investedAmount || '0')
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
                responsible_name: formData.nomeResponsavel,
                email: formData.email,
                phone: formData.phone,
                company_name: formData.nomeEmpresa,
                night_quantity: parseInt(formData.quantidadeNoite) || 0,
                objetivo: formData.objetivo,
                invested_amount: parseFloat(formData.amount) || 0,
                status: isAdmin ? (editingData?.status || 'approved') : 'pending'
            };

            if (editingData?.id) {
                const { error: dbError } = await (supabase as any)
                    .from('empresas_incentivadoras')
                    .update(dbData)
                    .eq('id', editingData.id);
                if (dbError) throw dbError;
                logger.info('Empresa atualizada com sucesso');
            } else {
                const { error: dbError } = await (supabase as any)
                    .from('empresas_incentivadoras')
                    .insert([dbData]);
                if (dbError) throw dbError;
                logger.info('Nova empresa inserida com sucesso');
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
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="admin-modal-content p-0 border-none max-w-xl">
                {isSuccess ? (
                    <div className="p-8 text-center py-12">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 sm:h-12 w-10 sm:w-12 text-green-400" />
                        </div>
                        <DialogTitle className="text-2xl sm:text-3xl font-black text-white mb-4 leading-tight uppercase italic">
                            Inscrição Enviada! 🎉
                        </DialogTitle>
                        <p className="text-sm sm:text-base text-gray-400 mb-8 leading-relaxed">
                            Estamos te redirecionando para o **WhatsApp oficial** para gerarmos o seu **QR Code de Pagamento**.<br /><br />
                            Após a confirmação do Pix, nosso sistema gerará um **Cupom Exclusivo** para que seus colaboradores possam se inscrever no site sem custo adicional.
                        </p>
                        <Button onClick={onClose} className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white px-12 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-glow-orange">
                            Voltar ao Site
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col min-h-0 overflow-hidden custom-scrollbar">
                        <div className="admin-modal-header">
                            <div className="pr-8">
                                <Badge className="mb-2 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 border py-0 text-[8px] font-black uppercase">
                                    <Trophy className="h-2 w-2 mr-1" />
                                    {editingData ? 'Editar Registro' : 'Voucher Corporativo'}
                                </Badge>
                                <DialogTitle className="text-xl sm:text-2xl font-black text-white leading-none uppercase italic">
                                    {editingData ? `Editar ${formData.nomeEmpresa}` : 'Inscrição em Lote (Equipe)'}
                                </DialogTitle>
                                <DialogDescription className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                    Garante desconto de 30% para sua equipe atingir o próximo nível
                                </DialogDescription>
                            </div>
                        </div>

                        <div className="admin-modal-body overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Nome da Empresa</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        <Input
                                            required
                                            className="h-12 pl-12 bg-dark-100 border-white/5 text-white font-bold"
                                            value={formData.nomeEmpresa}
                                            onChange={e => setFormData({ ...formData, nomeEmpresa: e.target.value })}
                                            placeholder="Nome da sua empresa"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Vagas para Noite</label>
                                        <div className="relative">
                                            <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            <Input
                                                required
                                                type="number"
                                                min="1"
                                                className="h-12 pl-12 bg-dark-100 border-white/5 text-white font-black"
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
                                        <div className="flex justify-between items-end mb-1 px-1">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Resumo do Lote</label>
                                            {parseInt(formData.quantidadeNoite) >= 5 && (
                                                <Badge className="bg-green-500/10 text-green-500 border-none px-2 py-0 text-[8px] font-black uppercase animate-pulse">
                                                    -30% OFF
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="bg-dark-100 p-4 rounded-xl border border-white/5 space-y-1">
                                            <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase">
                                                <span>Subtotal:</span>
                                                <span>{( (parseInt(formData.quantidadeNoite) || 0) * 179.99 ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                            </div>
                                            {parseInt(formData.quantidadeNoite) >= 5 && (
                                                <div className="flex justify-between text-[10px] text-green-400 font-bold uppercase">
                                                    <span>Desconto Lote:</span>
                                                    <span>-{( (parseInt(formData.quantidadeNoite) || 0) * 179.99 * 0.3 ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Total Final:</span>
                                                <span className="text-lg font-black text-brand-orange-coral tracking-tight">
                                                    {(parseFloat(formData.amount) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Coordenador / Responsável</label>
                                        <Input
                                            required
                                            className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                                            value={formData.nomeResponsavel}
                                            onChange={e => setFormData({ ...formData, nomeResponsavel: e.target.value })}
                                            placeholder="Nome completo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">WhatsApp direto</label>
                                        <Input
                                            required
                                            className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Email Corporativo</label>
                                    <Input
                                        required
                                        type="email"
                                        className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="seu@empresa.com.br"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Observações / Objetivos</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-3 bg-dark-100 border border-white/5 rounded-xl text-white font-medium focus:outline-none focus:border-brand-orange-coral/50 transition-all resize-none text-sm"
                                        value={formData.objetivo}
                                        onChange={e => setFormData({ ...formData, objetivo: e.target.value })}
                                        placeholder="Motivo da inscrição ou dúvidas..."
                                    />
                                </div>

                                <div className="bg-brand-orange-coral/5 p-4 rounded-xl border border-brand-orange-coral/10 flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-brand-orange-coral/10 flex items-center justify-center shrink-0">
                                        <Trophy className="h-5 w-5 text-brand-orange-coral" />
                                    </div>
                                    <p className="text-[11px] text-gray-400 leading-relaxed italic">
                                        Empresas que inscrevem equipes acima de **5 pessoas** para a **programação paga**, ganham **30% de desconto** imediato e concorrem ao prêmio oficial. A empresa com maior engajamento total (Dia + Noite) ganha o troféu **"Melhor empresa incentivadora da educação empreendedora"**.
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold uppercase tracking-widest text-center">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="admin-modal-footer">
                            {!isAdmin && (
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={onClose}
                                    className="text-gray-500 font-bold uppercase text-[10px] tracking-widest"
                                >
                                    Cancelar
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 h-14 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-2xl shadow-glow-orange transition-all uppercase tracking-widest text-[10px]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    editingData ? 'Salvar Alterações' : 'Finalizar Inscrição de Equipe'
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
