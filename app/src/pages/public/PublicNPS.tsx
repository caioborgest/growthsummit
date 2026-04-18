import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { npsService } from '@/services/npsService';
import { NPSSurvey } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Star, Send, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useInscricoes } from '@/hooks/useData';

export default function PublicNPS() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: registrations } = useInscricoes();
  
  const [survey, setSurvey] = useState<NPSSurvey | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (surveyId) {
      loadSurvey();
    }
  }, [surveyId]);

  const loadSurvey = async () => {
    if (!surveyId) return;
    setLoading(true);
    try {
      const data = await npsService.getSurveyById(surveyId);
      if (data) {
        setSurvey(data);
      } else {
        toast.error('Pesquisa não encontrada ou já encerrada.');
        navigate('/');
      }
    } catch (error) {
      logger.error('Erro ao carregar survey NPS:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (score === null) return;
    setSubmitting(true);

    const registration = registrations?.find(r => r.projectId === survey?.projectId);

    const result = await npsService.submitResponse({
      surveyId: surveyId!,
      score,
      comment,
      userId: user?.id,
      registrationId: registration?.id,
      metadata: { source: 'public_link', timestamp: new Date().toISOString() }
    });

    if (result.success) {
      setDone(true);
      toast.success('Obrigado pelo seu feedback!');
    } else {
      toast.error(result.error || 'Erro ao enviar resposta.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange-coral" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 max-w-md w-full border-emerald-500/20"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">Feedback Recebido!</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Sua opinião é o combustível para transformarmos o ecossistema Growth Experience. Nos vemos no topo!
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-black h-14 rounded-2xl border border-white/5"
          >
            VOLTAR AO INÍCIO
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange-coral/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <div className="text-center mb-10">
          <img 
            src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/favicon.png" 
            alt="Logo" 
            className="h-12 w-auto mx-auto mb-6 opacity-30" 
          />
          <Badge className="bg-brand-orange-coral/10 text-brand-orange-coral border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest mb-4">
            PESQUISA DE SATISFAÇÃO
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white italic uppercase tracking-tighter leading-tight">
            Conte-nos sua <span className="text-brand-orange-coral">Experiência</span>
          </h1>
          <p className="text-gray-500 mt-4 text-sm font-medium px-4">
            Em uma escala de 0 a 10, o quanto você recomendaria este evento para um amigo ou colega?
          </p>
        </div>

        <div className="glass-card p-6 sm:p-10 border-white/5 space-y-10">
          {/* NPS Scale */}
          <div className="space-y-6">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-600 px-1">
              <span>Nada Provável</span>
              <span>Muito Provável</span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-11 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setScore(num)}
                  className={`h-11 sm:h-14 rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg transition-all border ${
                    score === num 
                      ? 'bg-brand-orange-coral border-brand-orange-coral text-white shadow-lg shadow-orange-500/30 scale-110' 
                      : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <AnimatePresence>
            {score !== null && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-white/5"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-brand-orange-coral" />
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">O que mais você tem a dizer? (Opcional)</p>
                </div>
                <Textarea 
                  placeholder="Compartilhe sua percepção sobre as palestras, networking ou organização..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-2xl min-h-[120px] focus:border-brand-orange-coral text-white p-4"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            disabled={score === null || submitting}
            onClick={handleSubmit}
            className={`w-full h-14 sm:h-16 rounded-2xl sm:rounded-3xl font-black text-sm sm:text-base uppercase tracking-widest transition-all ${
              score !== null 
                ? 'bg-brand-orange-coral text-white shadow-xl shadow-orange-500/20' 
                : 'bg-white/5 text-gray-700 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>ENVIAR FEEDBACK AGORA <Send className="ml-3 h-5 w-5" /></>
            )}
          </Button>
        </div>

        <div className="mt-8 text-center">
           <button 
            onClick={() => navigate('/')}
            className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em] hover:text-gray-500 transition-colors flex items-center justify-center mx-auto"
           >
              <ArrowLeft className="h-3 w-3 mr-2" /> Voltar para o Ecossistema
           </button>
        </div>
      </motion.div>
    </div>
  );
}
