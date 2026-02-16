import { Clock, Award, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { placeholderPalestrante } from '@/lib/storage';

interface PalestranteCardProps {
    nome: string;
    cargo: string;
    descricao: string;
    tema: string;
    horario: string;
    foto?: string;
    destaque?: boolean;
}

export function PalestranteCardRefined({
    nome,
    cargo,
    descricao,
    tema,
    horario,
    foto,
    destaque = false
}: PalestranteCardProps) {
    return (
        <div
            className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02]"
            style={{
                animationDelay: '0.1s'
            }}
        >
            {/* Container da imagem */}
            <div className="relative aspect-[3/4] overflow-hidden bg-dark-200">
                {/* Imagem */}
                <img
                    src={foto || placeholderPalestrante}
                    alt={nome}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                        e.currentTarget.src = placeholderPalestrante;
                    }}
                />

                {/* Overlay gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

                {/* Badge de destaque */}
                {destaque && (
                    <Badge className="absolute top-4 left-4 bg-brand-orange-intense/90 text-white border-none backdrop-blur-sm px-3 py-1 font-bold">
                        <Award className="h-3 w-3 mr-1" />
                        Destaque
                    </Badge>
                )}

                {/* Badge de horário */}
                <Badge className="absolute top-4 right-4 bg-brand-orange-coral/90 text-white border-none backdrop-blur-sm px-3 py-1 font-semibold">
                    <Clock className="h-3 w-3 mr-1" />
                    {horario}
                </Badge>

                {/* Conteúdo sobre a imagem */}
                <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-300 group-hover:translate-y-0">
                    {/* Nome */}
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 group-hover:text-brand-orange-coral transition-colors">
                        {nome}
                    </h3>

                    {/* Cargo */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-1 w-8 bg-brand-orange-coral rounded-full" />
                        <p className="text-brand-orange-coral font-semibold text-sm lg:text-base">
                            {cargo}
                        </p>
                    </div>

                    {/* Descrição */}
                    <p className="text-gray-300 text-sm lg:text-base mb-4 line-clamp-2 group-hover:line-clamp-none transition-all">
                        {descricao}
                    </p>

                    {/* Tema da palestra */}
                    <div className="glass-card p-4 border-brand-orange-coral/20 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs text-brand-orange-coral font-semibold mb-1 uppercase tracking-wider">
                            Tema da Palestra
                        </p>
                        <p className="text-white text-sm font-medium">
                            {tema}
                        </p>
                    </div>

                    {/* Botão de ação */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-brand-orange-coral text-brand-orange-coral hover:bg-brand-orange-coral hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                    >
                        Ver Mais Detalhes
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Borda com glow effect no hover */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-brand-orange-coral/50 transition-all duration-300 pointer-events-none" />

            {/* Shadow glow no hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-glow-orange" />
        </div>
    );
}
