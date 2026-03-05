import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User, Mail, Phone, BookOpen, Loader2, AlertCircle, Award, Landmark } from 'lucide-react';
import type { DadosInscricao } from './inscricaoTypes';
import { getAtividadeById } from '@/data/programacao';
import { useProject } from '@/contexts/ProjectContext';
import { useSessions } from '@/hooks/useData';
import { autoInviteOnRegistration } from '@/hooks/useWhatsAppGroups';
import { registrationService } from '@/services/registrationService';
import { logger } from '@/lib/logger';
import { getOrCreateUser } from '@/lib/auth-helpers';

interface Step3ConfirmacaoProps {
    dados: DadosInscricao;
    onConfirmar: (userId: string, inscricaoId: string, statusPagamento: string) => void;
    onVoltar: () => void;
}

export function Step3Confirmacao({ dados, onConfirmar, onVoltar }: Step3ConfirmacaoProps) {
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const { projectId, selectedProject } = useProject();
    const { data: sessions } = useSessions();

    const cursosSelecionados = dados.cursosSelecionados
        .map(id => {
            const staticData = getAtividadeById(id);
            if (staticData) return staticData;

            // Busca na programação do banco se não achar no estático
            const dbSession = sessions.find(s => s.id === id);
            if (dbSession) {
                return {
                    id: dbSession.id,
                    titulo: dbSession.title,
                    local: dbSession.room || 'Auditório',
                    horario_inicio: dbSession.startTime,
                    horario_fim: dbSession.endTime,
                    tipo: dbSession.type as any,
                    descricao: dbSession.description || '',
                    gratuito: true,
                    tags: dbSession.topics || []
                };
            }
            return null;
        })
        .filter(Boolean);

    // Obter informações detalhadas da primeira atividade selecionada
    const primeiraAtividade = cursosSelecionados[0];
    const tipoAtividade = primeiraAtividade?.tipo || (sessions.find(s => s.id === dados.cursosSelecionados[0])?.type) || null;
    const salaAtividade = primeiraAtividade?.local || '';
    const horarioAtividade = primeiraAtividade?.horario_inicio || '';
    const nivelAtividade = (primeiraAtividade as any)?.nivel || '';

    const handleConfirmar = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setLoading(true);
        setError('');

        // Limpeza de email
        const cleanEmail = dados.email.trim().toLowerCase();

        try {
            // ── ETAPA 1: Autenticar / criar usuário (lógica centralizada)
            const { userId } = await getOrCreateUser({
                email: cleanEmail,
                password: dados.senha,
                name: dados.nome,
                phone: dados.telefone,
                role: 'participant',
            });

            if (!userId) throw new Error('Usuário não identificado para a inscrição.');

            // ── ETAPA 2: Calcular valor
            const valorOriginal = 179.99;
            const descontoEfetivo = dados.descontoPalestra !== undefined
                ? dados.descontoPalestra
                : (dados.descontoSocial || 0);
            const valorPago = dados.comprarPalestras
                ? valorOriginal * (1 - descontoEfetivo / 100)
                : 0;
            const statusPagamento = (dados.comprarPalestras && valorPago > 0) ? 'pendente' : 'pago';

            // ── ETAPA 3: Inscrição atômica via Service Layer (verifica vagas + insere + incrementa)
            const sessionIds = dados.cursosSelecionados
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((id: any) => id && id.length === 36); // apenas UUIDs válidos

            const rpcResult = await registrationService.registerWithSlots({
                projectId: projectId || '',
                userId: userId || '',
                nome: dados.nome,
                email: cleanEmail,
                telefone: dados.telefone,
                sessionIds: sessionIds.length > 0 ? sessionIds : [],
                tipoInscricao: 'standard',
                valorPago,
                statusPagamento,
                status: 'ativo',
                evento: selectedProject?.name || 'Growth Experience',
                palestrasNoturnas: dados.comprarPalestras ?? false,
                tipoAtividade: tipoAtividade || null,
                salaAtividade: salaAtividade || null,
                horarioAtividade: horarioAtividade || null,
                nivelAtividade: nivelAtividade || null,
                indicacaoTipo: dados.indicacaoTipo || 'nenhum',
                indicacaoNome: dados.indicacaoNome || null,
                codigoSocial: dados.codigo || null,
                codigoPalestra: dados.cupomPalestra || null,
            });

            // Verificar retorno da RPC
            if (!rpcResult?.success) {
                if (rpcResult?.error === 'SESSION_FULL') {
                    throw new Error(`Vagas esgotadas para: ${rpcResult.full_sessions?.join(', ') || 'atividade selecionada'}. Escolha outra atividade.`);
                } else if (rpcResult?.error === 'ALREADY_REGISTERED') {
                    throw new Error('Este email já está inscrito neste evento.');
                } else {
                    throw new Error(rpcResult?.message || 'Erro ao processar inscrição.');
                }
            }

            const finalInscricaoId = rpcResult.inscricao_id || null;

            // ── ETAPA 4: Auto-convite WhatsApp (não bloqueante, apenas em produção)
            if (finalInscricaoId && import.meta.env.PROD) {
                const projectSlug = selectedProject?.slug || 'growth-experience-triunfo';
                autoInviteOnRegistration(
                    finalInscricaoId,
                    projectSlug,
                    'standard'
                ).catch(e => {
                    logger.info('WhatsApp auto-invite skipped or failed:', e.message || e);
                });
            }

            // ── ETAPA 5: Sucesso
            onConfirmar(userId, finalInscricaoId || '', statusPagamento);

        } catch (err: unknown) {
            const error = err as Error;
            logger.error('Erro crítico na inscrição:', error);
            setError(error.message || 'Erro ao processar inscrição. Tente novamente.');
        } finally {
            setLoading(false);
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-3">
                    Confirme seus Dados
                </h3>
                <p className="text-gray-400 text-lg">
                    Revise as informações antes de finalizar
                </p>
            </div>

            {/* Dados Pessoais */}
            <Card className="glass-card p-4 sm:p-6 border-white/10">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-orange-coral/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-brand-orange-coral" />
                        </div>
                        <h4 className="font-bold text-white text-lg">Dados Pessoais</h4>
                    </div>
                    {dados.indicacaoTipo && dados.indicacaoTipo !== 'nenhum' && (
                        <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30">
                            {dados.indicacaoTipo === 'prefeitura' ? 'Parceria Prefeitura' :
                                dados.indicacaoTipo === 'politico' ? 'Cota Liderança' :
                                    dados.indicacaoTipo === 'empresa' ? 'Convênio Empresa' :
                                        dados.indicacaoTipo === 'influenciador' ? 'Influenciador VIP' :
                                            dados.indicacaoTipo === 'associacao' ? 'Parceria Associação' :
                                                dados.indicacaoTipo === 'instituicao' ? 'Parceria Instituição' :
                                                    dados.indicacaoTipo === 'promocional' ? 'Promoção' : 'Parceria'}
                        </Badge>
                    )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <User className="h-4 w-4 text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs text-gray-500">Nome</p>
                                <p className="text-white font-semibold">{dados.nome}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Mail className="h-4 w-4 text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-white font-semibold">{dados.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <Phone className="h-4 w-4 text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs text-gray-500">Telefone</p>
                                <p className="text-white font-semibold">{dados.telefone}</p>
                            </div>
                        </div>

                        {dados.indicacaoNome && (
                            <div className="flex items-start gap-3">
                                {dados.indicacaoTipo === 'prefeitura' ? (
                                    <Landmark className="h-4 w-4 text-gray-400 mt-1" />
                                ) : (
                                    <Award className="h-4 w-4 text-gray-400 mt-1" />
                                )}
                                <div>
                                    <p className="text-xs text-gray-500">
                                        {dados.indicacaoTipo === 'prefeitura' ? 'Prefeitura' : 'Indicação de'}
                                    </p>
                                    <p className="text-brand-orange-coral font-semibold">{dados.indicacaoNome}</p>
                                    {dados.descontoSocial && dados.descontoSocial > 0 && (
                                        <div className="mt-1 flex items-center gap-2">
                                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-[10px] px-1.5 py-0">
                                                -{dados.descontoSocial}% OFF
                                            </Badge>
                                            <span className="text-[10px] text-gray-400">Desconto aplicado</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Cursos Selecionados */}
            <Card className="glass-card p-4 sm:p-6 border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-orange-coral/20 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-brand-orange-coral" />
                    </div>
                    <h4 className="font-bold text-white text-lg">
                        Atividade Selecionada
                    </h4>
                </div>

                <div className="space-y-3">
                    {cursosSelecionados.map((curso) => (
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
                    ))}
                </div>
            </Card>

            {/* Informação Importante mais compacta no mobile */}
            <Card className="glass-card p-4 border-blue-500/30 bg-blue-500/10">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm mb-1">O que acontece agora?</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] sm:text-xs text-gray-400">
                            <li className="flex items-center gap-1.5"><span className="text-brand-orange-coral">•</span> Conta criada automaticamente</li>
                            <li className="flex items-center gap-1.5"><span className="text-brand-orange-coral">•</span> Inscrição validada</li>
                            <li className="flex items-center gap-1.5"><span className="text-brand-orange-coral">•</span> Atividade reservada</li>
                            <li className="flex items-center gap-1.5"><span className="text-brand-orange-coral">•</span> Acesso ao app liberado</li>
                        </ul>
                    </div>
                </div>
            </Card>

            {/* Erro */}
            {error && (
                <Card className="glass-card p-4 border-red-500/30 bg-red-500/10">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                </Card>
            )}

            {/* Botões */}
            <div className="flex gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onVoltar}
                    disabled={loading}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                    Voltar
                </Button>
                <Button
                    size="lg"
                    onClick={handleConfirmar}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:from-brand-orange-intense hover:to-brand-orange-coral text-white font-bold shadow-lg disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Processando...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Confirmar Inscrição
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
