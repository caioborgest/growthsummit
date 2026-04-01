import { useEffect, useRef, useState } from 'react';
import { parseQRString } from '@/lib/qrUtils';
import { XCircle, QrCode, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface QRScannerProps {
    onSuccess: (data: ReturnType<typeof parseQRString>) => void;
    onClose: () => void;
    title?: string;
    isInline?: boolean;
}

export function QRScanner({ onSuccess, onClose, title = "Escanear QR Code", isInline = false }: QRScannerProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html5QrCodeRef = useRef<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('');
    const readerId = useRef(`reader-${Math.random().toString(36).substr(2, 9)}`);

    const startScanner = async (html5QrCode: any, cameraIdOrConfig: any) => {
        try {
            await html5QrCode.start(
                cameraIdOrConfig,
                {
                    fps: 20,
                    qrbox: { width: 450, height: 450 },
                },
                async (decodedText: string) => {
                    const parsed = parseQRString(decodedText);
                    if (parsed) {
                        try {
                            await html5QrCode.stop();
                        } catch (e) { /* silent */ }
                        setIsScanning(false);
                        onSuccess(parsed);
                    } else {
                        toast.error("QR Code inválido para este evento.");
                    }
                },
                () => { } // silent scan failures
            );
            return true;
        } catch (err) {
            console.error("Failed to start scanner:", err);
            return false;
        }
    };

    useEffect(() => {
        let isMounted = true;

        import('html5-qrcode').then(async ({ Html5Qrcode }) => {
            if (!isMounted) return;
            
            try {
                const devices = await Html5Qrcode.getCameras();
                if (isMounted && devices && devices.length > 0) {
                    setCameras(devices.map(d => ({ id: d.id, label: d.label })));
                    // Prioritize back camera if found
                    const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('traseira'));
                    setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
                }
            } catch (err) {
                console.error("Error getting cameras:", err);
            }

            setIsLoading(false);
            
            setTimeout(async () => {
                if (!isMounted) return;
                const html5QrCode = new Html5Qrcode(readerId.current);
                html5QrCodeRef.current = html5QrCode;

                const config = selectedCameraId ? selectedCameraId : { facingMode: "environment" };
                const success = await startScanner(html5QrCode, config);
                
                if (!success && isMounted) {
                    setError('Não foi possível iniciar a câmera. Verifique as permissões.');
                }
            }, 300);
        }).catch(() => {
            if (isMounted) {
                setError('Biblioteca de scanner não disponível.');
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

    const handleCameraChange = async (cameraId: string) => {
        setSelectedCameraId(cameraId);
        if (html5QrCodeRef.current) {
            try {
                if (html5QrCodeRef.current.isScanning) {
                    await html5QrCodeRef.current.stop();
                }
                await startScanner(html5QrCodeRef.current, cameraId);
            } catch (err) {
                toast.error("Erro ao trocar de câmera.");
            }
        }
    };

    return (
        <div className={isInline ? "w-full h-full min-h-[400px] flex flex-col" : "fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-4"}>
            <div className={isInline ? "w-full h-full flex flex-col" : "w-full max-w-xl bg-card rounded-[2.5rem] overflow-hidden border border-border-theme shadow-premium relative"}>
                {!isInline && (
                    <div className="p-8 border-b border-border-theme flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-orange-coral/20 flex items-center justify-center">
                            <Camera className="h-5 w-5 text-brand-orange-coral" />
                        </div>
                        <div>
                            <h2 className="text-foreground font-black text-lg tracking-tight leading-none uppercase">{title}</h2>
                            <p className="text-[10px] text-muted-foreground font-bold tracking-widest mt-1 uppercase">Acreditação Digital</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground bg-accent/20 hover:bg-accent rounded-xl"
                        onClick={onClose}
                    >
                        <XCircle className="h-6 w-6" />
                    </Button>
                </div>
                )}

                <div className="p-6">
                    {isLoading ? (
                        <div className="aspect-square bg-muted/20 rounded-3xl flex flex-col items-center justify-center p-8 text-center border border-border-theme">
                            <div className="w-12 h-12 border-4 border-brand-orange-coral/30 border-t-brand-orange-coral rounded-full animate-spin mb-4" />
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Iniciando Módulo...</p>
                        </div>
                    ) : error ? (
                        <div className="aspect-square bg-muted/20 rounded-3xl flex flex-col items-center justify-center p-8 text-center border border-red-500/10">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                            <p className="text-foreground font-black uppercase tracking-tight mb-2">Bloqueio de Câmera</p>
                            <p className="text-muted-foreground text-xs mb-8">{error}</p>
                            <Button onClick={() => window.location.reload()} className="bg-primary/10 border border-primary/20 text-primary font-bold px-8 h-12 rounded-xl hover:bg-primary/20">
                                RECARREGAR PÁGINA
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Camera Selector drop-down if multiple cameras */}
                            {cameras.length > 1 && (
                                <div className="bg-muted/50 border border-border-theme rounded-2xl p-2 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center shrink-0">
                                        <Camera className="h-4 w-4 text-brand-orange-coral" />
                                    </div>
                                    <select 
                                        className="bg-transparent text-foreground text-xs font-bold w-full focus:outline-none cursor-pointer pr-4"
                                        value={selectedCameraId}
                                        onChange={(e) => handleCameraChange(e.target.value)}
                                    >
                                        {cameras.map(camera => (
                                            <option key={camera.id} value={camera.id} className="bg-card">
                                                {camera.label || `Câmera ${camera.id.substring(0, 5)}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className={`relative overflow-hidden rounded-3xl bg-black border-2 border-brand-orange-coral/20 ${isInline ? 'flex-1 min-h-[400px]' : 'aspect-square'}`}>
                                <div id={readerId.current} className="w-full h-full object-cover"></div>

                                {isScanning && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        {/* Scanner Frame */}
                                        <div className="absolute inset-x-8 inset-y-8 flex items-center justify-center">
                                            <div className="w-full h-full border-4 border-brand-orange-coral/40 rounded-[2.5rem] relative">
                                                {/* Corner markers */}
                                                <div className="absolute top-0 left-0 w-12 h-12 border-t-8 border-l-8 border-white rounded-tl-2xl shadow-[0_0_20px_rgba(255,112,67,0.4)]"></div>
                                                <div className="absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8 border-white rounded-tr-2xl shadow-[0_0_20px_rgba(255,112,67,0.4)]"></div>
                                                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8 border-white rounded-bl-2xl shadow-[0_0_20px_rgba(255,112,67,0.4)]"></div>
                                                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-8 border-r-8 border-white rounded-br-2xl shadow-[0_0_20px_rgba(255,112,67,0.4)]"></div>
                                                
                                                {/* Animation Beam */}
                                                <div className="absolute inset-x-0 h-0.5 bg-brand-orange-coral/50 shadow-[0_0_15px_rgba(255,112,67,0.8)] animate-scan-beam" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {!isInline && (
                    <div className="p-8 bg-muted/20 border-t border-border-theme text-center">
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-[200px] mx-auto">
                            Posicione o QR Code no centro para validação automática.
                        </p>
                    </div>
                )}
            </div>

            {!isInline && (
            <div className="mt-12 flex items-center gap-4 text-white/20 select-none">
                <QrCode className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Growth Eco System</span>
                <div className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">2k26</span>
            </div>
            )}
        </div>
    );
}
