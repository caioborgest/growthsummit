import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { QrCode, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

export function LeadScanner({ onScanSuccess, onClose }: LeadScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [scanState, setScanState] = useState<'reading' | 'success' | 'error'>('reading');

    useEffect(() => {
        // Inicializa o scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                rememberLastUsedCamera: true,
                showTorchButtonIfSupported: true,
                showZoomSliderIfSupported: true,
            },
            /* verbose= */ false
        );

        scannerRef.current = scanner;

        scanner.render(
            (decodedText) => {
                setScanState('success');
                // Pausa o scanner brevemente antes de repassar o sucesso para evitar duplicados curtos
                scanner.pause(true);

                setTimeout(() => {
                    onScanSuccess(decodedText);
                    setScanState('reading');
                    scanner.resume();
                }, 1500);
            },
            (error) => {
                // Ignore erros constantes de falha de decodificação de frame
            }
        );

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error("Falha ao limpar scanner", e));
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-dark-200 border border-dark-300 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-dark-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <QrCode className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Capturar Lead</h3>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Aponte para o crachá</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6">
                    <div className="relative bg-black rounded-2xl overflow-hidden aspect-square flex flex-col items-center justify-center">
                        {scanState === 'reading' && (
                            <div id="reader" className="w-full h-full [&>div]:border-none [&>div>video]:object-cover" />
                        )}

                        {scanState === 'success' && (
                            <div className="absolute inset-0 bg-green-500/20 flex flex-col justify-center items-center p-6 text-center z-10">
                                <CheckCircle className="h-16 w-16 text-green-500 mb-4 animate-bounce" />
                                <p className="text-white font-bold text-lg">Lead Capturado!</p>
                                <p className="text-green-400 text-sm">Pronto para o próximo...</p>
                            </div>
                        )}

                        {scanState === 'error' && (
                            <div className="absolute inset-0 bg-red-500/20 flex justify-center items-center z-10">
                                <AlertTriangle className="h-16 w-16 text-red-500" />
                            </div>
                        )}

                        {/* Overlay Styling */}
                        {scanState === 'reading' && (
                            <div className="absolute inset-0 border-4 border-orange-500/50 rounded-2xl pointer-events-none z-10" />
                        )}
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        <p>O participante será adicionado automaticamente à sua lista de leads após a leitura.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
