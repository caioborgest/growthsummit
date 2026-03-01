-- ============================================================
-- MIGRATION: PERFORMANCE INDEXES
-- Date: 2026-03-01
-- Description: Adds indexes on frequently-searched columns to
--              improve query performance as data grows.
-- Execute this in the Supabase SQL Editor.
-- ============================================================
-- 1. inscricoes_growth_experience: busca por email (login lookup, admin search)
CREATE INDEX IF NOT EXISTS idx_inscricoes_email ON inscricoes_growth_experience (email);
-- 2. inscricoes_growth_experience: busca por user_id (dashboard do participante)
CREATE INDEX IF NOT EXISTS idx_inscricoes_user_id ON inscricoes_growth_experience (user_id);
-- 3. inscricoes_growth_experience: busca por project_id (filtragem por evento)
CREATE INDEX IF NOT EXISTS idx_inscricoes_project_id ON inscricoes_growth_experience (project_id);
-- 4. inscricoes_growth_experience: filtragem por status no painel admin
CREATE INDEX IF NOT EXISTS idx_inscricoes_status ON inscricoes_growth_experience (status_pagamento);
-- 5. cupons_parceria_social: busca de cupom por código + ativo (validação no checkout)
--    Partial index: só indexa cupons ativos (reduz tamanho do índice)
CREATE INDEX IF NOT EXISTS idx_cupons_codigo_ativo ON cupons_parceria_social (codigo)
WHERE ativo = true;
-- 6. check_ins: busca por registration_id (verificar se já deu check-in)
CREATE INDEX IF NOT EXISTS idx_checkins_registration_id ON check_ins (registration_id);
-- 7. check_ins: busca por project_id + timestamp (lista de check-ins ao vivo)
CREATE INDEX IF NOT EXISTS idx_checkins_project_timestamp ON check_ins (project_id, timestamp DESC);
-- 8. users: busca por email (autenticação e lookup admin)
--    Provavelmente já existe, mas usando IF NOT EXISTS por segurança
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
-- 9. mentoring_sessions: busca por mentee (dashboard do participante)
CREATE INDEX IF NOT EXISTS idx_mentorias_mentee_id ON mentoring_sessions (mentee_id);
-- 10. mentoring_sessions: busca por mentor (dashboard do mentor)
CREATE INDEX IF NOT EXISTS idx_mentorias_mentor_id ON mentoring_sessions (mentor_id);
-- ============================================================
-- VERIFY: Review indexes created
-- ============================================================
-- SELECT indexname, tablename, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'inscricoes_growth_experience',
--     'cupons_parceria_social',
--     'check_ins',
--     'users',
--     'mentoring_sessions'
--   )
-- ORDER BY tablename, indexname;