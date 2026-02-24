import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Check, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';

interface Mentor {
    id: string;
    nome: string;
    cargo?: string;
    empresa: string;
    bio: string;
    foto_url?: string;
    especialidades?: string[];
}

interface Step2SelecionarMentorProps {
    area: string;
    mentorSelecionadoId: string;
    onContinuar: (mentorId: string) => void;
    onVoltar: () => void;
}

export function Step2SelecionarMentor({ area, mentorSelecionadoId, onContinuar, onVoltar }: Step2SelecionarMentorProps) {
    const [mentores, setMentores] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const { projectId } = useProject();

    useEffect(() => {
        async function fetchMentores() {
            try {
                const { data, error } = await supabase
                    .from('mentores_growth_experience')
                    .select('*')
                    .eq('project_id', projectId)
                    .eq('status', 'aprovado'); // Ou remova o filtro se quiser mostrar todos pendentes para teste

                if (error) throw error;

                // Se não houver mentores aprovados, vamos mostrar os pendentes para fins de teste/demo
                if (!data || data.length === 0) {
                    const { data: allData } = await supabase
                        .from('mentores_growth_experience')
                        .select('*')
                        .eq('project_id', projectId);
                    setMentores(allData || []);
                } else {
                    setMentores(data);
                }
            } catch (err) {
                console.error('Erro ao buscar mentores:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchMentores();
    }, []);

    const mentoresSugeridos = mentores.filter(m =>
        m.especialidades?.some((e: string) => e.toLowerCase().includes(area.toLowerCase()))
    );

    const outrosMentores = mentores.filter(m =>
        !m.especialidades?.some((e: string) => e.toLowerCase().includes(area.toLowerCase()))
    );

    const renderMentorCard = (mentor: Mentor) => (
        <Card
            key={mentor.id}
            onClick={() => onContinuar(mentor.id)}
            className={`p-6 cursor-pointer transition-all hover:scale-105 border-white/10 relative overflow-hidden ${mentorSelecionadoId === mentor.id
                ? 'bg-brand-orange-coral/20 border-brand-orange-coral shadow-glow-orange'
                : 'bg-dark-200 hover:bg-dark-300'
                }`}
        >
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start relative z-10">
                <div className="relative">
                    {mentor.foto_url ? (
                        <img
                            src={mentor.foto_url}
                            alt={mentor.nome}
                            className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-orange-coral/30"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-2xl bg-dark-300 flex items-center justify-center border-2 border-white/5">
                            <User className="h-10 w-10 text-gray-500" />
                        </div>
                    )}
                    {mentorSelecionadoId === mentor.id && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-brand-orange-coral flex items-center justify-center border-4 border-dark-100">
                            <Check className="h-4 w-4 text-white" />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-xl font-bold text-white mb-1">{mentor.nome}</h4>
                    <p className="text-brand-orange-coral text-sm font-semibold mb-3">
                        {mentor.cargo || 'Mentor Oficial'} @ {mentor.empresa}
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        {mentor.bio}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {mentor.especialidades?.map((esp: string) => (
                            <span
                                key={esp}
                                className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 uppercase tracking-tighter"
                            >
                                {esp}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 text-brand-orange-coral animate-spin" />
                <p className="text-gray-400">Carregando mentores...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-3">Escolha seu Mentor</h3>
                <p className="text-gray-400 text-lg">Mentores especializados em <span className="text-brand-orange-coral font-bold">{area}</span></p>
            </div>

            <div className="space-y-4">
                {mentores.length > 0 ? (
                    <>
                        {mentoresSugeridos.length > 0 ? (
                            <>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Sugestões para {area}</p>
                                {mentoresSugeridos.map(renderMentorCard)}

                                {outrosMentores.length > 0 && (
                                    <>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 pt-4">Outras Especialidades</p>
                                        {outrosMentores.map(renderMentorCard)}
                                    </>
                                )}
                            </>
                        ) : (
                            mentores.map(renderMentorCard)
                        )}
                    </>
                ) : (
                    <div className="text-center py-10 bg-dark-200 rounded-2xl border border-white/5">
                        <User className="h-10 w-10 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Nenhum mentor disponível no momento.</p>
                    </div>
                )}
            </div>

            <div className="flex gap-4 pt-6">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onVoltar}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                    Voltar
                </Button>
                {mentorSelecionadoId && (
                    <Button
                        size="lg"
                        onClick={() => onContinuar(mentorSelecionadoId)}
                        className="flex-1 bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-bold"
                    >
                        Continuar <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
    );
}
