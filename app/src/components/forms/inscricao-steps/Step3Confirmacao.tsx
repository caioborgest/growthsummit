import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User, Mail, Phone, BookOpen, Loader2, AlertCircle, Award, Landmark } from 'lucide-react';
import type { DadosInscricao } from './inscricaoTypes';
import { getAtividadeById } from '@/data/programacao';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';
import { useSessions } from '@/hooks/useData';
import { autoInviteOnRegistration } from '@/hooks/useWhatsAppGroups';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface Step3ConfirmacaoProps {
    dados: DadosInscricao;
    onConfirmar: (userId: string, inscricaoId: string, statusPagamento: string) => void;
    onVoltar: () => void;
}

export function Step3Confirmacao({ dados, onConfirmar, onVoltar }: Step3ConfirmacaoProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { projectId, selectedProject } = useProject();
    const { data: sessions, isLoading: sessionsLoading } = useSessions();

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
        setLoading(true);
        setError('');

        try {
            // 0. Verificar se já existe uma sessão ativa
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            let userId = existingSession?.user?.id;

            // Se estiver logado com um email DIFERENTE do que está tentando registrar, ignorar sessão
            if (existingSession && existingSession.user.email !== dados.email) {
                userId = undefined;
            }


            // 1. Tentar criar usuário apenas se não estiver logado com o email correto
            if (!userId) {
                const { data: authData, error: sError } = await supabase.auth.signUp({
                    email: dados.email,
                    password: dados.senha,
                    options: {
                        data: {
                            name: dados.nome,
                            phone: dados.telefone,
                            role: 'participante'
                        }
                    }
                });

                if (sError) {
                    // Se já existe, tentamos login automático para validar a senha
                    if (sError.message.toLowerCase().includes('already registered')) {
                        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                            email: dados.email,
                            password: dados.senha
                        });

                        if (!signInError) {
                            userId = signInData.user.id;
                        } else {
                            logger.error('Falha na validação de usuário existente:', signInError);
                            throw new Error('Este email já está cadastrado, mas a senha informada está incorreta. Se você já possui uma conta, use a senha anterior ou recupere-a.');
                        }
                    } else {
                        throw sError;
                    }
                } else if (authData.user) {
                    userId = authData.user.id;

                    // Se não houver sessão imediata (email confirmation enabled), o login manual será necessário depois
                    if (!authData.session) {
                        // User needs to confirm email, but we'll show this at the end
                    }
                } else {
                    throw new Error('Não foi possível processar o cadastro do usuário.');
                }
            }

            // 1.5. Garantir que o registro exista na tabela public.users (para sincronização)
            if (userId) {
                try {
                    const { error: userTableError } = await (supabase
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .from('users') as any)
                        .upsert({
                            id: userId,
                            email: dados.email,
                            name: dados.nome,
                            phone: dados.telefone,
                            role: 'participant',
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'id' });

                    if (userTableError) {
                        logger.warn('Erro ao sincronizar tabela public.users:', userTableError.message);
                    }
                } catch (userTableCatch) {
                    logger.warn('Erro ao tentar upsert em users:', userTableCatch);
                }
            }

            // 2. Salvar inscrição no banco (user_id opcional se já existir conta)
            const valorOriginal = 179.99;
            const descontoEfetivo = dados.descontoPalestra !== undefined ? dados.descontoPalestra : (dados.descontoSocial || 0);
            const valorComDesconto = valorOriginal * (1 - descontoEfetivo / 100);

            const { data: inscricaoData, error: inscricaoError } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('inscricoes_growth_experience') as any)
                .insert({
                    project_id: projectId,
                    user_id: userId || null,
                    nome: dados.nome,
                    email: dados.email,
                    telefone: dados.telefone,
                    cursos_selecionados: dados.cursosSelecionados,
                    tipo_atividade_selecionada: tipoAtividade,
                    sala_atividade: salaAtividade,
                    horario_atividade: horarioAtividade,
                    nivel_atividade: nivelAtividade,
                    palestras_noturnas: dados.comprarPalestras,
                    tipo_inscricao: 'standard', // Adicionado para compatibilidade com Admin
                    evento: selectedProject?.name || 'Growth Experience',
                    valor_pago: dados.comprarPalestras ? valorComDesconto : 0,
                    status_pagamento: (dados.comprarPalestras && valorComDesconto > 0) ? 'pendente' : 'pago',
                    status: 'ativo',
                    app_instalado: false,
                    indicacao_tipo: dados.indicacaoTipo || 'nenhum',
                    indicacao_nome: dados.indicacaoNome || null,
                    codigo_social: dados.codigo || null,
                    codigo_palestra: dados.cupomPalestra || null,
                    cupom_palestra: dados.cupomPalestra || null
                })
                .select();

            if (inscricaoError) {
                logger.error('Erro no Supabase Insert:', inscricaoError);
                throw new Error(inscricaoError.message);
            }

            // 2.5 Incrementar contador de inscritos nas sessões (Real-time)
            if (dados.cursosSelecionados && dados.cursosSelecionados.length > 0) {
                for (const sessionId of dados.cursosSelecionados) {
                    const { error: rpcError } = await supabase.rpc('increment_session_count', { session_id: sessionId });
                    if (rpcError) logger.warn('Erro ao incrementar contador:', rpcError);
                }
            }

            const finalInscricaoId = inscricaoData && inscricaoData.length > 0 ? inscricaoData[0].id : null;

            // 3. Auto-convite para grupos WhatsApp (NÃO BLOQUEANTE)
            if (finalInscricaoId) {
                const projectSlug = selectedProject?.slug || 'growth-experience-triunfo';
                autoInviteOnRegistration(
                    finalInscricaoId,
                    projectSlug,
                    'standard'
                ).catch(e => logger.warn('Invite fail:', e));

                // 3.5 Send Confirmation Email (Async, non-blocking)
                supabase.functions.invoke('send-email', {
                    body: {
                        to: dados.email,
                        subject: `Sua inscrição no ${selectedProject?.name || 'Growth Experience'} está confirmada!`,
                        html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 40px; border-radius: 20px;">
                            <h2 style="color: #fe4c38;">Olá, ${dados.nome}!</h2>
                            <p>Sua inscrição no <strong>${selectedProject?.name || 'Growth Experience'}</strong> foi confirmada com sucesso!</p>
                            <p>Sua atividade "<strong>${cursosSelecionados[0]?.titulo || 'Palestras'}</strong>" já está reservada para você.</p>
                            
                            <div style="background: rgba(254, 76, 56, 0.1); border: 1px solid rgba(254, 76, 56, 0.2); padding: 20px; border-radius: 12px; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #fe4c38;">Detalhes da Reserva:</h3>
                                <ul style="list-style: none; padding: 0;">
                                    <li>🕒 <strong>Horário:</strong> ${cursosSelecionados[0]?.horario_inicio || ''}</li>
                                    <li>📍 <strong>Local:</strong> ${cursosSelecionados[0]?.local || ''}</li>
                                    <li>🎫 <strong>Status:</strong> Confirmado</li>
                                </ul>
                            </div>
                            
                            <p>Para acessar sua credencial, ver a programação completa e fazer networking com outros participantes, baixe agora o app do evento:</p>
                            <div style="margin: 20px 0;">
                                <a href="#" style="display: inline-block; background: #fe4c38; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px;">Baixar para iOS</a>
                                <a href="#" style="display: inline-block; background: #fe4c38; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Baixar para Android</a>
                            </div>
                            
                            <p style="margin-top: 30px; font-size: 14px; opacity: 0.7;">Nos vemos no evento!<br/>Equipe Growth Summit</p>
                        </div>
                        `
                    }
                }).catch(e => logger.error('Email confirmation error:', e));
            }

            // 4. Sucesso - Avisar o componente pai
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const finalStatusPagamento = (inscricaoData as any)?.[0]?.status_pagamento || 'pago';
            onConfirmar(userId || '', finalInscricaoId || '', finalStatusPagamento);
            setLoading(false); // Reset loading on success too

        } catch (err: unknown) {
            const error = err as Error;
            logger.error('Erro crítico na inscrição:', error);
            setError(error.message || 'Erro ao processar inscrição. Tente novamente.');
            setLoading(false); // Only reset on error
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
                            <li className="flex items-center gap-1.5"><span className="text-brand-orange-coral">•</span> Email de confirmação enviado</li>
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
