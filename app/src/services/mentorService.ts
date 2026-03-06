import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface MentorParams {
    projectId: string;
    userId?: string;
    nome: string;
    email: string;
    telefone: string;
    empresa?: string;
    cargo?: string;
    especialidades?: string[];
    bio?: string;
    linkedinUrl?: string;
    fotoUrl?: string;
    yearsExperience?: number;
    maxMentories?: number;
}

export const mentorService = {
    /**
     * Lista mentores aprovados de um projeto (visível publicamente)
     */
    async listApproved(projectId: string) {
        const { data, error } = await (supabase
            .from('mentores_growth_experience' as any) as any)
            .select('id,project_id,user_id,nome,email,telefone,empresa,cargo,especialidades,bio,linkedin_url,foto_url,status,years_experience,max_mentories,created_at')
            .eq('project_id', projectId)
            .eq('status', 'approved')
            .order('nome');

        if (error) {
            logger.error('[mentorService] Erro ao listar mentores:', error);
            throw error;
        }
        return data;
    },

    /**
     * Lista TODOS os mentores de um projeto (admin)
     */
    async listAll(projectId: string) {
        const { data, error } = await (supabase
            .from('mentores_growth_experience' as any) as any)
            .select('id,project_id,user_id,nome,email,telefone,empresa,cargo,especialidades,bio,linkedin_url,foto_url,status,years_experience,max_mentories,created_at')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('[mentorService] Erro ao listar todos mentores:', error);
            throw error;
        }
        return data;
    },

    /**
     * Aplica para ser mentor (candidatura pública)
     */
    async apply(params: MentorParams) {
        const { data, error } = await (supabase
            .from('mentores_growth_experience' as any) as any)
            .insert([{
                project_id: params.projectId,
                user_id: params.userId || null,
                nome: params.nome,
                email: params.email,
                telefone: params.telefone,
                empresa: params.empresa || null,
                cargo: params.cargo || null,
                especialidades: params.especialidades || [],
                bio: params.bio || null,
                linkedin_url: params.linkedinUrl || null,
                foto_url: params.fotoUrl || null,
                years_experience: params.yearsExperience || 0,
                max_mentories: params.maxMentories || 5,
                status: 'pendente'
            }])
            .select()
            .single();

        if (error) {
            logger.error('[mentorService] Erro ao aplicar para mentor:', error);
            throw error;
        }
        return data;
    },

    /**
     * Busca mentor por ID de usuário em um projeto
     */
    async getByUserId(userId: string, projectId: string) {
        const { data, error } = await (supabase
            .from('mentores_growth_experience' as any) as any)
            .select('*')
            .eq('user_id', userId)
            .eq('project_id', projectId)
            .maybeSingle();

        if (error) {
            logger.error('[mentorService] Erro ao buscar mentor:', error);
            throw error;
        }
        return data;
    },

    /**
     * Aprova um mentor (admin)
     */
    async approve(mentorId: string) {
        const { error } = await (supabase
            .from('mentores_growth_experience' as any) as any)
            .update({ status: 'approved' })
            .eq('id', mentorId);

        if (error) {
            logger.error('[mentorService] Erro ao aprovar mentor:', error);
            throw error;
        }
    },

    /**
     * Rejeita um mentor (admin)
     */
    async reject(mentorId: string, reason?: string) {
        const { error } = await (supabase
            .from('mentores_growth_experience' as any) as any)
            .update({ status: 'rejected', rejection_reason: reason || null })
            .eq('id', mentorId);

        if (error) {
            logger.error('[mentorService] Erro ao rejeitar mentor:', error);
            throw error;
        }
    },

    /**
     * Atualiza dados de um mentor (pelo próprio mentor ou admin)
     */
    async update(mentorId: string, updates: Partial<MentorParams>) {
        const payload: Record<string, unknown> = {};
        if (updates.nome !== undefined) payload.nome = updates.nome;
        if (updates.telefone !== undefined) payload.telefone = updates.telefone;
        if (updates.empresa !== undefined) payload.empresa = updates.empresa;
        if (updates.cargo !== undefined) payload.cargo = updates.cargo;
        if (updates.especialidades !== undefined) payload.especialidades = updates.especialidades;
        if (updates.bio !== undefined) payload.bio = updates.bio;
        if (updates.linkedinUrl !== undefined) payload.linkedin_url = updates.linkedinUrl;
        if (updates.fotoUrl !== undefined) payload.foto_url = updates.fotoUrl;
        if (updates.yearsExperience !== undefined) payload.years_experience = updates.yearsExperience;
        if (updates.maxMentories !== undefined) payload.max_mentories = updates.maxMentories;

        const { error } = await (supabase
            .from('mentores_growth_experience' as any) as any)
            .update(payload)
            .eq('id', mentorId);

        if (error) {
            logger.error('[mentorService] Erro ao atualizar mentor:', error);
            throw error;
        }
    },
};
