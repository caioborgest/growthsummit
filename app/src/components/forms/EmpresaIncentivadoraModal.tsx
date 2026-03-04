
import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, Users, Trophy, Building2, Ticket } from 'lucide-react';
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
}

export function EmpresaIncentivadoraModal({ isOpen, onClose, isAdmin = false }: EmpresaIncentivadoraModalProps) {
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
        quantidadeEquipe: '',
        objetivo: ''
    });

    // Carregar rascunho
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, ...parsed.data }));
                logger.info('Rascunho de empresa carregado');
            } catch (e) {
                logger.warn('Erro ao carregar rascunho de empresa:', e);
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
            nomeEmpresa: '', quantidadeEquipe: '', objetivo: ''
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
                // Upsert no perfil público
                await (supabase.from('users') as any).upsert({
                    id: authUser.id,
                    email: formData.email,
                    name: formData.nomeResponsavel,
                    phone: formData.phone,
                    role: 'company',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' }).then(({ error }: { error: { message: string } | null }) => {
                    if (error) logger.warn('Sync users failed in EmpresaForm (expected if RLS):', { msg: error.message });
                });
            }

            // 2. Salvar na tabela de inscrições (INSERT para permitir múltiplas inscrições)
            const { error: dbError } = await (supabase.from('inscricoes_empresas_incentivadoras') as any).insert([{
                project_id: projectId,
                nome_responsavel: formData.nomeResponsavel,
                email: formData.email,
                telefone: formData.phone,
                nome_empresa: formData.nomeEmpresa,
                quantidade_equipe: parseInt(formData.quantidadeEquipe) || 0,
                objetivo: formData.objetivo,
                status: isAdmin ? 'aprovado' : 'pendente'
            }]);

            if (dbError) {
                logger.error('Erro ao salvar no banco (Empresa):', dbError);
                throw dbError;
            }

            const valorUnitario = 179.99;
            const qtd = parseInt(formData.quantidadeEquipe) || 0;
            const temDesconto = qtd >= 10;
            const valorTotal = temDesconto ? (qtd * valorUnitario * 0.9) : (qtd * valorUnitario);
            const valorFormatado = valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            if (!isAdmin) {
                const mensagem = encodeURIComponent(
                    `🚀 *INSCRIÇÃO DE EQUIPE - GROWTH EXPERIENCE*\n\n` +
                    `Olá! Gostaria de realizar o pagamento das inscrições da minha equipe e oficializar nossa participação no prêmio *Melhor empresa incentivadora da educação empreendedora*.\n\n` +
                    `*DADOS DA EMPRESA:*\n` +
                    `• *Empresa:* ${formData.nomeEmpresa}\n` +
                    `• *Responsável:* ${formData.nomeResponsavel}\n` +
                    `• *WhatsApp:* ${formData.phone}\n` +
                    `• *Equipe:* ${qtd} pessoas\n` +
                    `• *Desconto Aplicado:* ${temDesconto ? '10% (Equipe >= 10)' : 'Nenhum'}\n` +
                    `• *Valor Total:* ${valorFormatado}\n\n` +
                    `*MOTIVO DA INSCRIÇÃO:* ${formData.objetivo}\n\n` +
                    `_Pode me enviar a chave Pix para pagamento?_`
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

        } catch (err: any) {
            logger.error('Erro crítico no formulário de empresa:', err);
            setError(err.message || 'Erro ao processar inscrição');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
            <div className="glass-card max-w-xl w-full max-h-[96vh] sm:max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300 border-brand-orange-coral/20 rounded-2xl sm:rounded-3xl">
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
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight">Inscrição Enviada!</h2>
                            <p className="text-sm sm:text-lg text-gray-400 mb-6 sm:mb-8 leading-relaxed">
                                Sua empresa foi pré-inscrita para o prêmio **"Melhor empresa incentivadora da educação empreendedora"**.<br className="hidden sm:block" />
                                <strong>Estamos te redirecionando para o nosso WhatsApp Business</strong> para confirmarmos as vagas da equipe e os detalhes do pagamento.
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
                                    Premiação Especial
                                </Badge>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 leading-tight">Empresa Incentivadora</h2>
                                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">Inscreva sua equipe e concorra à homenagem oficial no palco principal.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Quantos colaboradores levará?</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            <input
                                                required
                                                type="number"
                                                min="1"
                                                className="w-full pl-10 pr-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none text-sm sm:text-base"
                                                value={formData.quantidadeEquipe}
                                                onChange={e => setFormData({ ...formData, quantidadeEquipe: e.target.value })}
                                                placeholder="Ex: 5, 10, 20..."
                                            />
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
                                    <label className="text-sm font-medium text-gray-300">Por que sua empresa merece o prêmio?</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none resize-none"
                                        value={formData.objetivo}
                                        onChange={e => setFormData({ ...formData, objetivo: e.target.value })}
                                        placeholder="Conte brevemente sobre o incentivo que sua empresa dá aos colaboradores..."
                                    />
                                </div>

                                <div className="bg-brand-orange-coral/10 p-4 rounded-xl border border-brand-orange-coral/20 flex gap-3">
                                    <Trophy className="h-5 w-5 text-brand-orange-coral flex-shrink-0 mt-1" />
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        Empresas que levam equipes acima de **10 pessoas** para programação a noite, ganham **10% de desconto adicional** e concorrem ao prêmio de empresa que mais investe no empreendedorismo. A empresa que mais investir ganha o prêmio **"Melhor empresa incentivadora da educação empreendedora"**.
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
                                        'Inscrever Equipe & Competir'
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

