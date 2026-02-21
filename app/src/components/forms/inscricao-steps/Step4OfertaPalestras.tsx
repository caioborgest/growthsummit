import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, Star, ArrowRight, X, Loader2, Ticket, Key, AlertCircle } from 'lucide-react';
import { palestrasNoturnas } from '@/data/programacao';
import { supabase } from '@/lib/supabase';
import type { DadosInscricao } from './inscricaoTypes';

interface Step4OfertaPalestrasProps {
    dados: DadosInscricao;
    onComprar: () => void;
    onPular: () => void;
    onUpdate?: (novos: Partial<DadosInscricao>) => void;
}

export function Step4OfertaPalestras({ dados, onComprar, onPular, onUpdate }: Step4OfertaPalestrasProps) {
    const [cupom, setCupom] = useState(dados.cupomPalestra || '');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');
    const [cupomAplicado, setCupomAplicado] = useState(!!dados.descontoPalestra);

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
            console.error('Erro cupom palestra:', err);
            setError('Falha ao validar código');
        } finally {
            setIsValidating(false);
        }
    };

    const precoFinal = valorOriginal * (1 - descontoEfetivo / 100);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-left sm:text-center">
                <Badge className="mb-3 sm:mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/40 px-3 py-1 sm:px-4 sm:py-1 text-xs sm:text-sm animate-pulse">
                    <Star className="h-3 w-3 mr-2 fill-current" />
                    OFERTA EXCLUSIVA
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                    Sessão Noturna Premium
                </h3>
                <p className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
                    Participe das palestras magnas e do networking exclusivo com grandes líderes do mercado.
                </p>
            </div>

            {/* Grid de Palestras */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {palestrasNoturnas.map((palestra) => (
                    <Card key={palestra.id} className="relative overflow-hidden group border-white/10 hover:border-brand-orange-coral/30 transition-all bg-dark-200/50">
                        <div className="absolute top-0 right-0 p-3 z-10">
                            <Badge variant="secondary" className="bg-dark/80 backdrop-blur-sm text-white border-white/20 text-[10px] sm:text-xs">
                                19:00 - 22:30
                            </Badge>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="mb-3 sm:mb-4">
                                <h4 className="text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-brand-orange-coral transition-colors leading-tight">
                                    {palestra.titulo}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-400">
                                    com <span className="text-white font-semibold">{palestra.palestrante}</span>
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                                {palestra.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-[10px] sm:text-xs border-white/10 text-gray-500">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            <p className="text-xs sm:text-sm text-gray-400 line-clamp-3 leading-relaxed">
                                {palestra.descricao}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Seção de Cupons */}
            <Card className="glass-card border-white/10 p-4 sm:p-6 bg-dark-300/30">
                <div className="flex flex-col sm:flex-row items-end gap-3 sm:gap-4">
                    <div className="flex-1 w-full translate-y-[-1px]">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1 flex items-center gap-2">
                            <Ticket className="h-3 w-3 text-brand-orange-coral" />
                            Possui Código de Parceiro ou Equipe?
                        </label>
                        <div className="relative">
                            <Input
                                placeholder="DIGITE O CÓDIGO AQUI"
                                value={cupom}
                                onChange={(e) => setCupom(e.target.value.toUpperCase())}
                                className={`bg-dark-200 border-white/10 text-white font-mono tracking-widest pl-10 h-12 uppercase ${cupomAplicado ? 'border-green-500/50 ring-1 ring-green-500/20' : ''}`}
                            />
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            {isValidating && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-orange-coral animate-spin" />
                            )}
                            {cupomAplicado && !isValidating && (
                                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                            )}
                        </div>
                    </div>
                    <Button
                        type="button"
                        onClick={handleValidarCupom}
                        disabled={isValidating || !cupom.trim()}
                        className={`h-12 px-6 font-bold sm:min-w-[120px] transition-all ${cupomAplicado ? 'bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                    >
                        {cupomAplicado ? 'Aplicado' : 'Validar'}
                    </Button>
                </div>
                {error && (
                    <p className="text-red-400 text-[10px] sm:text-xs mt-2 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                    </p>
                )}
                {cupomAplicado && (
                    <p className="text-green-400 text-[10px] sm:text-xs mt-2 font-bold animate-in fade-in slide-in-from-top-1">
                        Voucher ativado! Desconto de {descontoEfetivo}% aplicado com sucesso.
                    </p>
                )}
            </Card>

            {/* Card da Oferta */}
            <Card className="relative overflow-hidden border-brand-orange-coral/30 bg-gradient-to-br from-brand-orange-coral/10 via-dark-200 to-dark p-4 sm:p-8 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-orange-coral/20 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-brand-orange-gradient/20 rounded-full blur-2xl" />

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                    <div className="flex-1 space-y-3 sm:space-y-4 w-full">
                        <div>
                            <h4 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 leading-tight">Passaporte Night Experience</h4>
                            <p className="text-xs sm:text-sm text-gray-400">Acesso completo à programação noturna + Benefícios exclusivos</p>
                        </div>

                        <ul className="space-y-1.5 sm:space-y-2">
                            {[
                                'Acesso às 2 palestras magnas',
                                'Coffee Break & Networking Premium',
                                'Lugar reservado',
                                'Certificado de participação especial (4h)',
                                'Kit exclusivo do evento'
                            ].map((item, index) => (
                                <li key={index} className="flex items-center gap-2 text-[11px] sm:text-sm text-gray-300 leading-tight">
                                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3 sm:gap-4 w-full md:min-w-[200px]">
                        <div className="text-center md:text-right">
                            {descontoEfetivo > 0 ? (
                                <>
                                    <Badge className="mb-2 bg-green-500/20 text-green-500 border-green-500/30 text-[10px] sm:text-xs">
                                        -{descontoEfetivo}% DESCONTO ATIVADO
                                    </Badge>
                                    <p className="text-[10px] sm:text-sm text-gray-500 line-through">de R$ 179,99</p>
                                    <div className="flex items-baseline gap-1 justify-center md:justify-end">
                                        <span className="text-xs sm:text-sm text-brand-orange-coral font-bold">R$</span>
                                        <span className="text-3xl sm:text-4xl font-black text-white">
                                            {precoFinal.toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-[10px] sm:text-sm text-gray-500 line-through">de R$ 299,90</p>
                                    <div className="flex items-baseline gap-1 justify-center md:justify-end">
                                        <span className="text-xs sm:text-sm text-brand-orange-coral font-bold">R$</span>
                                        <span className="text-3xl sm:text-4xl font-black text-white">179,99</span>
                                    </div>
                                </>
                            )}
                            <p className="text-[10px] sm:text-xs text-green-500 font-semibold">em até 12x no cartão</p>
                        </div>

                        <Button
                            size="lg"
                            onClick={onComprar}
                            className="w-full bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-dark-100 font-extrabold shadow-glow-teal/20 h-12 sm:h-14 py-0"
                        >
                            {descontoEfetivo === 100 ? 'GARANTIR VAGA GRATUITA' : 'COMPRAR PASSAPORTE NIGHT'}
                            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                        </Button>

                        <button
                            onClick={onPular}
                            className="text-[10px] sm:text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1 py-1"
                        >
                            Não tenho interesse no momento
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
