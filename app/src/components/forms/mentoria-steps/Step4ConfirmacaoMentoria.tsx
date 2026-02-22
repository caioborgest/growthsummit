import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Mail, Phone, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import type { DadosMentoria } from './mentoriaTypes';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';

interface Step4ConfirmacaoMentoriaProps {
    dados: DadosMentoria;
    onConfirmar: (userId: string, inscricaoId: string) => void;
    onVoltar: () => void;
}

interface Mentor {
    id: string;
    nome: string;
    foto_url?: string;
}

export function Step4ConfirmacaoMentoria({ dados, onConfirmar, onVoltar }: Step4ConfirmacaoMentoriaProps) {
    const [loading, setLoading] = useState(false);
    const [fetchingMentor, setFetchingMentor] = useState(true);
    const [mentor, setMentor] = useState<Mentor | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchMentor() {
            try {
                const { data, error } = await supabase
                    .from('mentores_growth_experience')
                    .select('*')
                    .eq('id', dados.mentorId)
                    .single();

                if (error) throw error;
                setMentor(data);
            } catch (err) {
                console.error('Erro ao buscar mentor:', err);
            } finally {
                setFetchingMentor(false);
            }
        }
        if (dados.mentorId) fetchMentor();
    }, [dados.mentorId]);

    const { projectId } = useProject();

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
                throw new Error('Erro ao identificar usuário para o agendamento');
            }

            if (!userId) {
                // Tentar logar se já existe? Para simplificar vamos lançar erro se não conseguirmos o ID
                if (authError?.message.includes('already registered')) {
                    throw new Error('Este email já está cadastrado. Por favor, faça login.');
                }
                throw new Error('Erro ao identificar usuário');
            }

            // 2. Salvar agendamento de mentoria no banco
            const { data: mentoriaData, error: mentoriaError } = await (supabase
                .from('mentorias_agendadas') as any)
                .insert({
                    project_id: projectId,
                    mentorado_id: userId,
                    mentor_id: dados.mentorId,
                    nome_mentorado: dados.nome,
                    email_mentorado: dados.email,
                    telefone_mentorado: dados.telefone,
                    tema_interesse: dados.area,
                    status: 'pendente'
                })
                .select();

            if (mentoriaError) throw new Error(mentoriaError.message);

            // 3. Sucesso - continuar
            onConfirmar(userId, mentoriaData?.[0]?.id || '');

        } catch (err: unknown) {
            console.error('Erro ao confirmar mentoria:', err);
            let errorMessage = 'Ops! Houve um erro ao processar seu agendamento.';

            if (err instanceof Error) {
                if (err.message.includes('rate limit exceeded')) {
                    errorMessage = 'Muitas tentativas em pouco tempo. Por favor, aguarde 60 segundos e tente confirmar novamente.';
                } else {
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);
            setLoading(false); // Only reset on error
        }
    };

    if (fetchingMentor) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 text-brand-orange-coral animate-spin" />
                <p className="text-gray-400 font-medium">Preparando seu agendamento...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-3">Resumo do Agendamento</h3>
                <p className="text-gray-400 text-lg">Confirme os detalhes da sua sessão 1:1</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card p-6 border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-orange-coral/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-brand-orange-coral" />
                        </div>
                        <h4 className="font-bold text-white">Seus Dados</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                        <p className="text-gray-400 flex items-center gap-2"><User size={14} /> {dados.nome}</p>
                        <p className="text-gray-400 flex items-center gap-2"><Mail size={14} /> {dados.email}</p>
                        <p className="text-gray-400 flex items-center gap-2"><Phone size={14} /> {dados.telefone}</p>
                    </div>
                </Card>

                <Card className="glass-card p-6 border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-teal-400" />
                        </div>
                        <h4 className="font-bold text-white">Mentor Escolhido</h4>
                    </div>
                    <div className="flex items-center gap-4">
                        {mentor?.foto_url ? (
                            <img src={mentor.foto_url} className="w-12 h-12 rounded-full object-cover border border-white/10" alt={mentor.nome} />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-dark-200 flex items-center justify-center border border-white/10">
                                <User className="h-6 w-6 text-gray-500" />
                            </div>
                        )}
                        <div>
                            <p className="text-white font-bold">{mentor?.nome || 'Mentor Selecionado'}</p>
                            <p className="text-brand-orange-coral text-xs font-semibold">{dados.area}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {error && (
                <Card className="glass-card p-4 border-red-500/30 bg-red-500/10">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                </Card>
            )}

            <div className="flex gap-4">
                <Button variant="outline" size="lg" onClick={onVoltar} disabled={loading} className="flex-1 border-white/20 text-white">Voltar</Button>
                <Button size="lg" onClick={handleConfirmar} disabled={loading} className="flex-1 bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient text-white font-bold">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirmar Agendamento'}
                </Button>
            </div>
        </div>
    );
}
