# Guia de Deploy no Vercel - Growth Summit 2026

## 📋 Pré-requisitos

- Conta no Vercel (vercel.com)
- Repositório no GitHub/GitLab/Bitbucket
- Node.js 18+ instalado localmente

## 🚀 Passos para Deploy

### 1. Preparação do Repositório

Certifique-se de que os seguintes arquivos estão no repositório:

- `vercel.json` - Configuração do Vercel
- `package.json` - Dependências e scripts
- `vite.config.ts` - Configuração do Vite
- `index.html` - Entry point

### 2. Configuração de Variáveis de Ambiente (OBRIGATÓRIO)

No painel da Vercel, configure estas variáveis em **Settings > Environment Variables**:

#### Supabase (Essencial)
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_publica
```

#### Aplicação
```
VITE_APP_NAME=Growth Summit 2026
VITE_APP_URL=https://seu-dominio.vercel.app
VITE_ENVIRONMENT=production
```

#### Stripe (Se usar pagamentos)
```
VITE_STRIPE_PUBLIC_KEY=pk_live_sua_chave
```

#### Analytics (Opcional)
```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Deploy

**Opção A: Via CLI**
```bash
npm i -g vercel
vercel --prod
```

**Opção B: Via Git Integration**
1. Conecte seu repositório no dashboard da Vercel
2. Configure o diretório raiz como `app/`
3. O deploy será automático a cada push na branch principal

### 4. Configurações Importantes no Vercel

No dashboard da Vercel, configure:

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Root Directory**: `app` (se o código estiver na pasta app/)

## 🔒 Segurança

### Variáveis que NÃO devem ser expostas no client:
- `SUPABASE_SERVICE_ROLE_KEY` ❌
- `STRIPE_SECRET_KEY` ❌
- `JWT_SECRET` ❌
- `RESEND_API_KEY` ❌
- `DATABASE_URL` ❌

### Variáveis que PODEM ser expostas (prefixo VITE_):
- `VITE_SUPABASE_URL` ✅
- `VITE_SUPABASE_ANON_KEY` ✅
- `VITE_STRIPE_PUBLIC_KEY` ✅
- `VITE_APP_NAME` ✅

## ✅ Checklist Pré-Deploy

- [ ] Todas as variáveis VITE_ configuradas no Vercel
- [ ] Build local executa sem erros: `npm run build`
- [ ] Preview local funciona: `npm run preview`
- [ ] Credenciais sensíveis removidas do .env.example
- [ ] .gitignore configurado corretamente
- [ ] vercel.json criado na pasta app/

## 🛠 Solução de Problemas

### Erro 404 em rotas
O `vercel.json` já está configurado com rewrites para SPA. Se persistir, verifique:
- Se o arquivo está no diretório correto
- Se foi commitado no git

### Erro de variáveis de ambiente
- Apenas variáveis com prefixo `VITE_` são acessíveis no código client-side
- Variáveis sem prefixo são apenas server-side

### Build falha
```bash
# Limpar cache
rm -rf node_modules dist
npm install
npm run build
```

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs de build no dashboard da Vercel
2. Teste o build localmente primeiro
3. Confirme todas as variáveis de ambiente estão configuradas
