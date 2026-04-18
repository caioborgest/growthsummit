import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  QrCode, 
  Zap, 
  Play, 
  RotateCcw, 
  Maximize2,
  Volume2,
  VolumeX,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { raffleService } from '@/services/raffleService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { logger } from '@/lib/logger';

export default function AdminRaffleDisplay() {
  const { raffleId } = useParams<{ raffleId: string }>();
  
  const [raffle, setRaffle] = useState<any>(null);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scrollingName, setScrollingName] = useState('');
  const [winner, setWinner] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const audioContext = useRef<AudioContext | null>(null);

  // Initialize and Fetch Data
  useEffect(() => {
    if (raffleId) {
      loadRaffleData();
      subscribeToParticipants();
    }
  }, [raffleId]);

  const loadRaffleData = async () => {
    try {
      setLoading(true);
      // We don't have a direct getRaffleById, but we can query by id
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', raffleId)
        .single();
      
      if (error) throw error;
      setRaffle(data);

      // Initial count
      const participants = await raffleService.getParticipants(raffleId!);
      setParticipantsCount(participants.length);

      // Generate QR Code
      const qrUrl = await QRCode.toDataURL(`RAFFLE:${raffleId}`, {
        width: 1000,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      setQrCodeDataUrl(qrUrl);
    } catch (error) {
      logger.error('Error loading raffle display data', error);
      toast.error('Erro ao carregar dados do sorteio.');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToParticipants = () => {
    const channel = supabase
      .channel(`raffle-display-${raffleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'raffle_participants',
          filter: `raffle_id=eq.${raffleId}`
        },
        () => {
          setParticipantsCount(prev => prev + 1);
          if (soundEnabled) playTickSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const playTickSound = () => {
    if (!audioContext.current) audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioContext.current.createOscillator();
    const gain = audioContext.current.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioContext.current.currentTime);
    gain.gain.setValueAtTime(0.1, audioContext.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioContext.current.destination);
    osc.start();
    osc.stop(audioContext.current.currentTime + 0.1);
  };

  const performDraw = async () => {
    if (isDrawing) return;
    setIsDrawing(true);
    setWinner(null);

    try {
      const participants = await raffleService.getParticipants(raffleId!);
      const names = participants.map((p: any) => p.registrations.name || 'Participante');

      if (names.length === 0) {
        toast.error('Nenhum participante inscrito.');
        setIsDrawing(false);
        return;
      }

      // Start drum roll sound if possible
      
      let counter = 0;
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * names.length);
        setScrollingName(names[randomIndex]);
        counter++;
        if (soundEnabled) playTickSound();

        if (counter > 50) {
          clearInterval(interval);
          finishDraw();
        }
      }, 100);
    } catch (error) {
      setIsDrawing(false);
    }
  };

  const finishDraw = async () => {
    try {
      const result = await raffleService.drawWinner(raffleId!);
      if (result && result.length > 0) {
        const winnerData = result[0];
        setWinner(winnerData);
        launchConfetti();
      } else {
        toast.error('Ocorreu um erro ao sortear o vencedor.');
      }
    } catch (error) {
      toast.error('Erro de servidor ao realizar o sorteio.');
    } finally {
      setIsDrawing(false);
    }
  };

  const launchConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange-coral" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] flex flex-col items-center justify-center relative overflow-hidden text-white font-sans selection:bg-brand-orange-coral/30">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vh] bg-brand-orange-coral/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vh] bg-teal-500/5 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      </div>

      {/* Top Banner */}
      <div className="absolute top-12 left-0 right-0 z-10 flex flex-col items-center">
        <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3 mb-4"
        >
            <img src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/favicon.png" className="h-8 w-auto" alt="Logo" />
            <div className="h-4 w-px bg-white/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Growth Experience Display</span>
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-center">
            {raffle?.name}
        </h1>
      </div>

      {/* Main Stage */}
      <div className="relative z-10 w-full max-w-7xl px-8 flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 py-20">
        
        {/* Left: Participation Info */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col items-center md:items-start text-center md:text-left space-y-8"
        >
          <div className="space-y-2">
            <Badge className="bg-brand-orange-coral text-white font-black px-4 py-1.5 rounded-full text-xs tracking-widest uppercase mb-4 shadow-lg shadow-orange-500/20">
              COMO PARTICIPAR?
            </Badge>
            <p className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed max-w-sm italic">
                Aponte a câmera do seu celular para entrar no sorteio em tempo real.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-white/5 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative p-6 bg-white rounded-[2.5rem] shadow-2xl shadow-brand-orange-coral/10 w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                <img src={qrCodeDataUrl} className="w-full h-auto" alt="Sorteio QR" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform">
                      <Zap className="h-8 w-8 text-brand-orange-intense" />
                   </div>
                </div>
            </div>
          </div>
        </motion.div>

        {/* Center: Live Counter */}
        <div className="flex flex-col items-center">
            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={participantsCount}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-[12rem] md:text-[18rem] font-black italic leading-none tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    >
                        {participantsCount}
                    </motion.div>
                </AnimatePresence>
                <div className="absolute top-1/2 -right-12 transform translate-y-[-50%] bg-brand-orange-coral text-white p-2 rounded-xl animate-bounce">
                    <Users className="h-6 w-6" />
                </div>
            </div>
            <p className="text-xl md:text-2xl font-black uppercase tracking-[0.3em] text-gray-500 italic">Participantes Inscritos</p>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="absolute bottom-12 left-0 right-0 z-20 flex flex-col items-center gap-6">
        <AnimatePresence>
            {!winner && !isDrawing && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                >
                    <Button 
                        onClick={performDraw}
                        className="bg-brand-orange-coral hover:bg-orange-600 text-white font-black h-20 px-16 rounded-[2rem] text-2xl uppercase italic tracking-widest shadow-2xl shadow-orange-500/30 active:scale-95 transition-all group lg:hover:scale-105"
                    >
                        <Play className="h-8 w-8 mr-4 group-hover:animate-ping" />
                        SORTEAR AGORA
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="flex items-center gap-4">
            <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                title={soundEnabled ? "Desativar Áudio" : "Ativar Áudio"}
            >
                {soundEnabled ? <Volume2 className="h-5 w-5 text-teal-400" /> : <VolumeX className="h-5 w-5 text-gray-500" />}
            </button>
            <button 
                onClick={() => document.documentElement.requestFullscreen()}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Tela Cheia"
            >
                <Maximize2 className="h-5 w-5 text-gray-400" />
            </button>
            {winner && (
                <button 
                    onClick={() => { setWinner(null); }}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                    title="Novo Sorteio"
                >
                    <RotateCcw className="h-5 w-5 text-brand-orange-coral" />
                </button>
            )}
        </div>
      </div>

      {/* Drawing Overlay */}
      <AnimatePresence>
        {isDrawing && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center"
            >
                <div className="w-32 h-32 bg-brand-orange-coral rounded-[2.5rem] flex items-center justify-center mb-10 shadow-glow-orange animate-bounce">
                    <Star className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-gray-500 font-black uppercase tracking-[1em] mb-4 text-sm animate-pulse">Sorteando Vencedor</h2>
                <div className="h-40 overflow-hidden flex items-center justify-center">
                    <p className="text-6xl md:text-[10rem] font-black text-white italic uppercase tracking-tighter">
                        {scrollingName}
                    </p>
                </div>
                <div className="mt-20 w-80 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5 }}
                        className="h-full bg-brand-orange-coral" 
                    />
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Winner Reveal Stage */}
      <AnimatePresence>
        {winner && !isDrawing && (
            <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-xl flex flex-col items-center justify-center p-6"
            >
                <motion.div 
                    initial={{ y: 50 }}
                    animate={{ y: 0 }}
                    className="bg-dark-200 border-2 border-brand-orange-coral/30 rounded-[4rem] p-16 text-center shadow-edge-orange max-w-4xl w-full relative overflow-hidden"
                >
                    <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-brand-orange-coral/20 to-transparent -z-10" />
                    
                    <div className="w-40 h-40 bg-brand-orange-coral rounded-full flex items-center justify-center mx-auto mb-10 shadow-glow-orange">
                        <Trophy className="h-20 w-20 text-white" />
                    </div>

                    <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-8 py-2 rounded-full font-black text-sm tracking-[0.3em] uppercase mb-10 italic">
                        🏆 TEMOS UM GANHADOR!
                    </Badge>

                    <h2 className="text-7xl md:text-[8rem] font-black text-white italic uppercase tracking-tighter leading-tight mb-4 drop-shadow-2xl">
                        {winner.winner_name}
                    </h2>
                    
                    <p className="text-2xl text-gray-500 font-bold uppercase tracking-widest mb-16">
                        {winner.winner_email}
                    </p>

                    <Button 
                        onClick={() => setWinner(null)}
                        className="bg-white/5 hover:bg-white/10 text-white font-black h-16 px-12 rounded-2xl border border-white/10 uppercase tracking-widest text-xs"
                    >
                        FECHAR RESULTADO
                    </Button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Circles */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border border-white/[0.03]" />
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/[0.03]" />
    </div>
  );
}
