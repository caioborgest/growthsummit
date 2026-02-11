# 📸 Guia Completo: Upload de Imagens para Supabase
## Growth Experience Triunfo-PE 2026

---

## ✅ Resumo do que foi implementado

Implementei o sistema completo para gerenciar as imagens dos **stands de patrocínio** e dos **palestrantes** na página Growth Experience Triunfo-PE. Agora você só precisa fazer o upload das imagens no Supabase!

---

## 📋 Passo a Passo

### 1️⃣ Configurar Bucket no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**
4. Clique em **"Create a new bucket"**
5. Configure:
   - **Name**: `event-images`
   - **Public bucket**: ✅ **MARQUE COMO PÚBLICO**
   - Clique em **"Create bucket"**

---

### 2️⃣ Criar Estrutura de Pastas

Dentro do bucket `event-images`, crie 2 pastas:

1. Clique no bucket `event-images`
2. Clique em **"Create folder"**
3. Crie a pasta: `stands`
4. Volte e crie outra pasta: `palestrantes`

---

### 3️⃣ Upload das Imagens dos Stands

1. Entre na pasta `stands`
2. Clique em **"Upload file"**
3. Faça upload das 5 imagens com **EXATAMENTE** estes nomes:

| Arquivo | Descrição |
|---------|-----------|
| `stand-diamante.jpg` | Stand GX Growth Experience (premium) |
| `stand-ouro.jpg` | Stand Sicoob (grande) |
| `stand-prata-plus.jpg` | Stand SEBRAE (médio) |
| `stand-prata.jpg` | Stand UNINASSAU (padrão) |
| `stand-bronze.jpg` | Stand GX menor (pequeno) |

**⚠️ IMPORTANTE:** Os nomes devem ser **exatamente** como mostrado acima (minúsculas, com hífens).

---

### 4️⃣ Upload das Imagens dos Palestrantes

1. Volte para o bucket e entre na pasta `palestrantes`
2. Clique em **"Upload file"**
3. Faça upload das 3 imagens com **EXATAMENTE** estes nomes:

| Arquivo | Descrição |
|---------|-----------|
| `leandro-batista.jpg` | Leandro Batista (camisa preta polo) |
| `vanylton-matias.jpg` | Vanylton Matias (terno azul) |
| `palestrantes-juntos.jpg` | Foto dos dois juntos (opcional) |

---

### 5️⃣ Configurar URL do Supabase no Projeto

Após fazer o upload, você precisa configurar a URL do seu projeto:

1. No Supabase, vá em **Settings** > **API**
2. Copie a **Project URL** (algo como `https://xxxxx.supabase.co`)
3. Abra o arquivo `.env` na raiz do projeto `app/`
4. Adicione ou atualize a linha:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   ```
   (substitua pela URL que você copiou)

---

## 🎯 Estrutura Final no Supabase

Após concluir, sua estrutura deve estar assim:

```
event-images/
├── stands/
│   ├── stand-diamante.jpg
│   ├── stand-ouro.jpg
│   ├── stand-prata-plus.jpg
│   ├── stand-prata.jpg
│   └── stand-bronze.jpg
└── palestrantes/
    ├── leandro-batista.jpg
    ├── vanylton-matias.jpg
    └── palestrantes-juntos.jpg
```

---

## ✨ O que acontece automaticamente

Após fazer o upload e configurar a URL:

1. ✅ As imagens dos **palestrantes** aparecerão na seção "Palestrantes"
2. ✅ As imagens dos **stands** aparecerão nas cotas de patrocínio (quando implementado)
3. ✅ Se alguma imagem não carregar, um **placeholder** será exibido automaticamente
4. ✅ Todas as imagens terão **fallback** para evitar erros

---

## 🔧 Arquivos Criados/Modificados

### Novos Arquivos:
- `app/src/lib/storage.ts` - Helper para gerenciar URLs das imagens
- `GUIA_UPLOAD_IMAGENS_STANDS.md` - Este guia

### Arquivos Modificados:
- `app/src/pages/public/GrowthExperienceTriunfo.tsx` - Página atualizada com imagens

---

## 📝 Checklist Final

- [ ] Bucket `event-images` criado no Supabase
- [ ] Bucket configurado como **público**
- [ ] Pasta `stands` criada
- [ ] Pasta `palestrantes` criada
- [ ] 5 imagens dos stands enviadas com nomes corretos
- [ ] 3 imagens dos palestrantes enviadas com nomes corretos
- [ ] URL do Supabase configurada no `.env`
- [ ] Aplicação reiniciada (`npm run dev`)

---

## 🚀 Testando

Após concluir:

1. Reinicie o servidor de desenvolvimento:
   ```bash
   cd app
   npm run dev
   ```

2. Acesse: `http://localhost:5173/growth-experience-triunfo`

3. Verifique se as imagens dos palestrantes estão aparecendo

---

## ❓ Troubleshooting

### Imagens não aparecem?

1. **Verifique os nomes dos arquivos** - Devem ser exatamente como especificado
2. **Verifique se o bucket é público** - No Supabase Storage, bucket deve estar marcado como "Public"
3. **Verifique a URL no .env** - Deve ser a URL correta do seu projeto
4. **Limpe o cache** - Ctrl+Shift+R no navegador

### Como verificar se as URLs estão corretas?

Abra o console do navegador (F12) e digite:
```javascript
import { palestrantesImages } from './src/lib/storage';
console.log(palestrantesImages);
```

As URLs devem começar com `https://seu-projeto.supabase.co/storage/v1/object/public/...`

---

## 📞 Precisa de Ajuda?

Se encontrar algum problema:

1. Verifique o console do navegador (F12) para erros
2. Verifique se as políticas do bucket estão corretas
3. Teste acessando diretamente uma URL de imagem no navegador

---

**Pronto! Suas imagens estarão integradas na página! 🎉**
