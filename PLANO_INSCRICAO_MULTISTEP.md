# 🎯 PLANO DE IMPLEMENTAÇÃO - FLUXO DE INSCRIÇÃO COMPLETO

## 📋 VISÃO GERAL

### Fluxo de Inscrição
```
1. Escolher Cursos (obrigatório - mínimo 1)
   ↓
2. Dados Pessoais + Criar Senha
   ↓
3. Confirmação da Inscrição
   ↓
4. Oferta: Palestras Noturnas (R$ 179,99)
   ├─ SIM → Pagamento → Confirmação
   └─ NÃO → Pular
   ↓
5. Download do App (obrigatório)
   ↓
6. Conclusão + Acesso ao App
```

---

## 🔧 COMPONENTES A CRIAR

### 1. Modal Multi-Step de Inscrição
**Arquivo**: `app/src/components/forms/InscricaoMultiStepModal.tsx`

**Etapas**:
1. **Seleção de Cursos** (obrigatório)
2. **Dados Pessoais** (nome, email, telefone, senha)
3. **Confirmação**
4. **Oferta Palestras** (opcional)
5. **Download App** (obrigatório)
6. **Conclusão**

---

### 2. Seção de Programação Completa
**Arquivo**: `app/src/components/growth-experience/ProgramacaoCompleta.tsx`

**Conteúdo**:
- Programação diurna (08:00 - 18:00)
- Programação noturna (19:00 - 22:30)
- Filtros por tipo (cursos, mentorias, palestras)
- Grade horária visual

---

### 3. Página de Oferta de Palestras
**Componente**: Dentro do modal multi-step

**Conteúdo**:
- Destaque dos palestrantes
- Valor: R$ 179,99
- Benefícios inclusos
- Botões: "Comprar Agora" / "Pular"

---

### 4. Página de Download do App
**Componente**: Dentro do modal multi-step

**Conteúdo**:
- Instruções iOS/Android
- QR Code para download
- Benefícios do app
- Botão "Concluir Inscrição"

---

## 📊 ESTRUTURA DE DADOS

### Programação Completa

```typescript
interface AtividadeProgramacao {
  id: string;
  tipo: 'curso' | 'mentoria' | 'palestra' | 'networking' | 'startup';
  titulo: string;
  descricao: string;
  palestrante?: string;
  local: string;
  horario_inicio: string;
  horario_fim: string;
  vagas?: number;
  gratuito: boolean;
  valor?: number;
  tags: string[];
}

const programacaoDiurna: AtividadeProgramacao[] = [
  // Manhã (08:00 - 12:00)
  {
    id: 'curso-1',
    tipo: 'curso',
    titulo: 'Marketing Digital para PMEs',
    descricao: 'Estratégias práticas de marketing digital',
    palestrante: 'Especialista SEBRAE',
    local: 'Sala 1',
    horario_inicio: '08:00',
    horario_fim: '10:00',
    vagas: 50,
    gratuito: true,
    tags: ['Marketing', 'Digital', 'PME']
  },
  {
    id: 'curso-2',
    tipo: 'curso',
    titulo: 'Gestão Financeira',
    descricao: 'Controle financeiro e fluxo de caixa',
    palestrante: 'Consultor Financeiro',
    local: 'Sala 2',
    horario_inicio: '08:00',
    horario_fim: '10:00',
    vagas: 50,
    gratuito: true,
    tags: ['Finanças', 'Gestão']
  },
  // ... mais cursos
];

const programacaoNoturna: AtividadeProgramacao[] = [
  {
    id: 'palestra-1',
    tipo: 'palestra',
    titulo: 'Crescimento Exponencial em Mercado Competitivo',
    descricao: 'Estratégias de escala para PMEs',
    palestrante: 'Leandro Batista',
    local: 'Palco Principal',
    horario_inicio: '19:00',
    horario_fim: '19:50',
    gratuito: false,
    valor: 179.99,
    tags: ['Crescimento', 'Estratégia']
  },
  // ... mais palestras
];
```

---

## 🎨 DESIGN DO MODAL MULTI-STEP

### Header com Progresso
```tsx
<div className="flex items-center justify-between mb-8">
  <h2>Inscrição Growth Experience</h2>
  <div className="flex items-center gap-2">
    {[1, 2, 3, 4, 5, 6].map((step) => (
      <div 
        key={step}
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          step === currentStep 
            ? 'bg-brand-orange-coral text-white' 
            : step < currentStep 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-700 text-gray-400'
        }`}
      >
        {step < currentStep ? '✓' : step}
      </div>
    ))}
  </div>
</div>
```

### Etapa 1: Seleção de Cursos
```tsx
<div className="space-y-4">
  <h3>Escolha seus cursos (mínimo 1)</h3>
  <p className="text-gray-400">
    Selecione os cursos que deseja participar durante o dia
  </p>
  
  <div className="grid gap-4">
    {cursos.map((curso) => (
      <Card 
        key={curso.id}
        className={`p-4 cursor-pointer ${
          selectedCursos.includes(curso.id) 
            ? 'border-brand-orange-coral bg-brand-orange-coral/10' 
            : 'border-white/10'
        }`}
        onClick={() => toggleCurso(curso.id)}
      >
        <div className="flex items-start gap-4">
          <Checkbox checked={selectedCursos.includes(curso.id)} />
          <div className="flex-1">
            <h4 className="text-white font-bold">{curso.titulo}</h4>
            <p className="text-sm text-gray-400">{curso.descricao}</p>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className="text-brand-orange-coral">
                {curso.horario_inicio} - {curso.horario_fim}
              </span>
              <span className="text-gray-500">{curso.local}</span>
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
  
  <Button 
    disabled={selectedCursos.length === 0}
    onClick={() => setCurrentStep(2)}
  >
    Continuar ({selectedCursos.length} selecionado{selectedCursos.length !== 1 ? 's' : ''})
  </Button>
</div>
```

### Etapa 2: Dados Pessoais
```tsx
<form className="space-y-4">
  <div>
    <Label>Nome Completo</Label>
    <Input value={nome} onChange={(e) => setNome(e.target.value)} />
  </div>
  
  <div>
    <Label>Email</Label>
    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
  </div>
  
  <div>
    <Label>Telefone/WhatsApp</Label>
    <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
  </div>
  
  <div>
    <Label>Criar Senha</Label>
    <Input 
      type="password" 
      value={senha} 
      onChange={(e) => setSenha(e.target.value)}
      minLength={8}
    />
    <p className="text-xs text-gray-400 mt-1">
      Mínimo 8 caracteres. Você usará para acessar o app.
    </p>
  </div>
  
  <div>
    <Label>Confirmar Senha</Label>
    <Input 
      type="password" 
      value={confirmSenha} 
      onChange={(e) => setConfirmSenha(e.target.value)}
    />
  </div>
  
  <Button onClick={handleContinuar}>
    Continuar
  </Button>
</form>
```

### Etapa 3: Confirmação
```tsx
<div className="space-y-6">
  <h3>Confirme seus dados</h3>
  
  <Card className="glass-card p-6">
    <h4 className="font-bold text-white mb-4">Dados Pessoais</h4>
    <div className="space-y-2 text-sm">
      <p><strong>Nome:</strong> {nome}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Telefone:</strong> {telefone}</p>
    </div>
  </Card>
  
  <Card className="glass-card p-6">
    <h4 className="font-bold text-white mb-4">Cursos Selecionados</h4>
    <div className="space-y-2">
      {selectedCursos.map((cursoId) => {
        const curso = cursos.find(c => c.id === cursoId);
        return (
          <div key={cursoId} className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">{curso?.titulo}</span>
          </div>
        );
      })}
    </div>
  </Card>
  
  <div className="flex gap-4">
    <Button variant="outline" onClick={() => setCurrentStep(2)}>
      Voltar
    </Button>
    <Button onClick={handleConfirmar}>
      Confirmar Inscrição
    </Button>
  </div>
</div>
```

### Etapa 4: Oferta Palestras
```tsx
<div className="space-y-6">
  <div className="text-center">
    <Badge className="mb-4 bg-brand-orange-coral/20 text-brand-orange-coral">
      Oferta Especial
    </Badge>
    <h3 className="text-3xl font-bold text-white mb-2">
      Palestras Noturnas Exclusivas
    </h3>
    <p className="text-gray-400">
      Aproveite para garantir sua vaga nas palestras premium
    </p>
  </div>
  
  <div className="grid md:grid-cols-2 gap-4">
    {palestrasNoturnas.map((palestra) => (
      <Card key={palestra.id} className="glass-card p-6">
        <h4 className="font-bold text-white mb-2">{palestra.titulo}</h4>
        <p className="text-sm text-gray-400 mb-3">{palestra.palestrante}</p>
        <div className="flex items-center gap-2 text-brand-orange-coral">
          <Clock className="h-4 w-4" />
          <span className="text-sm">{palestra.horario_inicio}</span>
        </div>
      </Card>
    ))}
  </div>
  
  <Card className="glass-card p-6 border-brand-orange-coral/30 bg-brand-orange-coral/10">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h4 className="font-bold text-white">Pacote Completo</h4>
        <p className="text-sm text-gray-400">2 palestras + networking</p>
      </div>
      <div className="text-right">
        <p className="text-3xl font-bold text-brand-orange-coral">R$ 179,99</p>
      </div>
    </div>
    
    <div className="space-y-2 mb-6">
      {[
        'Acesso às 2 palestras noturnas',
        'Networking exclusivo',
        'Material digital',
        'Certificado de participação'
      ].map((beneficio, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>{beneficio}</span>
        </div>
      ))}
    </div>
    
    <div className="flex gap-4">
      <Button 
        variant="outline" 
        className="flex-1"
        onClick={() => setCurrentStep(5)}
      >
        Pular
      </Button>
      <Button 
        className="flex-1 bg-brand-orange-coral hover:bg-brand-orange-intense"
        onClick={handleComprarPalestras}
      >
        Comprar Agora
      </Button>
    </div>
  </Card>
</div>
```

### Etapa 5: Download App
```tsx
<div className="space-y-6">
  <div className="text-center">
    <Smartphone className="h-16 w-16 text-brand-orange-coral mx-auto mb-4" />
    <h3 className="text-3xl font-bold text-white mb-2">
      Baixe o App Growth Experience
    </h3>
    <p className="text-gray-400">
      Acompanhe sua programação, receba notificações e fique por dentro de tudo!
    </p>
  </div>
  
  <Card className="glass-card p-8 border-brand-orange-coral/30">
    <h4 className="font-bold text-white mb-4 text-center">
      Por que baixar o app?
    </h4>
    <div className="grid md:grid-cols-2 gap-4">
      {[
        { icon: Calendar, text: 'Sua programação personalizada' },
        { icon: Bell, text: 'Notificações em tempo real' },
        { icon: Users, text: 'Networking com participantes' },
        { icon: Download, text: 'Materiais e certificados' }
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-orange-coral/20 flex items-center justify-center">
            <item.icon className="h-5 w-5 text-brand-orange-coral" />
          </div>
          <span className="text-sm">{item.text}</span>
        </div>
      ))}
    </div>
  </Card>
  
  {/* Instruções iOS/Android */}
  <div className="grid md:grid-cols-2 gap-4">
    <Card className="glass-card p-6">
      <h4 className="font-bold text-white mb-3">iPhone / iPad</h4>
      <ol className="space-y-2 text-sm text-gray-300">
        <li>1. Safari → Compartilhar</li>
        <li>2. "Adicionar à Tela de Início"</li>
        <li>3. Confirmar</li>
      </ol>
    </Card>
    
    <Card className="glass-card p-6">
      <h4 className="font-bold text-white mb-3">Android</h4>
      <ol className="space-y-2 text-sm text-gray-300">
        <li>1. Chrome → Menu (⋮)</li>
        <li>2. "Instalar app"</li>
        <li>3. Confirmar</li>
      </ol>
    </Card>
  </div>
  
  <Button 
    className="w-full bg-brand-orange-coral hover:bg-brand-orange-intense"
    onClick={() => setCurrentStep(6)}
  >
    Já baixei o app, continuar
  </Button>
</div>
```

### Etapa 6: Conclusão
```tsx
<div className="text-center space-y-6">
  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
    <CheckCircle className="h-12 w-12 text-green-500" />
  </div>
  
  <div>
    <h3 className="text-3xl font-bold text-white mb-2">
      Inscrição Confirmada!
    </h3>
    <p className="text-gray-400">
      Enviamos um email de confirmação para {email}
    </p>
  </div>
  
  <Card className="glass-card p-6 border-brand-orange-coral/30 bg-brand-orange-coral/10">
    <h4 className="font-bold text-white mb-4">Próximos Passos</h4>
    <div className="space-y-3 text-left">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-brand-orange-coral/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-brand-orange-coral text-xs font-bold">1</span>
        </div>
        <div>
          <p className="text-white font-semibold">Baixe o app</p>
          <p className="text-sm text-gray-400">Instale agora para não perder nada</p>
        </div>
      </div>
      
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-brand-orange-coral/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-brand-orange-coral text-xs font-bold">2</span>
        </div>
        <div>
          <p className="text-white font-semibold">Faça login no app</p>
          <p className="text-sm text-gray-400">Use seu email e senha cadastrados</p>
        </div>
      </div>
      
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-brand-orange-coral/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-brand-orange-coral text-xs font-bold">3</span>
        </div>
        <div>
          <p className="text-white font-semibold">Acompanhe sua programação</p>
          <p className="text-sm text-gray-400">Veja seus cursos e horários</p>
        </div>
      </div>
    </div>
  </Card>
  
  <div className="flex gap-4">
    <Button 
      variant="outline" 
      className="flex-1"
      onClick={() => window.location.href = '/'}
    >
      Voltar ao Início
    </Button>
    <Button 
      className="flex-1 bg-brand-orange-coral hover:bg-brand-orange-intense"
      onClick={() => window.location.href = '/growth-experience-triunfo#app'}
    >
      Baixar App Agora
    </Button>
  </div>
</div>
```

---

## 🗄️ BANCO DE DADOS

### Tabela: inscricoes_growth_experience
```sql
CREATE TABLE inscricoes_growth_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cursos_selecionados JSONB NOT NULL, -- Array de IDs dos cursos
  palestras_noturnas BOOLEAN DEFAULT false,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  status_pagamento TEXT DEFAULT 'pendente', -- pendente, pago, cancelado
  app_instalado BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📱 INTEGRAÇÃO COM APP

### Ao fazer login no app:
1. Buscar inscrição do usuário
2. Mostrar cursos selecionados
3. Criar agenda personalizada
4. Habilitar notificações

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO

1. ✅ Criar dados de programação completa
2. ✅ Criar componente ProgramacaoCompleta
3. ✅ Criar modal multi-step
4. ✅ Integrar com Supabase
5. ✅ Testar fluxo completo
6. ✅ Adicionar validações
7. ✅ Testar responsividade

---

**Pronto para implementar?** Vou começar criando os componentes!
