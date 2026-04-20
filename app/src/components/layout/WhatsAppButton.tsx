import { MessageCircle } from 'lucide-react';
import { EVENT_CONFIG } from '@/config/eventConfig';

export function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${EVENT_CONFIG.whatsapp.number}?text=${encodeURIComponent('Olá! Gostaria de mais informações sobre o Growth Experience.')}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
      aria-label="Contato via WhatsApp"
    >
      <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 animate-pulse transition-opacity" />
      <div className="bg-[#25D366] text-white p-4 rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 relative">
        <MessageCircle className="h-6 w-6 stroke-[2.5]" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-bounce" />
      </div>
      
      <div className="bg-white text-dark py-2 px-4 rounded-xl shadow-xl font-bold text-sm translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
        Dúvidas? Fale conosco
      </div>
    </a>
  );
}
