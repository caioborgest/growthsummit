
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';
import type { DadosMentoria } from './mentoria-steps/mentoriaTypes';
import { Step1AreaMentoria } from './mentoria-steps/Step1AreaMentoria';
import { Step2SelecionarMentor } from './mentoria-steps/Step2SelecionarMentor';
import { Step3DadosPessoaisMentoria } from './mentoria-steps/Step3DadosPessoaisMentoria';
import { Step4ConfirmacaoMentoria } from './mentoria-steps/Step4ConfirmacaoMentoria';
import { Step4OfertaPalestras } from './inscricao-steps/Step4OfertaPalestras';
import { Step5DownloadApp } from './inscricao-steps/Step5DownloadApp';
import { Step6Conclusao } from './inscricao-steps/Step6Conclusao';

interface MentoriaMultiStepModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MentoriaMultiStepModal({ isOpen, onClose }: MentoriaMultiStepModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dados, setDados] = useState<DadosMentoria>({
        area: '',
        mentorId: '',
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
                        onContinuar={(area) => {
                            updateDados({ area });
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
                    <Step5DownloadApp
                        onContinuar={nextStep}
                    />
                );
            case 7:
                return (
                    <Step6Conclusao
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-dark-100 border-white/10">
                <div className="sticky top-0 bg-dark-100 pb-6 border-b border-white/10 mb-6 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">Agendar Mentoria 1:1</h2>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="text-gray-400 hover:text-white">
                            <X size={20} />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                            <div key={step} className="flex-1 h-2 rounded-full transition-all bg-gray-700 overflow-hidden">
                                <div className={`h-full transition-all ${step < currentStep ? 'bg-green-500' : step === currentStep ? 'bg-brand-orange-coral' : 'bg-transparent'}`} />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between mt-4">
                        {['Área', 'Mentor', 'Dados', 'Confirmar', 'Oferta', 'App', 'Fim'].map((label, idx) => {
                            const step = idx + 1;
                            return (
                                <div key={step} className="flex flex-col items-center gap-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step < currentStep ? 'bg-green-500' : step === currentStep ? 'bg-brand-orange-coral' : 'bg-gray-800 text-gray-500'}`}>
                                        {step < currentStep ? <CheckCircle size={14} /> : step}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase ${step === currentStep ? 'text-brand-orange-coral' : 'text-gray-500'}`}>{label}</span>
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
