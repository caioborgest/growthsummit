import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, Star, ArrowRight, X, Loader2, Ticket, Key, AlertCircle } from 'lucide-react';
import { useSessions } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { DadosInscricao } from './inscricaoTypes';

interface Step4OfertaPalestrasProps {
    dados: DadosInscricao;
    onComprar: () => void;
    onPular: () => void;
    onUpdate?: (novos: Partial<DadosInscricao>) => void;
}

export function Step4OfertaPalestras({ dados, onComprar, onPular, onUpdate }: Step4OfertaPalestrasProps) {
    const { data: sessions, isLoading } = useSessions();
    const [cupom, setCupom] = useState(dados.cupomPalestra || '');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');
    const [cupomAplicado, setCupomAplicado] = useState(!!dados.descontoPalestra);

    // Filtrar palestras noturnas da base (categoria 'noturna' ou tipo 'palestra'/'keynote')
    const palestrasNoturnas = sessions.filter(s =>
        s.category === 'noturna' || s.type === 'keynote' || s.type === 'talk'
    );

    const valorOriginal = 179.99;

    // Se o usuário já tiver um desconto social da etapa anterior, ele já começa com desconto
    // Mas ele pode aplicar um cupom diferente aqui se quiser
    const descontoEfetivo = dados.descontoPalestra !== undefined ? dados.descontoPalestra : (dados.descontoSocial || 0);

    const handleValidarCupom = async () => {
        if (!cupom.trim()) return;
        setIsValidating(true);
        setError('');

        try {
            const { data, error: cError } = await (supabase
                .from('cupons_parceria_social') as any)
                .select('*')
                .eq('codigo', cupom.trim().toUpperCase())
                .eq('ativo', true)
                .single();

            if (cError || !data) {
                setError('Código inválido ou inativo');
                setCupomAplicado(false);
                onUpdate?.({ descontoPalestra: 0, cupomPalestra: '' });
            } else {
                // Verificar Validade
                if (data.vencimento && new Date(data.vencimento) < new Date()) {
                    setError('Este código já expirou');
                    return;
                }

                // Verificar Limite
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
            }
        } catch (err) {
            logger.error('Erro cupom palestra:', err);
            setError('Falha ao validar código');
        } finally {
            setIsValidating(false);
        }
    };

    const precoFinal = valorOriginal * (1 - descontoEfetivo / 100);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-left sm:text-center px-2">
                <Badge className="mb-3 sm:mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/40 px-3 py-1 sm:px-4 sm:py-1 text-xs sm:text-sm animate-pulse">
                    <Star className="h-3 w-3 mr-2 fill-current" />
                    OFERTA EXCLUSIVA
                </Badge>
                <h3 className="text-2xl sm:text-4xl font-black text-white mb-2 sm:mb-3 leading-tight tracking-tighter">
                    Passaporte <span className="text-brand-orange-coral text-glow-orange/30">Night Experience</span>
                </h3>
                <p className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
                    Acesso completo à programação noturna + Benefícios exclusivos
                </p>
            </div>

            {/* Card da Oferta Principal - Agora o único foco */}
            <Card className="relative overflow-hidden border-white/5 bg-gradient-to-br from-dark-200 via-dark-100 to-dark p-6 sm:p-10 shadow-2xl rounded-3xl">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-brand-orange-coral/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative space-y-8">
                    {/* Lista de Benefícios */}
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 max-w-xl mx-auto">
                        {[
                            'Acesso às 2 palestras magnas do palco principal',
                            'Coffee Break & Networking Premium',
                            'Lugar reservado em frente ao palco',
                            'Certificado de participação especial (4h)',
                            'Kit exclusivo do evento GX 2026'
                        ].map((item, index) => (
                            <li key={index} className="flex items-center gap-3 text-sm sm:text-base text-gray-300 font-medium list-none">
                                <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </div>

                    <div className="border-t border-white/5 pt-8">
                        <div className="flex flex-col items-center gap-6">
                            {/* Preço */}
                            <div className="text-center">
                                {descontoEfetivo > 0 ? (
                                    <>
                                        <Badge className="mb-3 bg-green-500/20 text-green-500 border-green-500/30 text-[10px] sm:text-xs">
                                            -{descontoEfetivo}% DESCONTO ATIVADO
                                        </Badge>
                                        <p className="text-xs sm:text-sm text-gray-500 line-through">de R$ 179,99</p>
                                        <div className="flex items-baseline gap-1 justify-center">
                                            <span className="text-sm sm:text-base text-brand-orange-coral font-bold">R$</span>
                                            <span className="text-4xl sm:text-6xl font-black text-white tracking-tighter">
                                                {precoFinal.toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs sm:text-sm text-gray-400 line-through decoration-red-500/50">de R$ 299,90</p>
                                        <div className="flex items-baseline gap-1 justify-center">
                                            <span className="text-sm sm:text-base text-brand-orange-coral font-bold">R$</span>
                                            <span className="text-4xl sm:text-6xl font-black text-white tracking-tighter">179,99</span>
                                        </div>
                                    </>
                                )}
                                <p className="text-xs sm:text-sm text-green-500 font-bold mt-1">em até 12x no cartão</p>
                            </div>

                            {/* Ações */}
                            <div className="w-full max-w-md space-y-4">
                                <Button
                                    size="lg"
                                    onClick={onComprar}
                                    className="w-full bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black shadow-[0_10px_30px_rgba(255,112,67,0.3)] h-14 sm:h-16 text-lg sm:text-xl rounded-2xl group uppercase"
                                >
                                    {descontoEfetivo === 100 ? 'GARANTIR MINHA VAGA GRATUITA' : 'COMPRAR PASSAPORTE NIGHT'}
                                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>

                                <button
                                    onClick={onPular}
                                    className="w-full text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2 font-bold py-2"
                                >
                                    Não tenho interesse no momento
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Cupom (Mais discreto ao final) */}
            <div className="max-w-md mx-auto w-full">
                <div className="flex items-center gap-2 mb-3 px-2">
                    <Ticket className="h-4 w-4 text-brand-orange-coral" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Possui um Código Promocional?</span>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            placeholder="CÓDIGO AQUI"
                            value={cupom}
                            onChange={(e) => setCupom(e.target.value.toUpperCase())}
                            className={`bg-dark-300/40 border-white/5 text-white font-mono tracking-widest pl-4 h-11 uppercase rounded-xl transition-all ${cupomAplicado ? 'border-green-500/40 ring-1 ring-green-500/20' : 'focus:border-brand-orange-coral/40'}`}
                        />
                        {isValidating && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-orange-coral animate-spin" />
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleValidarCupom}
                        disabled={isValidating || !cupom.trim()}
                        className={`h-11 px-6 font-bold rounded-xl transition-all ${cupomAplicado ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                    >
                        {cupomAplicado ? 'OK' : 'Aplicar'}
                    </Button>
                </div>
                {error && <p className="text-red-400 text-[10px] mt-2 ml-2 italic">{error}</p>}
                {cupomAplicado && <p className="text-green-400 text-[10px] mt-2 ml-2 font-bold">Desconto de {descontoEfetivo}% aplicado!</p>}
            </div>
        </div>
    );
}
