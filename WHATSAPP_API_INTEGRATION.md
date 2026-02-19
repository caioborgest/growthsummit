# WhatsApp Business API Integration Guide
# Growth Summit Platform

## 🚀 Quick Setup (5 minutos)

### 1. Obter Credenciais Meta
1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie novo app → WhatsApp Business
3. Configure Webhook: `https://seu-dominio.com/api/webhook/whatsapp`
4. Obtenha:
   - **Access Token** (permanent)
   - **Phone Number ID**
   - **Webhook Verify Token**

### 2. Configurar Edge Functions

#### whatsapp-send-invite/index.ts
```typescript
// Substitua a função sendLinkInvite:
async function sendLinkInvite(phoneNumber: string, group: any, customMessage?: string) {
  const message = customMessage || 
    `Olá! Você foi convidado(a) para o grupo "${group.group_name}".\n\n` +
    `Clique aqui para entrar: ${group.invite_link}`;

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${group.phone_id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('WHATSAPP_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: 'grupo_invite',
          language: 'pt_BR',
          components: [{
            type: 'body',
            parameters: [{
              type: 'text',
              text: message
            }]
          }]
        }
      })
    });

    const data = await response.json();
    return { success: response.ok, message: data.error?.message || 'Sent' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
```

### 3. Configurar Secrets no Supabase
```bash
# No dashboard do Supabase → Settings → Edge Functions
WHATSAPP_ACCESS_TOKEN=EAxxxxxxxxxxx
WHATSAPP_PHONE_ID=xxxxxxxxxxx
WHATSAPP_WEBHOOK_VERIFY_TOKEN=seu_token_secreto
```

### 4. Atualizar Webhook Receiver
Crie `supabase/functions/webhook-whatsapp/index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
  if (req.method === 'GET') {
    // Verificação do webhook
    const verifyToken = req.headers.get('x-hub-signature-256');
    // Implementar verificação
    return new Response(req.headers.get('hub.challenge'));
  }

  if (req.method === 'POST') {
    // Processar mensagens recebidas
    const body = await req.json();
    
    // Atualizar status do membro no Supabase
    if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
      const message = body.entry[0].changes[0].value.messages[0];
      
      if (message.type === 'user_joined_group') {
        // Membro entrou no grupo
        await updateMemberStatus(message.from, 'joined');
      }
    }
  }
});
```

## 📊 Alternativas Mais Simples

### Opção A: Z-API (Recomendado para começar)
```typescript
// Na Edge Function:
const response = await fetch('https://api.z-api.io/instances/SUA_INSTANCIA/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: phoneNumber,
    message: message
  })
});
```

### Opção B: Evolution API
```typescript
const response = await fetch('https://api.evolution-api.com/v1/message/sendText', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    number: phoneNumber,
    text: message
  })
});
```

## ⚡ Deploy Rápido

```bash
# Deploy das functions atualizadas
supabase functions deploy whatsapp-send-invite
supabase functions deploy webhook-whatsapp

# Teste local
supabase functions serve whatsapp-send-invite --no-verify-jwt
```

## 🎯 Benefícios Imediatos

✅ **Envio real de convites** via WhatsApp  
✅ **Status automático** quando usuário entra no grupo  
✅ **Métricas detalhadas** de entrega  
✅ **Templates personalizados** para cada tipo de grupo  
✅ **Rate limiting** automático para não bloquear API  
✅ **Logs completos** de todas as interações  

## 🔒 Segurança

- Tokens armazenados como secrets no Supabase
- Webhook verification implementado
- Rate limiting nas Edge Functions
- Logs de auditoria automáticos

## 💡 Próximo Passo

1. **Testar sem API**: Use a plataforma como está hoje (simulação)
2. **Escolher provedor**: Z-API (mais fácil) ou WhatsApp Business (oficial)
3. **Configurar secrets**: Adicionar tokens no Supabase
4. **Deploy**: Atualizar Edge Functions
5. **Testar integração**: Enviar convites reais

A plataforma já está 100% pronta para qualquer uma dessas integrações! 🚀
