import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Mail, Phone, Briefcase, Loader2, AlertCircle, Target, ShieldCheck, CheckCircle2, Star } from 'lucide-react';
import type { DadosMentoria } from './mentoriaTypes';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';
import { Badge } from '@/components/ui/badge';

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
                logger.error('Erro ao buscar mentor:', err);
            } finally {
                setFetchingMentor(false);
            }
        }
        if (dados.mentorId) fetchMentor();
    }, [dados.mentorId]);

    const { projectId } = useProject();

    const handleConfirmar = async () => {
        if (loading) return;
        setLoading(true);
        setError('');

        try {
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            let userId = existingSession?.user?.id;
            let authError = null;

            if (existingSession && (existingSession.user.email === dados.email || !dados.email)) {
                userId = existingSession.user.id;
            } else {
                userId = undefined;
            }

            if (!userId) {
                const { data: authData, error: sError } = await supabase.auth.signUp({
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
                userId = authData?.user?.id;
                authError = sError;

                if (!authError && !authData?.session) {
                    await supabase.auth.signInWithPassword({
                        email: dados.email,
                        password: dados.senha
                    }).catch(e => logger.warn('Auto-login skip mentoria (confirmation required?):', e.message));
                }
            }

            if (authError) {
                if (authError.message.includes('already registered')) {
                    logger.info('Usuário já registrado, tentando login...');
                    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                        email: dados.email,
                        password: dados.senha
                    });

                    if (!signInError) {
                        userId = signInData.user.id;
                    } else {
                        if (signInError.message.includes('Invalid login credentials')) {
                            throw new Error('Este email já está cadastrado com outra senha. Por favor, use a senha correta ou outro email.');
                        }
                        throw signInError;
                    }
                } else {
                    throw authError;
                }
            }

            if (userId) {
                try {
                    const { data: existingUser } = await supabase
                        .from('users')
                        .select('id')
                        .eq('email', dados.email)
                        .maybeSingle();

                    if (existingUser && existingUser.id !== userId) {
                        try {
                            await supabase.from('users').delete().eq('email', dados.email);
                        } catch (e) { }
                    }

                    const usersTable = supabase.from('users') as any;
                    const { error: userTableError } = await usersTable
                        .upsert({
                            id: userId,
                            email: dados.email,
                            name: dados.nome,
                            phone: dados.telefone,
                            role: 'participant',
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'id' });

                    if (userTableError) {
                        if (userTableError.message.includes('unique_email') || userTableError.message.includes('users_email_key')) {
                            const { error: secondTryError } = await usersTable
                                .upsert({
                                    id: userId,
                                    email: dados.email,
                                    name: dados.nome,
                                    phone: dados.telefone,
                                    role: 'participant',
                                    updated_at: new Date().toISOString()
                                }, { onConflict: 'email' });

                            if (secondTryError) {
                                throw new Error('Não conseguimos vincular seus dados. Se você já tem uma conta, use o mesmo email e senha corretos.');
                            }
                        } else {
                            throw userTableError;
                        }
                    }
                } catch (userTableCatch: any) {
                    if (userTableCatch instanceof Error && userTableCatch.message.includes('vincular')) {
                        throw userTableCatch;
                    }
                }
            }

            const mentoriasTable = supabase.from('mentorias_agendadas') as any;
            const { data: mentoriaData, error: mentoriaError } = await mentoriasTable
                .insert({
                    project_id: projectId,
                    mentorado_id: userId || null,
                    mentor_id: dados.mentorId,
                    nome_mentorado: dados.nome,
                    email_mentorado: dados.email,
                    telefone_mentorado: dados.telefone,
                    tema_interesse: dados.area,
                    anotacoes: dados.descricaoProblema,
                    status: 'pendente'
                })
                .select();

            if (mentoriaError) throw new Error(mentoriaError.message);

            onConfirmar(userId || '', mentoriaData?.[0]?.id || '');

        } catch (err: unknown) {
            logger.error('Erro ao confirmar mentoria:', err);
            let errorMessage = 'Ops! Houve um erro ao processar seu agendamento.';

            if (err instanceof Error) {
                if (err.message.includes('rate limit exceeded')) {
                    errorMessage = 'Muitas tentativas em pouco tempo. Por favor, aguarde 60 segundos.';
                } else {
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);
            setLoading(false);
        }
    };

    if (fetchingMentor) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
                <div className="w-16 h-16 rounded-full border-4 border-brand-orange-coral/10 border-t-brand-orange-coral animate-spin" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Preparando seu agendamento...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="text-left sm:text-center max-w-2xl mx-auto">
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">Revise os <span className="text-brand-orange-coral">Detalhes</span></h3>
                <p className="text-gray-400 text-sm sm:text-lg">Confirme as informações antes de finalizar o seu agendamento 1:1.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20 sm:pb-0">
                {/* Meus Dados */}
                <Card className="glass-card p-6 border-white/5 bg-dark-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <User size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                            <User className="h-6 w-6 text-brand-orange-coral" />
                        </div>
                        <div>
                            <h4 className="font-black text-white uppercase tracking-wider text-sm">Meus Dados</h4>
                            <p className="text-gray-500 text-xs">Informações cadastrais</p>
                        </div>
                    </div>

                    <div className="space-y-4 px-2 relative z-10">
                        <div className="flex items-center gap-4 group/item">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-white/10 transition-colors">
                                <User size={14} className="text-gray-400 group-hover/item:text-brand-orange-coral" />
                            </div>
                            <span className="text-white font-medium text-sm sm:text-base">{dados.nome}</span>
                        </div>
                        <div className="flex items-center gap-4 group/item">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-white/10 transition-colors">
                                <Mail size={14} className="text-gray-400 group-hover/item:text-brand-orange-coral" />
                            </div>
                            <span className="text-gray-400 text-sm sm:text-base truncate">{dados.email}</span>
                        </div>
                        <div className="flex items-center gap-4 group/item">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-white/10 transition-colors">
                                <Phone size={14} className="text-gray-400 group-hover/item:text-brand-orange-coral" />
                            </div>
                            <span className="text-gray-400 text-sm sm:text-base">{dados.telefone}</span>
                        </div>
                    </div>
                </Card>

                {/* Mentor Escolhido */}
                <Card className="glass-card p-6 border-white/5 bg-dark-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Star size={80} className="text-brand-orange-coral" />
                    </div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                            <Briefcase className="h-6 w-6 text-teal-400" />
                        </div>
                        <div>
                            <h4 className="font-black text-white uppercase tracking-wider text-sm">Mentor Escolhido</h4>
                            <p className="text-gray-500 text-xs">Especialista disponível</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 px-2 relative z-10">
                        <div className="relative">
                            {mentor?.foto_url ? (
                                <img
                                    src={mentor.foto_url}
                                    className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-500/30 shadow-lg"
                                    alt={mentor.nome}
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-dark-100 flex items-center justify-center border-2 border-white/5">
                                    <User className="h-10 w-10 text-gray-700" />
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 bg-teal-500 rounded-lg p-1 shadow-lg">
                                <CheckCircle2 size={16} className="text-dark-100" />
                            </div>
                        </div>
                        <div>
                            <p className="text-white font-black text-lg sm:text-xl tracking-tight">{mentor?.nome || 'Especialista'}</p>
                            <Badge variant="outline" className="mt-2 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/20 font-bold uppercase text-[10px] py-1">
                                {dados.area}
                            </Badge>
                        </div>
                    </div>
                </Card>

                {/* Meu Desafio */}
                <Card className="glass-card p-6 border-white/5 bg-dark-200/40 relative overflow-hidden group md:col-span-2">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Target size={80} className="text-brand-orange-coral" />
                    </div>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <Target className="h-6 w-6 text-orange-400" />
                        </div>
                        <div>
                            <h4 className="font-black text-white uppercase tracking-wider text-sm">Cenário Desejado</h4>
                            <p className="text-gray-500 text-xs">Objetivo detalhado para a mentoria</p>
                        </div>
                    </div>
                    <div className="bg-dark-100/50 p-5 rounded-2xl border border-white/5 relative z-10">
                        <p className="text-white/80 text-sm sm:text-base leading-relaxed italic">
                            "{dados.descricaoProblema}"
                        </p>
                    </div>
                </Card>
            </div>

            {error && (
                <Card className="glass-card p-4 border-red-500/40 bg-red-500/10 animate-in shake duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <h4 className="text-red-500 font-bold text-sm">Falha no processamento</h4>
                            <p className="text-red-400/80 text-xs">{error}</p>
                        </div>
                    </div>
                </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4 sticky bottom-0 bg-dark-100/10 backdrop-blur-sm -mx-4 pb-2">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onVoltar}
                    disabled={loading}
                    className="flex-1 border-white/10 text-white hover:bg-white/10 font-bold h-14 sm:h-16 rounded-2xl"
                >
                    Ajustar Detalhes
                </Button>
                <Button
                    size="lg"
                    onClick={handleConfirmar}
                    disabled={loading}
                    className="flex-[2] bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black h-14 sm:h-16 text-xl rounded-2xl shadow-glow-orange transition-all hover:scale-[1.02] flex items-center justify-center gap-3 group"
                >
                    {loading ? (
                        <Loader2 className="h-7 w-7 animate-spin" />
                    ) : (
                        <>
                            Confirmar Agendamento
                            <ShieldCheck className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        </>
                    )}
                </Button>
            </div>

            <p className="text-center text-gray-600 text-[10px] uppercase font-bold tracking-[0.2em] pt-4">
                Segurança garantida via <span className="text-brand-orange-coral">Growth Experience 2026</span>
            </p>
        </div>
    );
}

