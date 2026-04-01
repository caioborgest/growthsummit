/**
 * CONFIGURAÇÕES GLOBAIS DE UI - GROWTH EXPERIENCE PLATFORM
 * Centraliza cores, labels e tokens para garantir consistência em 26+ páginas.
 */

export const UI_COLORS = {
  brand: {
    coral: '#FF7043',
    intense: '#FF4035',
    teal: '#14B8A6',
    dark: '#0C0E12',
  },
  status: {
    success: 'bg-green-500/20 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/20 text-red-400 border-red-500/20',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/20',
    premium: 'bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/20',
  }
};

export type StatusType = 'paid' | 'pending' | 'cancelled' | 'refunded' | 'active' | 'pago' | 'pendente' | 'ativo' | 'free' | 'gratis';

/**
 * Mapeia qualquer variação de status para uma cor e label consistente.
 */
import { CheckCircle2, Clock, XCircle, RefreshCcw, Heart } from 'lucide-react';

export const getStatusConfig = (status: string | undefined) => {
  const s = (status || '').toLowerCase().trim();

  // Status de Pagamento / Inscrição
  if (['pago', 'paid', 'ativo', 'active', 'confirmado', 'confirmed'].includes(s)) {
    return { label: 'PAGO', color: UI_COLORS.status.success, icon: CheckCircle2 };
  }
  if (['pendente', 'pending', 'aguardando', 'waiting'].includes(s)) {
    return { label: 'PENDENTE', color: UI_COLORS.status.warning, icon: Clock };
  }
  if (['cancelado', 'cancelled', 'suspenso'].includes(s)) {
    return { label: 'CANCELADO', color: UI_COLORS.status.error, icon: XCircle };
  }
  if (['estornado', 'refunded', 'devolvido'].includes(s)) {
    return { label: 'ESTORNADO', color: UI_COLORS.status.neutral, icon: RefreshCcw };
  }
  if (['free', 'gratis', 'cortesia'].includes(s)) {
    return { label: 'CORTESIA', color: UI_COLORS.status.info, icon: Heart };
  }

  return { label: (status || 'N/A').toUpperCase(), color: UI_COLORS.status.neutral, icon: Clock };
};

/**
 * Utilitários para detecção de Mobile e Layout
 */
export const GLASS_STYLE = "backdrop-blur-xl bg-white/[0.03] border border-white/10 shadow- premium";
export const CARD_HOVER = "hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300";
