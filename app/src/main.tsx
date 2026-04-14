import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryProvider } from '@/api/providers/QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { Toaster } from '@/components/ui/sonner';
import App from './App';
import './index.css';
import { safeStorage } from '@/utils/safeStorage';
// PWA registration is now handled by PWAProvider in App.tsx


// Valida configurações
import { validateConfig } from '@/lib/config';
validateConfig();

// Aplica tema outdoor antes do React (evita flash)
try {
  if (safeStorage.getItem('ge_theme_outdoor') === '1') {
    document.documentElement.setAttribute('data-theme', 'outdoor');
  }
} catch (_) {}

// Global Error Suppression for known extension noise
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // Suppress "Could not establish connection. Receiving end does not exist" which is extension noise
    if (event.reason && 
        (event.reason.message?.includes('Could not establish connection') || 
         event.reason.message?.includes('Receiving end does not exist') ||
         String(event.reason).includes('Could not establish connection'))) {
      event.preventDefault();
      console.debug('[Extension Noise Suppressed]:', event.reason.message || event.reason);
    }
  });

  // Handle Chrome's runtime.lastError extension errors which are often not "rejections" but "errors"
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const msg = String(args[0] || '');
    if (msg.includes('Could not establish connection') || msg.includes('Receiving end does not exist')) {
      console.debug('[Extension Error Suppressed]:', ...args);
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <ProjectProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#fff',
              },
            }}
          />
        </ProjectProvider>
      </AuthProvider>
    </QueryProvider>
  </StrictMode>
);
