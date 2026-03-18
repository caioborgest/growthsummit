
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Mail, Phone, Loader2, Target, ShieldCheck, Clock, Building2, BarChart } from 'lucide-react';
import type { DadosMentoria } from './mentoriaTypes';
import { MENTORSHIP_TIME_SLOTS } from './mentoriaTypes';
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
    email?: string; // We'll need this to notify them
}

export function Step4ConfirmacaoMentoria({ dados, onConfirmar, onVoltar }: Step4ConfirmacaoMentoriaProps) {
    const [loading, setLoading] = useState(false);
    const [fetchingMentor, setFetchingMentor] = useState(true);
    const [mentor, setMentor] = useState<Mentor | null>(null);
    const [error, setError] = useState('');

    const timeSlotLabel = MENTORSHIP_TIME_SLOTS.find(s => s.id === dados.slotId)?.label || '--:--';

    useEffect(() => {
        async function fetchMentor() {
            try {
                const { data, error } = await supabase
                    .from('mentores_growth_experience')
                    .select('id,nome,email,empresa,cargo,especialidades,bio,foto_url')
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
                const usersTable = supabase.from('users' as any) as any;
                await usersTable
                    .upsert({
                        id: userId,
                        email: dados.email,
                        name: dados.nome,
                        phone: dados.telefone,
                        role: 'participant',
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'id' });
            }

            // Create timestamp for scheduled_at based on selectedDate and slotId
            const [hours, minutes] = dados.slotId.split(':');
            let scheduled_date: Date;
            if (dados.selectedDate) {
                const [y, m, d] = dados.selectedDate.split('-').map(Number);
                scheduled_date = new Date(y, m - 1, d, parseInt(hours), parseInt(minutes));
            } else {
                const now = new Date();
                scheduled_date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes));
            }

            const mentoriasTable = supabase.from('mentorias_agendadas' as any) as any;

            // 1. First, check if there's an existing available slot (mentor habilitou esse horário)
            const PLACEHOLDER_ID = '00000000-0000-0000-0000-000000000000';
            const { data: existingSlots } = await mentoriasTable
                .select('id')
                .eq('mentor_id', dados.mentorId)
                .eq('data_mentoria', scheduled_date.toISOString())
                .or(`mentorado_id.is.null,mentorado_id.eq.${PLACEHOLDER_ID}`)
                .eq('status', 'scheduled')
                .limit(1);

            const slotToUpdate = existingSlots?.[0]?.id;
            let mentoriaResult;

            if (slotToUpdate) {
                // Update existing slot
                mentoriaResult = await mentoriasTable
                    .update({
                        mentorado_id: userId || null,
                        nome_mentorado: dados.nome,
                        email_mentorado: dados.email,
                        telefone_mentorado: dados.telefone,
                        tema_interesse: dados.area,
                        anotacoes: dados.descricaoProblema,
                        nome_startup: dados.nomeNegocio,
                        setor: dados.estagioNegocio,
                        status: 'scheduled',
                        duracao: 20
                    })
                    .eq('id', slotToUpdate)
                    .select();
            } else {
                // Fallback: Create new record if no slot exists (legacy behavior or admin manual override)
                mentoriaResult = await mentoriasTable
                    .insert({
                        project_id: projectId,
                        mentorado_id: userId || null,
                        mentor_id: dados.mentorId,
                        nome_mentorado: dados.nome,
                        email_mentorado: dados.email,
                        telefone_mentorado: dados.telefone,
                        tema_interesse: dados.area,
                        anotacoes: dados.descricaoProblema,
                        data_mentoria: scheduled_date.toISOString(),
                        nome_startup: dados.nomeNegocio,
                        setor: dados.estagioNegocio,
                        status: 'scheduled',
                        duracao: 20
                    })
                    .select();
            }

            const { data: mentoriaData, error: mentoriaError } = mentoriaResult;
            if (mentoriaError) throw new Error(mentoriaError.message);

            // Notify mentor
            if (mentor?.email) {
                await supabase.functions.invoke('send-email', {
                    body: {
                        to: [mentor.email],
                        subject: `🚀 Novo Agendamento de Mentoria: ${dados.nome}`,
                        html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                            <h1 style="color: #14b8a6;">Olá, ${mentor.nome}!</h1>
                            <p>Você tem um novo agendamento de mentoria confirmado.</p>
                            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 25px 0;">
                            <p style="margin: 0 0 10px 0;"><strong>Participante:</strong> ${dados.nome}</p>
                            <p style="margin: 0 0 10px 0;"><strong>Negócio:</strong> ${dados.nomeNegocio || 'Não informado'} (${dados.estagioNegocio || 'Não informado'})</p>
                            <p style="margin: 0 0 10px 0;"><strong>Horário Spot:</strong> ${timeSlotLabel}</p>
                            <p style="margin: 0 0 10px 0;"><strong>Área:</strong> ${dados.area}</p>
                            <p style="margin: 0;"><strong>Desafio/Problema:</strong> ${dados.descricaoProblema}</p>
                            </div>
                            <p>Acesse seu painel mentor para ver mais detalhes.</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                            <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 Growth Experience</p>
                        </div>
                        `
                    }
                }).catch(e => logger.warn('Failed to send notification email:', e.message));
            }

            onConfirmar(userId || '', mentoriaData?.[0]?.id || '');

        } catch (err: any) {
            logger.error('Erro ao confirmar mentoria:', err);
            setError(err.message || 'Erro ao processar agendamento.');
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
                <p className="text-gray-400 text-sm sm:text-lg">Confirme as informações antes de finalizar o seu agendamento de 20 min.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20 sm:pb-0">
                {/* Meus Dados */}
                <Card className="glass-card p-6 border-white/5 bg-dark-200/40 relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                            <User className="h-6 w-6 text-brand-orange-coral" />
                        </div>
                        <div>
                            <h4 className="font-black text-white uppercase tracking-wider text-sm">Dados do Participante</h4>
                            <p className="text-gray-500 text-xs">Informações de contato</p>
                        </div>
                    </div>

                    <div className="space-y-3 px-2 relative z-10">
                        <p className="text-white font-medium flex items-center gap-3"><User size={14} className="text-teal-400" /> {dados.nome}</p>
                        <p className="text-gray-400 text-sm flex items-center gap-3"><Phone size={14} className="text-teal-400" /> {dados.telefone}</p>
                        <p className="text-gray-400 text-sm flex items-center gap-3"><Mail size={14} className="text-teal-400" /> {dados.email}</p>
                    </div>
                </Card>

                {/* Dados do Negócio */}
                <Card className="glass-card p-6 border-white/5 bg-dark-200/40 relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                            <Building2 className="h-6 w-6 text-teal-400" />
                        </div>
                        <div>
                            <h4 className="font-black text-white uppercase tracking-wider text-sm">Dados do Negócio</h4>
                            <p className="text-gray-500 text-xs">Empresa ou Startup</p>
                        </div>
                    </div>

                    <div className="space-y-3 px-2 relative z-10">
                        <p className="text-white font-medium flex items-center gap-3 truncate"><Building2 size={14} className="text-teal-400" /> {dados.nomeNegocio}</p>
                        <p className="text-gray-400 text-sm flex items-center gap-3"><BarChart size={14} className="text-teal-400" /> {dados.estagioNegocio}</p>
                    </div>
                </Card>

                {/* Agendamento */}
                <Card className="glass-card p-6 border-white/5 bg-dark-200/40 md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                {mentor?.foto_url ? (
                                    <img
                                        src={mentor.foto_url}
                                        className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-orange-coral/30"
                                        alt={mentor.nome}
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-dark-100 flex items-center justify-center">
                                        <User className="h-10 w-10 text-gray-700" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-white font-black text-lg sm:text-xl tracking-tight leading-none mb-1">{mentor?.nome}</p>
                                <Badge className="bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/20 uppercase text-[9px] font-black">{dados.area}</Badge>
                            </div>
                        </div>

                        <div className="bg-brand-orange-coral/10 border border-brand-orange-coral/20 rounded-2xl p-4 flex items-center justify-center gap-4">
                            <Clock className="h-6 w-6 text-brand-orange-coral" />
                            <div className="text-center">
                                <p className="text-[10px] text-brand-orange-coral font-black uppercase tracking-widest leading-none mb-1">Horário Spot 20min</p>
                                <p className="text-white font-black text-2xl tracking-tighter">{timeSlotLabel}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                        <div className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-brand-orange-coral" />
                            <span className="text-white font-bold text-xs uppercase italic tracking-widest">Desafio/Problema:</span>
                        </div>
                        <p className="text-gray-400 text-sm italic leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                            "{dados.descricaoProblema}"
                        </p>
                    </div>
                </Card>
            </div>

            {error && (
                <Card className="glass-card p-4 border-red-500/40 bg-red-500/10 text-center text-red-500 font-bold text-xs">
                    {error}
                </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4 sticky bottom-0 bg-dark-100/10 backdrop-blur-sm -mx-4 pb-2">
                <Button variant="outline" size="lg" onClick={onVoltar} className="flex-1 border-white/10 text-white font-bold h-14 rounded-2xl">Voltar</Button>
                <Button size="lg" onClick={handleConfirmar} disabled={loading} className="flex-[2] bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black h-14 text-xl rounded-2xl shadow-glow-orange flex items-center justify-center gap-3">
                    {loading ? <Loader2 size={24} className="animate-spin" /> : <>Finalizar Agendamento <ShieldCheck size={20} /></>}
                </Button>
            </div>
        </div>
    );
}
