import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { npsModuleService } from '@/services/npsModuleService';
import { NPSForm, NPSFormQuestion, NPSSession } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Heart, Star, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PublicNPS() {
  const { surveyId } = useParams(); // Pode ser o Token Hash ou o Form ID direto na URL
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const userParam = searchParams.get('user');

  const [form, setForm] = useState<NPSForm | null>(null);
  const [questions, setQuestions] = useState<NPSFormQuestion[]>([]);
  const [session, setSession] = useState<NPSSession | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0); // Index na array de questions
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (surveyId) loadSurvey();
  }, [surveyId, tokenParam]);

  const loadSurvey = async () => {
    setLoading(true);
    // Para simplificar o teste, vamos buscar o Form diretamente usando _mapForm
    const data = await npsModuleService.getFormById(surveyId!);
    
    if (data && data.form && data.form.status === 'active') {
       // Filter empty/inactive blocks
       const validQuestions = data.questions.filter(q => q.type !== 'hidden_metadata');
       setForm(data.form);
       setQuestions(validQuestions);
       
       // Inicia Sessão
       const s = await npsModuleService.startSession(data.form.id, data.form.projectId, tokenParam || undefined, userParam || undefined);
       setSession(s);
    }
    setLoading(false);
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextStep = async () => {
     // Validate Required
     const currentQ = questions[currentStep];
     if (currentQ.isRequired && (answers[currentQ.id] === undefined || answers[currentQ.id] === '')) {
         toast.error('Por favor, preencha este campo obrigatório.');
         return;
     }

     if (currentStep < questions.length - 1) {
         // Auto-avançar
         setCurrentStep(prev => prev + 1);
     } else {
         // FIM! Submeter Massivo
         await submitFinal();
     }
  };

  const submitFinal = async () => {
      if (!session || !form) return;
      setSubmitting(true);

      // Qual foi a nota NPS (question type 'nps_score' ou afins)?
      let npsScore = 0;
      let comment = '';
      const mappedAnswers = [];

      for (const q of questions) {
         const val = answers[q.id];
         if (val === undefined) continue;

         if (q.type === 'nps_score' || q.type === 'csat_stars' || q.type === 'csat_emoji') {
            npsScore = val as number;
         } else if (q.type === 'textarea' || q.type === 'short_text') {
            comment = comment ? `${comment}\n${val}` : val;
         }

         mappedAnswers.push({
            questionId: q.id,
            valueText: typeof val === 'string' ? val : undefined,
            valueNumeric: typeof val === 'number' ? val : undefined,
            valueJson: Array.isArray(val) ? val : undefined
         });
      }

      const success = await npsModuleService.submitFullResponse(
          session.id, 
          form.projectId, 
          form.id, 
          npsScore, 
          mappedAnswers, 
          comment
      );

      if (success) {
         setIsFinished(true);
      } else {
         toast.error('Ocorreu um erro. Tente novamente.');
      }
      setSubmitting(false);
  };

  const renderQuestionBlock = (q: NPSFormQuestion) => {
      const val = answers[q.id];

      switch(q.type) {
         case 'nps_score':
           return (
              <div className="w-full">
                 <div className="grid grid-cols-11 gap-1 sm:gap-2 mb-4 w-full">
                   {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                      const isSelected = val === num;
                      let colorClass = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-400 font-bold";
                      if (num <= 6) colorClass = isSelected ? "bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] font-black" : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold";
                      if (num >= 7 && num <= 8) colorClass = isSelected ? "bg-amber-500 text-white border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] font-black" : "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-400 font-bold";
                      if (num >= 9) colorClass = isSelected ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] font-black" : "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-bold";

                      return (
                         <button key={num} onClick={() => { handleAnswer(q.id, num); setTimeout(nextStep, 400); }} className={`aspect-square sm:aspect-auto sm:h-16 flex items-center justify-center rounded-xl text-lg sm:text-xl transition-all border ${colorClass} ${isSelected ? 'scale-110 z-10' : 'scale-100 hover:scale-105'}`}>
                            {num}
                         </button>
                      );
                   })}
                 </div>
                 <div className="flex justify-between w-full px-2 mt-2">
                    <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">{q.options?.[0]?.label || 'Pouco Provável'}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">{q.options?.[1]?.label || 'Muito Provável'}</span>
                 </div>
              </div>
           );

         case 'textarea':
           return (
              <div className="w-full">
                 <Textarea 
                    value={val || ''}
                    onChange={e => handleAnswer(q.id, e.target.value)}
                    placeholder={q.placeholder || 'Digite aqui...'}
                    className="bg-white/5 border border-white/10 rounded-2xl min-h-[150px] text-base p-4 resize-none focus:border-brand-orange-coral focus:ring-0 transition-colors text-white"
                 />
                 <Button onClick={nextStep} disabled={submitting} className="mt-6 w-full bg-brand-orange-coral hover:bg-orange-600 text-white font-black uppercase tracking-widest h-14 rounded-2xl text-sm shadow-[0_0_30px_rgba(255,87,34,0.3)]">
                    AVANÇAR
                 </Button>
              </div>
           );
         
         case 'csat_stars':
            return (
              <div className="w-full">
                <div className="flex justify-center gap-2 sm:gap-6 mb-4 mt-6">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const scoreMap: Record<number, number> = { 1: 0, 2: 3, 3: 6, 4: 8, 5: 10 };
                    const mappedScore = scoreMap[num];
                    const isSelected = val !== undefined && mappedScore <= val;
                    const isExact = val === mappedScore;
                    return (
                      <button key={num} onClick={() => { handleAnswer(q.id, mappedScore); setTimeout(nextStep, 400); }} className={`p-3 sm:p-4 rounded-2xl transition-all ${isExact ? 'scale-125 z-10' : 'hover:scale-110 hover:bg-white/5'}`}>
                        <Star className={`w-10 h-10 sm:w-14 sm:h-14 transition-all ${isSelected ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'text-gray-600'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );

         default:
            return <div className="text-gray-500 italic">Tipo de bloco "{q.type}" incompatível no momento. <Button onClick={nextStep} className="ml-4">Pular</Button></div>;
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-brand-orange-coral animate-spin" />
      </div>
    );
  }

  if (!form || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-gray-400 opacity-50" />
        </div>
        <h1 className="text-xl font-black text-white italic uppercase tracking-widest">Pesquisa Indisponível</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-xs">Este formulário não foi configurado corretamente ou acabou expirando.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#0A0A0A] flex flex-col pt-12 sm:justify-center p-4 sm:p-6 text-white font-sans overflow-hidden">
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-orange-coral/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#14B8A6]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-12">
           <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand-orange-coral italic">{session ? 'Sessão Ativa' : 'Growth Experience'}</h2>
           <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-1">Feedback do Participante</p>
        </div>

        <div className="bg-dark-200/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-12 shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col justify-center transition-all">
          
          <AnimatePresence mode="wait">
            {!isFinished ? (
               <motion.div 
                 key={`step-${currentStep}`}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.3 }}
                 className="flex flex-col h-full items-center justify-center"
               >
                  <p className="text-[10px] font-black uppercase text-[#14B8A6] tracking-widest mb-4">Passo {currentStep + 1} de {questions.length}</p>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-center mb-4">{questions[currentStep].label}</h1>
                  {questions[currentStep].helpText && <p className="text-gray-400 text-xs text-center mb-8">{questions[currentStep].helpText}</p>}

                  <div className="w-full mt-4 flex justify-center">
                     {renderQuestionBlock(questions[currentStep])}
                  </div>
               </motion.div>
            ) : (
               <motion.div 
                 key="finish"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center text-center h-full py-10"
               >
                 <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                   <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                 </div>
                 <h1 className="text-2xl font-black italic uppercase tracking-widest text-white mb-4">MUITO OBRIGADO!</h1>
                 <p className="text-gray-400 text-sm leading-relaxed max-w-sm">Suas respostas foram salvas com sucesso em nossa base de dados V2.</p>
                 
                 <div className="mt-12 opacity-50 flex items-center text-[10px] uppercase tracking-widest font-bold text-gray-500">
                   <Heart className="w-3 h-3 mr-1 text-brand-orange-coral" /> Feito com carinho para melhorar sua experiência.
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </div>
    </div>
  );
}
