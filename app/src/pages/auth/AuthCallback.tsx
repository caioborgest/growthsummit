import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/PageLoader';
import { logger } from '@/lib/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AuthCallback() {
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();
    const [showOpenInApp, setShowOpenInApp] = useState(false);
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            logger.info('[AuthCallback] Evento detectado:', event);
            
            if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
                logger.info('[AuthCallback] Sessão confirmada.');
                
                setIsProcessing(false);

                if (isIOS && !isStandalone) {
                    // Usuário está no Safari, mostrar botão para abrir no PWA
                    setShowOpenInApp(true);
                } else {
                    // Redireciona imediatamente para / e deixa o componente Home (App.tsx) lidar com a role
                    navigate('/', { replace: true });
                }
            }
        });

        // Fallback: se em 10 segundos nada acontecer e não for iOS prompt, volta pro login
        const timer = setTimeout(() => {
            if (!showOpenInApp) {
                supabase.auth.getSession().then(({ data }) => {
                    if (!data.session) {
                        logger.warn('[AuthCallback] Timeout atingido sem sessão detectada.');
                        navigate('/login', { replace: true });
                    }
                });
            }
        }, 10000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, [navigate, showOpenInApp]);

    const handleContinue = () => {
        navigate('/', { replace: true });
    };

    if (showOpenInApp) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0c0e12] relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(255,112,67,0.1) 0%, transparent 70%)' }} />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm text-center relative z-10"
          >
            <div className="glass-card p-10 rounded-[3rem] border-white/10 shadow-2xl backdrop-blur-3xl">
              <div className="relative mb-8 flex justify-center">
                <motion.div 
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 15, delay: 0.2 }}
                  className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-green-500/20 to-brand-orange-coral/10 flex items-center justify-center border border-white/10"
                >
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </motion.div>
                <div className="absolute -bottom-2 -right-2">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1c22] border border-white/10 flex items-center justify-center shadow-lg">
                    <Smartphone className="h-5 w-5 text-brand-orange-coral" />
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight italic">
                Acesso <span className="text-brand-orange-coral">Confirmado!</span>
              </h2>
              
              <p className="text-gray-400 mb-10 text-lg font-medium leading-relaxed px-2">
                Identificamos que você está usando o Safari. Para uma experiência completa, continue no seu <span className="text-white font-bold">App instalado</span>.
              </p>

              <div className="space-y-4">
                <Button 
                  onClick={handleContinue}
                  className="w-full h-16 rounded-2xl font-black text-lg text-white btn-shimmer border-none"
                  style={{ 
                    background: 'linear-gradient(135deg, #ff7043 0%, #ff4035 100%)',
                    boxShadow: '0 8px 32px rgba(255,112,67,0.3)'
                  }}
                >
                  <span className="flex items-center gap-3">
                    Abrir no Aplicativo
                    <ExternalLink className="h-5 w-5" />
                  </span>
                </Button>

                <button 
                  onClick={handleContinue}
                  className="w-full py-4 text-gray-500 hover:text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Continuar no Navegador
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="mt-8 text-[10px] font-black text-gray-700 uppercase tracking-[0.2em]">
              Growth Experience 2026 · Ecosystem
            </p>
          </motion.div>
        </div>
      );
    }

    return <PageLoader />;
}
