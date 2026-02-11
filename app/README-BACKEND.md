# Growth Summit 2026 - Backend Integration

Este documento descreve a estrutura de integração com backend da aplicação.

## 📁 Estrutura de Arquivos

```
src/
├── api/
│   ├── client.ts          # Configuração do Axios
│   ├── endpoints.ts       # Definição de endpoints
│   └── providers/
│       └── QueryProvider.tsx  # Provider do React Query
├── hooks/api/
│   ├── useAuth.ts         # Hooks de autenticação
│   ├── useProjects.ts     # Hooks de projetos
│   ├── useRegistrations.ts # Hooks de inscrições
│   └── index.ts           # Exportações
├── stores/
│   └── authStore.ts       # Zustand store para auth
├── lib/
│   └── config.ts          # Configurações da app
└── main.tsx               # Entry point atualizado
```

## 🚀 Dependências Instaladas

```bash
# Gerenciamento de estado e dados
npm install @tanstack/react-query @tanstack/react-query-devtools zustand

# HTTP Client
npm install axios

# Utilidades
npm install date-fns

# Integrações
npm install @supabase/supabase-js          # Storage/Realtime
npm install @stripe/stripe-js @stripe/react-stripe-js  # Pagamentos
npm install resend                          # Email
npm install next-auth                       # OAuth
npm install jsonwebtoken bcryptjs           # JWT/Auth
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

## ⚙️ Configuração

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Preencha as variáveis de ambiente no arquivo `.env`

3. Valide as configurações:
```typescript
import { validateConfig } from '@/lib/config';
validateConfig();
```

## 🔐 Autenticação

### Hook useAuth

```typescript
import { useAuth } from '@/hooks/api';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    register, 
    logout 
  } = useAuth();

  const handleLogin = async () => {
    await login({ email: 'user@example.com', password: '123456' });
  };

  return (
    <div>
      {isAuthenticated ? `Olá, ${user?.name}` : 'Faça login'}
    </div>
  );
}
```

### Store Zustand (Alternativa)

```typescript
import { useAuthStore } from '@/stores/authStore';

function MyComponent() {
  const { user, login, logout } = useAuthStore();
  
  // Usar diretamente
}
```

## 📦 Projetos

```typescript
import { 
  useProjectsQuery, 
  useProjectQuery, 
  useProjectsMutation 
} from '@/hooks/api';

function ProjectsList() {
  const { data: projects, isLoading } = useProjectsQuery();
  const { mutateAsync: createProject } = useProjectsMutation();

  if (isLoading) return <Loading />;

  return (
    <ul>
      {projects?.map(project => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
}
```

## 🎫 Inscrições

```typescript
import { 
  useMyRegistrationsQuery, 
  useRegistrationsMutation 
} from '@/hooks/api/useRegistrations';

function Checkout() {
  const { checkout, verifyPayment } = useRegistrationsMutation();

  const handleCheckout = async () => {
    const { clientSecret } = await checkout({
      ticketType: 'pro',
      paymentMethod: 'credit_card',
      projectId: 'gs-2026'
    });
    // Usar clientSecret com Stripe
  };
}
```

## 🔧 API Client

O cliente Axios está configurado com:

- **Base URL**: Definida em `VITE_API_URL`
- **Interceptores**: Token JWT automático
- **Refresh Token**: Renovação automática
- **Headers**: Project ID do contexto

```typescript
import apiClient from '@/api/client';

// Usar diretamente para casos especiais
const response = await apiClient.get('/custom-endpoint');
```

## 📝 Endpoints Disponíveis

Todos os endpoints estão definidos em `src/api/endpoints.ts`:

```typescript
import { endpoints } from '@/api/endpoints';

// Exemplos
endpoints.auth.login           // POST /auth/login
endpoints.projects.byId('123') // GET /projects/123
endpoints.registrations.my     // GET /registrations/my
```

## 🧪 React Query DevTools

As DevTools do React Query estão habilitadas em desenvolvimento.

Pressione `Ctrl + Shift + K` para abrir.

## 🚨 Tratamento de Erros

Erros são tratados automaticamente:

- **401**: Tentativa de refresh token
- **403**: Redirecionamento para login
- **5xx**: Retry automático (3x)
- **4xx**: Erro retornado sem retry

```typescript
const { mutate, error } = useMutation({
  mutationFn: apiCall,
  onError: (error) => {
    // Tratar erro específico
    toast.error(error.response?.data?.message);
  }
});
```

## 📚 Próximos Passos

1. Implementar backend com as rotas definidas
2. Configurar Stripe para pagamentos
3. Setup Supabase para storage
4. Configurar Resend para emails
5. Implementar WebSockets para notificações realtime

## 🔗 Links Úteis

- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Axios Docs](https://axios-http.com/)
- [Stripe React](https://stripe.com/docs/stripe-js/react)
