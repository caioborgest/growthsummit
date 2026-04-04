import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Copy,
    CheckCircle,
    ArrowRight,
    AlertCircle,
    Landmark
} from 'lucide-react';
import { toast } from 'sonner';
import { EVENT_CONFIG } from '@/config/eventConfig';
import { supabase } from '@/lib/supabase';
import type { DadosInscricao } from './inscricaoTypes';
import { useEffect, useRef } from 'react';

interface Step5PagamentoPixProps {
    dados: DadosInscricao;
    onContinuar: () => void;
    onVoltar?: () => void;
}

export function Step5PagamentoPix({ dados, onContinuar, onVoltar }: Step5PagamentoPixProps) {
    const [copied, setCopied] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);

    // PIX Configurations (centralized in EVENT_CONFIG)
    const cnpj = EVENT_CONFIG.pix.cnpj;
    const merchantName = EVENT_CONFIG.pix.beneficiario;

    // Price calculation
    const valorOriginal = EVENT_CONFIG.proPrice || 179.99;
    const descontoEfetivo = Math.max(dados.descontoPalestra || 0, dados.descontoSocial || 0);
    const valorFinal = valorOriginal * (1 - descontoEfetivo / 100);
    const valorFormatado = valorFinal.toFixed(2);

    useEffect(() => {
        // Start Polling for automatic confirmation
        pollingInterval.current = setInterval(async () => {
            if (!dados.inscricaoId || isConfirmed) return;

            const { data } = await supabase
                .from('growth_experience_registrations')
                .select('payment_status')
                .eq('id', dados.inscricaoId)
                .single();

            if ((data as any)?.payment_status === 'pago' || (data as any)?.payment_status === 'paid') {
                setIsConfirmed(true);
                if (pollingInterval.current) {
                    clearInterval(pollingInterval.current);
                }
                toast.success('PAYMENT CONFIRMED! 🎉', {
                    description: 'Your access has been granted automatically.',
                    duration: 5000
                });
                setTimeout(onContinuar, 2000);
            }
        }, 5000);

        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [dados.inscricaoId, isConfirmed, onContinuar]);

    const handleCopy = () => {
        navigator.clipboard.writeText(cnpj);
        setCopied(true);
        toast.success("CNPJ copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStripe = () => {
        const STRIPE_LINK = EVENT_CONFIG.stripePaymentLink;
        window.open(STRIPE_LINK, '_blank');
        toast.info("Stripe link opened. Access will be granted after card confirmation.");
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <Badge className="mb-3 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-3 py-1">
                    PAYMENT STAGE
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                    Complete your <span className="text-brand-orange-coral">Night Passport</span>
                </h3>
                <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
                    Copy the CNPJ below to make the payment via PIX in your banking app.
                </p>
            </div>

            <Card className="glass-card p-6 border-white/10 relative overflow-hidden bg-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange-coral/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                <div className="space-y-6 relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="space-y-1 text-center sm:text-left">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Upgrade Value</p>
                            <p className="text-4xl font-black text-white">
                                R$ <span className="text-brand-orange-coral">{valorFormatado.replace('.', ',')}</span>
                            </p>
                            {descontoEfetivo > 0 && (
                                <Badge className="bg-green-500/10 text-green-500 border-none px-2 py-0 text-[10px]">
                                    {descontoEfetivo}% discount applied {dados.code && `(Code: \${dados.code})`}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">PIX Key (CNPJ)</p>
                        <div className="form-pix-row">
                            <div className="form-pix-code">{cnpj}</div>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className={`btn-form-primary shrink-0 \${copied ? 'bg-green-600' : ''}`}
                            >
                                {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                {copied ? 'COPIED!' : 'COPY'}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Beneficiary</p>
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-xs font-bold text-foreground uppercase truncate">{merchantName}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Bank</p>
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-xs font-bold text-foreground uppercase">CORA</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-brand-orange-coral/5 border border-brand-orange-coral/10">
                <AlertCircle className="h-5 w-5 text-brand-orange-coral flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                    <p className="text-sm text-gray-300 leading-relaxed">
                        After making the payment, the system will identify it automatically. If you prefer, you can send the receipt via support.
                    </p>
                </div>
            </div>

            <div className="form-actions flex gap-2">
                {onVoltar && (
                    <button type="button" onClick={onVoltar} className="btn-form-back">
                        Back
                    </button>
                )}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={handleStripe}
                        className="btn-form-primary !bg-gradient-to-r !from-blue-600 !to-blue-700 !shadow-[0_6px_24px_rgba(37,99,235,0.4)]"
                    >
                        <Landmark className="h-5 w-5 hidden sm:block" />
                        CARD (UP TO 12X)
                    </button>
                    <button
                        type="button"
                        onClick={onContinuar}
                        className="btn-form-primary !bg-white !text-gray-900 !shadow-xl hover:!bg-gray-100"
                    >
                        NEXT STEP
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                By clicking proceed, you continue to the app installation area.
            </p>
        </div>
    );
}
