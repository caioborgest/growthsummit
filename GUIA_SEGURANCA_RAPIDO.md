# 🚀 Guia Rápido de Implementação - Segurança Avançada

## ⚡ Passos para Ativar Todas as Funcionalidades

### 1️⃣ Executar Script SQL no Supabase

1. Acesse o Supabase Dashboard: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Copie todo o conteúdo de `SUPABASE_SECURITY_TABLES.sql`
5. Cole no editor e clique em **Run**
6. Aguarde a confirmação de sucesso

### 2️⃣ Instalar Dependências

```bash
cd app
npm install qrcode @types/qrcode
```

### 3️⃣ Adicionar Rota de Segurança no Admin

Edite `app/src/App.tsx` e adicione a rota:

```tsx
import { AdminSecurity } from './pages/admin/AdminSecurity';

// Dentro das rotas do admin:
<Route path="seguranca" element={<AdminSecurity />} />
```

### 4️⃣ Adicionar Link no Menu Admin

Edite `app/src/pages/admin/AdminLayout.tsx` e adicione:

```tsx
import { Shield } from 'lucide-react';

// No menu de navegação:
<Link to="/admin/seguranca">
  <Shield className="h-5 w-5" />
  Segurança
</Link>
```

### 5️⃣ Testar Funcionalidades

#### Teste 1: Login com Rate Limiting
```bash
# Tente fazer login 6 vezes com senha errada
# Deve bloquear após 5 tentativas
```

#### Teste 2: Habilitar 2FA
```bash
# 1. Faça login como admin
# 2. Acesse /admin/seguranca
# 3. Clique em "Habilitar 2FA"
# 4. Escaneie o QR Code com Google Authenticator
# 5. Digite o código de 6 dígitos
```

#### Teste 3: Verificar Logs
```bash
# 1. Acesse /admin/seguranca
# 2. Veja os logs de auditoria
# 3. Clique em "Exportar Logs"
```

---

## 📋 Checklist de Ativação

- [ ] Script SQL executado no Supabase
- [ ] Dependências instaladas (`qrcode`)
- [ ] Rota de segurança adicionada
- [ ] Link no menu admin adicionado
- [ ] Teste de rate limiting realizado
- [ ] Teste de 2FA realizado
- [ ] Logs de auditoria verificados
- [ ] Dashboard de segurança acessível
- [ ] Exportação de logs testada

---

## 🔑 Credenciais de Teste

### Admin (para testar 2FA):
```
Email: admin@growthsummit.com.br
Senha: [sua senha do Supabase]
```

### Criar Novo Admin:
```sql
-- Execute no SQL Editor do Supabase
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES (
  'admin@growthsummit.com.br',
  crypt('SuaSenhaSegura123!', gen_salt('bf')),
  NOW(),
  'authenticated'
);

INSERT INTO public.users (id, email, name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@growthsummit.com.br'),
  'admin@growthsummit.com.br',
  'Administrador',
  'admin'
);
```

---

## 🎯 Funcionalidades Ativas

### ✅ Autenticação
- [x] Login com email/senha
- [x] Magic Link (OTP)
- [x] Recuperação de senha
- [x] Verificação de email
- [x] Persistência de sessão
- [x] Timeout automático (30min)

### ✅ Segurança
- [x] Rate limiting (5 tentativas / 15min)
- [x] 2FA com QR Code
- [x] Logs de auditoria
- [x] Detecção de atividades suspeitas
- [x] Bloqueio de conta
- [x] Rastreamento de IP

### ✅ Headers de Segurança
- [x] Content Security Policy
- [x] HSTS (HTTPS obrigatório)
- [x] X-Frame-Options
- [x] X-Content-Type-Options
- [x] X-XSS-Protection
- [x] Referrer-Policy
- [x] Permissions-Policy

### ✅ Administração
- [x] Dashboard de segurança
- [x] Visualização de logs
- [x] Exportação de dados
- [x] Monitoramento de usuários
- [x] Estatísticas em tempo real

---

## 🔧 Troubleshooting

### Problema: "qrcode module not found"
**Solução:**
```bash
npm install qrcode @types/qrcode
```

### Problema: "Função generate_2fa_secret não existe"
**Solução:**
Execute o script `SUPABASE_SECURITY_TABLES.sql` no Supabase

### Problema: "Permissão negada ao acessar audit_logs"
**Solução:**
Verifique se as políticas RLS foram criadas corretamente

### Problema: "Rate limiting não funciona"
**Solução:**
Limpe o localStorage e teste novamente:
```javascript
localStorage.clear();
```

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase
3. Consulte `SEGURANCA.md` para documentação completa
4. Entre em contato: security@growthsummit.com.br

---

**Status**: ✅ Pronto para Produção  
**Última atualização**: 16/02/2026
