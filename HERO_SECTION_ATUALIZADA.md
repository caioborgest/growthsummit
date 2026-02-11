# 🎨 HERO SECTION ATUALIZADA - Growth Experience Triunfo-PE
## Com Imagem de Fundo e Design Aprimorado

---

## 📝 INSTRUÇÕES

Substitua a seção Hero (linhas 225-304) no arquivo `GrowthExperienceTriunfo.tsx` pelo código abaixo:

---

## 💻 CÓDIGO ATUALIZADO

```tsx
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/caretas-triunfo.jpg')`,
          }}
        >
          {/* Overlay escuro para melhor legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-br from-dark/95 via-dark/90 to-dark/85" />
          {/* Overlay com cores da marca */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-teal-500/20" />
        </div>

        {/* Elementos decorativos */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge SEBRAE */}
            <div className="mb-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/40 backdrop-blur-sm">
              <Award className="h-5 w-5 text-yellow-400" />
              <span className="text-orange-300 font-semibold text-lg">Patrocinado por SEBRAE</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white drop-shadow-2xl">Growth Experience</span>
              <span className="block mt-2 bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
                Triunfo-PE
              </span>
            </h1>

            {/* Subtítulo */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-teal-500/10 backdrop-blur-sm border border-orange-500/30">
              <p className="text-2xl sm:text-3xl text-white font-bold mb-2">
                "A Maior Exposição de Negócios do Sertão do Pajeú"
              </p>
              <p className="text-lg sm:text-xl text-gray-300">
                Crescimento Sem Limites para Pequenas e Médias Empresas do Interior
              </p>
            </div>

            {/* Cards de Informação */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="glass-card p-4 hover:scale-105 transition-transform duration-300 border-orange-500/30">
                <Calendar className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Data</p>
                <p className="text-lg font-bold text-white">09 Abr 2026</p>
              </div>

              <div className="glass-card p-4 hover:scale-105 transition-transform duration-300 border-teal-500/30">
                <MapPin className="h-6 w-6 text-teal-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Local</p>
                <p className="text-lg font-bold text-white">Espaço Parque</p>
              </div>

              <div className="glass-card p-4 hover:scale-105 transition-transform duration-300 border-orange-500/30">
                <Users className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Público</p>
                <p className="text-lg font-bold text-white">4-5 mil</p>
              </div>

              <div className="glass-card p-4 hover:scale-105 transition-transform duration-300 border-teal-500/30">
                <Clock className="h-6 w-6 text-teal-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Horário</p>
                <p className="text-lg font-bold text-white">08h-23h</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-lg font-semibold shadow-xl shadow-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/60 transition-all duration-300 hover:scale-105"
                onClick={() => setModalAberto('cursos')}
              >
                <Rocket className="h-5 w-5 mr-2" />
                Inscreva-se Gratuitamente
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-teal-500 text-teal-400 hover:bg-teal-500/20 hover:border-teal-400 px-8 py-6 text-lg font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'click_patrocinio', {
                      event_category: 'Growth Experience Triunfo',
                      event_label: 'Hero CTA',
                    });
                  }
                  window.location.href = '#patrocinios';
                }}
              >
                <Building2 className="h-5 w-5 mr-2" />
                Seja Patrocinador
              </Button>
            </div>
          </div>
        </div>
      </section>
```

---

## 🎨 MELHORIAS IMPLEMENTADAS

### 1. **Imagem de Fundo**
- ✅ Imagem `caretas-triunfo.jpg` do Supabase como fundo
- ✅ Overlay escuro para melhor legibilidade do texto
- ✅ Overlay com gradiente das cores da marca (laranja e teal)

### 2. **Cores da Marca Growth Experience**
- 🟠 **Laranja**: `#f97316` (orange-500) - Cor principal
- 🟡 **Amarelo**: `#eab308` (yellow-500) - Destaques
- 🔵 **Teal**: `#14b8a6` (teal-500) - Cor secundária
- ⚪ **Branco**: Textos principais
- ⚫ **Dark**: Fundo e overlays

### 3. **Elementos Visuais**
- ✅ Badge SEBRAE com gradiente laranja-amarelo
- ✅ Título com gradiente laranja-amarelo
- ✅ Cards de informação com hover effect (scale)
- ✅ Botões com gradientes e sombras coloridas
- ✅ Elementos decorativos animados (pulso)

### 4. **Animações e Efeitos**
- ✅ Hover scale nos cards
- ✅ Hover scale nos botões
- ✅ Pulse animation nos elementos decorativos
- ✅ Sombras coloridas nos botões
- ✅ Transições suaves

### 5. **Responsividade**
- ✅ Grid adaptativo (2 cols mobile, 4 cols desktop)
- ✅ Textos responsivos (4xl → 7xl)
- ✅ Botões empilhados em mobile
- ✅ Padding e espaçamento adaptativo

---

## 🔧 COMO APLICAR

### Método 1: Substituição Manual
1. Abra `app/src/pages/public/GrowthExperienceTriunfo.tsx`
2. Localize a linha 225 (`{/* Hero Section */}`)
3. Selecione todo o conteúdo até a linha 304 (final do `</section>`)
4. Delete o conteúdo selecionado
5. Cole o novo código acima

### Método 2: Buscar e Substituir
1. Procure por: `{/* Hero Section */}`
2. Selecione até o próximo `</section>`
3. Substitua pelo novo código

---

## ✅ RESULTADO ESPERADO

Quando aplicado, você terá:

- 🖼️ **Imagem de fundo**: Caretas de Triunfo visível com overlay
- 🎨 **Cores vibrantes**: Gradientes laranja e teal
- ✨ **Animações**: Elementos pulsantes e hover effects
- 📱 **Responsivo**: Perfeito em mobile e desktop
- 🎯 **CTAs destacados**: Botões com sombras coloridas

---

## 🚀 PRÓXIMOS PASSOS

Depois de aplicar esta Hero Section, você pode:

1. **Adicionar seção de Atividades Especiais** (Arena Pitch e B2B)
2. **Melhorar outras seções** com as mesmas cores
3. **Testar a página** e ajustar conforme necessário

---

**Aproveite o novo visual! 🎉**
