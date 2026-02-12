import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// ==================== TYPES ====================

export interface InscricaoTriunfo {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    empresa: string | null;
    tipo_inscricao: 'palestra' | 'mentor' | 'cursos';
    evento: string;
    valor: number;
    status: 'pendente' | 'confirmado' | 'pago' | 'cancelado';
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
    nome_fundador: string;
    email: string;
    telefone: string;
    // Startup
    nome_startup: string;
    descricao_startup: string;
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
    nome_representante: string;
    cargo: string;
    email: string;
    telefone: string;
    // Empresa
    nome_empresa: string;
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
    tipo_interesse: string[];
    areas_interesse: string[];
    descricao_objetivos: string;
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

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: inscricoes, error: fetchError } = await supabase
                .from('inscricoes_growth_experience_triunfo')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setData(inscricoes || []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            logger.error('Erro ao buscar inscrições:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (id: string, status: InscricaoTriunfo['status']) => {
        try {
<<<<<<< HEAD
            const { error: updateError } = await supabase
                .from('inscricoes_growth_experience_triunfo')
                .update({ status, updated_at: new Date().toISOString() } as any)
=======
            const { error: updateError } = await (supabase
                .from('inscricoes_growth_experience_triunfo') as any)
                .update({ status, updated_at: new Date().toISOString() })
>>>>>>> 0f4274e708f4383df4e22169da1de23cef6eb300
                .eq('id', id);

            if (updateError) throw updateError;
            await fetchData();
            return { success: true };
        } catch (err: any) {
            logger.error('Erro ao atualizar status:', err);
            return { success: false, error: err.message };
        }
    };

    const deleteInscricao = async (id: string) => {
        try {
            const { error: deleteError } = await (supabase
                .from('inscricoes_growth_experience_triunfo') as any)
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            await fetchData();
            return { success: true };
        } catch (err: any) {
            logger.error('Erro ao deletar inscrição:', err);
            return { success: false, error: err.message };
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

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: startups, error: fetchError } = await supabase
                .from('startups_arena_pitch')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setData(startups || []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            logger.error('Erro ao buscar startups:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (
        id: string,
        status: StartupArenaPitch['status'],
        pontuacao?: number,
        feedback?: string
    ) => {
        try {
            const updateData: any = {
                status,
                updated_at: new Date().toISOString(),
            };

            if (pontuacao !== undefined) updateData.pontuacao = pontuacao;
            if (feedback !== undefined) updateData.feedback = feedback;
            if (status !== 'pendente') updateData.avaliado_at = new Date().toISOString();

<<<<<<< HEAD
            const { error: updateError } = await supabase
                .from('startups_arena_pitch')
                .update(updateData as any)
=======
            const { error: updateError } = await (supabase
                .from('startups_arena_pitch') as any)
                .update(updateData)
>>>>>>> 0f4274e708f4383df4e22169da1de23cef6eb300
                .eq('id', id);

            if (updateError) throw updateError;
            await fetchData();
            return { success: true };
        } catch (err: any) {
            logger.error('Erro ao atualizar startup:', err);
            return { success: false, error: err.message };
        }
    };

    const deleteStartup = async (id: string) => {
        try {
            const { error: deleteError } = await (supabase
                .from('startups_arena_pitch') as any)
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            await fetchData();
            return { success: true };
        } catch (err: any) {
            logger.error('Erro ao deletar startup:', err);
            return { success: false, error: err.message };
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

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: empresas, error: fetchError } = await supabase
                .from('rodada_negocios_b2b')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setData(empresas || []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            logger.error('Erro ao buscar empresas B2B:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (id: string, status: EmpresaB2B['status']) => {
        try {
            const updateData: any = {
                status,
                updated_at: new Date().toISOString(),
            };

            if (status === 'aprovado') {
                updateData.aprovado_at = new Date().toISOString();
            }

<<<<<<< HEAD
            const { error: updateError } = await supabase
                .from('rodada_negocios_b2b')
                .update(updateData as any)
=======
            const { error: updateError } = await (supabase
                .from('rodada_negocios_b2b') as any)
                .update(updateData)
>>>>>>> 0f4274e708f4383df4e22169da1de23cef6eb300
                .eq('id', id);

            if (updateError) throw updateError;
            await fetchData();
            return { success: true };
        } catch (err: any) {
            logger.error('Erro ao atualizar empresa:', err);
            return { success: false, error: err.message };
        }
    };

    const deleteEmpresa = async (id: string) => {
        try {
            const { error: deleteError } = await (supabase
                .from('rodada_negocios_b2b') as any)
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            await fetchData();
            return { success: true };
        } catch (err: any) {
            logger.error('Erro ao deletar empresa:', err);
            return { success: false, error: err.message };
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
        inscricoesPagas: inscricoes.filter(i => i.status === 'pago').length,
        inscricoesPendentes: inscricoes.filter(i => i.status === 'pendente').length,
        inscricoesPalestra: inscricoes.filter(i => i.tipo_inscricao === 'palestra').length,
        inscricoesMentor: inscricoes.filter(i => i.tipo_inscricao === 'mentor').length,
        inscricoesCursos: inscricoes.filter(i => i.tipo_inscricao === 'cursos').length,

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
            .filter(i => i.status === 'pago')
            .reduce((sum, i) => sum + i.valor, 0),
        receitaPendente: inscricoes
            .filter(i => i.status === 'pendente' && i.tipo_inscricao === 'palestra')
            .reduce((sum, i) => sum + i.valor, 0),
    };

    return stats;
}
