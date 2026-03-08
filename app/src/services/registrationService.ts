import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface RegistrationParams {
    projectId: string;
    userId: string;
    nome: string;
    email: string;
    telefone: string;
    sessionIds: string[];
    tipoInscricao?: string;
    valorPago?: number;
    statusPagamento?: string;
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
            .select('*')
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
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    }
};
