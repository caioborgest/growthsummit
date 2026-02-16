# 🚨 INSTRUÇÕES CRÍTICAS - LEIA AGORA (ATUALIZADO)

O erro anterior (`relation "public.user_roles" does not exist`) ocorreu porque o script tentava verificar permissões de admin em uma tabela que ainda não existe no seu projeto.

**CORREÇÃO APLICADA**: Atualizei o script `supabse_inscricoes.sql` para remover essa dependência.

## ✅ PASSO OBRIGATÓRIO (CORRIGIDO):

1. Acesse o **Supabase Dashboard**.
2. Vá para **SQL Editor**.
3. **Apague qualquer script anterior** que tenha falhado.
4. Copie e cole o **NOVO CONTEÚDO** do arquivo:
   👉 `supabse_inscricoes.sql` (já atualizado na sua pasta)
5. Clique em **Run**.

**Agora deve funcionar sem erros!**

---

## 2️⃣ O que foi implementado?

- **Fluxo de 6 Etapas**:
  1. Seleção de Cursos (Mínimo 1)
  2. Cadastro (Nome, Email, Senha)
  3. Confirmação
  4. Oferta Palestra Noturna (R$ 179,99)
  5. Download do App (Obrigatório)
  6. Conclusão

- **Programação Completa**:
  - Nova visualização da grade com filtros e busca.
  - Substitui a visualização antiga de abas.

---

## 3️⃣ Como Testar?

1. Rode o projeto: `npm run dev` (já deve estar rodando)
2. Acesse: `http://localhost:5173/growth-experience-triunfo`
3. Role até "Programação" ou clique em "Garantir Minha Vaga".
4. O novo modal deve abrir.
5. Tente se inscrever (use um email novo a cada teste ou limpe o Auth).

---

## 4️⃣ Dúvidas?

Verifique o arquivo `STATUS_INSCRICAO_MULTISTEP.md` para detalhes técnicos.
