import { Calendar, QrCode, Home as HomeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors } from '@/styles/designSystem';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Barra de ações rápidas exibida apenas em telas móveis ou PWA instalados.
 * Coloca agenda e acesso ao QR em thumb zone inferior.
 */
export function MobileQuickActions() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="fixed bottom-0 inset-x-0 bg-dark/95 backdrop-blur-md border-t border-white/10 flex justify-around py-2 lg:hidden z-50">
      <Link to="/programacao" className="flex flex-col items-center text-white">
        <Calendar className="h-6 w-6" style={{ color: colors.primary }} />
        <span className="text-[10px] mt-1 text-white">Agenda</span>
      </Link>
      <Link to="/minha-area" className="flex flex-col items-center text-white">
        <QrCode className="h-6 w-6" style={{ color: colors.primary }} />
        <span className="text-[10px] mt-1 text-white">Meu QR</span>
      </Link>
      {isAuthenticated && (
        <Link to="/minha-area" className="flex flex-col items-center text-white">
          <HomeIcon className="h-6 w-6" style={{ color: colors.primary }} />
          <span className="text-[10px] mt-1 text-white">Início</span>
        </Link>
      )}
    </div>
  );
}
