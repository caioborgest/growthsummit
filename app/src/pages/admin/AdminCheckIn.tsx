import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  Filter,
  Building2,
  Rocket,
  User,
  Camera,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRegistrations, useCheckIns, useSessions, useCheckInsAtividades, useMentors, useCompanies, useStartups } from '@/hooks/useData';
import { toast } from 'sonner';
import { QRScanner } from '@/components/app/QRScanner';
import type { Registration } from '@/types';
import type { QRData } from '@/lib/qrUtils';
import { CheckInResultModal } from '@/components/admin/CheckInResultModal';
import { AccreditationChecklistModal } from '@/components/admin/AccreditationChecklistModal';
import { CertificateService } from '@/lib/certificateService';
import { useProject } from '@/contexts/ProjectContext';
import { checkInRegistrationAtomic } from '@/lib/checkInAtomic';
import { supabase } from '@/lib/supabase';

export function AdminCheckIn() {
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const { data: mentors } = useMentors();
  const { data: companies } = useCompanies();
  const { data: startups } = useStartups();
  const { data: registrations, update, refetch } = useRegistrations();
  const { data: checkIns, create: createEventCheckIn } = useCheckIns();
  const { data: sessions } = useSessions();
  const { data: sessionAttendance, create: createSessionAttendance } = useCheckInsAtividades();

  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(searchParams.get('scan') === 'true');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');

  const [scanResult, setScanResult] = useState<'success' | 'error' | 'duplicate' | null>(null);
  const [resultRegistration, setResultRegistration] = useState<Registration | null>(null);

  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<'participant' | 'mentor' | 'company' | 'startup'>('participant');

  const selectedSession = useMemo(() =>
    sessions.find(s => s.id === selectedSessionId),
    [sessions, selectedSessionId]
  );

  const triggerVibrate = (type: 'success' | 'error') => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (type === 'success') {
          navigator.vibrate(200);
        } else {
          navigator.vibrate([100, 50, 100]);
        }
      }
    } catch { /* silent */ }
  };

  const handleManualCheckIn = useCallback(async (registration: Registration) => {
    try {
      if (selectedSessionId === 'all') {
        if (registration.checkedIn) {
          setScanResult('duplicate');
          setResultRegistration(registration);
          triggerVibrate('error');
          return;
        }

        const atomic = await checkInRegistrationAtomic({
          registrationId: registration.id,
          projectId: registration.projectId,
          userId: registration.userId,
          ticketNumber: registration.ticketNumber,
          operatorId: user?.id,
          location: 'Entrada Principal',
          method: 'manual',
        });

        if (!atomic.ok) {
          if (atomic.duplicate) {
            setScanResult('duplicate');
            setResultRegistration(registration);
            triggerVibrate('error');
            toast.info('Participante já credenciado.');
            return;
          }
          throw new Error(atomic.message);
        }

        await refetch?.(true);

        // Emitir certificado de participação no evento e notificar
        if (selectedProject) {
            CertificateService.issueEventCertificate(
                { id: registration.userId, name: registration.nome || registration.name },
                selectedProject,
                registration.id
            );
        }

        toast.success(`Check-in GERAL realizado: ${registration.ticketNumber}`);
      } else {
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
          operatorId: user?.id
        });

        // Tentar emitir certificado da atividade e notificar
        if (selectedProject && selectedSession) {
            CertificateService.checkAndIssueSessionCertificate(
                { id: registration.userId, name: registration.nome || registration.name },
                selectedProject,
                selectedSession,
                registration.id
            );
        }

        toast.success(`Presença registrada em: ${selectedSession?.title}`);
      }

      triggerVibrate('success');
      setSearchQuery('');
    } catch (err: unknown) {
      const error = err as Error;
      setScanResult('error');
      triggerVibrate('error');
      toast.error(`Erro ao realizar check-in: ${error.message || 'Erro desconhecido'}`);
    }
  }, [update, createEventCheckIn, createSessionAttendance, selectedSessionId, sessionAttendance, selectedSession, user?.id, selectedProject, refetch]);

  const handleScannerSuccess = useCallback(async (res: QRData | null, raw?: string) => {
    if (!res && !raw) return;

    // Use raw if res is null (generic scan)
    const effectiveId = res?.id || raw;
    const effectiveType = res?.type || 'registration';

    if (['mentor', 'company', 'startup'].includes(effectiveType)) {
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
          .from('registrations')
          .select('*, profiles(name, email, phone)')
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
                name: reg.profiles?.name || reg.name || reg.nome,
                email: reg.profiles?.email || reg.email,
                phone: reg.profiles?.phone || reg.phone || reg.telefone,
                projectId: reg.project_id,
                userId: reg.participant_id,
                ticketNumber: reg.ticket_number,
                checkedIn: reg.checked_in,
                checkInAt: reg.check_in_at,
                registrationType: reg.ticket_type || reg.registration_type
           } as any;

           await handleManualCheckIn(mapped);
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
      await handleManualCheckIn(registration);
    }
    
    // NOTE: We do NOT set setIsScanning(false) here to allow continuous scanning for registrations
  }, [registrations, mentors, companies, startups, handleManualCheckIn, selectedProject?.id]);

  const handleEntitySelection = (entity: any, role: 'participant' | 'mentor' | 'company' | 'startup') => {
    setSelectedEntity(entity);
    setSelectedRole(role);
    setIsChecklistOpen(true);
  };

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

  const unifiedResults = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return [];

    const results: any[] = [];

    registrations.filter(r => 
      r.id.toLowerCase().includes(query) ||
      (r.nome || r.name || '').toLowerCase().includes(query) ||
      (r.email || '').toLowerCase().includes(query) ||
      r.ticketNumber.toLowerCase().includes(query)
    ).forEach(r => results.push({ ...r, _role: 'participant', _name: r.nome || r.name }));

    mentors.filter(m => 
      m.id.toLowerCase().includes(query) ||
      (m.name || '').toLowerCase().includes(query) ||
      (m.email || '').toLowerCase().includes(query)
    ).forEach(m => results.push({ ...m, _role: 'mentor', _name: m.name }));

    startups.filter(s => 
      s.id.toLowerCase().includes(query) ||
      (s.name || '').toLowerCase().includes(query) ||
      (s.email || '').toLowerCase().includes(query)
    ).forEach(s => results.push({ ...s, _role: 'startup', _name: s.name }));

    companies.filter(c => 
      c.id.toLowerCase().includes(query) ||
      (c.name || '').toLowerCase().includes(query) ||
      (c.contactEmail || '').toLowerCase().includes(query)
    ).forEach(c => results.push({ ...c, _role: 'company', _name: c.name }));

    return results;
  }, [searchQuery, registrations, mentors, startups, companies]);

  const today = new Date().toLocaleDateString('en-CA');
  const checkInsToday = checkIns.filter(c =>
    new Date(c.timestamp).toLocaleDateString('en-CA') === today
  ).length;

  return (
    <div className="space-y-10 py-6 animate-in fade-in duration-700">
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

      {isChecklistOpen && (
        <AccreditationChecklistModal
          isOpen={isChecklistOpen}
          onClose={() => {
            setIsChecklistOpen(false);
            setSelectedEntity(null);
          }}
          entity={selectedEntity}
          role={selectedRole}
          onSuccess={() => {}}
        />
      )}

      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic mb-1 uppercase">
            CONTROLE DE <span className="text-brand-orange-coral">ACESSO</span>
          </h1>
          <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">
            Acreditação e Monitoramento de Fluxo em Tempo Real
          </p>
        </div>
        
        <div className="flex items-center gap-4 p-1 bg-dark-200/50 border border-white/5 rounded-[2rem] backdrop-blur-xl h-14 pr-6">
          <div className="w-12 h-12 rounded-[1.5rem] bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20 shrink-0 ml-1">
            <QrCode className="h-6 w-6 text-brand-orange-coral" />
          </div>
          <div className="min-w-[120px]">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Modo Ativo</p>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-xs italic uppercase">
                {selectedSessionId === 'all' ? 'Check-in Geral' : 'Sessão Específica'}
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-emerald" />
            </div>
          </div>
          <div className="h-8 w-px bg-white/5 mx-2" />
          
          <div className="relative group">
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="bg-transparent text-[10px] font-black text-teal-400 uppercase tracking-widest focus:outline-none pr-8 pl-4 appearance-none cursor-pointer hover:text-white transition-colors"
            >
              <option value="all">TODOS OS ACESSOS</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>{s.title.toUpperCase()}</option>
              ))}
            </select>
            <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-teal-400 pointer-events-none group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card hover-card p-6 border-white/5 rounded-[2.5rem] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6 text-brand-orange-coral" />
            </div>
            <Badge className="bg-brand-orange-coral/10 text-brand-orange-coral border-none font-black text-[9px] tracking-widest uppercase">Hoje</Badge>
          </div>
          <div className="relative z-10">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] mb-1 italic">Check-ins Hoje</p>
            <p className="text-4xl font-black text-white tracking-tighter tabular-nums italic">{checkInsToday}</p>
          </div>
        </div>

        <div className="glass-card hover-card p-6 border-white/5 rounded-[2.5rem] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
              <User className="h-6 w-6 text-teal-400" />
            </div>
            <Badge className="bg-teal-500/10 text-teal-400 border-none font-black text-[9px] tracking-widest uppercase">Participantes</Badge>
          </div>
          <div className="relative z-10">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] mb-1 italic">Total Acreditado</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-white tracking-tighter tabular-nums italic">{checkedInCount}</p>
              <p className="text-sm font-black text-gray-700 italic">/ {totalRegistrations}</p>
            </div>
          </div>
        </div>

        <div className="glass-card hover-card p-6 border-white/5 rounded-[2.5rem] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-6 w-6 text-blue-400" />
            </div>
            <Badge className="bg-blue-500/10 text-blue-400 border-none font-black text-[9px] tracking-widest uppercase">VIP & Staff</Badge>
          </div>
          <div className="relative z-10">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] mb-1 italic">Especiais</p>
            <p className="text-4xl font-black text-white tracking-tighter tabular-nums italic">
              {checkIns.filter(c => 
                (c.checkInType && c.checkInType !== 'event') || 
                (c.ticketNumber || '').startsWith('ROLE_')
              ).length}
            </p>
          </div>
        </div>

        <div className="glass-card hover-card p-6 border-white/5 rounded-[2.5rem] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <Badge className="bg-purple-500/10 text-purple-400 border-none font-black text-[9px] tracking-widest uppercase">Performance</Badge>
          </div>
          <div className="relative z-10">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] mb-1 italic">Taxa de Chegada</p>
            <p className="text-4xl font-black text-white tracking-tighter tabular-nums italic">
              {totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {selectedSession && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 border-teal-500/20 bg-teal-500/5 rounded-[2.5rem] relative overflow-hidden group"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 group-hover:rotate-12 transition-transform duration-500">
              <Filter className="h-10 w-10 text-teal-400" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <Badge className="mb-3 bg-teal-500 text-white font-black text-[10px] tracking-widest italic px-4 py-1">CHECK-IN DE ATIVIDADE ATIVO</Badge>
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{selectedSession.title}</h3>
              <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mt-1">SALA: {selectedSession.room.toUpperCase()} • {selectedSession.startTime} - {selectedSession.endTime}</p>
            </div>
            <div className="flex flex-col items-center md:items-end shrink-0">
              <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest mb-1">Presenças Atuais</p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-black text-teal-400 italic tabular-nums leading-none">
                  {sessionAttendance.filter(a => (a.sessionId || a.session_id) === selectedSessionId).length}
                </p>
                {selectedSession.maxCapacity > 0 && (
                  <p className="text-xl font-black text-gray-700 italic tabular-nums"> / {selectedSession.maxCapacity}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 shrink-0"
              onClick={() => setSelectedSessionId('all')}
            >
              <XCircle className="h-6 w-6" />
            </Button>
          </div>
          {/* Animated Capacity Bar */}
          {selectedSession.maxCapacity > 0 && (
            <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(sessionAttendance.filter(a => (a.sessionId || a.session_id) === selectedSessionId).length / selectedSession.maxCapacity) * 100}%` }}
                className="h-full bg-teal-500 shadow-glow-teal"
               />
            </div>
          )}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="glass-card p-10 border-white/5 rounded-[2.5rem] relative overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Busca Inteligente</h2>
              <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">LOCALIZAÇÃO RÁPIDA DE REGISTROS</p>
            </div>
            <Search className="h-6 w-6 text-teal-400 opacity-20" />
          </div>

          <div className="relative mb-8 z-10">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-500" />
             <input
               autoFocus
               type="text"
               placeholder="Nome, e-mail ou número do ticket..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onKeyDown={handleKeyDown}
               className="w-full h-16 pl-16 pr-8 bg-white/[0.02] border border-white/5 rounded-2xl text-white font-black italic focus:outline-none focus:border-teal-500 transition-all placeholder:text-gray-700 placeholder:italic placeholder:font-black"
             />
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
            {searchQuery ? (
              unifiedResults.length > 0 ? (
                unifiedResults.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] flex items-center justify-between hover:bg-white/[0.04] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                        {item._role === 'participant' && <User className="h-6 w-6 text-teal-400" />}
                        {item._role === 'mentor' && <User className="h-6 w-6 text-blue-400" />}
                        {item._role === 'company' && <Building2 className="h-6 w-6 text-purple-400" />}
                        {item._role === 'startup' && <Rocket className="h-6 w-6 text-brand-orange-coral" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                           <p className="text-white text-sm font-black italic uppercase tracking-tight">{item._name || 'Sem nome'}</p>
                          <Badge className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border-none ${
                            item._role === 'participant' ? 'bg-teal-500/10 text-teal-400' :
                            item._role === 'mentor' ? 'bg-blue-500/10 text-blue-400' :
                            item._role === 'startup' ? 'bg-brand-orange-coral/10 text-brand-orange-coral' :
                            'bg-purple-500/10 text-purple-400'
                          }`}>
                            {item._role}
                          </Badge>
                        </div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest line-clamp-1 truncate max-w-[150px]">
                          {item.ticketNumber || (item.email || item.contactEmail)}
                        </p>
                        {item._role === 'participant' && item.payment_status === 'pendente' && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertCircle className="h-2.5 w-2.5 text-red-400" />
                            <span className="text-red-400 text-[8px] font-black uppercase tracking-widest">Pagamento Pendente</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black text-[9px] uppercase tracking-widest px-6 rounded-xl h-10 shadow-glow-orange"
                      onClick={() => handleEntitySelection(item, item._role)}
                    >
                      ACREDITAR
                    </Button>
                  </motion.div>
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
          {[...(selectedSessionId === 'all' ? checkIns : sessionAttendance.filter(a => (a.sessionId || a.session_id) === selectedSessionId))]
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
}
