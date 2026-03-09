import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, X, CheckCircle, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useB2BAppointmentsTriunfo, useProject } from '@/hooks/useData';
import type { B2BMatch, Company } from '@/types';

interface B2BScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    match: B2BMatch;
    otherCompany: Company;
    currentCompanyId: string;
}

const AVAILABLE_TIMES = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export function B2BScheduleModal({ isOpen, onClose, match, otherCompany, currentCompanyId }: B2BScheduleModalProps) {
    const { create } = useB2BAppointmentsTriunfo();
    const { update: updateMatch } = useB2BMatches();
    const { selectedProject } = useProject();
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSchedule = async () => {
        if (!selectedTime) {
            toast.error('Selecione um horário');
            return;
        }

        try {
            setIsSubmitting(true);
            // Construct date string - Assuming event is fixed date or from project
            const dateStr = selectedProject?.startDate
                ? new Date(selectedProject.startDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];

            const [hours, minutes] = selectedTime.split(':');
            const scheduledDate = new Date(`${dateStr}T${hours}:${minutes}:00`);

            // 1. Create the appointment
            await create({
                projectId: match.projectId,
                matchId: match.id,
                companyAId: currentCompanyId,
                companyBId: otherCompany.id,
                scheduledAt: scheduledDate.toISOString(),
                durationMinutes: 20,
                tableNumber: Math.floor(Math.random() * 20) + 1 + '', // Mock random table
                status: 'scheduled',
            } as any);

            // 2. Update match status
            await updateMatch(match.id, { status: 'scheduled' } as any);

            toast.success('Reunião agendada com sucesso!');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao agendar reunião');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-dark-200 border border-dark-300 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-dark-300 flex justify-between items-center bg-dark-200/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-teal-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Agendar Reunião B2B</h2>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Ajuste de Horário</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-dark-300 hover:bg-dark-400 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6 bg-dark-100 p-4 rounded-2xl border border-dark-300">
                        <div className="w-16 h-16 rounded-xl bg-dark-300 p-2 relative flex-shrink-0 border border-dark-400 shadow-inner">
                            {otherCompany.logoUrl ? (
                                <img src={otherCompany.logoUrl} alt={otherCompany.name} className="w-full h-full object-contain rounded-lg" />
                            ) : (
                                <Handshake className="w-full h-full text-gray-600 p-2" />
                            )}
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg leading-tight">{otherCompany.name}</p>
                            <Badge variant="outline" className="border-teal-500/20 text-teal-400 text-[10px] mt-1 uppercase">
                                {otherCompany.sector || 'Parceiro Estratégico'}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-teal-500" />
                                Selecione o Horário (Duração: 20min)
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {AVAILABLE_TIMES.map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-3 rounded-xl text-sm font-bold transition-all border
                      ${selectedTime === time
                                                ? 'bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20'
                                                : 'bg-dark-300 text-gray-400 border-transparent hover:bg-dark-400 hover:text-white hover:border-dark-400/50'
                                            }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-dark-300 bg-dark-100/50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-dark-300 rounded-xl">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSchedule}
                        disabled={!selectedTime || isSubmitting}
                        className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 rounded-xl shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:shadow-none"
                    >
                        {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
