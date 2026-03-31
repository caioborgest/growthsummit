import { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Send,
  Users,
  FileText,
  Eye,
  MousePointer,
  Plus,
  Save,
  Trash2,
  Copy,
  Bell,
  MessageSquare,
  Info,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Zap,
  TrendingUp,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRegistrations, useNotifications, useUsers } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { notificationService } from '@/services/notificationService';
import { emailService } from '@/services/emailService';

import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

const initialEmailTemplates = [
  {
    id: 'pay-conf',
    name: 'Confirmação de Pagamento ✅',
    subject: 'Pagamento Confirmado! Seu lugar no Growth Experience está garantido 🎟️',
    category: 'Inscrições',
    lastUsed: '2024-03-30',
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #f1f5f9;">
    <h1 style="color: #ff7043; font-size: 24px; text-align: center;">Tudo certo, {{nome}}!</h1>
    <p style="font-size: 16px; line-height: 1.6; text-align: center;">Recebemos a confirmação do seu pagamento para o <strong>Growth Experience 2026</strong>. Seu ingresso já está disponível no seu painel.</p>
    <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Inscrição:</strong> #{{id}}</p>
        <p style="margin: 0 0 10px 0;"><strong>Tipo:</strong> {{ticket}}</p>
        <p style="margin: 0;"><strong>Status:</strong> Confirmado ✅</p>
    </div>
    <div style="text-align: center;">
        <a href="https://www.gxexperience.site/minha-area" style="display: inline-block; background-color: #ff7043; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 10px 0;">Acessar Meu Ingresso</a>
    </div>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;" />
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 Growth Experience - Petrolina/PE & Triunfo/PE</p>
</div>`
  },
  {
    id: 'welcome-inst',
    name: 'Boas-vindas + Social 📣',
    subject: 'Bem-vindo(a) ao Growth Experience! Vamos compartilhar no Instagram? 🚀',
    category: 'Engajamento',
    lastUsed: '2024-03-30',
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #ffffff; padding: 40px; border-radius: 16px;">
    <h1 style="color: #ff7043; font-size: 24px;">Prepare-se para o Maior Encontro de Gestão da Região! 🚀</h1>
    <p>Olá, <strong>{{nome}}</strong>!</p>
    <p>Sua jornada no <strong>Growth Experience 2026</strong> começa agora. Estamos preparando algo épico para Triunfo e Petrolina.</p>
    <div style="background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); padding: 25px; border-radius: 16px; color: white; margin: 30px 0; text-align: center;">
        <h2 style="margin-top: 0;">Poste e nos marque! 📸</h2>
        <p>Poste seu ingresso ou uma foto sua se preparando com a hashtag <strong>#GrowthExperience2026</strong> e mencione <strong>@gxexperience</strong>.</p>
        <p>Os melhores posts ganham pontos extras na nossa Gamificação!</p>
        <a href="https://instagram.com/gxexperience" style="display: inline-block; background: white; color: #d62976; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Seguir no Instagram</a>
    </div>
    <p>Acesse seu painel para ver sua pontuação atual e começar a subir de nível!</p>
</div>`
  },
  {
    id: 'reminder-h-24',
    name: 'Lembrete (24h antes) ⏳',
    subject: 'Amanhã é o Grande Dia! Tudo o que você precisa saber ⏳',
    category: 'Lembretes',
    lastUsed: '2024-03-30',
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 40px;">
    <h1 style="color: #ff7043; font-size: 24px;">Chegou a Hora, {{nome}}! ⌛</h1>
    <p>Faltam apenas 24 horas para o início do <strong>Growth Experience 2026</strong>.</p>
    <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <p style="margin: 0 0 10px 0;">📍 <strong>Local:</strong> Espaço Parque, Triunfo/PE</p>
        <p style="margin: 0 0 10px 0;">🕗 <strong>Credenciamento:</strong> A partir das 08:00h</p>
        <p style="margin: 0;">🎟️ <strong>Importante:</strong> Tenha seu QR Code em mãos (digital ou impresso).</p>
    </div>
    <p>Não esqueça de carregar seu celular para participar das votações e interações em tempo real.</p>
    <div style="text-align: center;">
        <a href="https://www.gxexperience.site/minha-area" style="display: inline-block; background-color: #ff7043; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">Abrir Meu QR Code</a>
    </div>
</div>`
  },
  {
    id: 'raffle-winner',
    name: 'Ganhador Sorteio 🏆',
    subject: 'Parabéns! Você acaba de ganhar um prêmio no Growth Experience! 🎁',
    category: 'Gamificação',
    lastUsed: '2024-03-30',
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 40px; text-align: center;">
    <div style="font-size: 50px; margin-bottom: 20px;">🏆</div>
    <h1 style="color: #ff7043; font-size: 28px;">VOCÊ GANHOU, {{nome}}!</h1>
    <p style="font-size: 18px;">Seu nome foi sorteado no <strong>{{id}}</strong>!</p>
    <div style="background: #fffbeb; padding: 30px; border-radius: 20px; border: 2px dashed #fbbf24; margin: 30px 0;">
        <p style="margin: 0; font-size: 22px; color: #92400e; font-weight: bold;">🎁 {{ticket}}</p>
    </div>
    <p>Dirija-se ao palco central ou balcão de prêmios com seu QR Code para retirar sua recompensa.</p>
    <p style="color: #64748b; font-size: 14px;">Código de Verificação: {{email}}_{{data}}</p>
</div>`
  },
  {
    id: 'gamification-rank-up',
    name: 'Subiu de Nível 🎖️',
    subject: 'UAU! Você subiu de nível na Gamificação do evento! 🎖️',
    category: 'Gamificação',
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 40px; text-align: center;">
    <h1 style="color: #ff7043; font-size: 24px;">Novo Ranking Alcançado! 🎖️</h1>
    <p>Parabéns, <strong>{{nome}}</strong>!</p>
    <p>Você acaba de alcançar o nível <strong>{{ticket}}</strong> no Growth Experience.</p>
    <div style="margin: 30px 0;">
        <div style="height: 12px; background: #e2e8f0; border-radius: 6px; position: relative;">
            <div style="width: 80%; height: 100%; background: #ff7043; border-radius: 6px;"></div>
        </div>
        <p style="font-size: 14px; color: #64748b; margin-top: 10px;">{{id}} pontos acumulados — Falta pouco para o próximo prêmio!</p>
    </div>
    <p>Continue fazendo check-ins nas palestras e participando das mentorias para ganhar mais pontos.</p>
</div>`
  }
];

const initialEmailCampaigns = [
  {
    id: '1',
    name: 'Lançamento Early Bird',
    recipients: 1247,
    sent: 1247,
    opened: 892,
    clicked: 456,
    status: 'sent',
    sentAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Novos Palestrantes',
    recipients: 1247,
    sent: 0,
    opened: 0,
    clicked: 0,
    status: 'draft',
  },
];

export default function AdminComunicacao() {
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns' | 'compose' | 'notifications'>('templates');
  
  const { selectedProject } = useProject();
  const { data: users } = useUsers();
  const { data: registrations } = useRegistrations();
  const { data: notificationsList, refetch: refetchNotifications } = useNotifications();
  
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('gs_email_templates');
    return saved ? JSON.parse(saved) : initialEmailTemplates;
  });

  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem('gs_email_campaigns');
    return saved ? JSON.parse(saved) : initialEmailCampaigns;
  });

  const stats = useMemo(() => {
    const totalSent = campaigns.reduce((acc, c) => acc + (c.sent || 0), 0);
    const totalOpened = campaigns.reduce((acc, c) => acc + (c.opened || 0), 0);
    const totalClicked = campaigns.reduce((acc, c) => acc + (c.clicked || 0), 0);
    
    return {
      totalSent,
      templates: templates.length,
      openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
      notifications: notificationsList?.length || 0,
    };
  }, [campaigns, templates, notificationsList]);

  useEffect(() => {
    localStorage.setItem('gs_email_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('gs_email_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    subject: '',
    category: 'Inscrições',
    body: ''
  });

  const [campaignFormData, setCampaignFormData] = useState({
    name: '',
    templateId: '',
    recipients: 'all'
  });

  const [composeData, setComposeData] = useState({
    subject: '',
    body: '',
    recipients: 'all',
  });

  const [notificationFormData, setNotificationFormData] = useState({
    recipients: 'all',
    type: 'info' as const,
    title: '',
    message: '',
    actionUrl: ''
  });

  const [selectedTemplate, setSelectedTemplate] = useState<typeof initialEmailTemplates[0] | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFormData.name || !templateFormData.subject) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const newTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      ...templateFormData,
      lastUsed: new Date().toISOString()
    };

    setTemplates([newTemplate, ...templates]);
    toast.success('Template criado com sucesso!');
    setIsTemplateModalOpen(false);
    setTemplateFormData({ name: '', subject: '', category: 'Inscrições', body: '' });
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignFormData.name || !campaignFormData.templateId) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    let count = 0;
    const filter = campaignFormData.recipients;
    
    if (filter === 'all') count = registrations.length;
    else if (filter === 'paid') count = registrations.filter(r => (r as any).status === 'paid' || (r as any).status_pagamento === 'pago').length;
    else if (filter === 'pending') count = registrations.filter(r => (r as any).status === 'pending' || (r as any).status_pagamento === 'pendente').length;
    else if (filter === 'vip') count = registrations.filter(r => (r as any).ticketType === 'vip' || (r as any).tipo_inscricao === 'vip').length;
    // ... potentially more precise counts for mentors/startups if we had them in context, 
    // but for now we'll estimate or use the context we have.
    else count = registrations.length; // Fallback

    const newCampaign = {
      id: Math.random().toString(36).substr(2, 9),
      name: campaignFormData.name,
      templateId: campaignFormData.templateId,
      recipients: count,
      recipients_filter: filter,
      sent: 0,
      opened: 0,
      clicked: 0,
      status: 'draft'
    };

    setCampaigns([newCampaign, ...campaigns]);
    toast.success('Campanha criada com sucesso!');
    setIsCampaignModalOpen(false);
    setCampaignFormData({ name: '', templateId: '', recipients: 'all' });
  };

  const handleSend = async () => {
    if (!composeData.subject || !composeData.body) {
      toast.error('Preencha o assunto e o corpo do email');
      return;
    }

    try {
      const loadingToast = toast.loading('Preparando envio personalizado...');

      let recipientsData: any[] = [];

      // 1. Buscar destinatários baseados no filtro (com isolamento por projeto)
      if (!selectedProject?.id) {
        toast.dismiss(loadingToast);
        toast.error('Nenhum projeto selecionado');
        return;
      }
      if (composeData.recipients === 'all') {
        const { data } = await (supabase.from('inscricoes_growth_experience').select('email, nome, tipo_inscricao') as any).eq('project_id', selectedProject.id);
        recipientsData = (data || []).map((item: any) => ({ email: item.email, name: item.nome || item.name }));
      } else if (composeData.recipients === 'paid') {
        const { data } = await (supabase.from('inscricoes_growth_experience').select('email, nome, tipo_inscricao') as any).eq('project_id', selectedProject.id).eq('status_pagamento', 'pago');
        recipientsData = (data || []).map((item: any) => ({ email: item.email, name: item.nome || item.name }));
      } else if (composeData.recipients === 'pending') {
        const { data } = await (supabase.from('inscricoes_growth_experience').select('email, nome, tipo_inscricao') as any).eq('project_id', selectedProject.id).eq('status_pagamento', 'pendente');
        recipientsData = (data || []).map((item: any) => ({ email: item.email, name: item.nome || item.name }));
      } else if (composeData.recipients === 'vip') {
        const { data } = await (supabase.from('inscricoes_growth_experience').select('email, nome, tipo_inscricao') as any).eq('project_id', selectedProject.id).eq('tipo_inscricao', 'vip');
        recipientsData = (data || []).map((item: any) => ({ email: item.email, name: item.nome || item.name }));
      } else if (composeData.recipients === 'mentors') {
        const { data } = await (supabase.from('mentores_growth_experience').select('email, nome') as any).eq('project_id', selectedProject.id);
        recipientsData = (data || []).map((item: any) => ({ email: item.email, name: item.nome || item.nome_fundador }));
      } else if (composeData.recipients === 'startups') {
        const { data } = await (supabase.from('startups_arena_pitch').select('email, nome_startup, nome_fundador') as any).eq('project_id', selectedProject.id);
        recipientsData = (data || []).map((item: any) => ({ email: item.email, name: item.nome_startup || item.nome_fundador }));
      } else if (composeData.recipients === 'sponsors') {
        const { data } = await (supabase.from('sponsors').select('contact_email, company_name, contact_name') as any).eq('project_id', selectedProject.id);
        recipientsData = (data || []).map((item: any) => ({ email: item.contact_email, name: item.company_name || item.contact_name }));
      } else if (composeData.recipients === 'companies') {
        const [b2bRes, incentiveRes] = await Promise.all([
          (supabase.from('rodada_negocios_b2b').select('email, nome_empresa, nome_representante') as any).eq('project_id', selectedProject.id),
          (supabase.from('inscricoes_empresas_incentivadoras').select('email, nome_empresa, nome_responsavel') as any).eq('project_id', selectedProject.id)
        ]);
        recipientsData = [
          ...(b2bRes.data || []).map((item: any) => ({ email: item.email, name: item.nome_empresa || item.nome_representante })),
          ...(incentiveRes.data || []).map((item: any) => ({ email: item.email, name: item.nome_empresa || item.nome_responsavel }))
        ];
      }

      if (recipientsData.length === 0) {
        toast.dismiss(loadingToast);
        toast.error('Nenhum destinatário encontrado para este filtro');
        return;
      }

      // 2. Agrupar por email para evitar duplicidade
      const uniqueRecipients = Array.from(new Map(recipientsData.map(item => [item.email, item])).values());

      // 3. Chamar a Edge Function para cada destinatário ou em lote se a API suportar templates
      // Como não temos a API de templates no backend, faremos a substituição aqui e enviaremos
      
      const sendPromises = uniqueRecipients.map(async (recipient) => {
        let personalizedBody = composeData.body;
        const nome = recipient.nome || recipient.nome_fundador || recipient.nome_representante || recipient.nome_responsavel || 'Participante';
        const empresa = recipient.nome_empresa || recipient.company_name || recipient.startup_name || '';
        const ticket = recipient.tipo_inscricao || '';

        personalizedBody = personalizedBody
          .replace(/{{nome}}/g, nome)
          .replace(/{{email}}/g, recipient.email)
          .replace(/{{empresa}}/g, empresa)
          .replace(/{{ticket}}/g, ticket)
          .replace(/{{data}}/g, new Date().toLocaleDateString('pt-BR'))
          .replace(/{{evento}}/g, 'Growth Experience 2026');

        return emailService.send({
          to: [recipient.email],
          subject: composeData.subject,
          html: personalizedBody.replace(/\n/g, '<br/>')
        });
      });

      // Para não estourar rate limit, poderíamos fazer em chunks, mas aqui usaremos Promise.all por simplicidade
      await Promise.all(sendPromises);

      toast.dismiss(loadingToast);
      toast.success(`Emails disparados para ${uniqueRecipients.length} destinatários!`);

      // Limpar formulário
      setComposeData({
        recipients: 'all',
        subject: '',
        body: ''
      });

    } catch (err: unknown) {
      logger.error('Send error:', { error: err });
      toast.dismiss();
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao enviar emails: ' + message);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    if (!window.confirm(`Deseja disparar a campanha "${campaign.name}" agora?`)) return;

    const template = templates.find(t => t.id === campaign.templateId) || templates[0];
    
    // Set compose data to trigger handleSend
    setComposeData({
      subject: template.subject,
      body: template.body || '',
      recipients: campaign.recipients_filter || 'all'
    });

    // Auto trigger send after a small delay to ensure state update (or call handleSend directly with inject)
    setTimeout(() => {
      handleSend();
      // Update campaign status
      setCampaigns((prev: any) => prev.map((c: any) => 
        c.id === campaignId ? { ...c, status: 'sent', sentAt: new Date().toISOString(), sent: campaign.recipients } : c
      ));
    }, 100);
  };

  const handleInsertVariable = (variable: string) => {
    setComposeData((prev: any) => ({
      ...prev,
      body: prev.body + variable
    }));
  };

  const handlePreviewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const handleSendNotification = async () => {
    if (!notificationFormData.title || !notificationFormData.message) {
      toast.error('Preencha título e mensagem');
      return;
    }

    try {
      let targetUserIds: string[] = [];
      // Se for GE, filtramos melhor usando as tabelas específicas
      if (notificationFormData.recipients === 'all') {
        // Pega todos que têm inscrição no projeto atual
        targetUserIds = registrations?.map(r => r.userId).filter(Boolean) as string[] || [];
      } else {
        // Filtra por papel (role) e que tenha inscrição no projeto
        const projectUserIds = new Set(registrations?.map(r => r.userId));
        targetUserIds = users?.filter(u => 
          u.role === notificationFormData.recipients && projectUserIds.has(u.id)
        ).map(u => u.id) || [];
      }

      if (targetUserIds.length === 0) {
        toast.error('Nenhum destinatário encontrado');
        return;
      }

      await notificationService.sendBulk(targetUserIds, {
        title: notificationFormData.title,
        message: notificationFormData.message,
        type: notificationFormData.type,
        actionUrl: notificationFormData.actionUrl
      }, selectedProject?.id || '');

      toast.success('Notificações enviadas com sucesso!');
      setNotificationFormData(prev => ({
        ...prev,
        title: '',
        message: '',
        actionUrl: ''
      }));
      refetchNotifications();
    } catch (error) {
      logger.error('Error sending notifications:', error);
      toast.error('Erro ao enviar notificações: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };



  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 italic">
            <Mail className="h-8 w-8 text-brand-orange-coral fill-brand-orange-coral" />
            GESTOR DE <span className="text-brand-orange-coral">COMUNICAÇÃO</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">E-mail Marketing, Push Notifications e Gestão de Templates</p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'templates' && (
            <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-8 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-2xl shadow-glow-teal transition-all">
                  <Plus className="h-4 w-4 mr-2" /> NOVO TEMPLATE
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-dark-200 border-dark-300 text-white rounded-[2rem] max-w-2xl shadow-2xl backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black italic uppercase">Criar <span className="text-teal-500">Novo Template</span></DialogTitle>
                  <DialogDescription className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                    Defina um novo modelo de email ou push para as comunicações do evento.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTemplate} className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Nome do Template *</Label>
                       <Input
                         required
                         value={templateFormData.name}
                         onChange={e => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                         className="h-12 bg-dark-100 border-white/5 focus:border-teal-500/50"
                         placeholder="Ex: Boas-vindas Mentores"
                       />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Categoria</Label>
                      <select
                        value={templateFormData.category}
                        onChange={e => setTemplateFormData({ ...templateFormData, category: e.target.value })}
                        className="w-full h-12 bg-dark-100 border border-white/5 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                      >
                        <option value="Inscrições">Inscrições</option>
                        <option value="Lembretes">Lembretes</option>
                        <option value="Mentorias">Mentorias</option>
                        <option value="Patrocinadores">Patrocinadores</option>
                        <option value="Empresas">Empresas</option>
                        <option value="Acesso">Acesso</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Assunto do Email *</Label>
                    <Input
                      required
                      value={templateFormData.subject}
                      onChange={e => setTemplateFormData({ ...templateFormData, subject: e.target.value })}
                      className="h-12 bg-dark-100 border-white/5 focus:border-teal-500/50"
                      placeholder="Assunto que o usuário verá na caixa de entrada"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Corpo do Email (HTML/Texto)</Label>
                    <p className="text-[10px] text-gray-500 font-bold mb-1 italic">
                      Variáveis: {"{{nome}}"}, {"{{email}}"}, {"{{empresa}}"}.
                    </p>
                    <Textarea
                      value={templateFormData.body}
                      onChange={e => setTemplateFormData({ ...templateFormData, body: e.target.value })}
                      className="bg-dark-100 border-white/5 focus:border-teal-500/50 min-h-[300px] rounded-xl"
                      placeholder="Olá {{nome}}, seja bem-vindo ao evento..."
                    />
                  </div>
                  <Button type="submit" className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-2xl shadow-glow-teal transition-all">
                    CRIAR TEMPLATE PROFISSIONAL
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {activeTab === 'campaigns' && (
             <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
                <DialogTrigger asChild>
                  <Button className="h-12 px-8 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-2xl shadow-glow-teal transition-all">
                    <Plus className="h-4 w-4 mr-2" /> NOVA CAMPANHA
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dark-200 border-dark-300 text-white rounded-[2rem] max-w-xl shadow-2xl backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black italic uppercase">Lançar <span className="text-teal-500">Nova Campanha</span></DialogTitle>
                    <DialogDescription className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                      Configure os disparos em massa para um público segmentado.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCampaign} className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Nome da Campanha *</Label>
                      <Input
                        required
                        value={campaignFormData.name}
                        onChange={e => setCampaignFormData({ ...campaignFormData, name: e.target.value })}
                        className="h-12 bg-dark-100 border-white/5 focus:border-teal-500/50"
                        placeholder="Ex: Campanha de Lançamento"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Template Base *</Label>
                      <select
                        required
                        value={campaignFormData.templateId}
                        onChange={e => setCampaignFormData({ ...campaignFormData, templateId: e.target.value })}
                        className="w-full h-12 bg-dark-100 border border-white/5 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                      >
                        <option value="">Selecione um template</option>
                        {templates.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Público Alvo</Label>
                      <select
                        value={campaignFormData.recipients}
                        onChange={e => setCampaignFormData({ ...campaignFormData, recipients: e.target.value })}
                        className="w-full h-12 bg-dark-100 border border-white/5 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                      >
                        <option value="all">Todos os inscritos</option>
                        <option value="paid">Apenas pagos</option>
                        <option value="pending">Apenas pendentes</option>
                        <option value="vip">Apenas VIP</option>
                        <option value="mentors">Mentores</option>
                        <option value="startups">Startups</option>
                        <option value="sponsors">Patrocinadores</option>
                        <option value="companies">Empresas (Equipes/B2B)</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-2xl shadow-glow-teal transition-all uppercase">
                      Agendar Disparo em Massa
                    </Button>
                  </form>
                </DialogContent>
             </Dialog>
          )}
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'E-mails Enviados', val: stats.totalSent.toLocaleString(), color: 'text-white', icon: Send },
          { label: 'Taxa de Abertura', val: `${stats.openRate.toFixed(1)}%`, color: 'text-emerald-400', icon: Eye },
          { label: 'Taxa de Cliques', val: `${stats.clickRate.toFixed(1)}%`, color: 'text-teal-400', icon: MousePointer },
          { label: 'Templates Ativos', val: stats.templates, color: 'text-brand-orange-coral', icon: FileText },
          { label: 'Notificações Push', val: stats.notifications, color: 'text-blue-400', icon: Bell },
        ].map((item, i) => (
          <Card key={i} className="glass-card p-6 rounded-[2rem] relative overflow-hidden group border-white/5">
             <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <item.icon className="h-16 w-16 text-white" />
             </div>
             <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{item.label}</p>
             <h3 className={`text-3xl font-black ${item.color} tracking-tighter`}>{item.val}</h3>
          </Card>
        ))}
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center p-1 bg-dark-200/50 rounded-2xl border border-white/5 h-14 backdrop-blur-xl shrink-0 overflow-x-auto no-scrollbar max-w-full">
            {[
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'campaigns', label: 'Campanhas', icon: BarChart3 },
              { id: 'compose', label: 'E-mail', icon: Send },
              { id: 'notifications', label: 'Push App', icon: Bell },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 h-full font-black text-[10px] uppercase tracking-widest rounded-xl transition-all whitespace-nowrap min-w-fit ${
                  activeTab === tab.id 
                    ? 'bg-brand-orange-coral text-white shadow-glow-orange/20' 
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:w-80 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Pesquisar registros..."
              className="pl-12 h-14 bg-dark-200/50 border-white/5 rounded-2xl text-xs font-bold"
            />
          </div>
      </div>

      {activeTab === 'templates' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {templates.map((template: any) => (
            <Card key={template.id} className="glass-card hover-card p-6 border-white/5 rounded-[2rem] group relative overflow-hidden">
               <div className="flex items-start justify-between relative z-10">
                 <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                   <FileText className="h-7 w-7 text-teal-400" />
                 </div>
                 <Badge className="bg-dark-100 text-gray-500 font-black text-[9px] uppercase tracking-widest border-white/5">
                   {template.category}
                 </Badge>
               </div>

               <div className="mt-6 space-y-2 relative z-10">
                 <h3 className="text-xl font-black text-white italic uppercase tracking-tight line-clamp-1">{template.name}</h3>
                 <p className="text-gray-500 text-xs font-bold uppercase leading-tight line-clamp-2">{template.subject}</p>
               </div>

               <div className="mt-8 flex items-center justify-between relative z-10">
                 <div className="flex flex-col">
                    <span className="text-gray-700 text-[9px] font-black uppercase tracking-widest">Último disparo</span>
                    <span className="text-white font-black text-xs italic tracking-tighter">
                      {new Date(template.lastUsed).toLocaleDateString('pt-BR')}
                    </span>
                 </div>
                 <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handlePreviewTemplate(template)}
                      className="h-10 w-10 text-teal-400 hover:text-white hover:bg-teal-500/20 rounded-xl border border-white/5"
                    >
                       <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-10 w-10 text-brand-orange-coral hover:text-white hover:bg-brand-orange-coral/20 rounded-xl border border-white/5"
                    >
                       <Copy className="h-4 w-4" />
                    </Button>
                 </div>
               </div>
            </Card>
          ))}
        </div>
      )}

      {/* Campaigns */}
      {activeTab === 'campaigns' && (
        <Card className="glass-card overflow-hidden border-white/5 shadow-2xl animate-in slide-in-from-bottom-4 duration-500 rounded-[2rem]">
          <div className="overflow-x-auto responsive-table">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Campanha</th>
                  <th className="p-6 text-left text-gray-400 font-extrabold uppercase text-[10px] tracking-widest">Alcance</th>
                  <th className="p-6 text-left text-gray-400 font-extrabold uppercase text-[10px] tracking-widest">Aberturas</th>
                  <th className="p-6 text-left text-gray-400 font-extrabold uppercase text-[10px] tracking-widest">Cliques</th>
                  <th className="p-6 text-left text-gray-400 font-extrabold uppercase text-[10px] tracking-widest">Status</th>
                  <th className="p-6 text-right text-gray-400 font-extrabold uppercase text-[10px] tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign: any) => (
                  <tr key={campaign.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-all group">
                    <td className="p-6" data-label="Campanha">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center border border-white/5">
                          <Zap className="h-5 w-5 text-brand-orange-coral" />
                        </div>
                        <div>
                           <p className="text-white font-black text-sm uppercase italic leading-none mb-1">{campaign.name}</p>
                           {campaign.sentAt && (
                             <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tight">Enviado: {new Date(campaign.sentAt).toLocaleDateString()}</p>
                           )}
                        </div>
                      </div>
                    </td>
                    <td className="p-6" data-label="Alcance">
                      <div className="flex items-center gap-2">
                         <Users className="h-4 w-4 text-teal-400" />
                         <span className="text-white font-black text-xs">{campaign.recipients.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-6" data-label="Abr.">
                      {campaign.sent > 0 ? (
                        <div className="flex items-center gap-2">
                           <Eye className="h-4 w-4 text-blue-400" />
                           <span className="text-white font-black text-xs">{campaign.opened.toLocaleString()}</span>
                           <Badge className="bg-blue-500/10 text-blue-400 font-black text-[9px] border-none">
                             {((campaign.opened / campaign.sent) * 100).toFixed(1)}%
                           </Badge>
                        </div>
                      ) : <span className="text-gray-700 font-black">-</span>}
                    </td>
                    <td className="p-6" data-label="Cliq.">
                       {campaign.sent > 0 ? (
                        <div className="flex items-center gap-2">
                           <MousePointer className="h-4 w-4 text-teal-400" />
                           <span className="text-white font-black text-xs">{campaign.clicked.toLocaleString()}</span>
                           <Badge className="bg-teal-500/10 text-teal-400 font-black text-[9px] border-none">
                             {((campaign.clicked / campaign.sent) * 100).toFixed(1)}%
                           </Badge>
                        </div>
                      ) : <span className="text-gray-700 font-black">-</span>}
                    </td>
                    <td className="p-6" data-label="Status">
                       <Badge className={`border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 ${
                         campaign.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400' : 
                         campaign.status === 'draft' ? 'bg-gray-500/10 text-gray-400' : 'bg-yellow-500/10 text-yellow-400'
                       }`}>
                         {campaign.status === 'sent' ? 'Enviado' : 'Rascunho'}
                       </Badge>
                    </td>
                    <td className="p-6 text-right" data-label="Ações">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {campaign.status === 'draft' && (
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="h-10 w-10 text-teal-400 hover:text-white hover:bg-teal-500/10 rounded-xl"
                              onClick={() => handleSendCampaign(campaign.id)}
                            >
                               <Send className="h-4 w-4" />
                            </Button>
                         )}
                         <Button 
                            size="icon" 
                            variant="ghost"
                            className="h-10 w-10 text-brand-orange-coral hover:text-white hover:bg-brand-orange-coral/10 rounded-xl"
                            onClick={() => setCampaigns(campaigns.filter((c: any) => c.id !== campaign.id))}
                          >
                             <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Compose */}
      {activeTab === 'compose' && (
        <Card className="glass-card p-8 border-white/5 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                 <Send className="h-6 w-6 text-teal-400" />
              </div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Compor <span className="text-teal-500">Novo E-mail</span></h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Usar Template (Opcional)</Label>
                 <select
                    onChange={(e) => {
                      const template = templates.find((t: any) => t.id === e.target.value);
                      if (template) {
                        setComposeData({
                          ...composeData,
                          subject: template.subject,
                          body: template.body || ''
                        });
                      }
                    }}
                    className="w-full h-12 bg-dark-100 border border-white/5 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 px-4"
                  >
                    <option value="">Selecione para carregar...</option>
                    {templates.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Destinatários</Label>
                 <select
                    value={composeData.recipients}
                    onChange={(e) => setComposeData({ ...composeData, recipients: e.target.value })}
                    className="w-full h-12 bg-dark-100 border border-white/5 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 px-4"
                  >
                    <option value="all">Todos os inscritos</option>
                    <option value="paid">Apenas pagos</option>
                    <option value="pending">Apenas pendentes</option>
                    <option value="vip">Apenas VIP</option>
                    <option value="mentors">Mentores</option>
                    <option value="startups">Startups</option>
                    <option value="sponsors">Patrocinadores</option>
                    <option value="companies">Empresas (Equipes/B2B)</option>
                  </select>
              </div>
           </div>

           <div className="space-y-8">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Assunto do E-mail</Label>
                 <Input
                    type="text"
                    placeholder="Digite o assunto que o destinatário verá"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    className="h-14 bg-dark-100 border-white/5 rounded-2xl text-white font-bold"
                  />
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Conteúdo da Mensagem (Rich Content)</Label>
                 <Textarea
                    placeholder="Desenvolva sua mensagem aqui..."
                    value={composeData.body}
                    onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                    className="bg-dark-100 border-white/5 rounded-2xl text-white font-bold min-h-[400px] p-6"
                  />
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                 <p className="text-[10px] font-black uppercase text-gray-600 tracking-[0.2em] mb-4">Smart Variables:</p>
                 <div className="flex flex-wrap gap-2">
                    {['{{nome}}', '{{email}}', '{{ticket}}', '{{evento}}', '{{data}}', '{{empresa}}'].map((variable) => (
                      <Badge
                        key={variable}
                        className="bg-dark-100 hover:bg-teal-500/10 hover:text-teal-400 text-gray-500 font-black text-xs border border-white/5 cursor-pointer py-1.5 px-3 rounded-lg transition-all"
                        onClick={() => handleInsertVariable(variable)}
                      >
                        {variable}
                      </Badge>
                    ))}
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <Button
                    className="flex-1 h-16 bg-teal-500 hover:bg-teal-600 text-white font-black text-lg rounded-2xl shadow-glow-teal transition-all uppercase italic tracking-tight"
                    onClick={handleSend}
                    disabled={!composeData.subject || !composeData.body}
                  >
                    <Send className="h-6 w-6 mr-3" /> Enviar Disparo Agora
                 </Button>
                 <Button 
                    variant="outline" 
                    className="h-16 px-8 border-white/10 text-gray-500 hover:text-white hover:bg-white/5 font-black rounded-2xl uppercase tracking-widest text-[10px]"
                    onClick={() => toast.info('Rascunho salvo localmente')}
                  >
                    <Save className="h-5 w-5 mr-2" /> Salvar Rascunho
                 </Button>
              </div>
           </div>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          <Card className="lg:col-span-1 glass-card p-8 border-white/5 rounded-[2rem] shadow-2xl h-fit">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-brand-orange-coral" />
               </div>
               <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Nova <span className="text-brand-orange-coral">Notificação</span></h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Destinatários</Label>
                <select
                  value={notificationFormData.recipients}
                  onChange={(e) => setNotificationFormData({ ...notificationFormData, recipients: e.target.value })}
                  className="w-full h-12 bg-dark-100 border border-white/5 rounded-xl text-white font-bold outline-none focus:border-brand-orange-coral/50 px-4 appearance-none"
                >
                  <option value="all">Todos os Usuários</option>
                  <option value="participant">Participantes</option>
                  <option value="mentor">Mentores</option>
                  <option value="startup">Startups</option>
                  <option value="company">Empresas</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Tipo de Alerta</Label>
                <select
                  value={notificationFormData.type}
                  onChange={(e) => setNotificationFormData({ ...notificationFormData, type: e.target.value as any })}
                  className="w-full h-12 bg-dark-100 border border-white/5 rounded-xl text-white font-bold outline-none focus:border-brand-orange-coral/50 px-4 appearance-none"
                >
                  <option value="info">💡 Informação</option>
                  <option value="success">✅ Sucesso</option>
                  <option value="warning">⚠️ Aviso</option>
                  <option value="error">🚨 Erro / Alerta</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Título da Mensagem</Label>
                <Input
                  placeholder="Ex: Credenciamento liberado!"
                  value={notificationFormData.title}
                  onChange={(e) => setNotificationFormData({ ...notificationFormData, title: e.target.value })}
                  className="h-12 bg-dark-100 border-white/5 rounded-xl text-white font-bold placeholder:text-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Conteúdo (Push)</Label>
                <Textarea
                  placeholder="Digite o texto curto para o celular..."
                  value={notificationFormData.message}
                  onChange={(e) => setNotificationFormData({ ...notificationFormData, message: e.target.value })}
                  className="bg-dark-100 border-white/5 rounded-xl text-white font-bold min-h-[120px] p-4"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Link de Ação (Deep Link)</Label>
                <Input
                  placeholder="Ex: /certificados ou https://..."
                  value={notificationFormData.actionUrl}
                  onChange={(e) => setNotificationFormData({ ...notificationFormData, actionUrl: e.target.value })}
                  className="h-12 bg-dark-100 border-white/5 rounded-xl text-white font-bold"
                />
              </div>

              <Button 
                onClick={handleSendNotification}
                className="w-full h-14 bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black rounded-2xl shadow-glow-orange transition-all uppercase italic tracking-tighter"
              >
                <Send className="h-5 w-5 mr-2" /> Disparar Agora
              </Button>
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-3">
                 <TrendingUp className="h-6 w-6 text-teal-400" />
                 Histórico de <span className="text-teal-400">Envios</span>
               </h3>
               <Badge className="bg-white/5 text-gray-500 font-black text-[10px] border-none px-4 py-1 rounded-full uppercase tracking-widest">
                 {notificationsList?.length || 0} Enviadas
               </Badge>
            </div>

            <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
              {notificationsList && notificationsList.length > 0 ? (
                notificationsList.slice(0, 30).map((n: any) => (
                  <Card key={n.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] flex gap-5 group hover:bg-white/[0.05] transition-all">
                    <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center border border-white/5 ${
                      n.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                      n.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                      n.type === 'error' ? 'bg-red-500/10 text-red-400' :
                      'bg-teal-500/10 text-teal-400'
                    }`}>
                      {n.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : 
                       n.type === 'warning' ? <AlertTriangle className="h-6 w-6" /> :
                       n.type === 'error' ? <AlertTriangle className="h-6 w-6" /> :
                       <Info className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-white font-black text-sm uppercase italic leading-none">{n.title}</h4>
                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest whitespace-nowrap">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs font-bold leading-relaxed line-clamp-2">{n.message}</p>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-32 text-gray-800 uppercase font-black tracking-[0.3em] text-sm opacity-20">
                  Sem Atividade Recente
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="bg-dark-200 border-dark-300 text-white rounded-[2rem] max-w-2xl shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase italic">Preview: <span className="text-teal-500">{selectedTemplate?.name}</span></DialogTitle>
            <DialogDescription className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">
              Visualize como o destinatário receberá esta comunicação.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Assunto do E-mail</Label>
              <div className="p-4 bg-dark-100 border border-white/5 rounded-xl text-white font-bold italic">
                {selectedTemplate?.subject}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Visualização do Conteúdo</Label>
              <div className="p-6 bg-dark-100 border border-white/5 rounded-xl text-white font-bold min-h-[300px] whitespace-pre-wrap leading-relaxed">
                {(selectedTemplate as typeof initialEmailTemplates[0] & { body?: string })?.body || 'Conteúdo do template...'}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
            <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)} className="h-12 border-white/10 text-gray-500 hover:text-white rounded-xl uppercase font-black tracking-widest text-[9px]">
              Fechar Visualização
            </Button>
            <Button
              className="flex-1 h-12 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-xl shadow-glow-teal transition-all uppercase italic tracking-tighter"
              onClick={() => {
                setComposeData({
                  ...composeData,
                  subject: selectedTemplate?.subject || '',
                  body: (selectedTemplate as typeof initialEmailTemplates[0] & { body?: string })?.body || ''
                });
                setActiveTab('compose');
                setIsPreviewModalOpen(false);
              }}
            >
              Usar para Composição <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
