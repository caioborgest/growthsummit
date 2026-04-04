import { useState, useEffect } from 'react';
import { Loader2, Calendar, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface Step1SelecionarCursosProps {
    selectedSessions?: string[];
    onContinuar: (cursos: string[]) => void;
    onVoltar?: () => void;
}

interface Session {
    id: string;
    title: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    room?: string;
    type?: string;
}

export function Step1SelecionarCursos({
    onContinuar,
    onVoltar
}: Step1SelecionarCursosProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const PROJECT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

    useEffect(() => {
        async function fetchSessions() {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('event_schedule')
                    .select('*')
                    .eq('project_id', PROJECT_ID)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setSessions(data || []);
            } catch (err) {
                logger.error('Error fetching event schedule:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSessions();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="text-left">
                <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2 sm:mb-4 tracking-tighter uppercase italic">
                    Nossa <span className="text-brand-orange-coral underline decoration-brand-orange-coral/30">Programação</span>
                </h3>
                <p className="text-gray-400 text-base sm:text-lg max-w-xl font-medium">
                    Confira os detalhes das atividades e trilhas de conhecimento preparadas para você.
                </p>
            </div>

            {/* Event Schedule List */}
            <div className="grid gap-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Loader2 className="h-12 w-12 animate-spin mb-4 text-brand-orange-coral" />
                        <p className="font-bold uppercase tracking-widest text-xs">Carregando programação...</p>
                    </div>
                ) : sessions.length > 0 ? (
                    sessions.map((session) => (
                        <div
                            key={session.id}
                            className="relative p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-dark-200/40 border-2 border-white/5 shadow-lg group hover:border-brand-orange-coral/30 transition-all duration-500"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-brand-orange-coral transition-colors tracking-tight">
                                    {session.title}
                                </h4>
                                
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-brand-orange-coral" />
                                        <span>{session.startTime || '--:--'}</span>
                                    </div>
                                    <div className="w-px h-4 bg-white/10" />
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-brand-orange-coral" />
                                        <span>{session.room || 'Auditório'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-dark-200/40 rounded-[2rem] border-2 border-dashed border-white/5 flex flex-col items-center gap-4">
                        <Calendar className="h-12 w-12 text-gray-600 mb-2" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm italic">
                            Programação em breve
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                <div className="flex gap-2">
                    {onVoltar && (
                        <button 
                            type="button" 
                            onClick={onVoltar} 
                            className="bg-white/5 hover:bg-white/10 text-white font-black px-8 py-4 rounded-xl transition-all border border-white/10"
                        >
                            Voltar
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onContinuar([])}
                        className="flex-1 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-10 py-4 rounded-xl shadow-glow-orange transition-all uppercase tracking-widest text-sm"
                    >
                        Confirmar e Próximo Passo
                    </button>
                </div>

                <div className="flex items-center justify-center gap-4 py-2">
                    <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-orange-coral w-[14%]" />
                    </div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-black whitespace-nowrap">
                        Passo 1 de 7 • Programação
                    </p>
                    <div className="h-1 flex-1 bg-white/5 rounded-full" />
                </div>
            </div>
        </div>
    );
}
