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
        descricaoProblema: '',
        nome: '',
        email: '',
        phone: '',
        senha: '',
        nomeNegocio: '',
        estagioNegocio: ''
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
                nome: user.name || prev.nome,
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
                        descricaoProblema={dados.descricaoProblema}
                        nomeNegocio={dados.nomeNegocio}
                        estagioNegocio={dados.estagioNegocio}
                        onContinuar={(area, descricao, neg, est) => {
                            updateDados({ area, descricaoProblema: descricao, nomeNegocio: neg, estagioNegocio: est });
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
            <DialogContent className="max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden bg-dark-100 border-white/10 p-4 sm:p-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-[2.5rem] custom-scrollbar">
                <div className="sr-only">
                    <DialogTitle>Solicitação de Mentoria</DialogTitle>
                    <DialogDescription>Formulário de agendamento de mentoria em múltiplas etapas.</DialogDescription>
                </div>
                <div className="sticky top-0 bg-dark-100/95 backdrop-blur-2xl pb-8 border-b border-white/5 mb-10 z-30 -mx-4 sm:-mx-10 px-4 sm:px-10 pt-2 text-center">
                    <button
                        onClick={handleClose}
                        className="absolute right-6 top-4 p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all z-40"
                        aria-label="Fechar"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <DialogTitle className="text-3xl sm:text-4xl font-black text-white tracking-tighter italic">Mentoria <span className="text-brand-orange-coral">EXPERIENCE</span></DialogTitle>
                    <p className="text-gray-500 text-xs font-medium tracking-widest mt-2 uppercase">Growth Experience 2026 · 20min Spots</p>
                </div>
                <div className="relative z-10 px-0 sm:px-2">{renderStep()}</div>
            </DialogContent>
        </Dialog>
    );
}
