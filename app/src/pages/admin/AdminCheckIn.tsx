import { useState, useCallback, useMemo } from 'react';
import {
  QrCode,
  Search,
  CheckCircle,
  Clock,
  TrendingUp,
  X,
  User,
  Camera,
  Calendar,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegistrations, useCheckIns, useSessions, useCheckInsAtividades } from '@/hooks/useData';
import { toast } from 'sonner';
import { QRScanner } from '@/components/app/QRScanner';
import type { Registration } from '@/types';
import type { QRData } from '@/lib/qrUtils';
import { CheckInResultModal } from '@/components/admin/CheckInResultModal';

export function AdminCheckIn() {
  const { data: registrations, update } = useRegistrations();
  const { data: checkIns, create: createEventCheckIn } = useCheckIns();
  const { data: sessions } = useSessions();
  const { data: sessionAttendance, create: createSessionAttendance } = useCheckInsAtividades();

  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');

  const [lastCheckIn, setLastCheckIn] = useState<Registration | null>(null);
  const [scanResult, setScanResult] = useState<'success' | 'error' | 'duplicate' | null>(null);
  const [resultRegistration, setResultRegistration] = useState<Registration | null>(null);

  const selectedSession = useMemo(() =>
    sessions.find(s => s.id === selectedSessionId),
    [sessions, selectedSessionId]
  );

  const triggerVibrate = (type: 'success' | 'error') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'success') {
        navigator.vibrate(200);
      } else {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  const handleManualCheckIn = useCallback(async (registration: Registration) => {
    try {
      // 1. Check if it's GLOBAL event check-in
      if (selectedSessionId === 'all') {
        if (registration.checkedIn) {
          setScanResult('duplicate');
          setResultRegistration(registration);
          triggerVibrate('error');
          return;
        }

        await update(registration.id, {
          checkedIn: true,
          checkInTime: new Date().toISOString()
        } as any);

        await createEventCheckIn({
          projectId: registration.projectId,
          registrationId: registration.id,
          userId: registration.userId,
          ticketNumber: registration.ticketNumber,
          timestamp: new Date().toISOString(),
          location: 'Entrada Principal',
          method: 'manual',
          checkInType: 'event',
        });

        toast.success(`Check-in GERAL realizado: ${registration.ticketNumber}`);
      }
      // 2. Check if it's SESSION check-in
      else {
        // Check if already checked in for THIS session
        const alreadyAttending = sessionAttendance.some(
          a => a.sessionId === selectedSessionId && (a.registrationId === registration.id || a.userId === registration.userId)
        );

        if (alreadyAttending) {
          setScanResult('duplicate');
          setResultRegistration(registration);
          triggerVibrate('error');
          toast.info(`Já possui presença registrada em: ${selectedSession?.title}`);
          return;
        }

        await createSessionAttendance({
          projectId: registration.projectId,
          sessionId: selectedSessionId,
          registrationId: registration.id,
          userId: registration.userId,
          checkInAt: new Date().toISOString(),
          checkInType: 'manual',
        });

        toast.success(`Presença registrada em: ${selectedSession?.title}`);
      }

      setLastCheckIn(registration);
      setResultRegistration(registration);
      setScanResult('success');
      triggerVibrate('success');
      setSearchQuery('');
    } catch (err: unknown) {
      const error = err as Error;
      setScanResult('error');
      triggerVibrate('error');
      toast.error(`Erro ao realizar check-in: ${error.message || 'Erro desconhecido'}`);
    }
  }, [update, createEventCheckIn, createSessionAttendance, selectedSessionId, sessionAttendance, selectedSession]);

  const handleScannerSuccess = useCallback((res: QRData | null) => {
    if (!res) return;
    const registration = registrations.find(r => r.id === res.id);
    if (registration) {
      handleManualCheckIn(registration);
    } else {
      setScanResult('error');
      setResultRegistration(null);
      triggerVibrate('error');
      toast.error('Ingresso não encontrado no sistema.');
    }
    setIsScanning(false);
  }, [registrations, handleManualCheckIn]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const exactMatch = registrations.find(r =>
        (r.id === searchQuery || r.ticketNumber === searchQuery)
      );
      if (exactMatch) {
        handleManualCheckIn(exactMatch);
      }
    }
  };

  const checkedInCount = registrations.filter(r => r.checkedIn).length;
  const totalRegistrations = registrations.length;
  const checkInRate = totalRegistrations > 0 ? (checkedInCount / totalRegistrations) * 100 : 0;

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch =
      reg.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.nome || reg.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Se estiver no modo geral, esconde os que já fizeram check-in
    if (selectedSessionId === 'all') {
      return matchesSearch && !reg.checkedIn;
    }

    return matchesSearch;
  });

  const today = new Date().toLocaleDateString('en-CA');
  const checkInsToday = checkIns.filter(c =>
    new Date(c.timestamp).toLocaleDateString('en-CA') === today
  ).length;

  return (
    <div className="space-y-6">
      {scanResult && (
        <CheckInResultModal
          result={scanResult}
          registration={resultRegistration}
          onClose={() => {
            setScanResult(null);
            setResultRegistration(null);
          }}
        />
      )}

      {/* Header with Mode Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <QrCode className="h-8 w-8 text-brand-orange-coral" />
            Controle de Acesso
          </h2>
          <p className="text-gray-400">Gerencie o check-in geral ou presenças por atividade.</p>
        </div>

        <div className="flex items-center gap-2 bg-dark-200 p-1 rounded-xl border border-white/5">
          <Button
            variant={selectedSessionId === 'all' ? 'default' : 'ghost'}
            className={selectedSessionId === 'all' ? 'bg-brand-orange-coral text-white font-bold' : 'text-gray-400'}
            onClick={() => setSelectedSessionId('all')}
          >
            Check-in Geral
          </Button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <div className="relative">
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="bg-transparent text-sm font-bold text-teal-400 focus:outline-none pr-8 pl-4 appearance-none cursor-pointer"
            >
              <option value="all">Check-in Geral</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Check-ins Hoje</p>
          <p className="text-2xl font-bold text-white">{checkInsToday}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Total Check-ins</p>
          <p className="text-2xl font-bold text-teal-400">{checkedInCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Taxa de Presença</p>
          <p className="text-2xl font-bold text-green-400">{checkInRate.toFixed(1)}%</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Modo Ativo</p>
          <Badge className={selectedSessionId === 'all' ? 'bg-brand-orange-coral/20 text-brand-orange-coral' : 'bg-teal-500/20 text-teal-400'}>
            {selectedSessionId === 'all' ? 'Geral' : 'Sessão Individual'}
          </Badge>
        </div>
      </div>

      {/* Mode Indicator */}
      {selectedSession && (
        <div className="bg-teal-500/10 border border-teal-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center shrink-0">
            <Filter className="h-8 w-8 text-teal-400" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <Badge className="mb-2 bg-teal-500 text-white font-bold">MODO: CHECK-IN DE SESSÃO</Badge>
            <h3 className="text-xl font-bold text-white">{selectedSession.title}</h3>
            <p className="text-gray-400 text-sm">{selectedSession.room} • {selectedSession.startTime} - {selectedSession.endTime}</p>
          </div>
          <div className="flex flex-col items-center md:items-end shrink-0">
            <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">Presenças Registradas</p>
            <p className="text-3xl font-black text-teal-400">
              {sessionAttendance.filter(a => (a.sessionId || a.session_id) === selectedSessionId).length}
              {selectedSession.maxCapacity > 0 && <span className="text-gray-600 text-lg"> / {selectedSession.maxCapacity}</span>}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-white"
            onClick={() => setSelectedSessionId('all')}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Scanner & Search Area */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Search */}
        <div className="glass-card p-6 border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.1)] h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white uppercase tracking-tighter">Busca de Participante</h2>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-500" />
            <Input
              autoFocus
              type="text"
              placeholder="Nome, e-mail ou número do ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-12 h-14 w-full bg-dark-100 border-teal-500/30 text-white text-lg focus:ring-teal-500"
            />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {searchQuery ? (
              filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-4 bg-dark-100 rounded-xl hover:bg-dark-300 transition-all border border-white/5 group"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center mr-4 group-hover:bg-teal-500/20 transition-colors">
                        <User className="h-5 w-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{reg.nome || reg.name || 'Sem nome'}</p>
                        <p className="text-gray-400 text-xs font-mono">{reg.ticketNumber}</p>
                        <Badge variant="outline" className="mt-1 text-[9px] bg-white/5 border-white/10 uppercase font-black">
                          {reg.ticketType}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4"
                      onClick={() => handleManualCheckIn(reg)}
                    >
                      REALIZAR CHECK-IN
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-50">
                  <Search className="h-10 w-10 mx-auto mb-2 text-gray-600" />
                  <p className="text-gray-400">Nenhum participante encontrado</p>
                </div>
              )
            ) : (
              <div className="text-center py-10 opacity-40">
                <Clock className="h-10 w-10 mx-auto mb-2 text-gray-700" />
                <p className="text-sm font-bold uppercase tracking-widest">Aguardando busca...</p>
              </div>
            )}
          </div>
        </div>

        {/* Scanner */}
        <div className="glass-card p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white uppercase tracking-tighter text-brand-orange-coral">Scanner QR (Câmera)</h2>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center bg-dark-100 rounded-2xl border-2 border-dashed border-dark-300 relative group overflow-hidden min-h-[300px]">
            {!isScanning ? (
              <div className="text-center z-10 p-8">
                <div className="w-20 h-20 bg-brand-orange-coral/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-orange-coral/20">
                  <Camera className="h-10 w-10 text-brand-orange-coral" />
                </div>
                <h3 className="text-white font-bold mb-2">Usar Câmera do Dispositivo</h3>
                <Button
                  onClick={() => setIsScanning(true)}
                  className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black h-12 px-10 rounded-xl"
                >
                  ABRIR CÂMERA
                </Button>
              </div>
            ) : (
              <QRScanner
                onSuccess={handleScannerSuccess}
                onClose={() => setIsScanning(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white uppercase tracking-tighter mb-4">Atividade Recente</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...(selectedSessionId === 'all' ? checkIns : sessionAttendance.filter(a => (a.sessionId || a.session_id) === selectedSessionId))]
            .sort((a, b) => new Date(b.timestamp || b.checkInAt).getTime() - new Date(a.timestamp || a.checkInAt).getTime())
            .slice(0, 6)
            .map((item, idx) => {
              const reg = registrations.find(r => r.id === (item.registrationId || item.registration_id));
              const ts = item.timestamp || item.checkInAt;

              return (
                <div key={idx} className="flex items-center justify-between p-4 bg-dark-100 rounded-xl border border-white/5">
                  <div className="flex items-center min-w-0">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3 shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm truncate">{reg?.nome || reg?.name || item.ticketNumber || 'Visitante'}</p>
                      <p className="text-gray-500 text-[10px] font-mono">{reg?.ticketNumber || 'SESSÃO'}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-teal-400 font-bold text-xs">
                      {new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
