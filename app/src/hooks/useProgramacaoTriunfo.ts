import { useSessions } from '@/hooks/useData';
import { useMemo } from 'react';
import type { Session } from '@/types';

export function useProgramacaoTriunfo() {
    const { data: sessions, isLoading, error } = useSessions();

    const programacao = useMemo(() => {
        const transformAtividade = (s: Session) => ({
            id: s.id,
            horario: s.startTime,
            titulo: s.title,
            tipo: s.type,
            capacidade: s.maxCapacity,
            inscritos: s.registeredCount || 0,
            topicos: s.topics || [],
            local: s.room
        });

        const filterByCategory = (cat: string) => sessions.filter(s => s.category === cat).sort((a, b) => a.startTime.localeCompare(b.startTime));

        // Momentos Âncora
        const manhaAncora = filterByCategory('manha_ancora').map(s => ({
            horario: s.startTime,
            atividade: s.title,
            local: s.room || 'Espaço Parque'
        }));

        const tardeAncora = filterByCategory('tarde_ancora').map(s => ({
            horario: s.startTime,
            atividade: s.title,
            local: s.room || 'Espaço Parque'
        }));

        // Diurna Manhã
        const b1_sessions = filterByCategory('manha_bloco_1');
        const b1_salao = b1_sessions.find(s => s.room?.toLowerCase().includes('salao') || s.room?.toLowerCase().includes('principal'));
        const b1_salas = b1_sessions.filter(s => s !== b1_salao).map((s, idx) => ({ ...transformAtividade(s), numero: idx + 1 }));

        const b2_sessions = filterByCategory('manha_bloco_2');
        const b2_salao = b2_sessions.find(s => s.room?.toLowerCase().includes('salao') || s.room?.toLowerCase().includes('principal'));
        const b2_salas = b2_sessions.filter(s => s !== b2_salao).map((s, idx) => ({ ...transformAtividade(s), numero: idx + 1 }));

        const circ1 = filterByCategory('manha_circulacao')[0];
        const enc_manha = filterByCategory('manha_encerramento')[0];

        // Diurna Tarde
        const b3_sessions = filterByCategory('tarde_bloco_3');
        const b3_salao = b3_sessions.find(s => s.room?.toLowerCase().includes('salao') || s.room?.toLowerCase().includes('principal'));
        const b3_salas = b3_sessions.filter(s => s !== b3_salao).map((s, idx) => ({ ...transformAtividade(s), numero: idx + 1 }));

        const b4_sessions = filterByCategory('tarde_bloco_4');
        const b4_salao = b4_sessions.find(s => s.room?.toLowerCase().includes('salao') || s.room?.toLowerCase().includes('principal'));
        const b4_salas = b4_sessions.filter(s => s !== b4_salao).map((s, idx) => ({ ...transformAtividade(s), numero: idx + 1 }));

        const circ2 = filterByCategory('tarde_circulacao')[0];
        const enc_tarde = filterByCategory('tarde_encerramento')[0];

        // Noturna
        const noturna = filterByCategory('noturna').map(s => ({
            horario: s.startTime,
            atividade: s.title
        }));

        // Circuito
        const circuito = filterByCategory('circuito').map(s => ({
            nome: s.title,
            subtitulo: s.description,
            parceiro: s.partner || 'Growth Experience',
            tempo: s.metadata?.tempo || '10-15 min',
            temas: s.topics || [],
            cor: s.color || 'orange',
            icon: () => null, // Placeholder fixed below
            formato: s.type,
            capacidade: s.maxCapacity?.toString() || '300/dia',
            totalDia: s.metadata?.totalDia || 'Contínuo',
        }));

        // Default structure to avoid crashes if empty
        return {
            momentosAncora: { manha: manhaAncora, tarde: tardeAncora },
            programacaoManha: {
                bloco1: { horario: b1_salao?.startTime || '08:30', titulo: b1_salao?.title || 'Bloco 1', salao: b1_salao ? transformAtividade(b1_salao) : undefined, salas: b1_salas },
                circulacao1: { horario: circ1?.startTime || '10:00', atividade: circ1?.title || 'Networking' },
                bloco2: { horario: b2_salao?.startTime || '10:15', titulo: b2_salao?.title || 'Bloco 2', salao: b2_salao ? transformAtividade(b2_salao) : undefined, salas: b2_salas },
                encerramento: { horario: enc_manha?.startTime || '11:45', atividade: enc_manha?.title || 'Almoço' }
            },
            programacaoTarde: {
                bloco3: { horario: b3_salao?.startTime || '14:00', titulo: b3_salao?.title || 'Bloco 3', salao: b3_salao ? transformAtividade(b3_salao) : undefined, salas: b3_salas },
                circulacao2: { horario: circ2?.startTime || '15:30', atividade: circ2?.title || 'Networking' },
                bloco4: { horario: b4_salao?.startTime || '15:45', titulo: b4_salao?.title || 'Bloco 4', salao: b4_salao ? transformAtividade(b4_salao) : undefined, salas: b4_salas },
                encerramento: { horario: enc_tarde?.startTime || '17:15', atividade: enc_tarde?.title || 'Finalização' }
            },
            programacaoNoturna: noturna,
            circuitoExperiencias: circuito
        };
    }, [sessions]);

    return { programacao, isLoading, error };
}
