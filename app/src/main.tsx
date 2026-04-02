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
