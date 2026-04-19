import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { npsModuleService } from '@/services/npsModuleService';
import { NPSCase, NPSCaseActivity } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Inbox as InboxIcon, ArrowRight, User, Hash, MessagesSquare, History } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function NPSInbox() {
  const { projectId } = useProject();
  const { user } = useAuth();
  
  const [cases, setCases] = useState<NPSCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<NPSCase | null>(null);
  const [activities, setActivities] = useState<NPSCaseActivity[]>([]);
  
  // Resolution state
  const [isResolving, setIsResolving] = useState(false);
  const [actionTaken, setActionTaken] = useState('');

  useEffect(() => {
    if (projectId) loadCases();
  }, [projectId]);

  useEffect(() => {
    if (selectedCase) {
      loadActivities(selectedCase.id);
    }
  }, [selectedCase]);

  const loadCases = async () => {
    setLoading(true);
    const data = await npsModuleService.getLoopCases(projectId!);
    setCases(data);
    if (data.length > 0 && !selectedCase) {
      setSelectedCase(data[0]);
    }
    setLoading(false);
  };

  const loadActivities = async (caseId: string) => {
    const data = await npsModuleService.getCaseActivities(caseId);
    setActivities(data);
  };

  const handleResolve = async () => {
    if (!selectedCase) return;
    if (!actionTaken.trim()) {
      toast.error('Descreva a ação tomada antes de fechar o ticket.');
      return;
    }

    const success = await npsModuleService.updateCaseStatus(selectedCase.id, 'resolved', actionTaken, user?.id);
    if (success) {
      toast.success('Ticket marcardo como resolvido!');
      setIsResolving(false);
      setActionTaken('');
      
      const updatedCase = { ...selectedCase, status: 'resolved' as const };
      setSelectedCase(updatedCase);
      setCases(cases.map(c => c.id === selectedCase.id ? updatedCase : c));
      
      // Reload activities to get the new log
      loadActivities(selectedCase.id);
    }
  };

  const handleUpdateProperty = async (property: 'priority' | 'status', value: string) => {
    if (!selectedCase) return;
    
    // Optimistic UI
    const updatedCase = { ...selectedCase, [property]: value };
    setSelectedCase(updatedCase as NPSCase);
    setCases(cases.map(c => c.id === selectedCase.id ? (updatedCase as NPSCase) : c));

    let success = false;
    if (property === 'priority') {
       success = await npsModuleService.updateCaseStatus(selectedCase.id, '', undefined, user?.id, undefined, value);
    } else if (property === 'status') {
       success = await npsModuleService.updateCaseStatus(selectedCase.id, value, undefined, user?.id);
    }
    
    if (success) {
      toast.success('Ticket atualizado com sucesso!');
      loadActivities(selectedCase.id); // reload history log
    } else {
      toast.error('Erro ao atualizar ticket.');
      // Revert in real app, but for now we just show error
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">Carregando Caixa de Entrada...</div>;
  }

  const getPriorityColor = (priority: string) => {
    if (priority === 'high' || priority === 'urgent') return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (priority === 'medium') return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh] min-h-[600px] -mt-2">
      {/* Sidebar - Cases List */}
      <div className="lg:col-span-4 bg-dark-200 border border-white/5 rounded-[2rem] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 bg-black/20">
          <h2 className="text-xl font-black text-white italic flex items-center tracking-tight">
            <InboxIcon className="w-5 h-5 mr-3 text-brand-orange-coral" />
            Inbox CX
          </h2>
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Tratativa de Detratores em Loop Fechado</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {cases.length === 0 ? (
            <div className="text-center py-10 opacity-50 flex flex-col items-center">
               <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                 <CheckCircle2 className="w-8 h-8 text-emerald-500" />
               </div>
               <p className="text-xs uppercase font-black tracking-widest text-white">Inbox Zero!</p>
               <p className="text-[10px] text-gray-500 mt-1 max-w-[150px]">Nenhum detractor pendente no momento.</p>
            </div>
          ) : (
            cases.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelectedCase(c); setIsResolving(false); setActionTaken(''); setActivities([]); }}
                className={`w-full text-left p-4 rounded-2xl transition-all border ${
                  selectedCase?.id === c.id 
                    ? 'bg-white/10 border-white/10 shadow-lg' 
                    : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline" className={`uppercase text-[8px] font-black tracking-widest px-2 py-0.5 border ${
                    c.status === 'open' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                    c.status === 'resolved' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                    'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                  }`}>
                    {c.status === 'open' ? 'Aberto' : c.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase"><Clock className="w-3 h-3 inline pb-[1px]" /> {new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border italic ${getPriorityColor(c.priority)}`}>
                      {c.priority}
                    </span>
                  </div>
                </div>
                <p className="text-gray-200 font-bold text-sm line-clamp-1 mb-1">
                  Nota: <span className="text-red-400 ml-1">{c.response?.score || 0}/10</span>
                </p>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  "{c.response?.mainComment || 'Sem comentários adicionais fornecidos pelo participante.'}"
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Panel - Ticket Resolution */}
      <div className="lg:col-span-8 bg-dark-200 border border-white/5 rounded-[2rem] overflow-hidden flex flex-col">
        {selectedCase ? (
          <div className="h-full flex flex-col relative">
            <div className="p-8 border-b border-white/5 bg-gradient-to-r from-dark-200 to-black/50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Case <Hash className="inline w-5 h-5 text-brand-orange-coral opacity-50"/>{selectedCase.id.split('-')[0]}</h3>
                    <Badge className={`uppercase text-[9px] font-black tracking-widest ${
                      selectedCase.status === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {selectedCase.status === 'resolved' ? 'TICKET FECHADO' : 'AGUARDANDO AÇÃO'}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    Participante Session: {selectedCase.response?.sessionId?.split('-')[0] || 'Anônimo'}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 opacity-80 hover:opacity-100 transition-opacity">
                   <div className="flex items-center gap-2">
                     <span className="text-[9px] uppercase font-bold text-gray-500 w-16">Prioridade:</span>
                     <select 
                       value={selectedCase.priority} 
                       onChange={(e) => handleUpdateProperty('priority', e.target.value)}
                       className="bg-dark-100 border border-white/10 text-white text-xs font-bold rounded px-2 py-1 focus:ring-0 focus:border-brand-orange-coral outline-none appearance-none"
                     >
                       <option value="low">Baixa</option>
                       <option value="medium">Média</option>
                       <option value="high">Alta</option>
                       <option value="urgent">Urgente</option>
                     </select>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-[9px] uppercase font-bold text-gray-500 w-16">Status:</span>
                     <select 
                       value={selectedCase.status} 
                       onChange={(e) => handleUpdateProperty('status', e.target.value)}
                       className="bg-dark-100 border border-white/10 text-white text-xs font-bold rounded px-2 py-1 focus:ring-0 focus:border-brand-orange-coral outline-none appearance-none"
                     >
                       <option value="open">Aberto</option>
                       <option value="in_progress">Em Andamento</option>
                       <option value="resolved">Resolvido</option>
                       <option value="closed">Fechado</option>
                     </select>
                   </div>
                </div>

                {selectedCase.status !== 'resolved' && selectedCase.status !== 'closed' && !isResolving && (
                  <Button 
                    onClick={() => setIsResolving(true)}
                    className="bg-brand-orange-coral hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest h-10 px-6 shadow-lg shadow-orange-500/20"
                  >
                    FINALIZAR AÇÃO <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
              {/* Voice of Customer */}
              <div className="relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-full" />
                <div className="pl-6">
                  <Label className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center mb-4">
                    <MessagesSquare className="w-3 h-3 mr-2" /> Voz do Cliente (Detrator)
                  </Label>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-5 mb-4 border-b border-white/5 pb-4">
                      <div className="w-16 h-16 rounded-2xl bg-red-500 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-red-500/20 italic">
                        {selectedCase.response?.score}
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">Insatisfação Crítica</p>
                        <p className="text-[11px] text-gray-500 tracking-widest uppercase mt-1">Formulário ID: {selectedCase.response?.formId.split('-')[0]}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed italic">
                      "{selectedCase.response?.mainComment || 'O participante registrou uma nota baixa mas optou por não deixar comentários por escrito.'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* History / Activities Feed */}
              {activities.length > 0 && (
                <div className="relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-full" />
                  <div className="pl-6">
                    <Label className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center mb-4">
                      <History className="w-3 h-3 mr-2" /> Log de Atividades (Histórico Rápido)
                    </Label>
                    <div className="space-y-3">
                       {activities.map((act) => (
                          <div key={act.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                             <div className="flex justify-between items-center mb-2">
                                <Badge className="bg-blue-500/20 text-blue-400 font-black text-[9px] uppercase tracking-widest">{act.actionType}</Badge>
                                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold font-sans">
                                   {new Date(act.createdAt).toLocaleString('pt-BR')}
                                </span>
                             </div>
                             <p className="text-sm text-gray-300">{act.content}</p>
                          </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Resolution Area */}
              {isResolving && (
                <div className="relative animate-in slide-in-from-bottom-4 duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-orange-coral rounded-full" />
                  <div className="pl-6">
                     <Label className="text-[10px] font-black text-brand-orange-coral uppercase tracking-widest mb-4 block">
                       Tratativa de Resolução (Log de Ação)
                     </Label>
                     <Textarea 
                       value={actionTaken}
                       onChange={e => setActionTaken(e.target.value)}
                       placeholder="Ex: Entrei em contato com o cliente via telefone, expliquei a situação do ocorrido e ofereci um desconto..."
                       className="w-full bg-white/5 border-white/10 min-h-[120px] rounded-2xl text-white resize-none"
                     />
                     <div className="flex gap-4 mt-4">
                       <Button variant="outline" onClick={() => setIsResolving(false)} className="border-white/10 text-gray-400 hover:text-white uppercase text-xs font-bold font-sans">
                         Cancelar
                       </Button>
                       <Button onClick={handleResolve} className="bg-emerald-500 hover:bg-emerald-600 text-white uppercase text-xs font-black shadow-lg shadow-emerald-500/20">
                         <CheckCircle2 className="w-4 h-4 mr-2" /> Encerrar como Resolvido
                       </Button>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <InboxIcon className="w-20 h-20 text-gray-500 mb-6" />
            <h3 className="text-white font-black uppercase text-lg tracking-widest">Selecione um Ticket NPS</h3>
            <p className="text-[12px] text-gray-400 mt-2 max-w-[250px] leading-relaxed">
              Analise os detratores na barra lateral e aja para reconquistá-los.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
