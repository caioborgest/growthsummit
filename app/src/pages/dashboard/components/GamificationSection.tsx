import { useMemo } from 'react';
import { Trophy, CheckCircle2, QrCode, MapPin, Sparkles, Star } from 'lucide-react';
import { useStands, useStandCheckIns } from '@/hooks/useData';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface GamificationSectionProps {
  registrationId: string;
}

export function GamificationSection({ registrationId }: GamificationSectionProps) {
  const { data: stands, isLoading: loadingStands } = useStands();
  const { data: checkins, isLoading: loadingCheckins } = useStandCheckIns();

  const myCheckins = useMemo(() => {
    return checkins.filter(c => c.registrationId === registrationId);
  }, [checkins, registrationId]);

  const progress = useMemo(() => {
    if (!stands.length) return 0;
    return (myCheckins.length / stands.length) * 100;
  }, [stands, myCheckins]);

  const visitedStandIds = new Set(myCheckins.map(c => c.standId));

  if (loadingStands || loadingCheckins) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Resumo do Progresso */}
      <Card className="bg-dark-200 border-white/5 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-teal-500/5 opacity-50" />
        
        <div className="p-6 sm:p-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Circuito de Prêmios</h3>
                  <p className="text-sm text-gray-400">Visite os stands e concorra a sorteios exclusivos</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Seu Progresso: <span className="text-white">{myCheckins.length} de {stands.length} stands</span></span>
                  <span className="text-orange-500 font-bold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/5" indicatorClassName="bg-gradient-to-r from-orange-500 to-orange-400" />
              </div>
            </div>

            <div className="bg-dark-300 rounded-3xl p-6 border border-white/5 flex flex-col items-center justify-center text-center min-w-[200px]">
              {progress === 100 ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                    <Star className="h-8 w-8 text-green-500 fill-green-500" />
                  </div>
                  <p className="text-white font-black">QUALIFICADO!</p>
                  <p className="text-xs text-green-400 font-medium mt-1">Você já está concorrendo aos prêmios</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Sparkles className="h-8 w-8 text-orange-400" />
                  </div>
                  <p className="text-white font-black text-sm uppercase tracking-wider">Faltam {stands.length - myCheckins.length} para liberar</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-widest">Leitura via QR Code no local</p>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de Stands */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stands.map((stand, idx) => {
          const isVisited = visitedStandIds.has(stand.id);
          
          return (
            <motion.div
              key={stand.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`h-full border-white/5 transition-all duration-300 relative group overflow-hidden ${
                isVisited ? 'bg-green-500/5 border-green-500/20' : 'bg-dark-200 hover:bg-dark-300'
              }`}>
                {isVisited && (
                  <div className="absolute top-0 right-0 p-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                )}
                
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                      isVisited ? 'bg-green-500/10 border-green-500/30' : 'bg-dark-300 border-white/10'
                    }`}>
                      {stand.logoUrl ? (
                        <img src={stand.logoUrl} alt={stand.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <QrCode className={`h-6 w-6 ${isVisited ? 'text-green-500' : 'text-gray-500'}`} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-bold leading-tight">{stand.name}</h4>
                      {stand.location && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{stand.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-2 mb-6 flex-1">
                    {stand.description || 'Visite este stand para conferir as novidades e garantir seu check-in.'}
                  </p>

                  <div className="mt-auto">
                    {isVisited ? (
                      <Badge className="bg-green-500/10 text-green-400 border-none w-full justify-center py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">
                        Check-in Realizado
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-2 text-orange-500/50 text-[10px] font-black uppercase tracking-widest justify-center">
                        <QrCode className="h-3 w-3" />
                        Aguardando Visita
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
