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
            const hasSeenPopup = sessionStorage.getItem('hasSeenLotePromocional');
            if (!hasSeenPopup) {
                setIsOpen(true);
                setShouldRender(true);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => setShouldRender(false), 300);
        sessionStorage.setItem('hasSeenLotePromocional', 'true');
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

            <Card className={`relative max-w-lg w-full max-h-[90vh] overflow-y-auto bg-dark-200 border-brand-orange-coral/40 shadow-[0_0_50px_-12px_rgba(255,112,67,0.3)] transition-all duration-500 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'} scrollbar-hide`}>

                {/* Efeitos de Background */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-orange-coral via-brand-orange-gradient to-brand-orange-intense sticky top-0 z-30" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange-coral/10 blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-orange-intense/10 blur-[60px] rounded-full pointer-events-none" />

                {/* Botão Fechar Fixo - Garantindo Visibilidade */}
                <div className="sticky top-0 right-0 z-40 flex justify-end p-2 pointer-events-none">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                        }}
                        className="pointer-events-auto p-2 text-white bg-brand-orange-coral rounded-full shadow-lg hover:bg-brand-orange-intense transition-all"
                        aria-label="Fechar"
                    >
                        <X className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </div>

                <div className="p-6 sm:p-10 pt-0 sm:pt-0 relative z-10">
                    {/* Badge Animada */}
                    <div className="flex justify-center mb-6 sm:mb-8">
                        <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1.5 text-[10px] sm:text-xs font-black tracking-[0.2em] animate-pulse uppercase">
                            <Sparkles className="h-3 w-3 mr-2 text-brand-orange-coral" />
                            Oportunidade Única
                        </Badge>
                    </div>

                    <div className="text-center mb-8">
                        <div className="relative inline-flex mb-6 sm:mb-8 group">
                            <div className="absolute inset-0 bg-brand-orange-coral/20 blur-xl rounded-full group-hover:bg-brand-orange-coral/30 transition-all duration-500 scale-150" />
                            <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-brand-orange-coral/20 to-brand-orange-intense/10 border border-brand-orange-coral/30 flex items-center justify-center backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-500">
                                <Gift className="h-10 w-10 sm:h-14 sm:w-14 text-brand-orange-coral" />

                                {/* Badge Flutuante 3x2 */}
                                <div className="absolute -top-1 -right-1 sm:top-0 sm:right-0 w-9 h-9 sm:w-11 sm:h-11 bg-white text-brand-orange-coral font-black rounded-full flex flex-col items-center justify-center border-4 border-brand-orange-coral shadow-xl transform rotate-12 group-hover:rotate-0 transition-all duration-500">
                                    <span className="text-[8px] sm:text-[10px] leading-none">LEVE</span>
                                    <span className="text-xs sm:text-base leading-none">3</span>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl sm:text-4xl font-black text-white mb-4 leading-none tracking-tighter uppercase italic">
                            Compre 2<br />
                            <span className="text-gradient drop-shadow-sm">GanhE 3!</span>
                        </h2>

                        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
                            <Star className="h-4 w-4 text-brand-orange-coral fill-brand-orange-coral" />
                            <p className="text-gray-300 font-medium text-xs sm:text-base uppercase tracking-widest">Lote Promocional</p>
                            <Star className="h-4 w-4 text-brand-orange-coral fill-brand-orange-coral" />
                        </div>

                        <p className="text-gray-400 text-sm sm:text-lg leading-relaxed max-w-sm mx-auto">
                            Reúna sua equipe e economize. O terceiro ingresso é um <span className="text-white font-bold border-b-2 border-brand-orange-coral/50">investimento nosso</span> no seu time.
                        </p>
                    </div>

                    {/* Vantagens com visual de Checklist Premium */}
                    <div className="grid gap-3 sm:gap-4 mb-8 sm:mb-10 max-w-xs mx-auto">
                        {[
                            'Acesso VIP a todas as palestras',
                            'Networking estratégico',
                            'Certificado premium incluso',
                            'Suporte prioritário na compra'
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-4 text-[10px] sm:text-sm text-gray-300 group/item">
                                <div className="w-5 h-5 rounded-lg bg-brand-orange-coral/10 border border-brand-orange-coral/20 flex items-center justify-center flex-shrink-0 group-hover/item:bg-brand-orange-coral group-hover/item:border-brand-orange-coral transition-all duration-300">
                                    <ArrowRight className="h-2.5 w-2.5 text-brand-orange-coral group-hover/item:text-white transition-colors" />
                                </div>
                                <span className="group-hover/item:text-white transition-colors">{text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Ação Principal - Gigante e Vibrante */}
                    <div className="grid gap-4">
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleWhatsApp();
                            }}
                            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-4 sm:py-6 rounded-2xl shadow-[0_0_30px_-5px_rgba(37,211,102,0.4)] hover:shadow-[0_0_40px_-5px_rgba(37,211,102,0.6)] group transition-all h-auto text-base sm:text-xl flex items-center justify-center gap-4 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform duration-300" />

                            <div className="relative z-10 flex items-center gap-3">
                                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
                                <span>GARANTIR 3x2</span>
                            </div>
                            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-2 relative z-10" />
                        </Button>

                        <div className="flex items-center justify-center gap-2 text-brand-orange-coral animate-pulse">
                            <Zap className="h-3 w-3 fill-current" />
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em]">Últimas vagas disponíveis</span>
                        </div>
                    </div>

                    <p className="text-center text-[9px] sm:text-[11px] text-gray-500 mt-6 font-medium">
                        *Oferta exclusiva para compras coletivas. Termos e condições se aplicam.
                    </p>
                </div>
            </Card>
        </div>
    );
}
