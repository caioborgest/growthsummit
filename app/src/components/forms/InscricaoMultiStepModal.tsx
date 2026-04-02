import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Loader2 } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';
import type { DadosInscricao } from './inscricao-steps/inscricaoTypes';
import { Step1SelecionarCursos } from './inscricao-steps/Step1SelecionarCursos';
import { Step2DadosPessoais } from './inscricao-steps/Step2DadosPessoais';
import { Step3Confirmacao } from './inscricao-steps/Step3Confirmacao';
import { Step4OfertaPalestras } from './inscricao-steps/Step4OfertaPalestras';
import { Step5PagamentoPix } from './inscricao-steps/Step5PagamentoPix';
import { Step6DownloadApp } from './inscricao-steps/Step6DownloadApp';
import { Step7Conclusao } from './inscricao-steps/Step7Conclusao';
import { useSessions } from '@/hooks/useData';

const DRAFT_KEY = 'inscricao_form_draft';

interface InscricaoMultiStepModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InscricaoMultiStepModal({ isOpen, onClose }: InscricaoMultiStepModalProps) {
    const { selectedProject } = useProject();
    const { data: allSessions } = useSessions();
    const [currentStep, setCurrentStep] = useState(1);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dados, setDados] = useState<DadosInscricao>({
        cursosSelecionados: [],
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        senha: '',
        comprarPalestras: false
    });

    const totalSteps = 7;

    const handleClose = () => {
        if (currentStep === 7) {
            onClose();
            clearDraft();
        } else {
            // No modo rascunho, podemos fechar sem medo de perder tudo, 
            // mas ainda é bom ter um aviso se for uma ação brusca
            onClose();
        }
    };

    const updateDados = (novos: Partial<DadosInscricao>) => {
        setDados(prev => ({ ...prev, ...novos }));
    };

    const nextStep = (force = false) => {
        if (isProcessing && !force) return;
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
        // Reset processing after a short delay to prevent multiple clicks
        setTimeout(() => setIsProcessing(false), 300);
    };

    // Auto-scroll to top when step changes
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentStep]);

    // Carregar rascunho ao iniciar
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setDados(prev => ({ ...prev, ...parsed.data }));
                setCurrentStep(parsed.step || 1);
                logger.debug('Rascunho de inscrição carregado');
            } catch (e: unknown) {
                const errorMsg = e instanceof Error ? e.message : String(e);
                logger.warn('Erro ao carregar rascunho de inscrição:', { error: errorMsg });
            }
        }
    }, []);

    // Salvar rascunho
    useEffect(() => {
        if (isOpen && currentStep < 7) {
            const draftData = {
                data: {
                    ...dados,
                    senha: '' // Higienizar
                },
                step: currentStep,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        }
    }, [dados, currentStep, isOpen]);

    // Skip seguro do Step 1 removido para permitir visualizar programação em Triunfo

    // Para Triunfo e outros: define o Lote/Categoria Ativo automaticamente
    useEffect(() => {
        if (!selectedProject) return;

        const TriumphSessions = allSessions
            ?.filter(s => s.projectId === selectedProject.id)
            .map(s => s.id) || [];
        
        // Busca a precificação avançada (Tiers)
        const tiers = selectedProject.settings?.ticketTiers || [];
        
        // Helper para verificar se um lote é válido por tempo
        const isBatchTimeValid = (batch: any) => {
            const now = new Date();
            const start = batch.startDate ? new Date(batch.startDate) : null;
            const end = batch.endDate ? new Date(batch.endDate) : null;
            
            // Ajustar datas para considerar início do dia (start) e fim do dia (end)
            if (start) start.setHours(0, 0, 0, 0);
            if (end) end.setHours(23, 59, 59, 999);
            
            if (start && now < start) return false;
            if (end && now > end) return false;
            return true;
        };

        // Encontra o primeiro Tier ativo
        const activeTier = tiers.find((t: any) => t.active) || tiers[0];
        
        // Encontra o primeiro lote VÁLIDO por tempo dentro do tier ativo
        // Se nenhum estiver no período de validade, pega o marcado como 'active' como fallback
        let activeBatch = activeTier?.batches.find((b: any) => isBatchTimeValid(b));
        if (!activeBatch) {
            activeBatch = activeTier?.batches.find((b: any) => b.active) || activeTier?.batches?.[0];
        }

        const updates: Partial<DadosInscricao> = {
            loteId: activeBatch?.id || 'default',
            tipoInscricao: (activeTier?.id || 'standard') as 'pro' | 'standard' | 'vip' | 'social'
        };

        if (selectedProject.slug === 'ge-triunfo-2026') {
            updates.comprarPalestras = true;
            updates.cursosSelecionados = TriumphSessions;
        }
        
        // Se não houver tiers configurados, garante um estado válido
        if (tiers.length === 0) {
            updates.tipoInscricao = 'standard';
            updates.loteId = 'default';
        }

        updateDados(updates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProject?.id, allSessions?.length]);

    // Skip Step 4 para Triunfo (oferta de palestras não é necessária — todas já incluem pagamento)
    useEffect(() => {
        if (currentStep === 4 && selectedProject?.slug === 'ge-triunfo-2026') {
            nextStep(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, selectedProject?.slug]);

    // Skip seguro do Step 5 quando não há pagamento pendente
    useEffect(() => {
        if (currentStep === 5 && !(dados.comprarPalestras && dados.statusPagamento !== 'pago')) {
            nextStep(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, dados.comprarPalestras, dados.statusPagamento]);

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setDados({
            cursosSelecionados: [],
            nome: '',
            cpf: '',
            email: '',
            telefone: '',
            senha: '',
            comprarPalestras: false,
            loteId: '',
            voucherEmpresa: '',
            indicacaoTipo: 'nenhum',
            indicacaoNome: '',
            codigo: '',
            descontoSocial: 0
        });
        setCurrentStep(1);
    };

    const prevStep = () => {
        if (isProcessing) return;
        
        let targetStep = currentStep - 1;

        // Lógica reversa de skip
        if (targetStep === 5) {
            const hasPendingPayment = dados.comprarPalestras && dados.statusPagamento !== 'pago';
            if (!hasPendingPayment) targetStep = 4;
        }
        
        if (targetStep === 4 && selectedProject?.slug === 'ge-triunfo-2026') {
            targetStep = 3;
        }

        if (targetStep >= 1) {
            setCurrentStep(targetStep);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1SelecionarCursos
                        cursosSelecionados={dados.cursosSelecionados}
                        onContinuar={(cursos) => {
                            updateDados({ cursosSelecionados: cursos });
                            nextStep();
                        }}
                        onVoltar={handleClose}
                    />
                );
            case 2:
                return (
                    <Step2DadosPessoais
                        dados={dados}
                        onContinuar={(dadosPessoais) => {
                            updateDados(dadosPessoais);
                            nextStep();
                        }}
                        onVoltar={prevStep}
                    />
                );
            case 3:
                return (
                    <Step3Confirmacao
                        dados={dados}
                        onConfirmar={(userId, inscricaoId, statusPagamento) => {
                            updateDados({ userId, inscricaoId, statusPagamento });
                            // Don't set isProcessing here since Step3 handles its own loading state
                            nextStep(true); // Force next step
                        }}
                        onVoltar={prevStep}
                        onUpdate={updateDados}
                    />
                );
            case 4:
                // Passo skipado no Triunfo
                if (selectedProject?.slug === 'ge-triunfo-2026') {
                    return <div className="flex items-center justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-brand-orange-coral" /></div>;
                }
                return (
                    <Step4OfertaPalestras
                        dados={dados}
                        onComprar={async () => {
                            if (isProcessing) return;
                            setIsProcessing(true);
                            if (dados.inscricaoId) {
                                try {
                                    const { supabase } = await import('@/lib/supabase');
                                    // Cálculo de valor (mesma lógica do Step 3)
                                    const valorOriginal = 179.99;
                                    const descontoEfetivo = Math.max(dados.descontoPalestra || 0, dados.descontoSocial || 0);
                                    const valorComDesconto = valorOriginal * (1 - descontoEfetivo / 100);

                                    if (dados.voucherEmpresa) {
                                        const { error: rpcError } = await supabase.rpc('aplicar_voucher_empresa', {
                                            p_inscricao_id: dados.inscricaoId,
                                            p_voucher_code: dados.voucherEmpresa
                                        });
                                        if (rpcError) throw rpcError;
                                    } else {
                                        await (supabase
                                            .from('inscricoes_growth_experience') as unknown as { update: (v: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<unknown> } })
                                            .update({
                                                palestras_noturnas: true,
                                                valor_pago: valorComDesconto,
                                                status_pagamento: valorComDesconto > 0 ? 'pendente' : 'pago',
                                                status: valorComDesconto > 0 ? 'pendente' : 'ativo',
                                                cupom_palestra: dados.cupomPalestra || null,
                                                codigo_palestra: dados.cupomPalestra || null,
                                                valor_desconto_palestra: (dados.descontoPalestra || 0)
                                            })
                                            .eq('id', dados.inscricaoId);
                                    }

                                    updateDados({
                                        comprarPalestras: true,
                                        statusPagamento: valorComDesconto > 0 ? 'pendente' : 'pago',
                                        valorFinal: valorComDesconto
                                    });
                                } catch (err) {
                                    logger.error('Erro ao atualizar compra de palestras:', { error: err });
                                    updateDados({ comprarPalestras: true, statusPagamento: 'pendente' });
                                }
                            } else {
                                updateDados({ comprarPalestras: true, statusPagamento: 'pendente' });
                            }
                            setIsProcessing(false);
                            nextStep();
                        }}
                        onPular={async () => {
                            // Mesmo pular, garantimos que está false (já é por padrão, mas reforçamos se for refazer o fluxo)
                            if (dados.inscricaoId) {
                                try {
                                    const { supabase } = await import('@/lib/supabase');
                                    await (supabase
                                        .from('inscricoes_growth_experience') as unknown as { update: (v: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<unknown> } })
                                        .update({ palestras_noturnas: false, valor_pago: 0 })
                                        .eq('id', dados.inscricaoId);
                                } catch (e) {
                                    logger.error('Erro ao pular palestras:', { error: e });
                                }
                            }
                            updateDados({ comprarPalestras: false });
                            nextStep();
                        }}
                        onVoltar={prevStep}
                        onUpdate={updateDados}
                    />
                );
            case 5:
                // Passo condicional: Se comprou palestras e está pendente, mostra pagamento
                if (dados.comprarPalestras && dados.statusPagamento !== 'pago') {
                    return (
                        <Step5PagamentoPix
                            dados={dados}
                            onContinuar={nextStep}
                            onVoltar={prevStep}
                        />
                    );
                } else {
                    // Bug fix: não chamar nextStep() no corpo do render — useEffect abaixo cuida disso
                    return <div className="flex items-center justify-center p-20"><Loader2 className="h-10 w-10 animate-spin" /></div>;
                }
            case 6:
                return (
                    <Step6DownloadApp
                        onVoltar={prevStep}
                        onContinuar={async () => {
                            if (isProcessing) return;
                            setIsProcessing(true);
                            if (dados.inscricaoId) {
                                try {
                                    const { supabase } = await import('@/lib/supabase');
                                    await (supabase
                                        .from('inscricoes_growth_experience') as unknown as { update: (v: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<unknown> } })
                                        .update({ app_instalado: true })
                                        .eq('id', dados.inscricaoId);
                                    updateDados({ appInstalado: true });
                                } catch (err) {
                                    logger.error('Erro ao marcar app como instalado:', { error: err });
                                }
                            }
                            setIsProcessing(false);
                            nextStep();
                        }}
                    />
                );
            case 7:
                return (
                    <Step7Conclusao
                        dados={dados}
                        onFechar={() => {
                            clearDraft();
                            onClose();
                            setCurrentStep(1);
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[98vw] sm:max-w-4xl h-[92dvh] sm:h-auto sm:max-h-[88vh] flex flex-col overflow-hidden bg-dark-100/95 backdrop-blur-3xl border-white/10 p-0 shadow-[0_0_100px_rgba(0,0,0,0.6)] rounded-[1.5rem] sm:rounded-[2.5rem]">
                {/* Header com Progresso */}
                <div className="bg-dark-100/50 backdrop-blur-md pb-3 pt-4 sm:pb-6 sm:pt-6 px-4 sm:px-10 border-b border-white/5 z-20 shadow-lg flex-shrink-0">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div>
                            <DialogTitle className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight">
                                Inscrição <span className="text-brand-orange-coral">{selectedProject?.shortDescription || selectedProject?.name || 'Evento'}</span>
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Processo de inscrição para workshops e treinamentos do {selectedProject?.name || 'Growth Experience'}.
                            </DialogDescription>
                            <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5">{selectedProject?.name || 'Growth Experience'} • © 2026</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full h-10 w-10 transition-all shrink-0 touch-manipulation"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Step Indicators Compactos e Elegantes */}
                    <div className="flex items-center justify-between relative px-2 sm:px-6">
                        {/* Linha de fundo conectora */}
                        <div className="absolute top-4 sm:top-5 left-8 right-8 h-[1px] sm:h-[2px] bg-white/5 -z-10" />
                        {/* Linha de progresso ativa */}
                        <div
                            className="absolute top-4 sm:top-5 left-8 h-[1px] sm:h-[2px] bg-brand-orange-coral transition-all duration-500 -z-10 shadow-[0_0_10px_rgba(255,112,67,0.5)]"
                            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`, maxWidth: 'calc(100% - 64px)' }}
                        />

                        {[
                            selectedProject?.slug === 'ge-triunfo-2026' ? '-' : 'Cursos',
                            'Dados',
                            'Confirmar',
                            selectedProject?.slug === 'ge-triunfo-2026' ? '-' : 'Upgrade',
                            'Pagamento',
                            'App',
                            'OK'
                        ].map((label, index) => {
                            const step = index + 1;
                            const isActive = step === currentStep;
                            const isCompleted = step < currentStep;

                            return (
                                <div
                                    key={step}
                                    className="flex flex-col items-center gap-2 sm:gap-3 relative"
                                >
                                    <div
                                        className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 ${isCompleted
                                            ? 'bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                            : isActive
                                                ? 'bg-brand-orange-coral border-brand-orange-coral text-white shadow-[0_0_20px_rgba(255,112,67,0.4)] scale-110'
                                                : 'bg-dark-200 border-white/10 text-gray-500'
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                        ) : (
                                            <span className="text-[10px] sm:text-sm">{step}</span>
                                        )}
                                    </div>
                                    <span
                                        className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isActive
                                            ? 'text-brand-orange-coral'
                                            : isCompleted
                                                ? 'text-green-500'
                                                : 'text-gray-600'
                                            } hidden sm:block`}
                                    >
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content com Scrollbar Customizada */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 px-4 pt-6 pb-24 sm:px-12 sm:pb-10 sm:pt-8 overflow-y-auto custom-scrollbar bg-dark-100/30 ios-scroll"
                    style={{ paddingBottom: 'max(6rem, calc(1.5rem + env(safe-area-inset-bottom)))' }}
                >
                    <div className="max-w-3xl mx-auto w-full">
                        {renderStep()}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
