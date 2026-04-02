import { Header } from './Header';
import { Footer } from './Footer';
import { ExitIntentPopup } from '../app/ExitIntentPopup';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { MobileQuickActions } from './MobileQuickActions';
import { colors } from '@/styles/designSystem';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { NewsletterSection } from '../app/NewsletterSection';
import { useState, useEffect } from 'react';
import { usePWAContext } from '@/contexts/PWAContext';

export function Layout() {
  const location = useLocation();
  const online = useNetworkStatus();
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);
  const { isInstallable, promptInstall, isInstalled } = usePWAContext();

  const searchParams = new URLSearchParams(location.search);
  const isEmbed = searchParams.get('embed') === 'true';

  const isLandingPage = location.pathname === '/' || 
                        location.pathname.includes('triunfo') || 
                        location.pathname.includes('petrolina') ||
                        location.pathname.includes('sobre') ||
                        isEmbed;

  // Pages where we want the NewsletterSection (Global Public Pages)
  const showNewsletter = !isEmbed && 
                        !location.pathname.startsWith('/admin') &&
                        !location.pathname.startsWith('/minha-area') &&
                        !location.pathname.startsWith('/inscricoes') &&
                        !location.pathname.startsWith('/login') &&
                        // Include common public pages
                        ['/', '/triunfo', '/petrolina', '/sobre', '/faq', '/contato', '/palestrantes', '/programacao', '/validar', '/seja-patrocinador', '/seja-mentor'].some(p => location.pathname === p);

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

  // consolidated install prompt handled by PWAContext
  useEffect(() => {
    // Se for instalável e não estiver instalado, mostramos o prompt após 10 segundos
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        toast.custom(t => (
          <div className="p-3 bg-dark text-white rounded-[1.5rem] border border-white/10 flex items-center justify-between gap-4 shadow-2xl backdrop-blur-xl">
            <span className="text-sm font-medium">Instale o app para acesso rápido</span>
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-orange-500 hover:bg-orange-600 text-white border-none rounded-xl font-bold"
              onClick={() => {
                promptInstall();
                toast.dismiss(t.id);
              }}
            >
              Instalar
            </Button>
          </div>
        ), { duration: 15000 });
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, promptInstall]);

  // Reset offline banner when back online (non-cascading fix)
  useEffect(() => {
    if (online && !showOfflineBanner) {
      // Use setImmediate-like timeout to avoid React warning about synchronous state updates in effects
      const timer = setTimeout(() => setShowOfflineBanner(true), 0);
      return () => clearTimeout(timer);
    }
  }, [online, showOfflineBanner]);

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
      {showNewsletter && <NewsletterSection />}
      {!isEmbed && <Footer />}
      {!isEmbed && <MobileQuickActions />}
      {!isEmbed && <ExitIntentPopup />}
    </div>
  );
}
