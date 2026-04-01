import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, 
  Mail, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  TrendingUp, 
  Trash2, 
  Zap, 
  Tag, 
  MailWarning
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { newsletterService } from '@/lib/newsletterService';
import type { NewsletterLead } from '@/lib/newsletterService';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';

export default function AdminNewsletter() {
  const { selectedProject } = useProject();
  const [leads, setLeads] = useState<NewsletterLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const fetchLeads = useCallback(async () => {
    if (!selectedProject?.id) return;
    setLoading(true);
    try {
      const data = await newsletterService.getLeads({ project_id: selectedProject?.id });
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  }, [selectedProject?.id]);

  useEffect(() => {
    fetchLeads();
  }, [selectedProject, fetchLeads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = l.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag === 'all' || l.interesses?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [leads, searchTerm, selectedTag]);

  const stats = useMemo(() => {
    const active = leads.filter(l => !l.unsubscribed_at).length;
    const unsubscribed = leads.length - active;
    const hotLeads = leads.filter(l => (l.engagement_score || 0) > 10).length;
    
    return {
      total: leads.length,
      active,
      unsubscribed,
      hotLeads,
      conversionRate: leads.length > 0 ? (hotLeads / leads.length * 100).toFixed(1) : '0'
    };
  }, [leads]);

  const handleExport = async () => {
    try {
      const csv = await newsletterService.exportToCSV(selectedProject?.id);
      if (!csv) {
        toast.error('Nenhum dado para exportar');
        return;
      }
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `newsletter_leads_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Exportação concluída!');
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('Erro ao exportar CSV');
    }
  };

  const handleDelete = async (email: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este lead?')) return;
    try {
       await newsletterService.unsubscribe(email);
       toast.success('Lead removido da lista ativa');
       fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Erro ao remover lead');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').filter(row => row.trim() !== '');
      
      toast.loading(`Importando ${rows.length - 1} leads...`);
      
      let successCount = 0;
      let errorCount = 0;

      // Skip header
      for (let i = 1; i < rows.length; i++) {
        const [name, email] = rows[i].split(';').map(s => s.trim());
        if (email && email.includes('@')) {
          try {
            await newsletterService.subscribe({
              nome: name || 'Lead Importado',
              email,
              interesses: [],
              source: 'CSV Import',
              project_id: selectedProject?.id
            });
            successCount++;
          } catch (importError) {
            console.error('Error importing row:', importError);
            errorCount++;
          }
        }
      }

      toast.dismiss();
      toast.success(`Importação concluída: ${successCount} sucessos, ${errorCount} erros.`);
      fetchLeads();
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 italic uppercase">
            <Mail className="h-8 w-8 text-brand-orange-coral fill-brand-orange-coral" />
            GESTOR DE <span className="text-brand-orange-coral">NEWSLETTER</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Lead Capture, Engagement Scoring & Trilha de Conversão</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExport}
            className="h-12 px-6 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/5 transition-all"
          >
            <Download className="h-4 w-4 mr-2" /> EXPORTAR CSV
          </Button>
          
          <div className="relative">
             <input 
               type="file" 
               accept=".csv" 
               onChange={handleImport}
               className="absolute inset-0 opacity-0 cursor-pointer z-10"
               title="Importar Leads via CSV (Nome;Email)"
             />
             <Button className="h-12 px-8 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-2xl shadow-glow-teal transition-all pointer-events-none">
               <Upload className="h-4 w-4 mr-2" /> IMPORTAR LEADS
             </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Leads', val: stats.total, color: 'text-white', icon: Users },
          { label: 'Leads Ativos', val: stats.active, color: 'text-teal-400', icon: Mail },
          { label: 'Hot Leads (🔥)', val: stats.hotLeads, color: 'text-brand-orange-coral', icon: Zap },
          { label: 'Taxa de Engajamento', val: `${stats.conversionRate}%`, color: 'text-blue-400', icon: TrendingUp },
        ].map((item, i) => (
          <Card key={i} className="glass-card p-6 rounded-[2rem] relative overflow-hidden border-white/5">
            <div className="absolute -right-2 -top-2 p-6 opacity-5">
               <item.icon className="h-12 w-12 text-white" />
            </div>
            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">{item.label}</p>
            <h3 className={`text-3xl font-black ${item.color} tracking-tighter`}>{item.val.toLocaleString()}</h3>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
         {/* Filters Bar */}
         <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.01]">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
               <Input 
                 placeholder="Buscar por nome ou e-mail..."
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="h-12 pl-12 bg-dark-100 border-white/5 focus:border-brand-orange-coral/50 rounded-xl"
               />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="flex items-center gap-2 px-4 py-2 bg-dark-100 border border-white/5 rounded-xl">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <select 
                    value={selectedTag}
                    onChange={e => setSelectedTag(e.target.value)}
                    className="bg-transparent text-xs font-black text-white uppercase outline-none"
                  >
                    <option value="all">Todas as Tags</option>
                    <option value="ia">IA & Inovação</option>
                    <option value="growth">Growth</option>
                    <option value="gestao">Gestão</option>
                    <option value="vendas">Vendas</option>
                  </select>
               </div>
               
               <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-dark-100 border border-white/5 text-gray-500">
                  <Filter className="h-4 w-4" />
               </Button>
            </div>
         </div>

         {/* Leads Table */}
         <div className="overflow-x-auto">
            <table className="w-full border-collapse">
               <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5 text-left">
                     <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Participante</th>
                     <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Interesses / Tags</th>
                     <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Score (🔥)</th>
                     <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Origem</th>
                     <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Status</th>
                     <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-20 text-center">
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-brand-orange-coral/20 border-t-brand-orange-coral rounded-full animate-spin" />
                            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Carregando base de leads...</p>
                         </div>
                      </td>
                    </tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-20 text-center">
                         <MailWarning className="h-12 w-12 text-gray-800 mx-auto mb-4 opacity-20" />
                         <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Nenhum lead encontrado com estes filtros</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.email} className="hover:bg-white/[0.02] transition-colors group">
                         <td className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center font-black text-brand-orange-coral text-sm border border-brand-orange-coral/20">
                                   {lead.nome ? lead.nome[0] : '?'}
                                </div>
                                <div>
                                   <p className="text-white font-black text-sm uppercase italic tracking-tight">{lead.nome}</p>
                                   <p className="text-gray-500 text-[11px] font-medium leading-none">{lead.email}</p>
                                </div>
                            </div>
                         </td>
                         <td className="p-6">
                             <div className="flex flex-wrap gap-1">
                                {lead.interesses && lead.interesses.length > 0 ? (
                                  lead.interesses.map(tag => (
                                    <Badge key={tag} className="bg-white/5 text-[9px] font-black uppercase tracking-widest border-white/5 text-gray-400">
                                       {tag}
                                    </Badge>
                                  ))
                                ) : <span className="text-gray-700 text-[10px] uppercase font-black">Sem tags</span>}
                             </div>
                         </td>
                         <td className="p-6 text-center">
                            <div className={`inline-flex items-center gap-1.5 font-black text-xs ${ (lead.engagement_score || 0) > 10 ? 'text-brand-orange-coral' : 'text-gray-500' }`}>
                               {lead.engagement_score || 0}
                               {(lead.engagement_score || 0) > 10 && <Zap className="h-3 w-3 fill-brand-orange-coral" />}
                            </div>
                         </td>
                         <td className="p-6">
                            <Badge className="bg-dark-100 text-[9px] font-black uppercase tracking-widest border-white/5 text-teal-400">
                               {lead.source || 'Website'}
                            </Badge>
                         </td>
                         <td className="p-6">
                            {lead.unsubscribed_at ? (
                              <Badge className="bg-red-500/10 text-red-500 text-[9px] font-black uppercase border-none">OPT-OUT</Badge>
                            ) : (
                              <Badge className="bg-teal-500/10 text-teal-500 text-[9px] font-black uppercase border-none">ATIVO</Badge>
                            )}
                         </td>
                         <td className="p-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <Button size="icon" variant="ghost" className="h-10 w-10 bg-white/5 hover:bg-brand-orange-coral/10 hover:text-brand-orange-coral rounded-xl border border-white/5 transition-all">
                                  <Mail className="h-4 w-4" />
                               </Button>
                               <Button 
                                 size="icon" 
                                 variant="ghost" 
                                 onClick={() => handleDelete(lead.email)}
                                 className="h-10 w-10 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl border border-white/5 transition-all"
                               >
                                  <Trash2 className="h-4 w-4" />
                               </Button>
                            </div>
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>

         {/* Pagination Mockup */}
         <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">
               Exibindo <span className="text-white">{filteredLeads.length}</span> de <span className="text-white">{leads.length}</span> registros
            </p>
            <div className="flex gap-2">
               <Button disabled size="sm" variant="ghost" className="text-gray-600 font-black text-[10px] uppercase border border-white/5 rounded-lg px-4 hover:bg-white/5 scale-95">Anterior</Button>
               <Button disabled size="sm" variant="ghost" className="text-white font-black text-[10px] uppercase border border-white/5 bg-white/5 rounded-lg px-4 scale-95 shadow-lg">1</Button>
               <Button disabled size="sm" variant="ghost" className="text-gray-600 font-black text-[10px] uppercase border border-white/5 rounded-lg px-4 hover:bg-white/5 scale-95">Próximo</Button>
            </div>
         </div>
      </Card>
      
      {/* Background Decor */}
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-brand-orange-coral/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
    </div>
  );
}
