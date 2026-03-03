import { useState, useCallback } from 'react';
import {
  QrCode,
  Search,
  CheckCircle,
  Clock,
  TrendingUp,
  X,
  User,
  Camera
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegistrations, useCheckIns } from '@/hooks/useData';
import { toast } from 'sonner';
import { QRScanner } from '@/components/app/QRScanner';
import type { Registration } from '@/types';
import type { QRData } from '@/lib/qrUtils';
import { CheckInResultModal } from '@/components/admin/CheckInResultModal';

export function AdminCheckIn() {
  const { data: registrations, update } = useRegistrations();
  const { data: checkIns, create } = useCheckIns();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const [lastCheckIn, setLastCheckIn] = useState<Registration | null>(null);
  const [scanResult, setScanResult] = useState<'success' | 'error' | 'duplicate' | null>(null);
  const [resultRegistration, setResultRegistration] = useState<Registration | null>(null);

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

      // Log check-in event in the table
      await create({
        projectId: registration.projectId,
        registrationId: registration.id,
        userId: registration.userId,
        ticketNumber: registration.ticketNumber,
        timestamp: new Date().toISOString(),
        location: 'Entrada Principal',
        method: 'manual',
        checkInType: 'event',
      });

      setLastCheckIn(registration);
      setResultRegistration(registration);
      setScanResult('success');
      triggerVibrate('success');
      setSearchQuery('');
      // toast.success(`Check-in realizado: ${registration.ticketNumber}`); // Modal handles this now
    } catch (err: unknown) {
      const error = err as Error;
      setScanResult('error');
      triggerVibrate('error');
      toast.error(`Erro ao realizar check-in: ${error.message || 'Erro desconhecido'}`);
    }
  }, [update, create]);

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

  // Handle Enter key for hardware scanners (standard behavior)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const exactMatch = registrations.find(r =>
        (r.id === searchQuery || r.ticketNumber === searchQuery) && !r.checkedIn
      );
      if (exactMatch) {
        handleManualCheckIn(exactMatch);
        toast.success(`Check-in automático: ${exactMatch.ticketNumber}`);
      }
    }
  };

  const checkedInCount = registrations.filter(r => r.checkedIn).length;
  const totalRegistrations = registrations.length;
  const checkInRate = totalRegistrations > 0 ? (checkedInCount / totalRegistrations) * 100 : 0;

  const filteredRegistrations = registrations.filter(reg => {
    return (
      reg.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.userId.toLowerCase().includes(searchQuery.toLowerCase())
    ) && !reg.checkedIn;
  });

  // Calculate real hourly stats from checkIns (today only)
  const HOURS = ['08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h'];
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  const hourlyStats = HOURS.map(hourStr => {
    const hourInt = parseInt(hourStr);
    return checkIns.filter(c => {
      const date = new Date(c.timestamp);
      return date.toLocaleDateString('en-CA') === today && date.getHours() === hourInt;
    }).length;
  });

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
          <p className="text-gray-400 text-sm">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-400">{totalRegistrations - checkedInCount}</p>
        </div>
      </div>

      {/* Last Check-in Alert */}
      {lastCheckIn && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center animate-fade-in">
          <CheckCircle className="h-8 w-8 text-green-400 mr-4" />
          <div className="flex-1">
            <p className="text-white font-medium text-lg">Check-in realizado com sucesso!</p>
            <p className="text-gray-400">{lastCheckIn.ticketNumber}</p>
          </div>
          <Button
            variant="ghost"
            className="text-gray-400"
            onClick={() => setLastCheckIn(null)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* QR Scanner */}
      {isScanning && (
        <QRScanner
          onSuccess={handleScannerSuccess}
          onClose={() => setIsScanning(false)}
        />
      )}

      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Scanner QR Code</h2>
            <p className="text-sm text-gray-400">O sistema detecta automaticamente QR codes inseridos no campo de busca ou via câmera.</p>
          </div>
          <Button
            onClick={() => setIsScanning(true)}
            className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-bold h-12 px-8"
          >
            <Camera className="h-5 w-5 mr-2" />
            ABRIR SCANNER (CÂMERA)
          </Button>
        </div>

        <div className="aspect-video bg-dark-100 rounded-lg flex items-center justify-center border-2 border-dashed border-dark-300">
          <div className="text-center">
            <QrCode className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Use o scanner de câmera ou o campo de busca abaixo</p>
          </div>
        </div>
      </div>

      {/* Manual Check-in */}
      <div className="glass-card p-6 border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.1)]">
        <h2 className="text-lg font-semibold text-white mb-4">Check-in / Busca QR</h2>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-500" />
          <Input
            autoFocus
            type="text"
            placeholder="Aponte o leitor de QR Code ou busque manualmente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-12 h-14 w-full bg-dark-100 border-teal-500/30 text-white text-lg focus:ring-teal-500"
          />
        </div>

        {searchQuery && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex items-center justify-between p-4 bg-dark-100 rounded-lg hover:bg-dark-300 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center mr-4">
                      <User className="h-5 w-5 text-teal-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{reg.ticketNumber}</p>
                      <p className="text-gray-400 text-sm font-mono text-[10px]">{reg.id}</p>
                      <Badge variant="outline" className="mt-1 text-[10px] bg-white/5 border-white/10">
                        {reg.ticketType.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold"
                    onClick={() => handleManualCheckIn(reg)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Check-in
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">Nenhum ingresso compatível encontrado</p>
            )}
          </div>
        )}
      </div>

      {/* Recent Check-ins */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Check-ins Recentes</h2>
          <Badge className="bg-teal-500/20 text-teal-400">
            <Clock className="h-3 w-3 mr-1" />
            Ao vivo
          </Badge>
        </div>

        <div className="space-y-3">
          {checkIns.slice(0, 10).map((checkIn) => (
            <div key={checkIn.id} className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{checkIn.ticketNumber}</p>
                  <p className="text-gray-400 text-sm">{checkIn.registrationId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-teal-400 text-sm">
                  {new Date(checkIn.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-gray-500 text-xs">{checkIn.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance by Hour */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Presença por Horário</h2>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {HOURS.map((hour, idx) => (
            <div key={hour} className="text-center">
              <div className="bg-dark-100 rounded-lg p-3 mb-2">
                <TrendingUp className="h-4 w-4 text-teal-400 mx-auto" />
              </div>
              <p className="text-gray-400 text-[10px]">{hour}</p>
              <p className="text-white font-bold">{hourlyStats[idx]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
