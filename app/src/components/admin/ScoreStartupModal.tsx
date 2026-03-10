import { useState } from 'react';
import { Star, MessageSquare, Save, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
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
            <DialogContent className="bg-dark-200 border-dark-300 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        Avaliar Startup: {startup.name}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Atribua notas de 1 a 10 para cada critério abaixo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-gray-300">
                                <MessageSquare className="h-4 w-4" />
                                Observações (Opcional)
                            </Label>
                            <Textarea
                                value={scores.notes}
                                onChange={(e) => setScores({ ...scores, notes: e.target.value })}
                                placeholder="Feedback para os empreendedores..."
                                className="bg-dark-100 border-dark-300 min-h-[100px] text-white"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-dark-300">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 border-dark-300 text-gray-400 hover:bg-dark-100"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Salvando...' : 'Salvar Nota'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
