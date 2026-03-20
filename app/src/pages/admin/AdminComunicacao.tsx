import { useState, useEffect } from 'react';
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
  Headset,
  CheckCircle,
  Clock,
  Smartphone,
  Info,
  AlertTriangle,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { useRegistrations, useNotifications, useSupportTickets, useUsers } from '@/hooks/useData';
import { notificationService } from '@/services/notificationService';
import { supportService } from '@/services/supportService';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

const initialEmailTemplates = [
  {
    id: '1',
    name: 'Confirmação de Inscrição',
    subject: 'Sua inscrição no Growth Experience 2026 foi confirmada! 🚀',
    category: 'Inscrições',
    lastUsed: '2024-03-02',
    body: `<h1>Olá {{nome}}!</h1>
<p>É uma alegria confirmar sua presença no <strong>Growth Experience 2026</strong>.</p>
<p>Seu ingresso está garantido. Prepare-se para uma experiência transformadora de gestão e networking.</p>
<p><strong>Detalhes do Acesso:</strong><br/>
Tipo: {{ticket}}<br/>
Data: {{data}}</p>
<p>Nos vemos em breve!</p>`
  },
  {
    id: '2',
    name: 'Convite para Mentor',
    subject: 'Convite Especial: Mentoria no Growth Experience',
    category: 'Mentorias',
    lastUsed: '2024-03-02',
    body: `<h1>Olá {{nome}},</h1>
<p>Temos o prazer de convidá-lo para atuar como mentor no <strong>Growth Experience</strong>.</p>
<p>Sua expertise será fundamental para impulsionar os negócios da nossa região.</p>
<p>Por favor, confirme sua disponibilidade e complete seu perfil no nosso painel.</p>`
  },
  {
    id: '3',
    name: 'Boas-vindas Patrocinador',
    subject: 'Bem-vindo ao Growth Experience: Guia do Patrocinador',
    category: 'Patrocinadores',
    lastUsed: '2024-03-02',
    body: `<h1>Parceiro Growth Experience,</h1>
<p>Estamos entusiasmados em ter sua marca conosco nesta edição.</p>
<p>Anexamos o manual da marca e o cronograma de montagem dos stands.</p>
<p>Qualquer dúvida, nossa equipe de sucesso do parceiro está à disposição.</p>`
  },
  {
    id: '4',
    name: 'Inscrição de Equipe - Empresa',
    subject: 'Confirmação de Inscrição em Grupo: Equipe {{empresa}}',
    category: 'Empresas',
    lastUsed: '2024-03-02',
    body: `<h1>Olá {{nome}},</h1>
<p>A inscrição da sua equipe da <strong>{{empresa}}</strong> no Growth Experience foi recebida.</p>
<p><strong>🚨 Informação Importante:</strong> A empresa que apresentar a maior quantidade de colaboradores participando das programações diurna e noturna (paga) receberá o prêmio <strong>"Empresa incentivadora na educação empreendedora"</strong> durante o evento.</p>
<p>Em breve enviaremos os códigos de acesso individual para cada colaborador.</p>`
  },
  {
    id: '5',
    name: 'Feedback Arena Pitch',
    subject: 'Feedback e Notas: Sua participação na Arena Pitch 🚀',
    category: 'Startups',
    lastUsed: '2024-03-09',
    body: `<h1>Olá {{fundador}}!</h1>
<p>Parabéns pela apresentação na <strong>Arena Pitch</strong> do Growth Experience.</p>
<p>Sua dedicação e visão foram notáveis. Segue o resumo da sua avaliação pelos jurados:</p>
<p><strong>Média Geral:</strong> {{media}}<br/>
<strong>Pontos Fortes:</strong> {{pontos_fortes}}</p>
<p>Desejamos muito sucesso na jornada de crescimento da {{startup}}!</p>`
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
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns' | 'compose' | 'notifications' | 'support'>('templates');
  
  const { data: users } = useUsers();
  const { data: notificationsList, refetch: refetchNotifications } = useNotifications();
  const { data: tickets, refetch: refetchTickets } = useSupportTickets();
  
  // Persistence with localStorage
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('gs_email_templates');
    return saved ? JSON.parse(saved) : initialEmailTemplates;
  });

  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem('gs_email_campaigns');
    return saved ? JSON.parse(saved) : initialEmailCampaigns;
  });

  useEffect(() => {
    localStorage.setItem('gs_email_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('gs_email_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const { data: registrations } = useRegistrations();

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
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    recipients: 'all'
  });

  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');


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

      // 1. Buscar destinatários baseados no filtro
      if (composeData.recipients === 'all') {
        const { data } = await (supabase.from('inscricoes_growth_experience').select('email, nome, tipo_inscricao') as any);
        recipientsData = (data || []).map((item: any) => ({ email: item.email, name: item.nome || item.name }));
      } else if (composeData.recipients === 'paid') {
        const { data } = await (supabase.from('inscricoes_growth_experience').select('email, nome, tipo_inscricao').eq('status_pagamento', 'pago') as any);
        recipientsData = (data || []).map((item: any) => ({ email: item.email, name: item.nome || item.name }));
      } else if (composeData.recipients === 'pending') {
        const { data } = await (supabase.from('inscricoes_growth_experience').select('email, nome, tipo_inscricao').eq('status_pagamento', 'pendente') as any);
        recipientsData = (data || []).map((item: any) => ({ email: item.email, name: item.nome || item.name }));
      } else if (composeData.recipients === 'vip') {
        const { data } = await (supabase.from('inscricoes_growth_experience').select('email, nome, tipo_inscricao').eq('tipo_inscricao', 'vip') as any);
        recipientsData = (data || []).map((item: any) => ({ email: item.email, name: item.nome || item.name }));
      } else if (composeData.recipients === 'mentors') {
        const { data } = await (supabase.from('mentores_growth_experience').select('email, nome') as any);
        recipientsData = (data || []).map((item: any) => ({ email: item.email, name: item.nome || item.name }));
      } else if (composeData.recipients === 'startups') {
        const { data } = await (supabase.from('startups_arena_pitch').select('email, nome_startup, nome_fundador') as any);
        recipientsData = (data || []).map((item: any) => ({ email: item.email, name: item.nome_startup || item.nome_fundador }));
      } else if (composeData.recipients === 'sponsors') {
        const { data } = await (supabase.from('sponsors').select('contact_email, company_name, contact_name') as any);
        recipientsData = (data || []).map((item: any) => ({ email: item.contact_email, name: item.company_name || item.contact_name }));
      } else if (composeData.recipients === 'companies') {
        const [b2bRes, incentiveRes] = await Promise.all([
          (supabase.from('rodada_negocios_b2b').select('email, nome_empresa, nome_representante') as any),
          (supabase.from('inscricoes_empresas_incentivadoras').select('email, nome_empresa, nome_responsavel') as any)
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

        return supabase.functions.invoke('send-email', {
          body: {
            to: [recipient.email],
            subject: composeData.subject,
            html: personalizedBody.replace(/\n/g, '<br/>')
          }
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
      setCampaigns(prev => prev.map(c => 
        c.id === campaignId ? { ...c, status: 'sent', sentAt: new Date().toISOString(), sent: campaign.recipients } : c
      ));
    }, 100);
  };

  const handleInsertVariable = (variable: string) => {
    setComposeData(prev => ({
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
      if (notificationFormData.recipients === 'all') {
        targetUserIds = users?.map(u => u.id) || [];
      } else {
        targetUserIds = users?.filter(u => u.role === notificationFormData.recipients).map(u => u.id) || [];
      }

      if (targetUserIds.length === 0) {
        toast.error('Nenhum destinatário encontrado');
        return;
      }

      await notificationService.sendBulk(targetUserIds, {
        title: notificationFormData.title,
        message: notificationFormData.message,
        type: notificationFormData.type
      }, selectedProject?.id || '');

      toast.success(`${targetUserIds.length} notificações enviadas com sucesso!`);
      setNotificationFormData({ ...notificationFormData, title: '', message: '' });
      refetchNotifications();
    } catch (error) {
      toast.error('Erro ao enviar notificações');
    }
  };

  const handleReplyTicket = async () => {
    if (!selectedTicket || !replyMessage) return;

    try {
      await supportService.addMessage({
        ticket_id: selectedTicket.id,
        message: replyMessage,
        is_admin: true
      });

      toast.success('Resposta enviada!');
      setReplyMessage('');
      // Refetch logic would be handled by real-time soon or manual refetch
      refetchTickets();
    } catch (error) {
      toast.error('Erro ao enviar resposta');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-dark-300">
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-4 text-sm font-medium transition-colors ${activeTab === 'templates'
            ? 'text-teal-400 border-b-2 border-teal-400'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-4 text-sm font-medium transition-colors ${activeTab === 'campaigns'
            ? 'text-teal-400 border-b-2 border-teal-400'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Campanhas
        </button>
        <button
          onClick={() => setActiveTab('compose')}
          className={`pb-4 text-sm font-medium transition-colors ${activeTab === 'compose'
            ? 'text-teal-400 border-b-2 border-teal-400'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Compor Email
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-4 text-sm font-medium transition-colors ${activeTab === 'notifications'
            ? 'text-teal-400 border-b-2 border-teal-400'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Notificações In-App
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`pb-4 text-sm font-medium transition-colors ${activeTab === 'support'
            ? 'text-teal-400 border-b-2 border-teal-400'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Central de Suporte
        </button>
      </div>

      {/* Templates */}
      {activeTab === 'templates' && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <Mail className="h-6 w-6 text-teal-400" />
              Gestão de E-mail & Push
            </h2>
            <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-dark-200 border-dark-300 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Template</DialogTitle>
                  <DialogDescription className="sr-only">
                    Formulário para definir um novo modelo de email ou push.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTemplate} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Template *</Label>
                      <Input
                        required
                        value={templateFormData.name}
                        onChange={e => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                        className="bg-dark-100 border-dark-300"
                        placeholder="Ex: Boas-vindas Mentores"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <select
                        value={templateFormData.category}
                        onChange={e => setTemplateFormData({ ...templateFormData, category: e.target.value })}
                        className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
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
                    <Label>Assunto do Email *</Label>
                    <Input
                      required
                      value={templateFormData.subject}
                      onChange={e => setTemplateFormData({ ...templateFormData, subject: e.target.value })}
                      className="bg-dark-100 border-dark-300"
                      placeholder="Assunto que o usuário verá na caixa de entrada"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Corpo do Email (HTML/Texto)</Label>
                    <p className="text-[10px] text-gray-500">
                      Variáveis: {"{{nome}}"}, {"{{email}}"}, {"{{empresa}}"}.
                    </p>
                    <Textarea
                      value={templateFormData.body}
                      onChange={e => setTemplateFormData({ ...templateFormData, body: e.target.value })}
                      className="bg-dark-100 border-dark-300 min-h-[200px]"
                      placeholder="Olá {{nome}}, seja bem-vindo ao evento..."
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-dark-300">
                    <Button type="button" variant="outline" onClick={() => setIsTemplateModalOpen(false)} className="border-dark-300 text-gray-400">
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8">
                      Criar Template
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-teal-400" />
                  </div>
                  <Badge className="bg-dark-300 text-gray-300">
                    {template.category}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{template.subject}</p>

                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <Mail className="h-4 w-4 mr-2" />
                  Último uso: {new Date(template.lastUsed).toLocaleDateString('pt-BR')}
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-dark-300 text-gray-300"
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button size="sm" variant="outline" className="border-teal-500 text-teal-400">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Campaigns */}
      {activeTab === 'campaigns' && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Campanhas</h2>
            <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-dark-200 border-dark-300 text-white">
                <DialogHeader>
                  <DialogTitle>Criar Nova Campanha</DialogTitle>
                  <DialogDescription className="sr-only">
                    Configure os detalhes da nova campanha de comunicação.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCampaign} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome da Campanha *</Label>
                    <Input
                      required
                      value={campaignFormData.name}
                      onChange={e => setCampaignFormData({ ...campaignFormData, name: e.target.value })}
                      className="bg-dark-100 border-dark-300"
                      placeholder="Ex: Campanha de Lançamento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Template base *</Label>
                    <select
                      required
                      value={campaignFormData.templateId}
                      onChange={e => setCampaignFormData({ ...campaignFormData, templateId: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                    >
                      <option value="">Selecione um template</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Público Alvo</Label>
                    <select
                      value={campaignFormData.recipients}
                      onChange={e => setCampaignFormData({ ...campaignFormData, recipients: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
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
                  <div className="flex justify-end gap-3 pt-4 border-t border-dark-300">
                    <Button type="button" variant="outline" onClick={() => setIsCampaignModalOpen(false)} className="border-dark-300 text-gray-400">
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8">
                      Criar Campanha
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-300">
                    <th className="p-4 text-left text-gray-400 font-medium">Nome</th>
                    <th className="p-4 text-left text-gray-400 font-medium">Destinatários</th>
                    <th className="p-4 text-left text-gray-400 font-medium">Aberturas</th>
                    <th className="p-4 text-left text-gray-400 font-medium">Cliques</th>
                    <th className="p-4 text-left text-gray-400 font-medium">Status</th>
                    <th className="p-4 text-left text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-dark-300 hover:bg-dark-100/50">
                      <td className="p-4">
                        <p className="text-white font-medium">{campaign.name}</p>
                        {campaign.sentAt && (
                          <p className="text-gray-500 text-sm">Enviado em {new Date(campaign.sentAt).toLocaleDateString('pt-BR')}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-white">{campaign.recipients.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {campaign.sent > 0 ? (
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-2 text-blue-400" />
                            <span className="text-white">{campaign.opened.toLocaleString()}</span>
                            <span className="text-gray-400 text-sm ml-2">
                              ({((campaign.opened / campaign.sent) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {campaign.sent > 0 ? (
                          <div className="flex items-center">
                            <MousePointer className="h-4 w-4 mr-2 text-teal-400" />
                            <span className="text-white">{campaign.clicked.toLocaleString()}</span>
                            <span className="text-gray-400 text-sm ml-2">
                              ({((campaign.clicked / campaign.sent) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className={
                          campaign.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                            campaign.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                              'bg-yellow-500/20 text-yellow-400'
                        }>
                          {campaign.status === 'sent' ? 'Enviado' : 'Rascunho'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          {campaign.status === 'draft' && (
                            <Button 
                              size="sm" 
                              className="bg-teal-500 hover:bg-teal-600 text-white"
                              onClick={() => handleSendCampaign(campaign.id)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Enviar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400"
                            onClick={() => setCampaigns(campaigns.filter(c => c.id !== campaign.id))}
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
          </div>
        </>
      )}

      {/* Compose */}
      {activeTab === 'compose' && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Compor Email</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Usar Template (Opcional)</label>
              <select
                onChange={(e) => {
                  const template = templates.find(t => t.id === e.target.value);
                  if (template) {
                    setComposeData({
                      ...composeData,
                      subject: template.subject,
                      body: template.body || ''
                    });
                  }
                }}
                className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
              >
                <option value="">Selecione um template para carregar...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Destinatários</label>
              <select
                value={composeData.recipients}
                onChange={(e) => setComposeData({ ...composeData, recipients: e.target.value })}
                className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
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

            <div>
              <label className="block text-sm text-gray-400 mb-2">Assunto</label>
              <Input
                type="text"
                placeholder="Digite o assunto do email"
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                className="bg-dark-100 border-dark-300 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Conteúdo</label>
              <Textarea
                placeholder="Digite o conteúdo do email..."
                value={composeData.body}
                onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                className="bg-dark-100 border-dark-300 text-white min-h-[300px]"
              />
            </div>

            <div className="bg-dark-100 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Variáveis disponíveis:</p>
              <div className="flex flex-wrap gap-2">
                {['{{nome}}', '{{email}}', '{{ticket}}', '{{evento}}', '{{data}}', '{{empresa}}'].map((variable) => (
                  <Badge
                    key={variable}
                    className="bg-dark-300 text-gray-300 cursor-pointer hover:bg-teal-500/20 hover:text-teal-400"
                    onClick={() => handleInsertVariable(variable)}
                  >
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                className="bg-teal-500 hover:bg-teal-600 text-white"
                onClick={handleSend}
                disabled={!composeData.subject || !composeData.body}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Agora
              </Button>
              <Button variant="outline" className="border-dark-300 text-gray-300" onClick={() => toast.info('Filtros em desenvolvimento')}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Rascunho
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-dark-200 border border-dark-300 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-400" />
                Nova Notificação
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-400 uppercase tracking-wider font-bold">Destinatários</Label>
                  <select
                    value={notificationFormData.recipients}
                    onChange={(e) => setNotificationFormData({ ...notificationFormData, recipients: e.target.value })}
                    className="w-full mt-1.5 px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                  >
                    <option value="all">Todos os Usuários</option>
                    <option value="participant">Participantes</option>
                    <option value="mentor">Mentores</option>
                    <option value="startup">Startups</option>
                    <option value="company">Empresas</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-gray-400 uppercase tracking-wider font-bold">Tipo</Label>
                  <select
                    value={notificationFormData.type}
                    onChange={(e) => setNotificationFormData({ ...notificationFormData, type: e.target.value as any })}
                    className="w-full mt-1.5 px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                  >
                    <option value="info">💡 Informação</option>
                    <option value="success">✅ Sucesso</option>
                    <option value="warning">⚠️ Aviso</option>
                    <option value="error">🚨 Erro / Alerta</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-gray-400 uppercase tracking-wider font-bold">Título</Label>
                  <Input
                    placeholder="Ex: Nova mentoria disponível"
                    value={notificationFormData.title}
                    onChange={(e) => setNotificationFormData({ ...notificationFormData, title: e.target.value })}
                    className="bg-dark-100 border-dark-300 text-white mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-400 uppercase tracking-wider font-bold">Mensagem</Label>
                  <Textarea
                    placeholder="Digite a mensagem curta..."
                    value={notificationFormData.message}
                    onChange={(e) => setNotificationFormData({ ...notificationFormData, message: e.target.value })}
                    className="bg-dark-100 border-dark-300 text-white mt-1.5 h-32"
                  />
                </div>
                <Button 
                  onClick={handleSendNotification}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-orange-500/20"
                >
                  <Send className="h-4 w-4 mr-2" /> Disparar Notificação
                </Button>
              </div>
            </div>

            <div className="md:col-span-2 bg-dark-200 border border-dark-300 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex justify-between items-center">
                Histórico Recente
                <Badge className="bg-white/5 text-gray-400 border-none px-3">{notificationsList?.length || 0} enviadas</Badge>
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {notificationsList && notificationsList.length > 0 ? (
                  notificationsList.slice(0, 20).map((n: any) => (
                    <div key={n.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex gap-4">
                      <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
                        n.type === 'success' ? 'bg-green-500/10 text-green-400' :
                        n.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                        n.type === 'error' ? 'bg-red-500/10 text-red-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {n.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : 
                         n.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> :
                         n.type === 'error' ? <AlertTriangle className="h-5 w-5" /> :
                         <Info className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-white font-bold text-sm truncate">{n.title}</h4>
                          <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-400 text-xs line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-gray-600 uppercase font-black tracking-widest text-xs opacity-50">
                    Nenhuma notificação enviada
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Tab */}
      {activeTab === 'support' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-white italic">
              Central de <span className="text-teal-400">Atendimento</span>
              <span className="text-teal-400 not-italic ml-1">.</span>
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" className="border-white/5 text-gray-400 hover:bg-white/5" onClick={() => refetchTickets()}>
                <Clock className="h-4 w-4 mr-2" /> Atualizar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-dark-200 border border-white/10 rounded-2xl p-4 overflow-hidden relative group">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Abertos</p>
                    <p className="text-3xl font-black text-white">{tickets?.filter(t => t.status === 'open').length || 0}</p>
                  </div>
                  <div className="h-12 w-12 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all"></div>
              </div>

              <div className="bg-dark-200 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tickets Recentes</span>
                  <Filter className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {tickets && tickets.length > 0 ? (
                    tickets.map((t: any) => (
                      <div 
                        key={t.id} 
                        onClick={() => setSelectedTicket(t)}
                        className={`p-4 cursor-pointer transition-all hover:bg-white/5 ${selectedTicket?.id === t.id ? 'bg-teal-500/10 border-l-2 border-teal-500' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            t.status === 'open' ? 'bg-teal-500 text-white' :
                            t.status === 'in_progress' ? 'bg-orange-500 text-white' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {t.status.toUpperCase()}
                          </span>
                          <span className="text-[9px] text-gray-500 font-bold">{new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-white text-sm font-bold truncate mb-0.5">{t.subject}</h4>
                        <p className="text-gray-500 text-[10px] font-medium truncate">{t.name} • {t.email}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-700 font-black text-xs uppercase tracking-widest">
                      Nenhum ticket
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {selectedTicket ? (
                <div className="bg-dark-200 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[700px] shadow-2xl">
                  {/* Header do Chat */}
                  <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-teal-500/10 rounded-full flex items-center justify-center text-teal-400 font-black text-lg">
                        {selectedTicket.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-white font-black text-lg leading-tight uppercase tracking-tight">{selectedTicket.subject}</h3>
                        <p className="text-teal-400 text-xs font-bold">{selectedTicket.name} • {selectedTicket.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <Button 
                         onClick={() => {
                           if (window.confirm('Marcar como resolvido?')) {
                             supportService.updateTicket(selectedTicket.id, { status: 'resolved' }).then(() => {
                               refetchTickets();
                               setSelectedTicket(null);
                               toast.success('Ticket resolvido');
                             });
                           }
                         }}
                         className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 text-xs font-black uppercase h-9"
                       >
                         Resolvido
                       </Button>
                    </div>
                  </div>

                  {/* Mensagens */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                    {/* Mensagem Original */}
                    <div className="flex flex-col items-start max-w-[85%]">
                      <div className="bg-dark-300 border border-white/5 p-4 rounded-2xl rounded-tl-none text-gray-200 text-sm shadow-xl">
                        <p className="font-black text-teal-400 text-[10px] uppercase mb-2 tracking-widest">Solicitação Inicial</p>
                        {selectedTicket.message}
                      </div>
                      <span className="text-[9px] text-gray-600 mt-2 font-bold ml-2 uppercase tracking-tighter">
                        {new Date(selectedTicket.created_at).toLocaleString()}
                      </span>
                    </div>

                    {/* Aqui entrariam as mensagens da tabela support_ticket_messages se tivéssemos um hook pra elas */}
                    <div className="text-center">
                       <span className="px-4 py-1 bg-white/5 rounded-full text-[10px] text-gray-500 font-bold uppercase tracking-widest">Fim do Histórico</span>
                    </div>
                  </div>

                  {/* Input de Resposta */}
                  <div className="p-6 bg-dark-300 border-t border-white/5">
                    <div className="relative group">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Escreva sua resposta para o participante..."
                        className="w-full bg-dark-100 border border-white/10 rounded-2xl p-4 pr-16 text-white text-sm focus:border-teal-400 transition-all outline-none min-h-[100px] resize-none"
                      ></textarea>
                      <button 
                        onClick={handleReplyTicket}
                        disabled={!replyMessage}
                        className="absolute right-3 bottom-3 h-10 w-10 bg-teal-500 hover:bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:bg-gray-700 transition-all group-hover:scale-105 active:scale-95"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter italic">O status será atualizado automaticamente para Em Progresso</p>
                      <div className="flex gap-4">
                         <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-black uppercase tracking-widest"><Users className="h-3 w-3" /> Time Growth</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full bg-dark-200 border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center p-12 text-center">
                  <div className="h-20 w-20 bg-teal-500/5 rounded-full flex items-center justify-center text-teal-500/20 mb-6 border border-teal-500/10">
                    <Headset className="h-10 w-10" />
                  </div>
                  <h3 className="text-white font-black text-xl mb-2 italic">Selecione um Ticket</h3>
                  <p className="text-gray-500 text-xs max-w-xs font-bold leading-relaxed uppercase tracking-tighter">Escolha um chamado na lista ao lado para ver os detalhes e responder ao participante.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="bg-dark-200 border-dark-300 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Visualizar Template: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Pré-visualização do conteúdo do template selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-400">Assunto</Label>
              <div className="p-3 bg-dark-100 border border-dark-300 rounded-lg text-white mt-1">
                {selectedTemplate?.subject}
              </div>
            </div>
            <div>
              <Label className="text-gray-400">Conteúdo</Label>
              <div className="p-4 bg-dark-100 border border-dark-300 rounded-lg text-white mt-1 min-h-[200px] whitespace-pre-wrap">
                {(selectedTemplate as typeof initialEmailTemplates[0] & { body?: string })?.body || 'Conteúdo do template...'}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-300">
            <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)} className="border-dark-300 text-white">
              Fechar
            </Button>
            <Button
              className="bg-teal-500 hover:bg-teal-600 text-white"
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
              Usar para Compor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
