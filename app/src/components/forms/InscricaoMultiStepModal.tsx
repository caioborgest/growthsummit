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
        name: '',
        cpf: '',
        email: '',
        phone: '',
        password: '',
        buyLectures: false,
        code: '',
        socialDiscount: 0,
        lectureDiscount: 0,
        registrationType: 'standard',
        batchId: null,
        companyVoucher: '',
        referralType: 'nenhum',
        referralName: '',
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
        if (targetStep === 4 && dados.buyLectures) {
            targetStep = 3;
        }
        
        // Skip Payment step backwards if free
        if (targetStep === 5 && (dados.paymentStatus === 'pago' || (dados.valorFinal || 0) <= 0)) {
            targetStep = (dados.buyLectures) ? 3 : 4;
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
                data: { ...dados, password: '' },
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
            batchId: activeBatch?.id || null,
            registrationType: (activeTier?.id || 'standard') as any
        };

        if (selectedProject.slug?.includes('triunfo')) {
            updates.buyLectures = true;
            updates.cursosSelecionados = TriumphSessions;
        }
        
        updateDados(updates);
    }, [selectedProject?.id, allSessions?.length]);

    // Smart logic for skipping steps
    useEffect(() => {
        // Skip Step 4 (Offer) if already bought or fixed package
        if (currentStep === 4 && dados.buyLectures) {
            nextStep(true);
        }
        
        // Skip Step 5 (Payment) if total is zero or already paid
        const isFree = (dados.valorFinal !== undefined && dados.valorFinal <= 0) || (dados.socialDiscount === 100);
        if (currentStep === 5 && (dados.paymentStatus === 'pago' || isFree)) {
            nextStep(true);
        }
    }, [currentStep, dados.buyLectures, dados.paymentStatus, dados.valorFinal, dados.socialDiscount]);

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setDados({
            cursosSelecionados: [],
            name: '',
            cpf: '',
            email: '',
            phone: '',
            password: '',
            buyLectures: false,
            batchId: null,
            companyVoucher: '',
            referralType: 'nenhum',
            referralName: '',
            code: '',
            socialDiscount: 0,
            lectureDiscount: 0,
            registrationType: 'standard',
            partnerId: '',
            partnerAccessCode: ''
        });
        setCurrentStep(1);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1SelecionarCursos 
                            selectedSessions={dados.cursosSelecionados || []} 
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
                            onConfirmar={(userId, registrationId, paymentStatus) => { updateDados({ userId, registrationId, paymentStatus }); nextStep(true); }} 
                            onVoltar={prevStep} 
                            onUpdate={updateDados} 
                        />;
            case 4:
                return <Step4OfertaPalestras 
                            dados={dados} 
                            onComprar={() => { updateDados({ buyLectures: true }); nextStep(); }} 
                            onPular={() => { updateDados({ buyLectures: false }); nextStep(); }} 
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
            <DialogContent className="admin-modal-content max-w-4xl bg-dark-100 border-none p-0 overflow-hidden shadow-2xl">
                <div className="admin-modal-header flex-col items-stretch gap-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-black text-white tracking-tighter italic uppercase leading-none">
                                Inscrição <span className="text-brand-orange-coral">{selectedProject?.name || 'Evento'}</span>
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Inscrição para {selectedProject?.name || 'Growth Experience'}.
                            </DialogDescription>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2 italic">
                                Siga os passos para garantir sua vaga no maior evento de 2026
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="h-12 w-12 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    <div className="flex items-center justify-between relative px-6">
                        <div className="absolute top-5 left-8 right-8 h-[2px] bg-white/5 -z-10" />
                        <div
                            className="absolute top-5 left-8 h-[2px] bg-brand-orange-coral transition-all duration-500 -z-10 shadow-[0_0_20px_rgba(255,112,67,0.5)]"
                            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`, maxWidth: 'calc(100% - 64px)' }}
                        />

                        {['Programação', 'Dados', 'Confirmar', 'Oferta', 'Pagamento', 'App', 'Concluir'].map((label, index) => {
                            const step = index + 1;
                            const isActive = step === currentStep;
                            const isCompleted = step < currentStep;

                            return (
                                <div key={step} className="flex flex-col items-center gap-3 relative">
                                    <div
                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-300 border-2 ${isCompleted
                                            ? 'bg-green-500 border-green-500 text-white shadow-glow-sm'
                                            : isActive
                                                ? 'bg-brand-orange-coral border-brand-orange-coral text-white scale-110 shadow-glow-orange'
                                                : 'bg-white/5 border-white/10 text-gray-700'
                                            }`}
                                    >
                                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : <span className="text-sm italic">{step}</span>}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-brand-orange-coral' : isCompleted ? 'text-green-500' : 'text-gray-700'} hidden md:block`}>
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div ref={scrollContainerRef} className="admin-modal-body bg-dark-100/50">
                    <div className="max-w-3xl mx-auto w-full py-2">
                        {renderStep()}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
