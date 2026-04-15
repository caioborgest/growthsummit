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
    isContinuous?: boolean;
}

export function QRScanner({ onSuccess, onClose, title = "Escanear QR Code", isInline = false, isContinuous = false }: QRScannerProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html5QrCodeRef = useRef<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('');
    const [isChangingCamera, setIsChangingCamera] = useState(false);
    const isTransitioning = useRef(false);
    const readerId = useRef(`reader-${Math.random().toString(36).substr(2, 9)}`);

    const waitForElement = (id: string, timeout = 2000): Promise<HTMLElement> => {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const check = () => {
                const el = document.getElementById(id);
                if (el) resolve(el);
                else if (Date.now() - start > timeout) reject(new Error(`Element with id ${id} not found after ${timeout}ms`));
                else setTimeout(check, 50);
            };
            check();
        });
    };

    // Force-kills ALL video tracks inside the scanner container,
    // regardless of html5-qrcode instance state. This is the nuclear option
    // that guarantees the OS releases the hardware lock.
    const killAllVideoTracks = () => {
        const container = document.getElementById(readerId.current);
        if (!container) return;
        const videos = container.querySelectorAll('video');
        videos.forEach(videoEl => {
            if (videoEl.srcObject instanceof MediaStream) {
                videoEl.srcObject.getTracks().forEach(track => {
                    track.stop();
                    console.debug(`[QRScanner] Force-killed track: ${track.label}`);
                });
                videoEl.srcObject = null;
            }
        });
    };

    const stopScanner = async () => {
        const instance = html5QrCodeRef.current;
        
        console.debug("[QRScanner] stopScanner called. Instance exists:", !!instance, "isScanning:", instance?.isScanning);
        
        // Step 1: Try the library's own stop if possible
        if (instance) {
            try {
                if (instance.isScanning) {
                    await instance.stop();
                }
                instance.clear();
            } catch (err) {
                console.warn("[QRScanner] Library stop/clear warning:", err);
            }
            html5QrCodeRef.current = null;
        }

        // Step 2: ALWAYS force-kill video tracks as a fail-safe.
        // This handles the case where the library thinks it stopped but the
        // OS still has the device locked (very common with USB cameras).
        killAllVideoTracks();

        // Step 3: Clear any leftover HTML the library injected into the container
        const container = document.getElementById(readerId.current);
        if (container) {
            container.innerHTML = '';
        }
    };

    const lastScannedCode = useRef<string>('');
    const lastScannedTime = useRef<number>(0);

    const startScanner = async (cameraIdOrConfig: any) => {
        if (isTransitioning.current) return false;
        
        isTransitioning.current = true;

        try {
            await waitForElement(readerId.current);

            // IMPORTANT: Clean up any previous instance/tracks BEFORE creating a new one.
            // Without this, switching to a USB camera leaves the old notebook camera's
            // <video> element in the DOM, showing the wrong feed.
            killAllVideoTracks();
            const container = document.getElementById(readerId.current);
            if (container) container.innerHTML = '';

            const { Html5Qrcode } = await import('html5-qrcode');
            const scannerInstance = new Html5Qrcode(readerId.current);
            html5QrCodeRef.current = scannerInstance;

            // html5-qrcode sets deviceId internally from the first argument of start().
            // Do NOT duplicate deviceId in videoConstraints or USB cameras may
            // get a conflicting double-constraint and fail with NotReadableError.
            const isIdString = typeof cameraIdOrConfig === 'string';
            const videoConstraints: MediaTrackConstraints = {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: isIdString ? undefined : (cameraIdOrConfig.facingMode || 'environment')
            };

            const cameraParam = isIdString 
                ? cameraIdOrConfig 
                : { facingMode: cameraIdOrConfig.facingMode || 'environment' };

            console.debug("[QRScanner] Directing hardware to:", cameraParam, "| videoConstraints:", videoConstraints);

            await scannerInstance.start(
                cameraParam,
                {
                    fps: 20,
                    qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                        const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
                        const qrboxSize = Math.floor(minEdgeSize * 0.95);
                        return { width: qrboxSize, height: qrboxSize };
                    },
                    videoConstraints: videoConstraints,
                    disableFlip: false,
                },
                async (decodedText: string) => {
                    // CONTINUOUS SCAN LOGIC: Preventing rapid-fire duplicates
                    const now = Date.now();
                    if (decodedText === lastScannedCode.current && (now - lastScannedTime.current) < 2000) {
                        return; // Ignore same code within 2 seconds
                    }

                    try {
                        const parsed = parseQRString(decodedText);
                        if (parsed || decodedText) {
                            lastScannedCode.current = decodedText;
                            lastScannedTime.current = now;

                            if (!isContinuous) {
                                try {
                                    if (!isTransitioning.current) {
                                        isTransitioning.current = true;
                                        await scannerInstance.stop();
                                        scannerInstance.clear();
                                        isTransitioning.current = false;
                                    }
                                } catch (e) { 
                                    isTransitioning.current = false;
                                }
                                setIsScanning(false);
                            } else {
                                // Provide visual/haptic feedback if possible
                                if (window.navigator && window.navigator.vibrate) {
                                    window.navigator.vibrate(100);
                                }
                            }
                            
                            onSuccess(parsed, decodedText);
                        }
                    } catch (err) {
                        console.error("[QRScanner] Success callback failed:", err);
                        isTransitioning.current = false;
                    }
                },
                () => { /* frame error silent */ }
            );

            // Verify the correct camera is actually streaming
            try {
                const track = scannerInstance.getRunningTrack();
                if (track) {
                    const settings = track.getSettings();
                    console.debug("[QRScanner] ✅ Active track:", track.label, "| deviceId:", settings.deviceId, "| resolution:", settings.width, "x", settings.height);
                }
            } catch (e) {
                console.debug("[QRScanner] Could not read track settings:", e);
            }

            // AGGRESSIVE FOCUS MANAGEMENT
            // Many modern cameras (and some USB 2.0) support focus control through MediaStreamTrack.
            try {
                const track = scannerInstance.getRunningTrack();
                if (track && track.applyConstraints) {
                    const capabilities = (track as any).getCapabilities?.() || {};
                    const constraints: any = { advanced: [] };

                    // 1. Try Continuous Focus (Best for scanners)
                    if (capabilities.focusMode?.includes('continuous')) {
                        constraints.advanced.push({ focusMode: 'continuous' });
                        console.debug("[QRScanner] Enabling Continuous Focus");
                    } 
                    // 2. Try Manual Focus if supported (some USB cams)
                    else if (capabilities.focusMode?.includes('manual')) {
                        constraints.advanced.push({ focusMode: 'manual', focusDistance: 0 }); // Try to focus far or near
                    }

                    // 3. Try Torch (Flashlight) if it's dark and supported
                    if (capabilities.torch) {
                        // We don't turn on automatically to avoid blinding, but we could if requested
                    }

                    if (constraints.advanced.length > 0) {
                        await track.applyConstraints(constraints).catch(err => {
                            console.warn("[QRScanner] Could not apply advanced focus constraints:", err);
                        });
                    }

                    // 4. PERIODIC FOCUS RESET (Fail-safe for cameras that 'get stuck' blurry)
                    // Every 5 seconds, we re-apply constraints to 'nudge' the hardware focus
                    const focusNudgeInterval = setInterval(async () => {
                        if (track.readyState === 'live') {
                            await track.applyConstraints(constraints).catch(() => {});
                        } else {
                            clearInterval(focusNudgeInterval);
                        }
                    }, 5000);
                }
            } catch (pEx) {
                console.debug("[QRScanner] Advanced hardware controls not available on this device:", pEx);
            }

            isTransitioning.current = false;
            return true;
        } catch (err: any) {
            console.error("[QRScanner] Failed to start scanner:", err);
            isTransitioning.current = false;
            
            const errMsg = String(err).toLowerCase();
            if (errMsg.includes("notreadable") || errMsg.includes("in use") || errMsg.includes("lock")) {
                toast.error("Câmera em uso ou bloqueada pelo sistema. Tente liberar o dispositivo.");
            } else if (errMsg.includes("constraint") || errMsg.includes("overconstrained")) {
                // If strict constraints failed, retry with ZERO constraints but keep
                // the same camera ID so USB cameras are not bypassed.
                console.warn("[QRScanner] Strict constraints failed, falling back to loose mode...");
                if (isIdString) {
                    // Retry the same device with no resolution/aspect constraints
                    return await startScanner({ facingMode: 'user' });
                }
                return await startScanner({ facingMode: 'environment' });
            } else {
                toast.error(`Erro: ${err.name || 'Câmera não responde'}`);
            }
            return false;
        }
    };

    useEffect(() => {
        let isMounted = true;

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
                    
                    const initialId = backCamera ? backCamera.id : devices[0].id;
                    setSelectedCameraId(initialId);
                    
                    // First set loading false to reveal the reader div in the DOM
                    setIsLoading(false);
                    
                    // CRITICAL FOR USB CAMERAS: getCameras() internally opens
                    // a getUserMedia stream to obtain device labels, then closes it.
                    // Built-in cameras release the hardware lock near-instantly,
                    // but USB cameras (especially USB 2.0) need extra time to
                    // fully release the device. Without this delay, the subsequent
                    // startScanner() gets NotReadableError because the OS still
                    // considers the camera "in use" from the enumeration stream.
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // startScanner will internally wait for the DOM element to appear
                    if (isMounted) {
                        await startScanner(initialId);
                    }
                } else {
                    setIsLoading(false);
                    setError('Nenhuma câmera detectada no dispositivo.');
                }
            } catch (err) {
                if (isMounted) {
                    console.error("[QRScanner] Init error:", err);
                    setError('Erro ao carregar o módulo de câmera.');
                    setIsLoading(false);
                }
            }
        };

        initScanner();

        return () => {
            isMounted = false;
            isTransitioning.current = false;
            stopScanner().catch(() => {});
        };
    }, []);

    const handleCameraChange = async (cameraId: string) => {
        if (isChangingCamera) return;
        
        console.debug("[QRScanner] === CAMERA SWITCH START ===");
        console.debug("[QRScanner] Switching to camera:", cameraId);
        setIsChangingCamera(true);
        setSelectedCameraId(cameraId);
        
        // Force-reset transitioning flag — if it was stuck from a previous
        // operation, it would permanently block all camera switches.
        isTransitioning.current = false;
        
        try {
            // 1. Nuclear stop: kill all tracks, clear container, null the instance
            await stopScanner();
            
            // 2. Extra delay to let hardware and browser internal streams fully release.
            // USB cameras need the OS to fully close the device handle before
            // a new getUserMedia can open it.
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 3. Restart with the new camera ID
            const success = await startScanner(cameraId);
            console.debug("[QRScanner] === CAMERA SWITCH", success ? "SUCCESS" : "FAILED", "===");
            
            if (!success) {
                toast.error("Não foi possível ativar esta câmera. Tente novamente.");
            }
        } catch (err) {
            console.error("[QRScanner] Camera switch failed:", err);
            toast.error("Erro ao trocar de câmera.");
        } finally {
            setIsChangingCamera(false);
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
                                        className="bg-transparent text-foreground text-xs font-bold w-full focus:outline-none cursor-pointer pr-4 disabled:opacity-50"
                                        value={selectedCameraId}
                                        onChange={(e) => handleCameraChange(e.target.value)}
                                        disabled={isChangingCamera}
                                    >
                                        {cameras.map(camera => (
                                            <option key={camera.id} value={camera.id} className="bg-card">
                                                {camera.label || `Câmera ${camera.id.substring(0, 5)}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                             <div className={`relative overflow-hidden rounded-3xl bg-black border-2 border-brand-orange-coral/20 ${isInline ? 'w-full aspect-video max-h-[60vh] mx-auto' : 'aspect-video'}`}>
                                <div id={readerId.current} className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full [&>video]:bg-black"></div>

                                {isScanning && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        {/* Scanner Frame - Optimized for 16:9 container */}
                                        <div className="absolute inset-0 flex items-center justify-center p-4">
                                            <div className="h-[90%] aspect-square border-4 border-brand-orange-coral/40 rounded-[2.5rem] relative">
                                                {/* Corner markers */}
                                                <div className="absolute -top-1 -left-1 w-12 h-12 border-t-8 border-l-8 border-white rounded-tl-2xl shadow-[0_0_20px_rgba(255,112,67,0.4)]"></div>
                                                <div className="absolute -top-1 -right-1 w-12 h-12 border-t-8 border-r-8 border-white rounded-tr-2xl shadow-[0_0_20px_rgba(255,112,67,0.4)]"></div>
                                                <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-8 border-l-8 border-white rounded-bl-2xl shadow-[0_0_20px_rgba(255,112,67,0.4)]"></div>
                                                <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-8 border-r-8 border-white rounded-br-2xl shadow-[0_0_20px_rgba(255,112,67,0.4)]"></div>
                                                
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
