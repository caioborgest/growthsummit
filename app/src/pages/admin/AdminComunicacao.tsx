import { useState } from 'react';
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
  Copy
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
  DialogTrigger
} from '@/components/ui/dialog';
import { useRegistrations } from '@/hooks/useData';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const initialEmailTemplates = [
  {
    id: '1',
    name: 'Confirmação de Inscrição',
    subject: 'Sua inscrição no Growth Summit 2026 foi confirmada!',
    category: 'Inscrições',
    lastUsed: '2024-01-15',
  },
  {
    id: '2',
    name: 'Lembrete de Evento',
    subject: 'Faltam 7 dias para o Growth Summit 2026',
    category: 'Lembretes',
    lastUsed: '2024-01-10',
  },
  {
    id: '3',
    name: 'Confirmação de Mentoria',
    subject: 'Sua mentoria foi agendada',
    category: 'Mentorias',
    lastUsed: '2024-01-12',
  },
  {
    id: '4',
    name: 'QR Code de Acesso',
    subject: 'Seu QR Code para o Growth Summit 2026',
    category: 'Acesso',
    lastUsed: '2024-01-14',
  },
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

export function AdminComunicacao() {
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns' | 'compose'>('templates');
  const [templates, setTemplates] = useState(initialEmailTemplates);
  const [campaigns, setCampaigns] = useState(initialEmailCampaigns);

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
    recipients: 'all' as any
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedTemplate, _setSelectedTemplate] = useState<string | null>(null);
  const [composeData, setComposeData] = useState({
    subject: '',
    body: '',
    recipients: 'all',
  });

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

    const newCampaign = {
      id: Math.random().toString(36).substr(2, 9),
      name: campaignFormData.name,
      recipients: registrations.length, // Real number
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
      const loadingToast = toast.loading('Preparando envio...');

      let emails: string[] = [];

      // 1. Buscar destinatários baseados no filtro
      if (composeData.recipients === 'all') {
        const { data } = await supabase.from('inscricoes_growth_experience').select('email');
        emails = [...new Set(data?.map(i => i.email) || [])];
      } else if (composeData.recipients === 'paid') {
        const { data } = await supabase.from('inscricoes_growth_experience').select('email').eq('status_pagamento', 'pago');
        emails = [...new Set(data?.map(i => i.email) || [])];
      } else if (composeData.recipients === 'pending') {
        const { data } = await supabase.from('inscricoes_growth_experience').select('email').eq('status_pagamento', 'pendente');
        emails = [...new Set(data?.map(i => i.email) || [])];
      } else if (composeData.recipients === 'vip') {
        const { data } = await supabase.from('inscricoes_growth_experience').select('email').eq('tipo_inscricao', 'vip');
        emails = [...new Set(data?.map(i => i.email) || [])];
      } else if (composeData.recipients === 'mentors') {
        const { data } = await supabase.from('mentores_growth_experience').select('email');
        emails = [...new Set(data?.map(i => i.email) || [])];
      } else if (composeData.recipients === 'startups') {
        const { data } = await supabase.from('startups_arena_pitch').select('email');
        emails = [...new Set(data?.map(i => i.email) || [])];
      }

      if (emails.length === 0) {
        toast.dismiss(loadingToast);
        toast.error('Nenhum destinatário encontrado para este filtro');
        return;
      }

      // 2. Chamar a Edge Function para enviar
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: emails,
          subject: composeData.subject,
          html: composeData.body.replace(/\n/g, '<br/>')
        }
      });

      if (error) throw error;

      toast.dismiss(loadingToast);
      toast.success(`Emails enviados com sucesso para ${emails.length} destinatários!`);

      // Limpar formulário
      setComposeData({
        recipients: 'all',
        subject: '',
        body: ''
      });

    } catch (err: any) {
      console.error('Send error:', err);
      toast.dismiss();
      toast.error('Erro ao enviar emails: ' + (err.message || 'Erro desconhecido'));
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
      </div>

      {/* Templates */}
      {activeTab === 'templates' && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Templates de Email</h2>
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
                  <Button size="sm" variant="outline" className="flex-1 border-dark-300 text-gray-300">
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
                            <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white">
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
                {['{{nome}}', '{{email}}', '{{ticket}}', '{{evento}}', '{{data}}'].map((variable) => (
                  <Badge key={variable} className="bg-dark-300 text-gray-300 cursor-pointer hover:bg-teal-500/20 hover:text-teal-400">
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
              <Button variant="outline" className="border-dark-300 text-gray-300">
                <Save className="h-4 w-4 mr-2" />
                Salvar Rascunho
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
