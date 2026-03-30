import { useState, useMemo } from 'react';
import { Trophy, CheckCircle2, QrCode, MapPin, Sparkles, Star, Gift, LayoutGrid } from 'lucide-react';
import { useStands, useStandCheckIns } from '@/hooks/useData';
import { motion, AnimatePresence } from 'framer-motion';
import { RaffleSection } from './RaffleSection';

interface GamificationSectionProps {
  registrationId: string;
}

export function GamificationSection({ registrationId }: GamificationSectionProps) {
  const { data: stands, isLoading: loadingStands } = useStands();
  const { data: checkins, isLoading: loadingCheckins } = useStandCheckIns();
  const [activeView, setActiveView] = useState<'stands' | 'raffles'>('stands');

  const myCheckins = useMemo(() => (checkins || []).filter(c => c.registrationId === registrationId), [checkins, registrationId]);

  const progress = useMemo(() => {
    if (!stands || !stands.length) return 0;
    return Math.round((myCheckins.length / stands.length) * 100);
  }, [stands, myCheckins]);

  const visitedStandIds = new Set(myCheckins.map(c => c.standId));
  const isComplete = progress === 100;

  if (loadingStands || loadingCheckins) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-28 rounded-[2rem] animate-pulse" style={{ background: 'var(--surface-1)' }} />)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2.5rem] p-6 sm:p-8"
        style={{
          background: isComplete
            ? 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(20,184,166,0.06))'
            : 'linear-gradient(135deg, rgba(255,112,67,0.12), rgba(255,64,53,0.05))',
          border: `1px solid ${isComplete ? 'rgba(34,197,94,0.25)' : 'rgba(255,112,67,0.2)'}`,
        }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-8 right-8 h-[2px] rounded-b-full"
          style={{ background: isComplete ? 'linear-gradient(90deg,transparent,rgba(34,197,94,0.6),transparent)' : 'linear-gradient(90deg,transparent,rgba(255,112,67,0.6),transparent)' }} />

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center"
                style={{
                  background: isComplete ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#ff7043,#ff4035)',
                  boxShadow: isComplete ? '0 8px 24px rgba(34,197,94,0.4)' : '0 8px 24px rgba(255,112,67,0.4)'
                }}>
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-foreground/40">Circuito GE-Stand</p>
                <h2 className="text-xl font-black text-foreground italic tracking-tight">Circuito de Prêmios</h2>
                <p className="text-foreground/40 text-xs mt-0.5">Visite os stands e concorra a sorteios exclusivos</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-foreground/50 text-xs font-bold uppercase tracking-widest">
                  Progresso: <span className="text-foreground font-black">{myCheckins.length}/{stands?.length || 0} stands</span>
                </span>
                <span className="font-black text-sm" style={{ color: isComplete ? '#22c55e' : '#ff7043' }}>{progress}%</span>
              </div>
              <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: isComplete ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#ff7043,#ff4035)' }}
                />
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="rounded-[2rem] p-6 text-center min-w-[180px]" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
            {isComplete ? (
              <>
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.15)' }}>
                  <Star className="h-8 w-8 text-green-500 fill-green-500" />
                </div>
                <p className="text-foreground font-black text-sm uppercase tracking-wide">Qualificado!</p>
                <p className="text-green-400 text-[10px] font-bold mt-1">Concorrendo aos prêmios</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
                  <Sparkles className="h-7 w-7 text-brand-orange-coral" />
                </div>
                <p className="text-foreground font-black text-sm uppercase tracking-wide">
                  Faltam {(stands?.length || 0) - myCheckins.length}
                </p>
                <p className="text-foreground/30 text-[9px] font-bold mt-1 uppercase tracking-widest">Leitura via QR Code</p>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tab switcher */}
      <div className="flex p-1.5 rounded-2xl w-fit" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
        {[{ key: 'stands', label: 'Stands', Icon: LayoutGrid }, { key: 'raffles', label: 'Sorteios', Icon: Gift }].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveView(key as any)}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
            style={{
              background: activeView === key ? 'linear-gradient(135deg,#ff7043,#ff4035)' : 'transparent',
              color: activeView === key ? 'white' : 'var(--text-secondary)',
              boxShadow: activeView === key ? '0 4px 12px rgba(255,112,67,0.3)' : 'none'
            }}
          >
            <Icon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeView === 'stands' ? (
          <motion.div
            key="stands"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.25 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {(stands || []).map((stand: any, idx: number) => {
              const isVisited = visitedStandIds.has(stand.id);
              return (
                <motion.div
                  key={stand.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative overflow-hidden rounded-[2rem] p-5 transition-all duration-300 group"
                  style={{
                    background: isVisited ? 'rgba(34,197,94,0.06)' : 'var(--surface-1)',
                    border: `1px solid ${isVisited ? 'rgba(34,197,94,0.2)' : 'var(--border-subtle)'}`,
                  }}
                >
                  {isVisited && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center overflow-hidden"
                      style={{ background: isVisited ? 'rgba(34,197,94,0.12)' : 'var(--surface-2)', border: `1px solid ${isVisited ? 'rgba(34,197,94,0.2)' : 'var(--border-subtle)'}` }}>
                      {stand.logoUrl ? (
                        <img src={stand.logoUrl} alt={stand.name} className="w-full h-full object-contain p-1.5" />
                      ) : (
                        <QrCode className="h-5 w-5" style={{ color: isVisited ? '#22c55e' : 'var(--text-muted)' }} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-foreground font-black text-sm italic uppercase truncate">{stand.name}</h4>
                      {stand.location && (
                        <p className="text-foreground/40 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                          <MapPin className="h-2.5 w-2.5" />{stand.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-foreground/40 text-xs leading-relaxed mb-4 line-clamp-2">
                    {stand.description || 'Visite este stand e escaneie o QR Code para registrar sua visita.'}
                  </p>

                  <div className="mt-auto">
                    {isVisited ? (
                      <div className="flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-green-400"
                        style={{ background: 'rgba(34,197,94,0.1)' }}>
                        <CheckCircle2 className="h-3.5 w-3.5" />Check-in Realizado
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-foreground/30"
                        style={{ background: 'var(--surface-2)', border: '1px dashed var(--border-subtle)' }}>
                        <QrCode className="h-3.5 w-3.5" />Aguardando Visita
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="raffles" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
            <RaffleSection registrationId={registrationId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
