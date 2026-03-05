
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';
import type { DadosMentoria } from './mentoria-steps/mentoriaTypes';
import { Step1AreaMentoria } from './mentoria-steps/Step1AreaMentoria';
import { Step2SelecionarMentor } from './mentoria-steps/Step2SelecionarMentor';
import { Step3DadosPessoaisMentoria } from './mentoria-steps/Step3DadosPessoaisMentoria';
import { Step4ConfirmacaoMentoria } from './mentoria-steps/Step4ConfirmacaoMentoria';
import { Step4OfertaPalestras } from './inscricao-steps/Step4OfertaPalestras';
import { Step6DownloadApp } from './inscricao-steps/Step6DownloadApp';
import { Step7Conclusao } from './inscricao-steps/Step7Conclusao';

interface MentoriaMultiStepModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MentoriaMultiStepModal({ isOpen, onClose }: MentoriaMultiStepModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dados, setDados] = useState<DadosMentoria>({
        area: '',
        mentorId: '',
        descricaoProblema: '',
        nome: '',
        email: '',
        telefone: '',
        senha: '',
        comprarPalestras: false
    });

    const totalSteps = 7;

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
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        setTimeout(() => setIsProcessing(false), 500); // Guard to prevent double clicks
    };

    // Auto-scroll to top when step changes
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentStep]);

    const prevStep = () => {
        if (isProcessing) return;
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1AreaMentoria
                        areaSelecionada={dados.area}
                        descricaoProblema={dados.descricaoProblema}
                        onContinuar={(area, descricao) => {
                            updateDados({ area, descricaoProblema: descricao });
                            nextStep();
                        }}
                    />
                );
            case 2:
                return (
                    <Step2SelecionarMentor
                        area={dados.area}
                        mentorSelecionadoId={dados.mentorId}
                        onContinuar={(mentorId) => {
                            updateDados({ mentorId });
                            nextStep();
                        }}
                        onVoltar={prevStep}
                    />
                );
            case 3:
                return (
                    <Step3DadosPessoaisMentoria
                        dados={dados}
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
                        dados={dados}
                        onConfirmar={(userId, inscricaoId) => {
                            updateDados({ userId, inscricaoId });
                            nextStep();
                        }}
                        onVoltar={prevStep}
                    />
                );
            case 5:
                return (
                    <Step4OfertaPalestras
                        dados={dados as any}
                        onComprar={() => {
                            updateDados({ comprarPalestras: true });
                            nextStep();
                        }}
                        onPular={() => {
                            updateDados({ comprarPalestras: false });
                            nextStep();
                        }}
                    />
                );
            case 6:
                return (
                    <Step6DownloadApp
                        onContinuar={nextStep}
                    />
                );
            case 7:
                return (
                    <Step7Conclusao
                        dados={dados as any} // Cast to any because the interface is slightly different but fields match
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
            <DialogContent
                ref={scrollContainerRef}
                className="max-w-4xl max-h-[96vh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden bg-dark-100 border-white/10 p-3 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl sm:rounded-3xl"
            >
                <div className="sticky top-0 bg-dark-100 pb-4 sm:pb-6 border-b border-white/10 mb-4 sm:mb-6 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-white">Agendar Mentoria 1:1</DialogTitle>
                        <DialogDescription className="sr-only">
                            Formulário para agendamento de mentorias individuais durante o evento.
                        </DialogDescription>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="text-gray-400 hover:text-white h-8 w-8">
                            <X size={18} />
                        </Button>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                            <div key={step} className="flex-1">
                                <div className="h-1.5 sm:h-2 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-700 ease-out ${step < currentStep ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' :
                                            step === currentStep ? 'bg-brand-orange-coral shadow-[0_0_15px_rgba(255,112,67,0.4)]' :
                                                'bg-transparent'
                                            }`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-start gap-1 sm:gap-2 overflow-x-auto pb-4 sm:pb-0 px-1 scrollbar-hide">
                        {['Área', 'Mentor', 'Dados', 'Confirmar', 'Oferta', 'App', 'Fim'].map((label, idx) => {
                            const step = idx + 1;
                            const isActive = step === currentStep;
                            const isCompleted = step < currentStep;

                            return (
                                <div key={step} className="flex flex-col items-center gap-2 min-w-[55px] sm:min-w-[80px]">
                                    <div className={`
                                        w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all duration-500
                                        ${isCompleted ? 'bg-green-500/20 text-green-500 border border-green-500/20' :
                                            isActive ? 'bg-brand-orange-coral text-white shadow-glow-orange border border-brand-orange-coral/50 scale-110' :
                                                'bg-white/5 text-gray-600 border border-white/5'}
                                    `}>
                                        {isCompleted ? <CheckCircle size={16} className="sm:size-5" /> : <span className="text-xs sm:text-sm font-black">{step}</span>}
                                    </div>
                                    <span className={`text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-center transition-colors duration-500 ${isActive ? 'text-brand-orange-coral' : isCompleted ? 'text-green-500/70' : 'text-gray-600'}`}>
                                        {label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="px-2">{renderStep()}</div>
            </DialogContent>
        </Dialog>
    );
}
