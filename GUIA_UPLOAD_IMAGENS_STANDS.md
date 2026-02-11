# Guia: Upload de Imagens para Supabase Storage
## Growth Experience Triunfo-PE 2026

## 📋 Passo a Passo Completo

### 1️⃣ Configurar Bucket no Supabase

#### Opção A: Via Interface do Supabase (Recomendado)

1. Acesse seu projeto no Supabase: https://supabase.com/dashboard
2. No menu lateral, clique em **Storage**
3. Clique em **"Create a new bucket"**
4. Configure o bucket:
   - **Name**: `event-images`
   - **Public bucket**: ✅ Marque como público (para as imagens serem acessíveis)
   - Clique em **"Create bucket"**

#### Opção B: Via SQL Editor

Execute este SQL no **SQL Editor** do Supabase:

```sql
-- Criar bucket público para imagens do evento
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Permitir leitura pública
CREATE POLICY "Allow public read event-images" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'event-images');

-- Política: Permitir upload para usuários autenticados
CREATE POLICY "Allow authenticated uploads to event-images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'event-images');

-- Política: Admins podem fazer tudo
CREATE POLICY "Admins can manage event-images" 
ON storage.objects FOR ALL 
TO authenticated 
USING (
  bucket_id = 'event-images' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

### 2️⃣ Fazer Upload das Imagens

#### Via Interface do Supabase:

1. No **Storage**, clique no bucket `event-images`
2. Crie as seguintes pastas (clique em "Create folder"):
   - `stands`
   - `palestrantes`

#### A. Upload das Imagens dos Stands

1. Entre na pasta `stands`
2. Clique em **"Upload file"**
3. Faça upload das 5 imagens com os seguintes nomes:
   - `stand-diamante-sebrae.png` (imagem do Sebrae - stand premium)
   - `stand-diamante.png` (imagem do Sicoob - stand grande)
   - `stand-ouro-png` (imagem do UNINASSAU - stand médio)
   - `stand-prata.png` (imagem do GX Growth Experience - stand padrão)
   - `stand-bronze.png` (imagem do GX menor - stand pequeno)

#### B. Upload das Imagens dos Palestrantes

1. Volte para a raiz do bucket e entre na pasta `palestrantes`
2. Clique em **"Upload file"**
3. Faça upload das 3 imagens com os seguintes nomes:
   - `leandro-batista.png` (homem de camisa preta polo, braços cruzados)
   - `vanylton-matias.png` (homem de terno azul)
   - `palestrantes-juntos.png` (foto dos dois juntos - opcional, para banner)

---

### 3️⃣ Obter URLs das Imagens

Após o upload, você terá URLs públicas no formato:

```
https://[SEU-PROJETO].supabase.co/storage/v1/object/public/event-images/stands/stand-diamante.jpg
https://[SEU-PROJETO].supabase.co/storage/v1/object/public/event-images/stands/stand-ouro.jpg
https://[SEU-PROJETO].supabase.co/storage/v1/object/public/event-images/stands/stand-prata-plus.jpg
https://[SEU-PROJETO].supabase.co/storage/v1/object/public/event-images/stands/stand-prata.jpg
https://[SEU-PROJETO].supabase.co/storage/v1/object/public/event-images/stands/stand-bronze.jpg
```

**Para obter a URL base do seu projeto:**
1. No Supabase, vá em **Settings** > **API**
2. Copie a **URL** (algo como `https://xxxxx.supabase.co`)

---

### 4️⃣ Atualizar o Código da Página

Após fazer o upload, vou atualizar a página `GrowthExperienceTriunfo.tsx` para incluir as imagens dos stands.

---

## 🔧 Alternativa: Upload Programático

Se preferir fazer upload via código, posso criar um script para você. Basta me informar:
1. A URL do seu projeto Supabase
2. Se você já tem um usuário admin autenticado

---

## ✅ Checklist

- [x ] Bucket `event-images` criado no Supabase
- [ x] Bucket configurado como **público**
- [x ] Pasta `stands` criada dentro do bucket
- [x ] 5 imagens enviadas com os nomes corretos
- [x ] URLs das imagens obtidas
- [ ] Código da página atualizado (farei isso após você confirmar o upload)

---

## 📝 Observações Importantes

1. **Tamanho das Imagens**: Recomendo otimizar as imagens antes do upload:
   - Largura máxima: 1200px
   - Formato: JPG ou WebP
   - Qualidade: 80-85%

2. **Nomenclatura**: Use nomes consistentes e sem espaços:
   - ✅ `stand-diamante.png`
   - ❌ `Stand Diamante.jpg`

3. **Organização**: Mantenha a estrutura de pastas:
   ```
   event-images/
   └── stands/
       ├── stand-diamante.png
       ├── stand-ouro.png
       ├── stand-prata-plus.ng
       ├── stand-prata.png
       └── stand-bronze.png
   ```

---

## 🚀 Próximos Passos

Após fazer o upload das imagens:

1. Me informe a **URL base** do seu projeto Supabase
2. Confirme que as imagens foram enviadas
3. Vou atualizar automaticamente o código para exibir as imagens na página

**Precisa de ajuda com algum passo?** Me avise!
