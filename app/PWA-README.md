# Growth Summit 2026 - PWA (Progressive Web App)

Este documento descreve a configuração e funcionalidades do PWA do Growth Summit 2026.

## ✅ Funcionalidades PWA

### 📱 Instalação Multiplataforma
- **Android**: Instalação nativa via Chrome
- **iOS**: Adicionar à Tela de Início via Safari/Chrome
- **Desktop**: Instalação via Chrome/Edge

### 🎨 Recursos Visuais
- Ícones em múltiplas resoluções (72x72 até 512x512)
- Ícone maskable para Android adaptável
- Splash screens para iOS
- Tema escuro consistente
- Status bar personalizada

### ⚡ Performance
- Service Worker com estratégias de cache inteligentes
- Funcionamento offline parcial
- Atualizações automáticas em background
- Cache de fontes e imagens

### 🔔 UX Aprimorada
- Prompt de instalação intuitivo
- Instruções específicas por plataforma
- Indicador de status offline
- Notificações de atualização disponível

## 📁 Estrutura de Arquivos

```
public/
├── manifest.json          # Configuração principal do PWA
├── browserconfig.xml      # Configuração para Windows
├── robots.txt            # SEO
├── favicon.ico           # Favicon
├── apple-touch-icon.png  # Ícone iOS
├── icons/                # Ícones em múltiplos tamanhos
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   └── maskable-icon.png
└── images/               # Imagens do app

src/
├── components/
│   └── PWAInstallPrompt.tsx  # Componente de instalação
├── hooks/
│   └── usePWA.ts            # Hook de gerenciamento PWA
└── index.css               # Estilos responsivos

index.html                 # Meta tags PWA
vite.config.ts            # Configuração Vite PWA
```

## 🚀 Testando o PWA

### Desenvolvimento Local
```bash
npm run dev
```

### Build de Produção
```bash
npm run build
npm run preview
```

### Testando em Dispositivos Reais

#### Android (Chrome)
1. Abra o site no Chrome
2. Toque no menu (⋮) > "Adicionar à tela inicial"
3. Ou aguarde o prompt de instalação automático

#### iOS (Safari)
1. Abra o site no Safari
2. Toque em "Compartilhar" (□↑)
3. Role e toque em "Adicionar à Tela de Início"

#### iOS (Chrome)
1. Abra o site no Chrome
2. Toque em "Compartilhar"
3. Toque em "Adicionar à Tela de Início"

#### Desktop (Chrome/Edge)
1. Clique no ícone de instalação na barra de endereço
2. Ou use o menu > "Instalar Growth Summit"

## 📊 Manifest.json

O arquivo `manifest.json` contém:

| Propriedade | Valor | Descrição |
|-------------|-------|-----------|
| name | "Growth Summit 2026" | Nome completo |
| short_name | "Growth Summit" | Nome curto (ícone) |
| theme_color | "#21808D" | Cor da barra de status |
| background_color | "#0A0A0A" | Cor de fundo splash |
| display | "standalone" | Modo de exibição |
| orientation | "portrait-primary" | Orientação padrão |

## 🛠️ Service Worker

O Service Worker gerencia:

### Cache Estratégico
- **Google Fonts**: CacheFirst (1 ano)
- **Supabase API**: NetworkFirst (24h)
- **Imagens**: CacheFirst (30 dias)
- **Assets**: Precache automático

### Estratégias
```javascript
// Cache First - Assets estáticos
// Network First - Dados dinâmicos
// Stale While Revalidate - Conteúdo atualizado
```

## 🎨 Responsividade

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Safe Areas (iOS notch)
```css
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

### Touch Targets
Todos os elementos interativos têm mínimo de 44x44px para facilitar toque.

## 📱 Componentes PWA

### PWAInstallPrompt
- Detecta capacidade de instalação
- Mostra prompt personalizado
- Instruções específicas por plataforma
- Persistência de preferências

### usePWA Hook
```typescript
const {
  isInstallable,      // Pode ser instalado?
  isInstalled,        // Já instalado?
  isStandalone,       // Rodando como app?
  isOffline,          // Modo offline?
  promptInstall,      // Função de instalação
  updateAvailable,    // Atualização disponível?
  updateApp           // Função de atualização
} = usePWA();
```

## 🔧 Configurações Específicas

### iOS (Safari)
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

### Android (Chrome)
```html
<meta name="theme-color" content="#21808D">
<link rel="manifest" href="/manifest.json">
```

### Windows (Edge)
```xml
<meta name="msapplication-TileColor" content="#21808D">
<meta name="msapplication-TileImage" content="/icons/icon-144x144.png">
```

## 📈 Métricas de Instalação

Para rastrear instalações, adicione analytics:

```javascript
window.addEventListener('appinstalled', () => {
  // Analytics: App foi instalado
  gtag('event', 'pwa_installed', {
    'event_category': 'PWA',
    'event_label': 'Growth Summit'
  });
});
```

## 🐛 Solução de Problemas

### PWA não instala no Android
- Verifique se o manifest.json é válido
- Certifique-se de usar HTTPS
- Verifique o service worker está registrado

### iOS não mostra opção "Adicionar à Tela de Início"
- Use Safari (Chrome iOS tem limitações)
- Verifique se o site está em HTTPS
- Limpe o cache do Safari

### Cores do tema não aparecem
- Verifique as meta tags theme-color
- Teste em diferentes navegadores
- Verifique o manifest.json

### Service Worker não atualiza
- Use `skipWaiting: true`
- Limpe o cache do navegador
- Verifique versão no SW

## 📝 Checklist de Lançamento

- [ ] Testar em Android Chrome
- [ ] Testar em iOS Safari
- [ ] Testar em iOS Chrome
- [ ] Testar em Desktop Chrome
- [ ] Verificar ícones em todas as resoluções
- [ ] Testar modo offline
- [ ] Verificar splash screens iOS
- [ ] Testar atualização do app
- [ ] Validar manifest.json (Lighthouse)
- [ ] Verificar performance (PageSpeed)

## 🌐 Recursos

- [Web App Manifest Generator](https://tomitm.github.io/appmanifest/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)
- [Can I Use - PWA](https://caniuse.com/?search=PWA)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

## 📞 Suporte

Para problemas específicos do PWA:
1. Verifique a aba Application no DevTools
2. Teste em modo anônimo
3. Limpe todos os caches
4. Verifique logs do Service Worker
