import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { npsService } from '@/services/npsService';
import { NPSSurvey } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, X, MessageSquare, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';

export function NPSPopup() {
  const { projectId } = useProject();
  const navigate = useNavigate();
  const [activeSurvey, setActiveSurvey] = useState<NPSSurvey | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (projectId) {
      checkActiveSurvey();
    }
  }, [projectId]);

  const checkActiveSurvey = async () => {
    // Check if user already dismissed this specific survey in this session or local storage
    const lastDismissed = localStorage.getItem(`nps_dismissed_${projectId}`);
    if (lastDismissed) {
        const dismissedDate = new Date(lastDismissed);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 1) return; // Wait 24h to show again if dismissed
    }

    const survey = await npsService.getActiveSurvey(projectId!);
    if (survey) {
        setActiveSurvey(survey);
        // Show after a slight delay to not overwhelm the UI
        setTimeout(() => setIsVisible(true), 3000);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`nps_dismissed_${projectId}`, new Date().toISOString());
  };

  const handleOpenSurvey = () => {
    if (activeSurvey) {
      navigate(`/nps/${activeSurvey.id}`);
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && activeSurvey && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 left-6 right-6 lg:left-auto lg:right-12 lg:w-[400px] z-[100]"
        >
          <div className="glass-card p-6 border-brand-orange-coral/30 shadow-2xl shadow-brand-orange-coral/10 relative overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange-coral/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex gap-5">
              <div className="w-14 h-14 rounded-2xl bg-brand-orange-coral/20 flex items-center justify-center border border-brand-orange-coral/20 shrink-0">
                <Star className="h-7 w-7 text-brand-orange-coral fill-brand-orange-coral/20" />
              </div>
              <div className="flex-1">
                <Badge className="bg-brand-orange-coral/10 text-brand-orange-coral border-none px-2 py-0.5 rounded-lg font-black text-[8px] tracking-widest uppercase mb-2">
                  Feedback Growth
                </Badge>
                <h3 className="text-white font-black text-sm uppercase italic tracking-tight leading-none mb-2">
                  Sua opinião importa!
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  O que você está achando do evento até agora? Ajude-nos a criar a melhor experiência.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleOpenSurvey}
                className="flex-1 bg-brand-orange-coral hover:bg-orange-600 text-white font-black h-11 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
              >
                AVALIAR AGORA
              </Button>
              <Button 
                variant="ghost"
                onClick={handleDismiss}
                className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white h-11 rounded-xl text-xs font-black uppercase tracking-widest px-4"
              >
                MAIS TARDE
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
