import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { CheckCircle, Home, Smartphone, Download, Loader2, QrCode as QrIcon, Share2, Chrome, Zap, Shield } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import type { DadosInscricao } from './inscricaoTypes';
import { logger } from '@/lib/logger';
import QRCode from 'react-qr-code';
import { registrationService } from '@/services/registrationService';
import { toast } from 'sonner';

interface Step7ConclusaoProps {
    dados: DadosInscricao;
    onFechar: () => void;
}

export function Step7Conclusao({ dados, onFechar }: Step7ConclusaoProps) {
    const { selectedProject } = useProject();
    const { isInstallable, isStandalone, promptInstall } = usePWA();
    const [finalized, setFinalized] = useState(false);
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    useEffect(() => {
        setFinalized(true);
    }, []);

    const handleConcluirEBaixar = async () => {
        // Track installation in background
        if (dados.registrationId) {
            registrationService.updateAppInstalled(dados.registrationId).catch(err => 
                logger.error('[Step7] Failed to track app install:', err)
            );
        }

        if (isInstallable && !isStandalone) {
            try {
                await promptInstall();
            } catch (err) {
                console.error('Error installing PWA:', err);
                toast.error('Erro ao abrir instalador. Tente pelo menu do navegador.');
            }
        } else if (isIOS && !isStandalone) {
            toast.info(
                'No iPhone: toque em Compartilhar 📤 e escolha "Adicionar à Tela de Início".',
                { duration: 6000 }
            );
        } else if (isAndroid && !isStandalone) {
            toast.info(
                'No Android: toque no menu (⋮) e escolha "Instalar aplicativo".',
                { duration: 6000 }
            );
        }
        
        // Se já está instalado ou não pode instalar agora, redireciona
        if (isStandalone) {
            onFechar();
            window.location.href = '/login';
        }
    };

    return (
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500 relative min-h-[400px] mb-8">
            {/* Success Icon */}
            <div className="relative w-24 h-24 mx-auto animate-float">
                <div className="absolute inset-0 bg-brand-orange-coral/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-full h-full bg-gradient-to-br from-brand-orange-coral to-brand-orange-gradient rounded-full flex items-center justify-center text-white shadow-xl shadow-brand-orange-coral/30">
                    <CheckCircle className="h-12 w-12" />
                </div>
            </div>

            {/* Title */}
            <div className="px-4">
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight tracking-tight uppercase italic underline decoration-brand-orange-coral/20">
                    Inscrição <span className="text-brand-orange-coral">Confirmada!</span>
                </h3>
                <p className="text-gray-400 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed font-medium">
                    Parabéns, <span className="text-white font-bold">{dados.name}</span>! Sua jornada no <span className="text-white font-bold">{selectedProject?.name || 'Growth Experience'}</span> começa agora.
                </p>
            </div>

            {/* QR Code for Desktop */}
            {!isStandalone && (isIOS || isAndroid || true) && (
                <div className="hidden md:flex justify-center my-8">
                    <div className="p-6 bg-white rounded-[2.5rem] shadow-2xl flex items-center gap-8 border-4 border-brand-orange-coral/10">
                        <QRCode
                            value={`${window.location.origin}/login`}
                            size={140}
                            level="M"
                        />
                        <div className="text-left space-y-2">
                            <p className="text-black font-black text-xl leading-none flex items-center gap-2">
                                <QrIcon className="h-6 w-6 text-brand-orange-coral" />
                                ESCANEIE E BAIXE
                            </p>
                            <p className="text-xs text-gray-500 max-w-[180px] font-bold uppercase tracking-wider">
                                Aponte a câmera do celular para instalar o Super App agora e acessar seu crachá.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Device Specific Guidance */}
            {!isStandalone && (isIOS || isAndroid) && (
                <div className="max-w-md mx-auto p-4 bg-brand-orange-coral/5 rounded-2xl border border-brand-orange-coral/20 flex items-start gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange-coral/20 flex items-center justify-center shrink-0">
                        {isIOS ? <Share2 className="h-5 w-5 text-brand-orange-coral" /> : <Chrome className="h-5 w-5 text-brand-orange-coral" />}
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase">Dica de Instalação</h4>
                        <p className="text-gray-400 text-xs leading-snug">
                            {isIOS 
                                ? 'No Safari, toque no ícone de compartilhar e depois em "Adicionar à Tela de Início".'
                                : 'No Chrome, toque no menu (⋮) e depois em "Instalar aplicativo".'}
                        </p>
                    </div>
                </div>
            )}

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto px-4 sm:px-0">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <Zap className="h-5 w-5 text-brand-orange-coral mx-auto mb-2" />
                    <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-1">Acesso</h5>
                    <p className="text-[10px] text-gray-500 leading-tight font-medium">Login disponível imediatamente</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <Smartphone className="h-5 w-5 text-brand-orange-coral mx-auto mb-2" />
                    <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-1">App</h5>
                    <p className="text-[10px] text-gray-500 leading-tight font-medium">Seu crachá ativo e offline</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <Shield className="h-5 w-5 text-brand-orange-coral mx-auto mb-2" />
                    <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-1">Vaga</h5>
                    <p className="text-[10px] text-gray-500 leading-tight font-medium">Palestras confirmadas</p>
                </div>
            </div>

            {/* Final Actions */}
            <div className="form-actions max-w-2xl mx-auto mt-10 px-4 sm:px-0 flex flex-col sm:flex-row gap-4">
                <button
                    type="button"
                    onClick={handleConcluirEBaixar}
                    className="btn-form-primary flex-1 h-14"
                >
                    <Download className="h-5 w-5" />
                    {isStandalone ? 'IR PARA ÁREA DO PARTICIPANTE' : 'FINALIZAR E INSTALAR APP'}
                </button>
                <button
                    type="button"
                    onClick={() => { onFechar(); window.location.href = '/login'; }}
                    className="btn-form-back h-14"
                >
                    <Home className="h-5 w-5" />
                    LOGAR DEPOIS
                </button>
            </div>

            <p className="text-[10px] text-gray-700 uppercase tracking-[0.2em] font-black italic">
                Sincronização com o ecossistema Growth Experience... 100%
            </p>
        </div>
    );
}
   );
}
