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
    projectId?: string;
    createdAt?: string;
    isPaid?: boolean;
    photo?: string;
    checkedIn?: boolean;
    checkInTime?: string;
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
    const isProType = (row['tipo_inscricao'] as string || '').toLowerCase() === 'pro' || (row['tipo_inscricao'] as string || '').toLowerCase() === 'vip';
    const statusPagamento = (row['status_pagamento'] as string || '').toLowerCase();
    const st = (row['status'] as string || '').toLowerCase();
    
    // Determine if actually paid
    const isActuallyPaid = statusPagamento === 'pago' || statusPagamento === 'paid' || 
                          st === 'pago' || st === 'paid' || st === 'ativo' || st === 'confirmado' ||
                          (row['is_paid'] === true);

    return {
        id: row['id'] as string,
        userId: (row['user_id'] as string) || undefined,
        email: (row['email'] as string) || undefined,
        nome: (row['nome'] as string) || (row['name'] as string) || undefined,
        name: (row['nome'] as string) || (row['name'] as string) || undefined,
        telefone: (row['telefone'] as string) || undefined,
        tipoInscricao: (row['tipo_inscricao'] as string) || undefined,
        ticketType: (row['tipo_inscricao'] as string) || undefined,
        status: (row['status'] as string) || undefined,
        statusPagamento: (row['status_pagamento'] as string) || undefined,
        // Pro if explicitly true OR if it's a Pro ticket and it's paid
        palestrasNoturnas: Array.isArray(row['palestras_noturnas'])
            ? row['palestras_noturnas'].length > 0
            : Boolean(row['palestras_noturnas']) || 
              (isProType && isActuallyPaid) || 
              ((row['project_id'] === 'ge-triunfo-2026' || row['project_id'] === 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') && isActuallyPaid),
        cursosSelecionados: Array.isArray(row['cursos_selecionados'])
            ? (row['cursos_selecionados'] as string[])
            : [],
        valorPago: (row['valor_pago'] as number) || 0,
        amount: (row['valor_pago'] as number) || 0,
        projectId: (row['project_id'] as string) || undefined,
        createdAt: (row['created_at'] as string) || undefined,
        isPaid: isActuallyPaid,
        photo: (row['foto_url'] as string) || (row['photo_url'] as string) || undefined,
        checkedIn: Boolean(row['checked_in']),
        checkInTime: (row['check_in_at'] as string) || undefined,
    };
}

export function useMyRegistration() {
    const { user } = useAuth();
    const { projectId } = useProject();
    const [registration, setRegistration] = useState<MyRegistration | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRegistration = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            // Se não tiver projectId, tenta descobrir o projeto mais recente do usuário
            let targetProjectId = projectId;
            
            if (!targetProjectId) {
                const { data: latestReg } = await supabase
                    .from('inscricoes_growth_experience')
                    .select('project_id')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                
                if (latestReg) {
                    targetProjectId = latestReg.project_id;
                } else {
                    // Tenta por email
                    const { data: emailReg } = await supabase
                        .from('inscricoes_growth_experience')
                        .select('project_id')
                        .eq('email', user.email)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();
                    if (emailReg) targetProjectId = emailReg.project_id;
                }
            }

            if (!targetProjectId) {
                setRegistration(null);
                return;
            }

            const table = getTable(targetProjectId);
            const fields = 'id,project_id,user_id,nome,email,telefone,tipo_inscricao,status,status_pagamento,valor_pago,palestras_noturnas,cursos_selecionados,created_at';

            // 1) Tenta por user_id
            let { data, error: err } = (await withTimeout(
                async (signal) => {
                    const q = (supabase.from(table as never).select(fields) as any)
                        .eq('project_id', targetProjectId)
                        .eq('user_id', user.id)
                        .maybeSingle();
                    return await (q as any).abortSignal(signal);
                },
                10000,
                'FetchMyRegistration_userId'
            )) as { data: any; error: any };

            // 2) Fallback por email
            if (!data && user.email) {
                const result = (await withTimeout(
                    async (signal) => {
                        const q = (supabase.from(table as never).select(fields) as any)
                            .eq('project_id', targetProjectId)
                            .eq('email', user.email)
                            .maybeSingle();
                        return await (q as any).abortSignal(signal);
                    },
                    10000,
                    'FetchMyRegistration_email'
                )) as { data: any; error: any };
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

    // 1. Efeito para buscar a inscrição inicial
    useEffect(() => {
        // Se não tiver user, não tem o que buscar.
        // Mas se tiver user e não tiver projectId, podemos tentar buscar a ultima inscrição dele em QUALQUER projeto GE
        if (!user) {
            setRegistration(null);
            return;
        }
        
        // Refetch inicial
        fetchRegistration();

        // Refetch ao focar na janela (volta para o app)
        const handleFocus = () => {
            logger.debug('[useMyRegistration] Window focused, refetching...');
            fetchRegistration();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user, projectId, fetchRegistration]);

    // 2. Efeito para subscrição em tempo real (apenas se tiver registration.id)
    useEffect(() => {
        if (!user || !projectId || !registration?.id) return;

        const table = getTable(projectId);
        const channelName = `my_registration_${registration.id}`;
        
        const channel = supabase.channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: table,
                    filter: `id=eq.${registration.id}`
                },
                (payload) => {
                    if (payload.new) {
                        setRegistration(mapRow(payload.new as Record<string, unknown>));
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    logger.debug(`[useMyRegistration] Subscribed to ${channelName}`);
                }
            });

        return () => {
            if (channel) {
                // Tenta remover o canal de forma segura
                supabase.removeChannel(channel).catch(err => {
                    // Ignora erro de WebSocket closed if it's already dying
                    if (err.message?.includes('WebSocket')) {
                        logger.debug('[useMyRegistration] Ignoring expected WebSocket close error during cleanup');
                    } else {
                        logger.warn('[useMyRegistration] Error removing channel:', err);
                    }
                });
            }
        };
    }, [user, projectId, registration?.id]);

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

        try {
            // 1. Atualizar registro principal para marcar como presente
            // Tentamos os dois nomes possíveis para a coluna para maior segurança
            await (supabase.from(table as never) as any).update({
                checked_in: true,
                check_in_at: new Date().toISOString()
            }).eq('id', registration.id);

            // 2. Registrar no log de check_ins
            await (supabase.from('check_ins' as never) as any).insert({
                project_id: projectId,
                registration_id: registration.id,
                user_id: user.id,
                user_name: registration.nome || user.name,
                ticket_number: registration.id.split('-')[0].toUpperCase(),
                timestamp: new Date().toISOString(),
                location: 'Entrada Principal (Auto)',
                method: 'self_scan',
            }).catch(() => { });

            // 3. Atualizar estado local
            setRegistration(prev => prev ? { ...prev, checkedIn: true, checkInTime: new Date().toISOString() } : prev);
        } catch (err) {
            logger.error('[useMyRegistration] Erro no checkInEntrada:', err);
            throw err;
        }
    }, [registration, projectId, user]);

    return { registration, isLoading, error, refetch: fetchRegistration, updateCursos, checkInEntrada };
}
