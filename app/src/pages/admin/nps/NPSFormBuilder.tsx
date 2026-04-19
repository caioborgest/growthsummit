import { useState, useEffect } from 'react';
import { npsModuleService } from '@/services/npsModuleService';
import { NPSFormQuestion, NPSQuestionType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Plus, Trash2, GripVertical, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface NPSFormBuilderProps {
  formId: string;
}

export function NPSFormBuilder({ formId }: NPSFormBuilderProps) {
  const [questions, setQuestions] = useState<Partial<NPSFormQuestion>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [formId]);

  const loadQuestions = async () => {
    setLoading(true);
    const data = await npsModuleService.getFormById(formId);
    if (data?.questions) {
      setQuestions(data.questions);
    } else {
      // Default initial blocks
      setQuestions([
        {
          type: 'nps_score',
          label: 'De 0 a 10, o quanto você recomendaria este evento?',
          isRequired: true,
          orderIndex: 0
        },
        {
          type: 'textarea',
          label: 'O que motivou sua nota?',
          placeholder: 'Deixe um comentário...',
          isRequired: false,
          orderIndex: 1,
          conditionalRules: { depends_on: 'nps_score', condition: '<=', value: 6 } // Show if detractor (mock logic format)
        }
      ]);
    }
    setLoading(false);
  };

  const addBlock = (type: NPSQuestionType) => {
    setQuestions([
      ...questions,
      {
        type,
        label: 'Nova Pergunta',
        isRequired: false,
        orderIndex: questions.length
      }
    ]);
  };

  const updateBlock = (index: number, updates: Partial<NPSFormQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const removeBlock = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await npsModuleService.saveFormQuestions(formId, questions);
    if (success) toast.success('Blocos salvos com sucesso!');
    else toast.error('Falha ao salvar blocos.');
    setSaving(false);
  };

  if (loading) return <div className="text-gray-500 animate-pulse text-xs">Carregando construtor...</div>;

  return (
    <div className="flex flex-col h-full bg-dark-200">
      
      {/* BUILDER CANVAS */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {questions.length === 0 && (
           <div className="text-center p-12 border border-dashed border-white/10 rounded-2xl">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Nenhum bloco adicionado</p>
           </div>
        )}

        {questions.map((q, idx) => (
          <div key={idx} className="bg-dark-100 border border-white/5 rounded-2xl p-4 flex gap-4 group hover:border-white/20 transition-colors">
            
            <div className="mt-2 text-white/20 cursor-grab hover:text-white/50">
               <GripVertical className="w-5 h-5" />
            </div>

            <div className="flex-1 space-y-3">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase text-[#14B8A6] bg-[#14B8A6]/10 px-2 py-1 rounded">
                       {q.type}
                     </span>
                     <span className="text-[10px] text-gray-500 font-bold">Bloco {idx + 1}</span>
                  </div>
                  <button onClick={() => removeBlock(idx)} className="text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>

               <Input 
                 value={q.label} 
                 onChange={e => updateBlock(idx, { label: e.target.value })} 
                 className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 text-white font-bold h-10 focus:ring-0 focus:border-brand-orange-coral focus-visible:ring-0 text-lg"
                 placeholder="Digite sua pergunta..."
               />

               {q.type === 'single_choice' && (
                 <Textarea 
                   placeholder="Opções (separadas por vírgula)"
                   value={q.options ? q.options.map((o:any) => o.label).join(', ') : ''}
                   onChange={e => {
                     const opts = e.target.value.split(',').map(s => ({ label: s.trim(), value: s.trim() }));
                     updateBlock(idx, { options: opts });
                   }}
                   className="bg-black/20 border-white/5 h-10 mt-2 text-xs" 
                 />
               )}

               <div className="flex justify-between items-center pt-2">
                 <label className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-400 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={q.isRequired} 
                      onChange={e => updateBlock(idx, { isRequired: e.target.checked })}
                      className="rounded bg-black border-white/20 text-brand-orange-coral focus:ring-0"
                    /> OBRIGATÓRIA
                 </label>
                 
                 <div className="flex items-center gap-2">
                    {/* Exemplo visual de condicional - simplificado na interface */}
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-gray-500 hover:text-white" onClick={() => toast('Lógica condicional será aberta em modal (Mock)')}>
                      <Settings className="w-3 h-3 mr-1" /> REGRAS EXIBIÇÃO
                    </Button>
                 </div>
               </div>
            </div>
          </div>
        ))}

        <div className="pt-4 flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
           <Button variant="outline" size="sm" onClick={() => addBlock('nps_score')} className="text-[10px] border-white/10 hover:bg-white/5 h-8 flex-shrink-0"><Plus className="w-3 h-3 mr-1"/> Escala NPS</Button>
           <Button variant="outline" size="sm" onClick={() => addBlock('csat_stars')} className="text-[10px] border-white/10 hover:bg-white/5 h-8 flex-shrink-0"><Plus className="w-3 h-3 mr-1"/> Stars 1-5</Button>
           <Button variant="outline" size="sm" onClick={() => addBlock('csat_emoji')} className="text-[10px] border-white/10 hover:bg-white/5 h-8 flex-shrink-0"><Plus className="w-3 h-3 mr-1"/> Emoji 1-5</Button>
           <Button variant="outline" size="sm" onClick={() => addBlock('textarea')} className="text-[10px] border-white/10 hover:bg-white/5 h-8 flex-shrink-0"><Plus className="w-3 h-3 mr-1"/> Texto Longo</Button>
           <Button variant="outline" size="sm" onClick={() => addBlock('single_choice')} className="text-[10px] border-white/10 hover:bg-white/5 h-8 flex-shrink-0"><Plus className="w-3 h-3 mr-1"/> Escolha Única</Button>
        </div>

      </div>

      <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end gap-4">
        <Button onClick={handleSave} disabled={saving} className="bg-brand-orange-coral hover:bg-orange-600 text-white uppercase text-xs tracking-widest font-black h-10 px-8 rounded-xl shadow-lg shadow-orange-500/20">
          {saving ? 'SALVANDO...' : <><Save className="w-4 h-4 mr-2" /> SALVAR BLOCOS</>}
        </Button>
      </div>

    </div>
  );
}
