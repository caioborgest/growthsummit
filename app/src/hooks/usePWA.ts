import { usePWAContext } from '@/contexts/PWAContext';
import { safeStorage } from '@/utils/safeStorage';

export function usePWA() {
  return usePWAContext();
}

// Helper function to check if user dismissed install recently
export function shouldShowInstallPrompt(): boolean {
  const dismissed = safeStorage.getItem('pwa-install-dismissed');
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
