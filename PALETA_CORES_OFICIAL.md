# 🎨 Paleta de Cores Oficial - Growth Experience

## ✅ IMPLEMENTAÇÃO COMPLETA

A paleta de cores oficial do Growth Experience foi totalmente implementada no sistema de design.

---

## 🎨 Cores Primárias

### Laranja Coral (Cor Principal)
- **HEX**: `#ff7043`
- **RGB**: `255, 112, 67`
- **HSL**: `14, 100%, 63%`
- **Uso**: Cor vibrante da marca "GX" e "GROWTH", CTAs principais, destaques
- **Tailwind**: `brand-orange-coral`, `teal-500`

### Laranja Gradiente
- **HEX**: `#ff8549`
- **RGB**: `255, 133, 73`
- **HSL**: `19, 100%, 68%`
- **Uso**: Degradês, transições suaves
- **Tailwind**: `brand-orange-gradient`

### Laranja Intenso (Destaques)
- **HEX**: `#ff4035`
- **RGB**: `255, 64, 53`
- **HSL**: `11, 100%, 60%`
- **Uso**: Variação mais saturada para destaques, hover states, alertas importantes
- **Tailwind**: `brand-orange-intense`, `orange-500`

---

## 🎨 Cores Neutras

### Branco (Contraste)
- **HEX**: `#FFFFFF`
- **RGB**: `255, 255, 255`
- **Uso**: Fundo e contraste máximo
- **Tailwind**: `brand-white`, `white`

### Cinza Claro (Elementos Suaves)
- **HEX**: `#E6E6E6`
- **RGB**: `230, 230, 230`
- **Uso**: "EXPERIENCE", elementos suaves, backgrounds secundários
- **Tailwind**: `brand-gray-light`

### Cinza Médio (Texto Secundário)
- **HEX**: `#999999`
- **RGB**: `153, 153, 153`
- **Uso**: Texto secundário, legendas, informações complementares
- **Tailwind**: `brand-gray-medium`

### Cinza Escuro (Texto Alternativo)
- **HEX**: `#333333`
- **RGB**: `51, 51, 51`
- **Uso**: Versão alternativa do "EXPERIENCE", texto sobre fundos claros
- **Tailwind**: `brand-gray-dark`

### Preto (Fundos Escuros)
- **HEX**: `#0c0e12`
- **RGB**: `12, 14, 18`
- **Uso**: Fundos escuros, texto principal sobre fundos claros
- **Tailwind**: `brand-black`, `dark`

---

## 📝 Tipografia

### Fonte Principal - Horizon (ou Harizon)
- **Uso**: Títulos, headlines, logo type "GX", "GROWTH"
- **Peso**: Bold/Black (700/900)
- **Aplicação**: Cabeçalhos de seções, capas, destaques
- **Tailwind**: `font-heading`

### Fonte Secundária - Montserrat
- **Uso**: Corpo de texto, subtítulos, "EXPERIENCE"
- **Pesos**:
  - Regular (400) - Corpo de texto
  - SemiBold (600) - Subtítulos
  - Bold (700) - Ênfases
- **Aplicação**: Parágrafos, listas, descrições, legendas
- **Tailwind**: `font-sans`, `font-body`

---

## 🎯 Guia de Aplicação

### Para Apresentações

#### Fundo Branco
```css
background: #FFFFFF
títulos: #ff7043 (Laranja Coral)
texto: #333333 (Cinza Escuro)
```

#### Fundo Preto/Escuro
```css
background: #0c0e12 (Preto)
títulos: #ff7043 (Laranja Coral)
texto: #FFFFFF (Branco) ou #E6E6E6 (Cinza Claro)
```

#### Slides de Destaque
```css
background: #ff7043 (Laranja Coral)
texto: #FFFFFF (Branco)
```

### Para Documentos

```css
cabeçalhos: Horizon, #ff7043 (Laranja Coral)
corpo: Montserrat Regular, #333333 (Cinza Escuro)
destaques: #ff4035 (Laranja Intenso)
call-to-actions: #ff4035 (Laranja Intenso)
```

### Para Redes Sociais

```css
fundos: Alternados (#FFFFFF / #0c0e12)
contraste: Sempre vibrante (laranja + neutro)
CTA buttons: #ff7043 com texto #FFFFFF
```

---

## 🎨 Hierarquia Visual

### Nível 1 - Maior Importância
- **Cor**: Laranja Coral (`#ff7043`)
- **Uso**: CTAs principais, títulos H1, elementos de marca

### Nível 2 - Informações Principais
- **Cor**: Preto/Cinza Escuro (`#0c0e12` / `#333333`)
- **Uso**: Texto principal, títulos H2-H3

### Nível 3 - Informações Secundárias
- **Cor**: Cinza Claro (`#E6E6E6`)
- **Uso**: Texto secundário, legendas, metadados

### Nível 4 - Respiração e Contraste
- **Cor**: Branco (`#FFFFFF`)
- **Uso**: Backgrounds, espaçamento visual

---

## 💻 Implementação Técnica

### Tailwind Config
```javascript
brand: {
  'orange-coral': '#ff7043',      // Cor principal
  'orange-gradient': '#ff8549',   // Gradiente
  'orange-intense': '#ff4035',    // Destaques
  'gray-light': '#E6E6E6',        // Elementos suaves
  'gray-medium': '#999999',       // Texto secundário
  'gray-dark': '#333333',         // Texto alternativo
  'black': '#0c0e12',             // Fundos escuros
  'white': '#FFFFFF',             // Contraste
}
```

### CSS Variables
```css
--brand-orange-coral: 14 100% 63%;      /* #ff7043 */
--brand-orange-gradient: 19 100% 68%;   /* #ff8549 */
--brand-orange-intense: 11 100% 60%;    /* #ff4035 */
--brand-gray-light: 0 0% 90%;           /* #E6E6E6 */
--brand-gray-medium: 0 0% 60%;          /* #999999 */
--brand-gray-dark: 0 0% 20%;            /* #333333 */
--brand-black: 217 33% 5%;              /* #0c0e12 */
--brand-white: 0 0% 100%;               /* #FFFFFF */
```

### Uso em Componentes

#### Botão Principal
```tsx
<Button className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white">
  Inscreva-se
</Button>
```

#### Gradiente
```tsx
<div className="bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient">
  Conteúdo
</div>
```

#### Texto com Hierarquia
```tsx
<h1 className="text-brand-orange-coral font-heading">Título Principal</h1>
<p className="text-brand-gray-dark font-body">Texto do corpo</p>
<span className="text-brand-gray-medium text-sm">Legenda</span>
```

---

## 🎨 Exemplos de Combinações

### Combinação 1: Hero Section
```css
Background: #0c0e12 (Preto)
Título: #ff7043 (Laranja Coral) + Horizon Bold
Subtítulo: #E6E6E6 (Cinza Claro) + Montserrat Regular
CTA: #ff4035 (Laranja Intenso) com texto #FFFFFF
```

### Combinação 2: Card de Conteúdo
```css
Background: #FFFFFF (Branco)
Borda: #E6E6E6 (Cinza Claro)
Título: #ff7043 (Laranja Coral) + Montserrat Bold
Texto: #333333 (Cinza Escuro) + Montserrat Regular
Ícone: #ff7043 (Laranja Coral)
```

### Combinação 3: CTA Destacado
```css
Background: linear-gradient(135deg, #ff7043, #ff8549)
Texto: #FFFFFF (Branco) + Montserrat Bold
Shadow: 0 0 20px rgba(255, 112, 67, 0.5)
Hover: #ff4035 (Laranja Intenso)
```

---

## 🎯 Acessibilidade

### Contraste WCAG AA

#### Texto sobre Fundo Claro
- ✅ `#333333` sobre `#FFFFFF` - Contraste 12.6:1
- ✅ `#999999` sobre `#FFFFFF` - Contraste 2.8:1 (apenas para texto grande)

#### Texto sobre Fundo Escuro
- ✅ `#FFFFFF` sobre `#0c0e12` - Contraste 18.5:1
- ✅ `#E6E6E6` sobre `#0c0e12` - Contraste 15.2:1

#### Elementos Interativos
- ✅ `#ff7043` sobre `#FFFFFF` - Contraste 3.4:1 (adequado para elementos grandes)
- ✅ `#ff4035` sobre `#FFFFFF` - Contraste 3.9:1

---

## 📊 Uso Recomendado por Contexto

| Contexto | Cor Principal | Cor Secundária | Background |
|----------|---------------|----------------|------------|
| Hero | Laranja Coral | Branco | Preto |
| Cards | Laranja Coral | Cinza Escuro | Branco |
| CTAs | Laranja Intenso | Branco | Gradiente |
| Texto | Cinza Escuro | Cinza Médio | Branco |
| Footer | Laranja Coral | Cinza Claro | Preto |
| Badges | Laranja Coral | Branco | Transparente |

---

## ✅ Status de Implementação

- ✅ Tailwind Config atualizado
- ✅ CSS Variables atualizadas
- ✅ Gradientes configurados
- ✅ Sombras (glow) atualizadas
- ✅ Animações atualizadas
- ✅ Aliases de compatibilidade criados

---

## 📝 Notas Importantes

1. **Gradientes**: Sempre usar `from-brand-orange-coral to-brand-orange-gradient` para transições suaves
2. **Hover States**: Usar `brand-orange-intense` para estados de hover em CTAs
3. **Sombras**: Usar `shadow-glow` para efeito de brilho com a cor coral
4. **Texto**: Priorizar `brand-gray-dark` sobre fundos claros e `white` sobre fundos escuros
5. **Ícones**: Sempre usar `brand-orange-coral` para manter consistência

---

**Última atualização**: 16/02/2026 14:50  
**Versão**: 2.0.0  
**Status**: ✅ Implementado e Pronto para Uso

Esta paleta reflete a energia, inovação e profissionalismo do Growth Experience, mantendo versatilidade para diferentes aplicações de conteúdo.
