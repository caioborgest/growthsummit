import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { emailService } from './emailService';

export interface RegistrationParams {
    projectId: string;
    userId: string;
    nome: string;
    email: string;
    phone: string;
    cpf: string;
    sessionIds: string[];
    tipoInscricao?: string;
    valorPago?: number;
    statusPagamento?: string;
    appInstalado?: boolean;
    loteId?: string | null;
    voucherEmpresa?: string | null;
    status?: string;
    evento?: string;
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
     * Valida dados da inscrição no servidor (LGPD/segurança).
     * Deve ser chamado antes de registerWithSlots.
     */
    async validateInscricaoData(nome: string, email: string, phone: string): Promise<{ valid: boolean; errorMessage?: string }> {
        try {
            const { data, error } = await (supabase.rpc as any)('validate_inscricao_dados', {
                p_nome: nome?.trim() || '',
                p_email: email?.trim() || '',
                p_telefone: phone?.trim() || '',
            });

            // Se der erro de função não encontrada ou cache (PGRST), aplicamos fallback cliente
            if (error && (error.code === 'PGRST202' || error.code === '404' || String(error.message).includes('Could not find'))) {
                logger.warn('[registrationService] RPC de validação não encontrada. Usando fallback no client-side.');
                if (!nome || nome.trim().length < 3) return { valid: false, errorMessage: 'Nome completo é obrigatório.' };
                if (!email || !email.includes('@')) return { valid: false, errorMessage: 'E-mail inválido.' };
                if (!phone || phone.trim().length < 10) return { valid: false, errorMessage: 'Telefone inválido.' };
                return { valid: true };
            }

            if (error) throw error;
            const row = Array.isArray(data) ? data[0] : data;
            return { valid: !!row?.valid, errorMessage: row?.error_message || undefined };
        } catch (err) {
            logger.error('[registrationService] Erro na validação:', err);
            return {
                valid: false,
                errorMessage: 'Não foi possível validar seus dados. Verifique a conexão e tente novamente.',
            };
        }
    },

    /**
     * Realiza uma inscrição atômica verificando disponibilidade de vagas.
     * Chama a função RPC 'register_participant_with_slots' no Supabase.
     */
    async registerWithSlots(params: RegistrationParams) {
        // 👮 Validação rigorosa de UUID (8-4-4-4-12) para evitar erro 42883 'uuid = text'
        const isValidUUID = registrationService.isValidUUID;

        // Se projectId não for UUID, tenta extrair se for um objeto ou falha
        const cleanProjectId = isValidUUID(params.projectId) ? params.projectId : null;
        const cleanUserId = isValidUUID(params.userId) ? params.userId : null;
        const cleanLoteId = isValidUUID(params.loteId) ? params.loteId : null;
        const cleanPartnerId = isValidUUID(params.partnerId) ? params.partnerId : null;

        if (!cleanProjectId) {
            logger.error('[registrationService] Tentativa de registro com projectId inválido (não UUID):', params.projectId);
            throw new Error('Identificador do projeto é inválido ou temporário. Por favor, aguarde o carregamento completo da página.');
        }

        const cleanSessionIds = Array.isArray(params.sessionIds) 
            ? params.sessionIds.filter(id => isValidUUID(id))
            : [];

        const payload = {
            p_project_id: cleanProjectId,
            p_user_id: cleanUserId || null,
            p_nome: params.nome || '',
            p_email: (params.email || '').trim().toLowerCase(),
            p_telefone: params.phone || '',
            p_cpf: params.cpf || '',
            p_session_ids: cleanSessionIds,
            p_registration_type: params.tipoInscricao || 'standard',
            p_paid_amount: Number(params.valorPago) || 0,
            p_payment_status: params.statusPagamento || (params.palestrasNoturnas ? 'pendente' : 'pago'),
            p_status: params.status || (params.palestrasNoturnas ? 'pendente' : 'ativo'),
            p_evento: params.evento || 'Growth Experience',
            p_palestras_noturnas: Boolean(params.palestrasNoturnas),
            p_tipo_atividade: params.tipoAtividade || null,
            p_sala_atividade: params.salaAtividade || null,
            p_horario_atividade: params.horarioAtividade || null,
            p_nivel_atividade: params.nivelAtividade || null,
            p_referral_type: params.referralType || 'nenhum',
            p_referral_name: params.referralName || null,
            p_social_code: params.socialCode || null,
            p_palestra_code: params.palestraCode || null,
            p_extra_data: params.extraData || {},
            p_batch_id: cleanLoteId || null,
            p_voucher_code: params.voucherEmpresa || null,
            p_partner_id: cleanPartnerId || null,
            p_app_instalado: Boolean(params.appInstalado),
        };

        logger.info('[registrationService] Executando RPC register_participant_with_slots:', {
            project: payload.p_project_id,
            user: payload.p_user_id,
            sessions: payload.p_session_ids.length,
            lote: payload.p_batch_id,
            tipo: payload.p_registration_type
        });

        try {
            const { data, error } = await (supabase.rpc as any)(
                'register_participant_with_slots',
                payload
            );

            if (error) {
                logger.error('[registrationService] Erro na RPC:', error);
                throw error;
            }

            // Enviar e-mail de Boas-vindas (Automação Resend)
            if (params.email && params.nome) {
                emailService.sendWelcome(params.email, params.nome).catch(e => logger.warn('[registrationService] Erro ao enviar boas-vindas:', e));
            }

            // Se for inscrição de parceiro, vincular na tabela de equipe (RPC valida access_code e limite)
            const rpcPayload = data as { success?: boolean; inscricao_id?: string };
            if (cleanPartnerId && rpcPayload?.success !== false) {
                const inscId = rpcPayload?.inscricao_id;
                const partnerQR = `GE-PARTNER|${inscId || cleanUserId || 'new'}|${Date.now()}`;
                try {
                    const { data: peData, error: peErr } = await (supabase.rpc as any)('register_parceiro_equipe_member', {
                        p_partner_id: cleanPartnerId,
                        p_partner_access_code: params.partnerAccessCode ?? null,
                        p_project_id: cleanProjectId,
                        p_user_id: cleanUserId,
                        p_name: params.nome,
                        p_email: params.email,
                        p_phone: params.phone,
                        p_cpf: params.cpf,
                        p_qr_code: partnerQR,
                    });
                    if (peErr) throw peErr;
                    const row = typeof peData === 'object' && peData !== null ? peData : {};
                    if (!(row as { success?: boolean }).success) {
                        logger.warn('[registrationService] Parceiro equipe RPC retornou falha:', peData);
                    } else {
                        logger.info(`[registrationService] Vínculo com parceiro ${cleanPartnerId} criado com sucesso.`);
                    }
                } catch (peErr) {
                    logger.error('[registrationService] Erro ao criar vínculo com equipe de parceiro:', peErr);
                }
            }

            return data;
        } catch (err) {
            logger.error('[registrationService] Erro crítico ao registrar:', err);
            throw err;
        }
    },

    /**
     * Busca inscrições por projeto e filtro opcional
     */
    async listByProject(projectId: string, filters: { email?: string; status?: string } = {}) {
        let query: any = supabase.from('growth_experience_registrations' as any);
        
        query = query.select('id,project_id,user_id,nome,email,telefone,ticket_number,status,payment_status,paid_amount,checked_in,check_in_at,created_at,selected_courses,night_lectures');
        query = query.eq('project_id', projectId);

        if (filters.email) query = query.eq('email', filters.email);
        if (filters.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw error;
        return data as any[];
    },

    /**
     * Busca uma inscrição pelo ID
     */
    async getById(id: string) {
        const query: any = supabase.from('growth_experience_registrations' as any);
        
        const { data, error } = await query
            .select('id,project_id,user_id,nome,email,telefone,ticket_number,status,payment_status,paid_amount,checked_in,check_in_at,created_at,selected_courses,night_lectures,registration_type,qr_code,qr_code_data')
            .eq('id', id)
            .single();
            
        if (error) throw error;
        return data;
    },
    isValidUUID(id: any): id is string {
        return typeof id === 'string' && id.length === 36 && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    }
};
