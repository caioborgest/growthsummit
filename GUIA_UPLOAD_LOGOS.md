# 📤 GUIA DE UPLOAD DE LOGOS - Growth Experience Triunfo-PE
## Como Organizar as Logomarcas no Supabase Storage

---

## 🎯 OBJETIVO

Organizar as logomarcas dos patrocinadores e expositores no Supabase Storage para exibição na página do evento.

---

## 📁 ESTRUTURA DE PASTAS

Crie a seguinte estrutura no bucket `event-images`:

```
event-images/
└── logos/
    ├── sebrae.png
    ├── prefeitura-triunfo.png
    ├── governo-pe.png
    ├── parceiro-4.png
    ├── expositor-tech-1.png
    ├── expositor-tech-2.png
    ├── expositor-tech-3.png
    ├── expositor-tech-4.png
    ├── expositor-tech-5.png
    ├── expositor-tech-6.png
    ├── expositor-servicos-1.png
    ├── expositor-servicos-2.png
    ├── expositor-servicos-3.png
    ├── expositor-servicos-4.png
    ├── expositor-servicos-5.png
    ├── expositor-servicos-6.png
    ├── expositor-comercio-1.png
    ├── expositor-comercio-2.png
    ├── expositor-comercio-3.png
    ├── expositor-comercio-4.png
    ├── expositor-comercio-5.png
    └── expositor-comercio-6.png
```

---

## 🔧 PASSO A PASSO

### **1. Acessar o Supabase Storage**

1. Acesse: https://supabase.com/dashboard/project/zczfutmymobgypbbamme/storage/buckets
2. Clique no bucket `event-images`

### **2. Criar a Pasta de Logos**

1. Clique em "Create folder" (ou "Nova pasta")
2. Digite: `logos`
3. Clique em "Create"

### **3. Upload das Logos**

#### **Patrocinadores Principais**

Faça upload das seguintes logos (formato PNG ou JPG):

- `sebrae.png` - Logo do SEBRAE
- `prefeitura-triunfo.png` - Logo da Prefeitura de Triunfo
- `governo-pe.png` - Logo do Governo de Pernambuco
- `parceiro-4.png` - Logo de outro parceiro (opcional)

#### **Expositores - Tecnologia e Inovação**

Faça upload de 6 logos com os nomes:
- `expositor-tech-1.png`
- `expositor-tech-2.png`
- `expositor-tech-3.png`
- `expositor-tech-4.png`
- `expositor-tech-5.png`
- `expositor-tech-6.png`

#### **Expositores - Serviços e Consultoria**

Faça upload de 6 logos com os nomes:
- `expositor-servicos-1.png`
- `expositor-servicos-2.png`
- `expositor-servicos-3.png`
- `expositor-servicos-4.png`
- `expositor-servicos-5.png`
- `expositor-servicos-6.png`

#### **Expositores - Comércio e Varejo**

Faça upload de 6 logos com os nomes:
- `expositor-comercio-1.png`
- `expositor-comercio-2.png`
- `expositor-comercio-3.png`
- `expositor-comercio-4.png`
- `expositor-comercio-5.png`
- `expositor-comercio-6.png`

---

## 📐 ESPECIFICAÇÕES DAS IMAGENS

### **Patrocinadores Principais**
- **Formato**: PNG (com fundo transparente) ou JPG
- **Tamanho recomendado**: 400x160px (proporção 5:2)
- **Tamanho máximo**: 800x320px
- **Peso**: Máximo 200KB

### **Expositores**
- **Formato**: PNG (com fundo transparente) ou JPG
- **Tamanho recomendado**: 200x200px (quadrado)
- **Tamanho máximo**: 400x400px
- **Peso**: Máximo 100KB

---

## 🎨 DICAS DE DESIGN

### 1. **Fundo Transparente**
- Use PNG com fundo transparente para melhor resultado
- Se usar JPG, use fundo branco

### 2. **Qualidade**
- Logos vetoriais são ideais
- Evite logos pixeladas ou de baixa qualidade

### 3. **Proporção**
- Mantenha a proporção original da logo
- Não distorça as imagens

### 4. **Otimização**
- Comprima as imagens antes do upload
- Use ferramentas como TinyPNG ou Squoosh

---

## ✅ CHECKLIST DE UPLOAD

### Patrocinadores
- [ ] sebrae.png
- [ ] prefeitura-triunfo.png
- [ ] governo-pe.png
- [ ] parceiro-4.png (opcional)

### Tecnologia (6 logos)
- [ ] expositor-tech-1.png
- [ ] expositor-tech-2.png
- [ ] expositor-tech-3.png
- [ ] expositor-tech-4.png
- [ ] expositor-tech-5.png
- [ ] expositor-tech-6.png

### Serviços (6 logos)
- [ ] expositor-servicos-1.png
- [ ] expositor-servicos-2.png
- [ ] expositor-servicos-3.png
- [ ] expositor-servicos-4.png
- [ ] expositor-servicos-5.png
- [ ] expositor-servicos-6.png

### Comércio (6 logos)
- [ ] expositor-comercio-1.png
- [ ] expositor-comercio-2.png
- [ ] expositor-comercio-3.png
- [ ] expositor-comercio-4.png
- [ ] expositor-comercio-5.png
- [ ] expositor-comercio-6.png

---

## 🔗 URLS GERADAS

Após o upload, as URLs serão:

### Patrocinadores
```
https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/logos/sebrae.png
https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/logos/prefeitura-triunfo.png
https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/logos/governo-pe.png
```

### Expositores
```
https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/logos/expositor-tech-1.png
https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/logos/expositor-servicos-1.png
https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/logos/expositor-comercio-1.png
```

---

## 🚨 IMPORTANTE

### **Nomes dos Arquivos**
- Use **exatamente** os nomes especificados
- Tudo em minúsculas
- Use hífens (-) ao invés de espaços
- Extensão: `.png` ou `.jpg`

### **Fallback Automático**
- Se uma logo não carregar, aparecerá um placeholder SVG
- Não se preocupe se não tiver todas as logos agora
- Você pode adicionar mais logos depois

---

## 🔄 ADICIONAR MAIS EXPOSITORES

Se precisar adicionar mais de 6 expositores por categoria:

### No código (SECAO_EXPOSICAO_NEGOCIOS.md):
```tsx
// Mude de [1, 2, 3, 4, 5, 6] para [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
  // ... código do card
))}
```

### No Supabase:
Faça upload das logos adicionais:
- `expositor-tech-7.png`
- `expositor-tech-8.png`
- etc.

---

## 🎯 RESULTADO ESPERADO

Quando tudo estiver configurado:

- ✅ Logos dos patrocinadores em destaque
- ✅ Logos dos expositores organizadas por categoria
- ✅ Efeito grayscale → color no hover
- ✅ Fallback automático para logos ausentes
- ✅ Carregamento rápido e otimizado

---

## 💡 FERRAMENTAS ÚTEIS

### Compressão de Imagens
- **TinyPNG**: https://tinypng.com/
- **Squoosh**: https://squoosh.app/
- **ImageOptim**: https://imageoptim.com/ (Mac)

### Remoção de Fundo
- **Remove.bg**: https://www.remove.bg/
- **PhotoScissors**: https://photoscissors.com/

### Redimensionamento
- **Canva**: https://www.canva.com/
- **Figma**: https://www.figma.com/

---

## ❓ FAQ

### **P: E se eu não tiver todas as logos agora?**
R: Não tem problema! O código já tem fallback automático. Adicione as logos conforme conseguir.

### **P: Posso usar JPG ao invés de PNG?**
R: Sim, mas PNG com fundo transparente fica melhor.

### **P: Preciso ter exatamente 6 expositores por categoria?**
R: Não, você pode ter mais ou menos. Basta ajustar o código.

### **P: Como renomear uma logo já enviada?**
R: No Supabase Storage, você pode deletar e fazer upload novamente com o nome correto.

---

**Pronto para organizar todas as logos! 🏢✨**
