-- ============================================================
-- MODULE: CSAT SUPPORT
-- Date: 2026-03-25
-- Objective: Add rating and feedback columns to support tickets
-- ============================================================

ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Update RLS if needed (already allows update by owner/admin in previous migration)
