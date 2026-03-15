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
import { Step4OfertaPalestras } from './inscricao-steps/Step4OfertaPalestras';
import { Step5PagamentoPix } from './inscricao-steps/Step5PagamentoPix';
import { Step6DownloadApp } from './inscricao-steps/Step6DownloadApp';
import { Step7Conclusao } from './inscricao-steps/Step7Conclusao';

const DRAFT_KEY = 'inscricao_form_draft';

interface InscricaoMultiStepModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InscricaoMultiStepModal({ isOpen, onClose }: InscricaoMultiStepModalProps) {
    const { selectedProject } = useProject();
    const [currentStep, setCurrentStep] = useState(1);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dados, setDados] = useState<DadosInscricao>({
        cursosSelecionados: [],
        nome: '',
        email: '',
        telefone: '',
        senha: '',
        comprarPalestras: false
    });

    const totalSteps = 7;

    const handleClose = () => {
        if (currentStep === 7) {
            onClose();
            clearDraft();
        } else {
            // No modo rascunho, podemos fechar sem medo de perder tudo, 
            // mas ainda é bom ter um aviso se for uma ação brusca
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

    // Carregar rascunho ao iniciar
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setDados(prev => ({ ...prev, ...parsed.data }));
                setCurrentStep(parsed.step || 1);
                logger.debug('Rascunho de inscrição carregado');
            } catch (e) {
                logger.warn('Erro ao carregar rascunho de inscrição:', e);
            }
        }
    }, []);

    // Salvar rascunho
    useEffect(() => {
        if (isOpen && currentStep < 7) {
            const draftData = {
                data: {
                    ...dados,
                    senha: '' // Higienizar
                },
                step: currentStep,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        }
    }, [dados, currentStep, isOpen]);

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setDados({
            cursosSelecionados: [],
            nome: '',
            email: '',
            telefone: '',
            senha: '',
            comprarPalestras: false
        });
        setCurrentStep(1);
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

                                    if (dados.voucherEmpresa) {
                                        const { error: rpcError } = await supabase.rpc('aplicar_voucher_empresa', {
                                            p_inscricao_id: dados.inscricaoId,
                                            p_voucher_code: dados.voucherEmpresa
                                        });
                                        if (rpcError) throw rpcError;
                                    } else {
                                        await (supabase
                                            .from('inscricoes_growth_experience') as unknown as { update: (v: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<unknown> } })
                                            .update({
                                                palestras_noturnas: true,
                                                valor_pago: valorComDesconto,
                                                status_pagamento: valorComDesconto > 0 ? 'pendente' : 'pago',
                                                cupom_palestra: dados.cupomPalestra || null,
                                                codigo_palestra: dados.cupomPalestra || null,
                                                valor_desconto_palestra: (dados.descontoPalestra || 0)
                                            })
                                            .eq('id', dados.inscricaoId);
                                    }

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
                                    await (supabase
                                        .from('inscricoes_growth_experience') as unknown as { update: (v: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<unknown> } })
                                        .update({ palestras_noturnas: false, valor_pago: 0 })
                                        .eq('id', dados.inscricaoId);
                                } catch (e) {
                                    logger.error('Erro ao pular palestras:', { error: e });
                                }
                            }
                            updateDados({ comprarPalestras: false });
                            nextStep();
                        }}
                        onVoltar={prevStep}
                        onUpdate={updateDados}
                    />
                );
            case 5:
                // Passo condicional: Se comprou palestras e está pendente, mostra pagamento
                if (dados.comprarPalestras && dados.statusPagamento !== 'pago') {
                    return (
                        <Step5PagamentoPix
                            dados={dados}
                            onContinuar={nextStep}
                            onVoltar={prevStep}
                        />
                    );
                } else {
                    // Pula automaticamente se não houver pagamento pendente
                    nextStep(true);
                    return <div className="flex items-center justify-center p-20"><Loader2 className="h-10 w-10 animate-spin" /></div>;
                }
            case 6:
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
                                        .from('inscricoes_growth_experience') as unknown as { update: (v: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<unknown> } })
                                        .update({ app_instalado: true })
                                        .eq('id', dados.inscricaoId);
                                    updateDados({ appInstalado: true });
                                } catch (err) {
                                    logger.error('Erro ao marcar app como instalado:', { error: err });
                                }
                            }
                            setIsProcessing(false);
                            nextStep();
                        }}
                    />
                );
            case 7:
                return (
                    <Step7Conclusao
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
            <DialogContent className="max-w-2xl h-[96vh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden bg-dark-100/95 backdrop-blur-2xl border-white/10 p-0 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl sm:rounded-3xl">
                {/* Header com Progresso */}
                <div className="bg-dark-100/50 backdrop-blur-md pb-4 pt-6 sm:pb-6 sm:pt-8 px-4 sm:px-8 border-b border-white/5 z-20 shadow-lg flex-shrink-0">
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
                            'Pix',
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
                <div
                    ref={scrollContainerRef}
                    className="flex-1 px-4 py-6 sm:px-8 sm:py-8 overflow-y-auto custom-scrollbar"
                >
                    {renderStep()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
