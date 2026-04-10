// Force-recompile: 2026-04-05T15:31:30
import { useState, useMemo, useEffect } from 'react';
import { 
  QrCode, 
  Calendar, 
  Trophy, 
  Sparkles, 
  User, 
  LayoutGrid,
  FileText,
  Award,
  Handshake,
  Rocket,
  BookOpen,
  Shield,
  Bell as BellIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { 
  useNotifications, 
  useSessions, 
  useCheckInsAtividades,
  useMentoringSessions,
  useStands,
  useStandCheckIns,
  useCertificates,
  usePartnerTeam,
  useB2BMeetings,
  useStartups
} from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { CertificateService } from '@/lib/certificateService';
import { useMyRegistration } from '@/hooks/useMyRegistration';

// UI Components
import { PremiumHeader } from './components/shared/PremiumHeader';
import { PremiumBackground } from './components/shared/PremiumBackground';
import { BottomNavigation } from './components/shared/BottomNavigation';
import { PwaDashboardHero } from './components/shared/DashboardHero';
import { QuickActions } from './components/shared/QuickActions';
import { NextActivityCard } from './components/shared/NextActivityCard';
import { Badge } from '@/components/ui/badge';

// Dashboard Sections
import { TicketSection } from './components/TicketSection';
import { AgendaSection } from './components/AgendaSection';
import { GamificationSection } from './components/GamificationSection';
import { RaffleSection } from './components/RaffleSection';
import { MentorshipSection } from './components/MentorshipSection';
import { ProfileForm } from './components/ProfileForm';
import { SupportSection } from './components/SupportSection';
import { DocsSection } from './components/DocsSection';
import { CertificatesSection } from './components/CertificatesSection';
import { DashboardEquipe } from './components/DashboardEquipe';
import { SelfCheckInModal } from './components/SelfCheckInModal';
import { NotificationsSection } from './components/NotificationsSection';
import { GuiaInterno } from '@/components/app/GuiaInterno';

// Modals & Utils
import { MentorRatingModal } from '@/components/mentoring/MentorRatingModal';
import { MentoriaMultiStepModal } from '@/components/forms/MentoriaMultiStepModal';
import { B2BFormModal } from '@/components/forms/B2BFormModal';
import { StartupFormModal } from '@/components/forms/StartupFormModal';
import { LeadScanner } from './components/shared/LeadScanner';
import { generateTicketPDF } from '@/lib/reports';
import { parseQRString } from '@/lib/qrUtils';

export function DashboardParticipante() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { selectedProject } = useProject();
  const { registration, isLoading, error: regError, refetch: refetchReg } = useMyRegistration();
  const isActuallyPaid = !!registration?.isPaid;
  const { data: notificationsData } = useNotifications();
  const { data: allSessions } = useSessions();
  const { data: activityCheckIns } = useCheckInsAtividades();
  const { data: myMentorships, update: updateMentorship } = useMentoringSessions();
  const { data: stands } = useStands();
  const { data: standCheckIns } = useStandCheckIns();
  const { data: certificates, isLoading: loadingCerts, refetch: refetchCerts } = useCertificates();
  const { data: partnerTeamData } = usePartnerTeam();
  const { data: b2bMeetings } = useB2BMeetings();
  const { data: startups } = useStartups();
  const { refetch: refetchNotifications } = useNotifications();
  
  // State
  const [activeTab, setActiveTab] = useState('inicio');
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isMentoriaModalOpen, setIsMentoriaModalOpen] = useState(false);
  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
  const [isStartupModalOpen, setIsStartupModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, mentorshipId: '', mentorName: '' });
  const [searchParams] = useSearchParams();

  // Notifications filtering
  const notifications = useMemo(() => 
    (notificationsData || []).filter(n => n.userId === user?.id),
    [notificationsData, user?.id]
  );

  const handleMarkAsRead = async (id: string) => {
    if (!id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('notifications').update({ 
      read: true, 
      read_at: new Date().toISOString() 
    }).eq('id', id);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

    // Partner Team Membership
    const myPartnerMembership = useMemo(() => {
        if (!partnerTeamData || !user) return null;
        return partnerTeamData.find(m => m.userId === user.id);
    }, [partnerTeamData, user]);

    // Partner logic
    const isPartner = useMemo(() => {
        const ticketType = (registration?.ticketType || '').toLowerCase();
        return !!myPartnerMembership || ticketType.includes('partner') || ticketType.includes('expositor');
    }, [myPartnerMembership, registration?.ticketType]);

    const statusFinanceiro = useMemo(() => {
        if (!registration) return { label: '❓ NÃO LOCALIZADO', color: 'bg-gray-500/20 text-gray-400' };
        
        // Requirement: Partner should not see payment status
        if (isPartner) return null;

        // Corporate logic
        if (registration.companyRegistrationBatches) {
          const batchStatus = registration.companyRegistrationBatches.payment_status?.toLowerCase();
          if (batchStatus === 'paid') {
            return { 
              label: `✅ Pago pela empresa · ${registration.company_name || registration.companyRegistrationBatches.company_name}`, 
              color: 'bg-green-500/20 text-green-400' 
            };
          }
          return { 
            label: `⏳ Aguardando Empresa · ${registration.company_name || registration.companyRegistrationBatches.company_name}`, 
            color: 'bg-yellow-500/20 text-yellow-500' 
          };
        }

        if (registration?.isPaid) return { label: '✅ PAGO', color: 'bg-green-500/20 text-green-400' };
        
        const reg = registration as { status?: string };
        if (reg.status === 'cancelled' || reg.status === 'cancelado') 
            return { label: '❌ CANCELADO', color: 'bg-red-500/20 text-red-500' };
        
        return { label: '⏳ PENDENTE', color: 'bg-yellow-500/20 text-yellow-500' };
    }, [registration, isPartner]);

  // Mentoring Logic
  const mySessions = useMemo(() => 
    (myMentorships || []).filter(m => m.menteeId === user?.id),
    [myMentorships, user?.id]
  );

  const availableSlots = useMemo(() => 
    (myMentorships || []).filter(m => 
      m.status === 'available' || 
      (!m.menteeId || m.menteeId === '00000000-0000-0000-0000-000000000000')
    ),
    [myMentorships]
  );

  // Next Activity Logic
  const nextActivity = useMemo(() => {
    if (!allSessions || !activityCheckIns) return null;
    const sorted = [...allSessions].sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return sorted.find(s => {
      const isAlreadyCheckedIn = activityCheckIns?.some(c => c.sessionId === s.id && c.registrationId === registration?.id);
      return !isAlreadyCheckedIn && (s.startTime || '00:00') >= currentTimeStr;
    }) || sorted[0];
  }, [allSessions, activityCheckIns, registration?.id]);

  // Gamification Progress
  const standsVisited = useMemo(() => {
    if (!standCheckIns || !registration) return 0;
    return standCheckIns.filter(c => c.registrationId === registration.id).length;
  }, [standCheckIns, registration]);

  const totalStands = useMemo(() => stands?.length || 0, [stands]);


  const navTabs = useMemo(() => {
    const tabs = [
      { id: 'inicio', icon: LayoutGrid, label: 'Início' },
      { id: 'ingresso', icon: QrCode, label: 'Ticket' },
      { id: 'agenda', icon: Calendar, label: 'Agenda' },
      { id: 'mentorias', icon: Sparkles, label: 'Mentoria' },
      { id: 'b2b', icon: Handshake, label: 'B2B/Match' },
      { id: 'startups', icon: Rocket, label: 'Startups' },
      { id: 'sorteios', icon: Sparkles, label: 'Sorteios' },
    ];

    // Show Circuito if enabled in project settings
    const settings = selectedProject?.settings as { enableCheckIn?: boolean } | undefined;
    if (settings && settings.enableCheckIn !== false) {
      tabs.push({ id: 'circuito', icon: Trophy, label: 'Circuito' });
    }

    tabs.push({ id: 'dados', icon: User, label: 'Perfil' });
    tabs.push({ id: 'documentos', icon: FileText, label: 'Docs' });
    tabs.push({ id: 'certificados', icon: Award, label: 'Certs' });
    tabs.push({ id: 'guia', icon: BookOpen, label: 'Guia' });
    tabs.push({ id: 'notificacoes', icon: BellIcon, label: 'Notificações' });

    return tabs;
  }, [selectedProject]);

  // Sync tab with query param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
        const validTab = navTabs.find(t => t.id === tab);
        if (validTab) {
            // Defer to avoid "setState in effect" warning
            const timer = setTimeout(() => {
                setActiveTab(tab as any);
            }, 0);
            return () => clearTimeout(timer);
        }
    }
  }, [searchParams, navTabs]);

  // Self Check-in Handler
  const handleScanSuccess = async (decodedText: string) => {
    if (!selectedProject) {
        toast.error('Projeto não identificado.');
        return;
    }
    const qrData = parseQRString(decodedText);
    if (!qrData || !['session', 'registration', 'entry', 'ticket'].includes(qrData.type)) {
        throw new Error('QR Code inválido para este tipo de check-in');
    }

    if (!registration && !myPartnerMembership) throw new Error('Credencial não encontrada');

    const timestamp = new Date().toISOString();

    // 1. Partner Self Check-In Logic
    if (myPartnerMembership && (qrData.type === 'registration' || qrData.type === 'entry' || qrData.type === 'ticket')) {
        // Update partner table
        await (supabase as any).from('partner_team_members').update({
            checked_in: true,
            check_in_time: timestamp
        }).eq('id', myPartnerMembership.id);

        // Log to unified check_ins
        await (supabase as any).from('check_ins').insert({
            project_id: selectedProject?.id,
            user_id: user?.id,
            ticket_number: myPartnerMembership.qrCode || `PARTNER_${myPartnerMembership.id.slice(0, 8)}`,
            timestamp: timestamp,
            location: 'Self Check-In (PWA)',
            method: 'qrcode',
            check_in_type: 'partner',
            notes: `Self check-in via PWA - ${myPartnerMembership.name}`
        });

        toast.success(`Check-in realizado! Bem-vindo ao ${selectedProject.name}.`);
        setIsCheckInModalOpen(false);
        return;
    }

    // 2. Participant Self Check-In Logic
    if (registration && (qrData.type === 'registration' || qrData.type === 'entry')) {
        const { error: entryErr } = await (supabase as any).from('growth_experience_registrations').update({
            checked_in: true,
            check_in_at: timestamp
        }).eq('id', registration.id);

        if (entryErr) throw entryErr;

        // Log to unified check_ins
        await (supabase as any).from('check_ins').insert({
            project_id: selectedProject?.id,
            registration_id: registration.id,
            user_id: user?.id,
            ticket_number: registration.ticketNumber,
            timestamp: timestamp,
            location: 'Self Check-In (PWA)',
            method: 'qrcode',
            check_in_type: 'registration'
        });

        // Emitir certificado de evento
        CertificateService.issueEventCertificate(
            { id: user?.id || '', name: user?.name || '' },
            selectedProject,
            registration.id
        );

        toast.success(`Check-in ${selectedProject.name} realizado! Acesso liberado.`);
        setIsCheckInModalOpen(false);
        return;
    }

    // 3. Activity Check-In (Sessions)
    if (qrData.type === 'session') {
        const { error: activityError } = await supabase.from('activity_check_ins').insert({
            project_id: selectedProject?.id,
            session_id: qrData.id,
            registration_id: registration?.id || null,
            user_id: user?.id,
            check_in_at: timestamp,
            check_in_type: 'qr'
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        if (activityError) throw activityError;

        // Emitir certificado via Service
        if (selectedProject && registration) {
            const sessionObj = (allSessions || []).find(s => s.id === qrData.id);
            if (sessionObj) {
                CertificateService.checkAndIssueSessionCertificate(
                    { id: user?.id || '', name: user?.name || '' },
                    selectedProject,
                    sessionObj,
                    registration.id
                );
            }
        }

        toast.success('Check-in na atividade realizado!');
        setIsCheckInModalOpen(false);
    }
  };

  // Render Section based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <PwaDashboardHero 
              eventName={selectedProject?.name || 'Growth Experience'}
              location={selectedProject?.location || 'Evento'}
              date={selectedProject?.slug?.includes('triunfo') ? '16 ABR 2026' : (selectedProject?.startDate ? new Date(selectedProject.startDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '2026')}
              eventDate={selectedProject?.slug?.includes('triunfo') ? '2026-04-16T17:00:00' : selectedProject?.startDate}
              stats={{
                people: '300+',
                content: '5h+',
                activities: '10+'
              }}
            />

            {/* Credencial de Parceiro - Aparece se usuário vinculado à equipe */}
            {myPartnerMembership && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden border-brand-orange-coral/30"
              >
                <div className="bg-brand-orange-coral/10 p-4 border-b border-brand-orange-coral/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-orange-coral rounded-lg">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight leading-none">Credencial de Trabalho</h4>
                      <p className="text-[9px] font-bold text-brand-orange-coral uppercase tracking-widest leading-none mt-1">Expositor / Parceiro</p>
                    </div>
                  </div>
                  <Badge className="bg-brand-orange-coral text-white font-black text-[9px] h-5">ATIVO</Badge>
                </div>
                <div className="p-5 flex items-center gap-5">
                  <div className="bg-white p-2.5 rounded-2xl shadow-xl shadow-white/5">
                    <QrCode className="h-14 w-14 text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Função</p>
                    <p className="text-lg font-black text-white leading-tight uppercase tracking-tighter">
                      {myPartnerMembership.role || 'Integrante'}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <button 
                        onClick={() => setActiveTab('ingresso')}
                        className="text-brand-orange-coral font-black text-[10px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        Ver Ticket <span className="text-lg leading-none">→</span>
                      </button>
                      {!myPartnerMembership.checkedIn && (
                        <button 
                          onClick={() => setIsCheckInModalOpen(true)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest h-8 px-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          Fazer Check-In
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Regras do Expositor - Aparece se usuário vinculado à equipe */}
            {myPartnerMembership && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 border-white/5 bg-gradient-to-br from-brand-orange-coral/5 to-transparent relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                  <Shield className="h-24 w-24 text-white" />
                </div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                    <Shield className="h-5 w-5 text-brand-orange-coral" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white italic uppercase tracking-tight">10 Regras do Expositor</h4>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mt-1">GX Growth Experience</p>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  {[
                    { t: "Credenciamento obrigatório", d: "Faça seu check-in pelo App do GX antes de montar o stand." },
                    { t: "Respeite os horários", d: "Montagem e desmontagem somente nos horários definidos pela organização." },
                    { t: "Fique no seu espaço", d: "Materiais e displays devem estar dentro da área contratada." },
                    { t: "Postura profissional", d: "Equipe receptiva, cordial e sem abordagens agressivas ao público." },
                    { t: "Venda presencial com autorização", d: "Comercialização direta no stand só com liberação prévia da organização." },
                    { t: "Material visual aprovado", d: "Use apenas materiais alinhados à sua marca e adequados ao público." },
                    { t: "Equipe identificada", d: "Todos os membros do stand devem usar crachá ou uniforme da empresa." },
                    { t: "Use o app GX", d: "Credenciamento, registro de leads e comunicação são feitos pelo app." },
                    { t: "Stand ativo o tempo todo", d: "Mantenha equipe presente durante toda a programação da exposição." },
                    { t: "Siga as normas do local", d: "Respeite as regras do Espaço Parque e as orientações da equipe GX." }
                  ].map((rule, i) => (
                    <div key={i} className="flex gap-4 group/item">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-brand-orange-coral italic group-hover/item:bg-brand-orange-coral group-hover/item:text-white transition-colors shrink-0">
                          {i + 1}
                        </div>
                        {i < 9 && <div className="w-px h-full bg-white/5 my-1" />}
                      </div>
                      <div className="pb-2">
                        <p className="text-[11px] font-black text-white uppercase tracking-tight leading-tight group-hover/item:text-brand-orange-coral transition-colors">{rule.t}</p>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-0.5">{rule.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Próxima Atividade */}
            {nextActivity && (
                <div className="animate-fade-in-up-delayed p-4 sm:p-6 pb-2">
                    <NextActivityCard
                        title={nextActivity.title || nextActivity.titulo}
                        subtitle={nextActivity.room || nextActivity.local || 'Auditório Principal'}
                        time={nextActivity.startTime || nextActivity.horario_inicio}
                        duration="60 min"
                        isConfirmed={activityCheckIns?.some(c => c.sessionId === nextActivity.id)}
                        onClick={() => setActiveTab('agenda')}
                        icon={(() => {
                            const t = (nextActivity.type || nextActivity.tipo || '').toLowerCase();
                            if (t.includes('palestra')) return Presentation;
                            if (t.includes('painel')) return Users;
                            if (t.includes('workshop')) return BookOpen;
                            if (t.includes('pitch')) return Rocket;
                            return Mic2;
                        })()}
                    />
                </div>
            )}

            <QuickActions 
              onB2BClick={() => setIsB2BModalOpen(true)}
              onStartupClick={() => setIsStartupModalOpen(true)}
              onMentoriaClick={() => setActiveTab('mentorias')}
              showMentoria={Boolean(selectedProject?.settings?.enableMentoring)}
              showB2B={Boolean(selectedProject?.settings?.enableB2B)}
              showStartup={Boolean(selectedProject?.settings?.enableStartups)}
            />

            {/* Quick Stats Banners */}
            <div className="grid grid-cols-2 gap-3 px-1">
               <div 
                 onClick={() => setActiveTab('circuito')}
                 className="glass-card p-5 bg-gradient-to-br from-brand-orange-coral/10 to-transparent border-brand-orange-coral/20 cursor-pointer active:scale-95 transition-all"
               >
                  <p className="text-foreground/40 text-[9px] font-black uppercase tracking-widest mb-1">Circuito</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-black text-white italic">{standsVisited}/{totalStands}</p>
                    <Trophy className="h-4 w-4 text-brand-orange-coral/50" />
                  </div>
               </div>
               <div 
                 onClick={() => setActiveTab('ingresso')}
                 className="glass-card p-5 bg-gradient-to-br from-teal-500/10 to-transparent border-teal-500/20 cursor-pointer active:scale-95 transition-all"
               >
                  <p className="text-foreground/40 text-[9px] font-black uppercase tracking-widest mb-1">Seu Ticket</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-black text-white italic">Ativo</p>
                    <QrCode className="h-4 w-4 text-teal-500/50" />
                  </div>
               </div>
            </div>
          </motion.div>
        );
      case 'ingresso':
        return (
          <TicketSection 
            myRegistration={registration} 
            user={user} 
            selectedProject={selectedProject} 
            statusFinanceiro={statusFinanceiro}
            isActuallyPaid={isActuallyPaid}
            isPartner={isPartner}
            generateTicketPDF={generateTicketPDF}
            setShowCheckInModal={setIsCheckInModalOpen}
            setShowUpgradeModal={() => toast.info('Funcionalidade disponível em breve diretamente com a equipe.')}
            onRefresh={refetchReg}
          />
        );
      case 'agenda': {
        const myCursos = (allSessions || []).filter(s => 
          ((registration as { cursosSelecionados?: string[] })?.cursosSelecionados || []).includes(s.id)
        );

        return (
          <AgendaSection 
            myRegistration={registration}
            cursosSelecionados={myCursos}
            setIsSelfCheckInOpen={(val) => {
                if (!registration) {
                    toast.error('Inscrição não localizada para realizar check-in.');
                    return;
                }
                setIsCheckInModalOpen(val);
            }}
            navigate={navigate}
            selectedProject={selectedProject}
            allSessions={allSessions || []}
            activityCheckIns={(activityCheckIns || []).map(c => ({
                sessionId: c.sessionId,
                registrationId: c.registrationId || '',
                checkInAt: c.checkInAt
            }))}
          />
        );
      }
      case 'circuito':
        return (
          <GamificationSection 
            registrationId={registration?.id || ''}
            setIsScanOpen={setIsScanOpen} 
          />
        );
      case 'sorteios':
        return (
          <RaffleSection 
            registrationId={registration?.id || ''}
            setIsScanOpen={setIsScanOpen}
          />
        );
      case 'mentorias':
        if (!selectedProject?.settings?.enableMentoring) {
          return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <Sparkles className="h-12 w-12 text-gray-600 mb-4" />
              <h2 className="text-xl font-black text-white italic uppercase">Mentoria Indisponível</h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">A Mentoria não está ativada para esse evento.</p>
            </div>
          );
        }
        return (
          <MentorshipSection 
            myMentorships={mySessions}
            availableSlots={availableSlots} 
            handleCancelMentoring={async (id) => {
                await updateMentorship(id, { status: 'cancelled' } as any);
                toast.success('Agendamento cancelado.');
            }}
            handleBookMentoring={async (slotId, topic) => {
                if (!user) return;
                await updateMentorship(slotId, { 
                    menteeId: user.id, 
                    menteeName: user.name,
                    menteeEmail: user.email,
                    menteePhone: (user as any).phone,
                    topicOfInterest: topic,
                    status: 'scheduled' 
                } as any);
                toast.success('Mentoria agendada com sucesso!');
            }}
            handleJoinWaitlist={() => toast.info('Funcionalidade sendo processada pela organização.')}
            setRatingModal={setRatingModal}
            setIsMentoriaModalOpen={setIsMentoriaModalOpen}
          />
        );
      case 'b2b':
        if (!selectedProject?.settings?.enableB2B) {
          return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <Handshake className="h-12 w-12 text-gray-600 mb-4" />
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">B2B Indisponível</h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">A Rodada de Negócios não está ativada para esse evento.</p>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-6">
            <div className="w-20 h-20 bg-teal-500/20 rounded-3xl flex items-center justify-center shadow-lg shadow-teal-500/10">
              <Handshake className="h-10 w-10 text-teal-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white italic">Rodada de Negócios</h2>
              <p className="text-gray-400 text-sm max-w-xs mx-auto text-center font-medium">Conecte-se com outros empresários e gere novas parcerias estratégicas.</p>
            </div>
            <button 
              onClick={() => setIsB2BModalOpen(true)}
              className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-500/20 transition-all active:scale-95"
            >
              INSCREVER AGORA
            </button>
          </div>
        );
      case 'startups':
        if (!selectedProject?.settings?.enableStartups) {
          return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <Rocket className="h-12 w-12 text-gray-600 mb-4" />
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Startups Indisponível</h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">A Expo StartUp não está ativada para esse evento.</p>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-6">
            <div className="w-20 h-20 bg-brand-orange-coral/20 rounded-3xl flex items-center justify-center shadow-lg shadow-brand-orange-coral/10">
              <Rocket className="h-10 w-10 text-brand-orange-coral" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white italic italic italic italic">Expo StartUp</h2>
              <p className="text-gray-400 text-sm max-w-xs mx-auto text-center font-medium">Apresente seu projeto na arena de inovação do Growth Experience.</p>
            </div>
            <button 
              onClick={() => setIsStartupModalOpen(true)}
              className="px-8 py-4 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-2xl shadow-xl shadow-brand-orange-coral/20 transition-all active:scale-95"
            >
              RESERVAR STAND
            </button>
          </div>
        );
      case 'certificados':
        return (
          <CertificatesSection 
            certificados={certificates} 
            loadingCerts={loadingCerts} 
            fetchCertificados={refetchCerts} 
            onDownload={(cert) => {
              toast.info(`Iniciando download do certificado: ${cert.activityName || cert.activity_name}`);
              // Potential integration with PDF generation or direct URL
              if (cert.code) {
                  window.open(`/api/certificates/download/${cert.code}`, '_blank');
              }
            }} 
          />
        );
      case 'dados':
        return <ProfileForm />;
      case 'suporte':
        return <SupportSection navigate={navigate} />;
      case 'documentos':
        return <DocsSection documentos={[]} loadingDocs={false} />;
      case 'equipe':
        return <DashboardEquipe batches={[]} />;
      case 'guia':
        return <GuiaInterno />;
      case 'notificacoes':
        return <NotificationsSection notifications={notifications} onRefresh={refetchNotifications} />;
      default:
        return <div className="text-white text-center py-20">Em breve</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] relative overflow-hidden">
      <PremiumBackground />
      
      <div className="relative z-10 pb-32">
        <PremiumHeader 
          userName={user?.name || ''}
          userAvatar={registration?.photo || user?.avatar}
          projectName={selectedProject?.name || 'GX 2026'}
          roleLabel="PARTICIPANTE"
          isPro={Boolean(
            (registration?.companyRegistrationBatches?.ticket_type?.toLowerCase() === 'pro' || 
             registration?.companyRegistrationBatches?.ticket_type?.toLowerCase() === 'vip') ||
            registration?.ticketType?.toLowerCase() === 'pro' || 
            registration?.ticketType?.toLowerCase() === 'vip' || 
            registration?.palestrasNoturnas
          )}
          notifications={notifications}
          onLogout={handleLogout}
          onNotificationRead={async (id) => { await handleMarkAsRead(id); }}
          onGuideClick={() => setActiveTab('guia')}
          onSupportClick={() => setActiveTab('suporte')}
          onNotificationsClick={() => setActiveTab('notificacoes')}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <BottomNavigation 
        tabs={navTabs} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Global Modals */}
      {registration && isCheckInModalOpen && (
        <SelfCheckInModal 
          onClose={() => setIsCheckInModalOpen(false)}
          onScanSuccess={handleScanSuccess}
          registration={registration}
        />
      )}

      <AnimatePresence>
        {ratingModal.isOpen && (
           <MentorRatingModal 
                isOpen={ratingModal.isOpen}
                onClose={() => setRatingModal({ ...ratingModal, isOpen: false })}
                mentorName={ratingModal.mentorName}
                sessionId={ratingModal.mentorshipId}
                onSubmit={async (sid, val, ind) => {
                    await updateMentorship(sid, {
                        menteeRating: val,
                        menteeComment: `Rating: ${val}/5. Recommendation: ${ind}/5. Avaliado via PWA.`,
                        status: 'completed',
                        ratedAt: new Date().toISOString()
                    } as any);
                    toast.success('Avaliação enviada!');
                }}
            />
        )}
      </AnimatePresence>

      <MentoriaMultiStepModal 
        isOpen={isMentoriaModalOpen}
        onClose={() => setIsMentoriaModalOpen(false)}
      />

      <B2BFormModal 
        isOpen={isB2BModalOpen}
        onClose={() => setIsB2BModalOpen(false)}
      />

      <StartupFormModal 
        isOpen={isStartupModalOpen}
        onClose={() => setIsStartupModalOpen(false)}
      />

      {isScanOpen && (
        <LeadScanner 
          onClose={() => setIsScanOpen(false)}
          onScanSuccess={(code) => {
            console.debug('Scanned Stand Code:', code);
            toast.success('Stand validado!');
            setIsScanOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default DashboardParticipante;
