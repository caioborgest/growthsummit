import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { useProject } from '@/contexts/ProjectContext';

// ==================== TYPES ====================

export interface InscricaoTriunfo {
    id: string;
    nome: string;
    email: string;
    phone: string;
    empresa: string | null;
    registration_type: 'palestra' | 'mentor' | 'cursos';
    evento: string;
    paid_amount: number;
    payment_status: 'pendente' | 'pago' | 'processando' | 'erro';
    status: 'ativo' | 'cancelado' | 'pendente';
    stripe_payment_intent_id: string | null;
    stripe_session_id: string | null;
    stripe_payment_status: string | null;
    created_at: string;
    updated_at: string;
    paid_at: string | null;
}

export interface StartupArenaPitch {
    id: string;
    // Fundador
    founder_name: string;
    email: string;
    phone: string;
    // Startup
    startup_name: string;
    startup_description: string;
    setor: string;
    estagio: 'ideia' | 'mvp' | 'tracao' | 'escala';
    // Pitch
    problema: string;
    solucao: string;
    diferencial: string;
    faturamento_mensal: number | null;
    investimento_buscado: number | null;
    // Documentos
    pitch_deck_url: string | null;
    video_pitch_url: string | null;
    // Status
    status: 'pendente' | 'aprovado' | 'rejeitado';
    pontuacao: number | null;
    feedback: string | null;
    created_at: string;
    updated_at: string;
    avaliado_at: string | null;
}

export interface EmpresaB2B {
    id: string;
    // Representante
    representative_name: string;
    role_title: string;
    email: string;
    phone: string;
    // Empresa
    company_name: string;
    cnpj: string | null;
    setor: string;
    porte: 'mei' | 'micro' | 'pequena' | 'media' | 'grande';
    faturamento_anual: number | null;
    numero_funcionarios: number | null;
    descricao_empresa: string;
    produtos_servicos: string;
    site_url: string | null;
    linkedin_url: string | null;
    // Objetivos
    interest_type: string[];
    interest_areas: string[];
    objectives_description: string;
    // Status
    status: 'pendente' | 'aprovado' | 'rejeitado';
    created_at: string;
    updated_at: string;
    aprovado_at: string | null;
}

// ==================== HOOKS ====================

/**
 * Hook para gerenciar inscrições gerais do Growth Experience Triunfo
 */
export function useInscricoesTriunfo() {
    const [data, setData] = useState<InscricaoTriunfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { projectId } = useProject();

    const fetchData = useCallback(async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const { data: inscricoes, error: fetchError } = await supabase
                .from('registrations')
                .select('*, profiles:profiles!registrations_participant_id_fkey(user_id, phone, company, city, state, role), users:users!registrations_participant_id_fkey(name, email)')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            
            // Map the joined data to the flat interface
            const mappedData = (inscricoes || []).map((reg: any) => ({
                ...reg,
                nome: reg.users?.name || reg.profiles?.name || reg.name || reg.nome,
                email: reg.users?.email || reg.profiles?.email || reg.email,
                phone: reg.profiles?.phone || reg.phone || reg.telefone,
                empresa: reg.profiles?.company || reg.company,
                paid_amount: reg.final_amount || reg.paid_amount,
            }));

            setData(mappedData);
            setError(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(message);
            logger.error('Erro ao buscar inscrições:', err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateStatus = async (id: string, status: InscricaoTriunfo['status']) => {
        try {
            const { error: updateError } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('registrations') as any)
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (updateError) throw updateError;
            await fetchData();
            return { success: true };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            logger.error('Erro ao atualizar status:', err);
            return { success: false, error: message };
        }
    };

    const deleteInscricao = async (id: string) => {
        try {
            const { error: deleteError } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('registrations') as any)
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            await fetchData();
            return { success: true };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            logger.error('Erro ao deletar inscrição:', err);
            return { success: false, error: message };
        }
    };

    return {
        data,
        loading,
        error,
        refresh: fetchData,
        updateStatus,
        deleteInscricao,
    };
}

/**
 * Hook para gerenciar startups da Arena Pitch
 */
export function useStartupsArenaPitch() {
    const [data, setData] = useState<StartupArenaPitch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { projectId } = useProject();

    const fetchData = useCallback(async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const { data: startups, error: fetchError } = await supabase
                .from('arena_pitch_startups')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setData(startups || []);
            setError(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(message);
            logger.error('Erro ao buscar startups:', err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateStatus = async (
        id: string,
        status: StartupArenaPitch['status'],
        pontuacao?: number,
        feedback?: string
    ) => {
        try {
            const updateData: Record<string, unknown> = {
                status,
                updated_at: new Date().toISOString(),
            };

            if (pontuacao !== undefined) updateData.pontuacao = pontuacao;
            if (feedback !== undefined) updateData.feedback = feedback;
            if (status !== 'pendente') updateData.avaliado_at = new Date().toISOString();

            const { error: updateError } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('arena_pitch_startups') as any)
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;
            await fetchData();
            return { success: true };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            logger.error('Erro ao atualizar startup:', err);
            return { success: false, error: message };
        }
    };

    const deleteStartup = async (id: string) => {
        try {
            const { error: deleteError } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('arena_pitch_startups') as any)
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            await fetchData();
            return { success: true };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            logger.error('Erro ao deletar startup:', err);
            return { success: false, error: message };
        }
    };

    return {
        data,
        loading,
        error,
        refresh: fetchData,
        updateStatus,
        deleteStartup,
    };
}

/**
 * Hook para gerenciar empresas da Rodada B2B
 */
export function useEmpresasB2B() {
    const [data, setData] = useState<EmpresaB2B[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { projectId } = useProject();

    const fetchData = useCallback(async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const { data: empresas, error: fetchError } = await supabase
                .from('b2b_business_rounds')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setData(empresas || []);
            setError(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(message);
            logger.error('Erro ao buscar empresas B2B:', err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateStatus = async (id: string, status: EmpresaB2B['status']) => {
        try {
            const updateData: Record<string, unknown> = {
                status,
                updated_at: new Date().toISOString(),
            };

            if (status === 'aprovado') {
                updateData.aprovado_at = new Date().toISOString();
            }

            const { error: updateError } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('b2b_business_rounds') as any)
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;
            await fetchData();
            return { success: true };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            logger.error('Erro ao atualizar empresa:', err);
            return { success: false, error: message };
        }
    };

    const deleteEmpresa = async (id: string) => {
        try {
            const { error: deleteError } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('b2b_business_rounds') as any)
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            await fetchData();
            return { success: true };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            logger.error('Erro ao deletar empresa:', err);
            return { success: false, error: message };
        }
    };

    return {
        data,
        loading,
        error,
        refresh: fetchData,
        updateStatus,
        deleteEmpresa,
    };
}

/**
 * Hook para estatísticas consolidadas do evento
 */
export function useGrowthExperienceStats() {
    const { data: inscricoes } = useInscricoesTriunfo();
    const { data: startups } = useStartupsArenaPitch();
    const { data: empresasB2B } = useEmpresasB2B();

    const stats = {
        // Inscrições
        totalInscricoes: inscricoes.length,
        inscricoesPagas: inscricoes.filter(i => i.payment_status === 'pago').length,
        inscricoesPendentes: inscricoes.filter(i => i.payment_status === 'pendente').length,
        inscricoesPalestra: inscricoes.filter(i => i.registration_type === 'palestra').length,
        inscricoesMentor: inscricoes.filter(i => i.registration_type === 'mentor').length,
        inscricoesCursos: inscricoes.filter(i => i.registration_type === 'cursos').length,

        // Startups
        totalStartups: startups.length,
        startupsAprovadas: startups.filter(s => s.status === 'aprovado').length,
        startupsPendentes: startups.filter(s => s.status === 'pendente').length,
        startupsRejeitadas: startups.filter(s => s.status === 'rejeitado').length,

        // Empresas B2B
        totalEmpresasB2B: empresasB2B.length,
        empresasAprovadas: empresasB2B.filter(e => e.status === 'aprovado').length,
        empresasPendentes: empresasB2B.filter(e => e.status === 'pendente').length,
        empresasRejeitadas: empresasB2B.filter(e => e.status === 'rejeitado').length,

        // Receita
        receitaTotal: inscricoes
            .filter(i => i.payment_status === 'pago')
            .reduce((sum, i) => sum + (Number(i.paid_amount) || 0), 0),
        receitaPendente: inscricoes
            .filter(i => i.payment_status === 'pendente' && i.registration_type === 'palestra')
            .reduce((sum, i) => sum + (Number(i.paid_amount) || 0), 0),
    };

    return stats;
}
