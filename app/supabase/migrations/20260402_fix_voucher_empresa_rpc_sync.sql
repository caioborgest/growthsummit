-- ============================================================
-- FIX VOUCHER EMPRESA RPC SYNC
-- Date: 2026-04-02
-- Description: Standardize column name to 'voucher_empresa' across all functions
-- and ensure consistent behavior for corporate batch registrations.
-- ============================================================

-- 1. Corrigir a função de aplicação de voucher (Upgrade / Manual)
CREATE OR REPLACE FUNCTION public.aplicar_voucher_empresa(p_inscricao_id UUID, p_voucher_code TEXT) 
RETURNS BOOLEAN AS $$
DECLARE 
    v_lote_id UUID;
    v_vagas INTEGER;
    v_utilizadas INTEGER;
    v_status TEXT;
BEGIN 
    -- Obter os dados do lote relacionado ao voucher
    SELECT id, quantidade_vagas, vagas_utilizadas, status_pagamento INTO v_lote_id, v_vagas, v_utilizadas, v_status
    FROM public.lotes_inscricao_empresa
    WHERE voucher_code = p_voucher_code FOR UPDATE;

    -- Validar se o lote existe
    IF v_lote_id IS NULL THEN 
        RAISE EXCEPTION 'Voucher corporativo não encontrado.';
    END IF;

    -- Validar pagamento do lote
    IF v_status != 'pago' THEN 
        RAISE EXCEPTION 'O pagamento desse lote se encontra pendente. Entre em contato com a empresa.';
    END IF;

    -- Validar limite de vagas
    IF v_utilizadas >= v_vagas THEN 
        RAISE EXCEPTION 'Este voucher já atingiu o limite máximo de vagas do lote.';
    END IF;

    -- Vincular e concluir o acesso na inscrição
    -- Atualizado para usar 'voucher_empresa' em vez de 'voucher_empresa_usado'
    UPDATE public.inscricoes_growth_experience
    SET lote_id = v_lote_id,
        voucher_empresa = p_voucher_code,
        palestras_noturnas = true,
        status_pagamento = 'pago',
        status = 'ativo',
        valor_pago = 0,
        updated_at = NOW(),
        paid_at = NOW()
    WHERE id = p_inscricao_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Garantir que a coluna voucher_empresa exista (Failsafe)
ALTER TABLE public.inscricoes_growth_experience 
ADD COLUMN IF NOT EXISTS voucher_empresa TEXT;

-- 3. Recarregar o cache do PostgREST para refletir as mudanças nas colunas
NOTIFY pgrst, 'reload schema';

-- 4. Log de sucesso
DO $$ BEGIN RAISE NOTICE 'Voucher Empresa RPC Sync applied successfully.'; END $$;
