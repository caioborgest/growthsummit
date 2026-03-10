import { useMemo } from 'react';
import { Trophy, Star, TrendingUp, Award } from 'lucide-react';
import { usePitchScores, useStartups } from '@/hooks/useData';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function PitchLeaderboard() {
    const { data: scores, isLoading: loadingScores } = usePitchScores();
    const { data: startups, isLoading: loadingStartups } = useStartups();

    const leaderboard = useMemo(() => {
        if (!scores.length || !startups.length) return [];

        // Group scores by startup
        const startupScores: Record<string, { total: number, count: number, innovation: number, market: number, presentation: number, business: number }> = {};

        scores.forEach(score => {
            if (!startupScores[score.startupId]) {
                startupScores[score.startupId] = { total: 0, count: 0, innovation: 0, market: 0, presentation: 0, business: 0 };
            }
            startupScores[score.startupId].total += Number(score.totalScore);
            startupScores[score.startupId].count += 1;
            startupScores[score.startupId].innovation += score.innovationScore;
            startupScores[score.startupId].market += score.marketScore;
            startupScores[score.startupId].presentation += score.presentationScore;
            startupScores[score.startupId].business += score.businessModelScore;
        });

        // Map to startup data and sort
        return Object.entries(startupScores)
            .map(([id, data]) => {
                const startup = startups.find(s => s.id === id);
                return {
                    id,
                    name: startup?.startupName || 'Startup Desconhecida',
                    avgScore: data.total / data.count,
                    votes: data.count,
                    avgInnovation: data.innovation / data.count,
                    avgMarket: data.market / data.count,
                    avgPresentation: data.presentation / data.count,
                    avgBusiness: data.business / data.count
                };
            })
            .sort((a, b) => b.avgScore - a.avgScore);
    }, [scores, startups]);

    if (loadingScores || loadingStartups) {
        return <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-dark-100 rounded-lg" />)}
        </div>;
    }

    if (!leaderboard.length) {
        return (
            <div className="text-center py-10 bg-dark-100 rounded-xl border border-dashed border-dark-300">
                <Star className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum voto registrado ainda.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {leaderboard.map((item, index) => (
                <Card key={item.id} className="bg-dark-100 border-dark-300 p-4 hover:border-teal-500/50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? 'bg-yellow-500 text-dark' :
                                    index === 1 ? 'bg-gray-300 text-dark' :
                                        index === 2 ? 'bg-orange-600 text-white' : 'bg-dark-300 text-gray-400'
                                }`}>
                                {index + 1}
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">{item.name}</h3>
                                <p className="text-gray-500 text-xs">{item.votes} votos registrados</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="flex items-center justify-end gap-2 text-teal-400 font-black text-2xl">
                                {item.avgScore.toFixed(2)}
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <p className="text-gray-500 text-xs">Média Geral</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-dark-300">
                        <div className="text-center">
                            <p className="text-gray-400 text-[10px] uppercase">Inovação</p>
                            <p className="text-white font-medium text-sm">{item.avgInnovation.toFixed(1)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400 text-[10px] uppercase">Mercado</p>
                            <p className="text-white font-medium text-sm">{item.avgMarket.toFixed(1)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400 text-[10px] uppercase">Pitch</p>
                            <p className="text-white font-medium text-sm">{item.avgPresentation.toFixed(1)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400 text-[10px] uppercase">Modelo</p>
                            <p className="text-white font-medium text-sm">{item.avgBusiness.toFixed(1)}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
