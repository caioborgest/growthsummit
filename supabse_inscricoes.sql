-- Tabela para armazenar as inscrições do Growth Experience Triunfo
create table if not exists public.inscricoes_growth_experience (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    nome text not null,
    email text not null,
    telefone text not null,
    cursos_selecionados jsonb not null default '[]'::jsonb,
    palestras_noturnas boolean default false,
    valor_pago decimal(10, 2) default 0,
    status_pagamento text default 'pendente',
    -- pendente, pago, cancelado
    app_instalado boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Habilitar RLS
alter table public.inscricoes_growth_experience enable row level security;
-- Políticas de Segurança (RLS) - SIMPLIFICADAS
-- 1. Usuários podem ver APENAS suas próprias inscrições
create policy "Usuários ver proprias inscricoes" on public.inscricoes_growth_experience for
select using (auth.uid() = user_id);
-- 2. Usuários podem criar suas próprias inscrições
create policy "Usuários criar inscricoes" on public.inscricoes_growth_experience for
insert with check (auth.uid() = user_id);
-- 3. Usuários podem atualizar seus dados (opcional, para completar cadastro)
create policy "Usuários atualizar proprias inscricoes" on public.inscricoes_growth_experience for
update using (auth.uid() = user_id);
-- OBS: Admins usam o painel do Supabase com a role 'service_role' que bypassa o RLS.
-- Se precisar de acesso admin via API no futuro, criar tabela de roles.