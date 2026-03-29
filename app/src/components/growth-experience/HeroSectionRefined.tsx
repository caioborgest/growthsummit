import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProject } from '@/contexts/ProjectContext';
import { getStorageUrl } from '@/lib/storage';
import type { Project } from '@/types';

interface HeroSectionProps {
    onCTAClick: () => void;
    project?: Project;
}

export function HeroSectionRefined({ onCTAClick, project: propProject }: HeroSectionProps) {
    const { selectedProject: contextProject } = useProject();
    const selectedProject = propProject || contextProject;
    const isTriunfo = selectedProject?.slug === 'ge-triunfo-2026' || (typeof window !== 'undefined' && window.location.pathname.includes('triunfo'));
    const isPetrolina = selectedProject?.slug === 'ge-petrolina-2026' || (typeof window !== 'undefined' && window.location.pathname.includes('petrolina'));
    const [timeLeft, setTimeLeft] = useState({
        dias: 0,
        horas: 0,
        minutos: 0,
        segundos: 0
    });

    // Contador regressivo
    useEffect(() => {
        const dateStr = isTriunfo ? '2026-04-16' : (selectedProject?.startDate || '');
        if (!dateStr) return;
        const eventDate = new Date(`${dateStr}T${isTriunfo ? '17:00:00' : '23:00:00'}`);

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = eventDate.getTime() - now;

            if (distance > 0) {
                setTimeLeft({
                    dias: Math.ceil(distance / (1000 * 60 * 60 * 24)),
                    horas: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutos: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    segundos: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [selectedProject?.startDate, selectedProject?.slug, isTriunfo]);

    return (
        <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-brand-black">
            {/* Background Image with Enhanced Overlay */}
            <div className="absolute inset-0 z-0">
                {isTriunfo && (
                    <div className="relative w-full h-full">
                        <img
                            src={getStorageUrl('caretas-triunfo', 'caretas-triunfo.jpeg', { quality: 80, format: 'webp' })}
                            alt="Triunfo-PE"
                            className="w-full h-full object-cover object-center scale-110 animate-slow-zoom opacity-40 sm:opacity-60"
                            //@ts-ignore
                            fetchPriority="high"
                        />
                    </div>
                )}

                {isPetrolina && (
                    <div className="relative w-full h-full">
                        <img
                            src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/caretas-triunfo/petrolina.jpeg"
                            alt="Petrolina-PE"
                            className="w-full h-full object-cover object-center scale-110 animate-slow-zoom opacity-40 sm:opacity-60"
                            //@ts-ignore
                            fetchPriority="high"
                        />
                    </div>
                )}

                {!isTriunfo && !isPetrolina && (
                    <div className="relative w-full h-full bg-brand-black">
                        <img
                            src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/espaco/gxexperience-noite.png"
                            alt="Growth Experience"
                            className="w-full h-full object-cover object-center scale-110 animate-slow-zoom opacity-30 sm:opacity-40"
                            //@ts-ignore
                            fetchPriority="high"
                        />
                    </div>
                )}

                {/* Layered Gradients for Depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-transparent to-brand-black opacity-80" />
                <div className={`absolute inset-0 bg-gradient-to-r ${isPetrolina ? 'from-dark via-dark/40 to-dark' : 'from-brand-black via-brand-black/40 to-brand-black'} opacity-90`} />

                {/* Animated Mesh Gradients */}
                <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                    <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ${isPetrolina ? 'bg-teal-500/20' : 'bg-brand-orange-coral/30'} blur-[120px] rounded-full animate-pulse-slow`} />
                    <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] ${isPetrolina ? 'bg-teal-400/10' : 'bg-brand-orange-intense/20'} blur-[120px] rounded-full animate-pulse-slow-reverse`} />
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-10 w-2 h-2 bg-brand-orange-coral rounded-full animate-ping opacity-20" />
                <div className="absolute top-1/3 right-12 w-3 h-3 bg-brand-orange-gradient rounded-full animate-ping opacity-10" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-20" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 sm:pt-40 sm:pb-24 lg:pt-48 lg:pb-32 flex flex-col items-center text-center">

                {/* Premium Location Badge */}
                <div
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 mb-8 sm:mb-12 animate-fade-in-up backdrop-blur-md shadow-2xl"
                    style={{ animationDelay: '0.1s' }}
                >
                    <div className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange-coral opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange-coral"></span>
                    </div>
                    <span className="text-white font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em]">
                        {selectedProject?.city}-{selectedProject?.state || 'PE'} • PRESENCIAL
                    </span>
                </div>

                {/* Main Hero Header */}
                <div className="max-w-5xl mb-10 sm:mb-16">
                    <h1
                        className="text-4xl sm:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tighter animate-fade-in-up mb-4 sm:mb-6"
                        style={{ animationDelay: '0.2s' }}
                    >
                        <span className="block opacity-80 text-lg sm:text-3xl lg:text-4xl uppercase tracking-[0.2em] sm:tracking-[0.3em] font-medium mb-2 sm:mb-4">
                            Growth Experience
                        </span>
                        <span className={`bg-gradient-to-r ${isPetrolina ? 'from-teal-400 to-teal-600' : 'from-brand-orange-coral via-brand-orange-gradient to-brand-orange-intense'} bg-clip-text text-transparent drop-shadow-sm`}>
                            {selectedProject?.city} {selectedProject?.startDate ? new Date(selectedProject.startDate + 'T00:00:00').getFullYear() : '2026'}
                        </span>
                    </h1>

                    <p
                        className="text-balance sm:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto animate-fade-in-up leading-relaxed px-4 sm:px-0"
                        style={{ animationDelay: '0.3s' }}
                    >
                        O maior encontro de inteligência de negócios do {isTriunfo ? 'Sertão do Pajeú' : 'Vale do São Francisco'}.
                        <span className="hidden sm:inline"> Prepare-se para uma imersão total em estratégias de escala e networking de alto nível.</span>
                    </p>
                </div>

                {/* Refined Countdown Section */}
                <div
                    className="w-full max-w-2xl mb-12 sm:mb-16 animate-fade-in-up"
                    style={{ animationDelay: '0.4s' }}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-white/5 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white/5 backdrop-blur-xl shadow-inner-glow relative">
                        {/* Decorative glow behind countdown */}
                        <div className={`absolute inset-0 ${isPetrolina ? 'bg-teal-500/5' : 'bg-brand-orange-coral/5'} rounded-inherit blur-xl -z-10 group-hover:bg-brand-orange-coral/10 transition-colors`} />

                        {[
                            { label: 'Dias', value: timeLeft.dias },
                            { label: 'Horas', value: timeLeft.horas },
                            { label: 'Min', value: timeLeft.minutos },
                            { label: 'Seg', value: timeLeft.segundos }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/5 transition-colors group">
                                <div className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tabular-nums tracking-tighter mb-1 sm:mb-2 flex items-center justify-center h-14 sm:h-20 group-hover:scale-110 transition-transform">
                                    {String(item.value).padStart(2, '0')}
                                </div>
                                <div className="text-[11px] sm:text-xs text-gray-500 group-hover:text-brand-orange-coral uppercase tracking-[0.2em] font-bold transition-colors">
                                    {item.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Refined Event Data Info */}
                <div
                    className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-12 animate-fade-in-up"
                    style={{ animationDelay: '0.5s' }}
                >
                    {[
                        { icon: Calendar, text: isTriunfo ? '16 Abr 2026' : (selectedProject?.startDate ? new Date(selectedProject.startDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : 'Data a definir') },
                        { icon: Clock, text: isTriunfo ? '17:00 - 22:30' : '08:00 - 23:00' },
                        { icon: MapPin, text: selectedProject?.city || 'Espaço Parque' }
                    ].map((info, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 group">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-${isPetrolina ? 'teal-500' : 'brand-orange-coral'}/10 group-hover:border-${isPetrolina ? 'teal-400' : 'brand-orange-coral'}/30 transition-all`}>
                                <info.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isPetrolina ? 'text-teal-400' : 'text-brand-orange-gradient'}`} />
                            </div>
                            <span className="text-white/80 font-bold text-sm sm:text-base group-hover:text-white transition-colors">
                                {info.text}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Optimized CTAs */}
                <div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto animate-fade-in-up"
                    style={{ animationDelay: '0.6s' }}
                >
                    <Button
                        size="lg"
                        onClick={onCTAClick}
                        className={`w-full sm:w-auto h-auto px-8 sm:px-12 py-5 sm:py-7 ${isPetrolina ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/30' : 'bg-brand-orange-coral hover:bg-brand-orange-intense shadow-brand-orange-coral/30'} text-white rounded-2xl sm:rounded-3xl text-lg sm:text-xl font-black shadow-[0_20px_50px_rgba(255,112,67,0.3)] hover:shadow-[0_20px_50px_rgba(255,112,67,0.5)] hover:-translate-y-1 transition-all duration-300 group`}
                    >
                        Garantir Minha Vaga
                        <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <Button
                        size="lg"
                        variant="ghost"
                        className="w-full sm:w-auto h-auto px-8 sm:px-12 py-5 sm:py-7 border-2 border-white/10 hover:border-white/20 text-white rounded-2xl sm:rounded-3xl text-lg sm:text-xl font-bold backdrop-blur-sm transition-all"
                        onClick={() => {
                            document.getElementById('programacao')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        Ver Programação
                    </Button>
                </div>

                {/* Scarcity Badge */}
                <div
                    className="mt-10 sm:mt-12 animate-fade-in-up"
                    style={{ animationDelay: '0.7s' }}
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-brand-orange-intense/10 border border-brand-orange-intense/20 text-brand-orange-intense font-black text-xs sm:text-sm tracking-widest uppercase animate-pulse">
                        <Sparkles className="h-4 w-4" />
                        Capacidade Limitada: {isTriunfo ? '300' : '500'} Ingressos
                    </div>
                </div>
            </div>

            {/* Premium Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-3 animate-fade-in" style={{ animationDelay: '1s' }}>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 rotate-180 [writing-mode:vertical-lr]">Scroll</span>
                <div className={`w-[1px] h-12 bg-gradient-to-b ${isPetrolina ? 'from-teal-400' : 'from-brand-orange-coral'} to-transparent animate-shimmer-v`} />
            </div>

            {/* Custom Animations to be added to index.css or local style */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slow-zoom {
                    0% { transform: scale(1.1); }
                    100% { transform: scale(1.2); }
                }
                @keyframes shimmer-v {
                    0% { transform: translateY(-100%); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(100%); opacity: 0; }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.1); }
                }
                .animate-slow-zoom { animation: slow-zoom 20s linear infinite alternate; }
                .animate-shimmer-v { animation: shimmer-v 2s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
                .animate-pulse-slow-reverse { animation: pulse-slow 10s ease-in-out infinite reverse; }
                .shadow-inner-glow { box-shadow: inset 0 0 40px rgba(255,112,67,0.05); }
                .rounded-inherit { border-radius: inherit; }
            ` }} />
        </section>
    );
}
