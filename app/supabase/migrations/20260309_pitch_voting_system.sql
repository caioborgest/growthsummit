-- ============================================================
-- TABLE: pitch_scores
-- Description: Stores judges' scores for startups in the Arena Pitch
-- Date: 2026-03-09
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pitch_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    startup_id UUID REFERENCES public.startups_arena_pitch(id) ON DELETE CASCADE,
    judge_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    innovation_score INTEGER CHECK (
        innovation_score >= 1
        AND innovation_score <= 10
    ),
    market_score INTEGER CHECK (
        market_score >= 1
        AND market_score <= 10
    ),
    presentation_score INTEGER CHECK (
        presentation_score >= 1
        AND presentation_score <= 10
    ),
    business_model_score INTEGER CHECK (
        business_model_score >= 1
        AND business_model_score <= 10
    ),
    total_score NUMERIC(4, 2) GENERATED ALWAYS AS (
        (
            innovation_score + market_score + presentation_score + business_model_score
        )::NUMERIC / 4
    ) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Each judge can only vote once per startup
    UNIQUE(startup_id, judge_id)
);
-- RLS
ALTER TABLE public.pitch_scores ENABLE ROW LEVEL SECURITY;
-- Policies
DROP POLICY IF EXISTS "pitch_scores_admin_all" ON public.pitch_scores;
CREATE POLICY "pitch_scores_admin_all" ON public.pitch_scores FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "pitch_scores_judge_vote" ON public.pitch_scores;
CREATE POLICY "pitch_scores_judge_vote" ON public.pitch_scores FOR
INSERT WITH CHECK (
        auth.uid() = judge_id -- Simplified role check (admin/judge/staff)
        AND public.is_admin()
    );
DROP POLICY IF EXISTS "pitch_scores_public_read" ON public.pitch_scores;
CREATE POLICY "pitch_scores_public_read" ON public.pitch_scores FOR
SELECT USING (true);
-- Publicly viewable for leaderboard
-- Indexes
CREATE INDEX IF NOT EXISTS idx_ps_startup_id ON public.pitch_scores(startup_id);
CREATE INDEX IF NOT EXISTS idx_ps_project_id ON public.pitch_scores(project_id);
COMMENT ON TABLE public.pitch_scores IS 'Notas dos jurados para as startups da Arena Pitch.';