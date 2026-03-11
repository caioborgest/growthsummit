import { Calendar, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors } from '@/styles/designSystem';

/**
 * Barra de ações rápidas exibida apenas em telas móveis ou PWA instalados.
 * Coloca agenda e acesso ao QR em thumb zone inferior.
 */
export function MobileQuickActions() {
  return (
    <div className="fixed bottom-0 inset-x-0 bg-dark/95 backdrop-blur-md border-t border-white/10 flex justify-around py-2 lg:hidden z-50">
      <Link to="/programacao" className="flex flex-col items-center text-gray-400 hover:text-white">
        <Calendar className="h-6 w-6" style={{ color: colors.primary }} />
        <span className="text-[10px] mt-1">Agenda</span>
      </Link>
      <Link to="/minha-area" className="flex flex-col items-center text-gray-400 hover:text-white">
        <QrCode className="h-6 w-6" style={{ color: colors.primary }} />
        <span className="text-[10px] mt-1">Meu QR</span>
      </Link>
    </div>
  );
}
