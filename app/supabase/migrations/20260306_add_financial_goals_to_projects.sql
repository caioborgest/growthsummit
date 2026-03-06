-- Add financial goal columns to projects table
-- Date: 2026-03-06
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS goal_revenue DECIMAL(15, 2) DEFAULT 616000.00,
    ADD COLUMN IF NOT EXISTS goal_sponsorship DECIMAL(15, 2) DEFAULT 200000.00,
    ADD COLUMN IF NOT EXISTS goal_registrations INTEGER DEFAULT 300;
-- Update existing projects with default values if they are NULL
UPDATE public.projects
SET goal_revenue = COALESCE(goal_revenue, 616000.00),
    goal_sponsorship = COALESCE(goal_sponsorship, 200000.00),
    goal_registrations = COALESCE(goal_registrations, 300)
WHERE goal_revenue IS NULL
    OR goal_sponsorship IS NULL
    OR goal_registrations IS NULL;