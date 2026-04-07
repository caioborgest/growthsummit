import { supabase } from '@/lib/supabase';

export type CheckInAtomicResult =
    | { ok: true }
    | { ok: false; duplicate: true }
    | { ok: false; duplicate: false; message: string };

/**
 * Credenciamento geral atômico: atualiza inscrição e insere log em uma transação (RPC).
 * Agora suporta 'check-in' e 'check-out' para múltiplas entradas e saídas.
 */
export async function toggleCheckInRegistrationAtomic(params: {
    registrationId: string;
    projectId: string;
    action: 'check-in' | 'check-out';
    userId?: string | null;
    ticketNumber?: string | null;
    operatorId?: string | null;
    location?: string;
    method?: string;
}): Promise<CheckInAtomicResult> {
    const { data, error } = await (supabase as any).rpc('toggle_registration_checkin_atomic', {
        p_registration_id: params.registrationId,
        p_project_id: params.projectId,
        p_action: params.action,
        p_user_id: params.userId ?? null,
        p_ticket_number: params.ticketNumber ?? null,
        p_operator_id: params.operatorId ?? null,
        p_location: params.location || (params.action === 'check-out' ? 'Saída Evento' : 'Entrada Evento'),
        p_method: params.method ?? 'qr_code',
    });

    if (error) {
        return { ok: false, duplicate: false, message: error.message || 'Erro no processo de check-in/out' };
    }

    const row = data as { success?: boolean; error?: string; action?: string; checked_in?: boolean } | null;
    
    if (row?.success === true) {
        return { ok: true };
    }
    
    return {
        ok: false,
        duplicate: row?.error === 'ALREADY_CHECKED_IN',
        message: row?.error === 'NOT_FOUND' ? 'Inscrição não encontrada.' : row?.message || 'Ação recusada.',
    };
}

/**
 * Legacy wrapper: calls the toggle function as a 'check-in'
 */
export async function checkInRegistrationAtomic(params: any): Promise<CheckInAtomicResult> {
    return toggleCheckInRegistrationAtomic({ ...params, action: 'check-in' });
}
