import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Zap, Trophy, Briefcase, GraduationCap, Landmark } from 'lucide-react';
import { ProgramacaoTabs, type Estacao } from './ProgramacaoTabs';
import { useProgramacaoTriunfo } from '@/hooks/useProgramacaoTriunfo';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRegistrations } from '@/hooks/useData';

interface ProgramacaoCircuitoSectionProps {
    onInscricao?: () => void;
}

const getIcon = (nome: string) => {
    const n = nome.toLowerCase();
    if (n.includes('sebrae') || n.includes('negócio') || n.includes('consultório')) return Briefcase;
    if (n.includes('digital') || n.includes('instagram') || n.includes('ia') || n.includes('growth')) return Zap;
    if (n.includes('venda')) return Trophy;
    if (n.includes('senac') || n.includes('carreira')) return GraduationCap;
    if (n.includes('sicoob') || n.includes('dinheiro')) return Landmark;
    return Briefcase;
};


export function ProgramacaoCircuitoSection({ onInscricao }: ProgramacaoCircuitoSectionProps) {
    const { user } = useAuth();
    const { data: registrations } = useRegistrations();
    const { programacao, isLoading } = useProgramacaoTriunfo();
    const { selectedProject } = useProject();

    const hasNightAccess = useMemo(() => {
        if (!user || !registrations || !selectedProject) return false;
        const currentReg = (registrations || []).find(r => r.projectId === selectedProject.id);
        // O acesso à noite é confirmado se a inscrição existe, o pagamento está confirmado e o campo palestrasNoturnas é true
        const isConfirmed = currentReg?.status === 'confirmed' || currentReg?.status === 'paid' || currentReg?.status === 'pago' || currentReg?.status === 'ativo';
        return isConfirmed && currentReg?.palestrasNoturnas === true;
    }, [user, registrations, selectedProject]);

    const hasData = programacao && (
        programacao.programacaoNoturna.length > 0 ||
        programacao.circuitoExperiencias.length > 0 ||
        programacao.momentosAncora.manha.length > 0
    );

    const formattedCircuito = useMemo(() => {
        if (!programacao?.circuitoExperiencias) return [];
        return programacao.circuitoExperiencias.map(est => ({
            ...est,
            icon: getIcon(est.nome)
        })) as Estacao[];
    }, [programacao.circuitoExperiencias]);

    return (
        <section id="programacao" className="py-24 bg-dark relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop')] opacity-5 bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/95 to-dark" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <Badge className="mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
                        < BookOpen className="h-3 w-3 mr-2" />
                        PROGRAMAÇÃO EXCLUSIVA {hasData && !isLoading && <span className="ml-2">• ATUALIZADO</span>}
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

                {programacao && (
                    <ProgramacaoTabs
                        programacaoManha={programacao.programacaoManha}
                        programacaoTarde={programacao.programacaoTarde}
                        programacaoNoturna={programacao.programacaoNoturna}
                        circuitoExperiencias={formattedCircuito}
                        momentosAncora={programacao.momentosAncora}
                        onInscricao={onInscricao}
                        eventDate={selectedProject?.startDate}
                        allActivitiesWithTimes={programacao?.allActivitiesWithTimes}
                        hasNightAccess={hasNightAccess}
                        isLoading={isLoading}
                    />
                )}

                {!isLoading && !hasData && (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-gray-500 font-bold uppercase tracking-widest">Programação em breve</p>
                    </div>
                )}
            </div>
        </section>
    );
}
