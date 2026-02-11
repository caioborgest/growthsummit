# 🔍 Auditoria Completa - Erros no Console

## 📋 Resumo Executivo

Esta auditoria identifica e corrige todos os possíveis erros no console do navegador para garantir uma experiência de usuário perfeita.

---

## ✅ Problemas Identificados e Correções

### 1. **Console.log em Produção**

**Problema:** Existem `console.log` no código que podem poluir o console em produção.

**Arquivos Afetados:**
- `src/hooks/usePWA.ts` (linhas 79, 133, 136)

**Solução:** Remover ou condicionar os logs apenas para desenvolvimento.

---

### 2. **Console.error em Catch Blocks**

**Problema:** Múltiplos `console.error` que podem expor informações sensíveis.

**Arquivos Afetados:**
- `src/lib/supabase.ts` (linhas 38, 57, 71, 85)
- `src/lib/stripe.ts` (linhas 61, 84, 135, 181, 219, 253)
- `src/hooks/useGrowthExperienceData.ts` (múltiplas linhas)
- `src/components/social/SocialShare.tsx` (linha 66)

**Solução:** Implementar sistema de logging apropriado que:
- Em desenvolvimento: mostra erros detalhados
- Em produção: registra erros em serviço de monitoramento (Sentry)

---

### 3. **Console.warn para Configurações**

**Problema:** Warnings sobre variáveis de ambiente ausentes.

**Arquivos Afetados:**
- `src/lib/supabase.ts` (linha 8)
- `src/lib/stripe.ts` (linha 94)
- `src/lib/config.ts` (linha 47)

**Solução:** Manter warnings apenas em desenvolvimento.

---

### 4. **Possíveis Erros de Rede**

**Problema:** Requisições ao Supabase podem falhar se não configurado corretamente.

**Solução:** Implementar tratamento de erro robusto com fallbacks.

---

### 5. **Erros de Imagens Não Carregadas**

**Problema:** Imagens com URLs inválidas podem gerar erros 404.

**Solução:** Implementar fallback de imagens e lazy loading adequado.

---

### 6. **Erros de React em Desenvolvimento**

**Problema:** Possíveis warnings do React sobre:
- Keys em listas
- useEffect dependencies
- Componentes não controlados

**Solução:** Revisar todos os componentes.

---

## 🛠️ Plano de Correção

### Fase 1: Implementar Sistema de Logging (PRIORIDADE ALTA)

```typescript
// src/lib/logger.ts
const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(message, error);
    } else {
      // Enviar para Sentry ou outro serviço
      // Sentry.captureException(error);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  }
};
```

### Fase 2: Substituir Todos os Console.* (PRIORIDADE ALTA)

Substituir todas as ocorrências de:
- `console.log` → `logger.log`
- `console.error` → `logger.error`
- `console.warn` → `logger.warn`
- `console.info` → `logger.info`

### Fase 3: Adicionar Error Boundaries (PRIORIDADE MÉDIA)

```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', { error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4">
          <div className="bg-dark-lighter rounded-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Algo deu errado
            </h2>
            <p className="text-gray-400 mb-6">
              Desculpe, ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Fase 4: Implementar Fallback de Imagens (PRIORIDADE MÉDIA)

```typescript
// src/components/SafeImage.tsx
import { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function SafeImage({ 
  src, 
  fallbackSrc = '/placeholder.png', 
  alt,
  ...props 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
      loading="lazy"
    />
  );
}
```

### Fase 5: Revisar Componentes React (PRIORIDADE BAIXA)

Verificar:
- ✅ Todas as listas têm keys únicas
- ✅ useEffect tem todas as dependências necessárias
- ✅ Componentes controlados/não controlados estão consistentes
- ✅ Não há warnings de deprecated APIs

---

## 📊 Checklist de Verificação

### Antes de Iniciar o Servidor

- [ ] Verificar se `.env` está configurado corretamente
- [ ] Verificar se `node_modules` está instalado
- [ ] Verificar se não há erros de TypeScript (`npm run type-check`)
- [ ] Verificar se não há erros de lint (`npm run lint`)

### Ao Iniciar o Servidor

- [ ] Abrir DevTools (F12)
- [ ] Verificar aba Console
- [ ] Verificar aba Network
- [ ] Verificar aba Application (Service Workers)

### Páginas a Testar

1. **Home** (`/`)
   - [ ] Sem erros no console
   - [ ] Todas as imagens carregam
   - [ ] Animações funcionam

2. **Programação** (`/programacao`)
   - [ ] Filtros funcionam sem erros
   - [ ] Dados carregam corretamente

3. **Palestrantes** (`/palestrantes`)
   - [ ] Imagens dos palestrantes carregam
   - [ ] Modal funciona sem erros

4. **Inscrições** (`/inscricoes`)
   - [ ] Formulário valida corretamente
   - [ ] Integração Stripe funciona

5. **Growth Experience Triunfo** (`/growth-experience-triunfo`)
   - [ ] Todas as seções carregam
   - [ ] Formulários funcionam
   - [ ] Imagens carregam

6. **Admin** (`/admin/*`)
   - [ ] Dashboard carrega
   - [ ] Todas as páginas admin funcionam
   - [ ] CRUD operations funcionam

---

## 🔧 Correções Específicas Necessárias

### 1. Atualizar `usePWA.ts`

```typescript
// Substituir console.log por logger.log
import { logger } from '@/lib/logger';

// Linha 79
logger.log('PWA was installed');

// Linha 133
logger.log('User accepted the install prompt');

// Linha 136
logger.log('User dismissed the install prompt');
```

### 2. Atualizar `supabase.ts`

```typescript
import { logger } from '@/lib/logger';

// Substituir todos os console.error
logger.error('Erro no upload:', error);
logger.error('Erro no download:', error);
logger.error('Erro ao deletar:', error);
logger.error('Erro ao listar:', error);
```

### 3. Atualizar `stripe.ts`

```typescript
import { logger } from '@/lib/logger';

// Substituir todos os console.error e console.warn
logger.error('Erro ao criar checkout session:', error);
logger.warn('Stripe Public Key não configurada');
```

### 4. Atualizar `config.ts`

```typescript
import { logger } from '@/lib/logger';

// Linha 47
logger.warn(`⚠️ Variáveis de ambiente ausentes: ${missing.join(', ')}`);
```

### 5. Adicionar Error Boundary no App.tsx

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProjectProvider>
          <BrowserRouter>
            <IOSInstallBadge />
            <AppRoutes />
            <PWAInstallPrompt />
          </BrowserRouter>
        </ProjectProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

---

## 🎯 Resultado Esperado

Após implementar todas as correções:

✅ **Console limpo em produção** - Nenhum log desnecessário  
✅ **Erros tratados graciosamente** - Usuário vê mensagens amigáveis  
✅ **Monitoramento adequado** - Erros são registrados para análise  
✅ **Performance otimizada** - Imagens com lazy loading e fallbacks  
✅ **Experiência do usuário perfeita** - Sem crashes ou telas brancas  

---

## 📝 Notas Importantes

1. **Desenvolvimento vs Produção**: Logs devem ser verbosos em dev, silenciosos em prod
2. **Monitoramento**: Considerar integrar Sentry para tracking de erros em produção
3. **Testing**: Testar em diferentes navegadores (Chrome, Firefox, Safari, Edge)
4. **Mobile**: Testar em dispositivos móveis reais
5. **Performance**: Usar Lighthouse para auditoria de performance

---

## 🚀 Próximos Passos

1. Implementar sistema de logging
2. Substituir todos os console.*
3. Adicionar Error Boundaries
4. Implementar SafeImage component
5. Testar todas as páginas
6. Fazer build de produção e testar
7. Configurar Sentry (opcional mas recomendado)

---

**Data da Auditoria:** 11/02/2026  
**Status:** Aguardando Implementação  
**Prioridade:** Alta
