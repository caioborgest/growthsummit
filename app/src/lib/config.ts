// Configurações da aplicação a partir das variáveis de ambiente
import { logger } from './logger';

export const config = {
  // App
  appName: import.meta.env.VITE_APP_NAME || 'Growth Summit 2026',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',

  // Feature Flags
  features: {
    enableB2B: import.meta.env.VITE_ENABLE_B2B === 'true',
    enableMentoring: import.meta.env.VITE_ENABLE_MENTORING === 'true',
    enableStartups: import.meta.env.VITE_ENABLE_STARTUPS === 'true',
    enableCheckin: import.meta.env.VITE_ENABLE_CHECKIN === 'true',
    enableLiveStream: import.meta.env.VITE_ENABLE_LIVE_STREAM === 'true',
    enableChat: import.meta.env.VITE_ENABLE_CHAT === 'true',
  },

  // Analytics
  analytics: {
    gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
    gtmId: import.meta.env.VITE_GTM_ID,
    hotjarId: import.meta.env.VITE_HOTJAR_ID,
    clarityProjectId: import.meta.env.VITE_CLARITY_PROJECT_ID,
  },

  // Evento
  event: {
    name: import.meta.env.VITE_EVENT_NAME || 'Growth Summit 2026',
    dateStart: import.meta.env.VITE_EVENT_DATE_START || '2026-05-21',
    dateEnd: import.meta.env.VITE_EVENT_DATE_END || '2026-05-22',
    location: import.meta.env.VITE_EVENT_LOCATION || 'Juazeiro do Norte, CE',
    maxParticipants: parseInt(import.meta.env.VITE_EVENT_MAX_PARTICIPANTS || '1500'),
  },
} as const;

// Validação de configurações críticas
export function validateConfig() {
  const required = [
    'VITE_API_URL',
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    logger.warn(`⚠️ Variáveis de ambiente ausentes: ${missing.join(', ')}`);
  }
}
