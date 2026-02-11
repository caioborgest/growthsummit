# 🎯 SEÇÃO ATIVIDADES ESPECIAIS - Design Premium
## Arena Pitch + Rodada de Negócios B2B

---

## 📝 ONDE ADICIONAR

Adicione esta seção **logo após a Hero Section** (após a linha ~304) no arquivo `GrowthExperienceTriunfo.tsx`.

---

## 💻 CÓDIGO COMPLETO

```tsx
      {/* Atividades Especiais */}
      <section className="py-20 bg-gradient-to-br from-dark via-dark-100 to-dark relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header da Seção */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-orange-500/20 to-teal-500/20 text-orange-400 border-orange-500/30 text-base px-4 py-2">
              Oportunidades Exclusivas
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-white">Atividades </span>
              <span className="bg-gradient-to-r from-orange-400 to-teal-400 bg-clip-text text-transparent">
                Especiais
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Participe de competições e networking qualificado para impulsionar seu negócio
            </p>
          </div>

          {/* Grid de Cards */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Arena Pitch */}
            <Card className="glass-card p-8 hover:border-teal-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/20 group">
              {/* Header do Card */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/30 to-teal-600/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border border-teal-500/50">
                  <Rocket className="h-8 w-8 text-teal-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">
                    Arena Pitch
                  </h3>
                  <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30">
                    Competição de Startups
                  </Badge>
                </div>
              </div>
              
              {/* Benefícios */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-teal-400" />
                  </div>
                  <span className="font-medium">20 startups selecionadas para competir</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-teal-400" />
                  </div>
                  <span className="font-medium">Prêmios de até <strong className="text-teal-400">R$ 2.000</strong></span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-teal-400" />
                  </div>
                  <span className="font-medium">3 meses de mentoria gratuita</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-teal-400" />
                  </div>
                  <span className="font-medium">Exposição para investidores e mentores</span>
                </div>
              </div>

              {/* Descrição */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-teal-600/10 border border-teal-500/30 mb-6">
                <p className="text-gray-300 leading-relaxed">
                  Apresente sua startup para uma banca de jurados experientes e concorra a prêmios em dinheiro, 
                  mentorias com especialistas do mercado e visibilidade para investidores.
                </p>
              </div>

              {/* CTA */}
              <Button
                onClick={() => setModalAberto('startup')}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-lg py-6 font-semibold shadow-lg shadow-teal-500/50 hover:shadow-xl hover:shadow-teal-500/60 transition-all duration-300 hover:scale-105"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Inscrever Minha Startup
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>

            {/* Rodada de Negócios B2B */}
            <Card className="glass-card p-8 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 group">
              {/* Header do Card */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/30 to-orange-600/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border border-orange-500/50">
                  <Handshake className="h-8 w-8 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                    Rodada de Negócios B2B
                  </h3>
                  <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                    Networking Qualificado
                  </Badge>
                </div>
              </div>
              
              {/* Benefícios */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-orange-400" />
                  </div>
                  <span className="font-medium">Reuniões de negócios agendadas</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-orange-400" />
                  </div>
                  <span className="font-medium">Empresas pré-qualificadas da região</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-orange-400" />
                  </div>
                  <span className="font-medium">Oportunidades de parcerias estratégicas</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-orange-400" />
                  </div>
                  <span className="font-medium"><strong className="text-orange-400">100% gratuito</strong> para participantes</span>
                </div>
              </div>

              {/* Descrição */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/30 mb-6">
                <p className="text-gray-300 leading-relaxed">
                  Conecte-se com outras empresas da região para fechar parcerias estratégicas, 
                  comprar ou vender produtos e serviços em um ambiente profissional e qualificado.
                </p>
              </div>

              {/* CTA */}
              <Button
                onClick={() => setModalAberto('b2b')}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg py-6 font-semibold shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/60 transition-all duration-300 hover:scale-105"
              >
                <Handshake className="h-5 w-5 mr-2" />
                Participar da Rodada B2B
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>
          </div>

          {/* Call to Action Adicional */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">
              Não perca essas oportunidades únicas de crescimento!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-teal-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Vagas Limitadas</span>
              </div>
              <div className="flex items-center gap-2 text-orange-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Inscrições Abertas</span>
              </div>
            </div>
          </div>
        </div>
      </section>
```

---

## 🎨 CARACTERÍSTICAS DO DESIGN

### 1. **Layout Premium**
- ✅ Grid responsivo (1 col mobile, 2 cols desktop)
- ✅ Cards com glassmorphism effect
- ✅ Hover effects sofisticados
- ✅ Sombras coloridas nos botões

### 2. **Cores da Marca**
- 🔵 **Teal** (#14b8a6) - Arena Pitch
- 🟠 **Laranja** (#f97316) - Rodada B2B
- ⚪ **Branco** - Textos principais
- 🌫️ **Gray** - Textos secundários

### 3. **Animações e Efeitos**
- ✅ Hover scale nos cards
- ✅ Hover scale nos ícones
- ✅ Transição de cores nos textos
- ✅ Seta animada nos botões
- ✅ Elementos decorativos de fundo

### 4. **Elementos Visuais**
- ✅ Badges com gradientes
- ✅ Ícones em círculos coloridos
- ✅ Boxes de descrição com bordas
- ✅ Botões com gradientes e sombras
- ✅ Elementos decorativos blur

---

## ✅ RESULTADO ESPERADO

Quando aplicado, você terá:

- 🎯 **2 Cards Premium**: Arena Pitch (teal) e Rodada B2B (laranja)
- ✨ **Animações Suaves**: Hover effects e transições
- 🎨 **Cores Vibrantes**: Gradientes e sombras coloridas
- 📱 **Responsivo**: Perfeito em todos os dispositivos
- 🚀 **CTAs Destacados**: Botões grandes e chamativos

---

## 🔧 COMO APLICAR

1. Abra `app/src/pages/public/GrowthExperienceTriunfo.tsx`
2. Localize o final da Hero Section (linha ~304)
3. Cole o código acima logo após `</section>` da Hero
4. Salve o arquivo

---

## 📍 LOCALIZAÇÃO EXATA

Adicione **APÓS** esta linha:

```tsx
      </section>
      {/* FIM DA HERO SECTION */}

      {/* COLE AQUI A SEÇÃO DE ATIVIDADES ESPECIAIS */}

      {/* Próxima seção... */}
```

---

**Design premium pronto para impressionar! 🎉**
