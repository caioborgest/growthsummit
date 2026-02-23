import { Badge } from '@/components/ui/badge';
import { BookOpen, Zap, Trophy } from 'lucide-react';
import { ProgramacaoTabs, type ProgramacaoDiurna, type ProgramacaoTarde, type Estacao, type MomentoAncora } from './ProgramacaoTabs';
import { useProgramacaoTriunfo } from '@/hooks/useProgramacaoTriunfo';
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

// Mapa de ícones para as estações (baseado no nome ou categoria)
const getIcon = (nome: string) => {
    const n = nome.toLowerCase();
    if (n.includes('sebrae') || n.includes('negócio') || n.includes('consultório')) return Briefcase;
    if (n.includes('digital') || n.includes('instagram') || n.includes('ia') || n.includes('growth')) return Zap;
    if (n.includes('venda')) return Trophy;
    if (n.includes('senac') || n.includes('carreira')) return GraduationCap;
    if (n.includes('sicoob') || n.includes('dinheiro')) return Landmark;
    return Briefcase;
};

// Import needed icons that might be used
import { Briefcase, GraduationCap, Landmark } from 'lucide-react';

export function ProgramacaoCircuitoSection({ onInscricao }: ProgramacaoCircuitoSectionProps) {
    const { programacao } = useProgramacaoTriunfo();

    // Se não houver dados no banco, usa os estáticos como fallback
    // Isso garante que a página não fique vazia enquanto o admin não preenche
    const hasData = programacao && (
        programacao.programacaoNoturna.length > 0 ||
        programacao.circuitoExperiencias.length > 0 ||
        programacao.momentosAncora.manha.length > 0
    );

    const finalData: {
        programacaoManha: ProgramacaoDiurna;
        programacaoTarde: ProgramacaoTarde;
        programacaoNoturna: { horario: string; atividade: string }[];
        circuitoExperiencias: Estacao[];
        momentosAncora: {
            manha: MomentoAncora[];
            tarde: MomentoAncora[];
        };
    } = hasData ? {
        ...programacao,
        circuitoExperiencias: programacao.circuitoExperiencias.map(est => ({
            ...est,
            icon: getIcon(est.nome)
        }))
    } : {
            programacaoManha: programacaoManhaData,
            programacaoTarde: programacaoTardeData,
            programacaoNoturna: programacaoNoturnaData,
            circuitoExperiencias: circuitoExperienciasData,
            momentosAncora: momentosAncoraData
        };

    return (
        <section id="programacao" className="py-24 bg-dark relative overflow-hidden">
            {/* Background Decorativo */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop')] opacity-5 bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/95 to-dark" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <Badge className="mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
                        <BookOpen className="h-3 w-3 mr-2" />
                        PROGRAMAÇÃO EXCLUSIVA {hasData && <span className="ml-2">• ATUALIZADO</span>}
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
                    programacaoManha={finalData.programacaoManha}
                    programacaoTarde={finalData.programacaoTarde}
                    programacaoNoturna={finalData.programacaoNoturna}
                    circuitoExperiencias={finalData.circuitoExperiencias}
                    momentosAncora={finalData.momentosAncora}
                    onInscricao={onInscricao}
                />
            </div>
        </section>
    );
}
