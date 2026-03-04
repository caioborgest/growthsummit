import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProject } from '@/contexts/ProjectContext';
import type { Project } from '@/types';

interface HeroSectionProps {
    onCTAClick: () => void;
    project?: Project;
}

export function HeroSectionRefined({ onCTAClick, project: propProject }: HeroSectionProps) {
    const { selectedProject: contextProject } = useProject();
    const selectedProject = propProject || contextProject;
    const isTriunfo = selectedProject?.slug === 'ge-triunfo-2026' || (typeof window !== 'undefined' && window.location.pathname.includes('triunfo'));
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
        const eventDate = new Date(`${dateStr}T08:00:00`);

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
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                {/* A imagem de fundo é mantida para Triunfo e removida para Petrolina conforme solicitado */}
                {selectedProject?.slug !== 'ge-petrolina-2026' && (
                    <img
                        src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/caretas-triunfo/caretas-triunfo.png"
                        alt={selectedProject?.city || "Growth Experience"}
                        className="w-full h-full object-cover object-center scale-105"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-black/95 via-dark-100/90 to-brand-black/95" />
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(255, 112, 67, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 133, 73, 0.1) 0%, transparent 50%)
            `
                    }}
                />
            </div>

            {/* Padrão de pontos */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255, 112, 67, 0.3) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}
            />

            {/* Conteúdo */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    {/* Badge de destaque */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-coral/10 border border-brand-orange-coral/30 mb-8 animate-fade-in-up backdrop-blur-sm"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <Sparkles className="h-4 w-4 text-brand-orange-coral" />
                        <span className="text-brand-orange-coral font-semibold text-sm">
                            Evento Presencial • {selectedProject?.city}-{selectedProject?.state || 'PE'}
                        </span>
                    </div>

                    {/* TITLE REFINED FOR MOBILE */}
                    <h1
                        className="text-3xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up px-2"
                        style={{ animationDelay: '0.2s' }}
                    >
                        <span className="block mb-2 text-2xl sm:text-6xl lg:text-7xl uppercase tracking-tighter">Growth Experience</span>
                        <span className="bg-gradient-to-r from-brand-orange-coral via-brand-orange-gradient to-brand-orange-intense bg-clip-text text-transparent block sm:inline">
                            {selectedProject?.city}-{selectedProject?.state} {selectedProject?.startDate ? new Date(selectedProject.startDate + 'T00:00:00').getFullYear() : '2026'}
                        </span>
                    </h1>

                    {/* Subtítulo */}
                    <p
                        className="text-lg sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 animate-fade-in-up px-4"
                        style={{ animationDelay: '0.3s' }}
                    >
                        O maior evento de empreendedorismo do {selectedProject?.city === 'Triunfo' ? 'Sertão do Pajeú' : 'Vale do São Francisco'}.
                        <span className="block mt-2 text-brand-orange-coral font-bold text-base sm:text-xl">
                            Networking, Mentorias e Negócios
                        </span>
                    </p>

                    {/* Informações do evento */}
                    <div
                        className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 mb-12 animate-fade-in-up px-2"
                        style={{ animationDelay: '0.4s' }}
                    >
                        <div className="flex items-center gap-2 text-gray-300 bg-white/5 py-1.5 px-3 rounded-full border border-white/5">
                            <Calendar className="h-4 w-4 text-brand-orange-coral" />
                            <span className="font-semibold text-xs sm:text-sm">
                                {isTriunfo
                                    ? '16 abr 2026'
                                    : (selectedProject?.startDate
                                        ? new Date(selectedProject.startDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
                                        : 'Data a definir')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 bg-white/5 py-1.5 px-3 rounded-full border border-white/5">
                            <Clock className="h-4 w-4 text-brand-orange-coral" />
                            <span className="font-semibold text-xs sm:text-sm">08:00 - 23:00</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 bg-white/5 py-1.5 px-3 rounded-full border border-white/5">
                            <MapPin className="h-4 w-4 text-brand-orange-coral" />
                            <span className="font-semibold text-xs sm:text-sm truncate max-w-[150px]">{selectedProject?.city || 'Local a definir'}</span>
                        </div>
                    </div>
                </div>

                {/* Contador regressivo */}
                <div
                    className="max-w-2xl mx-auto mb-12 animate-fade-in-up"
                    style={{ animationDelay: '0.5s' }}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Dias', value: timeLeft.dias },
                            { label: 'Horas', value: timeLeft.horas },
                            { label: 'Min', value: timeLeft.minutos },
                            { label: 'Seg', value: timeLeft.segundos }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="glass-card p-4 sm:p-6 text-center border-brand-orange-coral/20 hover:border-brand-orange-coral/50 transition-all hover:scale-105"
                            >
                                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-brand-orange-coral to-brand-orange-gradient bg-clip-text text-transparent mb-2">
                                    {String(item.value).padStart(2, '0')}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">
                                    {item.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTAs */}
                <div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up px-4"
                    style={{ animationDelay: '0.6s' }}
                >
                    <Button
                        size="lg"
                        onClick={onCTAClick}
                        className="w-full sm:w-auto group bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:from-brand-orange-intense hover:to-brand-orange-coral text-white px-8 py-6 text-lg font-bold shadow-glow-orange hover:shadow-glow hover:scale-105 transition-all duration-300"
                    >
                        Garantir Minha Vaga
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto border-2 border-brand-orange-coral text-brand-orange-coral hover:bg-brand-orange-coral/10 px-8 py-6 text-lg font-bold hover:scale-105 transition-all duration-300"
                        onClick={() => {
                            document.getElementById('programacao')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        Ver Programação
                    </Button>
                </div>

                {/* Badge de vagas limitadas */}
                <div
                    className="mt-8 animate-fade-in-up text-center"
                    style={{ animationDelay: '0.7s' }}
                >
                    <Badge className="bg-brand-orange-intense/20 text-brand-orange-intense border-brand-orange-intense/30 px-4 py-2 text-sm font-semibold animate-pulse">
                        ⚡ Vagas Limitadas - Inscrições Abertas
                    </Badge>
                </div>
            </div>

            {/* Indicador de scroll */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 rounded-full border-2 border-brand-orange-coral/50 flex items-start justify-center p-2">
                    <div className="w-1 h-3 bg-brand-orange-coral rounded-full animate-pulse" />
                </div>
            </div>
        </section>
    );
}
