/**
 * useMyRegistration
 * Busca a inscrição do usuário logado na tabela correta do projeto.
 * Usa user_id como match primário; email como fallback (para inscrições antigas).
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';
import { withTimeout } from '@/lib/promiseUtils';

export interface MyRegistration {
    id: string;
    userId?: string;
    email?: string;
    nome?: string;
    name?: string;
    telefone?: string;
    tipoInscricao?: string;
    ticketType?: string;
    status?: string;
    statusPagamento?: string;
    palestrasNoturnas?: boolean;
    cursosSelecionados?: string[];
    valorPago?: number;
    amount?: number;
    checkedIn?: boolean;
    projectId?: string;
    createdAt?: string;
}

const GE_TABLES: Record<string, string> = {
    'ge-triunfo-2026': 'inscricoes_growth_experience',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890': 'inscricoes_growth_experience',
    'ge-petrolina-2026': 'inscricoes_growth_experience',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901': 'inscricoes_growth_experience',
};

function getTable(projectId: string): string {
    return GE_TABLES[projectId] || 'inscricoes_growth_experience';
}

function mapRow(row: Record<string, unknown>): MyRegistration {
    return {
        id: row['id'] as string,
        userId: (row['user_id'] as string) || undefined,
        email: (row['email'] as string) || undefined,
        nome: (row['nome'] as string) || undefined,
        name: (row['nome'] as string) || undefined,
        telefone: (row['telefone'] as string) || undefined,
        tipoInscricao: (row['tipo_inscricao'] as string) || undefined,
        ticketType: (row['tipo_inscricao'] as string) || undefined,
        status: (row['status'] as string) || undefined,
        statusPagamento: (row['status_pagamento'] as string) || undefined,
        palestrasNoturnas: Boolean(row['palestras_noturnas']),
        cursosSelecionados: Array.isArray(row['cursos_selecionados'])
            ? (row['cursos_selecionados'] as string[])
            : [],
        valorPago: (row['valor_pago'] as number) || 0,
        amount: (row['valor_pago'] as number) || 0,
        checkedIn: Boolean(row['checked_in']),
        projectId: (row['project_id'] as string) || undefined,
        createdAt: (row['created_at'] as string) || undefined,
    };
}

export function useMyRegistration() {
    const { user } = useAuth();
    const { projectId } = useProject();
    const [registration, setRegistration] = useState<MyRegistration | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRegistration = useCallback(async () => {
        if (!user || !projectId) return;

        setIsLoading(true);
        setError(null);

        try {
            const table = getTable(projectId);
            const fields = 'id,project_id,user_id,nome,email,telefone,tipo_inscricao,status,status_pagamento,valor_pago,palestras_noturnas,cursos_selecionados,checked_in,created_at';

            // 1) Tenta por user_id
            let { data, error: err } = await withTimeout(
                (supabase.from(table as never).select(fields) as any)
                    .eq('project_id', projectId)
                    .eq('user_id', user.id)
                    .maybeSingle(),
                10000,
                'FetchMyRegistration_userId'
            );

            // 2) Fallback por email
            if (!data && user.email) {
                const result = await withTimeout(
                    (supabase.from(table as never).select(fields) as any)
                        .eq('project_id', projectId)
                        .eq('email', user.email)
                        .maybeSingle(),
                    10000,
                    'FetchMyRegistration_email'
                );
                data = result.data;
                err = result.error;

                // Se encontrou por email mas sem user_id, vincular
                if (data && !(data as any).user_id) {
                    await (supabase.from(table as never) as any)
                        .update({ user_id: user.id })
                        .eq('id', (data as any).id)
                        .catch(() => { });
                }
            }

            if (err) throw err;
            setRegistration(data ? mapRow(data as Record<string, unknown>) : null);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao buscar inscrição';
            logger.error('[useMyRegistration]', err);
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [user, projectId]);

    useEffect(() => {
        fetchRegistration();
    }, [fetchRegistration]);

    /** Atualiza os cursos selecionados */
    const updateCursos = useCallback(async (cursoIds: string[]) => {
        if (!registration?.id || !projectId) return;
        const table = getTable(projectId);
        const { error } = await (supabase.from(table as never) as any)
            .update({ cursos_selecionados: cursoIds })
            .eq('id', registration.id);
        if (error) throw error;
        setRegistration(prev => prev ? { ...prev, cursosSelecionados: cursoIds } : prev);
    }, [registration?.id, projectId]);

    /** Marca check-in de entrada */
    const checkInEntrada = useCallback(async () => {
        if (!registration?.id || !projectId || !user) return;
        const table = getTable(projectId);
        const { error } = await (supabase.from(table as never) as any)
            .update({ checked_in: true, check_in_at: new Date().toISOString() })
            .eq('id', registration.id);
        if (error) throw error;

        // Registrar no log de check_ins
        await (supabase.from('check_ins' as never) as any).insert({
            project_id: projectId,
            registration_id: registration.id,
            user_id: user.id,
            user_name: registration.nome || user.name,
            ticket_number: registration.id.split('-')[0].toUpperCase(),
            timestamp: new Date().toISOString(),
            location: 'Entrada',
            method: 'qr_scan',
        }).catch(() => { });

        setRegistration(prev => prev ? { ...prev, checkedIn: true } : prev);
    }, [registration, projectId, user]);

    return { registration, isLoading, error, refetch: fetchRegistration, updateCursos, checkInEntrada };
}
