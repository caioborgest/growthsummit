import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Building2, Users, MapPin, Sparkles } from 'lucide-react';

interface PatrocinioCardProps {
    nome: string;
    espaco: string;
    ingressos: number;
    beneficios: string[];
    vagas: number;
    destaque?: boolean;
    imagemUrl?: string;
    onContato: () => void;
}

export function PatrocinioCard({
    nome,
    espaco,
    ingressos,
    beneficios,
    vagas,
    destaque = false,
    imagemUrl,
    onContato
}: PatrocinioCardProps) {
    const getNivelCor = (nivel: string) => {
        switch (nivel.toUpperCase()) {
            case 'DIAMANTE':
                return {
                    bg: 'from-cyan-500/20 to-blue-500/20',
                    border: 'border-cyan-500/50',
                    badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
                    icon: 'text-cyan-400'
                };
            case 'OURO':
                return {
                    bg: 'from-yellow-500/20 to-amber-500/20',
                    border: 'border-yellow-500/50',
                    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                    icon: 'text-yellow-400'
                };
            case 'PRATA PLUS':
            case 'PRATA':
                return {
                    bg: 'from-gray-400/20 to-gray-500/20',
                    border: 'border-gray-400/50',
                    badge: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
                    icon: 'text-gray-400'
                };
            case 'BRONZE':
                return {
                    bg: 'from-orange-700/20 to-orange-800/20',
                    border: 'border-orange-700/50',
                    badge: 'bg-orange-700/20 text-orange-400 border-orange-700/30',
                    icon: 'text-orange-400'
                };
            default:
                return {
                    bg: 'from-brand-blue/20 to-brand-orange-coral/20',
                    border: 'border-brand-orange-coral/50',
                    badge: 'bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30',
                    icon: 'text-brand-orange-coral'
                };
        }
    };

    const cores = getNivelCor(nome);

    return (
        <Card className={`glass-card p-6 sm:p-8 border-2 ${cores.border} hover:scale-105 transition-all duration-300 ${destaque ? 'ring-2 ring-brand-orange-coral ring-offset-2 ring-offset-dark' : ''} relative overflow-hidden group`}>
            {/* Efeito de brilho no hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${cores.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            {/* Conteúdo */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                        <Badge className={`${cores.badge} text-lg px-4 py-2 mb-3 font-bold`}>
                            {nome}
                        </Badge>
                        {destaque && (
                            <div className="flex items-center gap-2 mt-2">
                                <Sparkles className="h-4 w-4 text-brand-orange-coral animate-pulse" />
                                <span className="text-brand-orange-coral text-sm font-semibold">Mais Procurado</span>
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 text-sm mb-1">Vagas Disponíveis</p>
                        <p className={`text-3xl font-bold ${cores.icon}`}>{vagas}</p>
                    </div>
                </div>

                {/* Imagem do Stand */}
                {imagemUrl && (
                    <div className="mb-6 rounded-lg overflow-hidden border border-white/10">
                        <img
                            src={imagemUrl}
                            alt={`Stand ${nome}`}
                            className="w-full h-48 object-cover"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect fill="%23374151" width="400" height="200"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EStand ' + nome + '%3C/text%3E%3C/svg%3E';
                            }}
                        />
                    </div>
                )}

                {/* Informações do Espaço */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-300">
                        <MapPin className={`h-5 w-5 ${cores.icon}`} />
                        <div>
                            <p className="text-xs text-gray-400">Espaço</p>
                            <p className="font-semibold">{espaco}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                        <Users className={`h-5 w-5 ${cores.icon}`} />
                        <div>
                            <p className="text-xs text-gray-400">Ingressos Palestra Noturna</p>
                            <p className="font-semibold">{ingressos} ingressos inclusos</p>
                        </div>
                    </div>
                </div>

                {/* Benefícios */}
                <div className="mb-6">
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                        <CheckCircle className={`h-5 w-5 ${cores.icon}`} />
                        Benefícios Inclusos:
                    </h4>
                    <ul className="space-y-2">
                        {beneficios.map((beneficio, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                                <CheckCircle className={`h-4 w-4 ${cores.icon} flex-shrink-0 mt-0.5`} />
                                <span>{beneficio}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CTA */}
                <Button
                    className={`w-full bg-gradient-to-r ${cores.bg} hover:opacity-90 text-white font-bold py-6 rounded-xl border ${cores.border} group`}
                    onClick={onContato}
                >
                    <Building2 className="h-5 w-5 mr-2" />
                    Solicitar Proposta Comercial
                </Button>

                {vagas <= 3 && (
                    <p className="text-center text-red-400 text-sm mt-3 font-semibold animate-pulse">
                        ⚠️ Últimas {vagas} vagas disponíveis!
                    </p>
                )}
            </div>
        </Card>
    );
}
