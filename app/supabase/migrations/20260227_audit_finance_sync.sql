CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        ip_address TEXT,
        browser_agent TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Admins podem ver todos os logs'
) THEN CREATE POLICY "Admins podem ver todos os logs" ON public.audit_logs FOR
SELECT USING (public.is_admin());
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Sistema pode inserir logs'
) THEN CREATE POLICY "Sistema pode inserir logs" ON public.audit_logs FOR
INSERT WITH CHECK (true);
END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    registration_id UUID,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    payment_method VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Admins podem gerenciar transações'
) THEN CREATE POLICY "Admins podem gerenciar transações" ON public.transactions FOR ALL USING (public.is_admin());
END IF;
END $$;
CREATE OR REPLACE FUNCTION public.sync_registration_to_transaction() RETURNS TRIGGER AS $$ BEGIN IF (
        TG_OP = 'INSERT'
        AND (
            NEW.status_pagamento = 'pago'
            OR NEW.status_pagamento = 'paid'
        )
    )
    OR (
        TG_OP = 'UPDATE'
        AND (
            NEW.status_pagamento = 'pago'
            OR NEW.status_pagamento = 'paid'
        )
        AND (
            OLD.status_pagamento != 'pago'
            AND OLD.status_pagamento != 'paid'
        )
    ) THEN
INSERT INTO public.transactions (
        project_id,
        registration_id,
        type,
        category,
        description,
        amount,
        date,
        status,
        payment_method,
        metadata
    )
VALUES (
        NEW.project_id,
        NEW.id,
        'income',
        'Inscrição',
        'Venda de Ingresso: ' || NEW.nome || ' (' || COALESCE(NEW.tipo_inscricao, 'Padrão') || ')',
        COALESCE(NEW.valor_pago, 0),
        CURRENT_DATE,
        'completed',
        'stripe',
        jsonb_build_object('email', NEW.email, 'evento', NEW.evento)
    );
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS trg_sync_registration_finance ON public.inscricoes_growth_experience;
CREATE TRIGGER trg_sync_registration_finance
AFTER
INSERT
    OR
UPDATE ON public.inscricoes_growth_experience FOR EACH ROW EXECUTE FUNCTION public.sync_registration_to_transaction();
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        email TEXT,
        ip_address TEXT,
        success BOOLEAN,
        attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Admins podem ver tentativas de login'
) THEN CREATE POLICY "Admins podem ver tentativas de login" ON public.login_attempts FOR
SELECT USING (public.is_admin());
END IF;
END $$;
DROP VIEW IF EXISTS public.security_suspicious_logins;
CREATE OR REPLACE VIEW public.security_suspicious_logins AS
SELECT email,
    ip_address,
    COUNT(*) as failed_attempts,
    MAX(attempted_at) as last_attempt
FROM public.login_attempts
WHERE success = false
    AND attempted_at > NOW() - INTERVAL '24 hours'
GROUP BY email,
    ip_address
HAVING COUNT(*) >= 5;
DROP VIEW IF EXISTS public.security_user_activity;
CREATE OR REPLACE VIEW public.security_user_activity AS
SELECT u.id,
    u.email,
    u.name,
    u.role,
    MAX(la.attempted_at) FILTER (
        WHERE la.success = true
    ) as last_login_at,
    (
        SELECT ip_address
        FROM public.login_attempts
        WHERE user_id = u.id
            AND success = true
        ORDER BY attempted_at DESC
        LIMIT 1
    ) as last_login_ip,
    COALESCE(u.two_factor_enabled, false) as two_factor_enabled,
    (
        SELECT COUNT(*)
        FROM public.audit_logs
        WHERE user_id = u.id
            AND timestamp > NOW() - INTERVAL '7 days'
    ) as recent_events
FROM public.users u
    LEFT JOIN public.login_attempts la ON u.id = la.user_id
GROUP BY u.id,
    u.email,
    u.name,
    u.role,
    u.two_factor_enabled;