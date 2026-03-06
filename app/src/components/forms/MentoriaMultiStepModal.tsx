
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
                className="max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden bg-dark-100 border-white/10 p-4 sm:p-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-[2.5rem] custom-scrollbar selection:bg-brand-orange-coral/30"
            >
                <div className="sticky top-0 bg-dark-100/95 backdrop-blur-2xl pb-8 border-b border-white/5 mb-10 z-30 -mx-4 sm:-mx-10 px-4 sm:px-10 pt-2">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <DialogTitle className="text-3xl sm:text-4xl font-black text-white tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Agendar Mentoria 1:1</DialogTitle>
                            <DialogDescription className="text-gray-500 text-xs sm:text-sm font-medium tracking-wide">
                                Resolva seus desafios com especialistas de alto nível.
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="text-gray-500 hover:text-white hover:bg-white/10 rounded-2xl h-12 w-12 transition-all flex-shrink-0">
                            <X size={28} />
                        </Button>
                    </div>

                    {/* Enhanced Progress Tracker */}
                    <div className="relative mb-10 overflow-hidden px-1">
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                                <div key={step} className="grow h-1.5 rounded-full bg-white/5 relative overflow-hidden">
                                    <div
                                        className={`absolute top-0 left-0 h-full w-full transition-transform duration-1000 ease-[cubic-bezier(0.2,0,0,1)] ${step < currentStep ? 'bg-green-500 translate-x-0' :
                                            step === currentStep ? 'bg-gradient-to-r from-brand-orange-coral to-brand-orange-intense shadow-glow-orange translate-x-0' :
                                                '-translate-x-full'
                                            }`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Polished Stepper Labels */}
                    <div className="flex justify-between items-start gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        {['Área', 'Mentor', 'Dados', 'Confirmação', 'Palestras', 'Acesso', 'Conclusão'].map((label, idx) => {
                            const step = idx + 1;
                            const isActive = step === currentStep;
                            const isCompleted = step < currentStep;

                            return (
                                <div key={step} className={`flex flex-col items-center gap-3 transition-all duration-700 min-w-[70px] sm:min-w-[100px] ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                                    <div className={`
                                        w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-700 relative
                                        ${isCompleted ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                            isActive ? 'bg-brand-orange-coral text-white shadow-glow-orange scale-110' :
                                                'bg-white/5 text-gray-500 border border-white/5'}
                                    `}>
                                        {isCompleted ? <CheckCircle size={20} className="sm:size-6" /> : <span className="text-sm sm:text-lg font-black">{step}</span>}
                                        {isActive && <div className="absolute inset-0 rounded-2xl bg-brand-orange-coral animate-ping opacity-20" />}
                                    </div>
                                    <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-center ${isActive ? 'text-brand-orange-coral' : isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                                        {label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="relative z-10 px-0 sm:px-2">{renderStep()}</div>
            </DialogContent>
        </Dialog>
    );
}
