import { useState, useMemo } from 'react';
import {
  Plus,
  QrCode,
  Trophy,
  Zap,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRaffles, useStands, useStandCheckIns, useInscricoes } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { raffleService } from '@/services/raffleService';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import QRCode from 'qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function AdminSorteio() {
  const { projectId, isProjectSelected } = useProject();
  const { data: raffles, refetch: refetchRaffles, remove: removeRaffle } = useRaffles();
  const { data: stands } = useStands();
  const { data: checkins } = useStandCheckIns();
  const { data: inscricoes } = useInscricoes();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState<any>(null);
  const [scrollingName, setScrollingName] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'realtime_qr' as 'stand_checkin' | 'realtime_qr',
    standId: ''
  });

  const filteredRaffles = useMemo(() => {
    return (raffles || []).filter(r => r.projectId === projectId);
  }, [raffles, projectId]);

  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    try {
      await raffleService.createRaffle({
        projectId: projectId,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        standId: formData.type === 'stand_checkin' ? formData.standId : undefined,
        status: 'draft'
      });
      toast.success('Sorteio criado com sucesso!');
      setIsCreateModalOpen(false);
      refetchRaffles();
      setFormData({ name: '', description: '', type: 'realtime_qr', standId: '' });
    } catch (error) {
      toast.error('Erro ao criar sorteio');
      logger.error('Raffle creation error', error);
    }
  };

  const handleStatusChange = async (raffleId: string, status: string) => {
    try {
      await raffleService.updateRaffle(raffleId, { status } as any);
      toast.success(`Sorteio ${status === 'open' ? 'aberto' : 'fechado'}!`);
      refetchRaffles();
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDeleteRaffle = async (id: string) => {
    if (confirm('Excluir este sorteio?')) {
      try {
        await removeRaffle(id);
        toast.success('Sorteio excluído');
      } catch {
        toast.error('Erro ao excluir');
      }
    }
  };

  const generateRaffleQR = async (raffleId: string) => {
    try {
      const data = `RAFFLE:${raffleId}`;
      const url = await QRCode.toDataURL(data, {
        width: 600,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      setQrCodeDataUrl(url);
    } catch {
      toast.error('Erro ao gerar QR Code');
    }
  };

  const performDraw = async (raffle: any) => {
    setIsDrawing(true);
    setWinner(null);

    // Slot machine animation effect
    let participants: any[] = [];
    if (raffle.type === 'realtime_qr') {
      const data = await raffleService.getParticipants(raffle.id);
      participants = data.map((p: any) => p.registrations);
    } else {
      const standCheckins = checkins.filter(c => c.standId === raffle.standId);
      const regIds = Array.from(new Set(standCheckins.map(c => c.registrationId)));
      participants = inscricoes.filter(i => regIds.includes(i.id));
    }

    if (participants.length === 0) {
      toast.error('Nenhum participante elegível');
      setIsDrawing(false);
      return;
    }

    let counter = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * participants.length);
      setScrollingName(participants[randomIndex].name || 'Sorteando...');
      counter++;
      
      if (counter > 30) {
        clearInterval(interval);
        finishDraw(raffle.id);
      }
    }, 100);
  };

  const finishDraw = async (raffleId: string) => {
    try {
      const result = await raffleService.drawWinner(raffleId);
      if (result && result.length > 0) {
          setWinner(result[0]);
          toast.success('Ganhador sorteado!');
          refetchRaffles();
      } else {
          toast.error('Nenhum participante elegível encontrado no banco.');
      }
    } catch {
      toast.error('Erro ao processar sorteio no servidor');
    } finally {
      setIsDrawing(false);
      setScrollingName('');
    }
  };

  if (!isProjectSelected) {
     return <div className="p-10 text-center text-gray-500">Selecione um projeto para gerenciar sorteios.</div>;
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Gestão de <span className="text-brand-orange-coral">Sorteios</span></h1>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">Engajamento e Gamificação em Tempo Real</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-brand-orange-coral hover:bg-orange-600 text-white font-black rounded-2xl h-12 px-8 shadow-lg shadow-orange-500/20"
        >
          <Plus className="h-5 w-5 mr-2" />
          CRIAR NOVO SORTEIO
        </Button>
      </div>

      {/* Raffle List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRaffles.map((raffle) => (
          <div key={raffle.id} className="glass-card relative overflow-hidden group hover:border-brand-orange-coral/30 transition-all duration-500">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${raffle.type === 'realtime_qr' ? 'bg-teal-500/10 text-teal-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {raffle.type === 'realtime_qr' ? <QrCode className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
                </div>
                <Badge className={`uppercase text-[9px] font-black tracking-widest ${
                  raffle.status === 'open' ? 'bg-green-500/20 text-green-400' : 
                  raffle.status === 'completed' ? 'bg-brand-orange-coral/20 text-brand-orange-coral' : 
                  'bg-white/5 text-gray-500'
                }`}>
                  {raffle.status}
                </Badge>
              </div>

              <div>
                <h3 className="text-white font-black text-lg uppercase tracking-tight">{raffle.name}</h3>
                <p className="text-gray-500 text-xs line-clamp-2 mt-1">{raffle.description || 'Sem descrição.'}</p>
              </div>

              <div className="pt-4 flex border-t border-white/5 gap-2">
                {raffle.status === 'draft' && (
                  <Button 
                    onClick={() => handleStatusChange(raffle.id, 'open')}
                    className="flex-1 bg-white/5 hover:bg-green-500/20 text-green-400 font-bold text-[10px] border border-white/5 rounded-xl h-9"
                  >
                    ABRIR SORTEIO
                  </Button>
                )}
                {raffle.status === 'open' && (
                  <>
                    <Button 
                      onClick={() => performDraw(raffle)}
                      className="flex-1 bg-brand-orange-coral text-white font-black text-[10px] rounded-xl h-9 shadow-lg shadow-orange-500/20"
                    >
                      SORTEAR AGORA
                    </Button>
                    {raffle.type === 'realtime_qr' && (
                      <Button 
                        onClick={() => { generateRaffleQR(raffle.id); }}
                        className="w-9 h-9 p-0 bg-white/5 text-gray-400 rounded-xl"
                        title="Ver QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
                {raffle.status === 'completed' && (
                    <div className="flex-1 bg-teal-500/10 rounded-xl p-3 border border-teal-500/20">
                        <p className="text-[8px] font-black text-teal-500 uppercase tracking-widest mb-1">🏅 GANHADOR</p>
                        <p className="text-white font-bold text-xs truncate">{(inscricoes.find(i => i.id === raffle.winnerRegistrationId) as any)?.name || 'ID: ' + raffle.winnerRegistrationId?.slice(0,8)}</p>
                    </div>
                )}
                <Button 
                  onClick={() => handleDeleteRaffle(raffle.id)}
                  className="w-9 h-9 p-0 bg-red-500/5 text-red-400 hover:bg-red-500/10 border border-white/5 rounded-xl"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Draw Animation Overlay */}
      {isDrawing && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
            <div className="w-32 h-32 bg-brand-orange-coral rounded-full flex items-center justify-center mb-10 shadow-glow-orange animate-bounce">
                <Trophy className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-gray-500 font-black uppercase tracking-[0.5em] mb-4 text-sm">Sorteando...</h2>
            <div className="h-20 overflow-hidden">
                <p className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter animate-pulse">
                    {scrollingName}
                </p>
            </div>
            <div className="mt-12 w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand-orange-coral animate-loading-bar" style={{ width: '100%' }} />
            </div>
        </div>
      )}

      {/* Winner Modal */}
      <Dialog open={!!winner} onOpenChange={() => setWinner(null)}>
        <DialogContent className="bg-dark-200 border-white/10 text-white max-w-lg rounded-[3rem] overflow-hidden text-center p-12">
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand-orange-coral/20 to-transparent -z-10" />
            <DialogHeader className="items-center text-center">
                <div className="w-24 h-24 bg-brand-orange-coral rounded-full flex items-center justify-center mx-auto mb-8 shadow-glow-orange">
                    <Trophy className="h-12 w-12 text-white" />
                </div>
                <Badge className="bg-orange-500/20 text-orange-400 font-black px-4 py-1 mb-6 border-none text-[10px] tracking-widest uppercase italic">
                    🏅 Parabéns! Temos um ganhador!
                </Badge>
                <DialogTitle className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                    {winner?.winner_name}
                </DialogTitle>
                <DialogDescription className="text-gray-500 font-bold text-sm mb-10">
                    {winner?.winner_email}
                </DialogDescription>
            </DialogHeader>
            
            <Button 
                onClick={() => setWinner(null)}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-black h-14 rounded-2xl border border-white/10 active:scale-95 transition-all"
            >
                FECHAR E VOLTAR
            </Button>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={!!qrCodeDataUrl} onOpenChange={() => setQrCodeDataUrl('')}>
        <DialogContent className="bg-white text-dark-500 max-w-sm rounded-[2.5rem] overflow-hidden p-8 text-center space-y-6">
            <DialogHeader className="items-center text-center">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">
                    Scan para <span className="text-brand-orange-coral">Participar!</span>
                </DialogTitle>
                <DialogDescription className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Aponte a câmera do seu celular no PWA para entrar no sorteio.
                </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-auto" />
            </div>
            <Button onClick={() => setQrCodeDataUrl('')} className="w-full bg-dark-500 text-white font-black h-12 rounded-2xl">FECHAR</Button>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-dark-200 border-white/10 text-white max-w-md rounded-[2.5rem] p-8">
            <DialogHeader>
                <DialogTitle className="text-2xl font-black italic uppercase">Novo <span className="text-brand-orange-coral">Sorteio</span></DialogTitle>
                <DialogDescription className="text-gray-500 text-xs font-bold uppercase tracking-widest">Configure as regras e o tipo de sorteio</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateRaffle} className="space-y-6 mt-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-2">
                    <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Nome do Sorteio</Label>
                    <Input 
                        required 
                        placeholder="Ex: Sorteio do iPhone 15" 
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/5 border-white/10 h-12 rounded-2xl focus:border-brand-orange-coral" 
                    />
                </div>

                <div className="space-y-2">
                    <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Tipo</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'realtime_qr' })}
                            className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                formData.type === 'realtime_qr' ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white/5 border-white/5 text-gray-500'
                            }`}
                        >
                            QR Real-time
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'stand_checkin' })}
                            className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                formData.type === 'stand_checkin' ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white/5 border-white/5 text-gray-500'
                            }`}
                        >
                            Check-in Stand
                        </button>
                    </div>
                </div>

                {formData.type === 'stand_checkin' && (
                    <div className="space-y-2">
                        <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Selecionar Stand</Label>
                        <select 
                            required
                            value={formData.standId}
                            onChange={e => setFormData({ ...formData, standId: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 h-12 rounded-2xl px-4 text-sm appearance-none text-white focus:outline-none focus:border-brand-orange-coral"
                        >
                            <option value="" disabled className="bg-dark-200">Escolha o ponto...</option>
                            {stands.map(s => <option key={s.id} value={s.id} className="bg-dark-200">{s.name}</option>)}
                        </select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Descrição</Label>
                    <textarea 
                        placeholder="Detalhes sobre o prêmio ou regra..." 
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 h-24 rounded-2xl p-4 text-sm focus:outline-none focus:border-brand-orange-coral resize-none" 
                    />
                </div>

                <Button type="submit" className="w-full bg-brand-orange-coral hover:bg-orange-600 text-white font-black h-14 rounded-2xl">CRIAR AGORA</Button>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
