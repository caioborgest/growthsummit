import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';
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

const DRAFT_KEY = 'inscricao_form_draft_v2';

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

    const totalSteps = 7;

    const handleClose = () => {
        if (currentStep === 7) {
            onClose();
            clearDraft();
        } else {
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
        setTimeout(() => setIsProcessing(false), 300);
    };

    const prevStep = () => {
        if (isProcessing) return;
        
        let targetStep = currentStep - 1;

        // Skip Offer step backwards if already bought
        if (targetStep === 4 && dados.comprarPalestras) {
            targetStep = 3;
        }
        
        // Skip Payment step backwards if free
        if (targetStep === 5 && (dados.statusPagamento === 'pago' || (dados.valorFinal || 0) <= 0)) {
            targetStep = (dados.comprarPalestras) ? 3 : 4;
        }

        if (targetStep >= 1) {
            setCurrentStep(targetStep);
        }
    };

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentStep]);

    // Load draft
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setDados(prev => ({ ...prev, ...parsed.data }));
                const restoredStep = parsed.step || 1;
                // Safety check: if step >= 4 (after registration), must have an ID
                const safeStep = (restoredStep >= 4 && !parsed.data?.inscricaoId) ? 3 : restoredStep;
                setCurrentStep(safeStep);
            } catch (e) {
                logger.warn('Error loading registration draft:', e);
            }
        }
    }, []);

    // Save draft
    useEffect(() => {
        if (isOpen && currentStep < 7) {
            const draftData = {
                data: { ...dados, senha: '' },
                step: currentStep,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        }
    }, [dados, currentStep, isOpen]);

    // Project initialization
    useEffect(() => {
        if (!selectedProject) return;

        const TriumphSessions = allSessions
            ?.filter(s => s.projectId === selectedProject.id)
            .map(s => s.id) || [];
        
        const tiers = selectedProject.settings?.ticketTiers || [];
        const activeTier = tiers.find((t: any) => t.active) || tiers[0];
        const activeBatch = activeTier?.batches.find((b: any) => b.active) || activeTier?.batches?.[0];

        const updates: Partial<DadosInscricao> = {
            loteId: activeBatch?.id || null,
            tipoInscricao: (activeTier?.id || 'standard') as any
        };

        if (selectedProject.slug?.includes('triunfo')) {
            updates.comprarPalestras = true;
            updates.cursosSelecionados = TriumphSessions;
        }
        
        updateDados(updates);
    }, [selectedProject?.id, allSessions?.length]);

    // Smart logic for skipping steps
    useEffect(() => {
        // Skip Step 4 (Offer) if already bought or fixed package
        if (currentStep === 4 && dados.comprarPalestras) {
            nextStep(true);
        }
        
        // Skip Step 5 (Payment) if total is zero or already paid
        const isFree = (dados.valorFinal !== undefined && dados.valorFinal <= 0) || (dados.descontoSocial === 100);
        if (currentStep === 5 && (dados.statusPagamento === 'pago' || isFree)) {
            nextStep(true);
        }
    }, [currentStep, dados.comprarPalestras, dados.statusPagamento, dados.valorFinal, dados.descontoSocial]);

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
            loteId: null,
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

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1SelecionarCursos 
                            cursosSelecionados={dados.cursosSelecionados} 
                            onContinuar={(cursos) => { updateDados({ cursosSelecionados: cursos }); nextStep(); }} 
                            onVoltar={handleClose} 
                        />;
            case 2:
                return <Step2DadosPessoais 
                            dados={dados} 
                            onContinuar={(pessoais) => { updateDados(pessoais); nextStep(); }} 
                            onVoltar={prevStep} 
                            onUpdate={updateDados} 
                        />;
            case 3:
                return <Step3Confirmacao 
                            dados={dados} 
                            onConfirmar={(userId, inscricaoId, statusPagamento) => { updateDados({ userId, inscricaoId, statusPagamento }); nextStep(true); }} 
                            onVoltar={prevStep} 
                            onUpdate={updateDados} 
                        />;
            case 4:
                return <Step4OfertaPalestras 
                            dados={dados} 
                            onComprar={() => { updateDados({ comprarPalestras: true }); nextStep(); }} 
                            onPular={() => { updateDados({ comprarPalestras: false }); nextStep(); }} 
                            onVoltar={prevStep} 
                            onUpdate={updateDados} 
                        />;
            case 5:
                return <Step5PagamentoPix 
                            dados={dados} 
                            onContinuar={nextStep} 
                            onVoltar={prevStep} 
                        />;
            case 6:
                return <Step6DownloadApp 
                            onVoltar={prevStep} 
                            onContinuar={nextStep} 
                        />;
            case 7:
                return <Step7Conclusao 
                            dados={dados} 
                            onFechar={() => { clearDraft(); onClose(); }} 
                        />;
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[98vw] sm:max-w-4xl h-[92dvh] sm:h-auto sm:max-h-[88vh] flex flex-col overflow-hidden bg-dark-100/95 backdrop-blur-3xl border-white/10 p-0 shadow-[0_0_100px_rgba(0,0,0,0.6)] rounded-[1.5rem] sm:rounded-[2.5rem]">
                <div className="bg-dark-100/50 backdrop-blur-md pb-3 pt-4 sm:pb-6 sm:pt-6 px-4 sm:px-10 border-b border-white/5 z-20 shadow-lg flex-shrink-0">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div>
                            <DialogTitle className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight">
                                Registration <span className="text-brand-orange-coral">{selectedProject?.name || 'Event'}</span>
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Registration for {selectedProject?.name || 'Growth Experience'}.
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full h-10 w-10">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex items-center justify-between relative px-2 sm:px-6">
                        <div className="absolute top-4 sm:top-5 left-8 right-8 h-[1px] sm:h-[2px] bg-white/5 -z-10" />
                        <div
                            className="absolute top-4 sm:top-5 left-8 h-[1px] sm:h-[2px] bg-brand-orange-coral transition-all duration-500 -z-10 shadow-[0_0_10px_rgba(255,112,67,0.5)]"
                            style={{ width: `\${((currentStep - 1) / (totalSteps - 1)) * 100}%`, maxWidth: 'calc(100% - 64px)' }}
                        />

                        {['Tracks', 'Details', 'Confirm', 'Offer', 'Payment', 'App', 'Finish'].map((label, index) => {
                            const step = index + 1;
                            const isActive = step === currentStep;
                            const isCompleted = step < currentStep;

                            return (
                                <div key={step} className="flex flex-col items-center gap-2 relative">
                                    <div
                                        className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 \${isCompleted
                                            ? 'bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                            : isActive
                                                ? 'bg-brand-orange-coral border-brand-orange-coral text-white scale-110 shadow-[0_0_20px_rgba(255,112,67,0.4)]'
                                                : 'bg-dark-200 border-white/10 text-gray-500'
                                            }`}
                                    >
                                        {isCompleted ? <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" /> : <span className="text-[10px] sm:text-sm">{step}</span>}
                                    </div>
                                    <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider transition-colors \${isActive ? 'text-brand-orange-coral' : isCompleted ? 'text-green-500' : 'text-gray-600'} hidden sm:block`}>
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div ref={scrollContainerRef} className="flex-1 px-4 pt-6 pb-24 sm:px-12 sm:pb-10 sm:pt-8 overflow-y-auto ios-scroll scrollbar-hide">
                    <div className="max-w-3xl mx-auto w-full">
                        {renderStep()}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
