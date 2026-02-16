# 📋 Lista de Implementações - Growth Experience Triunfo

## ✅ Tarefas Concluídas

### 1. Remoção da Cor Amarela
- ✅ Script Python criado (`remove_yellow.py`)
- ⏳ Executar: `python remove_yellow.py`
- Substitui todas as ocorrências de amarelo por laranja

### 2. Logos do Growth Experience
URLs fornecidas:
- Logo principal: `https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth_experience.png`
- Logo fundo escuro: `https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/logomarca-GX-fundoescuro.png`

---

## 🔨 Tarefas Pendentes

### 1. Adicionar Seções de Inscrição Faltantes

#### A. Seção "Seja Mentor"
**Localização**: `GrowthExperienceTriunfo.tsx`
**Posição**: Após seção de Mentorias 1:1

**Conteúdo**:
```tsx
<InscricaoSection
  id="seja-mentor"
  icon={UserPlus}
  titulo="Seja um Mentor"
  subtitulo="Compartilhe sua experiência e transforme vidas"
  descricao="Torne-se um mentor do Growth Experience e ajude empreendedores a alcançarem seus objetivos. Contribua com sua expertise e faça parte da transformação do ecossistema de negócios do Sertão do Pajeú."
  beneficios={[
    "Reconhecimento como especialista na sua área",
    "Networking com outros mentores e empreendedores",
    "Certificado de mentor oficial do evento",
    "Acesso VIP a todas as atividades",
    "Possibilidade de palestrar no evento",
    "Material exclusivo de mentoria"
  ]}
  gratuito
  horario="Mentorias agendadas conforme disponibilidade"
  capacidade="15 mentores selecionados"
  onInscrever={() => setModalAberto('mentor-cadastro')}
  imagemUrl="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2088&auto=format&fit=crop"
/>
```

#### B. Seção "Seja Mentorado"
**Localização**: `GrowthExperienceTriunfo.tsx`
**Posição**: Após seção "Seja Mentor"

**Conteúdo**:
```tsx
<InscricaoSection
  id="seja-mentorado"
  icon={Target}
  titulo="Seja Mentorado"
  subtitulo="Receba orientação personalizada para seu negócio"
  descricao="Inscreva-se para receber mentoria individual com especialistas em gestão, marketing, vendas, finanças e mais. Sessões de 30 minutos focadas nos desafios específicos do seu negócio."
  beneficios={[
    "Sessão individual de 30 minutos",
    "Diagnóstico personalizado do seu negócio",
    "Plano de ação de 30 dias",
    "Material de apoio exclusivo",
    "Acompanhamento pós-mentoria",
    "Acesso ao grupo exclusivo de mentorados"
  ]}
  gratuito
  vagasLimitadas
  horario="14:00 - 15:30"
  capacidade="Vagas limitadas - agendamento prévio"
  onInscrever={() => setModalAberto('mentor')}
  imagemUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
/>
```

---

### 2. Corrigir Footer Duplicado

**Problema**: Página tem dois footers (um do site principal e um do Growth Experience)

**Solução**:
1. Remover o footer do Layout principal na página Growth Experience Triunfo
2. Manter apenas o `InnerFooter` específico do Growth Experience

**Arquivo**: `GrowthExperienceTriunfo.tsx`

**Mudança**:
```tsx
// ANTES: A página usa <Layout /> que inclui footer
<Route path="growth-experience-triunfo" element={<GrowthExperienceTriunfo />} />

// DEPOIS: Página standalone sem Layout
// Já está implementado corretamente com InnerHeader e InnerFooter próprios
```

---

### 3. Atualizar Logos

**Arquivo**: `GrowthExperienceTriunfo.tsx`

**Mudanças no InnerHeader**:
```tsx
<Link to="/" className="flex items-center space-x-3">
  <img 
    src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/logomarca-GX-fundoescuro.png"
    alt="Growth Experience"
    className="h-12 w-auto"
    onError={(e) => {
      // Fallback para logo alternativa
      e.currentTarget.src = 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth_experience.png';
    }}
  />
</Link>
```

**Mudanças no InnerFooter**:
```tsx
<img 
  src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth_experience.png"
  alt="Growth Experience"
  className="h-10 w-auto"
/>
```

---

### 4. Criar Senha ao Inscrever

**Problema**: Inscrições não criam conta com senha

**Solução**: Modificar modais de inscrição para incluir criação de senha

**Arquivos a modificar**:
- `InscricaoModal.tsx`
- `StartupFormModal.tsx`
- `B2BFormModal.tsx`

**Mudanças**:
```tsx
// Adicionar campos de senha
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

// No formulário
<div>
  <Label htmlFor="password">Criar Senha</Label>
  <Input
    id="password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    minLength={8}
  />
  <p className="text-xs text-gray-400 mt-1">
    Mínimo 8 caracteres para acessar o app
  </p>
</div>

<div>
  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
  <Input
    id="confirmPassword"
    type="password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
  />
</div>

// Na submissão
const handleSubmit = async () => {
  if (password !== confirmPassword) {
    alert('As senhas não coincidem');
    return;
  }
  
  // Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        role: tipo, // 'participant', 'mentor', 'startup', etc
      }
    }
  });
  
  if (authError) {
    alert('Erro ao criar conta: ' + authError.message);
    return;
  }
  
  // Continuar com inscrição...
};
```

---

### 5. Seção "Baixar App Nativo"

**Localização**: Adicionar em `GrowthExperienceTriunfo.tsx` e no site principal

**Componente**:
```tsx
<section className="py-24 bg-gradient-to-br from-brand-orange-coral/10 via-dark to-dark">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30">
        App Nativo
      </Badge>
      <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
        Baixe o App Growth Experience
      </h2>
      <p className="text-xl text-gray-400 max-w-2xl mx-auto">
        Acesse todas as funcionalidades do evento direto do seu celular
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* iOS */}
      <Card className="glass-card p-8 border-white/10 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">iOS / iPhone</h3>
        <p className="text-gray-400 mb-6">
          Disponível na App Store
        </p>
        <Button className="w-full bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-dark-100 font-bold">
          <Download className="h-5 w-5 mr-2" />
          Baixar para iOS
        </Button>
      </Card>

      {/* Android */}
      <Card className="glass-card p-8 border-white/10 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.523 15.341c-.759 0-1.375-.616-1.375-1.375s.616-1.375 1.375-1.375 1.375.616 1.375 1.375-.616 1.375-1.375 1.375zm-11.046 0c-.759 0-1.375-.616-1.375-1.375s.616-1.375 1.375-1.375 1.375.616 1.375 1.375-.616 1.375-1.375 1.375zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.75c-5.385 0-9.75-4.365-9.75-9.75S6.615 2.25 12 2.25s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/>
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Android</h3>
        <p className="text-gray-400 mb-6">
          Disponível na Google Play
        </p>
        <Button className="w-full bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-dark-100 font-bold">
          <Download className="h-5 w-5 mr-2" />
          Baixar para Android
        </Button>
      </Card>
    </div>

    {/* PWA Install */}
    <div className="mt-12 text-center">
      <Card className="glass-card p-6 border-brand-orange-coral/30 max-w-2xl mx-auto">
        <h4 className="text-white font-bold mb-2">Ou instale como PWA</h4>
        <p className="text-gray-400 text-sm mb-4">
          Adicione à tela inicial do seu dispositivo para acesso rápido
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-brand-orange-coral" />
            <span>Funciona offline</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand-orange-coral" />
            <span>Rápido e leve</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-orange-coral" />
            <span>Seguro</span>
          </div>
        </div>
      </Card>
    </div>
  </div>
</section>
```

---

### 6. Garantir PWA 100% Funcional

**Arquivo**: `vite.config.ts` (já configurado)

**Verificações necessárias**:

1. ✅ Manifest configurado
2. ✅ Service Worker ativo
3. ✅ Icons PWA (192x192 e 512x512)
4. ⏳ Testar offline mode
5. ⏳ Testar install prompt

**Teste PWA**:
```bash
# Build production
npm run build

# Preview
npm run preview

# Abrir no navegador e testar:
# 1. Abrir DevTools > Application > Service Workers
# 2. Verificar se SW está ativo
# 3. Testar modo offline
# 4. Testar install prompt
```

**Melhorias PWA**:
```typescript
// src/registerSW.ts
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nova versão disponível. Atualizar agora?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App pronto para funcionar offline');
  },
});
```

---

## 📝 Ordem de Implementação Recomendada

1. ✅ Executar `python remove_yellow.py` para remover amarelo
2. ⏳ Atualizar logos no header e footer
3. ⏳ Adicionar seções "Seja Mentor" e "Seja Mentorado"
4. ⏳ Adicionar seção "Baixar App"
5. ⏳ Modificar modais para criar senha
6. ⏳ Testar PWA em todos os perfis
7. ⏳ Verificar footer duplicado

---

## 🔧 Comandos Úteis

```bash
# Remover cor amarela
python remove_yellow.py

# Instalar dependências
cd app
npm install

# Rodar dev
npm run dev

# Build production
npm run build

# Preview production
npm run preview

# Testar PWA
# Abrir http://localhost:4173 no navegador
# DevTools > Application > Service Workers
```

---

## 📞 Próximos Passos

Após executar o script de remoção de amarelo, vou criar os componentes faltantes e fazer as integrações necessárias.

**Status Atual**:
- ✅ Script de remoção de amarelo criado
- ✅ Documentação completa criada
- ⏳ Aguardando execução do script
- ⏳ Criação dos componentes faltantes

---

**Última atualização**: 16/02/2026 14:35
