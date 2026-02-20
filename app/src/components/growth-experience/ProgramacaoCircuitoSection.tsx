import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { ProgramacaoTabs } from './ProgramacaoTabs';
import {
    circuitoExperienciasData,
    momentosAncoraData,
    programacaoManhaData,
    programacaoNoturnaData,
    programacaoTardeData
} from '@/data/programacaoCircuito';

interface ProgramacaoCircuitoSectionProps {
    onInscricao?: () => void;
}

export function ProgramacaoCircuitoSection({ onInscricao }: ProgramacaoCircuitoSectionProps) {
    return (
        <section id="programacao" className="py-24 bg-dark relative overflow-hidden">
            {/* Background Decorativo */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop')] opacity-5 bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/95 to-dark" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <Badge className="mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
                        <BookOpen className="h-3 w-3 mr-2" />
                        PROGRAMAÇÃO EXCLUSIVA
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Circuito de<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient">
                            Experiências Growth
                        </span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-4">
                        Um formato inovador com estações temáticas, consultorias rápidas e muito networking.
                        Participe de múltiplas atividades e acelere seu aprendizado.
                    </p>
                </div>

                <ProgramacaoTabs
                    programacaoManha={programacaoManhaData as any}
                    programacaoTarde={programacaoTardeData as any}
                    programacaoNoturna={programacaoNoturnaData}
                    circuitoExperiencias={circuitoExperienciasData}
                    momentosAncora={momentosAncoraData}
                    onInscricao={onInscricao}
                />
            </div>
        </section>
    );
}
