import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, Zap, Shield, Share2, Chrome, Calendar, Users, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function AppDownloadSection() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setIsInstallable(false);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallPWA = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') console.log('PWA instalado');
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    return (
        <section className="relative py-24 overflow-hidden bg-gradient-to-b from-dark via-dark-100 to-dark">
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle, rgba(255, 112, 67, 0.4) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Compacto */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                        Baixe o App
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient mt-2">
                            Growth Experience
                        </span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Acesse direto da tela inicial. Sem precisar de loja!
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    {/* Mockup Premium do App */}
                    <div className="relative">
                        <div className="relative mx-auto max-w-[280px]">
                            {/* Phone Frame */}
                            <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-[3rem] p-3 shadow-2xl">
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-black rounded-b-3xl z-10" />

                                {/* Screen */}
                                <div className="relative bg-dark rounded-[2.5rem] overflow-hidden aspect-[9/19.5]">
                                    {/* Status Bar */}
                                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/50 to-transparent z-10 flex items-center justify-between px-6 pt-2">
                                        <span className="text-white text-xs font-semibold">9:41</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-3 border border-white/80 rounded-sm" />
                                            <div className="w-1 h-3 bg-white/80 rounded-sm" />
                                        </div>
                                    </div>

                                    {/* App Content - DESIGN PREMIUM */}
                                    <div className="relative h-full bg-gradient-to-br from-[#0A0E14] via-[#1a1f2e] to-[#0A0E14] p-5 pt-16">
                                        {/* Header com Logo */}
                                        <div className="mb-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-orange-coral via-brand-orange-gradient to-brand-orange-intense flex items-center justify-center shadow-lg shadow-brand-orange-coral/50">
                                                    <span className="text-white font-black text-xl">GE</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold text-sm leading-tight">Growth Experience</h3>
                                                    <p className="text-brand-orange-coral text-xs font-semibold">Triunfo-PE</p>
                                                </div>
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange-coral/20 border border-brand-orange-coral/40">
                                                <Calendar className="h-3 w-3 text-brand-orange-coral" />
                                                <span className="text-brand-orange-coral text-[10px] font-bold">16 ABR 2026</span>
                                            </div>
                                        </div>

                                        {/* Stats Cards */}
                                        <div className="grid grid-cols-3 gap-2 mb-6">
                                            <div className="bg-gradient-to-br from-brand-orange-coral/10 to-transparent border border-brand-orange-coral/20 rounded-xl p-3 text-center">
                                                <Users className="h-4 w-4 text-brand-orange-coral mx-auto mb-1" />
                                                <p className="text-white text-xs font-bold">500+</p>
                                                <p className="text-gray-400 text-[8px]">Pessoas</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-brand-orange-coral/10 to-transparent border border-brand-orange-coral/20 rounded-xl p-3 text-center">
                                                <Calendar className="h-4 w-4 text-brand-orange-coral mx-auto mb-1" />
                                                <p className="text-white text-xs font-bold">12h</p>
                                                <p className="text-gray-400 text-[8px]">Conteúdo</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-brand-orange-coral/10 to-transparent border border-brand-orange-coral/20 rounded-xl p-3 text-center">
                                                <Zap className="h-4 w-4 text-brand-orange-coral mx-auto mb-1" />
                                                <p className="text-white text-xs font-bold">20+</p>
                                                <p className="text-gray-400 text-[8px]">Atividades</p>
                                            </div>
                                        </div>

                                        {/* Próximo Evento Card */}
                                        <div className="bg-gradient-to-br from-brand-orange-coral/15 via-brand-orange-gradient/10 to-transparent border border-brand-orange-coral/30 rounded-2xl p-4 shadow-lg mb-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Bell className="h-3 w-3 text-brand-orange-coral" />
                                                <span className="text-brand-orange-coral text-[9px] font-bold uppercase">Próximo</span>
                                            </div>
                                            <h4 className="text-white text-sm font-bold mb-1 leading-tight">Palestra: Crescimento Exponencial</h4>
                                            <p className="text-gray-300 text-[10px] mb-3">Leandro Batista • Fitness Exclusive</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-orange-coral to-brand-orange-intense flex items-center justify-center">
                                                        <span className="text-white text-[10px] font-bold">19:00</span>
                                                    </div>
                                                    <span className="text-gray-400 text-[9px]">50 min</span>
                                                </div>
                                                <Badge className="bg-green-500/20 text-green-500 border-green-500/40 text-[8px] px-2 py-0.5">
                                                    Confirmado
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <button className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl p-3 text-left hover:border-brand-orange-coral/30 transition-all">
                                                <Smartphone className="h-4 w-4 text-brand-orange-coral mb-2" />
                                                <p className="text-white text-[10px] font-bold">Minha Agenda</p>
                                            </button>
                                            <button className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl p-3 text-left hover:border-brand-orange-coral/30 transition-all">
                                                <Users className="h-4 w-4 text-brand-orange-coral mb-2" />
                                                <p className="text-white text-[10px] font-bold">Networking</p>
                                            </button>
                                        </div>

                                        {/* Floating Download */}
                                        <div className="absolute bottom-5 right-5 w-11 h-11 rounded-xl bg-gradient-to-br from-brand-orange-coral to-brand-orange-intense flex items-center justify-center shadow-xl shadow-brand-orange-coral/60 animate-bounce">
                                            <Download className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-orange-coral/30 to-brand-orange-intense/20 rounded-[3rem] blur-3xl -z-10 animate-pulse" />
                        </div>
                    </div>

                    {/* Installation Guide - COMPACTO */}
                    <div className="space-y-4">
                        {/* iOS */}
                        <Card className={`glass-card p-6 border-white/10 hover:border-brand-orange-coral/30 transition-all ${isIOS ? 'ring-2 ring-brand-orange-coral' : ''}`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                    <Share2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">iPhone / iPad</h3>
                                    <p className="text-xs text-gray-400">Safari → Compartilhar → Adicionar</p>
                                </div>
                            </div>
                            {isIOS && (
                                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs">
                                    Ver Instruções
                                </Button>
                            )}
                        </Card>

                        {/* Android */}
                        <Card className={`glass-card p-6 border-white/10 hover:border-brand-orange-coral/30 transition-all ${isAndroid ? 'ring-2 ring-brand-orange-coral' : ''}`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                                    <Chrome className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Android</h3>
                                    <p className="text-xs text-gray-400">Chrome → Menu → Instalar app</p>
                                </div>
                            </div>
                            {isAndroid && isInstallable && (
                                <Button
                                    size="sm"
                                    className="w-full bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:shadow-lg text-white text-xs font-bold"
                                    onClick={handleInstallPWA}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Instalar Agora
                                </Button>
                            )}
                        </Card>

                        {/* Desktop */}
                        {!isIOS && !isAndroid && isInstallable && (
                            <Card className="glass-card p-6 border-brand-orange-coral/30 bg-brand-orange-coral/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-orange-coral to-brand-orange-gradient flex items-center justify-center">
                                        <Download className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white mb-1">Desktop</h3>
                                        <Button
                                            size="sm"
                                            className="bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:shadow-lg text-white text-xs font-bold"
                                            onClick={handleInstallPWA}
                                        >
                                            Instalar App
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Recursos - COMPACTO */}
                        <div className="grid grid-cols-3 gap-3 pt-4">
                            <div className="text-center">
                                <div className="w-10 h-10 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center mx-auto mb-2">
                                    <Smartphone className="h-5 w-5 text-brand-orange-coral" />
                                </div>
                                <p className="text-white text-xs font-semibold">Offline</p>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center mx-auto mb-2">
                                    <Zap className="h-5 w-5 text-brand-orange-coral" />
                                </div>
                                <p className="text-white text-xs font-semibold">Rápido</p>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center mx-auto mb-2">
                                    <Shield className="h-5 w-5 text-brand-orange-coral" />
                                </div>
                                <p className="text-white text-xs font-semibold">Seguro</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
