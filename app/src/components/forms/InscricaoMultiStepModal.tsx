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
        phone: '',
        senha: '',
        comprarPalestras: false,
        code: '',
        descontoSocial: 0,
        descontoPalestra: 0,
        tipoInscricao: 'standard',
        loteId: null,
        voucherEmpresa: '',
        indicacaoTipo: 'nenhum',
        indicacaoNome: '',
        partnerId: '',
        partnerAccessCode: '',
    });

    const totalSteps = 6;

    const handleClose = () => {
        if (currentStep === 6) {
            onClose();
            clearDraft();
        } else {
            // Draft mode - can close without losing everything
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

    // Load draft on mount
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setDados(prev => ({ ...prev, ...parsed.data }));
                const restoredStep = parsed.step || 1;
                const safeStep = (restoredStep >= 3 && !parsed.data?.inscricaoId) ? 2 : restoredStep;
                setCurrentStep(safeStep);
                logger.debug('Registration draft loaded');
            } catch (e: unknown) {
                const errorMsg = e instanceof Error ? e.message : String(e);
                logger.warn('Error loading registration draft:', { error: errorMsg });
            }
        }
    }, []);

    // Save draft
    useEffect(() => {
        if (isOpen && currentStep < 6) {
            const draftData = {
                data: {
                    ...dados,
                    senha: '' // Sanitize
                },
                step: currentStep,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        }
    }, [dados, currentStep, isOpen]);

    // For Triunfo and others: define active Ticket Batch / Tier automatically
    useEffect(() => {
        if (!selectedProject) return;

        const TriumphSessions = allSessions
            ?.filter(s => s.projectId === selectedProject.id)
            .map(s => s.id) || [];
        
        // Advanced Pricing (Tiers)
        const tiers = selectedProject.settings?.ticketTiers || [];
        
        // Helper to check if a batch is within time validity
        const isBatchTimeValid = (batch: any) => {
            const now = new Date();
            const start = batch.startDate ? new Date(batch.startDate) : null;
            const end = batch.endDate ? new Date(batch.endDate) : null;
            
            // Adjust dates to cover full day start/end
            if (start) start.setHours(0, 0, 0, 0);
            if (end) end.setHours(23, 59, 59, 999);
            
            if (start && now < start) return false;
            if (end && now > end) return false;
            return true;
        };

        // Find first active Tier
        const activeTier = tiers.find((t: any) => t.active) || tiers[0];
        
        // Find first valid Batch within the active tier
        let activeBatch = activeTier?.batches.find((b: any) => isBatchTimeValid(b));
        if (!activeBatch) {
            activeBatch = activeTier?.batches.find((b: any) => b.active) || activeTier?.batches?.[0];
        }

        const updates: Partial<DadosInscricao> = {
            loteId: activeBatch?.id || null,
            tipoInscricao: (activeTier?.id || 'standard') as 'pro' | 'standard' | 'vip' | 'social'
        };

        if (selectedProject.slug === 'ge-triunfo-pocket-edition-noturno-2026') {
            updates.comprarPalestras = true;
            updates.cursosSelecionados = TriumphSessions;
        }
        
        if (tiers.length === 0) {
            updates.tipoInscricao = 'standard';
            updates.loteId = 'default';
        }

        updateDados(updates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProject?.id, allSessions?.length]);

    // Skip Payment Step (Step 4) if already paid (Free/Voucher)
    useEffect(() => {
        if (currentStep === 4 && (dados.statusPagamento === 'pago' || dados.statusPagamento === 'paid')) {
            nextStep(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, dados.statusPagamento]);

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setDados({
            cursosSelecionados: [],
            nome: '',
            cpf: '',
            email: '',
            phone: '',
            senha: '',
            comprarPalestras: false,
            loteId: '',
            voucherEmpresa: '',
            indicacaoTipo: 'nenhum',
            indicacaoNome: '',
            code: '',
            descontoSocial: 0,
            descontoPalestra: 0,
            tipoInscricao: 'standard',
            partnerId: '',
            partnerAccessCode: ''
        });
        setCurrentStep(1);
    };

    const prevStep = () => {
        if (isProcessing) return;
        
        let targetStep = currentStep - 1;

        // Reversed skip for Payment
        if (targetStep === 4 && (dados.statusPagamento === 'pago' || dados.statusPagamento === 'paid')) {
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
                        onUpdate={updateDados}
                    />
                );
            case 3:
                return (
                    <Step3Confirmacao
                        dados={dados}
                        onConfirmar={(userId, inscricaoId, statusPagamento) => {
                            updateDados({ userId, inscricaoId, statusPagamento });
                            nextStep(true);
                        }}
                        onVoltar={prevStep}
                        onUpdate={updateDados}
                    />
                );
            case 4:
                return (
                    <Step5PagamentoPix
                        dados={dados}
                        onContinuar={nextStep}
                        onVoltar={prevStep}
                    />
                );
            case 5:
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
                                        .from('growth_experience_registrations') as unknown as { update: (v: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<unknown> } })
                                        .update({ app_instalado: true })
                                        .eq('id', dados.inscricaoId);
                                    updateDados({ appInstalado: true });
                                } catch (err) {
                                    logger.error('Error marking app as installed:', { error: err });
                                }
                            }
                            setIsProcessing(false);
                            nextStep();
                        }}
                    />
                );
            case 6:
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
                {/* Header with Progress */}
                <div className="bg-dark-100/50 backdrop-blur-md pb-3 pt-4 sm:pb-6 sm:pt-6 px-4 sm:px-10 border-b border-white/5 z-20 shadow-lg flex-shrink-0">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div>
                            <DialogTitle className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight">
                                Registration <span className="text-brand-orange-coral">{selectedProject?.shortDescription || selectedProject?.name || 'Event'}</span>
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Registration process for workshops and training at {selectedProject?.name || 'Growth Experience'}.
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

                    {/* Compact Step Indicators */}
                    <div className="flex items-center justify-between relative px-2 sm:px-6">
                        <div className="absolute top-4 sm:top-5 left-8 right-8 h-[1px] sm:h-[2px] bg-white/5 -z-10" />
                        <div
                            className="absolute top-4 sm:top-5 left-8 h-[1px] sm:h-[2px] bg-brand-orange-coral transition-all duration-500 -z-10 shadow-[0_0_10px_rgba(255,112,67,0.5)]"
                            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`, maxWidth: 'calc(100% - 64px)' }}
                        />

                        {[
                            'Sessions',
                            'Details',
                            'Confirm',
                            'Payment',
                            'App',
                            'Done'
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

                {/* Content with Custom Scrollbar */}
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
