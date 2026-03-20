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
    Rocket
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCheckIns } from '@/hooks/useData';
import type { Registration, Mentor, Company, Startup } from '@/types';

type Entity = Registration | Mentor | Company | Startup;

interface AccreditationChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    entity: Entity | null;
    role: 'participant' | 'mentor' | 'company' | 'startup';
    onSuccess: () => void;
}

export function AccreditationChecklistModal({ isOpen, onClose, entity, role, onSuccess }: AccreditationChecklistModalProps) {
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
            await createCheckIn({
                projectId: entity.projectId,
                registrationId: getRegistrationId() as string, 
                userId: getUserId(),
                ticketNumber: (entity as Registration).ticketNumber || 'N/A',
                timestamp: new Date().toISOString(),
                location: `Credenciamento - Kit: ${kitDelivered ? 'Sim' : 'Nao'}, Crachá: ${badgeDelivered ? 'Sim' : 'Nao'}`,
                method: 'manual'
            });

            toast.success('Credenciamento atualizado com sucesso!');
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
            default: return <Calendar className="h-5 w-5 text-brand-orange-coral" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#0c0e12] border-white/10 text-white max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                            {getRoleIcon()}
                        </div>
                        <Badge variant="outline" className="uppercase font-black border-brand-orange-coral/30 text-brand-orange-coral">
                            {role}
                        </Badge>
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                        Checklist de Credenciamento
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Confirme a entrega de materiais e entrada no evento.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* User Info Card */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-white font-bold text-lg leading-tight">{(entity as any).name || (entity as any).nome || 'Sem Nome'}</p>
                        <p className="text-gray-500 text-sm">{(entity as any).email}</p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">ID:</span>
                            <span className="font-mono text-[10px] text-gray-400">{entity.id.slice(0, 8)}...</span>
                        </div>
                    </div>

                    {/* Step Options */}
                    <div className="space-y-3">
                        {/* Step 1: Entrance */}
                        <button
                            onClick={() => setEntranceConfirmed(!entranceConfirmed)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                                entranceConfirmed 
                                ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                                : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className={`h-6 w-6 ${entranceConfirmed ? 'text-green-400' : 'text-gray-600'}`} />
                                <div className="text-left">
                                    <p className="font-bold">Confirmar Entrada</p>
                                    <p className="text-[10px] uppercase opacity-60">Entrada física no evento</p>
                                </div>
                            </div>
                            {entranceConfirmed && <Badge className="bg-green-500 text-white">OK</Badge>}
                        </button>

                        {/* Step 2: Badge */}
                        <button
                            onClick={() => setBadgeDelivered(!badgeDelivered)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                                badgeDelivered 
                                ? 'bg-brand-orange-coral/10 border-brand-orange-coral/50 text-brand-orange-coral' 
                                : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Contact className={`h-6 w-6 ${badgeDelivered ? 'text-brand-orange-coral' : 'text-gray-600'}`} />
                                <div className="text-left">
                                    <p className="font-bold">Entrega de Crachá</p>
                                    <p className="text-[10px] uppercase opacity-60">Identificação física</p>
                                </div>
                            </div>
                            {badgeDelivered && <Badge className="bg-brand-orange-coral text-white">ENTREGUE</Badge>}
                        </button>

                        {/* Step 3: Kit */}
                        <button
                            onClick={() => setKitDelivered(!kitDelivered)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                                kitDelivered 
                                ? 'bg-teal-500/10 border-teal-500/50 text-teal-400' 
                                : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Package className={`h-6 w-6 ${kitDelivered ? 'text-teal-400' : 'text-gray-600'}`} />
                                <div className="text-left">
                                    <p className="font-bold">Entrega de Kit</p>
                                    <p className="text-[10px] uppercase opacity-60">Materiais promocionais</p>
                                </div>
                            </div>
                            {kitDelivered && <Badge className="bg-teal-500 text-white">ENTREGUE</Badge>}
                        </button>
                    </div>

                    {!entranceConfirmed && (
                        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-orange-200/80">
                                Recomendado: Confirme a entrada para gerar o log de presença antes de entregar materiais.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleAccreditation}
                        disabled={isLoading || !entranceConfirmed}
                        className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black px-8 rounded-xl min-w-[160px]"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            'FINALIZAR'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
