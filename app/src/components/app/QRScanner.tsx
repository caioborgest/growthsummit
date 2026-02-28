import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { parseQRString } from '@/lib/qrUtils';
import { CheckCircle, XCircle, QrCode, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface QRScannerProps {
    onSuccess: (data: ReturnType<typeof parseQRString>) => void;
    onClose: () => void;
    title?: string;
}

export function QRScanner({ onSuccess, onClose, title = "Escanear QR Code" }: QRScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
            },
      /* verbose= */ false
        );

        const onScanSuccess = (decodedText: string) => {
            const parsed = parseQRString(decodedText);
            if (parsed) {
                scanner.clear();
                setIsScanning(false);
                onSuccess(parsed);
            } else {
                toast.error("QR Code inválido para este evento.");
            }
        };

        const onScanFailure = (error: any) => {
            // Normal behavior, QR code not found in frame
            // We don't want to spam the console or toast
        };

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
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
                    {error ? (
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
                            <div id="reader" className="w-full"></div>

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
