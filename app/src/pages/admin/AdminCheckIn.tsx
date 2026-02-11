import { useState } from 'react';
import { 
  QrCode,
  Search,
  CheckCircle,
  Clock,
  TrendingUp,
  Camera,
  X,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegistrations, useCheckIns } from '@/hooks/useData';

export function AdminCheckIn() {
  const { data: registrations, update } = useRegistrations();
  const { data: checkIns, create } = useCheckIns();
  const [searchQuery, setSearchQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lastCheckIn, setLastCheckIn] = useState<any>(null);

  const filteredRegistrations = registrations.filter(reg => {
    return (
      reg.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.userId.toLowerCase().includes(searchQuery.toLowerCase())
    ) && !reg.checkedIn;
  });

  const checkedInCount = registrations.filter(r => r.checkedIn).length;
  const totalRegistrations = registrations.length;
  const checkInRate = totalRegistrations > 0 ? (checkedInCount / totalRegistrations) * 100 : 0;

  const handleManualCheckIn = async (registration: any) => {
    await update(registration.id, { 
      checkedIn: true, 
      checkInTime: new Date().toISOString() 
    });
    
    await create({
      userId: registration.userId,
      userName: 'Participante', // Would come from user data
      ticketNumber: registration.ticketNumber,
      timestamp: new Date().toISOString(),
      location: 'Entrada Principal',
      method: 'manual',
    } as any);

    setLastCheckIn(registration);
    setSearchQuery('');
  };

  const handleScan = () => {
    setScanning(true);
    // Simulate QR scan
    setTimeout(() => {
      setScanning(false);
      const randomReg = registrations.find(r => !r.checkedIn);
      if (randomReg) {
        handleManualCheckIn(randomReg);
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Check-ins Hoje</p>
          <p className="text-2xl font-bold text-white">{checkIns.length}</p>
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
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-white">Scanner QR Code</h2>
          <Button 
            className="bg-teal-500 hover:bg-teal-600 text-white"
            onClick={handleScan}
            disabled={scanning}
          >
            <Camera className="h-4 w-4 mr-2" />
            {scanning ? 'Escaneando...' : 'Escanear QR Code'}
          </Button>
        </div>

        {scanning ? (
          <div className="aspect-video bg-dark-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Posicione o QR code na câmera</p>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-dark-100 rounded-lg flex items-center justify-center border-2 border-dashed border-dark-300">
            <div className="text-center">
              <QrCode className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Clique no botão para iniciar o scanner</p>
            </div>
          </div>
        )}
      </div>

      {/* Manual Check-in */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Check-in Manual</h2>
        
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Buscar por número do ingresso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 w-full bg-dark-100 border-dark-300 text-white"
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
                      <p className="text-gray-400 text-sm">{reg.ticketType.toUpperCase()}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleManualCheckIn(reg)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Check-in
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">Nenhum ingresso encontrado</p>
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
                  <p className="text-gray-400 text-sm">{checkIn.userName}</p>
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
        <div className="grid grid-cols-6 gap-2">
          {['08h', '09h', '10h', '11h', '12h', '13h'].map((hour) => (
            <div key={hour} className="text-center">
              <div className="bg-dark-100 rounded-lg p-3 mb-2">
                <TrendingUp className="h-5 w-5 text-teal-400 mx-auto" />
              </div>
              <p className="text-gray-400 text-xs">{hour}</p>
              <p className="text-white font-medium">{Math.floor(Math.random() * 50) + 10}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
