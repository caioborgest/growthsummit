import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { npsModuleService } from '@/services/npsModuleService';
import { NPSForm } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Heart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function PublicNPS() {
  const { surveyId } = useParams();
  const formId = surveyId;
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user') || undefined;
  
  const [form, setForm] = useState<NPSForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (formId) loadForm();
  }, [formId]);

  const loadForm = async () => {
    setLoading(true);
    // Since Public users aren't logged in to Admin, Supabase RLS is configured to allow selecting ACTIVE forms.
    const { data, error } = await supabase
        .from('nps_forms')
        .select('*')
        .eq('id', formId)
        .eq('status', 'active')
        .single();
        
    if (!error && data) {
       // Manual map reusing the shape
       setForm({
          id: data.id,
          projectId: data.event_id,
          internalName: data.internal_name,
          description: data.description,
          status: data.status,
          npsQuestion: data.nps_question,
          minLabel: data.min_label,
          maxLabel: data.max_label,
          thanksPromoter: data.thanks_promoter,
          thanksPassive: data.thanks_passive,
          thanksDetractor: data.thanks_detractor,
          createdAt: data.created_at,
          updatedAt: data.updated_at
       } as NPSForm);
    }
    setLoading(false);
  };

  const handleScoreSelect = (selectedScore: number) => {
    setScore(selectedScore);
    // Auto-advance after short delay
    setTimeout(() => setStep(2), 500);
  };

  const handleSubmit = async () => {
    if (score === null || !form) return;
    setSubmitting(true);

    try {
      const payload = {
        form_id: form.id,
        event_id: form.projectId,
        participant_user_id: userId,
        nps_score: score,
        main_comment: comment,
        channel: 'public_link'
      };

      const { error } = await supabase.from('nps_responses').insert([payload]);
      
      if (error && error.code !== '23505') { // Ignore unique violation if user refreshed
         throw error;
      }
      
      setStep(3);
    } catch (error) {
      toast.error('Erro ao enviar sua avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const getThankYouMessage = () => {
    if (!form || score === null) return '';
    if (score >= 9) return form.thanksPromoter;
    if (score >= 7) return form.thanksPassive;
    return form.thanksDetractor;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-brand-orange-coral animate-spin" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
          <Heart className="w-8 h-8 text-gray-400 opacity-50" />
        </div>
        <h1 className="text-xl font-black text-white italic uppercase tracking-widest">Pesquisa não encontrada</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-xs">Este formulário Pós-Evento pode ter sido desativado ou o link está incorreto.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#0A0A0A] flex flex-col pt-12 sm:justify-center p-4 sm:p-6 text-white font-sans overflow-hidden">
      
      {/* Visual background details */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-orange-coral/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#14B8A6]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto relative z-10">
        
        {/* Header / Brand */}
        <div className="text-center mb-12">
           <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand-orange-coral italic">Growth Experience</h2>
           <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-1">Feedback do Participante</p>
        </div>

        <div className="bg-dark-200/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-12 shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col justify-center">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <div className="text-center mb-8">
                   <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{form.npsQuestion}</h1>
                </div>

                {(!form.visualSettings?.surveyType || form.visualSettings.surveyType === 'nps_0_10') && (
                  <>
                    <div className="grid grid-cols-11 gap-1 sm:gap-2 mb-4 w-full">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                         const isSelected = score === num;
                         
                         // Color coding logic
                         let colorClass = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20";
                         if (num <= 6) colorClass = isSelected ? "bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400";
                         if (num >= 7 && num <= 8) colorClass = isSelected ? "bg-amber-500 text-white border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]" : "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-400";
                         if (num >= 9) colorClass = isSelected ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400";

                         return (
                            <button
                              key={num}
                              onClick={() => handleScoreSelect(num)}
                              className={`aspect-square sm:aspect-auto sm:h-16 flex items-center justify-center rounded-xl text-lg sm:text-xl font-black transition-all border ${colorClass} ${isSelected ? 'scale-110 z-10' : 'scale-100 hover:scale-105'}`}
                            >
                              {num}
                            </button>
                         );
                      })}
                    </div>
                    
                    <div className="flex justify-between w-full px-2 mt-2">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">{form.minLabel}</span>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">{form.maxLabel}</span>
                    </div>
                  </>
                )}

                {form.visualSettings?.surveyType === 'csat_stars_1_5' && (
                  <div className="flex justify-center gap-2 sm:gap-6 mb-4 mt-6">
                    {[1, 2, 3, 4, 5].map((num) => {
                      // Map 1-5 to 0-10 for unified DB storage
                      const scoreMap: Record<number, number> = { 1: 0, 2: 3, 3: 6, 4: 8, 5: 10 };
                      const mappedScore = scoreMap[num];
                      
                      // Highlight stars up to the selected one
                      const isSelected = score !== null && mappedScore <= score;
                      const isExact = score === mappedScore;
                      
                      return (
                        <button
                          key={num}
                          onClick={() => handleScoreSelect(mappedScore)}
                          className={`p-3 sm:p-4 rounded-2xl transition-all ${isExact ? 'scale-125 z-10' : 'hover:scale-110 hover:bg-white/5'}`}
                        >
                          <Star className={`w-10 h-10 sm:w-14 sm:h-14 transition-all ${isSelected ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'text-gray-600'}`} />
                        </button>
                      );
                    })}
                  </div>
                )}

                {form.visualSettings?.surveyType === 'csat_emoji_1_5' && (
                  <div className="flex justify-center gap-2 sm:gap-4 mb-4 mt-8">
                    {[
                      { val: 1, emoji: '😢', label: 'Triste', mapped: 0 },
                      { val: 2, emoji: '😕', label: 'Indiferente', mapped: 3 },
                      { val: 3, emoji: '😐', label: 'Razoável', mapped: 6 },
                      { val: 4, emoji: '🙂', label: 'Alegre', mapped: 8 },
                      { val: 5, emoji: '😍', label: 'Muito Feliz', mapped: 10 }
                    ].map((item) => {
                      const isSelected = score === item.mapped;
                      return (
                        <button
                          key={item.val}
                          onClick={() => handleScoreSelect(item.mapped)}
                          className={`flex flex-col items-center gap-3 p-2 sm:p-4 rounded-3xl transition-all ${isSelected ? 'bg-white/10 scale-125 border border-white/20 shadow-2xl z-10' : 'hover:bg-white/5 hover:scale-110 border border-transparent'}`}
                        >
                          <span className={`text-4xl sm:text-5xl transition-all ${!isSelected && score !== null ? 'opacity-30 grayscale' : ''}`}>
                            {item.emoji}
                          </span>
                          <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <div className="text-center mb-6">
                   <h1 className="text-2xl font-black tracking-tight">Tem algo mais que queira compartilhar?</h1>
                   <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-2">Seu feedback é opcional, mas nos ajuda imensamente.</p>
                </div>

                <Textarea 
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Deixe seu comentário aqui..."
                  className="bg-white/5 border border-white/10 rounded-2xl min-h-[150px] text-base p-4 resize-none focus:border-brand-orange-coral focus:ring-0 transition-colors"
                />

                <div className="mt-8 flex gap-4">
                   <Button variant="ghost" onClick={() => setStep(1)} className="text-gray-400 hover:text-white uppercase tracking-widest text-xs font-bold h-14 px-6">
                     VOLTAR
                   </Button>
                   <Button 
                     onClick={handleSubmit} 
                     disabled={submitting}
                     className="flex-1 bg-brand-orange-coral hover:bg-orange-600 text-white font-black uppercase tracking-widest h-14 rounded-2xl text-sm shadow-[0_0_30px_rgba(255,87,34,0.3)]"
                   >
                     {submitting ? 'ENVIANDO...' : 'ENVIAR AVALIAÇÃO'}
                   </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex flex-col items-center justify-center text-center h-full py-10"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-black italic uppercase tracking-widest text-white mb-4">MUITO OBRIGADO!</h1>
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                  {getThankYouMessage()}
                </p>
                
                {score !== null && score >= 9 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.5 }}
                    className="mt-10"
                  >
                    <p className="text-[10px] uppercase font-black tracking-widest text-brand-orange-coral mb-3">Já que você curtiu tanto...</p>
                    <Button 
                      onClick={() => window.open('https://g.page/r/growth-experience/review', '_blank')}
                      className="bg-brand-orange-coral hover:bg-orange-600 text-white font-black uppercase tracking-widest h-14 px-8 rounded-2xl text-sm shadow-[0_0_30px_rgba(255,87,34,0.3)] animate-pulse"
                    >
                      <Heart className="w-4 h-4 mr-2" /> Deixe um Depoimento
                    </Button>
                  </motion.div>
                ) : (
                  <div className="mt-12 opacity-50 flex items-center text-[10px] uppercase tracking-widest font-bold text-gray-500">
                    <Heart className="w-3 h-3 mr-1 text-brand-orange-coral" /> Feito com carinho para melhorar sua experiência.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </div>
    </div>
  );
}
