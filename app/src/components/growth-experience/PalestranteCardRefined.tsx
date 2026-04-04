import { Clock, Award, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { placeholderPalestrante } from '@/lib/storage';

interface PalestranteCardProps {
    nome: string;
    role_title: string;
    descricao: string;
    tema: string;
    horario: string;
    foto?: string;
    destaque?: boolean;
    onInscricao?: () => void;
}

export function PalestranteCardRefined({
    nome,
    role_title,
    descricao,
    tema,
    horario,
    foto,
    destaque = false,
    onInscricao
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
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        e.currentTarget.src = placeholderPalestrante;
                    }}
                />

                {/* Overlay gradiente - Sempre visível para legibilidade do texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-dark-100/80 sm:via-brand-black/90 to-transparent opacity-100 transition-opacity duration-300" />

                {/* Badge de destaque */}
                {destaque && (
                    <Badge className="absolute top-4 left-4 bg-brand-orange-intense/90 text-white border-none backdrop-blur-sm px-2 py-0.5 text-[10px] sm:text-xs font-bold">
                        <Award className="h-3 w-3 mr-1" />
                        Destaque
                    </Badge>
                )}

                {/* Badge de horário */}
                <Badge className="absolute top-4 right-4 bg-brand-orange-coral/90 text-white border-none backdrop-blur-sm px-2 py-0.5 text-[10px] sm:text-xs font-semibold">
                    <Clock className="h-3 w-3 mr-1" />
                    {horario}
                </Badge>

                {/* Conteúdo sobre a imagem - Padding reduzido no mobile */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 transition-transform duration-300">
                    {/* Nome */}
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1 group-hover:text-brand-orange-coral transition-colors leading-none">
                        {nome}
                    </h3>

                    {/* Cargo */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-0.5 w-6 bg-brand-orange-coral rounded-full" />
                        <p className="text-brand-orange-coral font-bold text-[11px] sm:text-sm lg:text-base uppercase tracking-wider">
                            {role_title}
                        </p>
                    </div>

                    {/* Descrição - Mais compacta no mobile */}
                    <p className="text-gray-300 text-xs sm:text-sm lg:text-base mb-4 line-clamp-2 md:line-clamp-none transition-all font-medium">
                        {descricao}
                    </p>

                    {/* Tema da palestra - Sempre visível */}
                    <div className="glass-card p-3 sm:p-4 border-brand-orange-coral/20 mb-4 transition-all duration-300">
                        <p className="text-[10px] text-brand-orange-coral font-bold mb-1 uppercase tracking-[0.15em]">
                            Tema da Palestra
                        </p>
                        <p className="text-white text-xs sm:text-sm font-semibold leading-tight">
                            {tema}
                        </p>
                    </div>

                    {/* Botão de ação - Sempre visível */}
                    <Button
                        variant="default"
                        size="sm"
                        onClick={onInscricao}
                        className="w-full bg-brand-orange-coral hover:bg-brand-orange-intense text-white transition-all duration-300 text-[10px] sm:text-sm font-black uppercase tracking-widest h-9 sm:h-12 shadow-glow-orange"
                    >
                        Garantir Minha Vaga
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
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
