import { Header } from './Header';
import { Footer } from './Footer';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { MobileQuickActions } from './MobileQuickActions';
import { colors } from '@/styles/designSystem';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export function Layout() {
  const location = useLocation();
  const online = useNetworkStatus();
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const searchParams = new URLSearchParams(location.search);
  const isEmbed = searchParams.get('embed') === 'true';

  const isLandingPage = location.pathname === '/' || 
                        location.pathname.includes('growth-experience-triunfo') || 
                        location.pathname.includes('growth-experience-petrolina') ||
                        location.pathname.includes('sobre') ||
                        isEmbed;

  // PWA: listen for update available
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        if (reg.waiting) setWaitingSW(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing;
          if (newSW) {
            newSW.addEventListener('statechange', () => {
              if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingSW(newSW);
              }
            });
          }
        });
      });

      // Removido listener de controllerchange que causava loop infinito no Ctrl+Shift+R
      // O recarregamento agora é gerenciado via onNeedRefresh no main.tsx
    }
  }, []);

  // show toast when SW waiting
  useEffect(() => {
    if (waitingSW) {
      toast.custom(t => (
        <div className="p-3 bg-dark text-white rounded flex items-center justify-between gap-4">
          <span>Nova versão disponível.</span>
          <Button variant="secondary" size="sm" onClick={() => {
            waitingSW.postMessage({ type: 'SKIP_WAITING' });
            toast.dismiss(t.id);
          }}>
            Atualizar
          </Button>
        </div>
      ), { duration: 0 });
    }
  }, [waitingSW]);

  // install prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  useEffect(() => {
    if (installPrompt) {
      toast.custom(t => (
        <div className="p-3 bg-dark text-white rounded flex items-center justify-between gap-4">
          <span>Instale o app para acesso rápido</span>
          <Button variant="secondary" size="sm" onClick={() => {
            installPrompt.prompt();
            installPrompt.userChoice.then(() => setInstallPrompt(null));
            toast.dismiss(t.id);
          }}>
            Instalar
          </Button>
        </div>
      ), { duration: 10000 });
    }
  }, [installPrompt]);

  // Reset offline banner when back online
  useEffect(() => {
    if (online) {
      setShowOfflineBanner(true);
    }
  }, [online]);

  return (
    <div className="min-h-screen bg-dark text-white overflow-x-hidden">
      {!isEmbed && <Header />}
      {/* offline indicator */}
      {!online && showOfflineBanner && !isEmbed && (
        <div
          className="fixed top-16 inset-x-0 text-white text-center py-1 z-50 flex items-center justify-center"
          style={{ background: colors.error }}
        >
          <span>Você está offline. Algumas funcionalidades podem ficar indisponíveis.</span>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white"
            onClick={() => setShowOfflineBanner(false)}
            aria-label="Fechar alerta offline"
          >
            ×
          </button>
        </div>
      )}
      <main className={isLandingPage || isEmbed ? "" : "pt-18 lg:pt-20"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!isEmbed && <Footer />}
      {!isEmbed && <MobileQuickActions />}
    </div>
  );
}
