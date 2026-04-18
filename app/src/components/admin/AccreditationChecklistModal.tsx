import { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle2,
    Package,
    Contact,
    AlertCircle,
    Loader2,
    Calendar,
    User,
    Building2,
    Rocket,
    X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCheckIns } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/lib/supabase';
import { toggleCheckInRegistrationAtomic } from '@/lib/checkInAtomic';
import type { Registration, Mentor, Company, Startup, PartnerTeamMember } from '@/types';
import { CertificateService } from '@/lib/certificateService';

type Entity = Registration | Mentor | Company | Startup | PartnerTeamMember;

interface AccreditationChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    entity: Entity | null;
    role: 'participant' | 'mentor' | 'company' | 'startup' | 'partner';
    projectId: string;
    onSuccess: () => void;
}

export function AccreditationChecklistModal({ isOpen, onClose, entity, role, projectId, onSuccess }: AccreditationChecklistModalProps) {
    const { user } = useAuth();
    const { selectedProject } = useProject();
    const { data: checkIns, create: createCheckIn } = useCheckIns();
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [entranceConfirmed, setEntranceConfirmed] = useState(false);
    const [kitDelivered, setKitDelivered] = useState(false);
    const [badgeDelivered, setBadgeDelivered] = useState(false);

    // Helper to get registration ID or generic Entity ID
    const getRegistrationId = () => {
        if (role === 'participant') return (entity as Registration).id;
        return null; // Don't send pseudo-IDs to UUID columns
    };

    const getUserId = useCallback(() => entity?.userId || '', [entity]);

    // Load existing status from checkIns
    useEffect(() => {
        if (!isOpen || !entity) return;

        const userId = getUserId();
        const existingCheckIns = checkIns.filter(c => c.userId === userId && c.location && c.location.includes('Credenciamento'));

        setEntranceConfirmed(existingCheckIns.length > 0);

        const kit = existingCheckIns.some(c => c.location && c.location.includes('Kit: Sim'));
        const badge = existingCheckIns.some(c => c.location && c.location.includes('Crachá: Sim'));

        setKitDelivered(kit);
        setBadgeDelivered(badge);
    }, [isOpen, entity, checkIns, getUserId]);

    const handleAccreditation = async () => {
        if (!entity || !entranceConfirmed) {
            toast.error('Confirme ao menos a entrada para prosseguir.');
            return;
        }

        setIsLoading(true);
        try {
            const timestamp = new Date().toISOString();
            
            // 1. Atomic Check-In
            // Using the RPC function to ensure atomic update and valid user mapping
            const res = await toggleCheckInRegistrationAtomic({
                registrationId: entity.id, // Direct ID from entity
                projectId: entity.projectId || projectId,
                action: 'check-in',
                userId: getUserId(),
                ticketNumber: (entity as Registration).ticketNumber || (entity as any).qrCode || `ROLE_${role.toUpperCase()}`,
                operatorId: user?.id,
                location: `Credenciamento - Kit: ${kitDelivered ? 'Sim' : 'Nao'}, Crachá: ${badgeDelivered ? 'Sim' : 'Nao'}`,
                method: 'manual'
            });

            if (!res.ok) {
                throw new Error(res.message);
            }

            // 2. Role-specific additional updates
            if (role === 'partner') {
                await supabase
                    .from('partner_team_members')
                    .update({ 
                        checked_in: true, 
                        check_in_time: timestamp 
                    })
                    .eq('id', entity.id);
            }

            // Emit certificate if participant
            if (role === 'participant' && selectedProject) {
                CertificateService.issueEventCertificate(
                    { id: getUserId(), name: (entity as Registration).nome || (entity as Registration).name || 'Participante' },
                    selectedProject,
                    entity.id
                );
            }

            toast.success(`Credenciamento de ${role} atualizado!`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Erro no credenciamento:', error);
            toast.error('Erro ao salvar credenciamento.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!entity) return null;

    const getRoleIcon = () => {
        switch (role) {
            case 'mentor': return <User className="h-5 w-5 text-blue-400" />;
            case 'company': return <Building2 className="h-5 w-5 text-purple-400" />;
            case 'startup': return <Rocket className="h-5 w-5 text-teal-400" />;
            case 'partner': return <Building2 className="h-5 w-5 text-emerald-400" />;
            default: return <Calendar className="h-5 w-5 text-brand-orange-coral" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="admin-modal-content max-w-md bg-dark-200 border-none p-0 overflow-hidden shadow-2xl">
                <div className="admin-modal-header p-8 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                            {getRoleIcon()}
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
                                <span className="text-brand-orange-coral">Checklist</span> de Acesso
                            </DialogTitle>
                            <VisuallyHidden.Root>
                                <DialogDescription>
                                    Validar entrada, crachá e kit do participante
                                </DialogDescription>
                            </VisuallyHidden.Root>
                            <Badge variant="outline" className="uppercase font-black border-brand-orange-coral/30 text-brand-orange-coral text-[8px] tracking-widest px-2 py-0 h-4">
                                {role}
                            </Badge>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-10 w-10 rounded-xl text-gray-500 hover:text-white hover:bg-white/5"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <div className="admin-modal-body p-8 pt-4 flex-1 overflow-y-auto custom-scrollbar bg-dark-200">
                    <div className="py-4 space-y-8">
                        {/* User Info Card */}
                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-inner">
                            <p className="text-white font-black italic text-xl leading-tight uppercase">{(entity as any).name || (entity as any).nome || 'Sem Nome'}</p>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">{(entity as any).email}</p>
                            <div className="mt-4 flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Identificador:</span>
                                <span className="font-mono text-[10px] text-teal-500 font-bold">{entity.id.slice(0, 12)}...</span>
                            </div>
                        </div>

                        {/* Step Options */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] px-2 italic">Validação de Credenciais</h4>
                            
                            {/* Step 1: Entrance */}
                            <button
                                onClick={() => setEntranceConfirmed(!entranceConfirmed)}
                                className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all duration-300 ${
                                    entranceConfirmed 
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                    : 'bg-white/5 border-white/5 text-gray-600 hover:border-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${entranceConfirmed ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                                        <CheckCircle2 className={`h-6 w-6 ${entranceConfirmed ? 'text-emerald-400' : 'text-gray-700'}`} />
                                    </div>
                                    <div>
                                        <p className="font-black italic uppercase tracking-tight text-sm">Confirmar Entrada</p>
                                        <p className="text-[9px] font-black uppercase opacity-60 tracking-widest leading-none mt-1">Check-in físico no evento</p>
                                    </div>
                                </div>
                                {entranceConfirmed && (
                                    <div className="bg-emerald-500 h-6 px-3 rounded-lg flex items-center justify-center shadow-glow-sm">
                                        <span className="text-white text-[9px] font-black italic">✓ OK</span>
                                    </div>
                                )}
                            </button>

                            {/* Step 2: Badge */}
                            <button
                                onClick={() => setBadgeDelivered(!badgeDelivered)}
                                className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all duration-300 ${
                                    badgeDelivered 
                                    ? 'bg-brand-orange-coral/10 border-brand-orange-coral/30 text-brand-orange-coral' 
                                    : 'bg-white/5 border-white/5 text-gray-600 hover:border-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${badgeDelivered ? 'bg-brand-orange-coral/20 border-brand-orange-coral/30' : 'bg-white/5 border-white/10'}`}>
                                        <Contact className={`h-6 w-6 ${badgeDelivered ? 'text-brand-orange-coral' : 'text-gray-700'}`} />
                                    </div>
                                    <div>
                                        <p className="font-black italic uppercase tracking-tight text-sm">Entrega de Crachá</p>
                                        <p className="text-[9px] font-black uppercase opacity-60 tracking-widest leading-none mt-1">Identificação visual premium</p>
                                    </div>
                                </div>
                                {badgeDelivered && (
                                    <div className="bg-brand-orange-coral h-6 px-3 rounded-lg flex items-center justify-center shadow-glow-orange">
                                        <span className="text-white text-[9px] font-black italic">✓ ENTREGUE</span>
                                    </div>
                                )}
                            </button>

                            {/* Step 3: Kit */}
                            <button
                                onClick={() => setKitDelivered(!kitDelivered)}
                                className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all duration-300 ${
                                    kitDelivered 
                                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
                                    : 'bg-white/5 border-white/5 text-gray-600 hover:border-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${kitDelivered ? 'bg-teal-500/20 border-teal-500/30' : 'bg-white/5 border-white/10'}`}>
                                        <Package className={`h-6 w-6 ${kitDelivered ? 'text-teal-400' : 'text-gray-700'}`} />
                                    </div>
                                    <div>
                                        <p className="font-black italic uppercase tracking-tight text-sm">Entrega de Kit</p>
                                        <p className="text-[9px] font-black uppercase opacity-60 tracking-widest leading-none mt-1">Materiais e experiências</p>
                                    </div>
                                </div>
                                {kitDelivered && (
                                    <div className="bg-teal-500 h-6 px-3 rounded-lg flex items-center justify-center shadow-glow-teal">
                                        <span className="text-white text-[9px] font-black italic">✓ ENTREGUE</span>
                                    </div>
                                )}
                            </button>
                        </div>

                        {!entranceConfirmed && (
                            <div className="p-4 rounded-2xl bg-brand-orange-coral/5 border border-brand-orange-coral/10 flex gap-3 shadow-inner">
                                <AlertCircle className="h-5 w-5 text-brand-orange-coral shrink-0 mt-0.5" />
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">
                                    AVISO: CONFIRME A ENTRADA PARA GERAR O REGISTRO DE PRESENÇA ANTES DE ENTREGAR OS MATERIAIS.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="admin-modal-footer p-8 pt-0 flex gap-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white font-bold h-12 px-8 rounded-xl border border-white/5"
                    >
                        CANCELAR
                    </Button>
                    <Button
                        onClick={handleAccreditation}
                        disabled={isLoading || !entranceConfirmed}
                        className="flex-1 bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black px-10 h-12 rounded-xl shadow-glow-orange border-none uppercase flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'FINALIZAR ACREDITAÇÃO'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
