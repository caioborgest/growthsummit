import { useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { CheckCircle, Home, Smartphone, Download } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import type { DadosInscricao } from './inscricaoTypes';

interface Step7ConclusaoProps {
    dados: DadosInscricao;
    onFechar: () => void;
}

export function Step7Conclusao({ dados, onFechar }: Step7ConclusaoProps) {
    const { selectedProject } = useProject();
    const { isInstallable, isStandalone, promptInstall } = usePWA();

    const handleConcluirEBaixar = async () => {
        if (isInstallable && !isStandalone) {
            try {
                await promptInstall();
            } catch (err) {
                console.error('Erro ao instalar PWA:', err);
            }
        }
        onFechar();
        window.location.href = '/login';
    };

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

            <div className="form-actions max-w-2xl mx-auto mt-10 px-4 sm:px-0">
                <button
                    type="button"
                    onClick={() => { onFechar(); window.location.href = '/login'; }}
                    className="btn-form-back flex-1"
                >
                    <Home className="h-5 w-5" />
                    PÁGINA DE LOGIN
                </button>
                <button
                    type="button"
                    onClick={handleConcluirEBaixar}
                    className="btn-form-primary flex-[1.5]"
                >
                    <Download className="h-5 w-5 text-brand-orange-coral" />
                    CONCLUIR E BAIXAR APP
                </button>
            </div>

            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">
                Dúvidas? Suporte via atendimento oficial no rodapé do site.
            </p>
        </div>
    );
}
