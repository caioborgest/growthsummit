import { useState } from 'react';
import { Star, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface MentorRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    mentorName: string;
    sessionId: string;
    alreadyRated?: boolean;
    existingAvaliacaoMentoria?: number;
    existingIndicacaoMentor?: number;
    onSubmit: (
        sessionId: string,
        avaliacaoMentoria: number,
        indicacaoMentor: number
    ) => Promise<void>;
}

function StarSelector({
    value,
    onChange,
    label,
    disabled,
}: {
    value: number;
    onChange: (v: number) => void;
    label: string;
    disabled?: boolean;
}) {
    const [hovered, setHovered] = useState(0);
    const active = hovered || value;

    return (
        <div className="space-y-3">
            <p className="text-white text-sm font-semibold leading-snug">{label}</p>
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && onChange(star)}
                        onMouseEnter={() => !disabled && setHovered(star)}
                        onMouseLeave={() => !disabled && setHovered(0)}
                        className={`transition-all duration-150 ${disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                    >
                        <Star
                            className={`h-9 w-9 transition-colors duration-150 ${star <= active
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-600 fill-transparent stroke-gray-600'
                                }`}
                        />
                    </button>
                ))}
                {value > 0 && (
                    <span className="ml-2 text-yellow-400 font-black text-xl tabular-nums">{value}</span>
                )}
            </div>
            {value > 0 && (
                <p className="text-xs text-gray-500">
                    {value === 1 && 'Muito ruim'}
                    {value === 2 && 'Ruim'}
                    {value === 3 && 'Regular'}
                    {value === 4 && 'Bom'}
                    {value === 5 && 'Excelente!'}
                </p>
            )}
        </div>
    );
}

export function MentorRatingModal({
    isOpen,
    onClose,
    mentorName,
    sessionId,
    alreadyRated = false,
    existingAvaliacaoMentoria = 0,
    existingIndicacaoMentor = 0,
    onSubmit,
}: MentorRatingModalProps) {
    const [avaliacao, setAvaliacao] = useState(existingAvaliacaoMentoria);
    const [indicacao, setIndicacao] = useState(existingIndicacaoMentor);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(alreadyRated);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (avaliacao === 0 || indicacao === 0) return;
        setIsSubmitting(true);
        try {
            await onSubmit(sessionId, avaliacao, indicacao);
            setSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 20 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                    className="relative bg-dark-200 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl shadow-black/50"
                >
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {submitted ? (
                        /* Thank-you state */
                        <div className="text-center py-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                                <CheckCircle2 className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                            </motion.div>
                            <h3 className="text-2xl font-black text-white mb-2">Obrigado pelo feedback!</h3>
                            <p className="text-gray-400 text-sm">
                                Sua avaliação ajuda a melhorar a qualidade das mentorias e será compartilhada com <strong className="text-white">{mentorName}</strong>.
                            </p>
                            <div className="flex justify-center gap-6 mt-6">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className={`h-5 w-5 ${s <= avaliacao ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700 fill-transparent'}`} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Qualidade da mentoria</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className={`h-5 w-5 ${s <= indicacao ? 'text-orange-400 fill-orange-400' : 'text-gray-700 fill-transparent'}`} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Indicação do mentor</p>
                                </div>
                            </div>
                            <Button className="mt-6 bg-teal-500 hover:bg-teal-600 text-white font-bold w-full" onClick={onClose}>
                                Fechar
                            </Button>
                        </div>
                    ) : (
                        /* Rating form */
                        <>
                            <div className="mb-6">
                                <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-4">
                                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                                    <span className="text-yellow-400 text-xs font-black uppercase tracking-wider">Avalie sua mentoria</span>
                                </div>
                                <h3 className="text-xl font-black text-white leading-tight">
                                    Como foi a sessão com <span className="text-teal-400">{mentorName}</span>?
                                </h3>
                                <p className="text-gray-500 text-xs mt-1">Sua avaliação é confidencial e ajuda o mentor a evoluir.</p>
                            </div>

                            <div className="space-y-7">
                                <StarSelector
                                    value={avaliacao}
                                    onChange={setAvaliacao}
                                    label="Numa escala de 1 a 5, como você avalia a mentoria realizada?"
                                    disabled={alreadyRated}
                                />
                                <div className="border-t border-white/5" />
                                <StarSelector
                                    value={indicacao}
                                    onChange={setIndicacao}
                                    label="Numa escala de 1 a 5, quanto você indicaria este mentor a um empresário?"
                                    disabled={alreadyRated}
                                />
                            </div>

                            <div className="flex gap-3 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1 border-dark-300 text-gray-400 hover:bg-white/5"
                                >
                                    Agora não
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={avaliacao === 0 || indicacao === 0 || isSubmitting}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black disabled:opacity-40"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</>
                                    ) : (
                                        <><Star className="h-4 w-4 mr-2 fill-current" />Enviar Avaliação</>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
