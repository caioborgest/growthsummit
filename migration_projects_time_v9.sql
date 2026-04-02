-- MIGRATION V9: Add startTime and endTime to projects
-- This avoids date discrepancies by storing exact event trial/hours

ALTER TABLE IF EXISTS projects 
ADD COLUMN IF NOT EXISTS start_time TEXT,
ADD COLUMN IF NOT EXISTS end_time TEXT;

-- Update existing records if needed (defaulting to 08:00 and 18:00 as sensible defaults)
-- UPDATE projects SET start_time = '08:00', end_time = '18:00' WHERE start_time IS NULL;

COMMENT ON COLUMN projects.start_time IS 'Hora de início do evento (formato HH:mm)';
COMMENT ON COLUMN projects.end_time IS 'Hora de término do evento (formato HH:mm)';
