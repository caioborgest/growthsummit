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
    couponCode?: string | null;
    empresa?: string | null;
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
            p_user_id: cleanUserId || null,
            p_name: params.name || '',
            p_email: (params.email || '').trim().toLowerCase(),
            p_phone: params.phone || '',
            p_cpf: params.cpf || '',
            p_session_ids: cleanSessionIds,
            p_tipo_inscricao: params.registrationType || 'standard',
            p_valor_pago: Number(params.paidAmount) || 0,
            p_status_pagamento: params.paymentStatus || (params.palestrasNoturnas ? 'pending' : 'paid'),
            p_status: params.status || (params.palestrasNoturnas ? 'pending' : 'active'),
            p_evento: params.eventName || 'Growth Experience',
            p_palestras_noturnas: Boolean(params.palestrasNoturnas),
            p_referral_type: inferredReferralType,
            p_referral_name: inferredReferralName,
            p_social_code: params.socialCode || null,
            p_lecture_code: params.palestraCode || null,
            p_extra_data: params.extraData || {},
            p_lote_id: cleanBatchId || null,
            p_company_voucher: params.companyVoucher || null,
            p_empresa: params.empresa || null,
            p_coupon_code: params.couponCode || null
        };

        logger.info('[registrationService] Executing RPC register_participant_with_slots:', {
            project: payload.p_project_id,
            user: payload.p_user_id,
            sessions: payload.p_session_ids.length,
            lote: payload.p_lote_id,
            voucher: payload.p_voucher_empresa,
            status: payload.p_status
        });

        console.debug('DEBUG - Registration Payload Keys:', Object.keys(payload));
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
        let query: any = supabase.from('growth_experience_registrations');
        
        // Select fields from registrations and join with users for contact info
        query = query.select(`
            id,
            project_id,
            user_id,
            name,
            email,
            phone,
            ticket_number,
            status,
            payment_status,
            paid_amount,
            checked_in,
            check_in_at,
            created_at,
            registration_type,
            qr_code,
            profiles(user_id, name, email, phone, company, city, state, role)
        `);
        
        query = query.eq('project_id', projectId);

        if (filters.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw error;
        
        // Flatten data to maintain compatibility with existing components
        return (data as any[]).map(reg => ({
            ...reg,
            name: reg.name || reg.profiles?.name || reg.users?.name,
            email: reg.email || reg.profiles?.email || reg.users?.email,
            phone: reg.phone || reg.profiles?.phone,
            company: reg.empresa || reg.profiles?.company,
            paid_amount: reg.paid_amount || reg.final_amount // Map amount to paid_amount for compatibility
        }));
    },

    /**
     * Gets a registration by ID
     */
    async getById(id: string) {
        const { data, error } = await supabase
            .from('growth_experience_registrations')
            .select(`
                id,
                project_id,
                user_id,
                name,
                email,
                phone,
                ticket_number,
                status,
                payment_status,
                paid_amount,
                checked_in,
                check_in_at,
                created_at,
                registration_type,
                qr_code,
                profiles(user_id, name, email, phone, company, city, state, role)
            `)
            .eq('id', id)
            .single();
            
        if (error) throw error;

        // Flatten data
        const reg = data as any;
        return {
            ...reg,
            name: reg.name || reg.profiles?.name || reg.users?.name,
            email: reg.email || reg.profiles?.email || reg.users?.email,
            phone: reg.phone || reg.profiles?.phone,
            company: reg.empresa || reg.profiles?.company,
            paid_amount: reg.paid_amount
        };
    },
    
    /**
     * Resolves a voucher code to its batch and applicable discount
     */
    async resolveVoucher(code: string, projectId: string) {
        const cleanCode = code.trim().toUpperCase();
        const { data, error } = await supabase
            .from('company_registration_batches')
            .select('*')
            .eq('voucher_code', cleanCode)
            .eq('project_id', projectId)
            .maybeSingle();

        if (error) {
            logger.error('[registrationService] Error resolving voucher:', error);
            throw error;
        }

        if (!data) return null;

        const isPaid = data.payment_status === 'paid';
        const hasSlots = data.used_slots < data.total_slots;

        return {
            ...data,
            isValid: isPaid && hasSlots,
            error: !isPaid ? 'Pagamento do lote pendente' : !hasSlots ? 'Limite de vagas do lote atingido' : null,
            // Dynamic discount: 30% if it's a batch and not specifically overridden
            discountPercentage: data.discount_percentage ?? 30 
        };
    },

    /**
     * Triggers the recalculation of coupon usage via RPC
     */
    async recalculateCouponUsage(projectId: string) {
        try {
            const { data, error } = await (supabase.rpc as any)('recalculate_coupon_usage', {
                p_project_id: projectId
            });
            if (error) throw error;
            return data;
        } catch (err) {
            logger.error('[registrationService] Failed to recalculate usage:', err);
            throw err;
        }
    },

    isValidUUID(id: any): id is string {
        return (
            typeof id === 'string' &&
            id.length === 36 &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        );
    },

    /**
     * Updates the app_installed flag for a registration
     */
    async updateAppInstalled(registrationId: string) {
        const { error } = await supabase
            .from('growth_experience_registrations')
            .update({ app_installed: true })
            .eq('id', registrationId);

        if (error) {
            logger.error('[registrationService] Error updating app_installed:', error);
            throw error;
        }
        return true;
    },

    /**
     * Resiliently finds a registration by user_id or email (case-insensitive)
     * and links the user_id if it was found via email fallback.
     */
    async findAndLinkRegistration(projectId: string, userId?: string, email?: string, retryCount = 0): Promise<any> {
        if (!projectId) return null;

        // Internal helper to perform the actual lookup
        const performQuery = async () => {
             // 1. Try search by user_id first (the strongest link)
             if (userId) {
            const { data: byUser, error: errUser } = await supabase
                .from('growth_experience_registrations')
                .select('*')
                .eq('project_id', projectId)
                .eq('user_id', userId)
                .in('status', ['active', 'pending', 'confirmed', 'pago', 'migrated', 'imported', 'ativo', 'concluida'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (errUser) logger.error('[registrationService] Error finding by user_id:', errUser);
            if (byUser) return byUser;
        }

        // 2. Fallback: Search by email (case-insensitive ILIKE), Ticket Number, or exact ID
        if (email) {
            const searchTerm = email.trim();
            const isUUID = this.isValidUUID(searchTerm);
            
            let fallbackQuery = supabase
                .from('growth_experience_registrations')
                .select('*')
                .eq('project_id', projectId);

            // Resilient lookup: try ID, Ticket Number, QR Code, then Email
            if (isUUID) {
                fallbackQuery = fallbackQuery.or(`id.eq."${searchTerm}",email.ilike."${searchTerm}"`);
            } else {
                fallbackQuery = fallbackQuery.or(`ticket_number.eq."${searchTerm}",qr_code.eq."${searchTerm}",email.ilike."${searchTerm}"`);
            }

            const { data: byFallback, error: errFallback } = await fallbackQuery
                .in('status', ['active', 'pending', 'confirmed', 'pago', 'migrated', 'imported', 'ativo', 'concluida'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (errFallback) logger.error('[registrationService] Error finding by fallback:', errFallback);
            
            if (byFallback) {
                // If found by fallback but missing user_id (or different), link it now
                if (userId && (!byFallback.user_id || byFallback.user_id !== userId)) {
                    logger.info(`[registrationService] Linking user ${userId} to registration ${byFallback.id} via fallback match.`);
                    const { error: updateErr } = await supabase
                        .from('growth_experience_registrations')
                        .update({ user_id: userId, updated_at: new Date().toISOString() })
                        .eq('id', byFallback.id);
                    
                    if (updateErr) logger.error('[registrationService] Failed to link userId:', updateErr);
                    else byFallback.user_id = userId; // Update local object
                }
                return byFallback;
            }
        }

        // 3. Last resort: Search by email across ALL projects (no project_id filter)
        // The platform has a single active project; this prevents false negatives from project ID misalignment.
        if (email) {
            logger.info(`[registrationService] Levels 1-2 missed. Trying global email lookup for: ${email}`);

            const { data: byGlobal, error: errGlobal } = await supabase
                .from('growth_experience_registrations')
                .select('*')
                .ilike('email', email.trim())
                .not('status', 'eq', 'cancelled')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (errGlobal) logger.error('[registrationService] Error finding by global email:', errGlobal);

            if (byGlobal) {
                logger.info(`[registrationService] Found registration ${byGlobal.id} (project ${byGlobal.project_id}) via global email fallback.`);

                // Link user_id if missing or different
                if (userId && (!byGlobal.user_id || byGlobal.user_id !== userId)) {
                    logger.info(`[registrationService] Linking user ${userId} to registration ${byGlobal.id} via global email match.`);
                    const { error: updateErr } = await supabase
                        .from('growth_experience_registrations')
                        .update({ user_id: userId, updated_at: new Date().toISOString() })
                        .eq('id', byGlobal.id);

                    if (updateErr) logger.error('[registrationService] Failed to link userId (global):', updateErr);
                    else byGlobal.user_id = userId;
                }
                return byGlobal;
            } else {
                logger.warn(`[registrationService] Global search for ${email} returned nothing.`);
            }
        }

        };

        const result = await performQuery();

        // If not found, and we haven't exhausted retries, wait and try again
        // This handles the race condition immediately after registration
        const MAX_RETRIES = 2;
        if (!result && retryCount < MAX_RETRIES) {
            const delay = 1000 * Math.pow(2, retryCount); // 1s, 2s
            logger.info(`[registrationService] Registration not found for ${email}. Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.findAndLinkRegistration(projectId, userId, email, retryCount + 1);
        }

        return result;
    }
};
