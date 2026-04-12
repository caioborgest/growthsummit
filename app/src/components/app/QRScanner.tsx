import { useEffect, useRef, useState } from 'react';
import { parseQRString } from '@/lib/qrUtils';
import { XCircle, QrCode, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface QRScannerProps {
    onSuccess: (data: ReturnType<typeof parseQRString>, rawText?: string) => void;
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
    const isTransitioning = useRef(false);
    const readerId = useRef(`reader-${Math.random().toString(36).substr(2, 9)}`);

    const stopScanner = async () => {
        if (isTransitioning.current) return;
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            isTransitioning.current = true;
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
            } catch (err) {
                console.warn("Error stopping scanner:", err);
            } finally {
                isTransitioning.current = false;
            }
        }
    };

    const startScanner = async (html5QrCode: any, cameraIdOrConfig: any) => {
        if (isTransitioning.current) return false;
        isTransitioning.current = true;

        try {
            // Build advanced video constraints separately for the configuration object
            const videoConstraints: any = {
                advanced: [
                    { focusMode: 'continuous' } as any,
                    { zoom: 1.0 } as any
                ],
                width: { ideal: 1280 },
                height: { ideal: 720 },
                aspectRatio: 1.0
            };

            // Ensure cameraIdOrConfig is either a simple string or a simple facingMode object
            // to satisfy the library's strict "exactly 1 key" requirement for the first arg.
            const cameraParam = typeof cameraIdOrConfig === 'string' 
                ? cameraIdOrConfig 
                : { facingMode: cameraIdOrConfig.facingMode || 'environment' };

            await html5QrCode.start(
                cameraParam,
                {
                    fps: 15,
                    qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                        const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
                        const qrboxSize = Math.floor(minEdgeSize * 0.75);
                        return { width: qrboxSize, height: qrboxSize };
                    },
                    videoConstraints: videoConstraints, // Pass advanced constraints here
                    disableFlip: false,
                },
                async (decodedText: string) => {
                    const parsed = parseQRString(decodedText);
                    if (parsed || decodedText) {
                        try {
                            if (!isTransitioning.current) {
                                isTransitioning.current = true;
                                await html5QrCode.stop();
                                isTransitioning.current = false;
                            }
                        } catch (e) { 
                            isTransitioning.current = false;
                        }
                        setIsScanning(false);
                        onSuccess(parsed, decodedText);
                    } else {
                        toast.error("QR Code inválido para este evento.");
                    }
                },
                () => { } // silent scan failures
            );

            // Try to enable torch/flashlight after camera starts
            try {
                const capabilities = html5QrCode.getRunningTrackCapabilities?.();
                if (capabilities?.torch) {
                    console.debug('Torch available on this device');
                }
                const track = html5QrCode.getRunningTrackSettings?.();
                if (track) {
                    const videoTrack = html5QrCode.getRunningTrack?.();
                    if (videoTrack?.applyConstraints) {
                        await videoTrack.applyConstraints({
                            advanced: [{ focusMode: 'continuous' } as any]
                        }).catch(() => { /* device doesn't support */ });
                    }
                }
            } catch { /* capabilities API not available */ }

            isTransitioning.current = false;
            return true;
        } catch (err) {
            console.error("Failed to start scanner:", err);
            isTransitioning.current = false;
            
            // Fallback: try with minimal config
            try {
                if (isTransitioning.current) return false;
                isTransitioning.current = true;
                
                const fallbackConfig = typeof cameraIdOrConfig === 'string' 
                    ? cameraIdOrConfig 
                    : { facingMode: 'environment' };
                await html5QrCode.start(
                    fallbackConfig,
                    {
                        fps: 15,
                        qrbox: (vw: number, vh: number) => {
                            const s = Math.floor(Math.min(vw, vh) * 0.75);
                            return { width: s, height: s };
                        },
                    },
                    async (decodedText: string) => {
                        const parsed = parseQRString(decodedText);
                        if (parsed || decodedText) {
                            try { 
                                isTransitioning.current = true;
                                await html5QrCode.stop(); 
                                isTransitioning.current = false;
                            } catch { 
                                isTransitioning.current = false;
                            }
                            setIsScanning(false);
                            onSuccess(parsed, decodedText);
                        } else {
                            toast.error("QR Code inválido.");
                        }
                    },
                    () => { }
                );
                isTransitioning.current = false;
                return true;
            } catch (fallbackErr) {
                console.error("Fallback scanner also failed:", fallbackErr);
                isTransitioning.current = false;
                return false;
            }
        }
    };

    useEffect(() => {
        let isMounted = true;
        let scannerInstance: any = null;

        const initScanner = async () => {
            try {
                const { Html5Qrcode } = await import('html5-qrcode');
                if (!isMounted) return;

                const devices = await Html5Qrcode.getCameras().catch(() => []);
                if (isMounted && devices && devices.length > 0) {
                    setCameras(devices.map(d => ({ id: d.id, label: d.label })));
                    const backCamera = devices.find(d => 
                        d.label.toLowerCase().includes('back') || 
                        d.label.toLowerCase().includes('traseira') ||
                        d.label.toLowerCase().includes('environment')
                    );
                    setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
                }

                setIsLoading(false);

                // Short delay to ensure DOM is ready
                await new Promise(resolve => setTimeout(resolve, 250));
                if (!isMounted) return;

                scannerInstance = new Html5Qrcode(readerId.current);
                html5QrCodeRef.current = scannerInstance;

                const config = selectedCameraId ? selectedCameraId : { facingMode: "environment" };
                const success = await startScanner(scannerInstance, config);
                
                if (!success && isMounted) {
                    setError('Não foi possível acessar a câmera. Verifique as permissões do navegador ou PWA.');
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Scanner init error:", err);
                    setError('Erro ao carregar o módulo de câmera.');
                    setIsLoading(false);
                }
            }
        };

        initScanner();

        return () => {
            isMounted = false;
            stopScanner();
        };
    }, []); // Only run once on mount

    const handleCameraChange = async (cameraId: string) => {
        setSelectedCameraId(cameraId);
        if (html5QrCodeRef.current) {
            try {
                await stopScanner();
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

                            <div className={`relative overflow-hidden rounded-3xl bg-black border-2 border-brand-orange-coral/20 ${isInline ? 'w-full aspect-square max-h-[60vh] mx-auto' : 'aspect-square'}`}>
                                <div id={readerId.current} className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full"></div>

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
