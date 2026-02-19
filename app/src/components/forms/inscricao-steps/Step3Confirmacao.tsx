import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User, Mail, Phone, BookOpen, Loader2, AlertCircle, Award, Landmark } from 'lucide-react';
import type { DadosInscricao } from './inscricaoTypes';
import { getAtividadeById } from '@/data/programacao';
import { supabase } from '@/lib/supabase';
import { autoInviteOnRegistration } from '@/hooks/useWhatsAppGroups';

interface Step3ConfirmacaoProps {
    dados: DadosInscricao;
    onConfirmar: (userId: string, inscricaoId: string) => void;
    onVoltar: () => void;
}

export function Step3Confirmacao({ dados, onConfirmar, onVoltar }: Step3ConfirmacaoProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const cursosSelecionados = dados.cursosSelecionados
        .map(id => getAtividadeById(id))
        .filter(Boolean);

    const handleConfirmar = async () => {
        setLoading(true);
        setError('');

        try {
            // 0. Verificar se já existe uma sessão ativa
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            let userId = existingSession?.user?.id;
            let authError = null;

            if (!userId) {
                // 1. Criar usuário no Supabase Auth se não houver sessão
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
                userId = authData?.user?.id;
                authError = sError;
            }

            if (authError) {
                // Se já existe, prosseguimos
                if (!authError.message.includes('already registered')) {
                    throw authError;
                }
            }

            // Precisamos do ID do usuário.
            if (!userId && !authError?.message.includes('already registered')) {
                throw new Error('Erro ao identificar usuário para inscrição');
            }

            // 2. Salvar inscrição no banco
            const { data: inscricaoData, error: inscricaoError } = await supabase
                .from('inscricoes_growth_experience')
                .insert({
                    user_id: userId,
                    nome: dados.nome,
                    email: dados.email,
                    telefone: dados.telefone,
                    cursos_selecionados: dados.cursosSelecionados,
                    palestras_noturnas: false,
                    valor_pago: 0,
                    status_pagamento: 'pago',
                    status: 'ativo',
                    app_instalado: false,
                    indicacao_tipo: dados.indicacaoTipo,
                    indicacao_nome: dados.indicacaoNome,
                    codigo_social: dados.codigo
                })
                .select();

            if (inscricaoError) {
                throw new Error(inscricaoError.message);
            }

            const finalInscricaoId = inscricaoData && inscricaoData.length > 0 ? inscricaoData[0].id : null;

            // 3. Auto-convite para grupos WhatsApp (após inscrição confirmada)
            try {
                await autoInviteOnRegistration(
                    finalInscricaoId || '',
                    'growth-experience-triunfo', // project_id
                    'standard' // user_type - pode ser dinâmico baseado no tipo de inscrição
                );
            } catch (inviteError) {
                // Não bloquear o fluxo se o convite falhar
                console.log('Auto-convite não enviado (não crítico):', inviteError);
            }

            // 4. Sucesso - continuar para próxima etapa
            onConfirmar(userId || '', finalInscricaoId || '');

        } catch (err: unknown) {
            console.error('Erro ao confirmar inscrição:', err);
            let errorMessage = 'Ops! Houve um erro ao processar sua inscrição.';

            if (err instanceof Error) {
                if (err.message.includes('rate limit exceeded')) {
                    errorMessage = 'Muitas tentativas em pouco tempo. Por favor, aguarde 60 segundos e tente confirmar novamente.';
                } else {
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
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
            <Card className="glass-card p-6 border-white/10">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-orange-coral/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-brand-orange-coral" />
                        </div>
                        <h4 className="font-bold text-white text-lg">Dados Pessoais</h4>
                    </div>
                    {dados.indicacaoTipo && dados.indicacaoTipo !== 'nenhum' && (
                        <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30">
                            {dados.indicacaoTipo === 'prefeitura' ? 'Parceria Prefeitura' : 'Parceria Político'}
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
            <Card className="glass-card p-6 border-white/10">
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

            {/* Informação Importante */}
            <Card className="glass-card p-6 border-blue-500/30 bg-blue-500/10">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-2">O que acontece agora?</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange-coral mt-0.5">•</span>
                                <span>Criaremos sua conta com o email fornecido</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange-coral mt-0.5">•</span>
                                <span>Você receberá um email de confirmação</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange-coral mt-0.5">•</span>
                                <span>Sua atividade será reservada automaticamente</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange-coral mt-0.5">•</span>
                                <span>Você poderá acessar o app com seu email e senha</span>
                            </li>
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
