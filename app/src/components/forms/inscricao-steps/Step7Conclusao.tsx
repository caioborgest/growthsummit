import { useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Home, Smartphone, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { DadosInscricao } from './inscricaoTypes';

interface Step7ConclusaoProps {
    dados: DadosInscricao;
    onFechar: () => void;
}

export function Step7Conclusao({ dados, onFechar }: Step7ConclusaoProps) {
    const { selectedProject } = useProject();

    // Link do Grupo Oficial
    const GROUP_LINK = "https://chat.whatsapp.com/DupSWw5K4Ot4BKEjGG2Ndn?mode=hq1tcla";

    // Disparar toast de confirmação uma única vez ao montar (corretamente com useEffect)
    useEffect(() => {
        // Toast de confirmação desativado a pedido do Usuário
        /* 
        const isPending = dados.comprarPalestras && dados.statusPagamento !== 'pago';
        if (!isPending) {
            toast.info('Verifique seu e-mail para confirmar seu cadastro!');
        }
        */
         
    }, []);

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
                    Inscrição <span className="text-brand-orange-coral">Confirmada!</span>
                </h3>
                <p className="text-gray-400 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
                    Parabéns, <span className="text-white font-bold">{dados.nome}</span>! Sua jornada no <span className="text-white font-bold">{selectedProject?.name || 'Growth Experience'}</span> começa agora.
                </p>
            </div>

            {/* WhatsApp Group Invitation Card */}
            <Card className="glass-card p-6 border-green-500/30 bg-green-500/5 max-w-2xl mx-auto text-center relative overflow-hidden group hover:border-green-500/50 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-green-500/10 transition-colors" />

                <div className="relative z-10 space-y-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 text-green-500" />
                    </div>

                    <h4 className="text-xl sm:text-2xl font-bold text-white">Grupo Oficial do Evento</h4>
                    <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
                        Entre no grupo oficial para receber avisos importantes, conferir cronogramas em tempo real e fazer networking.
                    </p>

                    <Button
                        size="lg"
                        className="w-full sm:w-auto px-8 h-14 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-lg shadow-green-600/20 transition-all hover:scale-105"
                        onClick={() => window.open(GROUP_LINK, '_blank')}
                    >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        ENTRAR NO GRUPO DO WHATSAPP
                    </Button>
                </div>
            </Card>

            {/* Benefícios Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto px-4 sm:px-0">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <CheckCircle className="h-5 w-5 text-brand-orange-coral mx-auto mb-2" />
                    <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-1">Acesso</h5>
                    <p className="text-[10px] text-gray-500 leading-tight">Login liberado imediatamente</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <Smartphone className="h-5 w-5 text-brand-orange-coral mx-auto mb-2" />
                    <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-1">App</h5>
                    <p className="text-[10px] text-gray-500 leading-tight">Sua credencial ativa no app</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <CheckCircle className="h-5 w-5 text-brand-orange-coral mx-auto mb-2" />
                    <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-1">Vaga</h5>
                    <p className="text-[10px] text-gray-500 leading-tight">Reserva da palestra confirmada</p>
                </div>
            </div>

            {/* Botões Finais */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mt-8 px-4 sm:px-0">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                        onFechar();
                        window.location.href = '/login';
                    }}
                    className="flex-1 border-white/10 text-gray-300 hover:text-white hover:bg-white/5 h-14 rounded-xl font-bold"
                >
                    <Home className="h-5 w-5 mr-2" />
                    Página de Login
                </Button>

                <Button
                    size="lg"
                    onClick={() => {
                        onFechar();
                        window.location.href = '/login';
                    }}
                    className="flex-1 bg-white hover:bg-dark-100 text-dark hover:text-white font-black h-14 rounded-xl transition-all"
                >
                    Concluir Cadastro
                </Button>
            </div>

            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">
                Dúvidas? Suporte via atendimento oficial no rodapé do site.
            </p>
        </div>
    );
}
