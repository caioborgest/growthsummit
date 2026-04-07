import { useState, useMemo } from 'react';
import {
  Search,
  Handshake,
  Plus,
  Pencil,
  Trash2,
  Users,
  QrCode,
  Building2,
  Phone,
  Mail,
  Zap,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePartners, useSponsors, useStands, usePartnerTeam } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { PartnerTeamModal } from './components/PartnerTeamModal';

const typeLabels: Record<string, string> = {
  sponsor: 'Patrocinador',
  exhibitor: 'Expositor',
  media: 'Mídia/Press',
  institutional: 'Institucional',
  other: 'Outro',
};

const categoryLabels: Record<string, string> = {
  barter: 'Permuta',
  investment: 'Investimento',
  mixed: 'Misto',
};

const categoryColors: Record<string, string> = {
  barter: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
  investment: 'bg-green-500/20 text-green-400 border-green-500/20',
  mixed: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
};

export default function AdminParceiros() {
  const { projectId } = useProject();
  const { data: partners, create, update, remove, isLoading, refetch } = usePartners();
  const { data: teamMembers } = usePartnerTeam();
  const { data: sponsors } = useSponsors();
  const { data: stands } = useStands();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any>(null);
  const [selectedPartnerForTeam, setSelectedPartnerForTeam] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    type: 'institutional' as any,
    category: 'barter' as any,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    accessCode: '',
    maxTeamMembers: 10,
    status: 'active' as any,
    sponsorId: '',
    standId: '',
    website: '',
    description: '',
    tier: '',
    active: true,
  });

  const filteredPartners = useMemo(() => {
    return partners.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.contactName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || p.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [partners, searchQuery, typeFilter, categoryFilter]);

  const handleOpenModal = (partner?: any) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name || '',
        cnpj: partner.cnpj || '',
        type: partner.type || 'institutional',
        category: partner.category || 'barter',
        contactName: partner.contactName || '',
        contactEmail: partner.contactEmail || '',
        contactPhone: partner.contactPhone || '',
        accessCode: partner.accessCode || '',
        maxTeamMembers: partner.maxTeamMembers || 10,
        status: partner.status || 'active',
        sponsorId: partner.sponsorId || '',
        standId: partner.standId || '',
        website: partner.website || '',
        description: partner.description || '',
        tier: partner.tier || '',
        active: partner.active !== undefined ? partner.active : true,
      });
    } else {
      setEditingPartner(null);
      setFormData({
        name: '',
        cnpj: '',
        type: 'institutional',
        category: 'barter',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        accessCode: '',
        maxTeamMembers: 10,
        status: 'active',
        sponsorId: '',
        standId: '',
        website: '',
        description: '',
        tier: '',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPartner) {
        await update(editingPartner.id, formData);
        toast.success('Parceiro atualizado com sucesso!');
      } else {
        await create({
          ...formData,
          projectId: projectId || '',
        } as any);
        toast.success('Parceiro adicionado com sucesso!');
      }
      setIsModalOpen(false);
      await refetch(true); // Force refetch from Supabase
    } catch (err) {
      logger.error('Erro ao salvar parceiro:', err);
      toast.error('Erro ao salvar parceiro');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este parceiro?')) {
      try {
        await remove(id);
        toast.success('Parceiro removido com sucesso');
        await refetch(true); // Force refetch from Supabase
      } catch (err) {
        logger.error('Erro ao remover parceiro:', err);
        toast.error('Erro ao remover parceiro');
      }
    }
  };

  const stats = useMemo(() => ({
    total: partners.length,
    barter: partners.filter(p => p.category === 'barter').length,
    investment: partners.filter(p => p.category === 'investment').length,
    mixed: partners.filter(p => p.category === 'mixed').length,
  }), [partners]);

  return (
    <div className="space-y-8 text-white">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Gestão de <span className="text-brand-orange-coral">Parceiros</span></h2>
          <p className="text-gray-500 font-medium text-xs tracking-widest uppercase">Controle de Empresas e Credenciamento</p>
        </div>
        
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: Handshake, color: 'orange' },
            { label: 'Permuta', value: stats.barter, icon: Zap, color: 'blue' },
            { label: 'Investimento', value: stats.investment, icon: Building2, color: 'green' },
            { label: 'Misto', value: stats.mixed, icon: Filter, color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4 border-white/5">
              <div className={`p-2 rounded-xl bg-brand-${stat.color}-coral/10 text-brand-${stat.color}-coral`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <p className="text-xl font-black text-white leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-4 border-white/5">
        <div className="flex flex-1 w-full md:w-auto gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar parceiro ou contato..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/5 border border-white/10 text-white rounded-xl px-4 text-sm font-bold h-10 outline-none focus:ring-2 focus:ring-brand-orange-coral/50"
          >
            <option value="all">Filtro: Tipo</option>
            {Object.entries(typeLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white/5 border border-white/10 text-white rounded-xl px-4 text-sm font-bold h-10 outline-none focus:ring-2 focus:ring-brand-orange-coral/50"
          >
            <option value="all">Filtro: Categoria</option>
            {Object.entries(categoryLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={() => handleOpenModal()}
          className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black px-6 rounded-xl shadow-lg shadow-brand-orange-coral/20"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Parceiro
        </Button>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <div key={partner.id} className="glass-card overflow-hidden group hover:border-brand-orange-coral/30 transition-all border-white/5">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-orange-coral">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg leading-tight tracking-tight">{partner.name}</h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{typeLabels[partner.type as string] || partner.type}</p>
                  </div>
                </div>
                <Badge className={categoryColors[partner.category as string] || 'bg-gray-500/10'}>
                  {categoryLabels[partner.category as string] || partner.category}
                </Badge>
              </div>

              <div className="space-y-2 py-4 border-y border-white/5">
                <div className="flex items-center gap-3 text-xs font-bold text-brand-orange-coral bg-brand-orange-coral/5 p-2 rounded-lg border border-brand-orange-coral/10">
                  <QrCode className="h-4 w-4" />
                  <span>Código: {partner.accessCode || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-300 font-medium">Equipe:</span>
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-white ml-auto">
                    {teamMembers.filter(m => m.partnerId === partner.id).length} / {partner.maxTeamMembers || 10}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-white font-bold truncate">{partner.contactEmail || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-white font-bold">{partner.contactPhone || 'N/A'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedPartnerForTeam(partner)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-xl py-5 font-black text-xs uppercase tracking-widest"
                >
                  <Users className="h-3 w-3 mr-2 text-brand-orange-coral" />
                  Gerenciar Equipe
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenModal(partner)}
                    className="w-10 h-10 border border-white/10 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(partner.id)}
                    className="w-10 h-10 border border-white/10 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="admin-modal-content p-0 border-none max-w-2xl">
          <div className="admin-modal-header">
            <div>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
                {editingPartner ? 'Editar' : 'Novo'} <span className="text-brand-orange-coral">Parceiro</span>
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Configure os detalhes da empresa parceira para gestão de acesso.
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col min-h-0 overflow-hidden">
            <div className="admin-modal-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-gray-500">Nome da Empresa *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/10"
                    placeholder="Ex: ABC Tecnologia"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-gray-500">CNPJ (Opcional)</Label>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="bg-white/5 border-white/10"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-gray-500">Tipo de Parceiro</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold h-10 outline-none"
                  >
                    {Object.entries(typeLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-gray-500">Categoria de Parceria</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold h-10 outline-none"
                  >
                    {Object.entries(categoryLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-brand-orange-coral">Código de Auto-Inscrição</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.accessCode}
                      onChange={(e) => setFormData({ ...formData, accessCode: e.target.value.toUpperCase() })}
                      className="bg-white/5 border-brand-orange-coral/20 text-brand-orange-coral font-bold"
                      placeholder="EX: BMW-2026"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                        setFormData({ ...formData, accessCode: code });
                      }}
                      className="flex-shrink-0"
                    >
                      Gerar
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-gray-500">Limite de Membros</Label>
                  <Input
                    type="number"
                    value={formData.maxTeamMembers}
                    onChange={(e) => setFormData({ ...formData, maxTeamMembers: parseInt(e.target.value) })}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <Label className="text-xs font-black uppercase text-brand-orange-coral tracking-widest block">Informações de Contato</Label>
                <div className="space-y-2">
                  <Input
                    required
                    placeholder="Nome do Responsável"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="email"
                    placeholder="E-mail"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="bg-white/5 border-white/10"
                  />
                  <Input
                    placeholder="WhatsApp/Telefone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <Label className="text-xs font-black uppercase text-gray-400 tracking-widest block">Informações Adicionais</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-600">Website</Label>
                    <Input
                      placeholder="https://..."
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-600">Tier / Nível</Label>
                    <Input
                      placeholder="Ex: Platinum, Gold..."
                      value={formData.tier}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-600">Descrição / Bio</Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm min-h-[80px]"
                    placeholder="Breve descrição da empresa..."
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 rounded border-white/10 bg-white/5"
                  />
                  <Label htmlFor="active" className="text-xs font-bold text-gray-400 cursor-pointer">Parceiro Ativo</Label>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <Label className="text-xs font-black uppercase text-gray-500 tracking-widest block">Vínculos (Opcional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-600">Patrocinador Vinculado</Label>
                    <select
                      value={formData.sponsorId}
                      onChange={(e) => setFormData({ ...formData, sponsorId: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold h-10 outline-none"
                    >
                      <option value="">Nenhum</option>
                      {sponsors.map(s => (
                        <option key={s.id} value={s.id}>{s.companyName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-600">Stand/Expositor Vinculado</Label>
                    <select
                      value={formData.standId}
                      onChange={(e) => setFormData({ ...formData, standId: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold h-10 outline-none"
                    >
                      <option value="">Nenhum</option>
                      {stands.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-500">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black px-10 rounded-xl">
                {isLoading ? 'Salvando...' : editingPartner ? 'Salvar Alterações' : 'Cadastrar Parceiro'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Team Management Modal */}
      {selectedPartnerForTeam && (
        <PartnerTeamModal
          partner={selectedPartnerForTeam}
          onClose={() => setSelectedPartnerForTeam(null)}
        />
      )}
    </div>
  );
}
