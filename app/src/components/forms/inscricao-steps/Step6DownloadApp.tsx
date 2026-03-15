import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Zap, Shield, Share2, Chrome, QrCode as QrIcon, Download, ArrowRight } from 'lucide-react';
import QRCode from 'react-qr-code';
import { usePWA } from '@/hooks/usePWA';
import { toast } from 'sonner';

interface Step6DownloadAppProps {
    onContinuar: () => void;
    onVoltar?: () => void;
}

export function Step6DownloadApp({ onContinuar, onVoltar }: Step6DownloadAppProps) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const { isInstallable, isStandalone, promptInstall } = usePWA();

    const handleDownload = async () => {
        if (isInstallable && !isStandalone) {
            await promptInstall();
        } else if (isIOS) {
            toast.info(
                'No iPhone: abra no Safari, toque em Compartilhar 📤 e escolha "Adicionar à Tela de Início".',
                { duration: 6000 }
            );
        } else {
            toast.info(
                'Abra este site no Chrome do seu celular e toque no menu (⋮) para instalar o app.',
                { duration: 6000 }
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <Smartphone className="h-10 sm:h-16 w-10 sm:w-16 text-brand-orange-coral mx-auto mb-4 animate-bounce" />
                <h3 className="text-xl sm:text-3xl font-black text-white mb-2 leading-tight">
                    Baixe o Super App
                </h3>
                <p className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto px-4">
                    Acesse sua credencial, programação e networking em um só lugar.
                </p>
            </div>

            {/* Botão de Download Direto */}
            <div className="flex flex-col items-center gap-4 py-4">
                <Button
                    size="lg"
                    onClick={handleDownload}
                    className="w-full max-w-md bg-white text-dark hover:bg-gray-200 font-black h-16 text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                    <Download className="h-6 w-6 text-brand-orange-coral" />
                    BAIXAR APP AGORA
                </Button>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    Instalação instantânea • Sem ocupar memória
                </p>
            </div>

            {/* Grid de Benefícios */}
            <div className="grid md:grid-cols-3 gap-4 mb-4">
                {[
                    {
                        icon: Zap,
                        title: 'Acesso Offline',
                        desc: 'Sua credencial sem internet'
                    },
                    {
                        icon: Shield,
                        title: '100% Seguro',
                        desc: 'Seus dados protegidos'
                    },
                    {
                        icon: Smartphone,
                        title: 'Notificações',
                        desc: 'Lembretes das palestras'
                    }
                ].map((item, index) => (
                    <Card key={index} className="p-4 bg-dark-200/50 border-white/5 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-brand-orange-coral/10 flex items-center justify-center mb-2">
                            <item.icon className="h-5 w-5 text-brand-orange-coral" />
                        </div>
                        <h5 className="font-bold text-white text-sm">{item.title}</h5>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                    </Card>
                ))}
            </div>

            {/* Instruções de Instalação */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* iOS */}
                <Card className={`p-6 bg-dark-200/50 border-white/10 relative overflow-hidden ${isIOS ? 'ring-2 ring-brand-orange-coral' : ''}`}>
                    {isIOS && (
                        <Badge className="absolute top-2 right-2 bg-brand-orange-coral text-white text-[10px]">
                            SEU DISPOSITIVO
                        </Badge>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                            <Share2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">iPhone / iPad</h4>
                            <p className="text-xs text-gray-400">Instalação via Safari</p>
                        </div>
                    </div>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300 ml-1">
                        <li>Abra no <strong>Safari</strong></li>
                        <li>Toque em <span className="text-blue-400 font-bold">Compartilhar</span></li>
                        <li>Role e escolha <span className="text-white font-bold">"Adicionar à Tela de Início"</span></li>
                        <li>Confirme com <span className="text-white font-bold">"Adicionar"</span></li>
                    </ol>
                </Card>

                {/* Android */}
                <Card className={`p-6 bg-dark-200/50 border-white/10 relative overflow-hidden ${isAndroid ? 'ring-2 ring-brand-orange-coral' : ''}`}>
                    {isAndroid && (
                        <Badge className="absolute top-2 right-2 bg-brand-orange-coral text-white text-[10px]">
                            SEU DISPOSITIVO
                        </Badge>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white">
                            <Chrome className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Android</h4>
                            <p className="text-xs text-gray-400">Instalação via Chrome</p>
                        </div>
                    </div>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300 ml-1">
                        <li>Abra no <strong>Chrome</strong></li>
                        <li>Toque no <span className="text-green-400 font-bold">Menu (⋮)</span></li>
                        <li>Escolha <span className="text-white font-bold">"Instalar aplicativo"</span></li>
                        <li>Confirme com <span className="text-white font-bold">"Instalar"</span></li>
                    </ol>
                </Card>
            </div>

            {/* QR Code para Desktop */}
            <div className="hidden md:flex justify-center my-6">
                <Card className="p-4 bg-white rounded-xl shadow-lg flex items-center gap-6">
                    <QRCode
                        value="https://www.growthsummit.site/login"
                        size={100}
                        level="H"
                    />
                    <div className="text-left">
                        <p className="text-black font-bold mb-1 flex items-center gap-2">
                            <QrIcon className="h-4 w-4" />
                            Escaneie para baixar
                        </p>
                        <p className="text-xs text-gray-600 max-w-[150px]">
                            Aponte a câmera do seu celular para instalar o app agora
                        </p>
                    </div>
                </Card>
            </div>

            {/* Botão de Confirmação */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-4">
                {onVoltar && (
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={onVoltar}
                        className="w-full sm:w-auto px-8 h-14 rounded-xl font-bold text-gray-500 border-white/10 hover:bg-white/5"
                    >
                        Voltar
                    </Button>
                )}
                <Button
                    size="lg"
                    onClick={onContinuar}
                    className="flex-1 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-bold h-14 rounded-xl shadow-lg"
                >
                    Próxima Etapa: Concluir Cadastro
                    <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
            </div>
        </div>
    );
}
