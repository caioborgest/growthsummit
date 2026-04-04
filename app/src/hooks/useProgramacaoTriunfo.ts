import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@/types';
import { formatEventTime, compareEventTimes } from '@/lib/formatTime';

const TRIUNFO_PROJECT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export function useProgramacaoTriunfo() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('event_schedule')
                    .select('*')
                    .eq('project_id' as any, TRIUNFO_PROJECT_ID)
                    .order('created_at');

                if (error) throw error;
                setSessions((data as any) || []);
            } catch (err: any) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();

        const channel = supabase
            .channel(`public_event_schedule_${TRIUNFO_PROJECT_ID}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'event_schedule',
                    filter: `project_id=eq.${TRIUNFO_PROJECT_ID}`,
                },
                () => {
                    fetchSessions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const programacao = useMemo(() => {
        const transformAtividade = (s: Session) => ({
            id: s.id,
            horario: formatEventTime(s.startTime),
            titulo: s.title,
            tipo: s.type,
            capacidade: s.maxCapacity,
            inscritos: s.registeredCount || 0,
            topicos: s.topics || [],
            local: s.room
        });

        const filterByCategory = (cat: string) => sessions.filter(s => s.category === cat).sort((a, b) => compareEventTimes(a.startTime, b.startTime));

        const manhaAncora = filterByCategory('manha_ancora').map(s => ({
            horario: formatEventTime(s.startTime),
            atividade: s.title,
            local: s.room || 'Espaço Parque'
        }));

        const tardeAncora = filterByCategory('tarde_ancora').map(s => ({
            horario: formatEventTime(s.startTime),
            atividade: s.title,
            local: s.room || 'Espaço Parque'
        }));

        const b1_sessions = filterByCategory('manha_bloco_1');
        const b1_salao = b1_sessions.find(s => (s.room || '').toLowerCase().includes('salao') || (s.room || '').toLowerCase().includes('principal'));
        const b1_salas = b1_sessions.filter(s => s !== b1_salao).map((s, idx) => ({ ...transformAtividade(s), numero: idx + 1 }));

        const b2_sessions = filterByCategory('manha_bloco_2');
        const b2_salao = b2_sessions.find(s => (s.room || '').toLowerCase().includes('salao') || (s.room || '').toLowerCase().includes('principal'));
        const b2_salas = b2_sessions.filter(s => s !== b2_salao).map((s, idx) => ({ ...transformAtividade(s), numero: idx + 1 }));

        const circ1 = filterByCategory('manha_circulacao')[0];
        const enc_manha = filterByCategory('manha_encerramento')[0];

        const b3_sessions = filterByCategory('tarde_bloco_3');
        const b3_salao = b3_sessions.find(s => (s.room || '').toLowerCase().includes('salao') || (s.room || '').toLowerCase().includes('principal'));
        const b3_salas = b3_sessions.filter(s => s !== b3_salao).map((s, idx) => ({ ...transformAtividade(s), numero: idx + 1 }));

        const b4_sessions = filterByCategory('tarde_bloco_4');
        const b4_salao = b4_sessions.find(s => (s.room || '').toLowerCase().includes('salao') || (s.room || '').toLowerCase().includes('principal'));
        const b4_salas = b4_sessions.filter(s => s !== b4_salao).map((s, idx) => ({ ...transformAtividade(s), numero: idx + 1 }));

        const circ2 = filterByCategory('tarde_circulacao')[0];
        const enc_tarde = filterByCategory('tarde_encerramento')[0];

        const noturna = filterByCategory('noturna').map(s => ({
            horario: formatEventTime(s.startTime),
            atividade: s.title
        }));

        const circuito = filterByCategory('circuito').map(s => {
            const meta = (s.metadata || {}) as Record<string, string>;
            return {
                nome: s.title,
                subtitulo: s.description,
                parceiro: s.partner || 'Growth Experience',
                tempo: meta.tempo || '10-15 min',
                temas: s.topics || [],
                cor: s.color || 'orange',
                icon: () => null,
                formato: s.type,
                capacidade: s.maxCapacity?.toString() || '300/dia',
                totalDia: meta.totalDia || 'Contínuo',
            };
        });

        const allActivitiesWithTimes = [
            ...b1_sessions, ...b2_sessions, ...b3_sessions, ...b4_sessions,
            ...filterByCategory('manha_ancora'), ...filterByCategory('tarde_ancora'),
            circ1, circ2, enc_manha, enc_tarde,
            ...filterByCategory('noturna')
        ].filter(Boolean).map(s => ({
            id: s.id,
            titulo: s.title,
            horario: formatEventTime(s.startTime),
            startTime: s.startTime,
            endTime: s.endTime,
            local: s.room || 'Espaço Parque',
        }));

        return {
            allActivitiesWithTimes,
            momentosAncora: { manha: manhaAncora, tarde: tardeAncora },
            programacaoManha: {
                bloco1: { horario: formatEventTime(b1_salao?.startTime) || '08:30', titulo: b1_salao?.title || 'Bloco 1', salao: b1_salao ? transformAtividade(b1_salao) : undefined, salas: b1_salas },
                circulacao1: { horario: formatEventTime(circ1?.startTime) || '10:00', atividade: circ1?.title || 'Networking' },
                bloco2: { horario: formatEventTime(b2_salao?.startTime) || '10:15', titulo: b2_salao?.title || 'Bloco 2', salao: b2_salao ? transformAtividade(b2_salao) : undefined, salas: b2_salas },
                encerramento: { horario: formatEventTime(enc_manha?.startTime) || '11:45', atividade: enc_manha?.title || 'Almoço' }
            },
            programacaoTarde: {
                bloco3: { horario: formatEventTime(b3_salao?.startTime) || '14:00', titulo: b3_salao?.title || 'Bloco 3', salao: b3_salao ? transformAtividade(b3_salao) : undefined, salas: b3_salas },
                circulacao2: { horario: formatEventTime(circ2?.startTime) || '15:30', atividade: circ2?.title || 'Networking' },
                bloco4: { horario: formatEventTime(b4_salao?.startTime) || '15:45', titulo: b4_salao?.title || 'Bloco 4', salao: b4_salao ? transformAtividade(b4_salao) : undefined, salas: b4_salas },
                encerramento: { horario: formatEventTime(enc_tarde?.startTime) || '17:15', atividade: enc_tarde?.title || 'Finalização' }
            },
            programacaoNoturna: noturna,
            circuitoExperiencias: circuito
        };
    }, [sessions]);

    return { programacao, sessions, isLoading, loading: isLoading, error };
}
