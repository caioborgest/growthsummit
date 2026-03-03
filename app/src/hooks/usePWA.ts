import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isOffline: boolean;
  promptInstall: () => Promise<void>;
  dismissInstall: () => void;
  updateAvailable: boolean;
  updateApp: () => void;
}

export function usePWA(): PWAState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Check if running as standalone PWA
  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
      setIsInstalled(standalone);
    };

    checkStandalone();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      setIsInstalled(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
      logger.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      logger.log('User accepted the install prompt');
      setIsInstalled(true);
    } else {
      logger.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  }, [deferredPrompt]);

  const dismissInstall = useCallback(() => {
    setDeferredPrompt(null);
    setIsInstallable(false);
    // Store in localStorage to not show again for a while
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }, []);

  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
        window.location.reload();
      });
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    isOffline,
    promptInstall,
    dismissInstall,
    updateAvailable,
    updateApp,
  };
}

// Helper function to check if user dismissed install recently
export function shouldShowInstallPrompt(): boolean {
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (!dismissed) return true;

  // Show again after 7 days
  const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
  return daysSinceDismissed > 7;
}

// Get install instructions based on platform
export function getInstallInstructions(): { title: string; steps: string[] } {
  const userAgent = navigator.userAgent.toLowerCase();

  // iOS Safari
  if (/iphone|ipad|ipod/.test(userAgent) && /safari/.test(userAgent) && !/chrome/.test(userAgent)) {
    return {
      title: 'Instalar no iPhone/iPad',
      steps: [
        'Toque no botão "Compartilhar" na barra de ferramentas do Safari',
        'Role para baixo e toque em "Adicionar à Tela de Início"',
        'Toque em "Adicionar" no canto superior direito',
        'Pronto! O app foi instalado na sua tela inicial',
      ],
    };
  }

  // iOS Chrome
  if (/iphone|ipad|ipod/.test(userAgent) && /chrome/.test(userAgent)) {
    return {
      title: 'Instalar no iPhone/iPad',
      steps: [
        'Toque no menu (três pontos) no canto inferior direito',
        'Toque em "Adicionar à Tela Inicial" ou "Instalar App"',
        'Confirme tocando em "Adicionar"',
        'Pronto! O app foi instalado na sua tela inicial',
      ],
    };
  }

  // Android Chrome
  if (/android/.test(userAgent) && /chrome/.test(userAgent)) {
    return {
      title: 'Instalar no Android',
      steps: [
        'Toque no menu (três pontos) no canto superior direito',
        'Selecione "Adicionar à tela inicial" ou "Instalar app"',
        'Confirme tocando em "Instalar"',
        'Pronto! O app foi instalado no seu dispositivo',
      ],
    };
  }

  // Android Samsung Internet
  if (/android/.test(userAgent) && /samsungbrowser/.test(userAgent)) {
    return {
      title: 'Instalar no Samsung Internet',
      steps: [
        'Toque no menu (três linhas) na parte inferior',
        'Selecione "Adicionar página à" > "Tela inicial"',
        'Confirme tocando em "Adicionar"',
        'Pronto! O app foi instalado na sua tela inicial',
      ],
    };
  }

  // Android Firefox
  if (/android/.test(userAgent) && /firefox/.test(userAgent)) {
    return {
      title: 'Instalar no Firefox Android',
      steps: [
        'Toque no menu (três pontos) na barra de endereço',
        'Selecione "Adicionar à tela inicial"',
        'Confirme tocando em "Adicionar"',
        'Pronto! O app foi adicionado à sua tela inicial',
      ],
    };
  }

  // Desktop Chrome/Edge
  if (/chrome/.test(userAgent) || /edg/.test(userAgent)) {
    return {
      title: 'Instalar no Computador',
      steps: [
        'Clique no ícone de instalação na barra de endereço',
        'Ou clique no menu e selecione "Instalar Growth Experience"',
        'Confirme clicando em "Instalar"',
        'Pronto! O app foi instalado no seu computador',
      ],
    };
  }

  // Desktop Safari (macOS)
  if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
    return {
      title: 'Instalar no Mac',
      steps: [
        'Clique em "Arquivo" no menu superior',
        'Selecione "Adicionar ao Dock"',
        'Confirme clicando em "Adicionar"',
        'Pronto! O app foi adicionado ao seu Dock',
      ],
    };
  }

  // Default
  return {
    title: 'Instalar o App',
    steps: [
      'Procure pelo menu do navegador (geralmente três pontos ou linhas)',
      'Selecione "Adicionar à tela inicial" ou "Instalar app"',
      'Confirme a instalação',
      'Pronto! O app foi instalado no seu dispositivo',
    ],
  };
}
