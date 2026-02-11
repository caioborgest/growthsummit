# URLs das Imagens - Supabase Storage
## Growth Experience Triunfo-PE 2026

---

## 📍 Informações do Projeto

- **URL do Projeto**: `https://zczfutmymobgypbbamme.supabase.co`
- **Bucket**: `event-images`
- **Status**: Bucket deve estar configurado como **público**

---

## 🖼️ URLs Completas das Imagens dos Stands

Após fazer o upload das imagens, elas estarão disponíveis nas seguintes URLs:

### Stand Diamante
```
https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/stands/stand-diamante.jpg
```

### Stand Ouro
```
https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/stands/stand-ouro.jpg
```

### Stand Prata Plus
```
https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/stands/stand-prata-plus.jpg
```

### Stand Prata
```
https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/stands/stand-prata.jpg
```

### Stand Bronze
```
https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/stands/stand-bronze.jpg
```

---

## 👥 URLs Completas das Imagens dos Palestrantes

### Leandro Batista
```
https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/palestrantes/leandro-batista.jpg
```

### Vanylton Matias
```
https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/palestrantes/vanylton-matias.jpg
```

### Palestrantes Juntos (Opcional)
```
https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/palestrantes/palestrantes-juntos.jpg
```

---

## ✅ Checklist de Implementação

- [x] **Código atualizado** - Página `GrowthExperienceTriunfo.tsx` agora exibe imagens dos stands
- [x] **Código atualizado** - Página já exibia imagens dos palestrantes
- [x] **URL do Supabase configurada** - `storage.ts` atualizado com a URL correta
- [ ] **Bucket criado** - Criar bucket `event-images` no Supabase
- [ ] **Pastas criadas** - Criar pastas `stands` e `palestrantes` dentro do bucket
- [ ] **Imagens enviadas** - Fazer upload das 5 imagens dos stands
- [ ] **Imagens enviadas** - Fazer upload das 2-3 imagens dos palestrantes
- [ ] **Teste visual** - Verificar se as imagens aparecem corretamente na página

---

## 🚀 Próximos Passos

### 1. Criar o Bucket no Supabase

Acesse: https://supabase.com/dashboard/project/zczfutmymobgypbbamme/storage

1. Clique em **"Create a new bucket"**
2. Nome: `event-images`
3. Marque como **público** ✅
4. Clique em **"Create bucket"**

### 2. Criar as Pastas

Dentro do bucket `event-images`:
1. Clique em **"Create folder"**
2. Crie a pasta `stands`
3. Crie a pasta `palestrantes`

### 3. Fazer Upload das Imagens

#### Stands (5 imagens):
- `stand-diamante.jpg` - Stand premium (10m x 10m)
- `stand-ouro.jpg` - Stand grande (5m x 12m)
- `stand-prata-plus.jpg` - Stand médio (5m x 6m)
- `stand-prata.jpg` - Stand padrão (5m x 3m)
- `stand-bronze.jpg` - Stand pequeno (3m x 1,5m)

#### Palestrantes (2-3 imagens):
- `leandro-batista.jpg` - CEO Fitness Exclusive
- `vanylton-matias.jpg` - CEO Grupo Núcleo
- `palestrantes-juntos.jpg` - (Opcional) Foto dos dois juntos

### 4. Testar a Página

Após fazer o upload:
1. Acesse a página do evento
2. Verifique se as imagens dos stands aparecem na seção de patrocínios
3. Verifique se as imagens dos palestrantes aparecem corretamente
4. Se alguma imagem não carregar, um placeholder será exibido automaticamente

---

## 🔧 Configuração Alternativa via SQL

Se preferir configurar via SQL, execute no **SQL Editor** do Supabase:

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

## 📝 Observações Importantes

### Otimização de Imagens
Antes de fazer upload, otimize as imagens:
- **Largura máxima**: 1200px
- **Formato**: JPG ou WebP
- **Qualidade**: 80-85%
- **Tamanho**: < 500KB por imagem

### Nomenclatura
Use exatamente os nomes especificados:
- ✅ `stand-diamante.jpg`
- ❌ `Stand Diamante.jpg`
- ❌ `stand_diamante.jpg`

### Fallback
Se uma imagem não carregar:
- **Stands**: Exibirá um placeholder cinza com texto "Imagem do Stand"
- **Palestrantes**: Exibirá um placeholder com ícone de pessoa

---

## 🎨 Estrutura Final do Storage

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
    └── palestrantes-juntos.jpg (opcional)
```

---

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Verifique se o bucket está marcado como **público**
2. Confirme que os nomes dos arquivos estão corretos
3. Teste as URLs diretamente no navegador
4. Verifique o console do navegador para erros

**Tudo pronto!** Assim que você fizer o upload das imagens, elas aparecerão automaticamente na página. 🚀
