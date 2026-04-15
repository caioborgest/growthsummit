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
import { registrationService } from '@/services/registrationService';
import { safeParseJsonArray } from '@/lib/dataUtils';

const PRIMARY_TABLE = 'growth_experience_registrations';

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
    isFree?: boolean;
    photo?: string;
    checkedIn?: boolean;
    checkInTime?: string;
    couponCode?: string;
    companyRegistrationBatches?: {
        company_name: string;
        ticket_type: string;
        batch_name: string;
        payment_status: string;
    };
    empresa?: string;
    company?: string;
}

// Helper to identify Growth Experience projects
const isGEProject = (projectId: string | undefined): boolean => {
    if (!projectId) return false;
    // Standard GE UUIDs
    if (projectId === 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' ||
        projectId === '94ef1840-1ce4-4f6d-a31b-1b0232f13fe9') return true;

    // Check localStorage for current project slug
    try {
        const selected = localStorage.getItem('selectedProject');
        if (selected) {
            const p = JSON.parse(selected);
            if (p.id === projectId || p.slug === projectId) {
                const slug = (p.slug || '').toLowerCase();
                return slug.startsWith('ge-') || slug.startsWith('growth-') || slug.includes('triunfo') || slug.includes('petrolina');
            }
        }
    } catch { /* ignore */ }
    return false;
};

const getPrimaryTable = (projectId: string | undefined) => {
    return isGEProject(projectId) ? 'growth_experience_registrations' : 'registrations';
};

function mapRow(row: Record<string, any>, profile: Record<string, any> = {}): MyRegistration {
    // Rely on row data directly or profile join
    const name = row.name || row.nome || profile.name;
    const phone = row.phone || row.telefone || row.whatsapp || profile.phone;
    const email = row.email || profile.email; // email is in registrations now

    const ticketType = ((row.registration_type || row.ticket_type) as string || '').toLowerCase();
    const isProType = ticketType === 'pro' || ticketType === 'vip';
    const statusPagamento = (row.payment_status as string || '').toLowerCase();
    const st = (row.status as string || '').toLowerCase();

    // Determine if actually paid (individual or corporate batch status)
    const batchStatus = (row.company_registration_batches?.payment_status as string || '').toLowerCase();

    // 1. Explicit payment on individual registration
    const isDirectlyPaid = statusPagamento === 'paid' ||
        st === 'paid' || st === 'active' || st === 'confirmado' ||
        (row.is_paid === true);

    // 2. Paid via corporate batch (voucher code)
    const isPaidViaBatch = batchStatus === 'paid';

    // 3. 100% Discount / Free logic: If amount is 0 and status is confirmed/active
    const amount = (row.paid_amount as number) || (row.amount as number) || (row.final_amount as number) || 0;
    const isFreeOrCouponPaid = amount === 0 && (st === 'active' || st === 'confirmado' || st === 'pago' || st === 'paid');

    const isActuallyPaid = isDirectlyPaid || isPaidViaBatch || isFreeOrCouponPaid;

    return {
        id: row.id as string,
        userId: (row.user_id as string) || (row.participant_id as string) || undefined,
        email: email || undefined,
        nome: name || undefined,
        name: name || undefined,
        phone: phone || undefined,
        tipoInscricao: (row.registration_type || row.ticket_type) as string || undefined,
        ticketType: (row.registration_type || row.ticket_type) as string || undefined,
        status: row.status as string || undefined,
        statusPagamento: row.payment_status as string || undefined,
        palestrasNoturnas: Boolean(row.night_lectures) || (isProType && isActuallyPaid),
        cursosSelecionados: safeParseJsonArray(row.selected_courses),
        valorPago: (row.paid_amount as number) || (row.final_amount as number) || 0,
        amount: (row.paid_amount as number) || (row.amount as number) || (row.final_amount as number) || 0,
        projectId: (row.project_id as string) || undefined,
        createdAt: (row.created_at as string) || undefined,
        isPaid: isActuallyPaid,
        isFree: isFreeOrCouponPaid,
        photo: (row.photo_url as string) || undefined,
        checkedIn: Boolean(row.checked_in),
        checkInTime: (row.check_in_at as string) || undefined,
        couponCode: row.coupon_code || undefined,
        companyRegistrationBatches: row.company_registration_batches || undefined,
        empresa: row.empresa || undefined,
        company: row.empresa || undefined,
    };
}

export function useMyRegistration() {
    const { user } = useAuth();
    const { projectId } = useProject();
    const [registration, setRegistration] = useState<MyRegistration | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start true to avoid flash of "not found"
    const [error, setError] = useState<string | null>(null);

    const fetchRegistration = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            // 1) Find the project if not provided
            let targetProjectId = projectId;
            if (!targetProjectId) {
                // Try finding by user_id
                const { data: latestReg } = await supabase
                    .from(PRIMARY_TABLE)
                    .select('project_id')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (latestReg) {
                    targetProjectId = (latestReg as { project_id: string }).project_id;
                } else if (user.email) {
                    // Fallback to email search across all GE projects if not found by user_id
                    const { data: emailReg } = await supabase
                        .from(PRIMARY_TABLE)
                        .select('project_id')
                        .eq('email', user.email)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();
                    if (emailReg) targetProjectId = (emailReg as { project_id: string }).project_id;
                }
            }

            if (!targetProjectId) {
                setRegistration(null);
                return;
            }

            const currentTable = getPrimaryTable(targetProjectId);

            // 2) Fetch resiliently using the service (handles user_id, email fallback, and auto-linking)
            const data = await registrationService.findAndLinkRegistration(
                targetProjectId,
                user.id,
                user.email
            );

            let registrationData = data ? mapRow(data) : null;

            // 3) Fetch profile separately as FK join is not available
            if (registrationData && user.id) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('phone, company, position, city, state') // Only select valid columns from public.profiles
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (profileData) {
                    // Update registration data with profile info if missing
                    if (profileData.phone && !registrationData.phone) registrationData.phone = profileData.phone;
                    if (profileData.company && !registrationData.company) registrationData.company = profileData.company;
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
                    table: getPrimaryTable(projectId),
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

    const updateCursos = useCallback(async (cursoIds: string[]) => {
        if (!registration?.id || !projectId) return;
        const currentTable = getPrimaryTable(projectId);
        const { error } = await supabase.from(currentTable)
            .update({ selected_courses: cursoIds })
            .eq('id', registration.id);
        if (error) throw error;
        setRegistration(prev => prev ? { ...prev, cursosSelecionados: cursoIds } : prev);
    }, [registration?.id, projectId]);

    /** Marca check-in de entrada */
    const checkInEntrada = useCallback(async () => {
        if (!registration?.id || !projectId || !user) return;

        try {
            const currentTable = getPrimaryTable(projectId);

            // 1. Update main registration
            await supabase.from(currentTable).update({
                checked_in: true,
                check_in_at: new Date().toISOString()
            }).eq('id', registration.id);

            // 2. Registrar no log de check_ins
            await (supabase.from('check_ins') as any).insert({
                project_id: projectId,
                registration_id: registration.id,
                user_id: user.id, // Consistent with new naming
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
