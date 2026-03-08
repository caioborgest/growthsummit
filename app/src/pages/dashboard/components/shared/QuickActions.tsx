import {
    Rocket,
    Handshake,
    Share2,
    Sparkles,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickActionsProps {
    onStartupClick: () => void;
    onB2BClick: () => void;
    onMentoriaClick?: () => void;
    showMentoria?: boolean;
}

export function QuickActions({
    onStartupClick,
    onB2BClick,
    onMentoriaClick,
    showMentoria = false
}: QuickActionsProps) {

    const handleShare = async () => {
        const shareData = {
            title: 'Growth Experience Triunfo 2026',
            text: 'Vem comigo para o maior evento de Growth e Negócios do Triunfo! 🚀',
            url: window.location.origin
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.origin);
                toast.success('Link copiado para a área de transferência!');
            }
        } catch (err) {
            console.error('Erro ao compartilhar:', err);
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {/* B2B Action */}
            <button
                onClick={onB2BClick}
                className="group relative flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-3xl overflow-hidden transition-all hover:bg-teal-500/10 hover:border-teal-500/30 hover:scale-[1.02] text-left"
            >
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center group-hover:rotate-6 transition-transform relative">
                    <Handshake className="h-6 w-6 text-teal-400 z-10" />
                    <div className="absolute inset-0 bg-teal-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div>
                    <h4 className="text-white font-black text-sm uppercase tracking-tight italic">Rodada Negócios</h4>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Matchmaking B2B</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-700 ml-auto group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Startup Action */}
            <button
                onClick={onStartupClick}
                className="group relative flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-3xl overflow-hidden transition-all hover:bg-orange-500/10 hover:border-orange-500/30 hover:scale-[1.02] text-left"
            >
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center group-hover:-rotate-6 transition-transform relative">
                    <Rocket className="h-6 w-6 text-orange-400 z-10" />
                    <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div>
                    <h4 className="text-white font-black text-sm uppercase tracking-tight italic">Expo StartUp</h4>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Inscrição Arena</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-700 ml-auto group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Mentoria Action (Optional) */}
            {showMentoria && onMentoriaClick && (
                <button
                    onClick={onMentoriaClick}
                    className="group relative flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-3xl overflow-hidden transition-all hover:bg-brand-orange-coral/10 hover:border-brand-orange-coral/30 hover:scale-[1.02] text-left"
                >
                    <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Sparkles className="h-6 w-6 text-brand-orange-coral" />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-tight italic">Mentoria VIP</h4>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Agendar Sessão</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-700 ml-auto group-hover:text-brand-orange-coral group-hover:translate-x-1 transition-all" />
                </button>
            )}

            {/* Share Action */}
            <button
                onClick={handleShare}
                className="group relative flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-3xl overflow-hidden transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] text-left"
            >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                    <Share2 className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h4 className="text-white font-black text-sm uppercase tracking-tight italic">Indicar Evento</h4>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Growth Experience</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-700 ml-auto group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
        </div>
    );
}
