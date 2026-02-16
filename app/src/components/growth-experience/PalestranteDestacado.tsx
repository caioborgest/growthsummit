import { Clock, Star, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { placeholderPalestrante } from '@/lib/storage';

interface PalestranteDestacadoProps {
    nome: string;
    cargo: string;
    descricao: string;
    tema: string;
    horario: string;
    foto?: string;
    onInscrever?: () => void;
}

export function PalestranteDestacado({
    nome,
    cargo,
    descricao,
    tema,
    horario,
    foto,
    onInscrever
}: PalestranteDestacadoProps) {
    return (
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-100 via-dark-200 to-dark-100 border border-brand-orange-coral/30 hover:border-brand-orange-coral transition-all duration-500 hover:scale-[1.02]">
            {/* Background pattern */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255, 112, 67, 0.3) 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}
            />

            <div className="relative grid md:grid-cols-2 gap-8 p-8">
                {/* Imagem */}
                <div className="relative">
                    {/* Badge de destaque */}
                    <Badge className="absolute top-4 left-4 z-10 bg-brand-orange-intense text-white border-none px-4 py-2 text-sm font-bold shadow-lg">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        Palestrante Destaque
                    </Badge>

                    {/* Badge de horário */}
                    <Badge className="absolute top-4 right-4 z-10 bg-brand-orange-coral/90 text-white border-none backdrop-blur-sm px-4 py-2 text-sm font-semibold shadow-lg">
                        <Clock className="h-4 w-4 mr-1" />
                        {horario}
                    </Badge>

                    {/* Container da imagem */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                        <img
                            src={foto || placeholderPalestrante}
                            alt={nome}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                                e.currentTarget.src = placeholderPalestrante;
                            }}
                        />

                        {/* Overlay gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/50 to-transparent opacity-60" />

                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-glow-orange" />
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="flex flex-col justify-center space-y-6">
                    {/* Nome */}
                    <div>
                        <h3 className="text-4xl lg:text-5xl font-bold text-white mb-3 group-hover:text-brand-orange-coral transition-colors">
                            {nome}
                        </h3>

                        {/* Linha decorativa */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-1 w-16 bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient rounded-full" />
                            <p className="text-brand-orange-coral font-bold text-lg">
                                {cargo}
                            </p>
                        </div>
                    </div>

                    {/* Descrição */}
                    <p className="text-gray-300 text-lg leading-relaxed">
                        {descricao}
                    </p>

                    {/* Tema da palestra */}
                    <div className="glass-card p-6 border-brand-orange-coral/20 bg-brand-orange-coral/5">
                        <p className="text-xs text-brand-orange-coral font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
                            <Star className="h-3 w-3" />
                            Tema da Palestra
                        </p>
                        <p className="text-white text-xl font-semibold leading-tight">
                            {tema}
                        </p>
                    </div>

                    {/* CTA */}
                    {onInscrever && (
                        <Button
                            onClick={onInscrever}
                            size="lg"
                            className="bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:from-brand-orange-intense hover:to-brand-orange-coral text-white font-bold shadow-glow-orange hover:shadow-glow hover:scale-105 transition-all duration-300"
                        >
                            Garantir Minha Vaga
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    )}

                    {/* Info adicional */}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-brand-orange-coral" />
                            <span>Duração: 50 minutos</span>
                        </div>
                        <div className="h-4 w-px bg-white/20" />
                        <span>Vagas Limitadas</span>
                    </div>
                </div>
            </div>

            {/* Borda com glow effect */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-brand-orange-coral/50 transition-all duration-300 pointer-events-none" />
        </div>
    );
}
