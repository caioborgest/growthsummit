import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Share2, 
  Send, 
  Trash2, 
  MessageSquare, 
  BarChart3, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Copy,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useProject } from '@/contexts/ProjectContext';
import { npsService } from '@/services/npsService';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { NPSSurvey } from '@/types';

export default function AdminNPS() {
  const { projectId, isProjectSelected } = useProject();
  const [surveys, setSurveys] = useState<NPSSurvey[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    active: true,
    targetAudience: 'all' as 'all' | 'pro' | 'vip'
  });

  // Fetch surveys on mount or project change
  useEffect(() => {
    if (isProjectSelected && projectId) {
      loadSurveys();
    }
  }, [projectId, isProjectSelected]);

  // Fetch stats when a survey is selected
  useEffect(() => {
    if (selectedSurveyId) {
      loadStats(selectedSurveyId);
    } else {
      setStats(null);
    }
  }, [selectedSurveyId]);

  const loadSurveys = async () => {
    setLoading(true);
    const data = await npsService.getSurveys(projectId!);
    setSurveys(data);
    if (data.length > 0 && !selectedSurveyId) {
      setSelectedSurveyId(data[0].id);
    }
    setLoading(false);
  };

  const loadStats = async (id: string) => {
    const data = await npsService.getResults(id);
    setStats(data);
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    const newSurvey = await npsService.saveSurvey({
      projectId,
      ...formData
    });

    if (newSurvey) {
      toast.success('Pesquisa NPS criada com sucesso!');
      setIsCreateModalOpen(false);
      setFormData({ title: '', description: '', active: true, targetAudience: 'all' });
      loadSurveys();
    } else {
      toast.error('Erro ao criar pesquisa.');
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta pesquisa? Todos os resultados serão perdidos.')) {
      const success = await npsService.deleteSurvey(id);
      if (success) {
        toast.success('Pesquisa excluída.');
        if (selectedSurveyId === id) setSelectedSurveyId(null);
        loadSurveys();
      }
    }
  };

  const copyPublicLink = (id: string) => {
    const url = `${window.location.origin}/nps/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link público copiado!');
  };

  const selectedSurvey = useMemo(() => 
    surveys.find(s => s.id === selectedSurveyId), 
  [surveys, selectedSurveyId]);

  if (!isProjectSelected) {
    return (
      <div className="p-20 text-center opacity-50">
        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-500" />
        <h2 className="text-xl font-black uppercase tracking-widest text-white">Selecione um projeto</h2>
        <p className="text-sm text-gray-400">Para gerenciar pesquisas NPS, escolha um projeto no menu lateral.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Módulo <span className="text-brand-orange-coral">NPS</span></h1>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">Net Promoter Score & Satisfação do Cliente</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-brand-orange-coral hover:bg-orange-600 text-white font-black rounded-2xl h-12 px-8 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          CRIAR PESQUISA
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Survey List */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-black text-gray-700 uppercase tracking-widest px-2">Suas Pesquisas</h2>
          <div className="space-y-3">
            {surveys.length === 0 && !loading && (
              <div className="glass-card p-8 text-center bg-white/[0.02]">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Nenhuma pesquisa cadastrada</p>
              </div>
            )}
            
            {surveys.map((survey) => (
              <motion.div
                key={survey.id}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedSurveyId(survey.id)}
                className={`p-5 rounded-[1.5rem] border cursor-pointer transition-all ${
                  selectedSurveyId === survey.id 
                    ? 'bg-brand-orange-coral/10 border-brand-orange-coral shadow-lg shadow-brand-orange-coral/5' 
                    : 'bg-white/[0.03] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge className={`uppercase text-[8px] font-black tracking-widest ${survey.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'}`}>
                    {survey.active ? 'Ativa' : 'Encerrada'}
                  </Badge>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteSurvey(survey.id); }}
                    className="text-gray-700 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className={`font-black text-sm uppercase italic tracking-tight ${selectedSurveyId === survey.id ? 'text-brand-orange-coral' : 'text-white'}`}>
                  {survey.title}
                </h3>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                  {new Date(survey.createdAt).toLocaleDateString('pt-BR')} • {survey.targetAudience === 'all' ? 'Todo Público' : `Apenas ${survey.targetAudience?.toUpperCase()}`}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Dashboard / Analysis */}
        <div className="lg:col-span-8 space-y-6">
          {selectedSurvey ? (
            <>
              {/* Quick Actions Card */}
              <div className="glass-card p-6 border-white/5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                    <TrendingUp className="h-6 w-6 text-brand-orange-coral" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg italic uppercase tracking-tight">{selectedSurvey.title}</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Análise de Desempenho em Tempo Real</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => copyPublicLink(selectedSurvey.id)}
                    className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest px-4 h-10 border border-white/5"
                  >
                    <Copy className="h-3.5 w-3.5 mr-2" /> Copiar Link
                  </Button>
                  <Button 
                    className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest px-4 h-10 shadow-lg shadow-teal-500/20"
                    onClick={() => toast.info('Link de compartilhamento para parceiros gerado!')}
                  >
                    <Share2 className="h-3.5 w-3.5 mr-2" /> Compartilhar ROI
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-dark-200 border-white/5 rounded-[2rem] overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                      <BarChart3 className="h-16 w-16 text-white" />
                   </div>
                   <CardContent className="pt-8 pb-6 text-center">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-2">NPS Global</p>
                      <div className="relative inline-block">
                        <span className={`text-6xl font-black italic tracking-tighter ${
                          (stats?.score || 0) >= 70 ? 'text-emerald-400' : 
                          (stats?.score || 0) >= 40 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {stats?.score || 0}
                        </span>
                        <div className="absolute -top-1 -right-4 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <p className="text-[9px] font-bold text-gray-500 mt-4 uppercase tracking-widest">
                        ZONA DE {(stats?.score || 0) >= 70 ? 'EXCELÊNCIA' : (stats?.score || 0) >= 40 ? 'QUALIDADE' : 'APERFEIÇOAMENTO'}
                      </p>
                   </CardContent>
                </Card>

                <Card className="col-span-2 bg-dark-200 border-white/5 rounded-[2rem] p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Distribuição de Público</h3>
                    <Badge variant="outline" className="text-gray-500 border-white/5 uppercase text-[8px] font-black tracking-[0.2em]">
                      Total: {stats?.total || 0} Respostas
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Promotores (9-10)', count: stats?.promoters || 0, color: 'bg-emerald-500', text: 'text-emerald-400', range: [9, 10] },
                      { label: 'Neutros (7-8)', count: stats?.passives || 0, color: 'bg-yellow-500', text: 'text-yellow-400', range: [7, 8] },
                      { label: 'Detratores (0-6)', count: stats?.detractors || 0, color: 'bg-red-500', text: 'text-red-400', range: [0, 6] },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-gray-500">{item.label}</span>
                          <span className={item.text}>{item.count} ({stats?.total ? Math.round((item.count / stats.total) * 100) : 0}%)</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: stats?.total ? `${(item.count / stats.total) * 100}%` : '0%' }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full ${item.color} rounded-full`} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Comments Feed */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-gray-700 uppercase tracking-widest px-2">Comentários e Feedback</h3>
                  <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-brand-orange-coral tracking-widest">
                    Ver todos <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats?.responses?.filter((r: any) => r.comment).slice(0, 6).map((resp: any) => (
                    <div key={resp.id} className="p-5 bg-white/[0.03] border border-white/5 rounded-[1.5rem] relative group hover:bg-white/[0.05] transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                          resp.score >= 9 ? 'bg-emerald-500/10 text-emerald-400' : 
                          resp.score >= 7 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {resp.score}
                        </div>
                        <span className="text-[9px] text-gray-700 font-bold uppercase tracking-widest">
                          {new Date(resp.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs italic leading-relaxed line-clamp-3">
                        "{resp.comment}"
                      </p>
                    </div>
                  ))}
                  {(!stats?.responses || stats.responses.filter((r: any) => r.comment).length === 0) && (
                    <div className="col-span-full py-12 text-center opacity-30 border-2 border-dashed border-white/5 rounded-[2rem]">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Nenhum comentário registrado</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-[2rem] bg-white/[0.03] flex items-center justify-center mb-6 border border-white/5">
                <BarChart3 className="h-10 w-10 text-gray-700" />
              </div>
              <h3 className="text-white font-black uppercase text-sm tracking-widest mb-2">Selecione uma pesquisa</h3>
              <p className="text-gray-500 text-xs font-bold leading-relaxed max-w-xs">
                Clique em uma pesquisa na lista lateral para visualizar os dados de satisfação e comentários dos participantes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-dark-200 border-white/10 text-white max-w-lg rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase">Nova Pesquisa <span className="text-brand-orange-coral">NPS</span></DialogTitle>
            <DialogDescription className="text-gray-500 text-xs font-bold uppercase tracking-widest">Padrão Profissional Growth Experience</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSurvey} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Título da Pesquisa</Label>
              <Input 
                required 
                placeholder="Ex: Avaliação Geral - Growth Experience 2026" 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/5 border-white/10 h-12 rounded-2xl focus:border-brand-orange-coral focus:ring-0" 
              />
            </div>

            <div className="space-y-2">
              <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Público Alvo</Label>
              <div className="grid grid-cols-3 gap-2">
                {['all', 'pro', 'vip'].map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetAudience: aud as any })}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      formData.targetAudience === aud ? 'bg-brand-orange-coral border-brand-orange-coral text-white' : 'bg-white/5 border-white/5 text-gray-500'
                    }`}
                  >
                    {aud === 'all' ? 'Todos' : aud.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Descrição / Convite</Label>
              <textarea 
                placeholder="Ex: Sua opinião é fundamental para evoluirmos o ecossistema..." 
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 h-24 rounded-2xl p-4 text-sm focus:outline-none focus:border-brand-orange-coral resize-none text-white" 
              />
            </div>

            <div className="pt-2">
               <Button 
                type="submit" 
                className="w-full bg-brand-orange-coral hover:bg-orange-600 text-white font-black h-14 rounded-2xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
              >
                CRIAR E ATIVAR AGORA
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
