import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Copy,
    CheckCircle,
    ArrowRight,
    AlertCircle,
    Landmark,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useProject } from '@/contexts/ProjectContext';
import { EVENT_CONFIG } from '@/config/eventConfig';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { DadosInscricao } from './inscricaoTypes';
import { useEffect, useRef } from 'react';

interface Step5PagamentoPixProps {
    dados: DadosInscricao;
    onContinuar: () => void;
    onVoltar?: () => void;
}

export function Step5PagamentoPix({ dados, onContinuar, onVoltar }: Step5PagamentoPixProps) {
    const { selectedProject } = useProject();
    const [copied, setCopied] = useState(false);
    const [loadingPix, setLoadingPix] = useState(true);
    const [pixData, setPixData] = useState<{ copyPaste: string; qrCode: string } | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);

    // Configurações do PIX (centralizadas no EVENT_CONFIG)
    const cnpj = EVENT_CONFIG.pix.cnpj;
    const merchantName = EVENT_CONFIG.pix.beneficiario;

    // Cálculo do valor
    const valorOriginal = 179.99;
    const descontoEfetivo = dados.descontoPalestra !== undefined ? dados.descontoPalestra : (dados.descontoSocial || 0);
    const valorFinal = valorOriginal * (1 - descontoEfetivo / 100);
    const valorFormatado = valorFinal.toFixed(2);

    // 1. Gerar PIX ao montar
    useEffect(() => {
        const generatePix = async () => {
            if (!dados.inscricaoId) return;
            try {
                // 1. Tentar obter a sessão atual para garantir que o JWT seja enviado
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    logger.warn('[Step5] Nenhuma sessão ativa encontrada ao tentar gerar PIX.');
                }

                const { data, error } = await supabase.functions.invoke('cora-gateway', {
                    body: { 
                        registrationId: dados.inscricaoId,
                        action: 'create-pix' 
                    }
                });

                if (error) {
                    // Tratar erro 401 especificamente
                    if (error.status === 401 || (error as any).message?.includes('401')) {
                        throw new Error('Sessão expirada ou não autorizada. Por favor, tente recarregar a página.');
                    }
                    throw error;
                }

                if (data?.success) {
                    setPixData({
                        copyPaste: data.pixCopyPaste,
                        qrCode: data.qrCodeUrl
                    });
                } else if (data?.error) {
                    throw new Error(data.error);
                }
            } catch (err) {
                logger.error('Erro ao gerar PIX Cora:', err);
                toast.error('Erro ao gerar QR Code PIX. Tente novamente.');
            } finally {
                setLoadingPix(false);
            }
        };

        generatePix();

        // 2. Iniciar Polling para confirmação automática
        pollingInterval.current = setInterval(async () => {
            if (!dados.inscricaoId || isConfirmed) return;

            const { data } = await supabase
                .from('inscricoes_growth_experience')
                .select('status_pagamento')
                .eq('id', dados.inscricaoId)
                .single();

            if ((data as any)?.status_pagamento === 'pago') {
                setIsConfirmed(true);
                clearInterval(pollingInterval.current);
                toast.success('PAGAMENTO CONFIRMADO! 🎉', {
                    description: 'Seu acesso foi liberado automaticamente.',
                    duration: 5000
                });
                setTimeout(onContinuar, 2000);
            }
        }, 5000);

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [dados.inscricaoId, isConfirmed, onContinuar]);

    const handleCopy = () => {
        const textToCopy = pixData?.copyPaste || cnpj;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        toast.success(pixData ? "Código PIX copiado!" : "CNPJ copiado!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStripe = () => {
        // Link de pagamento do Stripe conforme solicitado
        const STRIPE_LINK = EVENT_CONFIG.stripePaymentLink;
        window.open(STRIPE_LINK, '_blank');
        toast.info("Link do Stripe aberto. O acesso será liberado após a confirmação no cartão.");
    };

    const handleWhatsApp = () => {
        const phoneInfo = `\n• *Telefone:* ${dados.telefone}`;
        const cupomInfo = dados.cupomPalestra ? `\n• *Cupom:* ${dados.cupomPalestra}` : '';

        const mensagem = encodeURIComponent(
            `🚀 *COMPROVANTE DE PAGAMENTO - GROWTH EXPERIENCE*\n\n` +
            `Olá! Acabo de realizar o pagamento do meu upgrade para o *Passaporte Night*.\n\n` +
            `*DADOS DO PARTICIPANTE:*\n` +
            `• *Nome:* ${dados.nome}${phoneInfo}${cupomInfo}\n` +
            `• *Evento:* ${selectedProject?.name || 'Growth Experience'}\n` +
            `• *Valor Pago:* R$ ${valorFormatado}\n\n` +
            `_Estou enviando o comprovante em anexo abaixo._`
        );

        window.open(`https://wa.me/${EVENT_CONFIG.whatsapp.number}?text=${mensagem}`, '_blank');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center">
                <Badge className="mb-3 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-3 py-1">
                    ETAPA DE PAGAMENTO
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                    Finalize seu <span className="text-brand-orange-coral">Passaporte Night</span>
                </h3>
                <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
                    Copie o CNPJ abaixo para realizar o pagamento via PIX no aplicativo do seu banco.
                </p>
            </div>

            {/* Pix Container */}
            <Card className="glass-card p-6 border-white/10 relative overflow-hidden bg-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange-coral/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                <div className="space-y-6 relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="space-y-1 text-center sm:text-left">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Valor do Upgrade</p>
                            <p className="text-4xl font-black text-white">
                                R$ <span className="text-brand-orange-coral">{valorFormatado.replace('.', ',')}</span>
                            </p>
                            {descontoEfetivo > 0 && (
                                <Badge className="bg-green-500/10 text-green-500 border-none px-2 py-0 text-[10px]">
                                    {descontoEfetivo}% de desconto aplicado
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 items-center">
                        <div className="flex justify-center bg-white p-4 rounded-2xl shadow-inner border border-white/10 mx-auto sm:mx-0 w-48 h-48 sm:w-56 sm:h-56">
                            {loadingPix ? (
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="h-10 w-10 animate-spin text-brand-orange-coral" />
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Gerando<br />QR Code...</p>
                                </div>
                            ) : pixData ? (
                                <img src={pixData.qrCode} alt="PIX QR Code" className="w-full h-full object-contain" />
                            ) : (
                                <div className="flex flex-col items-center justify-center p-4 text-center">
                                    <AlertCircle className="h-8 w-8 text-brand-orange-coral mb-2" />
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter leading-none">Aguardando<br />Sistema</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Código PIX Copia e Cola</p>
                                <div className="flex items-center gap-2 bg-dark-300/50 p-1.5 rounded-xl border border-white/5 group hover:border-brand-orange-coral/30 transition-all">
                                    <code className="text-white font-mono text-[10px] truncate max-w-[150px] sm:max-w-none font-bold flex-1 py-2 px-2">
                                        {pixData?.copyPaste || cnpj}
                                    </code>
                                    <Button
                                        size="sm"
                                        onClick={handleCopy}
                                        className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white px-4 h-10 font-bold rounded-lg shadow-lg"
                                    >
                                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Favorecido</p>
                                    <div className="p-2 rounded-lg bg-dark-200/50 border border-white/5">
                                        <p className="text-[10px] font-bold text-white uppercase truncate">{merchantName}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Banco</p>
                                    <div className="p-2 rounded-lg bg-dark-200/50 border border-white/5">
                                        <p className="text-[10px] font-bold text-white uppercase">CORA SOCIEDADE</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Instruction Alert */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-brand-orange-coral/5 border border-brand-orange-coral/10">
                <AlertCircle className="h-5 w-5 text-brand-orange-coral flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                    <p className="text-sm text-gray-300 leading-relaxed">
                        Após realizar o pagamento, você <strong className="text-white">precisa enviar o comprovante</strong> pelo WhatsApp para liberação imediata do seu acesso Pro.
                    </p>
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                {onVoltar && (
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={onVoltar}
                        className="h-16 px-10 rounded-2xl font-black text-gray-400 border-white/10 hover:bg-white/5 uppercase tracking-widest text-xs"
                    >
                        Voltar
                    </Button>
                )}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                        size="lg"
                        onClick={handleStripe}
                        className="h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-500/20 group uppercase tracking-widest transition-all hover:scale-[1.02]"
                    >
                        <Landmark className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform hidden sm:block" />
                        CARTÃO (ATÉ 12X)
                    </Button>

                    <Button
                        size="lg"
                        onClick={onContinuar}
                        className="h-16 bg-white hover:bg-dark-100 text-dark hover:text-white font-black text-sm sm:text-base rounded-2xl transition-all group shadow-xl hover:scale-[1.02]"
                    >
                        PRÓXIMA ETAPA
                        <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-2 transition-transform" />
                    </Button>
                </div>
            </div>

            <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                Ao clicar em avançar, você prossegue para a área de instalação do app.
            </p>
        </div>
    );
}
