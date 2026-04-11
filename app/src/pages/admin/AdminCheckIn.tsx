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
  LogOut
} from 'lucide-react';
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
import type { Registration, Mentor, Company, Startup } from '@/types';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const AdminCheckIn = () => {
  const { selectedProject } = useProject();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [scanResult, setScanResult] = useState<'success' | 'error' | 'duplicate' | 'exit' | null>(null);
  const [resultRegistration, setResultRegistration] = useState<Registration | null>(null);
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
  const { data: checkIns, refetch: refetchCheckIns } = useData<any>([], 'check_ins');
  const { data: sessionAttendance, refetch: refetchAttendance } = useData<any>([], 'activity_attendance');
  const { data: sessions } = useData<any>([], 'sessions');
  const { data: partnerTeamMembers } = useData<any>([], 'partner_team_members');

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
    return checkIns.filter((c: any) => (c.timestamp || c.checkInAt || '').startsWith(today)).length;
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
        
        // Project ID validation for partners
        if (entity && selectedProject?.id && entity.projectId !== selectedProject.id) {
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
    const registration = registrations.find(r => r.id === effectiveId);
    
    if (!registration) {
      toast.loading('Buscando registro no banco...', { id: 'fetch-reg' });
      try {
        const { data, error } = await supabase
          .from('growth_experience_registrations')
          .select('*, profiles:profiles!growth_experience_registrations_user_id_fkey(user_id, name, email, phone, company, city, state, role)')
          .eq('id', effectiveId)
          .maybeSingle();

        if (data && !error) {
           const reg = data as any;
           // Validate project_id if scanner is in general mode or session mode
           if (selectedProject?.id && reg.project_id !== selectedProject.id) {
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
                registrationType: reg.ticket_type || reg.registration_type
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
      // Validate project_id
      if (selectedProject?.id && registration.projectId !== selectedProject.id) {
        toast.error('Ingresso de outro evento.');
        triggerVibrate('error');
        setScanResult('error');
        return;
      }
      // Auto-toggle based on current state
      const action = registration.checkedIn ? 'check-out' : 'check-in';
      await handleManualCheckIn(registration, action);
    }
  }, [registrations, mentors, companies, startups, partnerTeamMembers, handleManualCheckIn, selectedProject]);

  const handleEntitySelection = (entity: any, role: 'participant' | 'mentor' | 'company' | 'startup' | 'partner') => {
    setSelectedEntity(entity);
    setSelectedRole(role);
    setIsChecklistOpen(true);
  };

  const selectedSession = useMemo(() => 
    sessions.find((s: any) => s.id === selectedSessionId), 
  [sessions, selectedSessionId]);

  return (
    <div className="min-h-screen bg-[#0c0e12] p-6 lg:p-12 space-y-12 pb-32">
      {/* Result Modal */}
      <CheckInResultModal
        result={scanResult}
        registration={resultRegistration}
        onClose={() => {
          setScanResult(null);
          if (isScanning) setScanKey(prev => prev + 1); // Auto-restart scanner
        }}
      />

      {/* Checklist Modal */}
      <AccreditationChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        entity={selectedEntity}
        role={selectedRole}
        projectId={selectedProject?.id || ''}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="relative">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-orange-coral/10 rounded-full blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl lg:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
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

      <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        {/* Search Panel */}
        <div className="glass-card p-10 border-white/5 rounded-[3rem] relative overflow-hidden flex flex-col">
          <div className="relative mb-8">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-brand-orange-coral" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="NOME, E-MAIL OU CÓDIGO DO INGRESSO..."
              className="bg-white/5 border-white/10 h-20 pl-16 pr-8 rounded-[1.5rem] font-black text-white italic placeholder:text-gray-700 focus:border-brand-orange-coral/50 transition-all text-lg uppercase tracking-tight"
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
                         {reg.checkedIn ? (
                           <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                         ) : (
                           <Ticket className="h-8 w-8 text-brand-orange-coral" />
                         )}
                      </div>
                      <div>
                        <h3 className="text-white font-black italic text-xl uppercase tracking-tighter leading-tight">{reg.name}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{reg.ticketNumber}</span>
                          <div className="h-1 w-1 rounded-full bg-gray-700" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{reg.registrationType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                      {reg.checkedIn ? (
                        <div className="flex flex-col items-end gap-2">
                           <Badge className="bg-emerald-500/10 text-emerald-400 border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase">
                             PRESENTADO
                           </Badge>
                           <Button
                              onClick={() => handleManualCheckIn(reg, 'check-out')}
                              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-amber-500/20"
                           >
                             <LogOut className="h-3 w-3" />
                             Registrar Saída
                           </Button>
                        </div>
                      ) : (
                        <Button
                          disabled={loadingReg}
                          onClick={() => handleManualCheckIn(reg, 'check-in')}
                          className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-orange-coral/20 active:scale-95 transition-transform flex items-center gap-3"
                        >
                          Check-in <LogIn className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Gradient background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange-coral/5 blur-3xl -mr-16 -mt-16 group-hover:bg-brand-orange-coral/10 transition-all" />
                  </div>
                ))
              ) : (
                <div className="py-20 text-center opacity-20">
                  <Search className="h-10 w-10 mx-auto mb-4 text-gray-500" />
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Nenhum registro encontrado</p>
                </div>
              )
            ) : (
              <div className="py-20 text-center opacity-10">
                <Clock className="h-10 w-10 mx-auto mb-4 text-gray-700" />
                <p className="text-[10px] font-black uppercase text-gray-700 tracking-widest">Aguardando busca para acreditação manual</p>
              </div>
            )}
          </div>
        </div>

        {/* Scanner Terminal */}
        <div className="glass-card p-10 border-white/5 rounded-[2.5rem] relative overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-brand-orange-coral italic uppercase tracking-tight">Terminal Scanner</h2>
              <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">ACREDITAÇÃO POR QR CODE</p>
            </div>
            <Camera className="h-6 w-6 text-brand-orange-coral opacity-20" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center bg-black/40 rounded-[2rem] border-2 border-dashed border-white/5 relative group overflow-hidden z-10">
            {!isScanning ? (
              <div className="text-center p-10">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-brand-orange-coral/10 rounded-full flex items-center justify-center mx-auto border border-brand-orange-coral/20">
                    <Camera className="h-12 w-12 text-brand-orange-coral" />
                  </div>
                  <div className="absolute -inset-4 border border-brand-orange-coral/20 rounded-full animate-ping opacity-20" />
                </div>
                <h3 className="text-white font-black italic uppercase tracking-tighter mb-2 text-xl">Pronto para Digitalizar</h3>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-8 leading-relaxed max-w-[200px] mx-auto">
                   Posicione o QR Code do participante em frente à câmera
                </p>
                <Button
                  onClick={() => setIsScanning(true)}
                  className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black h-14 px-12 rounded-[1.5rem] text-[10px] uppercase tracking-widest shadow-glow-orange animate-bounce-subtle"
                >
                  ATIVAR CÂMERA
                </Button>
              </div>
            ) : (
              <QRScanner
                key={scanKey}
                onSuccess={handleScannerSuccess}
                onClose={() => setIsScanning(false)}
                isInline={true}
              />
            )}
          </div>
        </div>
      </div>

      {/* Audit Log / Recent Activity */}
      <div className="glass-card p-10 border-white/5 rounded-[2.5rem] relative overflow-hidden">
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Log de Acreditação</h2>
            <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">FEED DE ENTRADA EM TEMPO REAL</p>
          </div>
          <Badge className="bg-teal-500/10 text-teal-400 border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest">
            {checkInsToday} HOJE
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {[...(selectedSessionId === 'all' ? checkIns : sessionAttendance.filter((a: any) => (a.sessionId || a.session_id) === selectedSessionId))]
            .sort((a, b) => new Date(b.timestamp || b.checkInAt).getTime() - new Date(a.timestamp || a.checkInAt).getTime())
            .slice(0, 9)
            .map((item, idx) => {
              const reg = registrations.find(r => r.id === (item.registrationId || item.registration_id));
              const mentor = mentors.find(m => m.id === item.userId || (item.ticketNumber || '').includes(m.id));
              const company = companies.find(c => c.id === item.userId || (item.ticketNumber || '').includes(c.id));
              const startup = startups.find(s => s.id === item.userId || (item.ticketNumber || '').includes(s.id));
              
              const ts = item.timestamp || item.checkInAt || item.check_in_at;
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
    </div>
  );
};

AdminCheckIn.displayName = 'AdminCheckIn';

export default AdminCheckIn;
