# Growth Summit 2026 - Supabase Setup

## 📋 Estrutura do Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema (estende auth.users) |
| `profiles` | Perfis detalhados dos usuários |
| `projects` | Eventos/projetos (Growth Summit, Experience, etc.) |
| `registrations` | Inscrições dos participantes |
| `sessions` | Palestras, workshops do evento |
| `speakers` | Palestrantes |
| `mentors` | Mentores disponíveis |
| `mentoring_sessions` | Sessões de mentoria agendadas |
| `companies` | Empresas B2B (anchors e vendors) |
| `b2b_meetings` | Reuniões B2B agendadas |
| `startups` | Startups participantes |
| `leads` | Leads capturados pelas startups |
| `sponsors` | Patrocinadores |
| `sponsor_deliverables` | Entregáveis dos patrocinadores |
| `transactions` | Transações financeiras |
| `check_ins` | Registros de check-in |
| `email_templates` | Templates de email |
| `email_campaigns` | Campanhas de email |
| `notifications` | Notificações dos usuários |
| `activity_logs` | Logs de auditoria |

## 🚀 Setup Inicial

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a anon key

### 2. Executar Schema

No SQL Editor do Supabase, execute o arquivo `schema.sql`:

```sql
-- Copie todo o conteúdo de schema.sql e execute
```

### 3. Inserir Dados de Exemplo (Opcional)

```sql
-- Execute seeds.sql para popular com dados de teste
```

### 4. Configurar Autenticação

No Dashboard do Supabase:

1. **Authentication > Settings**
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/auth/callback`

2. **Authentication > Providers**
   - Habilite Email provider
   - Configure Google OAuth (opcional)
   - Configure LinkedIn OAuth (opcional)

### 5. Configurar Storage (para uploads)

1. **Storage > New Bucket**
   - `avatars` - Fotos de perfil
   - `documents` - Documentos do evento
   - `pitch-decks` - Pitch decks das startups
   - `logos` - Logos de empresas

2. **Storage > Policies**
   - Configure políticas de acesso (RLS)

## 🔐 Variáveis de Ambiente

Adicione ao seu `.env`:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

## 📊 Relacionamentos

```
projects
├── registrations → users
├── sessions
│   └── session_speakers → speakers
├── mentors
│   └── mentoring_sessions → users (mentees)
├── companies
│   └── b2b_meetings
├── startups
│   └── leads
├── sponsors
│   └── sponsor_deliverables
├── transactions
└── check_ins → registrations

users
├── profiles
├── registrations
├── mentoring_sessions
├── notifications
└── activity_logs
```

## 🔒 Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado com políticas:

- **Usuários**: Veem apenas seus próprios dados
- **Admins**: Acesso total
- **Público**: Apenas projetos ativos

## 📝 Funções e Triggers

| Função | Descrição |
|--------|-----------|
| `update_updated_at_column()` | Atualiza timestamp automaticamente |
| `generate_ticket_number()` | Gera número de ticket único |
| `log_activity()` | Registra atividades (audit trail) |

## 🧪 Queries Úteis

### Dashboard Stats
```sql
SELECT 
    (SELECT COUNT(*) FROM registrations WHERE project_id = '550e8400-e29b-41d4-a716-446655440000' AND status = 'paid') as total_registrations,
    (SELECT SUM(final_amount) FROM registrations WHERE project_id = '550e8400-e29b-41d4-a716-446655440000' AND status = 'paid') as total_revenue,
    (SELECT COUNT(*) FROM mentoring_sessions WHERE project_id = '550e8400-e29b-41d4-a716-446655440000') as total_mentories,
    (SELECT COUNT(*) FROM check_ins WHERE project_id = '550e8400-e29b-41d4-a716-446655440000' AND DATE(timestamp) = CURRENT_DATE) as checkins_today;
```

### Inscrições por Tipo de Ticket
```sql
SELECT 
    ticket_type,
    COUNT(*) as count,
    SUM(final_amount) as revenue
FROM registrations 
WHERE project_id = '550e8400-e29b-41d4-a716-446655440000' 
AND status = 'paid'
GROUP BY ticket_type;
```

### Mentorias Pendentes
```sql
SELECT 
    ms.id,
    m.name as mentor_name,
    u.name as mentee_name,
    ms.scheduled_at,
    ms.topic
FROM mentoring_sessions ms
JOIN mentors m ON ms.mentor_id = m.id
JOIN users u ON ms.mentee_id = u.id
WHERE ms.status = 'scheduled'
AND ms.scheduled_at > NOW()
ORDER BY ms.scheduled_at;
```

## 🔄 Migrations

Para criar uma nova migration:

```bash
# Usando Supabase CLI
supabase migration new nome_da_migration

# Edite o arquivo gerado em supabase/migrations/
# Aplique a migration
supabase db push
```

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Postgres RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
