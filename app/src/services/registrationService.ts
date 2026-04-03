import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { emailService } from './emailService';

export interface RegistrationParams {
    projectId: string;
    userId: string;
    nome: string;
    email: string;
    telefone: string;
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
    indicacaoTipo?: string;
    indicacaoNome?: string | null;
    partnerId?: string | null;
    codigoSocial?: string | null;
    codigoPalestra?: string | null;
    extraData?: Record<string, unknown>;
}

export const registrationService = {
    /**
     * Valida dados da inscrição no servidor (LGPD/segurança).
     * Deve ser chamado antes de registerWithSlots.
     */
    async validateInscricaoData(nome: string, email: string, telefone: string): Promise<{ valid: boolean; errorMessage?: string }> {
        try {
            const { data, error } = await (supabase.rpc as any)('validate_inscricao_dados', {
                p_nome: nome?.trim() || '',
                p_email: email?.trim() || '',
                p_telefone: telefone?.trim() || '',
            });

            // Se der erro de função não encontrada ou cache (PGRST), aplicamos fallback cliente
            if (error && (error.code === 'PGRST202' || error.code === '404' || String(error.message).includes('Could not find'))) {
                logger.warn('[registrationService] RPC de validação não encontrada. Usando fallback no client-side.');
                if (!nome || nome.trim().length < 3) return { valid: false, errorMessage: 'Nome completo é obrigatório.' };
                if (!email || !email.includes('@')) return { valid: false, errorMessage: 'E-mail inválido.' };
                if (!telefone || telefone.trim().length < 10) return { valid: false, errorMessage: 'Telefone inválido.' };
                return { valid: true };
            }

            if (error) throw error;
            const row = Array.isArray(data) ? data[0] : data;
            return { valid: !!row?.valid, errorMessage: row?.error_message || undefined };
        } catch (err) {
            logger.error('[registrationService] Erro na validação:', err);
            // Em caso de erro geral de rede, permitimos avançar pra não travar a venda (fallback agressivo)
            return { valid: true };
        }
    },

    /**
     * Realiza uma inscrição atômica verificando disponibilidade de vagas.
     * Chama a função RPC 'register_participant_with_slots' no Supabase.
     */
    async registerWithSlots(params: RegistrationParams) {
        // 👮 Validação rigorosa de UUID (8-4-4-4-12) para evitar erro 42883 'uuid = text'
        const isValidUUID = (id: any): id is string => 
            typeof id === 'string' && id.length === 36 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        // Se projectId não for UUID, tenta extrair se for um objeto ou falha
        const cleanProjectId = isValidUUID(params.projectId) ? params.projectId : null;

        if (!cleanProjectId) {
            logger.error('[registrationService] Tentativa de registro com projectId inválido:', params.projectId);
            throw new Error('ID do Projeto inválido. Por favor, recarregue a página.');
        }

        const payload = {
            p_project_id: cleanProjectId,
            p_user_id: isValidUUID(params.userId) ? params.userId : null,
            p_nome: params.nome,
            p_email: params.email?.trim().toLowerCase(),
            p_telefone: params.telefone,
            p_cpf: params.cpf,
            p_session_ids: Array.isArray(params.sessionIds) ? params.sessionIds.filter(id => isValidUUID(id)) : [],
            p_tipo_inscricao: params.tipoInscricao || 'standard',
            p_valor_pago: Number(params.valorPago) || 0,
            p_status_pagamento: params.statusPagamento || (params.palestrasNoturnas ? 'pendente' : 'pago'),
            p_status: params.status || (params.palestrasNoturnas ? 'pendente' : 'ativo'),
            p_evento: params.evento || null,
            p_palestras_noturnas: !!params.palestrasNoturnas,
            p_tipo_atividade: params.tipoAtividade || null,
            p_sala_atividade: params.salaAtividade || null,
            p_horario_atividade: params.horarioAtividade || null,
            p_nivel_atividade: params.nivelAtividade || null,
            p_indicacao_tipo: params.indicacaoTipo || 'nenhum',
            p_indicacao_nome: params.indicacaoNome || null,
            p_codigo_social: params.codigoSocial || null,
            p_codigo_palestra: params.codigoPalestra || null,
            p_extra_data: params.extraData || {},
            p_lote_id: isValidUUID(params.loteId) ? params.loteId : null,
            p_voucher_empresa: params.voucherEmpresa || null
        };

        logger.info('[registrationService] Executando RPC register_participant_with_slots:', {
            project: payload.p_project_id,
            user: payload.p_user_id,
            sessions: payload.p_session_ids.length,
            lote: payload.p_lote_id,
            tipo: payload.p_tipo_inscricao
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

            // Se for inscrição de parceiro, vincular na tabela de equipe
            if (isValidUUID(params.partnerId) && data) {
                const partnerQR = `GE-PARTNER|${data.id || payload.p_user_id || 'new'}|${Date.now()}`;
                try {
                    await (supabase.from('parceiros_equipe' as any).insert({
                        partner_id: params.partnerId,
                        project_id: payload.p_project_id,
                        user_id: payload.p_user_id,
                        name: params.nome,
                        email: params.email,
                        phone: params.telefone,
                        cpf: params.cpf,
                        role: 'Integrante',
                        qr_code: partnerQR
                    } as any));
                    logger.info(`[registrationService] Vínculo com parceiro ${params.partnerId} criado com sucesso.`);
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
        let query: any = supabase.from('inscricoes_growth_experience' as any);
        
        query = query.select('id,project_id,user_id,nome,email,telefone,ticket_number,status,status_pagamento,valor_pago,checked_in,check_in_at,created_at,cursos_selecionados,palestras_noturnas');
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
        const query: any = supabase.from('inscricoes_growth_experience' as any);
        
        const { data, error } = await query
            .select('id,project_id,user_id,nome,email,telefone,ticket_number,status,status_pagamento,valor_pago,checked_in,check_in_at,created_at,cursos_selecionados,palestras_noturnas,tipo_inscricao,qr_code,qr_code_data')
            .eq('id', id)
            .single();
            
        if (error) throw error;
        return data;
    }
};
