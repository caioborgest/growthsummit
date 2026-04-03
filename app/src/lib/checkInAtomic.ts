import { supabase } from '@/lib/supabase';

export type CheckInAtomicResult =
    | { ok: true }
    | { ok: false; duplicate: true }
    | { ok: false; duplicate: false; message: string };

/**
 * Credenciamento geral atômico: atualiza inscrição e insere log em uma transação (RPC).
 */
export async function checkInRegistrationAtomic(params: {
    registrationId: string;
    projectId: string;
    userId?: string | null;
    ticketNumber?: string | null;
    operatorId?: string | null;
    location?: string;
    method?: string;
}): Promise<CheckInAtomicResult> {
    const { data, error } = await (supabase as any).rpc('check_in_registration_atomic', {
        p_registration_id: params.registrationId,
        p_project_id: params.projectId,
        p_user_id: params.userId ?? null,
        p_ticket_number: params.ticketNumber ?? null,
        p_operator_id: params.operatorId ?? null,
        p_location: params.location ?? 'Entrada Principal',
        p_method: params.method ?? 'manual',
    });

    if (error) {
        return { ok: false, duplicate: false, message: error.message || 'Erro no credenciamento' };
    }

    const row = data as { success?: boolean; error?: string } | null;
    if (row?.success === true) {
        return { ok: true };
    }
    if (row?.error === 'ALREADY_CHECKED_IN') {
        return { ok: false, duplicate: true };
    }
    return {
        ok: false,
        duplicate: false,
        message: row?.error === 'NOT_FOUND' ? 'Inscrição não encontrada.' : row?.error || 'Credenciamento recusado.',
    };
}
