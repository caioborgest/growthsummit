import { Calendar, QrCode, Home as HomeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors } from '@/styles/designSystem';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

/**
 * Barra de ações rápidas exibida apenas em telas móveis ou PWA instalados.
 * Coloca agenda e acesso ao QR em thumb zone inferior.
 */
export function MobileQuickActions() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isTriunfoPage = location.pathname.includes('growth-experience-triunfo');
  const agendaLink = isTriunfoPage ? "/growth-experience-triunfo#programacao" : "/programacao";
  const qrLink = isAuthenticated ? "/minha-area?tab=ingresso" : "/login";

  return (
    <div className="fixed bottom-0 inset-x-0 bg-dark/95 backdrop-blur-md border-t border-white/10 py-2 lg:hidden z-50">
      {isTriunfoPage && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-4 py-1.5 bg-brand-orange-coral/90 backdrop-blur-sm rounded-t-xl border-x border-t border-white/10 text-[9px] font-black text-white uppercase tracking-widest whitespace-nowrap shadow-lg">
          Triunfo-PE • Presencial
        </div>
      )}
      
      <div className="flex justify-around items-center">
        <Link to={agendaLink} className="flex flex-col items-center text-white px-4">
          <Calendar className="h-6 w-6" style={{ color: colors.primary }} />
          <span className="text-[10px] mt-1 text-white">Agenda</span>
        </Link>

        <Link to={qrLink} className="flex flex-col items-center text-white px-4">
          <div className="relative">
            <QrCode className="h-6 w-6" style={{ color: colors.primary }} />
            {isTriunfoPage && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 text-white">Meu QR</span>
        </Link>

        {isAuthenticated && (
          <Link to="/minha-area" className="flex flex-col items-center text-white px-4">
            <HomeIcon className="h-6 w-6" style={{ color: colors.primary }} />
            <span className="text-[10px] mt-1 text-white">Início</span>
          </Link>
        )}
      </div>
    </div>
  );
}
