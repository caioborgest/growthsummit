import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryProvider } from '@/api/providers/QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { Toaster } from '@/components/ui/sonner';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// PWA Registration
registerSW({
  onNeedRefresh() {
    if (confirm('Nova versão disponível! Deseja atualizar agora?')) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log('App pronto para uso offline');
  },
});

// Valida configurações
import { validateConfig } from '@/lib/config';
validateConfig();

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
