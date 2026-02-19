import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';
import type { DadosInscricao } from './inscricao-steps/inscricaoTypes';
import { Step1SelecionarCursos } from './inscricao-steps/Step1SelecionarCursos';
import { Step2DadosPessoais } from './inscricao-steps/Step2DadosPessoais';
import { Step3Confirmacao } from './inscricao-steps/Step3Confirmacao';
import { Step4OfertaPalestras } from './inscricao-steps/Step4OfertaPalestras';
import { Step5DownloadApp } from './inscricao-steps/Step5DownloadApp';
import { Step6Conclusao } from './inscricao-steps/Step6Conclusao';

interface InscricaoMultiStepModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InscricaoMultiStepModal({ isOpen, onClose }: InscricaoMultiStepModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [dados, setDados] = useState<DadosInscricao>({
        cursosSelecionados: [],
        nome: '',
        email: '',
        telefone: '',
        senha: '',
        comprarPalestras: false
    });

    const totalSteps = 6;

    const handleClose = () => {
        if (currentStep === 6) {
            // Pode fechar na conclusão
            onClose();
            setCurrentStep(1);
            setDados({
                cursosSelecionados: [],
                nome: '',
                email: '',
                telefone: '',
                senha: '',
                comprarPalestras: false
            });
        } else {
            // Confirmar se quer sair
            if (confirm('Deseja realmente sair? Seus dados serão perdidos.')) {
                onClose();
                setCurrentStep(1);
            }
        }
    };

    const updateDados = (novos: Partial<DadosInscricao>) => {
        setDados(prev => ({ ...prev, ...novos }));
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
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
                        onConfirmar={(userId, inscricaoId) => {
                            updateDados({ userId, inscricaoId });
                            nextStep();
                        }}
                        onVoltar={prevStep}
                    />
                );
            case 4:
                return (
                    <Step4OfertaPalestras
                        dados={dados}
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
            case 5:
                return (
                    <Step5DownloadApp
                        onContinuar={async () => {
                            if (dados.inscricaoId) {
                                try {
                                    const { supabase } = await import('@/lib/supabase');
                                    await (supabase
                                        .from('inscricoes_growth_experience') as any)
                                        .update({ app_instalado: true })
                                        .eq('id', dados.inscricaoId);
                                    updateDados({ appInstalado: true });
                                } catch (err) {
                                    console.error('Erro ao marcar app como instalado:', err);
                                }
                            }
                            nextStep();
                        }}
                    />
                );
            case 6:
                return (
                    <Step6Conclusao
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
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-dark-100 border-white/10 p-0">
                {/* Header com Progresso */}
                <div className="sticky top-0 bg-dark-100 pb-6 border-b border-white/10 mb-6 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">
                            Inscrição Growth Experience
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="text-gray-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                            <div key={step} className="flex items-center flex-1">
                                <div
                                    className={`w-full h-2 rounded-full transition-all ${step < currentStep
                                        ? 'bg-green-500'
                                        : step === currentStep
                                            ? 'bg-brand-orange-coral'
                                            : 'bg-gray-700'
                                        }`}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Step Indicators */}
                    <div className="flex items-center justify-between mt-4 px-2">
                        {[
                            'Cursos',
                            'Dados',
                            'Confirmar',
                            'Palestras',
                            'App',
                            'Concluído'
                        ].map((label, index) => {
                            const step = index + 1;
                            return (
                                <div
                                    key={step}
                                    className="flex flex-col items-center gap-2 flex-1 min-w-0"
                                >
                                    <div
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all text-sm sm:text-base ${step < currentStep
                                            ? 'bg-green-500 text-white'
                                            : step === currentStep
                                                ? 'bg-brand-orange-coral text-white'
                                                : 'bg-gray-700 text-gray-400'
                                            }`}
                                    >
                                        {step < currentStep ? (
                                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                        ) : (
                                            step
                                        )}
                                    </div>
                                    <span
                                        className={`text-[10px] sm:text-xs font-semibold truncate w-full text-center hidden xs:block ${step === currentStep
                                            ? 'text-brand-orange-coral'
                                            : step < currentStep
                                                ? 'text-green-500'
                                                : 'text-gray-500'
                                            }`}
                                    >
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="px-2">
                    {renderStep()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
