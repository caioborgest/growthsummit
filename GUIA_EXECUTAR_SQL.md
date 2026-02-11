# 🚀 GUIA RÁPIDO: Executar SQL no Supabase
## Growth Experience Triunfo-PE

---

## 📄 ARQUIVO SQL

**Nome**: `SUPABASE_GROWTH_EXPERIENCE_TRIUNFO.sql`  
**Localização**: Raiz do projeto  
**Tamanho**: 364 linhas

---

## 🎯 O QUE ESTE SQL FAZ

### **Cria 4 Tabelas**:
1. **`inscricoes_growth_experience_triunfo`**
   - Inscrições para palestras, mentores e cursos
   - Campos: nome, email, telefone, tipo_inscricao, valor, status
   - Suporta pagamento via Stripe (futuro)

2. **`startups_arena_pitch`**
   - Inscrições de startups para Arena Pitch
   - Campos: fundador, startup, pitch, documentos, pontuação
   - Status: pendente, aprovado, reprovado, finalista, vencedor

3. **`rodada_negocios_b2b`**
   - Inscrições de empresas para Rodada B2B
   - Campos: representante, empresa, objetivos, tipo_interesse
   - Status: pendente, aprovado, reprovado

4. **`pagamentos_stripe`**
   - Logs de pagamentos (preparado para futuro)
   - Campos: stripe_payment_intent_id, valor, status

### **Recursos Adicionais**:
- ✅ **Triggers** - Atualização automática de `updated_at`
- ✅ **RLS Policies** - Segurança de acesso aos dados
- ✅ **Views** - Estatísticas consolidadas
- ✅ **Índices** - Performance otimizada

---

## 🔧 COMO EXECUTAR (Passo a Passo)

### **Passo 1: Acessar o Supabase SQL Editor** (1 min)

1. Acesse: https://supabase.com/dashboard/project/zczfutmymobgypbbamme/sql/new
2. Ou navegue manualmente:
   - Dashboard do Supabase
   - Selecione o projeto `zczfutmymobgypbbamme`
   - Menu lateral → **SQL Editor**
   - Clique em **New query**

### **Passo 2: Copiar o SQL** (1 min)

1. Abra o arquivo `SUPABASE_GROWTH_EXPERIENCE_TRIUNFO.sql`
2. Selecione todo o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)

### **Passo 3: Colar no SQL Editor** (1 min)

1. No SQL Editor do Supabase
2. Cole o conteúdo (Ctrl+V)
3. Verifique se todo o SQL foi colado (364 linhas)

### **Passo 4: Executar** (1 min)

1. Clique no botão **"Run"** (ou pressione F5)
2. Aguarde a execução (leva ~5-10 segundos)
3. Verifique se apareceu **"Success. No rows returned"**

### **Passo 5: Verificar** (2 min)

1. Menu lateral → **Table Editor**
2. Verifique se as 4 tabelas foram criadas:
   - ✅ `inscricoes_growth_experience_triunfo`
   - ✅ `startups_arena_pitch`
   - ✅ `rodada_negocios_b2b`
   - ✅ `pagamentos_stripe`

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Após executar o SQL, verifique:

### **Tabelas Criadas**
- [ ] `inscricoes_growth_experience_triunfo` existe
- [ ] `startups_arena_pitch` existe
- [ ] `rodada_negocios_b2b` existe
- [ ] `pagamentos_stripe` existe

### **Estrutura das Tabelas**
- [ ] Cada tabela tem os campos corretos
- [ ] Constraints (CHECK, UNIQUE) estão aplicados
- [ ] Valores padrão estão configurados

### **Índices**
- [ ] Índices criados para performance
- [ ] Índices em campos de busca (email, status, etc.)

### **Triggers**
- [ ] Trigger `update_updated_at` existe
- [ ] Aplicado em todas as 4 tabelas

### **RLS Policies**
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas de inserção pública criadas
- [ ] Políticas de leitura própria criadas
- [ ] Políticas de admin criadas

### **Views**
- [ ] `estatisticas_inscricoes` criada
- [ ] `estatisticas_startups` criada
- [ ] `estatisticas_rodada_b2b` criada

---

## 🚨 POSSÍVEIS ERROS

### **Erro: "relation already exists"**
**Causa**: Tabelas já foram criadas anteriormente  
**Solução**: Tudo bem! O SQL usa `CREATE TABLE IF NOT EXISTS`, então não há problema

### **Erro: "permission denied"**
**Causa**: Falta de permissões no Supabase  
**Solução**: Certifique-se de estar logado como owner do projeto

### **Erro: "syntax error"**
**Causa**: SQL não foi copiado completamente  
**Solução**: Copie novamente todo o conteúdo do arquivo

---

## 📊 APÓS EXECUTAR

### **O que acontece**:
1. ✅ Banco de dados pronto para receber inscrições
2. ✅ Formulários da página pública funcionarão
3. ✅ Painel admin conseguirá ler os dados
4. ✅ Estatísticas serão calculadas automaticamente

### **Próximos passos**:
1. Testar formulários na página pública
2. Verificar dados no painel admin
3. Fazer inscrições de teste

---

## 🔗 LINKS ÚTEIS

### **Supabase Dashboard**
- **Projeto**: https://supabase.com/dashboard/project/zczfutmymobgypbbamme
- **SQL Editor**: https://supabase.com/dashboard/project/zczfutmymobgypbbamme/sql/new
- **Table Editor**: https://supabase.com/dashboard/project/zczfutmymobgypbbamme/editor

### **Documentação**
- **Supabase SQL**: https://supabase.com/docs/guides/database/overview
- **RLS Policies**: https://supabase.com/docs/guides/auth/row-level-security

---

## 💡 DICAS

### **Backup**
Antes de executar, você pode fazer backup:
1. Menu lateral → **Database**
2. Clique em **Backups**
3. Clique em **Create backup**

### **Teste**
Após executar, teste inserindo dados:
```sql
-- Teste de inserção
INSERT INTO inscricoes_growth_experience_triunfo 
(nome, email, telefone, tipo_inscricao, valor)
VALUES 
('Teste', 'teste@email.com', '88999999999', 'palestra', 179.99);

-- Verificar
SELECT * FROM inscricoes_growth_experience_triunfo;
```

### **Limpar Dados de Teste**
```sql
-- Deletar dados de teste
DELETE FROM inscricoes_growth_experience_triunfo WHERE email = 'teste@email.com';
```

---

## ✅ CONCLUSÃO

**Tempo total**: 5-10 minutos  
**Dificuldade**: Fácil  
**Resultado**: Banco de dados 100% pronto

Após executar este SQL, o sistema estará **100% funcional**! 🚀

---

**Boa sorte! 🎉**
