import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, Zap, Shield, Apple } from 'lucide-react';
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
        // Detectar se já está instalado
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        // Capturar evento de instalação
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Detectar quando foi instalado
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setIsInstallable(false);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallPWA = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('PWA instalado com sucesso');
        }

        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    return (
        <section className="py-24 bg-gradient-to-br from-brand-orange-coral/10 via-dark to-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30">
                        App Nativo
                    </Badge>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                        Baixe o App Growth Experience
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Acesse todas as funcionalidades do evento direto do seu celular
                    </p>
                </div>

                {isInstalled && (
                    <div className="mb-8 max-w-2xl mx-auto">
                        <Card className="glass-card p-6 border-green-500/30 bg-green-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">App Instalado!</h4>
                                    <p className="text-sm text-gray-300">
                                        O Growth Experience já está instalado no seu dispositivo
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
                    {/* iOS */}
                    <Card className={`glass-card p-8 border-white/10 text-center ${isIOS ? 'ring-2 ring-brand-orange-coral' : ''}`}>
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-6">
                            <Apple className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">iOS / iPhone</h3>
                        <p className="text-gray-400 mb-6">
                            {isIOS
                                ? 'Detectamos que você está usando iOS'
                                : 'Disponível para iPhone e iPad'}
                        </p>

                        {isIOS ? (
                            <div className="bg-brand-orange-coral/10 border border-brand-orange-coral/30 rounded-lg p-4 text-left">
                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Como instalar no iOS:
                                </h4>
                                <ol className="text-sm text-gray-300 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange-coral font-bold">1.</span>
                                        <span>Toque no botão de compartilhar (ícone de quadrado com seta)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange-coral font-bold">2.</span>
                                        <span>Role para baixo e toque em "Adicionar à Tela de Início"</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange-coral font-bold">3.</span>
                                        <span>Toque em "Adicionar" no canto superior direito</span>
                                    </li>
                                </ol>
                            </div>
                        ) : (
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                onClick={() => window.open('https://apps.apple.com', '_blank')}
                            >
                                <Download className="h-5 w-5 mr-2" />
                                Ver na App Store
                            </Button>
                        )}
                    </Card>

                    {/* Android */}
                    <Card className={`glass-card p-8 border-white/10 text-center ${isAndroid ? 'ring-2 ring-brand-orange-coral' : ''}`}>
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.523 15.341c-.759 0-1.375-.616-1.375-1.375s.616-1.375 1.375-1.375 1.375.616 1.375 1.375-.616 1.375-1.375 1.375zm-11.046 0c-.759 0-1.375-.616-1.375-1.375s.616-1.375 1.375-1.375 1.375.616 1.375 1.375-.616 1.375-1.375 1.375zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.75c-5.385 0-9.75-4.365-9.75-9.75S6.615 2.25 12 2.25s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Android</h3>
                        <p className="text-gray-400 mb-6">
                            {isAndroid
                                ? 'Detectamos que você está usando Android'
                                : 'Disponível para dispositivos Android'}
                        </p>

                        {isAndroid && isInstallable ? (
                            <Button
                                className="w-full bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-dark-100 font-bold"
                                onClick={handleInstallPWA}
                            >
                                <Download className="h-5 w-5 mr-2" />
                                Instalar App Agora
                            </Button>
                        ) : (
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                                onClick={() => window.open('https://play.google.com', '_blank')}
                            >
                                <Download className="h-5 w-5 mr-2" />
                                Ver na Google Play
                            </Button>
                        )}
                    </Card>
                </div>

                {/* PWA Install - Desktop/Outros */}
                {!isIOS && !isAndroid && isInstallable && (
                    <div className="max-w-2xl mx-auto mb-12">
                        <Card className="glass-card p-8 border-brand-orange-coral/30 bg-brand-orange-coral/5">
                            <div className="text-center">
                                <h4 className="text-2xl font-bold text-white mb-4">
                                    Instale como Aplicativo
                                </h4>
                                <p className="text-gray-300 mb-6">
                                    Você pode instalar o Growth Experience como um aplicativo no seu computador
                                </p>
                                <Button
                                    size="lg"
                                    className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-dark-100 font-bold"
                                    onClick={handleInstallPWA}
                                >
                                    <Download className="h-5 w-5 mr-2" />
                                    Instalar Aplicativo
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Recursos PWA */}
                <div className="mt-12">
                    <Card className="glass-card p-6 border-brand-orange-coral/20 max-w-3xl mx-auto">
                        <h4 className="text-white font-bold mb-4 text-center text-lg">
                            Recursos do Aplicativo
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-brand-orange-coral/20 flex items-center justify-center mb-3">
                                    <Smartphone className="h-6 w-6 text-brand-orange-coral" />
                                </div>
                                <h5 className="text-white font-semibold mb-1">Funciona Offline</h5>
                                <p className="text-sm text-gray-400">
                                    Acesse informações mesmo sem internet
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-brand-orange-coral/20 flex items-center justify-center mb-3">
                                    <Zap className="h-6 w-6 text-brand-orange-coral" />
                                </div>
                                <h5 className="text-white font-semibold mb-1">Rápido e Leve</h5>
                                <p className="text-sm text-gray-400">
                                    Carregamento instantâneo e baixo consumo
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-brand-orange-coral/20 flex items-center justify-center mb-3">
                                    <Shield className="h-6 w-6 text-brand-orange-coral" />
                                </div>
                                <h5 className="text-white font-semibold mb-1">Seguro</h5>
                                <p className="text-sm text-gray-400">
                                    Criptografia e proteção de dados
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Funcionalidades do App */}
                <div className="mt-12 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-white text-center mb-8">
                        O que você pode fazer no app:
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            'Acessar sua agenda personalizada',
                            'Receber notificações em tempo real',
                            'Fazer networking com outros participantes',
                            'Acessar materiais e apresentações',
                            'Participar de mentorias e workshops',
                            'Avaliar palestras e atividades',
                            'Consultar mapa do evento',
                            'Acessar certificados digitais'
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 text-gray-300">
                                <div className="w-6 h-6 rounded-full bg-brand-orange-coral/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-brand-orange-coral text-sm">✓</span>
                                </div>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
