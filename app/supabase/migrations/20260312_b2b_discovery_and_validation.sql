-- ============================================================
-- MIGRATION: B2B Discovery (sem dados sensíveis) + Validação server-side
-- Data: 2026-03-12 | Auditoria 360° - Implementação
-- ============================================================

-- 1. RPC: get_b2b_discovery_companies
-- Retorna empresas aprovadas para discovery (matchmaking) SEM telefone, email, cnpj.
-- Exige que o caller tenha uma empresa no mesmo projeto.
CREATE OR REPLACE FUNCTION public.get_b2b_discovery_companies(p_project_id UUID)
RETURNS TABLE (
    id UUID,
    project_id UUID,
    user_id UUID,
    nome_representante TEXT,
    cargo TEXT,
    nome_empresa TEXT,
    setor TEXT,
    porte TEXT,
    descricao_empresa TEXT,
    produtos_servicos TEXT,
    site_url TEXT,
    linkedin_url TEXT,
    logo_url TEXT,
    tipo_interesse TEXT,
    areas_interesse TEXT[],
    descricao_objetivos TEXT,
    status TEXT,
    created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Garantir que o usuário autenticado tem uma empresa no projeto
  IF NOT EXISTS (
    SELECT 1 FROM public.rodada_negocios_b2b r
    WHERE r.project_id = p_project_id
      AND (r.user_id = auth.uid() OR r.email = (auth.jwt()->>'email'))
  ) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas empresas do projeto podem acessar o discovery.';
  END IF;

  RETURN QUERY
  SELECT
    r.id,
    r.project_id,
    r.user_id,
    r.nome_representante,
    r.cargo,
    r.nome_empresa,
    r.setor,
    r.porte,
    r.descricao_empresa,
    r.produtos_servicos,
    r.site_url,
    r.linkedin_url,
    r.logo_url,
    r.tipo_interesse,
    r.areas_interesse,
    r.descricao_objetivos,
    r.status,
    r.created_at
  FROM public.rodada_negocios_b2b r
  WHERE r.project_id = p_project_id
    AND r.status = 'approved';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_b2b_discovery_companies(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_b2b_discovery_companies(UUID) TO service_role;

COMMENT ON FUNCTION public.get_b2b_discovery_companies(UUID) IS
  'Retorna empresas B2B aprovadas para discovery, excluindo dados sensíveis (telefone, email, cnpj). LGPD-safe.';

-- 2. Função de validação server-side para inscrição
CREATE OR REPLACE FUNCTION public.validate_inscricao_dados(
  p_nome TEXT,
  p_email TEXT,
  p_telefone TEXT
) RETURNS TABLE(valid BOOLEAN, error_message TEXT) LANGUAGE plpgsql STABLE
AS $$
BEGIN
  -- Nome: mínimo 3 caracteres
  IF p_nome IS NULL OR TRIM(p_nome) = '' THEN
    RETURN QUERY SELECT FALSE, 'Nome é obrigatório'::TEXT;
    RETURN;
  END IF;
  IF LENGTH(TRIM(p_nome)) < 3 THEN
    RETURN QUERY SELECT FALSE, 'Nome deve ter pelo menos 3 caracteres'::TEXT;
    RETURN;
  END IF;
  IF LENGTH(p_nome) > 100 THEN
    RETURN QUERY SELECT FALSE, 'Nome muito longo'::TEXT;
    RETURN;
  END IF;

  -- Email: formato básico
  IF p_email IS NULL OR TRIM(p_email) = '' THEN
    RETURN QUERY SELECT FALSE, 'E-mail é obrigatório'::TEXT;
    RETURN;
  END IF;
  IF p_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RETURN QUERY SELECT FALSE, 'E-mail inválido'::TEXT;
    RETURN;
  END IF;

  -- Telefone: mínimo 10 dígitos
  IF p_telefone IS NULL OR TRIM(p_telefone) = '' THEN
    RETURN QUERY SELECT FALSE, 'Telefone é obrigatório'::TEXT;
    RETURN;
  END IF;
  IF LENGTH(REGEXP_REPLACE(p_telefone, '\D', '', 'g')) < 10 THEN
    RETURN QUERY SELECT FALSE, 'Telefone inválido (mínimo 10 dígitos)'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, NULL::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_inscricao_dados(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_inscricao_dados(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_inscricao_dados(TEXT, TEXT, TEXT) TO service_role;
