import { useMemo } from 'react';
import { Trophy, QrCode, Timer, CheckCircle2, Star, Gift, Ticket, Zap } from 'lucide-react';
import { useRaffles, useInscricoes } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface RaffleSectionProps {
  registrationId: string;
}

export function RaffleSection({ registrationId }: RaffleSectionProps) {
  const { projectId } = useProject();
  const { data: raffles, isLoading: loadingRaffles } = useRaffles();
  const { data: inscricoes } = useInscricoes();

  const activeRaffles = useMemo(() => {
    return (raffles || []).filter(r => r.projectId === projectId && r.status === 'open');
  }, [raffles, projectId]);

  const completedRaffles = useMemo(() => {
    return (raffles || []).filter(r => r.projectId === projectId && r.status === 'completed');
  }, [raffles, projectId]);

  if (loadingRaffles) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Informativo */}
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
          <Gift className="h-7 w-7 text-brand-orange-coral" />
          Sorteios & <span className="text-brand-orange-coral">Prêmios</span>
        </h3>
        <p className="text-gray-500 text-sm font-medium">Participe das dinâmicas em tempo real e concorra a prêmios exclusivos dos nossos patrocinadores.</p>
      </div>

      {/* Sorteios Ativos */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Acontecendo Agora</h4>
          <Badge className="bg-orange-500 text-white border-none animate-pulse">AO VIVO</Badge>
        </div>

        {activeRaffles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeRaffles.map((raffle, idx) => (
              <motion.div
                key={raffle.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-dark-200 border-white/5 overflow-hidden relative group hover:border-brand-orange-coral/30 transition-all">
                  <div className="absolute top-0 right-0 p-4">
                     <Zap className="h-5 w-5 text-brand-orange-coral animate-pulse" />
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                        <Trophy className="h-7 w-7 text-brand-orange-coral" />
                      </div>
                      <div>
                        <h5 className="text-white font-black text-lg uppercase tracking-tight leading-none mb-1">{raffle.name}</h5>
                        <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                          <Timer className="h-3 w-3" /> Participe até o sorteio
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400 leading-relaxed italic">
                      {raffle.description || 'Fique atento ao telão para as instruções de participação!'}
                    </p>

                    <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                      {raffle.type === 'realtime_qr' ? (
                        <div className="text-center p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 group-hover:bg-brand-orange-coral/5 group-hover:border-brand-orange-coral/20 transition-all">
                          <QrCode className="h-6 w-6 text-brand-orange-coral mx-auto mb-2" />
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">Escaneie o QR Code no Telão</p>
                          <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase">Para entrar automaticamente</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 bg-teal-500/10 p-4 rounded-2xl border border-teal-500/20">
                          <CheckCircle2 className="h-5 w-5 text-teal-400" />
                          <div>
                            <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Check-in Stand</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Visite o stand para participar</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-dark-300/50 rounded-[2.5rem] border border-dashed border-white/10">
            <Timer className="h-10 w-10 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-black uppercase text-xs tracking-widest">Aguardando o próximo sorteio...</p>
            <p className="text-[10px] text-gray-600 mt-2 font-bold uppercase">Fique atento aos anúncios no palco principal</p>
          </div>
        )}
      </div>

      {/* Resultados Anteriores */}
      <div className="space-y-6">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Últimos Ganhadores</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedRaffles.length > 0 ? (
            completedRaffles.map((raffle) => {
              const winner = inscricoes.find(i => i.id === raffle.winnerRegistrationId);
              const isMe = winner?.id === registrationId;

              return (
                <Card key={raffle.id} className={`p-5 border-white/5 transition-all relative overflow-hidden ${
                  isMe ? 'bg-teal-500/10 border-teal-500/30 shadow-lg shadow-teal-500/10' : 'bg-dark-200'
                }`}>
                  {isMe && (
                    <div className="absolute top-0 right-0 p-3 bg-teal-500 text-white rounded-bl-xl font-black text-[8px] uppercase tracking-tighter shadow-xl">
                      VOCÊ GANHOU!
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isMe ? 'bg-teal-500/20 text-teal-400' : 'bg-white/5 text-gray-500'
                      }`}>
                        <Star className={`h-5 w-5 ${isMe ? 'fill-teal-400' : ''}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-black text-xs uppercase truncate leading-none mb-1">{raffle.name}</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Sorteio Finalizado</p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border ${
                      isMe ? 'bg-teal-500/5 border-teal-500/10' : 'bg-dark-300 border-white/5'
                    }`}>
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Trophy className="h-3 w-3 text-brand-orange-coral" /> Ganhador Sortudo
                      </p>
                      <p className={`font-black uppercase italic tracking-tighter ${isMe ? 'text-teal-400 text-lg' : 'text-white'}`}>
                        {winner?.nome || '—'}
                      </p>
                      {isMe && (
                        <p className="text-[9px] text-teal-500/70 font-bold mt-1 uppercase">Vá até o Balcão de Prêmios</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
             <div className="col-span-full py-10 text-center opacity-30 italic text-gray-500 font-bold text-xs uppercase tracking-widest">
                Nenhum resultado finalizado ainda.
             </div>
          )}
        </div>
      </div>

      {/* Regras e Info */}
      <div className="glass-card p-8 bg-gradient-to-br from-brand-orange-coral/10 to-transparent border-brand-orange-coral/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/20 flex items-center justify-center shrink-0">
            <Ticket className="h-6 w-6 text-brand-orange-coral" />
          </div>
          <div>
            <h5 className="text-white font-black uppercase italic text-sm mb-2">Dica de Sucesso</h5>
            <p className="text-xs text-gray-400 leading-relaxed font-bold uppercase tracking-tight">
              Mantenha o PWA aberto durante as palestras. Quando o host anunciar um sorteio, aponte sua câmera para o telão e garanta sua participação instantânea.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
