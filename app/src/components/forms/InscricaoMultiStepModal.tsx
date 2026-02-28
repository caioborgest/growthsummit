import { useState } from 'react';
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
import { Step5DownloadApp } from './inscricao-steps/Step5DownloadApp';
import { Step6Conclusao } from './inscricao-steps/Step6Conclusao';

interface InscricaoMultiStepModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InscricaoMultiStepModal({ isOpen, onClose }: InscricaoMultiStepModalProps) {
    const { selectedProject } = useProject();
    const [currentStep, setCurrentStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
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

    const nextStep = (force = false) => {
        if (isProcessing && !force) return;
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
        // Reset processing after a short delay to prevent multiple clicks
        setTimeout(() => setIsProcessing(false), 300);
    };

    const prevStep = () => {
        if (isProcessing) return;
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
                        onConfirmar={(userId, inscricaoId, statusPagamento) => {
                            updateDados({ userId, inscricaoId, statusPagamento });
                            // Don't set isProcessing here since Step3 handles its own loading state
                            nextStep(true); // Force next step
                        }}
                        onVoltar={prevStep}
                    />
                );
            case 4:
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
                                    const descontoEfetivo = dados.descontoPalestra !== undefined ? dados.descontoPalestra : (dados.descontoSocial || 0);
                                    const valorComDesconto = valorOriginal * (1 - descontoEfetivo / 100);

                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    await (supabase
                                        .from('inscricoes_growth_experience') as any)
                                        .update({
                                            palestras_noturnas: true,
                                            valor_pago: valorComDesconto,
                                            status_pagamento: valorComDesconto > 0 ? 'pendente' : 'pago',
                                            cupom_palestra: dados.cupomPalestra || null,
                                            codigo_palestra: dados.cupomPalestra || null,
                                            valor_desconto_palestra: (dados.descontoPalestra || 0)
                                        })
                                        .eq('id', dados.inscricaoId);

                                    updateDados({
                                        comprarPalestras: true,
                                        statusPagamento: valorComDesconto > 0 ? 'pendente' : 'pago'
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
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    await (supabase
                                        .from('inscricoes_growth_experience') as any)
                                        .update({ palestras_noturnas: false, valor_pago: 0 })
                                        .eq('id', dados.inscricaoId);
                                } catch (e) {
                                    logger.error('Erro ao pular palestras:', { error: e });
                                }
                            }
                            updateDados({ comprarPalestras: false });
                            nextStep();
                        }}
                        onUpdate={updateDados}
                    />
                );
            case 5:
                return (
                    <Step5DownloadApp
                        onContinuar={async () => {
                            if (isProcessing) return;
                            setIsProcessing(true);
                            if (dados.inscricaoId) {
                                try {
                                    const { supabase } = await import('@/lib/supabase');
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    await (supabase
                                        .from('inscricoes_growth_experience') as any)
                                        .update({ app_instalado: true })
                                        .eq('id', dados.inscricaoId);
                                    updateDados({ appInstalado: true });
                                } catch (err) {
                                    logger.error('Erro ao marcar app como instalado:', { error: err });
                                }
                            }
                            setIsProcessing(false); // Reset before nextStep because nextStep will set it to true again
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
            <DialogContent className="max-w-2xl max-h-[96vh] sm:max-h-[90vh] overflow-hidden bg-dark-100/95 backdrop-blur-2xl border-white/10 p-0 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl sm:rounded-3xl">
                {/* Header com Progresso */}
                <div className="bg-dark-100/50 backdrop-blur-md pb-4 pt-6 sm:pb-6 sm:pt-8 px-4 sm:px-8 border-b border-white/5 z-20 shadow-lg">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <DialogTitle className="text-xl sm:text-3xl font-black text-white tracking-tight">
                                Inscrição <span className="text-brand-orange-coral">{selectedProject?.shortDescription || selectedProject?.name || 'Evento'}</span>
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Processo de inscrição para workshops e treinamentos do {selectedProject?.name || 'Growth Experience'}.
                            </DialogDescription>
                            <p className="text-gray-500 text-[10px] sm:text-sm mt-1">{selectedProject?.name || 'Growth Experience'} • Workshop & Training</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full h-10 w-10 transition-all"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Step Indicators Compactos e Elegantes */}
                    <div className="flex items-center justify-between relative px-2">
                        {/* Linha de fundo conectora */}
                        <div className="absolute top-5 left-8 right-8 h-[2px] bg-white/5 -z-10" />
                        {/* Linha de progresso ativa */}
                        <div
                            className="absolute top-5 left-8 h-[2px] bg-brand-orange-coral transition-all duration-500 -z-10 shadow-[0_0_10px_rgba(255,112,67,0.5)]"
                            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`, maxWidth: 'calc(100% - 48px)' }}
                        />

                        {[
                            'Cursos',
                            'Dados',
                            'Confirmar',
                            'Upgrade',
                            'App',
                            'OK'
                        ].map((label, index) => {
                            const step = index + 1;
                            const isActive = step === currentStep;
                            const isCompleted = step < currentStep;

                            return (
                                <div
                                    key={step}
                                    className="flex flex-col items-center gap-3 relative"
                                >
                                    <div
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 ${isCompleted
                                            ? 'bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                            : isActive
                                                ? 'bg-brand-orange-coral border-brand-orange-coral text-white shadow-[0_0_20px_rgba(255,112,67,0.4)] scale-110'
                                                : 'bg-dark-200 border-white/10 text-gray-500'
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : (
                                            <span className="text-sm">{step}</span>
                                        )}
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isActive
                                            ? 'text-brand-orange-coral'
                                            : isCompleted
                                                ? 'text-green-500'
                                                : 'text-gray-600'
                                            }`}
                                    >
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content com Scrollbar Customizada */}
                <div className="px-4 py-6 sm:px-8 sm:py-8 overflow-y-auto max-h-[calc(96vh-180px)] sm:max-h-[calc(90vh-200px)] custom-scrollbar">
                    {renderStep()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
