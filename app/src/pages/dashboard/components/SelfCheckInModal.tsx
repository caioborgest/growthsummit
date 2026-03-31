import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { XCircle, Camera, CheckCircle2, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SelfCheckInModalProps {
    onClose: () => void;
    onScanSuccess: (decodedText: string) => Promise<void>;
    registration: any;
    initialStep?: number;
}

export function SelfCheckInModal({ onClose, onScanSuccess, registration, initialStep = 1 }: SelfCheckInModalProps) {
    const [step, setStep] = useState(initialStep); // 1: Info, 2: Scanner, 3: Success, 4: Manual
    const [loading, setLoading] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const readerId = useRef(`reader-${Math.random().toString(36).substring(2, 11)}`);

    useEffect(() => {
        let isChildMounted = true;
        let html5QrCode: Html5Qrcode | null = null;

        const startScanner = async () => {
            if (step !== 2 || !isChildMounted) return;

            // Wait a bit to ensure the DOM element is rendered
            const element = document.getElementById(readerId.current);
            if (!element) {
                console.warn("Scanner element not found yet, retrying...");
                setTimeout(startScanner, 100);
                return;
            }

            try {
                html5QrCode = new Html5Qrcode(readerId.current);
                html5QrCodeRef.current = html5QrCode;

                // Try to start with environment camera (rear)
                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 320, height: 320 }
                    },
                    async (decodedText) => {
                        if (!isChildMounted) return;
                        setLoading(true);
                        try {
                            if (html5QrCode?.isScanning) {
                                await html5QrCode.stop();
                            }
                            await onScanSuccess(decodedText);
                            if (isChildMounted) setStep(3);
                        } catch (error: unknown) {
                            const errorMessage = error instanceof Error ? error.message : 'Erro ao validar QR Code';
                            toast.error(errorMessage);
                            if (isChildMounted) setStep(1);
                        } finally {
                            if (isChildMounted) setLoading(false);
                        }
                    },
                    () => { } // silent scan failures
                );
            } catch (err: unknown) {
                console.warn("Falha ao iniciar câmera traseira, tentando qualquer câmera disponível:", err);

                // Fallback: Try any available camera if environment fails
                try {
                    if (!isChildMounted || !html5QrCode) return;
                    await html5QrCode.start(
                        { facingMode: "user" }, // Try front/any if back fails
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 }
                        },
                        async (decodedText) => {
                            if (!isChildMounted) return;
                            setLoading(true);
                            try {
                                if (html5QrCode?.isScanning) {
                                    await html5QrCode.stop();
                                }
                                await onScanSuccess(decodedText);
                                if (isChildMounted) setStep(3);
                            } catch (error: unknown) {
                                const errorMessage = error instanceof Error ? error.message : 'Erro ao validar QR Code';
                                toast.error(errorMessage);
                                if (isChildMounted) setStep(1);
                            } finally {
                                if (isChildMounted) setLoading(false);
                            }
                        },
                        () => { }
                    );
                } catch (fallbackErr) {
                    if (isChildMounted) {
                        console.error("Erro fatal ao iniciar câmera:", fallbackErr);
                        toast.error("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
                        setStep(1);
                    }
                }
            }
        };

        if (step === 2) {
            startScanner();
        }

        return () => {
            isChildMounted = false;
            if (html5QrCode?.isScanning) {
                html5QrCode.stop().then(() => {
                    html5QrCode?.clear();
                }).catch(() => { /* Ignore stop failures on unmount */ });
            } else {
                try {
                    html5QrCode?.clear();
                } catch {
                    // Ignore clear if not initialized
                }
            }
        };
    }, [step, onScanSuccess]);

    return (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-md bg-dark-200 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 text-gray-400 hover:text-white transition-colors bg-black/20 p-2 rounded-full backdrop-blur-sm"
                >
                    <XCircle className="h-7 w-7" />
                </button>

                {step === 1 && (
                    <div className="p-8 space-y-8">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-teal-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-teal-500/10">
                                <Camera className="h-10 w-10 text-teal-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Auto-Credenciamento</h2>
                            <p className="text-gray-400 leading-relaxed italic">
                                Utilize a câmera para confirmar sua entrada no evento ou sua presença nas salas de cursos e palestras.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { step: '1', text: 'Acesse o App' },
                                { step: '2', text: 'Acesse "Autocredenciamento"' },
                                { step: '3', text: 'Aponte a câmera para o QR Code' },
                                { step: '4', text: 'Credenciamento confirmado!' },
                            ].map((item) => (
                                <div key={item.step} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <span className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-teal-500/20">
                                        {item.step}
                                    </span>
                                    <p className="text-gray-200 font-medium">{item.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={() => setStep(2)}
                                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-black py-7 h-auto rounded-3xl text-lg shadow-xl shadow-teal-500/30 group"
                            >
                                INICIAR LEITURA
                                <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => setStep(4)}
                                className="w-full text-gray-500 hover:text-white font-bold h-12"
                            >
                                Digitar código manualmente
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Confirmar Presença</h2>
                            <p className="text-gray-400 text-sm">Aponte para o QR Code na sala, stand ou entrada</p>
                        </div>

                        <div className="relative rounded-[2rem] overflow-hidden border-2 border-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.2)]">
                            <div id={readerId.current} className="w-full h-80 bg-black"></div>

                            {/* Scanning Line Animation */}
                            {!loading && (
                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                    <div className="w-full h-[2px] bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,1)] absolute top-0 animate-scan-move"></div>
                                </div>
                            )}

                            {loading && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="h-12 w-12 text-teal-400 animate-spin" />
                                    <p className="text-white font-black tracking-[0.2em] uppercase text-xs">Validando...</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setStep(1)}
                                className="text-gray-500 hover:text-white font-bold h-14 rounded-2xl"
                            >
                                Voltar
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setStep(4)}
                                className="text-teal-400 hover:text-teal-300 font-bold h-14 rounded-2xl bg-white/5"
                            >
                                Digitar código
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="p-10 text-center space-y-8 relative overflow-hidden">
                        {/* Background light rays */}
                        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 via-transparent to-transparent pointer-events-none"></div>

                        <div className="relative">
                            <div className="w-24 h-24 bg-green-500/20 rounded-[2rem] flex items-center justify-center mx-auto animate-bounce shadow-[0_0_40px_rgba(34,197,94,0.3)] border border-green-500/20">
                                <CheckCircle2 className="h-14 w-14 text-green-400" />
                            </div>
                            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-4xl font-black text-white tracking-tighter">Credenciamento Confirmado!</h2>
                            <p className="text-2xl text-teal-400 font-black italic tracking-tight">Boas vindas!</p>
                            <p className="text-gray-400 leading-relaxed px-4 text-lg">
                                Aproveite o máximo do <strong className="text-white">Growth Experience</strong>. Sua presença foi registrada e seu certificado está sendo gerado.
                            </p>
                        </div>

                        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 space-y-3 backdrop-blur-sm">
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Status da Atividade</p>
                            <p className="text-white font-black text-xl flex items-center justify-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                                ACESSO LIBERADO
                            </p>
                        </div>

                        <Button
                            onClick={onClose}
                            className="w-full bg-white hover:bg-gray-100 text-black font-black py-7 h-auto rounded-[1.5rem] text-xl shadow-2xl transition-all active:scale-95"
                        >
                            APROVEITAR EVENTO
                        </Button>
                    </div>
                )}
                {step === 4 && (
                    <div className="p-8 space-y-8">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-orange-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/10">
                                <Sparkles className="h-10 w-10 text-orange-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Inserir Código</h2>
                            <p className="text-gray-400 leading-relaxed">
                                Insira o código de <strong>entrada no evento</strong> ou da <strong>sala/atividade</strong> abaixo.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Código da Atividade/Entrada</label>
                                <input
                                    type="text"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                    placeholder="Ex: GE-EVENT-ENTRY"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-black text-lg focus:outline-none focus:border-teal-500/50 transition-all placeholder:text-gray-700"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !loading) {
                                            e.preventDefault();
                                            // Chamar via trigger do botão para consistência
                                            document.getElementById('btn-confirmar-codigo')?.click();
                                        }
                                    }}
                                />
                            </div>

                            <Button
                                id="btn-confirmar-codigo"
                                onClick={async () => {
                                    if (!manualCode.trim()) {
                                        toast.error('Insira um código válido');
                                        return;
                                    }
                                    setLoading(true);
                                    try {
                                        await onScanSuccess(manualCode.trim());
                                        setStep(3);
                                    } catch (error: unknown) {
                                        const errorMessage = error instanceof Error ? error.message : 'Código inválido';
                                        toast.error(errorMessage);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading}
                                className="w-full bg-white hover:bg-gray-100 text-black font-black py-7 h-auto rounded-3xl text-lg shadow-xl transition-all"
                            >
                                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'CONFIRMAR CÓDIGO'}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => setStep(1)}
                                className="w-full text-gray-500 hover:text-white font-bold"
                            >
                                Voltar para o início
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


