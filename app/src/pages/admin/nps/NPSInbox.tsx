import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { npsModuleService } from '@/services/npsModuleService';
import { NPSLoopCase } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, Inbox as InboxIcon, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function NPSInbox() {
  const { projectId } = useProject();
  const [cases, setCases] = useState<NPSLoopCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<NPSLoopCase | null>(null);

  useEffect(() => {
    if (projectId) loadCases();
  }, [projectId]);

  const loadCases = async () => {
    setLoading(true);
    const data = await npsModuleService.getLoopCases(projectId!);
    setCases(data);
    if (data.length > 0 && !selectedCase) {
      setSelectedCase(data[0]);
    }
    setLoading(false);
  };

  const handleResolve = async (id: string) => {
    const success = await npsModuleService.updateCaseStatus(id, 'resolved', 'Tratado via Inbox');
    if (success) {
      toast.success('Ticket marcardo como resolvido!');
      loadCases();
      if (selectedCase?.id === id) {
        setSelectedCase(prev => prev ? { ...prev, status: 'resolved' } : null);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">Carregando tickets...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[70vh] min-h-[600px]">
      {/* Left Sidebar - Tickets List */}
      <div className="lg:col-span-4 bg-dark-200 border border-white/5 rounded-[2rem] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center">
            <InboxIcon className="w-4 h-4 mr-2 text-brand-orange-coral" />
            Inbox de Detratores
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cases.length === 0 ? (
            <div className="text-center py-10 opacity-50">
               <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
               <p className="text-[10px] uppercase font-black tracking-widest">Tudo limpo!</p>
            </div>
          ) : (
            cases.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`w-full text-left p-4 rounded-2xl transition-all border ${
                  selectedCase?.id === c.id 
                    ? 'bg-white/10 border-white/10' 
                    : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={`uppercase text-[8px] font-black tracking-widest ${
                    c.status === 'open' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
                    c.status === 'resolved' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
                    'text-yellow-400 border-yellow-500/20 bg-yellow-500/10'
                  }`}>
                    {c.status}
                  </Badge>
                  <span className="text-white font-black italic text-sm">{c.response?.score}/10</span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{c.response?.mainComment || 'Sem comentários'}</p>
                <div className="mt-3 flex items-center text-[9px] font-bold text-gray-500 tracking-widest uppercase">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Content - Ticket Details */}
      <div className="lg:col-span-8 bg-dark-200 border border-white/5 rounded-[2rem] p-8 flex flex-col">
        {selectedCase ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-start border-b border-white/5 pb-6 mb-6">
              <div>
                <h3 className="text-2xl font-black text-white italic uppercase">Ticket #{selectedCase.id.split('-')[0]}</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 mr-2 inline-flex items-center">
                  Prioridade: <span className="text-red-400 ml-1">{selectedCase.priority}</span>
                </p>
              </div>
              {selectedCase.status !== 'resolved' && (
                <Button 
                  onClick={() => handleResolve(selectedCase.id)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> MARCAR RESOLVIDO
                </Button>
              )}
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Avaliação Recebida</Label>
                <div className="mt-2 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-black text-xl italic">
                      {selectedCase.response?.score}
                    </div>
                    <div>
                      <p className="text-white font-bold">{selectedCase.response?.classification.toUpperCase()}</p>
                      <p className="text-[10px] text-gray-500 tracking-widest uppercase">Canal: {selectedCase.response?.channel}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm italic border-l-2 border-brand-orange-coral pl-4">
                    "{selectedCase.response?.mainComment || 'Nenhum comentário preenchido.'}"
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tratativa de CX</Label>
                <div className="mt-2 p-6 border border-white/5 rounded-2xl bg-black/20">
                   {selectedCase.status === 'resolved' ? (
                     <div className="text-emerald-400 text-sm font-bold flex items-center">
                       <CheckCircle2 className="w-4 h-4 mr-2" /> Tratado e Fechado.
                     </div>
                   ) : (
                     <div className="text-gray-500 text-xs italic">
                       Nenhuma ação de recuperação registrada ainda. 
                       <br/><br/>
                       <Button variant="outline" className="border-white/10 text-[10px] uppercase tracking-widest mt-2" onClick={() => toast.info('Em breve: Adicionar logs manuais.')}>
                         Mais Ações <ArrowRight className="w-3 h-3 ml-2" />
                       </Button>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <InboxIcon className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-white font-black uppercase text-sm tracking-widest">Selecione um Ticket</h3>
            <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-2 max-w-[200px]">
              Seus casos aparecerão na barra lateral
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
