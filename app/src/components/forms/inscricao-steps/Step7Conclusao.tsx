import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { CheckCircle, Home, Smartphone, Download, QrCode as QrIcon, Share2, Chrome, Zap, Shield, ArrowUp, Plus, ExternalLink } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import type { DadosInscricao } from './inscricaoTypes';
import { logger } from '@/lib/logger';
import QRCode from 'react-qr-code';
import { registrationService } from '@/services/registrationService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';


interface Step7ConclusaoProps {
    dados: DadosInscricao;
    onFechar: () => void;
}

export function Step7Conclusao({ dados, onFechar }: Step7ConclusaoProps) {
    const { selectedProject } = useProject();
    const { isInstallable, isStandalone, promptInstall } = usePWA();
    const [finalized, setFinalized] = useState(false);
    const [showIOSGuide, setShowIOSGuide] = useState(false);
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    useEffect(() => {
        setFinalized(true);
    }, []);

    const handleAction = async () => {
        // Track installation in background
        if (dados.registrationId) {
            registrationService.updateAppInstalled(dados.registrationId).catch(err => 
                logger.error('[Step7] Failed to track app install:', err)
            );
        }

        if (isStandalone) {
             onFechar();
             window.location.href = '/login';
             return;
        }

        if (isInstallable) {
            try {
                const result = await promptInstall();
                if (result) {
                    // Se o usuário aceitou a instalação, aguarda um pouco e vai pro login
                    setTimeout(() => {
                        onFechar();
                        window.location.href = '/login';
                    }, 1500);
                }
            } catch (err) {
                console.error('Error installing PWA:', err);
                toast.error('Erro ao abrir instalador. Tente pelo menu do navegador.');
            }
        } else if (isIOS) {
            // No iOS, mostramos o guia visual
            setShowIOSGuide(true);
        } else {
            // Fallback para quem não tem prompt nativo e não é iOS
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

            {/* Desktop Magic: QR Code */}
            {!isStandalone && !isIOS && !isAndroid && (
                <div className="hidden md:flex justify-center my-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white rounded-[2.5rem] shadow-2xl flex items-center gap-8 border-4 border-brand-orange-coral/10 hover:border-brand-orange-coral/30 transition-all group"
                    >
                        <QRCode
                            value={`${window.location.origin}/login`}
                            size={140}
                            level="M"
                            className="group-hover:scale-105 transition-transform"
                        />
                        <div className="text-left space-y-2">
                            <p className="text-black font-black text-xl leading-none flex items-center gap-2">
                                <QrIcon className="h-6 w-6 text-brand-orange-coral" />
                                ESCANEIE E INSTALE
                            </p>
                            <p className="text-xs text-gray-500 max-w-[180px] font-bold uppercase tracking-wider">
                                Use a câmera do celular para instalar o Super App agora e acessar seu crachá.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto px-4 sm:px-0">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <Zap className="h-5 w-5 text-brand-orange-coral mx-auto mb-2" />
                    <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-1 font-black">Acesso VIP</h5>
                    <p className="text-[10px] text-gray-500 leading-tight font-bold">Login disponível agora</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <Smartphone className="h-5 w-5 text-brand-orange-coral mx-auto mb-2" />
                    <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-1 font-black">Instalado</h5>
                    <p className="text-[10px] text-gray-500 leading-tight font-bold">Crachá e Agenda Offline</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <Shield className="h-5 w-5 text-brand-orange-coral mx-auto mb-2" />
                    <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-1 font-black">Validado</h5>
                    <p className="text-[10px] text-gray-500 leading-tight font-bold">Palestras garantidas</p>
                </div>
            </div>

            {/* Final "Magic" Action */}
            <div className="max-w-xl mx-auto mt-10 px-4 sm:px-0 flex flex-col gap-4">
                <button
                    type="button"
                    onClick={handleAction}
                    className="w-full h-18 py-5 bg-white text-dark hover:bg-gray-100 rounded-[1.8rem] font-black text-xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-white/5 group border-none"
                >
                    {isStandalone ? (
                        <>
                            <ExternalLink className="h-6 w-6 text-brand-orange-coral" />
                            ACESSAR DASHBOARD
                        </>
                    ) : isInstallable ? (
                        <>
                            <Download className="h-6 w-6 text-brand-orange-coral group-hover:animate-bounce" />
                            INSTALAR APP AGORA
                        </>
                    ) : isIOS ? (
                        <>
                            <Smartphone className="h-6 w-6 text-brand-orange-coral" />
                            LIBERAR APP NO iPHONE
                        </>
                    ) : (
                        <>
                            <Home className="h-6 w-6 text-brand-orange-coral" />
                            IR PARA LOGIN
                        </>
                    )}
                </button>
                
                <button
                    type="button"
                    onClick={() => { onFechar(); window.location.href = '/login'; }}
                    className="py-3 text-[10px] text-gray-600 hover:text-white uppercase tracking-[0.3em] font-black transition-colors flex items-center justify-center gap-2"
                >
                    Ja tenho o App instalado • Pular
                </button>
            </div>

            {/* iOS SMART GUIDE OVERLAY */}
            <AnimatePresence>
                {showIOSGuide && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-dark-100/95 backdrop-blur-xl flex flex-col items-center justify-end pb-20 p-8"
                    >
                        <div className="w-full max-w-sm text-center">
                            <motion.div 
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="mb-12"
                            >
                                <div className="w-20 h-20 bg-brand-orange-coral/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                    <Smartphone className="h-10 w-10 text-brand-orange-coral" />
                                </div>
                                <h4 className="text-3xl font-black text-white italic uppercase mb-2 tracking-tighter leading-none">
                                    Instale em <span className="text-brand-orange-coral">2 Cliques</span>
                                </h4>
                                <p className="text-gray-400 font-bold mb-10 leading-relaxed italic">
                                    Apple não permite instalação direta. <br/>Siga as setas abaixo para baixar no iPhone:
                                </p>
                            </motion.div>

                            <div className="space-y-6">
                                <motion.div 
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center gap-4 bg-white/5 p-5 rounded-3xl border border-white/5 text-left"
                                >
                                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                                        <Share2 className="h-6 w-6 text-white" />
                                    </div>
                                    <p className="text-sm font-bold text-white leading-tight uppercase tracking-tight">
                                        1. Toque no ícone de <span className="text-blue-400 italic">Compartilhar</span> na barra do Safari
                                    </p>
                                </motion.div>

                                <motion.div 
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex items-center gap-4 bg-white/5 p-5 rounded-3xl border border-white/5 text-left"
                                >
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0">
                                        <Plus className="h-6 w-6 text-black" />
                                    </div>
                                    <p className="text-sm font-bold text-white leading-tight uppercase tracking-tight">
                                        2. Escolha <span className="text-brand-orange-coral italic">"Adicionar à Tela de Início"</span>
                                    </p>
                                </motion.div>
                            </div>

                            <motion.div 
                                animate={{ y: [0, 15, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="mt-12 flex flex-col items-center gap-2"
                            >
                                <ArrowUp className="h-10 w-10 text-brand-orange-coral" />
                                <span className="text-[10px] font-black text-brand-orange-coral uppercase tracking-widest">Toque Aqui</span>
                            </motion.div>

                            <Button 
                                variant="ghost" 
                                onClick={() => setShowIOSGuide(false)}
                                className="mt-12 text-gray-500 hover:text-white uppercase font-black text-[10px] tracking-widest"
                            >
                                Entendi, fechar guia
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <p className="text-[10px] text-gray-700 uppercase tracking-[0.2em] font-black italic">
                Ecosystem Growth Experience 2026 • Verified Partner App
            </p>
        </div>
    );
}
