# 🚀 GUIA DE IMPLEMENTAÇÃO FINAL - Growth Experience Triunfo

## ✅ TAREFAS A SEREM CONCLUÍDAS

### 1. ✅ Remover Cor Amarela (EXECUTANDO)
O script `remove_yellow.py` está sendo executado automaticamente.

---

### 2. 📝 Atualizar Logos na Página Growth Experience Triunfo

**Arquivo**: `app/src/pages/public/GrowthExperienceTriunfo.tsx`

#### A. Atualizar InnerHeader (procure por "InnerHeader" no arquivo, aproximadamente linha 550-650)

**ANTES**:
```tsx
<Link to="/" className="flex items-center space-x-3">
  <div className="w-10 h-10 rounded-lg bg-brand-orange-coral flex items-center justify-center">
    <Rocket className="h-6 w-6 text-white" />
  </div>
  <div>
    <span className="text-white text-lg font-bold block">Growth Experience</span>
    <span className="text-brand-orange-coral text-xs block font-bold">Triunfo-PE 2026</span>
  </div>
</Link>
```

**DEPOIS**:
```tsx
<Link to="/" className="flex items-center space-x-3">
  <img 
    src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/logomarca-GX-fundoescuro.png"
    alt="Growth Experience"
    className="h-14 w-auto"
    onError={(e) => {
      e.currentTarget.src = 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth_experience.png';
    }}
  />
</Link>
```

#### B. Atualizar InnerFooter (procure por "InnerFooter" no arquivo, aproximadamente linha 1000-1100)

**ANTES** (procure por algo similar):
```tsx
<div className="w-10 h-10 rounded-lg bg-brand-orange-coral flex items-center justify-center">
  <Rocket className="h-6 w-6 text-white" />
</div>
<div>
  <span className="text-white text-lg font-bold block">Growth Experience</span>
  <span className="text-brand-orange-coral text-xs block font-bold">2026</span>
</div>
```

**DEPOIS**:
```tsx
<img 
  src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth_experience.png"
  alt="Growth Experience"
  className="h-12 w-auto"
  onError={(e) => {
    e.currentTarget.src = 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/logomarca-GX-fundoescuro.png';
  }}
/>
```

---

### 3. 📱 Adicionar Seção de Download do App

**Arquivo**: `app/src/pages/public/GrowthExperienceTriunfo.tsx`

**Localização**: Antes do `<InnerFooter />` (aproximadamente linha 1050)

**Adicionar import no topo do arquivo**:
```tsx
import { AppDownloadSection } from '@/components/app/AppDownloadSection';
```

**Adicionar componente**:
```tsx
{/* Seção de Download do App */}
<AppDownloadSection />

<InnerFooter />
```

---

### 4. 👥 Adicionar Seções "Seja Mentor" e "Seja Mentorado"

**Arquivo**: `app/src/pages/public/GrowthExperienceTriunfo.tsx`

**Localização**: Após a seção de Mentorias 1:1 (procure por "Mentorias 1:1", aproximadamente linha 850-900)

**Adicionar após a seção de Mentorias**:

```tsx
{/* Seja Mentor */}
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

{/* Seja Mentorado */}
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

**Adicionar novo modal** (procure pela seção de modais no início do return, aproximadamente linha 600):

```tsx
<InscricaoModal 
  isOpen={modalAberto === 'mentor-cadastro'} 
  onClose={() => setModalAberto(null)} 
  tipo="mentor-cadastro" 
  eventoNome="Growth Experience Triunfo-PE 2026" 
/>
```

---

### 5. 🔐 Adicionar Criação de Senha nos Modais

#### A. InscricaoModal.tsx

**Arquivo**: `app/src/components/forms/InscricaoModal.tsx`

**Adicionar no início do componente** (após os outros useState):
```tsx
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
```

**Adicionar no formulário** (antes do botão de submissão):
```tsx
<div className="space-y-4">
  <div>
    <Label htmlFor="password" className="text-white">
      Criar Senha *
    </Label>
    <Input
      id="password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      minLength={8}
      className="bg-dark-200 border-white/10 text-white"
      placeholder="Mínimo 8 caracteres"
    />
    <p className="text-xs text-gray-400 mt-1">
      Esta senha será usada para acessar o app Growth Experience
    </p>
  </div>

  <div>
    <Label htmlFor="confirmPassword" className="text-white">
      Confirmar Senha *
    </Label>
    <Input
      id="confirmPassword"
      type="password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      required
      className="bg-dark-200 border-white/10 text-white"
      placeholder="Digite a senha novamente"
    />
  </div>
</div>
```

**Atualizar handleSubmit** (adicionar no início da função):
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Validar senhas
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      setLoading(false);
      return;
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: password,
      options: {
        data: {
          name: formData.nome,
          phone: formData.telefone,
          role: tipo === 'mentor-cadastro' ? 'mentor' : 'participant',
        }
      }
    });

    if (authError) {
      setError('Erro ao criar conta: ' + authError.message);
      setLoading(false);
      return;
    }

    // Continuar com a inscrição no evento...
    // (código existente de inserção no banco)
  } catch (err: any) {
    setError(err.message || 'Erro ao processar inscrição');
  } finally {
    setLoading(false);
  }
};
```

**Adicionar import do supabase no topo**:
```tsx
import { supabase } from '@/lib/supabase';
```

#### B. Repetir o mesmo processo para:
- `StartupFormModal.tsx`
- `B2BFormModal.tsx`

---

### 6. 🔒 Adicionar Rota de Segurança no Admin

**Arquivo**: `app/src/App.tsx`

**Adicionar import**:
```tsx
import { AdminSecurity } from './pages/admin/AdminSecurity';
```

**Adicionar rota** (dentro das rotas admin, procure por `<Route path="admin"`, aproximadamente linha 120-150):
```tsx
<Route path="seguranca" element={<AdminSecurity />} />
```

---

### 7. 📦 Instalar Dependência QR Code

**Executar no terminal**:
```bash
cd app
npm install qrcode @types/qrcode
```

---

### 8. 🗄️ Executar SQL no Supabase

1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Copie todo o conteúdo de `SUPABASE_SECURITY_TABLES.sql`
5. Cole no editor e clique em **Run**

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

```
[ ] 1. Script remove_yellow.py executado
[ ] 2. Logos atualizados no header
[ ] 3. Logos atualizados no footer
[ ] 4. AppDownloadSection adicionada
[ ] 5. Seção "Seja Mentor" adicionada
[ ] 6. Seção "Seja Mentorado" adicionada
[ ] 7. Modal mentor-cadastro adicionado
[ ] 8. Campos de senha em InscricaoModal
[ ] 9. Campos de senha em StartupFormModal
[ ] 10. Campos de senha em B2BFormModal
[ ] 11. Rota de segurança adicionada
[ ] 12. npm install qrcode executado
[ ] 13. SQL executado no Supabase
[ ] 14. Teste visual completo
```

---

## 🚀 COMANDOS RÁPIDOS

```bash
# 1. Remover amarelo (já executando)
python remove_yellow.py

# 2. Instalar dependências
cd app
npm install qrcode @types/qrcode

# 3. Rodar dev
npm run dev

# 4. Testar
# Abrir http://localhost:5173/growth-experience-triunfo
```

---

## 📞 ORDEM DE EXECUÇÃO RECOMENDADA

1. ✅ Aguardar conclusão do script Python
2. ⏳ Atualizar logos (header + footer)
3. ⏳ Adicionar AppDownloadSection
4. ⏳ Adicionar seções de mentoria
5. ⏳ Adicionar campos de senha nos modais
6. ⏳ Adicionar rota admin
7. ⏳ Instalar dependências
8. ⏳ Executar SQL
9. ⏳ Testar tudo

---

**Status**: Em Progresso  
**Última atualização**: 16/02/2026 14:50
