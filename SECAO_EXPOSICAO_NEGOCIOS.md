# 🏢 SEÇÃO EXPOSIÇÃO DE NEGÓCIOS - Growth Experience Triunfo-PE
## "A Maior Exposição de Negócios do Sertão do Pajeú"

---

## 📝 ONDE ADICIONAR

Adicione esta seção na página `GrowthExperienceTriunfo.tsx`, **após a seção de Atividades Especiais** (ou onde preferir).

---

## 💻 CÓDIGO COMPLETO

```tsx
      {/* Exposição de Negócios */}
      <section className="py-20 bg-dark relative overflow-hidden" id="expositores">
        {/* Background decorativo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500 via-transparent to-teal-500" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header da Seção */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-orange-500/20 to-teal-500/20 text-orange-400 border-orange-500/30 text-base px-4 py-2">
              Networking e Negócios
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-white">A Maior </span>
              <span className="bg-gradient-to-r from-orange-400 to-teal-400 bg-clip-text text-transparent">
                Exposição de Negócios
              </span>
            </h2>
            <p className="text-2xl sm:text-3xl text-gray-300 font-semibold mb-2">
              do Sertão do Pajeú
            </p>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Conecte-se com as principais empresas, startups e empreendedores da região
            </p>
          </div>

          {/* Stats da Exposição */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-6 w-6 text-orange-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">50+</p>
              <p className="text-gray-400 text-sm">Expositores</p>
            </div>
            <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-3">
                <Rocket className="h-6 w-6 text-teal-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">20</p>
              <p className="text-gray-400 text-sm">Startups</p>
            </div>
            <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                <Handshake className="h-6 w-6 text-orange-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">100+</p>
              <p className="text-gray-400 text-sm">Oportunidades B2B</p>
            </div>
            <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-teal-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">5.000+</p>
              <p className="text-gray-400 text-sm">Visitantes</p>
            </div>
          </div>

          {/* Patrocinadores Principais */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Patrocinadores Principais
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* SEBRAE */}
              <div className="glass-card p-6 flex items-center justify-center hover:scale-105 transition-all duration-300 hover:border-orange-500/50 group">
                <img
                  src={getStorageUrl('event-images', 'logos/sebrae.png')}
                  alt="SEBRAE"
                  className="max-h-20 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"%3E%3Crect fill="%23374151" width="200" height="80"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="16" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ESEBRAE%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Prefeitura de Triunfo */}
              <div className="glass-card p-6 flex items-center justify-center hover:scale-105 transition-all duration-300 hover:border-teal-500/50 group">
                <img
                  src={getStorageUrl('event-images', 'logos/prefeitura-triunfo.png')}
                  alt="Prefeitura de Triunfo"
                  className="max-h-20 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"%3E%3Crect fill="%23374151" width="200" height="80"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="12" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EPrefeitura%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Governo de Pernambuco */}
              <div className="glass-card p-6 flex items-center justify-center hover:scale-105 transition-all duration-300 hover:border-orange-500/50 group">
                <img
                  src={getStorageUrl('event-images', 'logos/governo-pe.png')}
                  alt="Governo de Pernambuco"
                  className="max-h-20 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"%3E%3Crect fill="%23374151" width="200" height="80"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="12" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EGoverno PE%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Adicione mais patrocinadores conforme necessário */}
              <div className="glass-card p-6 flex items-center justify-center hover:scale-105 transition-all duration-300 hover:border-teal-500/50 group">
                <img
                  src={getStorageUrl('event-images', 'logos/parceiro-4.png')}
                  alt="Parceiro"
                  className="max-h-20 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"%3E%3Crect fill="%23374151" width="200" height="80"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EParceiro%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Expositores por Categoria */}
          <div className="space-y-12">
            {/* Categoria: Tecnologia e Inovação */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/30 to-teal-600/30 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Tecnologia e Inovação</h3>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="glass-card p-4 flex items-center justify-center hover:scale-105 transition-all duration-300 hover:border-teal-500/50 group aspect-square">
                    <img
                      src={getStorageUrl('event-images', `logos/expositor-tech-${i}.png`)}
                      alt={`Expositor Tecnologia ${i}`}
                      className="max-h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23374151" width="100" height="100"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="12" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ETech ${i}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Categoria: Serviços e Consultoria */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/30 to-orange-600/30 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Serviços e Consultoria</h3>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="glass-card p-4 flex items-center justify-center hover:scale-105 transition-all duration-300 hover:border-orange-500/50 group aspect-square">
                    <img
                      src={getStorageUrl('event-images', `logos/expositor-servicos-${i}.png`)}
                      alt={`Expositor Serviços ${i}`}
                      className="max-h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23374151" width="100" height="100"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="10" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EServ ${i}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Categoria: Comércio e Varejo */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/30 to-teal-600/30 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Comércio e Varejo</h3>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="glass-card p-4 flex items-center justify-center hover:scale-105 transition-all duration-300 hover:border-teal-500/50 group aspect-square">
                    <img
                      src={getStorageUrl('event-images', `logos/expositor-comercio-${i}.png`)}
                      alt={`Expositor Comércio ${i}`}
                      className="max-h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23374151" width="100" height="100"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="10" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ECom ${i}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA para Ser Expositor */}
          <div className="mt-16 text-center">
            <div className="glass-card p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Quer expor seu negócio?
              </h3>
              <p className="text-gray-400 mb-6">
                Garanta seu espaço na maior exposição de negócios do Sertão do Pajeú e conecte-se com milhares de potenciais clientes e parceiros.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/60 transition-all duration-300 hover:scale-105"
                  onClick={() => window.location.href = '#patrocinios'}
                >
                  <Building2 className="h-5 w-5 mr-2" />
                  Seja um Expositor
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-teal-500 text-teal-400 hover:bg-teal-500/20 hover:border-teal-400 px-8 py-6 text-lg font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  onClick={() => window.open('https://wa.me/5588988432310?text=Olá! Gostaria de informações sobre como ser expositor no Growth Experience Triunfo-PE', '_blank')}
                >
                  <Handshake className="h-5 w-5 mr-2" />
                  Falar com Organizador
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
```

---

## 🎨 CARACTERÍSTICAS DO DESIGN

### 1. **Layout Organizado**
- ✅ Header com título destacado
- ✅ Stats cards com números impressionantes
- ✅ Patrocinadores principais em destaque
- ✅ Expositores organizados por categoria
- ✅ CTA para novos expositores

### 2. **Efeitos Visuais**
- ✅ Logos em grayscale que ganham cor no hover
- ✅ Scale effect nos cards
- ✅ Bordas coloridas no hover
- ✅ Transições suaves
- ✅ Gradientes nas cores da marca

### 3. **Responsividade**
- ✅ Grid adaptativo (2 cols mobile, 4-6 cols desktop)
- ✅ Cards com aspect-square
- ✅ Botões empilhados em mobile

---

## 📁 ESTRUTURA DE LOGOS NO SUPABASE

### Organize as logos assim no bucket `event-images`:

```
event-images/
├── logos/
│   ├── sebrae.png
│   ├── prefeitura-triunfo.png
│   ├── governo-pe.png
│   ├── parceiro-4.png
│   ├── expositor-tech-1.png
│   ├── expositor-tech-2.png
│   ├── expositor-tech-3.png
│   ├── expositor-tech-4.png
│   ├── expositor-tech-5.png
│   ├── expositor-tech-6.png
│   ├── expositor-servicos-1.png
│   ├── expositor-servicos-2.png
│   ├── ... (continue para todos)
│   ├── expositor-comercio-1.png
│   └── ... (continue para todos)
```

---

## 🔧 COMO APLICAR

### Passo 1: Adicionar Import
No topo do arquivo `GrowthExperienceTriunfo.tsx`, certifique-se que tem:

```tsx
import { getStorageUrl } from '@/lib/storage';
```

### Passo 2: Cole o Código
Cole a seção completa após a seção de Atividades Especiais (ou onde preferir).

### Passo 3: Upload das Logos
1. Acesse: https://supabase.com/dashboard/project/zczfutmymobgypbbamme/storage/buckets/event-images
2. Crie a pasta `logos/`
3. Faça upload das logomarcas

---

## ✅ RESULTADO ESPERADO

Quando aplicado, você terá:

- 📊 **Stats impressionantes** (50+ expositores, 20 startups, etc.)
- 🏢 **Patrocinadores em destaque** (SEBRAE, Prefeitura, etc.)
- 🎯 **Expositores por categoria** (Tecnologia, Serviços, Comércio)
- ✨ **Efeitos premium** (grayscale → color no hover)
- 📱 **Totalmente responsivo**
- 🚀 **CTAs para novos expositores**

---

## 💡 DICAS

### 1. **Fallback de Imagens**
O código já inclui fallback SVG caso a imagem não carregue.

### 2. **Adicionar Mais Expositores**
Basta duplicar os blocos e ajustar os números:

```tsx
{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
  // ... código do card
))}
```

### 3. **Personalizar Categorias**
Adicione mais categorias copiando o bloco e mudando:
- Ícone
- Título
- Cor (teal/orange)
- Prefixo das imagens

---

**Seção premium pronta para mostrar todos os expositores! 🏢✨**
