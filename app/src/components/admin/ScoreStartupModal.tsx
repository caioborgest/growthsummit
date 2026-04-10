import { useState } from 'react';
import { Star, MessageSquare, Save, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { usePitchScores } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Startup } from '@/types';

interface ScoreStartupModalProps {
    isOpen: boolean;
    onClose: () => void;
    startup: Startup | null;
    projectId: string;
}

export function ScoreStartupModal({ isOpen, onClose, startup, projectId }: ScoreStartupModalProps) {
    const { user } = useAuth();
    const { create, data: existingScores } = usePitchScores();
    const [loading, setLoading] = useState(false);

    const [scores, setScores] = useState({
        innovation: 5,
        market: 5,
        presentation: 5,
        businessModel: 5,
        notes: ''
    });

    if (!startup) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            await create({
                projectId,
                startupId: startup.id,
                judgeId: user.id,
                innovationScore: scores.innovation,
                marketScore: scores.market,
                presentationScore: scores.presentation,
                businessModelScore: scores.businessModel,
                notes: scores.notes
            });

            toast.success(`Nota registrada para ${startup.name}!`);
            onClose();
        } catch (err: any) {
            console.error('Erro ao votar:', err);
            if (err.message?.includes('unique_violation')) {
                toast.error('Você já votou nesta startup.');
            } else {
                toast.error('Erro ao registrar nota. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const ScoreSlider = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label className="text-gray-300">{label}</Label>
                <span className="text-teal-400 font-bold text-lg">{value}</span>
            </div>
            <Slider
                value={[value]}
                onValueChange={(vals) => onChange(vals[0])}
                max={10}
                min={1}
                step={1}
                className="py-4"
            />
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="admin-modal-content p-0 border-none max-w-md">
                <div className="admin-modal-header">
                    <div>
                        <DialogTitle className="text-xl font-black italic uppercase leading-none flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            Avaliar <span className="text-brand-orange-coral">Startup</span>
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 uppercase text-[9px] font-bold tracking-widest mt-1">
                            {startup.startupName || startup.name} • Evento Pitch Arena
                        </DialogDescription>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col min-h-0 overflow-hidden">
                    <div className="admin-modal-body overflow-y-auto custom-scrollbar">
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <ScoreSlider
                                    label="Inovação & Tecnologia"
                                    value={scores.innovation}
                                    onChange={(v) => setScores({ ...scores, innovation: v })}
                                />
                                <ScoreSlider
                                    label="Potencial de Mercado"
                                    value={scores.market}
                                    onChange={(v) => setScores({ ...scores, market: v })}
                                />
                                <ScoreSlider
                                    label="Apresentação & Pitch"
                                    value={scores.presentation}
                                    onChange={(v) => setScores({ ...scores, presentation: v })}
                                />
                                <ScoreSlider
                                    label="Modelo de Negócio"
                                    value={scores.businessModel}
                                    onChange={(v) => setScores({ ...scores, businessModel: v })}
                                />

                                <div className="space-y-2 pt-4 border-t border-white/5">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Observações (Opcional)
                                    </label>
                                    <Textarea
                                        value={scores.notes}
                                        onChange={(e) => setScores({ ...scores, notes: e.target.value })}
                                        placeholder="Feedback construtivo para os empreendedores..."
                                        className="bg-dark-100 border-white/5 text-white font-medium min-h-[100px] resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-modal-footer">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-gray-500 font-bold uppercase text-[10px] tracking-widest"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-14 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-2xl shadow-glow-orange transition-all uppercase tracking-widest text-[10px]"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Salvando...' : 'Registrar Voto'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
