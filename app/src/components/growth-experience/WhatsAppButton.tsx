import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
    const whatsappUrl = 'https://api.whatsapp.com/send/?phone=5588988432310&text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20as%20propostas%20de%20stand%20no%20Growth%20Experience%20Triunfo-PE%202026&type=phone_number&app_absent=0';

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 right-5 sm:bottom-6 sm:right-8 z-50 group"
            aria-label="Fale conosco no WhatsApp"
        >
            <div className="relative">
                {/* Pulse animation */}
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />

                {/* Button */}
                <div className="relative bg-green-500 hover:bg-green-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                    <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>

                {/* Tooltip - Hidden on Mobile */}
                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden sm:block">
                    <div className="bg-dark-100 text-white text-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
                        <p className="font-semibold text-brand-orange-coral">Quero atendimento personalizado</p>
                        <p className="text-xs text-gray-400">Clique para falar agora</p>
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-dark-100" />
                    </div>
                </div>
            </div>
        </a>
    );
}
