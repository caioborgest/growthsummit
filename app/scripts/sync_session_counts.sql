-- Function to decrement session registered count
CREATE OR REPLACE FUNCTION decrement_session_count(session_id UUID) RETURNS void AS $$ BEGIN
UPDATE programacao_evento
SET registered_count = COALESCE(registered_count, 1) - 1
WHERE id = session_id;
END;
$$ LANGUAGE plpgsql;
-- Ensure increment function also exists (if not already there)
CREATE OR REPLACE FUNCTION increment_session_count(session_id UUID) RETURNS void AS $$ BEGIN
UPDATE programacao_evento
SET registered_count = COALESCE(registered_count, 0) + 1
WHERE id = session_id;
END;
$$ LANGUAGE plpgsql;