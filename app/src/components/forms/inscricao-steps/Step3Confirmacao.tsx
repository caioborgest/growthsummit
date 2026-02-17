import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, User, Mail, Phone, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import type { DadosInscricao } from './inscricaoTypes';
import { getAtividadeById } from '@/data/programacao';
import { supabase } from '@/lib/supabase';

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
            // 1. Criar usuário no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: dados.email,
                password: dados.senha,
                options: {
                    data: {
                        name: dados.nome,
                        phone: dados.telefone,
                        role: 'participant'
                    }
                }
            });

            if (authError) {
                throw new Error(authError.message);
            }

            if (!authData.user) {
                throw new Error('Erro ao criar usuário');
            }

            // 2. Salvar inscrição no banco
            const { data: inscricaoData, error: inscricaoError } = await supabase
                .from('inscricoes_growth_experience')
                .insert({
                    user_id: authData.user.id,
                    nome: dados.nome,
                    email: dados.email,
                    telefone: dados.telefone,
                    cursos_selecionados: dados.cursosSelecionados,
                    palestras_noturnas: false,
                    valor_pago: 0,
                    status_pagamento: 'pendente',
                    app_instalado: false
                })
                .select()
                .single();

            if (inscricaoError) {
                throw new Error(inscricaoError.message);
            }

            // 3. Sucesso - continuar para próxima etapa
            onConfirmar(authData.user.id, inscricaoData.id);

        } catch (err: unknown) {
            console.error('Erro ao confirmar inscrição:', err);
            const errorMessage = err instanceof Error ? err.message : 'Erro ao processar inscrição. Tente novamente.';
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
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-orange-coral/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-brand-orange-coral" />
                    </div>
                    <h4 className="font-bold text-white text-lg">Dados Pessoais</h4>
                </div>

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

                    <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                            <p className="text-xs text-gray-500">Telefone</p>
                            <p className="text-white font-semibold">{dados.telefone}</p>
                        </div>
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
                        Cursos Selecionados ({cursosSelecionados.length})
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
                                <span>Seus cursos serão reservados automaticamente</span>
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
