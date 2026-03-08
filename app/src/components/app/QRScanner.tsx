import { useEffect, useRef, useState } from 'react';
import { parseQRString } from '@/lib/qrUtils';
import { XCircle, QrCode, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface QRScannerProps {
    onSuccess: (data: ReturnType<typeof parseQRString>) => void;
    onClose: () => void;
    title?: string;
}

export function QRScanner({ onSuccess, onClose, title = "Escanear QR Code" }: QRScannerProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html5QrCodeRef = useRef<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const readerId = useRef(`reader-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        let isMounted = true;

        // Dynamic import to avoid build-time resolution failure on Vercel
        import('html5-qrcode').then(async ({ Html5Qrcode, Html5QrcodeSupportedFormats }) => {
            if (!isMounted) return;
            setIsLoading(false);

            // Small delay to ensure DOM element is ready after isLoading becomes false
            setTimeout(async () => {
                const html5QrCode = new Html5Qrcode(readerId.current);
                html5QrCodeRef.current = html5QrCode;

                try {
                    await html5QrCode.start(
                        { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                        },
                        async (decodedText) => {
                            const parsed = parseQRString(decodedText);
                            if (parsed) {
                                await html5QrCode.stop();
                                setIsScanning(false);
                                onSuccess(parsed);
                            } else {
                                toast.error("QR Code inválido para este evento.");
                            }
                        },
                        () => { } // silent scan failures
                    );
                } catch (err) {
                    if (isMounted) {
                        setError('Não foi possível iniciar a câmera. Verifique as permissões.');
                        console.error("Camera error:", err);
                    }
                }
            }, 300);
        }).catch(() => {
            if (isMounted) {
                setError('Biblioteca de scanner não disponível. Verifique a conexão.');
                setIsLoading(false);
            }
        });

        return () => {
            isMounted = false;
            if (html5QrCodeRef.current?.isScanning) {
                html5QrCodeRef.current.stop().catch(() => { });
            }
        };
    }, [onSuccess]);

    return (
        <div className="fixed inset-0 z-[100] bg-dark-400 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-dark-200 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-orange-coral/20 flex items-center justify-center">
                            <Camera className="h-4 w-4 text-brand-orange-coral" />
                        </div>
                        <h2 className="text-white font-bold">{title}</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white"
                        onClick={onClose}
                    >
                        <XCircle className="h-6 w-6" />
                    </Button>
                </div>

                <div className="p-4">
                    {isLoading ? (
                        <div className="aspect-square bg-dark-300 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-12 h-12 border-4 border-brand-orange-coral/30 border-t-brand-orange-coral rounded-full animate-spin mb-4" />
                            <p className="text-gray-400 text-sm">Carregando scanner...</p>
                        </div>
                    ) : error ? (
                        <div className="aspect-square bg-dark-300 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                            <XCircle className="h-12 w-12 text-red-500 mb-4" />
                            <p className="text-white font-bold mb-2">Erro na Câmera</p>
                            <p className="text-gray-400 text-sm mb-6">{error}</p>
                            <Button onClick={() => window.location.reload()} variant="outline">
                                Tentar Novamente
                            </Button>
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-2xl bg-black">
                            <div id={readerId.current} className="w-full"></div>

                            {isScanning && (
                                <div className="absolute inset-0 pointer-events-none border-[2px] border-brand-orange-coral/30">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-64 h-64 border-2 border-brand-orange-coral rounded-lg animate-pulse relative">
                                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white"></div>
                                            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white"></div>
                                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white"></div>
                                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 text-center">
                    <p className="text-gray-400 text-sm">
                        Posicione o QR Code dentro do quadrado para escanear automaticamente.
                    </p>
                </div>
            </div>

            <div className="mt-8 flex items-center gap-3 text-gray-500 text-xs font-bold uppercase tracking-widest">
                <QrCode className="h-4 w-4" />
                <span>Sistema de Check-in Growth Experience</span>
            </div>
        </div>
    );
}
