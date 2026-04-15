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
                    className={`w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl border ${isExit 
                             ? 'bg-amber-500/10 border-amber-500/30'
                             : isSuccess
                             ? 'bg-green-500/10 border-green-500/30'
                             : 'bg-red-500/10 border-red-500/30'
                        }`}
                >
                    {/* Header/Status Icon */}
                    <div className={`py-8 flex flex-col items-center justify-center ${
                           isExit ? 'bg-amber-500' : isSuccess ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.05 }}
                        >
                            {isSuccess ? (
                                <CheckCircle className="h-20 w-20 text-white" />
                            ) : (
                                <XCircle className="h-20 w-20 text-white" />
                            )}
                        </motion.div>
                        <h2 className="text-white text-2xl font-black mt-4 tracking-tighter uppercase italic px-6 text-center">
                            {isExit ? 'SAÍDA REGISTRADA' : isSuccess ? 'Check-in Realizado!' : isDuplicate ? 'Ingresso já Utilizado' : 'Erro no Scanner'}
                        </h2>
                    </div>

                    <div className="p-6 space-y-4">
                        {registration ? (
                            <>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Participante</p>
                                            <p className="text-white text-lg font-bold truncate max-w-[200px]">{registration.name || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 p-3 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Ticket className="h-3 w-3 text-gray-400" />
                                                <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Ingresso</p>
                                            </div>
                                            <p className="text-white font-mono font-bold text-sm truncate">{registration.ticketNumber}</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock className="h-3 w-3 text-gray-400" />
                                                <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Horário</p>
                                            </div>
                                            <p className="text-white font-bold text-sm">
                                                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {isDuplicate && registration.checkInTime && (
                                    <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-2xl text-center">
                                        <p className="text-red-400 text-[10px] font-bold">
                                            Primeiro uso: {new Date(registration.checkInTime).toLocaleTimeString('pt-BR')}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-gray-400 text-sm italic">Dados não encontrados ou código inválido.</p>
                            </div>
                        )}

                        <div className="pt-2">
                            <Button
                                onClick={onClose}
                                className={`w-full h-14 rounded-xl font-black text-sm transition-all ${isSuccess
                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20'
                                        : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                                    }`}
                            >
                                PROSSEGUIR (PRÓXIMO)
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
