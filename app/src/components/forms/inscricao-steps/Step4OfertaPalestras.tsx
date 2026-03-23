import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, Star, ArrowRight, X, Loader2, Ticket } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { DadosInscricao } from './inscricaoTypes';

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
    const descontoEfetivo = dados.descontoPalestra !== undefined ? dados.descontoPalestra : (dados.descontoSocial || 0);
    const precoFinal = valorOriginal * (1 - descontoEfetivo / 100);

    const handleValidarCupom = async () => {
        if (!cupom.trim()) return;
        setIsValidating(true);
        setError('');

        try {
            // Tenta validar como Cupom Social
            const { data, error: cError } = await (supabase
                .from('cupons_parceria_social') as any)
                .select('id,project_id,codigo,porcentagem_desconto,uso_limite,uso_atual,ativo,vencimento,indicacao_nome,indicacao_tipo')
                .eq('codigo', cupom.trim().toUpperCase())
                .eq('ativo', true)
                .maybeSingle();

            if (data) {
                if (data.vencimento && new Date(data.vencimento) < new Date()) {
                    setError('Este código já expirou');
                    return;
                }
                if (data.uso_limite && data.uso_atual >= data.uso_limite) {
                    setError('Limite de usos atingido');
                    return;
                }
                setCupomAplicado(true);
                onUpdate?.({
                    descontoPalestra: data.porcentagem_desconto,
                    cupomPalestra: cupom.trim().toUpperCase(),
                    tipoSocioPalestra: data.indicacao_tipo
                });
                return;
            }

            // Tenta validar como Lote Corporativo (Voucher Empresa)
            const { data: batchData, error: bError } = await supabase
                .from('lotes_inscricao_empresa')
                .select('id,voucher_code,quantidade_vagas,vagas_utilizadas,tipo_ingresso')
                .eq('voucher_code', cupom.trim().toUpperCase())
                .maybeSingle();

            if (batchData) {
                if (batchData.status_pagamento !== 'pago') {
                    setError('O pagamento desse lote se encontra pendente. Entre em contato com o responsável da sua empresa.');
                    return;
                }
                if (batchData.vagas_utilizadas >= batchData.quantidade_vagas) {
                    setError('Todas as vagas deste lote já foram utilizadas.');
                    return;
                }
                setCupomAplicado(true);
                onUpdate?.({
                    descontoPalestra: 100, // Corporate passes are fully paid by the batch
                    cupomPalestra: cupom.trim().toUpperCase(),
                    tipoSocioPalestra: 'Lote Empresarial',
                    loteId: batchData.id,
                    voucherEmpresa: batchData.voucher_code
                });
                return;
            }

            // Se nenhum dos dois for encontrado ou válido
            setError('Código inválido ou inativo');
            setCupomAplicado(false);
            onUpdate?.({ descontoPalestra: 0, cupomPalestra: '', loteId: undefined, voucherEmpresa: undefined });
        } catch (err) {
            logger.error('Erro cupom palestra:', err);
            setError('Falha ao validar código');
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header com Badge Dinâmica */}
            <div className="text-center space-y-3 px-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-orange-coral/10 border border-brand-orange-coral/20 text-brand-orange-coral text-[10px] font-black uppercase tracking-[0.2em] animate-bounce">
                    <Star className="h-3 w-3 fill-current" />
                    Oportunidade Única
                </div>
                <h3 className="text-3xl sm:text-5xl font-black text-white leading-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent italic">
                    PASSAPORTE <span className="text-brand-orange-coral italic not-italic">NIGHT</span>
                </h3>
                <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto font-medium leading-relaxed">
                    Transforme sua mentoria em uma imersão completa com acesso ao Palco Principal.
                </p>
            </div>

            {/* Oferta Card Premium */}
            <div className="relative mx-auto max-w-2xl group">
                {/* Glow Effects */}
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

                <Card className="relative glass-card border-white/5 bg-dark-200/50 backdrop-blur-3xl overflow-hidden rounded-[2rem] p-4 sm:p-10 shadow-2xl">
                    <div className="grid grid-cols-1 gap-8">
                        {/* Benefícios com layout melhorado */}
                        <div className="space-y-4">
                            {[
                                'Acesso às 2 palestras magnas do palco principal',
                                'Coffee Break & Networking Premium',
                                'Lugar reservado em frente ao palco',
                                'Certificado de participação especial (4h)',
                                'Kit exclusivo do evento GX 2026'
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-4 p-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] transition-colors">
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
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Investimento Exclusivo</span>
                                <div className="flex flex-col items-center">
                                    {descontoEfetivo > 0 ? (
                                        <div className="animate-in zoom-in duration-500">
                                            <p className="text-sm text-gray-500 line-through mb-1">de R$ 299,90</p>
                                            <div className="flex items-baseline justify-center gap-1">
                                                <span className="text-xl font-bold text-brand-orange-coral">R$</span>
                                                <span className="text-5xl sm:text-7xl font-black text-white tracking-tighter">
                                                    {precoFinal.toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>
                                            <div className="mt-2 inline-block px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black rounded-lg border border-green-500/30">
                                                {descontoEfetivo}% OFF APLICADO
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <p className="text-sm text-gray-500 line-through mb-1">R$ 299,90</p>
                                            <div className="flex items-baseline justify-center gap-1">
                                                <span className="text-xl font-bold text-brand-orange-coral">R$</span>
                                                <span className="text-5xl sm:text-7xl font-black text-white tracking-tighter">179,99</span>
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-xs text-green-500/80 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        Pagamento Facilitado via PIX
                                    </p>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="space-y-6 pt-4">
                                <div className="flex flex-col sm:flex-row gap-4">
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
                                    <Button
                                        size="lg"
                                        onClick={onComprar}
                                        className="flex-1 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black h-16 sm:h-20 text-xl sm:text-2xl rounded-2xl shadow-[0_15px_40px_rgba(255,112,67,0.4)] group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <div className="absolute inset-y-0 left-0 w-12 bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-shimmer" />
                                        <span className="relative flex items-center justify-center gap-3">
                                            {descontoEfetivo === 100 ? 'RESGATAR MEU ACESSO' : 'GARANTIR MEU PASSAPORTE'}
                                            <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                        </span>
                                    </Button>
                                </div>

                                <button
                                    onClick={onPular}
                                    className="text-gray-500 hover:text-white text-sm font-bold transition-all flex items-center justify-center gap-2 mx-auto group/skip underline decoration-white/0 hover:decoration-white/10 underline-offset-4"
                                >
                                    Decidir depois, apenas agendar mentoria
                                    <X className="h-4 w-4 group-hover/skip:rotate-90 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Cupom Section - Refined */}
            <div className="max-w-md mx-auto w-full px-4">
                <div className="p-1 px-1.5 bg-white/5 rounded-2xl border border-white/10 flex gap-2">
                    <div className="flex-1 relative">
                        <Input
                            placeholder="CÓDIGO SOCIAL"
                            value={cupom}
                            onChange={(e) => setCupom(e.target.value.toUpperCase())}
                            className={`bg-transparent border-none text-white font-mono tracking-[0.2em] pl-4 h-12 uppercase focus-visible:ring-0 ${cupomAplicado ? 'text-green-400' : ''}`}
                        />
                        {isValidating && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-orange-coral animate-spin" />}
                    </div>
                    <Button
                        onClick={handleValidarCupom}
                        disabled={isValidating || !cupom.trim()}
                        className={`h-12 px-6 font-black rounded-xl transition-all ${cupomAplicado ? 'bg-green-500 text-white shadow-glow-green' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {cupomAplicado ? 'APLICADO' : 'APLICAR'}
                    </Button>
                </div>
                {error && <p className="text-red-400 text-[10px] mt-2 text-center font-bold px-4">{error}</p>}
            </div>
        </div>
    );
}
