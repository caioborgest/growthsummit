import { useState, useEffect } from 'react';
import { X, Gift, Zap, MessageCircle, ArrowRight, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function LotePromocionalPopUp() {
    const [isOpen, setIsOpen] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            // Verificar se o popup já foi mostrado hoje
            const lastShownDate = localStorage.getItem('lotePromocionalLastShown');
            const today = new Date().toDateString();

            if (lastShownDate !== today) {
                setIsOpen(true);
                setShouldRender(true);
            }
        }, 20000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => setShouldRender(false), 300);
        // Salvar a data atual para não mostrar novamente hoje
        localStorage.setItem('lotePromocionalLastShown', new Date().toDateString());
    };

    const handleWhatsApp = () => {
        const message = encodeURIComponent("Olá! Tenho interesse na Oferta de Lote Promocional (Compre 2, Leve 3) para o Growth Experience Triunfo.");
        window.open(`https://wa.me/5588988432310?text=${message}`, '_blank');
        handleClose();
    };

    if (!shouldRender) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Overlay Click to Close */}
            <div className="absolute inset-0" onClick={handleClose} />

            <Card className={`relative max-w-md w-full max-h-[85vh] overflow-y-auto bg-dark-200 border-brand-orange-coral/40 shadow-[0_0_50px_-12px_rgba(255,112,67,0.3)] transition-all duration-500 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'} scrollbar-hide`}>

                {/* Efeitos de Background */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-orange-coral via-brand-orange-gradient to-brand-orange-intense sticky top-0 z-30" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange-coral/10 blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-orange-intense/10 blur-[60px] rounded-full pointer-events-none" />

                {/* Header com Botão Fechar */}
                <div className="flex justify-end p-3 sm:p-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                        }}
                        className="p-2 text-white bg-brand-orange-coral rounded-full shadow-lg hover:bg-brand-orange-intense transition-all z-50"
                        aria-label="Fechar"
                    >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>

                {/* Conteúdo Principal */}
                <div className="px-5 sm:px-8 pb-6 sm:pb-8 relative z-10">

                    {/* Badge Superior */}
                    <div className="flex justify-center mb-4 sm:mb-5">
                        <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1.5 text-[10px] sm:text-xs font-black tracking-[0.2em] animate-pulse uppercase">
                            <Sparkles className="h-3 w-3 mr-2 text-brand-orange-coral" />
                            Oportunidade Única
                        </Badge>
                    </div>

                    {/* Hero Section - Ícone e Título */}
                    <div className="text-center mb-5 sm:mb-6">
                        {/* Ícone Principal com Badge */}
                        <div className="flex justify-center mb-4 sm:mb-5">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-brand-orange-coral/20 to-brand-orange-intense/10 border border-brand-orange-coral/30 flex items-center justify-center backdrop-blur-sm">
                                <Gift className="h-8 w-8 sm:h-10 sm:w-10 text-brand-orange-coral" />
                                <div className="absolute -top-1 -right-1 sm:top-0 sm:right-0 w-9 h-9 sm:w-11 sm:h-11 bg-white text-brand-orange-coral font-black rounded-full flex flex-col items-center justify-center border-4 border-brand-orange-coral shadow-xl transform rotate-12">
                                    <span className="text-[8px] sm:text-[10px] leading-none">LEVE</span>
                                    <span className="text-xs sm:text-base leading-none">3</span>
                                </div>
                            </div>
                        </div>

                        {/* Título */}
                        <h2 className="text-xl sm:text-3xl font-black text-white mb-2 leading-none tracking-tighter uppercase italic">
                            Compre 2
                        </h2>
                        <span className="text-xl sm:text-3xl font-black text-brand-orange-coral drop-shadow-sm italic block mb-3 sm:mb-4">
                            GanhE 3!
                        </span>

                        {/* Subtítulo */}
                        <div className="flex items-center justify-center gap-2">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-brand-orange-coral fill-brand-orange-coral" />
                            <p className="text-gray-300 font-medium text-[11px] sm:text-sm uppercase tracking-widest">Lote Promocional</p>
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-brand-orange-coral fill-brand-orange-coral" />
                        </div>
                    </div>

                    {/* Descrição */}
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-sm mx-auto text-center mb-5 sm:mb-6">
                        Reúna sua equipe e economize. O terceiro ingresso é um <span className="text-white font-bold border-b-2 border-brand-orange-coral/50">investimento nosso</span> no seu time.
                    </p>

                    {/* Vantagens */}
                    <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-6 max-w-xs mx-auto">
                        {[
                            'Acesso VIP a todas as palestras',
                            'Networking estratégico',
                            'Certificado premium incluso',
                            'Suporte prioritário na compra'
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-gray-300 group/item">
                                <div className="w-6 h-6 rounded-lg bg-brand-orange-coral/10 border border-brand-orange-coral/20 flex items-center justify-center flex-shrink-0 group-hover/item:bg-brand-orange-coral group-hover/item:border-brand-orange-coral transition-all duration-300">
                                    <ArrowRight className="h-3 w-3 text-brand-orange-coral group-hover/item:text-white transition-colors" />
                                </div>
                                <span className="group-hover/item:text-white transition-colors">{text}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="space-y-3">
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleWhatsApp();
                            }}
                            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-3.5 sm:py-5 rounded-xl shadow-[0_0_30px_-5px_rgba(37,211,102,0.4)] hover:shadow-[0_0_40px_-5px_rgba(37,211,102,0.6)] group transition-all h-auto text-sm sm:text-lg flex items-center justify-center gap-3 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <div className="relative z-10 flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                                <span>GARANTIR 3x2</span>
                            </div>
                            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-2 relative z-10" />
                        </Button>

                        {/* Urgência */}
                        <div className="flex items-center justify-center gap-2 text-brand-orange-coral animate-pulse">
                            <Zap className="h-3 w-3 fill-current" />
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">Últimas vagas disponíveis</span>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-center text-[9px] sm:text-[11px] text-gray-500 font-medium px-2 mt-4">
                        *Oferta exclusiva para compras coletivas. Termos e condições se aplicam.
                    </p>
                </div>
            </Card>
        </div>
    );
}
