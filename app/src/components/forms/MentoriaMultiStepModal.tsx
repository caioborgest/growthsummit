import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import type { DadosMentoria } from './mentoria-steps/mentoriaTypes';
import { Step1AreaMentoria } from './mentoria-steps/Step1AreaMentoria';
import { Step2SelecionarMentor } from './mentoria-steps/Step2SelecionarMentor';
import { Step3DadosPessoaisMentoria } from './mentoria-steps/Step3DadosPessoaisMentoria';
import { Step4ConfirmacaoMentoria } from './mentoria-steps/Step4ConfirmacaoMentoria';
import { useAuth } from '@/contexts/AuthContext';
import { Step5ConclusaoMentoria } from './mentoria-steps/Step5ConclusaoMentoria';

interface MentoriaMultiStepModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMentorId?: string | null;
}

export function MentoriaMultiStepModal({ isOpen, onClose, initialMentorId }: MentoriaMultiStepModalProps) {
    const { user, isAuthenticated } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dados, setDados] = useState<DadosMentoria>({
        area: 'OUTRO', // Default area if skipping step 1
        mentorId: initialMentorId || '',
        slotId: '',
        problemDescription: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        businessName: '',
        businessStage: ''
    });

    // Jump to step 2 if initialMentorId is provided on open
    useEffect(() => {
        if (isOpen && initialMentorId && dados.mentorId !== initialMentorId) {
            setDados(prev => ({ ...prev, mentorId: initialMentorId }));
            setCurrentStep(2);
        }
    }, [isOpen, initialMentorId, dados.mentorId]);

    // Efeito para preencher dados se o usuário estiver logado
    useEffect(() => {
        if (isAuthenticated && user && isOpen && !dados.email) {
            setDados(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: (user as any).phone || prev.phone,
                userId: user.id
            }));
        }
    }, [isAuthenticated, user, isOpen, dados.email]);

    const totalSteps = 5;
    const stepsToSkip = isAuthenticated ? [3] : [];

    const handleClose = () => {
        if (currentStep === totalSteps) {
            onClose();
            setCurrentStep(1);
        } else {
            if (confirm('Deseja realmente sair? Seus dados serão perdidos.')) {
                onClose();
                setCurrentStep(1);
            }
        }
    };

    const updateDados = (novos: Partial<DadosMentoria>) => {
        setDados(prev => ({ ...prev, ...novos }));
    };

    const nextStep = async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        let next = currentStep + 1;
        while (stepsToSkip.includes(next) && next < totalSteps) {
            next++;
        }

        setCurrentStep(Math.min(next, totalSteps));
        setTimeout(() => setIsProcessing(false), 500);
    };

    const prevStep = () => {
        if (isProcessing) return;

        let prev = currentStep - 1;
        while (stepsToSkip.includes(prev) && prev > 1) {
            prev--;
        }

        setCurrentStep(Math.max(prev, 1));
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1AreaMentoria
                        areaSelecionada={dados.area}
                        problemDescription={dados.problemDescription}
                        businessName={dados.businessName}
                        businessStage={dados.businessStage}
                        onContinuar={(area, desc, biz, stage) => {
                            updateDados({ area, problemDescription: desc, businessName: biz, businessStage: stage });
                            nextStep();
                        }}
                        onVoltar={handleClose}
                    />
                );
            case 2:
                return (
                    <Step2SelecionarMentor
                        area={dados.area}
                        mentorSelecionadoId={dados.mentorId}
                        slotSelecionadoId={dados.slotId}
                        onContinuar={(mentorId, slotId, selectedDate) => {
                            updateDados({ mentorId, slotId, selectedDate });
                            nextStep();
                        }}
                        onVoltar={prevStep}
                    />
                );
            case 3:
                return (
                    <Step3DadosPessoaisMentoria
                        dados={dados as any}
                        onContinuar={(novos) => {
                            updateDados(novos);
                            nextStep();
                        }}
                        onVoltar={prevStep}
                    />
                );
            case 4:
                return (
                    <Step4ConfirmacaoMentoria
                        dados={dados as any}
                        onConfirmar={(userId, inscricaoId) => {
                            updateDados({ userId, inscricaoId });
                            nextStep();
                        }}
                        onVoltar={prevStep}
                    />
                );
            case 5:
                return (
                    <Step5ConclusaoMentoria
                        dados={dados}
                        onFechar={() => {
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
            <DialogContent className="admin-modal-content max-w-4xl bg-dark-100 border-none p-0 overflow-hidden shadow-2xl">
                <div className="admin-modal-header flex-col items-center gap-2 py-8 relative">
                    <button
                        onClick={handleClose}
                        className="absolute right-6 top-6 p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all z-40"
                        aria-label="Fechar"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <DialogTitle className="text-3xl sm:text-4xl font-black text-white tracking-tighter italic uppercase leading-none">
                        Mentoria <span className="text-brand-orange-coral">EXPERIENCE</span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                        Growth Experience 2026 · 20min Spots
                    </DialogDescription>
                </div>

                <div className="admin-modal-body bg-dark-100/30">
                    <div className="max-w-3xl mx-auto w-full py-4">
                        {renderStep()}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
