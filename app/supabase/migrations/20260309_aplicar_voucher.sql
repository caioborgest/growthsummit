-- ============================================================
-- CORPORATE VOUCHER REDEMPTION RPC
-- Date: 2026-03-09
-- ============================================================
CREATE OR REPLACE FUNCTION aplicar_voucher_empresa(p_inscricao_id UUID, p_voucher_code TEXT) RETURNS BOOLEAN AS $$
DECLARE v_lote_id UUID;
v_vagas INTEGER;
v_utilizadas INTEGER;
v_status TEXT;
BEGIN -- Obter os dados do lote relacionado ao voucher
SELECT id,
    quantidade_vagas,
    vagas_utilizadas,
    status_pagamento INTO v_lote_id,
    v_vagas,
    v_utilizadas,
    v_status
FROM public.lotes_inscricao_empresa
WHERE voucher_code = p_voucher_code;
-- Validar se o lote existe
IF v_lote_id IS NULL THEN RAISE EXCEPTION 'Voucher Invalido ou Nao Encontrado.';
END IF;
-- Validar pagamento
IF v_status != 'pago' THEN RAISE EXCEPTION 'O pagamento desse lote se encontra pendente. Entre em contato com o responsavel da sua empresa.';
END IF;
-- Validar limite de vagas
IF v_utilizadas >= v_vagas THEN RAISE EXCEPTION 'Este voucher ja atingiu o limite maximo de % vagas.',
v_vagas;
END IF;
-- Atualizar utilizacao de vagas no lote
UPDATE public.lotes_inscricao_empresa
SET vagas_utilizadas = vagas_utilizadas + 1,
    updated_at = NOW()
WHERE id = v_lote_id;
-- Vincular e concluir o acesso na inscricao
UPDATE public.inscricoes_growth_experience
SET lote_id = v_lote_id,
    voucher_empresa_usado = p_voucher_code,
    palestras_noturnas = true,
    status_pagamento = 'pago',
    status = 'ativo',
    valor_pago = 0,
    cupom_palestra = p_voucher_code,
    valor_desconto_palestra = 179.99,
    updated_at = NOW(),
    paid_at = NOW()
WHERE id = p_inscricao_id;
RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;