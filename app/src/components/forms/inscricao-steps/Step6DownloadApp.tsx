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
                'On iPhone: open in Safari, tap Share 📤 and choose "Add to Home Screen".',
                { duration: 6000 }
            );
        } else {
            toast.info(
                'Open this site in Chrome on your phone and tap the menu (⋮) to install the app.',
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
                    Download the Super App
                </h3>
                <p className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto px-4">
                    Access your badge, schedule and networking in one place.
                </p>
            </div>

            {/* Direct Download Button */}
            <div className="flex flex-col items-center gap-4 py-4">
                <Button
                    size="lg"
                    onClick={handleDownload}
                    className="w-full max-w-md bg-white text-dark hover:bg-gray-200 font-black h-16 text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                    <Download className="h-6 w-6 text-brand-orange-coral" />
                    DOWNLOAD APP NOW
                </Button>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    Instant installation • No storage space used
                </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
                {[
                    {
                        icon: Zap,
                        title: 'Offline Access',
                        desc: 'Your badge without internet'
                    },
                    {
                        icon: Shield,
                        title: '100% Secure',
                        desc: 'Your data protected'
                    },
                    {
                        icon: Smartphone,
                        title: 'Notifications',
                        desc: 'Lecture reminders'
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

            {/* Installation Instructions */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* iOS */}
                <Card className={`p-6 bg-dark-200/50 border-white/10 relative overflow-hidden \${isIOS ? 'ring-2 ring-brand-orange-coral' : ''}`}>
                    {isIOS && (
                        <Badge className="absolute top-2 right-2 bg-brand-orange-coral text-white text-[10px]">
                            YOUR DEVICE
                        </Badge>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                            <Share2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">iPhone / iPad</h4>
                            <p className="text-xs text-gray-400">Installation via Safari</p>
                        </div>
                    </div>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300 ml-1">
                        <li>Open in <strong>Safari</strong></li>
                        <li>Tap <span className="text-blue-400 font-bold">Share</span></li>
                        <li>Scroll and choose <span className="text-white font-bold">"Add to Home Screen"</span></li>
                        <li>Confirm with <span className="text-white font-bold">"Add"</span></li>
                    </ol>
                </Card>

                {/* Android */}
                <Card className={`p-6 bg-dark-200/50 border-white/10 relative overflow-hidden \${isAndroid ? 'ring-2 ring-brand-orange-coral' : ''}`}>
                    {isAndroid && (
                        <Badge className="absolute top-2 right-2 bg-brand-orange-coral text-white text-[10px]">
                            YOUR DEVICE
                        </Badge>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white">
                            <Chrome className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Android</h4>
                            <p className="text-xs text-gray-400">Installation via Chrome</p>
                        </div>
                    </div>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300 ml-1">
                        <li>Open in <strong>Chrome</strong></li>
                        <li>Tap the <span className="text-green-400 font-bold">Menu (⋮)</span></li>
                        <li>Choose <span className="text-white font-bold">"Install app"</span></li>
                        <li>Confirm with <span className="text-white font-bold">"Install"</span></li>
                    </ol>
                </Card>
            </div>

            {/* QR Code for Desktop */}
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
                            Scan to download
                        </p>
                        <p className="text-xs text-gray-600 max-w-[150px]">
                            Point your cellular camera to install the app now
                        </p>
                    </div>
                </Card>
            </div>

            <div className="form-actions flex gap-2">
                {onVoltar && (
                    <button type="button" onClick={onVoltar} className="btn-form-back">
                        Back
                    </button>
                )}
                <button type="button" onClick={onContinuar} className="btn-form-primary flex-1">
                    NEXT STEP: COMPLETE
                    <ArrowRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
