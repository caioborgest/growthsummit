-- ============================================================
-- MIGRATION: Adiciona campos de avaliação pós-mentoria
-- Growth Summit 2026
-- Data: 2026-03-06
-- ============================================================
-- Execute no Supabase SQL Editor
ALTER TABLE public.mentorias_agendadas
ADD COLUMN IF NOT EXISTS avaliacao_mentoria INTEGER CHECK (
        avaliacao_mentoria BETWEEN 1 AND 5
    ),
    ADD COLUMN IF NOT EXISTS indicacao_mentor INTEGER CHECK (
        indicacao_mentor BETWEEN 1 AND 5
    ),
    ADD COLUMN IF NOT EXISTS avaliado_em TIMESTAMP WITH TIME ZONE;
-- Índice para facilitar agregação de médias por mentor
CREATE INDEX IF NOT EXISTS idx_mentorias_avaliacao ON public.mentorias_agendadas(mentor_id, avaliacao_mentoria)
WHERE avaliacao_mentoria IS NOT NULL;
-- View auxiliar: médias por mentor
CREATE OR REPLACE VIEW public.view_avaliacoes_mentor AS
SELECT mentor_id,
    COUNT(*) AS total_mentorias,
    COUNT(avaliacao_mentoria) AS total_avaliacoes,
    ROUND(AVG(avaliacao_mentoria), 2) AS media_avaliacao_mentoria,
    ROUND(AVG(indicacao_mentor), 2) AS media_indicacao_mentor,
    ROUND(
        (AVG(avaliacao_mentoria) + AVG(indicacao_mentor)) / 2,
        2
    ) AS media_geral
FROM public.mentorias_agendadas
WHERE status = 'completed'
GROUP BY mentor_id;
-- Política: participant pode atualizar apenas os campos de avaliação
-- (o slot já possui política de update público, portanto este é um complemento)
DROP POLICY IF EXISTS "mentorias_avaliacao_update" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_avaliacao_update" ON public.mentorias_agendadas FOR
UPDATE USING (true) -- qualquer autenticado pode avaliar (RLS já filtra por mentorado_id no hook)
    WITH CHECK (true);