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
    phone?: string;
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

// No longer needs specialized tables per project, as everything is now in the unified 'registrations' table
const PRIMARY_TABLE = 'registrations';

function mapRow(row: Record<string, any>, profile: Record<string, any> = {}): MyRegistration {
    // Rely on row data directly or profile join
    const name = row.name || row.nome || profile.name;
    const phone = row.phone || row.telefone || profile.phone;
    const email = profile.email; // email is not in registrations

    const ticketType = (row.ticket_type as string || '').toLowerCase();
    const isProType = ticketType === 'pro' || ticketType === 'vip';
    const statusPagamento = (row.payment_status as string || '').toLowerCase();
    const st = (row.status as string || '').toLowerCase();
    
    // Determine if actually paid
    const isActuallyPaid = statusPagamento === 'pago' || statusPagamento === 'paid' || 
                          st === 'pago' || st === 'paid' || st === 'ativo' || st === 'confirmado' ||
                          (row.is_paid === true);

    return {
        id: row.id as string,
        userId: (row.participant_id as string) || undefined,
        email: email || undefined,
        nome: name || undefined,
        name: name || undefined,
        phone: phone || undefined,
        tipoInscricao: row.ticket_type as string || undefined,
        ticketType: row.ticket_type as string || undefined,
        status: row.status as string || undefined,
        statusPagamento: row.payment_status as string || undefined,
        palestrasNoturnas: Boolean(row.night_lectures) || (isProType && isActuallyPaid),
        cursosSelecionados: Array.isArray(row.selected_courses)
            ? (row.selected_courses as string[])
            : [],
        valorPago: (row.final_amount as number) || (row.paid_amount as number) || 0,
        amount: (row.final_amount as number) || (row.amount as number) || 0,
        projectId: (row.project_id as string) || undefined,
        createdAt: (row.created_at as string) || undefined,
        isPaid: isActuallyPaid,
        photo: (row.photo_url as string) || undefined,
        checkedIn: Boolean(row.checked_in),
        checkInTime: (row.check_in_at as string) || undefined,
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
            // Field selection without join on auth.users (Standard compliant)
            const selectFields = '*';

            // 1) Find the project if not provided
            let targetProjectId = projectId;
            if (!targetProjectId) {
                const { data: latestReg } = await supabase
                    .from(PRIMARY_TABLE)
                    .select('project_id')
                    .eq('participant_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                
                if (latestReg) targetProjectId = (latestReg as any).project_id;
            }

            if (!targetProjectId) {
                setRegistration(null);
                return;
            }

            // 2) Fetch by participant_id (the new standard PK link)
            const { data, error: err } = await withTimeout(
                async (signal) => {
                    return await supabase
                        .from(PRIMARY_TABLE)
                        .select(selectFields)
                        .eq('project_id', targetProjectId)
                        .eq('participant_id', user.id)
                        .maybeSingle()
                        .abortSignal(signal);
                },
                10000,
                'FetchMyRegistration'
            );

            if (err) throw err;
            
            let registrationData = data ? mapRow(data) : null;

            // 3) Fetch profile separately as FK join is not available
            if (registrationData && user.id) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('name, phone, email, avatar_url')
                    .eq('user_id', user.id)
                    .maybeSingle();
                
                if (profileData) {
                    registrationData = mapRow(data, profileData);
                }
            }

            setRegistration(registrationData);
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

        const channelName = `my_registration_${registration.id}`;
        
        const channel = supabase.channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: PRIMARY_TABLE,
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
        const { error } = await supabase.from(PRIMARY_TABLE)
            .update({ selected_courses: cursoIds })
            .eq('id', registration.id);
        if (error) throw error;
        setRegistration(prev => prev ? { ...prev, cursosSelecionados: cursoIds } : prev);
    }, [registration?.id, projectId]);

    /** Marca check-in de entrada */
    const checkInEntrada = useCallback(async () => {
        if (!registration?.id || !projectId || !user) return;
        
        try {
            // 1. Update main registration
            await supabase.from(PRIMARY_TABLE).update({
                checked_in: true,
                check_in_at: new Date().toISOString()
            }).eq('id', registration.id);

            // 2. Registrar no log de check_ins
            await (supabase.from('check_ins' as never) as any).insert({
                project_id: projectId,
                registration_id: registration.id,
                participant_id: user.id, // Consistent with new naming
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
