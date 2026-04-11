import React, { useEffect } from 'react';
import { CheckCircle, XCircle, User, Ticket, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { Registration } from '@/types';

interface CheckInResultModalProps {
    result: 'success' | 'error' | 'duplicate' | 'exit' | null;
    registration: Registration | null;
    onClose: () => void;
    autoCloseMs?: number;
}

export function CheckInResultModal({
    result,
    registration,
    onClose,
    autoCloseMs = 1200
}: CheckInResultModalProps) {
    useEffect(() => {
        if (result && autoCloseMs > 0) {
            const timer = setTimeout(onClose, autoCloseMs);
            return () => clearTimeout(timer);
        }
    }, [result, autoCloseMs, onClose]);

    if (!result) return null;

    const isSuccess = result === 'success' || result === 'exit';
    const isExit = result === 'exit';
    const isDuplicate = result === 'duplicate';
    const isError = result === 'error';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    className={`w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border ${isExit 
                             ? 'bg-amber-500/10 border-amber-500/30'
                             : isSuccess
                             ? 'bg-green-500/10 border-green-500/30'
                             : 'bg-red-500/10 border-red-500/30'
                        }`}
                >
                    {/* Header/Status Icon */}
                    <div className={`py-10 flex flex-col items-center justify-center ${
                           isExit ? 'bg-amber-500' : isSuccess ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.05 }}
                        >
                            {isSuccess ? (
                                <CheckCircle className="h-32 w-32 text-white" />
                            ) : (
                                <XCircle className="h-32 w-32 text-white" />
                            )}
                        </motion.div>
                        <h2 className="text-white text-3xl font-black mt-6 tracking-tighter uppercase italic px-6 text-center">
                            {isExit ? 'SAÍDA REGISTRADA' : isSuccess ? 'Check-in Realizado!' : isDuplicate ? 'Ingresso já Utilizado' : 'Erro no Scanner'}
                        </h2>
                    </div>

                    <div className="p-8 space-y-6">
                        {registration ? (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <User className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Participante</p>
                                            <p className="text-white text-xl font-bold">{registration.name || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-4 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Ticket className="h-4 w-4 text-gray-400" />
                                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Ingresso</p>
                                            </div>
                                            <p className="text-white font-mono font-bold">{registration.ticketNumber}</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Horário</p>
                                            </div>
                                            <p className="text-white font-bold">
                                                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {isDuplicate && registration.checkInTime && (
                                    <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-2xl text-center">
                                        <p className="text-red-400 text-sm font-bold">
                                            Primeiro uso detectado em: {new Date(registration.checkInTime).toLocaleTimeString('pt-BR')}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-400 italic">Dados do ingresso não encontrados ou código inválido.</p>
                            </div>
                        )}

                        <div className="pt-4">
                            <Button
                                onClick={onClose}
                                className={`w-full h-16 rounded-2xl font-black text-lg transition-all ${isSuccess
                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20'
                                        : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                                    }`}
                            >
                                PROSSEGUIR (PRÓXIMO SCAN)
                            </Button>
                        </div>

                        <p className="text-center text-gray-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                            Fechando automaticamente em alguns segundos...
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
