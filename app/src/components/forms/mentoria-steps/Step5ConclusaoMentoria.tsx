import { useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Home, Smartphone, Mail, MessageCircle, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { DadosMentoria } from './mentoriaTypes';

interface Step5ConclusaoMentoriaProps {
    dados: DadosMentoria;
    onFechar: () => void;
}

export function Step5ConclusaoMentoria({ dados, onFechar }: Step5ConclusaoMentoriaProps) {
    const { selectedProject } = useProject();

    // Link do Grupo Oficial
    const GROUP_LINK = "https://chat.whatsapp.com/DupSWw5K4Ot4BKEjGG2Ndn";

    return (
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
            {/* Icon Sucesso */}
            <div className="relative w-24 h-24 mx-auto animate-float">
                <div className="absolute inset-0 bg-brand-orange-coral/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-full h-full bg-gradient-to-br from-brand-orange-coral to-brand-orange-gradient rounded-full flex items-center justify-center text-white shadow-xl shadow-brand-orange-coral/30">
                    <CheckCircle className="h-12 w-12" />
                </div>
            </div>

            {/* Título */}
            <div className="px-4">
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight tracking-tight">
                    Agendamento <span className="text-brand-orange-coral">Solicitado!</span>
                </h3>
                <p className="text-gray-400 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
                    Parabéns, <span className="text-white font-bold">{dados.nome}</span>! Sua solicitação de mentoria foi enviada com sucesso para o mentor.
                </p>
            </div>

            {/* Mentoria Info Card */}
            <Card className="glass-card p-6 border-teal-500/30 bg-teal-500/5 max-w-2xl mx-auto text-left relative overflow-hidden group">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-teal-500" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white uppercase italic">Sessão Programada</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-400 font-bold mt-1">
                            <span className="flex items-center gap-1.5"><Calendar size={12}/> {dados.selectedDate ? new Date(dados.selectedDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'No evento'}</span>
                            <span className="flex items-center gap-1.5"><Clock size={12}/> {dados.slotId}</span>
                        </div>
                    </div>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed italic border-t border-white/5 pt-4 mt-2">
                    Lembre-se de chegar ao lounge de mentorias com 5 minutos de antecedência. 
                    Seu agendamento aguarda a confirmação final do mentor no painel dele.
                </p>
            </Card>

            {/* WhatsApp Group Invitation Card */}
            <Card className="glass-card p-6 border-green-500/30 bg-green-500/5 max-w-2xl mx-auto text-center relative overflow-hidden group hover:border-green-500/50 transition-all duration-300">
                <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <MessageCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <h4 className="text-xl font-bold text-white">Networking & Mentoria</h4>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                        Entre no grupo oficial para tirar dúvidas sobre as mentorias e interagir com outros participantes.
                    </p>
                    <Button
                        size="lg"
                        className="w-full sm:w-auto px-8 h-12 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-lg shadow-green-600/20"
                        onClick={() => window.open(GROUP_LINK, '_blank')}
                    >
                        ENTRAR NO WHATSAPP
                    </Button>
                </div>
            </Card>

            {/* Botões Finais */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mt-10 px-4 sm:px-0">
                <Button
                    size="lg"
                    onClick={onFechar}
                    className="flex-1 bg-white hover:bg-dark-100 text-dark hover:text-white font-black h-16 rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm"
                >
                    VOLTAR AO DASHBOARD
                </Button>
            </div>

            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">
                Growth Experience · Petrolina & Triunfo · 2026
            </p>
        </div>
    );
}
