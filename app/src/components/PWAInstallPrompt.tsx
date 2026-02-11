import { useState, useEffect } from 'react';
import { usePWA, shouldShowInstallPrompt, getInstallInstructions } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Download, 
  Share2, 
  PlusSquare, 
  CheckCircle2,
  Smartphone,
  Monitor,
  Tablet,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PWAInstallPrompt() {
  const { 
    isInstallable, 
    isInstalled, 
    isStandalone, 
    isOffline,
    promptInstall, 
    dismissInstall,
    updateAvailable,
    updateApp 
  } = usePWA();
  
  const [showPrompt, setShowPrompt] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const instructions = getInstallInstructions();

  // Check if we should show the install prompt
  useEffect(() => {
    if (isInstallable && shouldShowInstallPrompt() && !isStandalone) {
      // Delay showing the prompt for better UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isStandalone]);

  // Show update prompt when available
  useEffect(() => {
    if (updateAvailable) {
      setShowUpdatePrompt(true);
    }
  }, [updateAvailable]);

  const handleInstall = async () => {
    // Check if it's iOS (which doesn't support beforeinstallprompt)
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    
    if (isIOS) {
      setShowInstructions(true);
    } else {
      await promptInstall();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    dismissInstall();
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
    dismissInstall();
  };

  // Don't show if already in standalone mode or installed
  if (isStandalone || isInstalled) {
    return (
      <>
        {/* Offline Indicator */}
        <AnimatePresence>
          {isOffline && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm text-black px-4 py-2 text-center text-sm font-medium"
            >
              <div className="flex items-center justify-center gap-2">
                <WifiOff className="h-4 w-4" />
                <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Update Available */}
        <AnimatePresence>
          {showUpdatePrompt && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-dark-200 border border-teal-500/50 rounded-xl p-4 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <Download className="h-5 w-5 text-teal-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Nova versão disponível!</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Uma atualização foi instalada. Reinicie para usar a versão mais recente.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-teal-500 hover:bg-teal-600 text-white flex-1"
                      onClick={updateApp}
                    >
                      Atualizar agora
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-dark-300 text-gray-300"
                      onClick={() => setShowUpdatePrompt(false)}
                    >
                      Depois
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      {/* Install Prompt - Native (for Android/Chrome) */}
      <AnimatePresence>
        {showPrompt && !showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <div className="bg-gradient-to-br from-dark-200 to-dark-100 border border-teal-500/30 rounded-2xl p-5 shadow-2xl shadow-teal-500/10">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg">
                    <img 
                      src="/icons/icon-72x72.png" 
                      alt="Growth Summit" 
                      className="w-8 h-8"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Growth Summit</h3>
                    <p className="text-gray-400 text-sm">Instale nosso app</p>
                  </div>
                </div>
                <button 
                  onClick={handleDismiss}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Benefits */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0" />
                  <span>Acesso mais rápido</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0" />
                  <span>Funciona offline</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0" />
                  <span>Notificações em tempo real</span>
                </div>
              </div>

              {/* Device Info */}
              <div className="flex items-center justify-center gap-4 mb-5 py-3 bg-dark-300/50 rounded-xl">
                <div className="flex flex-col items-center text-gray-400">
                  <Smartphone className="h-6 w-6 mb-1" />
                  <span className="text-xs">Mobile</span>
                </div>
                <div className="w-px h-8 bg-dark-300" />
                <div className="flex flex-col items-center text-gray-400">
                  <Tablet className="h-6 w-6 mb-1" />
                  <span className="text-xs">Tablet</span>
                </div>
                <div className="w-px h-8 bg-dark-300" />
                <div className="flex flex-col items-center text-gray-400">
                  <Monitor className="h-6 w-6 mb-1" />
                  <span className="text-xs">Desktop</span>
                </div>
              </div>

              {/* Install Button */}
              <Button 
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-6 text-base font-semibold shadow-lg shadow-teal-500/25"
                onClick={handleInstall}
              >
                <Download className="h-5 w-5 mr-2" />
                Instalar App
              </Button>

              <p className="text-center text-gray-500 text-xs mt-3">
                Leva menos de 10 segundos • Sem ocupar espaço
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Instructions Modal (for iOS) */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-dark-200 to-dark-100 border border-teal-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{instructions.title}</h3>
                <button 
                  onClick={handleCloseInstructions}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Steps */}
              <div className="space-y-4 mb-6">
                {instructions.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-teal-400 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual Helper for iOS */}
              <div className="bg-dark-300/50 rounded-xl p-4 mb-6">
                <p className="text-gray-400 text-xs mb-3">Procure por estes ícones:</p>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Share2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-500 text-xs">Compartilhar</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-dark-300 border border-gray-600 rounded-xl flex items-center justify-center">
                      <PlusSquare className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-500 text-xs">Adicionar</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                onClick={handleCloseInstructions}
              >
                Entendi
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Indicator */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm text-black px-4 py-2 text-center text-sm font-medium"
          >
            <div className="flex items-center justify-center gap-2">
              <WifiOff className="h-4 w-4" />
              <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Mini install button for header/footer
export function PWAInstallButton() {
  const { isInstallable, isStandalone, promptInstall } = usePWA();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setShowButton(isInstallable && !isStandalone);
  }, [isInstallable, isStandalone]);

  if (!showButton) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10"
      onClick={promptInstall}
    >
      <Download className="h-4 w-4 mr-2" />
      Instalar App
    </Button>
  );
}

// iOS Install Badge (always visible on iOS until installed)
export function IOSInstallBadge() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkIOS = () => {
      const ua = navigator.userAgent.toLowerCase();
      const iOS = /iphone|ipad|ipod/.test(ua);
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;
      setIsIOS(iOS);
      setIsStandalone(standalone);
    };
    checkIOS();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('ios-install-badge-dismissed', 'true');
  };

  if (!isIOS || isStandalone || dismissed || localStorage.getItem('ios-install-badge-dismissed')) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 border-b border-teal-500/30 px-4 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
            <Share2 className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Instale o app no seu iPhone</p>
            <p className="text-gray-400 text-xs">Toque em compartilhar e depois "Adicionar à Tela de Início"</p>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
}
