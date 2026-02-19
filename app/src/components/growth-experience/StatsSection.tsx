import { Users, Building2, Handshake, TrendingUp, Target, Award } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface StatItemProps {
    icon: React.ElementType;
    value: number;
    label: string;
    suffix?: string;
    delay?: number;
}

function StatItem({ icon: Icon, value, label, suffix = '+', delay = 0 }: StatItemProps) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const duration = 2000; // 2 segundos
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [isVisible, value]);

    return (
        <div
            ref={ref}
            className="group relative p-8 glass-card border-brand-orange-coral/10 hover:border-brand-orange-coral/30 transition-all duration-300 hover:scale-105 hover:shadow-glow"
            style={{ animationDelay: `${delay}s` }}
        >
            {/* Ícone de fundo */}
            <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="h-24 w-24 text-brand-orange-coral" />
            </div>

            {/* Conteúdo */}
            <div className="relative z-10">
                {/* Ícone */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-orange-coral/20 to-brand-orange-gradient/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7 text-brand-orange-coral" />
                </div>

                {/* Valor */}
                <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-br from-brand-orange-coral via-brand-orange-gradient to-brand-orange-intense bg-clip-text text-transparent mb-2">
                    {count}{suffix}
                </div>

                {/* Label */}
                <div className="text-gray-400 font-semibold text-sm lg:text-base uppercase tracking-wider">
                    {label}
                </div>

                {/* Linha decorativa */}
                <div className="mt-4 h-1 w-12 bg-gradient-to-r from-brand-orange-coral to-transparent rounded-full group-hover:w-full transition-all duration-500" />
            </div>
        </div>
    );
}

export function StatsSection() {
    const stats = [
        {
            icon: Users,
            value: 2000,
            label: 'Participantes',
            suffix: '+'
        },
        {
            icon: Building2,
            value: 25,
            label: 'Empresas Expositoras',
            suffix: '+'
        },
        {
            icon: Target,
            value: 20,
            label: 'Workshops e Cursos',
            suffix: '+'
        },
        {
            icon: Handshake,
            value: 10,
            label: 'Milhões em Negócios',
            suffix: 'M+'
        },
        {
            icon: TrendingUp,
            value: 10,
            label: 'Experiências Únicas',
            suffix: '+'
        },
        {
            icon: Award,
            value: 2000,
            label: 'Prêmios Arena Pitch',
            suffix: 'R$+'
        }
    ];

    return (
        <section className="relative py-24 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-dark-100 to-brand-black" />

            {/* Padrão de fundo */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `
            linear-gradient(90deg, rgba(255, 112, 67, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(255, 112, 67, 0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '100px 100px'
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-coral/10 border border-brand-orange-coral/30 mb-6 backdrop-blur-sm">
                        <TrendingUp className="h-4 w-4 text-brand-orange-coral" />
                        <span className="text-brand-orange-coral font-semibold text-sm">
                            Números do Evento
                        </span>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                        Um Evento de{' '}
                        <span className="bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient bg-clip-text text-transparent">
                            Grande Impacto
                        </span>
                    </h2>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Conectando empreendedores, investidores e inovadores em um único lugar
                    </p>
                </div>

                {/* Grid de stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                    {stats.map((stat, index) => (
                        <StatItem
                            key={index}
                            icon={stat.icon}
                            value={stat.value}
                            label={stat.label}
                            suffix={stat.suffix}
                            delay={index * 0.1}
                        />
                    ))}
                </div>

                {/* CTA adicional */}
                <div className="mt-16 text-center">
                    <p className="text-gray-400 mb-4">
                        Faça parte dessa transformação
                    </p>
                    <div className="inline-flex items-center gap-2 text-brand-orange-coral font-semibold">
                        <span>Inscrições abertas</span>
                        <div className="w-2 h-2 rounded-full bg-brand-orange-coral animate-pulse" />
                    </div>
                </div>
            </div>
        </section>
    );
}
