ALTER TABLE public.lotes_inscricao_empresa
ADD COLUMN nome_responsavel TEXT,
    ADD COLUMN email_responsavel TEXT;
UPDATE public.lotes_inscricao_empresa
SET email_responsavel = email_contato
WHERE email_responsavel IS NULL;