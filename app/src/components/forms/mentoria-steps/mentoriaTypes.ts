
export interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    label: string;
}

export const MENTORSHIP_TIME_SLOTS: TimeSlot[] = [
    // Morning: 08:00 to 12:00
    { id: '08:00', startTime: '08:00', endTime: '08:20', label: '08:00 - 08:20' },
    { id: '08:20', startTime: '08:20', endTime: '08:40', label: '08:20 - 08:40' },
    { id: '08:40', startTime: '08:40', endTime: '09:00', label: '08:40 - 09:00' },
    { id: '09:00', startTime: '09:00', endTime: '09:20', label: '09:00 - 09:20' },
    { id: '09:20', startTime: '09:20', endTime: '09:40', label: '09:20 - 09:40' },
    { id: '09:40', startTime: '09:40', endTime: '10:00', label: '09:40 - 10:00' },
    { id: '10:00', startTime: '10:00', endTime: '10:20', label: '10:00 - 10:20' },
    { id: '10:20', startTime: '10:20', endTime: '10:40', label: '10:20 - 10:40' },
    { id: '10:40', startTime: '10:40', endTime: '11:00', label: '10:40 - 11:00' },
    { id: '11:00', startTime: '11:00', endTime: '11:20', label: '11:00 - 11:20' },
    { id: '11:20', startTime: '11:20', endTime: '11:40', label: '11:20 - 11:40' },
    { id: '11:40', startTime: '11:40', endTime: '12:00', label: '11:40 - 12:00' },

    // Afternoon: 14:00 to 17:00
    { id: '14:00', startTime: '14:00', endTime: '14:20', label: '14:00 - 14:20' },
    { id: '14:20', startTime: '14:20', endTime: '14:40', label: '14:20 - 14:40' },
    { id: '14:40', startTime: '14:40', endTime: '15:00', label: '14:40 - 15:00' },
    { id: '15:00', startTime: '15:00', endTime: '15:20', label: '15:00 - 15:20' },
    { id: '15:20', startTime: '15:20', endTime: '15:40', label: '15:20 - 15:40' },
    { id: '15:40', startTime: '15:40', endTime: '16:00', label: '15:40 - 16:00' },
    { id: '16:00', startTime: '16:00', endTime: '16:20', label: '16:00 - 16:20' },
    { id: '16:20', startTime: '16:20', endTime: '16:40', label: '16:20 - 16:40' },
    { id: '16:40', startTime: '16:40', endTime: '17:00', label: '16:40 - 17:00' },
];

export interface DadosMentoria {
    area: string;
    mentorId: string;
    slotId: string; // The time string (e.g. '08:00')
    selectedDate?: string; // The ISO date string (YYYY-MM-DD)
    descricaoProblema: string;
    nome: string;
    email: string;
    phone: string;
    senha: string;
    userId?: string;
    inscricaoId?: string;
    // Business data fields requested
    nomeNegocio?: string;
    estagioNegocio?: string;
}
