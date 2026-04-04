import { useState } from 'react';
import { CheckCircle, Star, ArrowRight, X, Loader2, Key } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { DadosInscricao } from './inscricaoTypes';
import type { RegistrationBatch } from '@/types';

interface Step4OfertaPalestrasProps {
    dados: DadosInscricao;
    onComprar: () => void;
    onPular: () => void;
    onVoltar?: () => void;
    onUpdate?: (novos: Partial<DadosInscricao>) => void;
}

export function Step4OfertaPalestras({ dados, onComprar, onPular, onVoltar, onUpdate }: Step4OfertaPalestrasProps) {
    const [cupom, setCupom] = useState(dados.cupomPalestra || '');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');
    const [cupomAplicado, setCupomAplicado] = useState(!!dados.descontoPalestra);

    const valorOriginal = 179.99;
    const descontoEfetivo = Math.max(dados.descontoPalestra || 0, dados.descontoSocial || 0);
    const precoFinal = valorOriginal * (1 - descontoEfetivo / 100);

    const handleValidarCupom = async () => {
        if (!cupom.trim()) return;
        setIsValidating(true);
        setError('');

        try {
            // Validate as Social Coupon
            const { data } = await (supabase
                .from('social_partnership_coupons') as any)
                .select('id,project_id,code,discount_percentage,usage_limit,current_usage,is_active,expires_at,referral_name,referral_type')
                .eq('code', cupom.trim().toUpperCase())
                .eq('is_active', true)
                .maybeSingle();

            if (data) {
                if (data.expires_at && new Date(data.expires_at) < new Date()) {
                    setError('This code has expired');
                    return;
                }
                if (data.usage_limit && data.current_usage >= data.usage_limit) {
                    setError('Usage limit reached');
                    return;
                }
                setCupomAplicado(true);
                onUpdate?.({
                    descontoPalestra: data.discount_percentage,
                    cupomPalestra: cupom.trim().toUpperCase(),
                    tipoSocioPalestra: data.referral_type
                });
                return;
            }

            // Validate as Corporate Batch (Company Voucher)
            const { data: batchData } = await (supabase
                .from('company_registration_batches') as any)
                .select('id,voucher_code,total_slots,used_slots,tipo_ingresso,payment_status')
                .eq('voucher_code', cupom.trim().toUpperCase())
                .maybeSingle();

            if (batchData) {
                const batch = batchData as unknown as RegistrationBatch;
                const isPaid = batch.statusPagamento === 'paid' || (batchData as any).payment_status === 'pago';
                const used = batch.vagasUtilizadas ?? (batchData as any).used_slots ?? 0;
                const total = batch.quantidadeVagas ?? (batchData as any).total_slots ?? 0;

                if (!isPaid) {
                    setError('Payment for this batch is pending. Please contact your company administrator.');
                    return;
                }
                if (used >= total && total > 0) {
                    setError('All spots for this batch have already been used.');
                    return;
                }
                setCupomAplicado(true);
                onUpdate?.({
                    descontoPalestra: 100,
                    cupomPalestra: cupom.trim().toUpperCase(),
                    tipoSocioPalestra: 'Corporate Batch',
                    loteId: batch.id,
                    voucherEmpresa: batch.voucherCode || (batchData as any).voucher_code
                });
                return;
            }

            setError('Invalid or inactive code');
            setCupomAplicado(false);
            onUpdate?.({ descontoPalestra: 0, cupomPalestra: '', loteId: undefined, voucherEmpresa: undefined });
        } catch (err) {
            logger.error('Error validating lecture coupon:', err);
            setError('Failed to validate code');
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with Dynamic Badge */}
            <div className="text-center space-y-3 px-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-orange-coral/10 border border-brand-orange-coral/20 text-brand-orange-coral text-[10px] font-black uppercase tracking-[0.2em] animate-bounce">
                    <Star className="h-3 w-3 fill-current" />
                    UNIQUE OPPORTUNITY
                </div>
                <h3 className="text-3xl sm:text-5xl font-black text-white leading-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent italic">
                    NIGHT <span className="text-brand-orange-coral italic not-italic">PASSPORT</span>
                </h3>
                <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto font-medium leading-relaxed">
                    Experience full immersion with access to 5 exclusive lectures on the Main Stage at the Park Space.
                </p>
            </div>

            {/* Premium Offer Card */}
            <div className="relative mx-auto max-w-2xl group px-4">
                {/* Glow Effects */}
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

                <div className="relative glass-card border-white/5 bg-dark-200/50 backdrop-blur-3xl overflow-hidden rounded-[2rem] p-6 sm:p-10 shadow-2xl">
                    <div className="grid grid-cols-1 gap-8">
                        {/* Benefits */}
                        <div className="space-y-4">
                            {[
                                '5 Exclusive lectures (Management, Leadership, Mkt, Sales and Innovation)',
                                'Keynotes: Jeronimo Freire, Leandro Batista, Carolinne Castro and Vanylton Matias',
                                'Coffee Break & Premium Networking with Exhibitors',
                                'Reserved seat in front of the main stage',
                                'Special participation certificate (4h)',
                                'Exclusive Growth Experience event kit'
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] transition-colors">
                                    <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    </div>
                                    <span className="text-sm sm:text-base text-gray-300 font-semibold leading-snug">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Pricing Block */}
                        <div className="pt-8 border-t border-white/10 text-center space-y-6">
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Exclusive Investment</span>
                                <div className="flex flex-col items-center">
                                    {descontoEfetivo > 0 ? (
                                        <div className="animate-in zoom-in duration-500">
                                            <p className="text-sm text-gray-500 line-through mb-1">from R$ 299.90</p>
                                            <div className="flex items-baseline justify-center gap-1">
                                                <span className="text-xl font-bold text-brand-orange-coral">R$</span>
                                                <span className="text-5xl sm:text-7xl font-black text-white tracking-tighter">
                                                    {precoFinal.toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>
                                            <div className="mt-2 inline-block px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black rounded-lg border border-green-500/30">
                                                {descontoEfetivo}% OFF APPLIED
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <p className="text-sm text-gray-500 line-through mb-1">R$ 299.90</p>
                                            <div className="flex items-baseline justify-center gap-1">
                                                <span className="text-xl font-bold text-brand-orange-coral">R$</span>
                                                <span className="text-5xl sm:text-7xl font-black text-white tracking-tighter">179.99</span>
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-xs text-green-500/80 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        Easy Payment via PIX
                                    </p>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="space-y-6 pt-4">
                                <div className="form-actions flex gap-2">
                                    {onVoltar && (
                                        <button
                                            type="button"
                                            onClick={onVoltar}
                                            className="btn-form-back"
                                        >
                                            Back
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={onComprar}
                                        className="btn-form-primary flex-1 !h-16 sm:!h-20 !text-xl"
                                    >
                                        <span className="relative flex items-center justify-center gap-3">
                                            {descontoEfetivo === 100 ? 'REDEEM MY ACCESS' : 'SECURE MY PASSPORT'}
                                            <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                        </span>
                                    </button>
                                </div>

                                <button
                                    onClick={onPular}
                                    className="text-gray-500 hover:text-white text-sm font-bold transition-all flex items-center justify-center gap-2 mx-auto group/skip underline decoration-white/0 hover:decoration-white/10 underline-offset-4"
                                >
                                    Decide later, just book session
                                    <X className="h-4 w-4 group-hover/skip:rotate-90 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cupom Section */}
            <div className="max-w-md mx-auto w-full px-4">
                <div className="form-card !p-4 !bg-white/5 backdrop-blur-xl">
                    <label className="form-label !mb-2 !text-[10px] !text-white/40">
                        <Key className="h-3 w-3" /> DO YOU HAVE A PARTNERSHIP OR SOCIAL CODE?
                    </label>
                    <div className="form-code-row">
                        <input
                            placeholder="SOCIAL CODE"
                            value={cupom}
                            onChange={(e) => setCupom(e.target.value.toUpperCase())}
                            className={`form-input form-code-input !font-mono !tracking-[0.2em] \${cupomAplicado ? 'text-green-400' : ''}`}
                        />
                        <button
                            type="button"
                            onClick={handleValidarCupom}
                            disabled={isValidating || !cupom.trim()}
                            className={`form-code-validate-btn \${cupomAplicado ? 'validated' : ''}`}
                        >
                            {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                             cupomAplicado ? <CheckCircle className="h-4 w-4" /> : 'APPLY'}
                        </button>
                    </div>
                    {error && <p className="form-error !justify-center !mt-2">{error}</p>}
                </div>
            </div>
        </div>
    );
}
