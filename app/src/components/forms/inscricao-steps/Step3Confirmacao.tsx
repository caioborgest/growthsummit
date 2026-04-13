import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User, Mail, Phone, BookOpen, AlertCircle, Award, Landmark, Contact } from 'lucide-react';
import type { DadosInscricao } from './inscricaoTypes';
import { getAtividadeById, type TipoAtividade } from '@/data/programacao';
import { useProject } from '@/contexts/ProjectContext';
import { useSessions } from '@/hooks/useData';
import { EVENT_CONFIG } from '@/config/eventConfig';

interface Step3ConfirmacaoProps {
    dados: DadosInscricao;
    onConfirmar: (userId: string, registrationId: string, statusPagamento: string) => void;
    onVoltar: () => void;
    onUpdate?: (novos: Partial<DadosInscricao>) => void;
}

export function Step3Confirmacao({ dados, onConfirmar, onVoltar, onUpdate }: Step3ConfirmacaoProps) {
    const { selectedProject } = useProject();
    const { data: sessions } = useSessions();

    // Dynamic price calculation based on Batches and Categories
    const getActivePrice = () => {
        // Fallback to old price if no tiers are configured
        const fallbackPrice = selectedProject?.settings?.ticketPrices?.pro || EVENT_CONFIG.proPrice;
        
        if (!selectedProject?.settings?.ticketTiers || selectedProject.settings.ticketTiers.length === 0) {
            return fallbackPrice;
        }

        // If the user selected a specific batch
        if (dados.batchId) {
            for (const tier of selectedProject.settings.ticketTiers) {
                const batch = tier.batches.find(b => b.id === dados.batchId);
                if (batch) return batch.price;
            }
        }

        // Fallback: Get first active Tier and its active batch
        const defaultTier = selectedProject.settings.ticketTiers.find(t => t.active) || selectedProject.settings.ticketTiers[0];
        const activeBatch = defaultTier?.batches.find(b => b.active) || defaultTier?.batches[0];
        
        return activeBatch?.price ?? fallbackPrice;
    };

    const valorOriginal = getActivePrice();
    const descontoEfetivo = Math.max(dados.lectureDiscount || 0, dados.socialDiscount || 0);
    const valorFinal = dados.valorFinal !== undefined ? dados.valorFinal : (valorOriginal * (1 - descontoEfetivo / 100));
    const valorFormatado = valorFinal.toFixed(2);

    // Get current batch/category name for summary
    const getTicketLabel = () => {
        if (!selectedProject?.settings?.ticketTiers) return 'Passaporte Night Experience';
        
        const tier = selectedProject.settings.ticketTiers.find(t => 
            t.batches.some(b => b.id === dados.batchId || b.active)
        );
        const batch = tier?.batches.find(b => b.id === dados.batchId || b.active);
        
        if (tier && batch) return `${tier.name} - ${batch.name}`;
        return 'Passaporte Growth Experience';
    };

    // Check if batch is sold out
    const isBatchSoldOut = () => {
        if (!selectedProject?.settings?.ticketTiers) return false;
        
        const tier = selectedProject.settings.ticketTiers.find(t => 
            t.batches.some(b => b.id === dados.batchId || b.active)
        );
        const batch = tier?.batches.find(b => b.id === dados.batchId || b.active);
        
        if (batch?.maxCapacity && (batch.soldCount || 0) >= batch.maxCapacity) {
            return true;
        }
        return false;
    };

    const isSoldOut = isBatchSoldOut();

    const cursosSelecionados = (dados.cursosSelecionados || [])
        .map(id => {
            const staticData = getAtividadeById(id);
            if (staticData) return staticData;

            // Search in DB schedule if not found in static
            const dbSession = sessions.find(s => s.id === id);
            if (dbSession) {
                return {
                    id: dbSession.id,
                    titulo: dbSession.title,
                    local: dbSession.room || 'Auditório',
                    horario_inicio: dbSession.startTime,
                    horario_fim: dbSession.endTime,
                    tipo: dbSession.type as TipoAtividade,
                    descricao: dbSession.description || '',
                    gratuito: true,
                    tags: dbSession.topics || [],
                    nivel: 'Iniciante' // Default level for DB sessions
                };
            }
            return null;
        })
        .filter(Boolean);

    const handleConfirmar = () => {
        if (isSoldOut) return;
        onConfirmar('', '', 'pending');
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tighter">
                    Confirme seus <span className="text-brand-orange-coral">Dados</span>
                </h3>
                <p className="text-gray-400 text-lg font-medium">
                    Revise suas informações antes de finalizar
                </p>
            </div>

            <Card className="glass-card p-4 sm:p-6 border-white/10">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-orange-coral/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-brand-orange-coral" />
                        </div>
                        <h4 className="font-bold text-white text-lg">Dados Pessoais</h4>
                    </div>
                    {dados.referralType && dados.referralType !== 'nenhum' && (
                        <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30">
                            {dados.referralType === 'prefeitura' ? 'Parceria Prefeitura' :
                                dados.referralType === 'politico' ? 'Cota Liderança' :
                                    dados.referralType === 'empresa' ? 'Convênio Empresa' :
                                        dados.referralType === 'influenciador' ? 'VIP Influencer' :
                                            dados.referralType === 'associacao' ? 'Parceria Associação' :
                                                dados.referralType === 'instituicao' ? 'Parceria Instituição' :
                                                    dados.referralType === 'promocional' ? 'Promocional' : 'Parceiro'}
                        </Badge>
                    )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <User className="h-4 w-4 text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Nome</p>
                                <p className="text-white font-semibold">{dados.name}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Mail className="h-4 w-4 text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">E-mail</p>
                                <p className="text-white font-semibold">{dados.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Contact className="h-4 w-4 text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">CPF</p>
                                <p className="text-white font-semibold">{dados.cpf}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <Phone className="h-4 w-4 text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Telefone</p>
                                <p className="text-white font-semibold">{dados.phone}</p>
                            </div>
                        </div>

                        {dados.referralName && (
                            <div className="flex items-start gap-3">
                                {dados.referralType === 'prefeitura' ? (
                                    <Landmark className="h-4 w-4 text-gray-400 mt-1" />
                                ) : (
                                    <Award className="h-4 w-4 text-gray-400 mt-1" />
                                )}
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                        {dados.referralType === 'prefeitura' ? 'Prefeitura' : 'Indicação de'}
                                    </p>
                                    <p className="text-brand-orange-coral font-semibold">{dados.referralName}</p>
                                    {(dados.socialDiscount && dados.socialDiscount > 0) || dados.companyVoucher ? (
                                        <div className="mt-1 flex items-center gap-2">
                                            <Badge className="bg-green-500/10 text-green-500 border-none px-2 py-0 text-[10px]">
                                                {dados.companyVoucher 
                                                    ? `Pago pela Empresa (Voucher: ${dados.companyVoucher})` 
                                                    : `${descontoEfetivo}% de desconto aplicado ${dados.code && `(Código: ${dados.code})`}`}
                                            </Badge>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <Card className="glass-card p-4 sm:p-6 border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-orange-coral/20 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-brand-orange-coral" />
                    </div>
                    <h4 className="font-bold text-white text-lg">
                        {selectedProject?.slug === 'growth-experience-triunfo' ? 'Seu Acesso' : 'Atividade Selecionada'}
                    </h4>
                </div>

                <div className="space-y-3">
                    {cursosSelecionados.length > 0 ? (
                        cursosSelecionados.map((curso) => (
                            <div
                                key={curso?.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-dark-200/50 border border-white/5"
                            >
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold leading-tight">
                                        {curso?.titulo}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-sm">
                                        <span className="text-brand-orange-coral font-semibold">
                                            {curso?.horario_inicio} - {curso?.horario_fim}
                                        </span>
                                        <span className="text-gray-500">•</span>
                                        <span className="text-gray-400">{curso?.local}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : selectedProject?.slug === 'growth-experience-triunfo' ? (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-200/50 border border-white/5">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold leading-tight">
                                    GX Growth Experience Triunfo Passaporte
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-sm">
                                    <span className="text-brand-orange-coral font-semibold">17h às 23h</span>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-gray-400">Parque de Exposições</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm italic">Nenhuma atividade selecionada.</p>
                    )}
                </div>
            </Card>

            <Card className="glass-card p-6 border-brand-orange-coral/20 bg-brand-orange-coral/[0.03] shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-green-500" />
                    </div>
                    <h4 className="font-bold text-white text-lg uppercase tracking-tight italic">Resumo do Investimento</h4>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">{getTicketLabel()}</span>
                        <span className="text-white font-mono">R$ {valorOriginal.toFixed(2).replace('.', ',')}</span>
                    </div>

                    {descontoEfetivo > 0 ? (
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-green-500 font-bold">Desconto Aplicado</span>
                                <Badge className="bg-green-500/10 text-green-500 border-none px-1.5 py-0 text-[10px] font-bold">
                                    {dados.code || (dados.registrationType === 'pro' ? 'VIP' : 'Parceiro')}
                                </Badge>
                            </div>
                            <span className="text-green-500 font-mono">- R$ {((valorOriginal * descontoEfetivo) / 100).toFixed(2).replace('.', ',')}</span>
                        </div>
                    ) : null}

                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Saldo a Pagar</p>
                            <p className="text-[10px] text-gray-400">PIX ou Cartão</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-white leading-none">
                                R$ {valorFormatado.replace('.', ',')}
                            </p>
                        </div>
                    </div>
                    
                    {descontoEfetivo === 100 && (
                        <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center animate-pulse">
                            <p className="text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Inscrição Gratuita (Liberação Imediata)
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            <Card className="glass-card p-4 border-blue-500/30 bg-blue-500/10">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm mb-1">O que acontece agora?</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] sm:text-xs text-gray-400">
                            <li className="flex items-center gap-1.5 font-bold"><span className="text-brand-orange-coral">•</span> Conta criada automaticamente</li>
                            <li className="flex items-center gap-1.5 font-bold"><span className="text-brand-orange-coral">•</span> Inscrição validada</li>
                            <li className="flex items-center gap-1.5 font-bold"><span className="text-brand-orange-coral">•</span> Vaga reservada na atividade</li>
                            <li className="flex items-center gap-1.5 font-bold"><span className="text-brand-orange-coral">•</span> Acesso ao App liberado</li>
                        </ul>
                    </div>
                </div>
            </Card>

            <div className="form-actions flex gap-2">
                <button type="button" onClick={onVoltar} className="btn-form-back">
                    Voltar
                </button>
                <button
                    type="button"
                    onClick={handleConfirmar}
                    disabled={isSoldOut}
                    className={`btn-form-primary flex-1 ${isSoldOut ? 'opacity-40 grayscale-[0.8] cursor-not-allowed border-red-500/30' : ''}`}
                >
                    {isSoldOut ? (
                        <div className="flex items-center justify-center gap-2">
                             <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
                             <span className="font-black text-red-500 uppercase tracking-widest text-[10px] sm:text-xs">Lote Esgotado</span>
                        </div>
                    ) : (
                        <><CheckCircle className="h-5 w-5" />Prosseguir</>
                    )}
                </button>
            </div>
        </div>
    );
}
