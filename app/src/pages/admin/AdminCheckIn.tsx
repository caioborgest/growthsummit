import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Search, 
  Camera, 
  CheckCircle2, 
  Users, 
  Ticket, 
  Clock, 
  ChevronRight,
  LogIn,
  LogOut,
  QrCode
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '@/contexts/ProjectContext';
import { useData } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QRScanner } from '@/components/app/QRScanner';
import { parseQRString } from '@/lib/qrUtils';
import type { QRData } from '@/lib/qrUtils';
import { toggleCheckInRegistrationAtomic } from '@/lib/checkInAtomic';
import { supabase } from '@/lib/supabase';
import { CheckInResultModal } from '@/components/admin/CheckInResultModal';
import { AccreditationChecklistModal } from '@/components/admin/AccreditationChecklistModal';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckInQueue } from '@/hooks/useCheckInQueue';
import { registrationService } from '@/services/registrationService';
import type { Registration, Mentor, Company, Startup } from '@/types';
import { Wifi, WifiOff, RefreshCw, LogOut as LogOutIcon } from 'lucide-react';

const AdminCheckIn = () => {
  const { selectedProject } = useProject();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [scanResult, setScanResult] = useState<'success' | 'error' | 'duplicate' | 'exit' | null>(null);
  const [resultRegistration, setResultRegistration] = useState<Registration | null>(null);
  const [showTotem, setShowTotem] = useState(false);
  const [scanKey, setScanKey] = useState(0); 
  const { pendingCount, isSyncing, addToQueue, syncQueue } = useCheckInQueue();
  
  // Checklist Modal States
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<'participant' | 'mentor' | 'company' | 'startup' | 'partner'>('participant');

  // Fetch Data
  const { data: registrations, isLoading: loadingReg, refetch: refetchReg } = useData<Registration>([], 'registrations', { realtime: true });
  const { data: mentors, isLoading: loadingMentors } = useData<Mentor>([], 'mentors');
  const { data: companies, isLoading: loadingCompanies } = useData<Company>([], 'companies');
  const { data: startups, isLoading: loadingStartups } = useData<Startup>([], 'startups');
  const { data: checkIns, refetch: refetchCheckIns } = useData<any>([], 'check_ins', { realtime: true });
  const { data: sessionAttendance, refetch: refetchAttendance } = useData<any>([], 'activity_check_ins');
  const { data: sessions } = useData<any>([], 'sessions');
  const { data: partnerTeamMembers } = useData<any>([], 'partner_team_members');

  // Handle escape to close totem
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowTotem(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Monitoramento em tempo real de novos check-ins
  useEffect(() => {
    if (checkIns.length > 0) {
      const lastCheckIn = checkIns[0]; // Assumindo ordenação por tempo desc
      const isRecent = new Date().getTime() - new Date(lastCheckIn.timestamp || lastCheckIn.check_in_at || lastCheckIn.created_at).getTime() < 5000;
      
      if (isRecent && lastCheckIn.method === 'self_scan') {
        toast.success(`Auto Credenciamento: ${lastCheckIn.user_name || 'Concluído'}`, {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        });
        triggerVibrate('success');
      }
    }
  }, [checkIns]);

  const refetch = useCallback(() => {
    refetchReg();
    refetchCheckIns();
    refetchAttendance();
  }, [refetchReg, refetchCheckIns, refetchAttendance]);

  // Filters
  const filteredRegistrations = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return registrations.filter(r => 
      (r.name || '').toLowerCase().includes(q) || 
      (r.email || '').toLowerCase().includes(q) || 
      (r.ticketNumber || '').toLowerCase().includes(q)
    );
  }, [registrations, searchQuery]);

  const checkInsToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return checkIns.filter((c: any) => (c.timestamp || c.checkInAt || c.created_at || '').startsWith(today)).length;
  }, [checkIns]);

  const triggerVibrate = (type: 'success' | 'warning' | 'error') => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      if (type === 'success') window.navigator.vibrate([100]);
      if (type === 'warning') window.navigator.vibrate([100, 50, 100]);
      if (type === 'error') window.navigator.vibrate([300, 100, 300]);
    }
  };

  const handleManualCheckIn = useCallback(async (registration: Registration, action: 'check-in' | 'check-out' = 'check-in') => {
    if (!selectedProject?.id) return;
    
    setResultRegistration(registration);
    
    // Validate status before check-in (not check-out)
    if (action === 'check-in') {
      const regStatus = (registration.status || '').toLowerCase();
      const payStatus = ((registration as any).paymentStatus || (registration as any).payment_status || '').toLowerCase();
      const isCancelled = regStatus === 'cancelled' || regStatus === 'cancelado';
      if (isCancelled) {
        toast.error('Inscrição CANCELADA. Não é possível realizar o check-in.');
        triggerVibrate('error');
        setScanResult('error');
        return;
      }
      // Warn but allow for pending payments (operator discretion)
      const isPendingPayment = payStatus === 'pending' || payStatus === 'pendente';
      if (isPendingPayment && regStatus !== 'active') {
        toast.warning('⚠️ Pagamento PENDENTE. Verifique antes de credenciar.', { duration: 5000 });
      }
    }
    
    // Optimistic UI state
    const isExit = action === 'check-out';
    
    // OFFLINE LOGIC
    if (!navigator.onLine) {
      addToQueue({
        registrationId: registration.id,
        projectId: selectedProject.id,
        action: action,
        userId: registration.userId,
        ticketNumber: registration.ticketNumber,
        operatorId: user?.id,
        name: registration.name
      });
      setScanResult(isExit ? 'exit' : 'success');
      triggerVibrate(isExit ? 'warning' : 'success');
      return;
    }

    try {
      const res = await toggleCheckInRegistrationAtomic({
        registrationId: registration.id,
        projectId: selectedProject.id,
        action: action,
        userId: registration.userId,
        ticketNumber: registration.ticketNumber,
        operatorId: user?.id,
        method: 'manual'
      });

      if (res.ok) {
        setScanResult(isExit ? 'exit' : 'success');
        triggerVibrate(isExit ? 'warning' : 'success');
        refetch();
      } else {
        setScanResult(res.duplicate ? 'duplicate' : 'error');
        triggerVibrate('error');
        if (!res.duplicate) toast.error(res.message);
      }
    } catch (err) {
      console.error('Erro no check-in/out manual:', err);
      // Fallback to queue if request fails due to network (even if navigator.onLine was true)
      addToQueue({
        registrationId: registration.id,
        projectId: selectedProject.id,
        action: action,
        userId: registration.userId,
        ticketNumber: registration.ticketNumber,
        operatorId: user?.id,
        name: registration.name
      });
      setScanResult(isExit ? 'exit' : 'success');
      triggerVibrate(isExit ? 'warning' : 'success');
    }
  }, [selectedProject, user, refetch, addToQueue]);

  const handleScannerSuccess = useCallback(async (res: QRData | null, raw?: string) => {
    if (!res && !raw) return;

    // Use raw if res is null (generic scan)
    const effectiveId = res?.id || raw;
    const effectiveType = res?.type || 'registration';

    if (['mentor', 'company', 'startup', 'partner', 'exhibitor', 'sponsor'].includes(effectiveType)) {
      let entity: any = null;
      let role: any = 'participant';

      if (effectiveType === 'mentor') {
        entity = mentors.find(m => m.id === effectiveId);
        role = 'mentor';
      } else if (effectiveType === 'company') {
        entity = companies.find(c => c.id === effectiveId);
        role = 'company';
      } else if (effectiveType === 'startup') {
        entity = startups.find(s => s.id === effectiveId);
        role = 'startup';
      } else if (effectiveType === 'partner' || effectiveType === 'exhibitor') {
        entity = partnerTeamMembers.find((m: any) => m.id === effectiveId);
        role = 'partner';
        
        // Project ID validation for partners - Relaxed for Triunfo reconciliation
        const isSameProject = entity.projectId === selectedProject.id;
        const isSameName = String(selectedProject.name).toLowerCase().includes('triunfo');
        
        if (entity && selectedProject?.id && !isSameProject && !isSameName) {
            console.warn(`[AdminCheckIn] Partner project mismatch. Entity: ${entity.projectId}, Selected: ${selectedProject.id}`);
            toast.error('Colaborador pertence a outro evento.');
            triggerVibrate('error');
            setScanResult('error');
            return;
        }
      }

      if (entity) {
        setSelectedEntity(entity);
        setSelectedRole(role);
        setIsChecklistOpen(true);
        // We close scanner for checklist-based entities as they need manual intervention
        setIsScanning(false);
      } else {
        toast.error('Entidade não encontrada no sistema.');
      }
      return;
    }

    // Standard Registration flow - STAY ACTIVE
    const registration = registrations.find(r => r.id === effectiveId || (r.ticketNumber || '').toLowerCase() === effectiveId.toLowerCase());
    
    if (!registration) {
      toast.loading('Buscando registro no banco...', { id: 'fetch-reg' });
      try {
        const data = await registrationService.findAndLinkRegistration(
          selectedProject.id,
          undefined, 
          effectiveId 
        );

        if (data) {
           const reg = data as any;
            const isSameProject = reg.project_id === selectedProject.id;
            const isSameName = String(reg.event_name || '').toLowerCase().includes('triunfo') && 
                               String(selectedProject.name).toLowerCase().includes('triunfo');
            
            if (selectedProject?.id && !isSameProject && !isSameName) {
              console.warn(`[AdminCheckIn] Project mismatch. Reg: ${reg.project_id}, Selected: ${selectedProject.id}`);
              toast.error('Este ingresso pertence a outro evento.', { id: 'fetch-reg' });
              triggerVibrate('error');
              setScanResult('error');
              return;
            }

            const mapped: Registration = {
                 ...reg,
                 name: reg.name || reg.nome || reg.profiles?.name || reg.users?.name,
                 email: reg.email || reg.profiles?.email || reg.users?.email,
                 phone: reg.phone || reg.telefone || reg.profiles?.phone,
                 company: reg.empresa || reg.profiles?.company || reg.company,
                 projectId: reg.project_id,
                 userId: reg.user_id || reg.participant_id,
                 ticketNumber: reg.ticket_number,
                 checkedIn: reg.checked_in,
                 checkInAt: reg.check_in_at,
                 registrationType: reg.registration_type || reg.ticket_type
            } as any;

            // Auto-toggle based on current state
            const action = mapped.checkedIn ? 'check-out' : 'check-in';
            await handleManualCheckIn(mapped, action);
            toast.dismiss('fetch-reg');
         } else {
           setScanResult('error');
           triggerVibrate('error');
           toast.error('Ingresso não encontrado no sistema.', { id: 'fetch-reg' });
         }
      } catch (err) {
        console.error('Erro ao buscar registro no scanner:', err);
        toast.error('Erro de conexão ao buscar registro.', { id: 'fetch-reg' });
        setScanResult('error');
      }
      return;
    }

    if (registration) {
      const isSameProject = registration.projectId === selectedProject.id;
      const isSameName = String(registration.eventName || '').toLowerCase().includes('triunfo') && 
                         String(selectedProject.name).toLowerCase().includes('triunfo');

      if (selectedProject?.id && !isSameProject && !isSameName) {
         toast.error('Pertence a outro evento.');
         triggerVibrate('error');
         setScanResult('error');
         return;
      }

      const action = registration.checkedIn ? 'check-out' : 'check-in';
      await handleManualCheckIn(registration, action);
    }
  }, [selectedProject, registrations, mentors, companies, startups, partnerTeamMembers, handleManualCheckIn]);

  return (
    <div className="min-h-screen bg-[#0c0e12] p-4 sm:p-8 lg:p-12 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="relative">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-orange-coral/10 rounded-full blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl lg:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
              Acreditação <br />
              <span className="text-brand-orange-coral text-stroke-white">Terminal</span>
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                ADMIN MODE
              </Badge>
              <div className="h-1 w-1 rounded-full bg-gray-700" />
              <div className="flex items-center gap-2">
                {navigator.onLine ? (
                  <Wifi className="h-3 w-3 text-emerald-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-none">
                  {selectedProject?.name || 'Growth Experience'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          {pendingCount > 0 && (
            <Button 
              onClick={() => syncQueue()}
              disabled={isSyncing}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-full px-6 h-12 font-black text-[10px] uppercase tracking-widest flex items-center gap-3"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {pendingCount} Pendentes
            </Button>
          )}

          <Button 
             onClick={() => setShowTotem(true)}
             className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 rounded-full px-6 h-12 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
          >
            <QrCode className="h-4 w-4" />
            Modo Totem / Auto
          </Button>

          <div className="flex items-center bg-white/5 p-2 rounded-[2rem] border border-white/5 backdrop-blur-md">
          <Button
            variant={selectedSessionId === 'all' ? 'default' : 'ghost'}
            className={`${selectedSessionId === 'all' ? 'bg-brand-orange-coral' : 'text-gray-400'} rounded-full px-8 font-black text-[10px] uppercase tracking-widest h-12`}
            onClick={() => setSelectedSessionId('all')}
          >
            Geral
          </Button>
          <div className="px-4">
             <select 
               className="bg-transparent text-white font-black text-[10px] uppercase tracking-widest focus:outline-none border-none cursor-pointer pr-8"
               value={selectedSessionId}
               onChange={(e) => setSelectedSessionId(e.target.value)}
             >
               <option value="all" className="bg-[#0c0e12]">Filtrar por Sessão</option>
               {sessions.map((s: any) => (
                 <option key={s.id} value={s.id} className="bg-[#0c0e12]">{s.title}</option>
               ))}
             </select>
          </div>
        </div>
      </div>
    </div>

    <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-stretch mb-12">
        {/* Search Panel */}
        <div className="glass-card p-5 sm:p-10 border-white/5 rounded-[2rem] sm:rounded-[3rem] relative overflow-hidden flex flex-col">
          <div className="relative mb-8">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-brand-orange-coral" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="NOME, E-MAIL OU CÓDIGO..."
              className="bg-white/5 border-white/10 h-14 sm:h-20 pl-14 sm:pl-16 pr-6 sm:pr-8 rounded-[1.25rem] sm:rounded-[1.5rem] font-black text-white italic placeholder:text-gray-700 focus:border-brand-orange-coral/50 transition-all text-base sm:text-lg uppercase tracking-tight"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[500px]">
            {searchQuery.trim() ? (
              filteredRegistrations.length > 0 ? (
                filteredRegistrations.map(reg => (
                  <div 
                    key={reg.id} 
                    className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between group relative overflow-hidden ${
                      reg.checkedIn 
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : 'bg-white/5 border-white/5 hover:border-brand-orange-coral/30 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-6 relative z-10">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110 ${
                        reg.checkedIn 
                        ? 'bg-emerald-500/20 border-emerald-500/30' 
                        : 'bg-brand-orange-coral/10 border-brand-orange-coral/20'
                      }`}>
                        {reg.checkedIn ? <CheckCircle2 className="h-7 w-7 text-emerald-500" /> : <Users className="h-7 w-7 text-brand-orange-coral" />}
                      </div>
                      <div className="text-left">
                        <h3 className="text-white font-black text-lg uppercase italic leading-none mb-1">{reg.name}</h3>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{reg.email}</p>
                      </div>
                    </div>
                    
                    <Button
                      variant={reg.checkedIn ? "outline" : "default"}
                      onClick={() => handleManualCheckIn(reg, reg.checkedIn ? 'check-out' : 'check-in')}
                      className={`h-12 px-8 rounded-2xl font-black text-[10px] tracking-[0.2em] relative z-10 transition-all active:scale-95 ${
                        reg.checkedIn 
                        ? 'bg-transparent border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10' 
                        : 'bg-brand-orange-coral hover:bg-brand-orange-intense text-white shadow-lg shadow-brand-orange-coral/20'
                      }`}
                    >
                      {reg.checkedIn ? 'CHECK-OUT' : 'CHECK-IN'}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center opacity-30 italic">Nenhum resultado para "{searchQuery}"</div>
              )
            ) : (
               <div className="py-20 text-center opacity-50 space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <Search className="h-8 w-8 text-gray-700" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Aguardando pesquisa ou leitura...</p>
               </div>
            )}
          </div>
        </div>

        {/* Scanner Panel */}
        <div className="glass-card p-5 sm:p-10 border-white/5 rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-[#12141c] to-[#0c0e12] relative overflow-hidden">
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                  <Camera className="h-6 w-6 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Leitura QR</h2>
                  <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest leading-none mt-1">Sincronização Ativa</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => { setIsScanning(!isScanning); setScanKey(p => p + 1); }}
                className={`rounded-full px-6 font-black text-[10px] uppercase tracking-widest h-10 border ${isScanning ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}
              >
                {isScanning ? 'Parar Câmera' : 'Ativar Scanner'}
              </Button>
            </div>

            {isScanning ? (
              <div className="flex-1 min-h-[400px] rounded-[2rem] overflow-hidden border border-white/5 bg-black relative">
                 <QRScanner 
                    key={scanKey}
                    onResult={handleScannerSuccess}
                    active={isScanning}
                 />
                 <div className="absolute inset-0 pointer-events-none border-[40px] border-black/60 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-teal-400/50 rounded-[3rem] relative">
                       <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-2xl" />
                       <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-400 rounded-tr-2xl" />
                       <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-2xl" />
                       <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-2xl" />
                       <div className="absolute inset-x-0 h-0.5 bg-teal-500/50 blur-[2px] animate-scan-line" />
                    </div>
                 </div>
              </div>
            ) : (
              <div 
                onClick={() => setIsScanning(true)}
                className="flex-1 min-h-[400px] rounded-[2rem] border-2 border-dashed border-white/5 bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer group hover:bg-white/[0.04] transition-all"
              >
                <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <QrCode className="h-10 w-10 text-gray-700 group-hover:text-teal-400 transition-colors" />
                </div>
                <p className="text-[11px] font-black text-white italic uppercase tracking-[0.3em]">Clique para iniciar leitura</p>
                <p className="text-gray-700 text-[9px] font-black uppercase tracking-widest mt-2">{selectedProject?.name || 'TERMINAL GX'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log / Recent Activity */}
      <div className="glass-card p-5 sm:p-10 border-white/5 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 sm:mb-10 relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tight">Log de Acreditação</h2>
            <p className="text-[9px] sm:text-[10px] font-black text-gray-700 uppercase tracking-widest">FEED DE ENTRADA EM TEMPO REAL</p>
          </div>
          <Badge className="bg-teal-500/10 text-teal-400 border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest">
            {checkInsToday} HOJE
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {[...(selectedSessionId === 'all' ? checkIns : sessionAttendance.filter((a: any) => (a.sessionId || a.session_id) === selectedSessionId))]
            .sort((a, b) => new Date(b.timestamp || b.checkInAt || b.created_at).getTime() - new Date(a.timestamp || a.checkInAt || a.created_at).getTime())
            .slice(0, 9)
            .map((item, idx) => {
              const reg = registrations.find(r => r.id === (item.registrationId || item.registration_id));
              const mentor = mentors.find(m => m.id === item.userId || (item.ticketNumber || '').includes(m.id));
              const company = companies.find(c => c.id === item.userId || (item.ticketNumber || '').includes(c.id));
              const startup = startups.find(s => s.id === item.userId || (item.ticketNumber || '').includes(s.id));
              
              const ts = item.timestamp || item.checkInAt || item.check_in_at || item.created_at;
              const name = reg?.nome || reg?.name || mentor?.name || company?.name || startup?.name || item.ticketNumber || 'Visitante';
              const role = reg ? 'PARTICIPANTE' : (mentor) ? 'MENTOR' : (company) ? 'EMPRESA' : (startup) ? 'STARTUP' : 'SESSÃO';

              return (
                <div key={idx} className="p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] flex items-center justify-between hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-white/5 group-hover:bg-emerald-500/20 transition-all">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-black italic uppercase tracking-tight group-hover:text-emerald-400 transition-colors truncate max-w-[120px]">{name}</p>
                      <p className="text-gray-500 text-[8px] font-black uppercase tracking-widest mt-0.5">{role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-teal-400 font-black text-[10px] italic tabular-nums">
                      {new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          {checkInsToday === 0 && (
            <div className="col-span-full py-16 text-center opacity-20 italic">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nenhuma acreditação realizada hoje</p>
            </div>
          )}
        </div>
      </div>

      <CheckInResultModal 
        result={scanResult} 
        registration={resultRegistration} 
        onClose={() => { setScanResult(null); setResultRegistration(null); }} 
      />

      <AccreditationChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => { setIsChecklistOpen(false); setSelectedEntity(null); }}
        entity={selectedEntity}
        role={selectedRole}
        projectId={selectedProject?.id || ''}
        onCheckInComplete={() => {
          refetch();
          toast.success('Credenciamento concluído!');
        }}
      />

      {/* Totem Mode Overlay */}
      <AnimatePresence>
        {showTotem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0c0e12] flex flex-col items-center justify-center p-8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-brand-orange-coral/5" />
            
            <button 
              onClick={() => setShowTotem(false)}
              className="absolute top-10 right-10 w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all group active:scale-90"
            >
              <LogOutIcon className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
            </button>

            <div className="relative text-center max-w-2xl w-full">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="text-4xl lg:text-7xl font-black text-white italic uppercase tracking-tighter leading-none mb-6">
                  Auto <br />
                  <span className="text-teal-400 text-stroke-white">Acreditação</span>
                </h2>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-12 bg-teal-500/30" />
                  <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Aponte seu celular para o código</p>
                  <div className="h-px w-12 bg-teal-500/30" />
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="relative inline-block p-12 lg:p-16 rounded-[4rem] bg-white shadow-[0_0_100px_-20px_rgba(45,212,191,0.3)] group"
              >
                <QRCode 
                  value={`GS|E|${selectedProject?.id}`}
                  size={window.innerWidth < 640 ? 250 : 400}
                  level="H"
                />
                <div className="absolute inset-0 border-8 border-teal-500/10 rounded-[4rem] pointer-events-none group-hover:border-teal-500/20 transition-all duration-700" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-20 flex flex-col items-center gap-6"
              >
                <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Terminal Ativo em {selectedProject?.slug?.toUpperCase()}</span>
                </div>
                <p className="text-gray-700 text-[10px] font-bold uppercase tracking-widest">Pressione ESC para sair</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

AdminCheckIn.displayName = 'AdminCheckIn';

export default AdminCheckIn;
