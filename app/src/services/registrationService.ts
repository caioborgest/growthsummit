import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { emailService } from './emailService';

export interface RegistrationParams {
    projectId: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    sessionIds: string[];
    registrationType?: string;
    paidAmount?: number;
    paymentStatus?: string;
    appInstalled?: boolean;
    batchId?: string | null;
    companyVoucher?: string | null;
    status?: string;
    eventName?: string;
    palestrasNoturnas?: boolean;
    tipoAtividade?: string | null;
    salaAtividade?: string | null;
    horarioAtividade?: string | null;
    nivelAtividade?: string | null;
    referralType?: string;
    referralName?: string | null;
    partnerId?: string | null;
    partnerAccessCode?: string | null;
    socialCode?: string | null;
    palestraCode?: string | null;
    extraData?: Record<string, unknown>;
}

export const registrationService = {
    /**
     * Validates registration data on the server (GDPR/Security).
     * Should be called before registerWithSlots.
     */
    async validateInscricaoData(nome: string, email: string, phone: string): Promise<{ valid: boolean; errorMessage?: string }> {
        try {
            const { data, error } = await (supabase.rpc as any)('validate_registration_data', {
                p_name: nome?.trim() || '',
                p_email: email?.trim() || '',
                p_phone: phone?.trim() || '',
            });

            // If function not found or cache error (PGRST), apply client-side fallback
            if (error && (error.code === 'PGRST202' || error.code === '404' || String(error.message).includes('Could not find'))) {
                logger.warn('[registrationService] Validation RPC not found. Using client-side fallback.');
                if (!nome || nome.trim().length < 3) return { valid: false, errorMessage: 'Full name is required.' };
                if (!email || !email.includes('@')) return { valid: false, errorMessage: 'Invalid email.' };
                if (!phone || phone.trim().length < 10) return { valid: false, errorMessage: 'Invalid phone number.' };
                return { valid: true };
            }

            if (error) throw error;
            const row = Array.isArray(data) ? data[0] : data;
            return { valid: !!row?.valid, errorMessage: row?.error_message || undefined };
        } catch (err) {
            logger.error('[registrationService] Validation error:', err);
            return {
                valid: false,
                errorMessage: 'Could not validate your data. Please check your connection and try again.',
            };
        }
    },

    /**
     * Performs an atomic registration checking for available slots.
     * Calls the 'register_participant_with_slots' RPC on Supabase.
     */
    async registerWithSlots(params: RegistrationParams) {
        // 👮 Strict UUID validation (8-4-4-4-12) to avoid 42883 'uuid = text' error
        const isValidUUID = registrationService.isValidUUID;

        // If projectId is not UUID, try to extract if it's an object or fail
        const cleanProjectId = isValidUUID(params.projectId) ? params.projectId : null;
        const cleanUserId = isValidUUID(params.userId) ? params.userId : null;
        const cleanBatchId = isValidUUID(params.batchId) ? params.batchId : null;
        const cleanPartnerId = isValidUUID(params.partnerId) ? params.partnerId : null;

        if (!cleanProjectId) {
            logger.error('[registrationService] Attempting registration with invalid projectId (not UUID):', params.projectId);
            throw new Error('Project identifier is invalid or temporary. Please wait for the page to finish loading.');
        }

        const cleanSessionIds = Array.isArray(params.sessionIds) 
            ? params.sessionIds.filter(id => isValidUUID(id))
            : [];

        const inferredReferralType = (params.socialCode || params.palestraCode) ? 'social' : 'nenhum';
        const inferredReferralName = params.socialCode || params.palestraCode || null;

        const payload = {
            p_project_id: cleanProjectId,
            p_participant_id: cleanUserId || null,
            p_name: params.name || '',
            p_email: (params.email || '').trim().toLowerCase(),
            p_phone: params.phone || '',
            p_cpf: params.cpf || '',
            p_session_ids: cleanSessionIds,
            p_registration_type: params.registrationType || 'standard',
            p_paid_amount: Number(params.paidAmount) || 0,
            p_payment_status: params.paymentStatus || (params.palestrasNoturnas ? 'pending' : 'paid'),
            p_status: params.status || (params.palestrasNoturnas ? 'pending' : 'active'),
            p_event_name: params.eventName || 'Growth Experience',
            p_night_lectures: Boolean(params.palestrasNoturnas),
            p_activity_type: params.tipoAtividade || null,
            p_activity_room: params.salaAtividade || null,
            p_activity_schedule: params.horarioAtividade || null,
            p_activity_level: params.nivelAtividade || null,
            p_referral_type: inferredReferralType,
            p_referral_name: inferredReferralName,
            p_social_code: params.socialCode || null,
            p_lecture_code: params.palestraCode || null,
            p_extra_data: params.extraData || {},
            p_batch_id: cleanBatchId || null,
            p_company_voucher: params.companyVoucher || null,
            p_partner_id: cleanPartnerId || null,
            p_app_installed: Boolean(params.appInstalled),
        };

        logger.info('[registrationService] Executing RPC register_participant_with_slots:', {
            project: payload.p_project_id,
            participant: payload.p_participant_id,
            sessions: payload.p_session_ids.length,
            batch: payload.p_batch_id,
            type: payload.p_registration_type
        });

        try {
            const { data, error } = await (supabase.rpc as any)(
                'register_participant_with_slots',
                payload
            );

            if (error) {
                logger.error('[registrationService] RPC Error:', error);
                throw error;
            }

            // Send Welcome e-mail (Resend Automation)
            if (params.email && params.name) {
                emailService.sendWelcome(params.email, params.name).catch(e => logger.warn('[registrationService] Error sending welcome email:', e));
            }

            // If partner registration, link in the team table (RPC validates access_code and limit)
            const rpcPayload = data as { success?: boolean; registration_id?: string };
            if (cleanPartnerId && rpcPayload?.success !== false) {
                const regId = rpcPayload?.registration_id;
                const partnerQR = `GE-PARTNER|${regId || cleanUserId || 'new'}|${Date.now()}`;
                try {
                    const { data: peData, error: peErr } = await (supabase.rpc as any)('register_parceiro_equipe_member', {
                        p_partner_id: cleanPartnerId,
                        p_partner_access_code: params.partnerAccessCode ?? null,
                        p_project_id: cleanProjectId,
                        p_user_id: cleanUserId,
                        p_name: params.name,
                        p_email: params.email,
                        p_phone: params.phone,
                        p_cpf: params.cpf,
                        p_qr_code: partnerQR,
                    });
                    if (peErr) throw peErr;
                    const row = typeof peData === 'object' && peData !== null ? peData : {};
                    if (!(row as { success?: boolean }).success) {
                        logger.warn('[registrationService] Partner team RPC returned failure:', peData);
                    } else {
                        logger.info(`[registrationService] Link with partner ${cleanPartnerId} created successfully.`);
                    }
                } catch (peErr) {
                    logger.error('[registrationService] Error creating link with partner team:', peErr);
                }
            }

            return data;
        } catch (err) {
            logger.error('[registrationService] Critical error while registering:', err);
            throw err;
        }
    },

    /**
     * Lists registrations by project and optional filters
     */
    async listByProject(projectId: string, filters: { email?: string; status?: string } = {}) {
        let query: any = supabase.from('registrations');
        
        // Select fields from registrations and join with users for contact info
        query = query.select(`
            id,
            project_id,
            participant_id,
            ticket_number,
            status,
            payment_status,
            final_amount,
            checked_in,
            check_in_at,
            created_at,
            ticket_type,
            qr_code,
            profiles (
                name,
                phone
            )
        `);
        
        query = query.eq('project_id', projectId);

        if (filters.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw error;
        
        // Flatten data to maintain compatibility with existing components
        return (data as any[]).map(reg => ({
            ...reg,
            name: reg.profiles?.name,
            phone: reg.profiles?.phone,
            paid_amount: reg.final_amount // Map final_amount to paid_amount for compatibility
        }));
    },

    /**
     * Gets a registration by ID
     */
    async getById(id: string) {
        const { data, error } = await supabase
            .from('registrations')
            .select(`
                id,
                project_id,
                participant_id,
                ticket_number,
                status,
                payment_status,
                final_amount,
                checked_in,
                check_in_at,
                created_at,
                ticket_type,
                qr_code,
                qr_code_data,
                profiles (
                    name,
                    phone
                )
            `)
            .eq('id', id)
            .single();
            
        if (error) throw error;

        // Flatten data
        const reg = data as any;
        return {
            ...reg,
            name: reg.profiles?.name,
            phone: reg.profiles?.phone,
            paid_amount: reg.final_amount
        };
    },
    isValidUUID(id: any): id is string {
        return (
            typeof id === 'string' &&
            id.length === 36 &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        );
    }
};
