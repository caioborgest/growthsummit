import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

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
        try {
            const { data, error } = await (supabase.rpc as any)(
                'register_participant_with_slots',
                {
                    p_project_id: params.projectId,
                    p_user_id: params.userId,
                    p_nome: params.nome,
                    p_email: params.email,
                    p_telefone: params.telefone,
                    p_cpf: params.cpf,
                    p_session_ids: params.sessionIds,
                    p_tipo_inscricao: params.tipoInscricao || 'standard',
                    p_valor_pago: params.valorPago || 0,
                    p_status_pagamento: params.statusPagamento || (params.palestrasNoturnas ? 'pendente' : 'pago'),
                    p_status: params.status || (params.palestrasNoturnas ? 'pendente' : 'ativo'),
                    p_evento: params.evento || null,
                    p_palestras_noturnas: params.palestrasNoturnas || false,
                    p_tipo_atividade: params.tipoAtividade,
                    p_sala_atividade: params.salaAtividade,
                    p_horario_atividade: params.horarioAtividade,
                    p_nivel_atividade: params.nivelAtividade,
                    p_indicacao_tipo: params.indicacaoTipo || 'nenhum',
                    p_indicacao_nome: params.indicacaoNome,
                    p_codigo_social: params.codigoSocial,
                    p_codigo_palestra: params.codigoPalestra,
                    p_extra_data: params.extraData || {},
                    p_lote_id: params.loteId || null,
                    p_voucher_empresa: params.voucherEmpresa || null,
                }
            );

            if (error) {
                logger.error('[registrationService] Erro na RPC:', error);
                throw error;
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
        let query = supabase
            .from('inscricoes_growth_experience')
            .select('id,project_id,user_id,nome,email,telefone,ticket_number,status,status_pagamento,valor_pago,checked_in,check_in_at,created_at,cursos_selecionados,palestras_noturnas')
            .eq('project_id', projectId);

        if (filters.email) query = query.eq('email', filters.email);
        if (filters.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    /**
     * Busca uma inscrição pelo ID
     */
    async getById(id: string) {
        const { data, error } = await supabase
            .from('inscricoes_growth_experience')
            .select('id,project_id,user_id,nome,email,telefone,ticket_number,status,status_pagamento,valor_pago,checked_in,check_in_at,created_at,cursos_selecionados,palestras_noturnas,tipo_inscricao,qr_code,qr_code_data')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    }
};
