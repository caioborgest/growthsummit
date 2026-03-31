import { useState, useMemo } from 'react';
import { 
  QrCode, 
  Calendar, 
  Trophy, 
  Sparkles, 
  User, 
  LayoutGrid,
  FileText,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  useRaffles
} from '@/hooks/useData';
import { useMyRegistration } from '@/hooks/useMyRegistration';
import { supabase } from '@/lib/supabase';

// UI Components
import { PremiumHeader } from './components/shared/PremiumHeader';
import { PremiumBackground } from './components/shared/PremiumBackground';
import { BottomNavigation } from './components/shared/BottomNavigation';
import { PwaDashboardHero } from './components/shared/DashboardHero';
import { QuickActions } from './components/shared/QuickActions';
import { NextActivityCard } from './components/shared/NextActivityCard';

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
  const { registration, refetch: refetchReg } = useMyRegistration();
  const { data: notificationsData } = useNotifications();
  const { data: allSessions } = useSessions();
  const { data: activityCheckIns } = useCheckInsAtividades();
  const { data: myMentorships, update: updateMentorship } = useMentoringSessions();
  const { data: stands } = useStands();
  const { data: standCheckIns } = useStandCheckIns();
  const { data: raffles } = useRaffles();
  
  // State
  const [activeTab, setActiveTab] = useState('inicio');
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isMentoriaModalOpen, setIsMentoriaModalOpen] = useState(false);
  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
  const [isStartupModalOpen, setIsStartupModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, mentorshipId: '', mentorName: '' });

  // Notifications filtering
  const notifications = useMemo(() => 
    (notificationsData || []).filter(n => n.userId === user?.id),
    [notificationsData, user?.id]
  );

  const handleMarkAsRead = async (id: string) => {
    if (!id) return;
    await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).eq('id', id);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Financial Status Logic
  const isActuallyPaid = registration?.isPaid || registration?.amount === 0;
  
  const statusFinanceiro = useMemo(() => {
    if (!registration) return { label: 'PENDENTE', color: 'bg-gray-500/20 text-gray-400' };
    if (isActuallyPaid) return { label: 'PAGO', color: 'bg-green-500/20 text-green-400' };
    if (registration.status === 'cancelled') return { label: 'CANCELADO', color: 'bg-red-500/20 text-red-400' };
    return { label: 'AGUARDANDO', color: 'bg-yellow-500/20 text-yellow-500' };
  }, [registration, isActuallyPaid]);

  // Next Activity Logic
  const nextActivity = useMemo(() => {
    if (!allSessions || !activityCheckIns) return null;
    const sorted = [...allSessions].sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return sorted.find(s => {
      const isAlreadyCheckedIn = activityCheckIns?.some(c => c.sessionId === s.id && (c as any).registrationId === registration?.id);
      return !isAlreadyCheckedIn && (s.startTime || '00:00') >= currentTimeStr;
    }) || sorted[0];
  }, [allSessions, activityCheckIns, registration?.id]);

  // Gamification Progress
  const standsVisited = useMemo(() => {
    if (!standCheckIns || !registration) return 0;
    return standCheckIns.filter(c => (c as any).registrationId === registration.id).length;
  }, [standCheckIns, registration]);

  const totalStands = useMemo(() => stands?.length || 0, [stands]);

  // Bottom Navigation Tabs definition
  const navTabs = useMemo(() => {
    const tabs = [
      { id: 'inicio', icon: LayoutGrid, label: 'Início' },
      { id: 'ingresso', icon: QrCode, label: 'Ticket' },
      { id: 'agenda', icon: Calendar, label: 'Agenda' },
      { id: 'sorteios', icon: Sparkles, label: 'Sorteios' }
    ];

    // Show Circuito if enabled in project settings
    if (selectedProject?.settings?.enableCheckIn !== false) {
      tabs.push({ id: 'circuito', icon: Trophy, label: 'Circuito' });
    }

    tabs.push({ id: 'dados', icon: User, label: 'Perfil' });
    tabs.push({ id: 'documentos', icon: FileText, label: 'Docs' });
    tabs.push({ id: 'certificados', icon: Award, label: 'Certs' });

    return tabs;
  }, [selectedProject]);

  // Self Check-in Handler
  const handleScanSuccess = async (decodedText: string) => {
    const qrData = parseQRString(decodedText);
    if (!qrData || (qrData.type !== 'session' && qrData.type !== 'registration')) {
        throw new Error('QR Code inválido para este tipo de check-in');
    }

    if (!registration) throw new Error('Inscrição não encontrada');

    // Special logic for Triunfo project: entry validates all
    if (selectedProject?.slug?.includes('triunfo') && (qrData.type === 'registration' || qrData.type === 'entry')) {
        const { error: entryErr } = await supabase.from('inscricoes_growth_experience').update({
            checked_in: true,
            check_in_at: new Date().toISOString()
        }).eq('id', registration.id);

        if (entryErr) throw entryErr;
        toast.success('Check-in Triunfo realizado! Acesso liberado para toda programação.');
        return;
    }

    // Call RPC or direct insert for activities
    const { error } = await supabase.from('activity_attendances').insert({
        project_id: selectedProject?.id,
        session_id: qrData.id,
        registration_id: registration.id,
        user_id: user?.id,
        check_in_at: new Date().toISOString(),
        check_in_type: 'qr'
    });

    if (error) throw error;
    toast.success('Check-in realizado com sucesso!');
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
              date={selectedProject?.startDate ? new Date(selectedProject.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '2026'}
              eventDate={selectedProject?.startDate}
              stats={{
                people: '500+',
                content: '12h+',
                activities: '20+'
              }}
            />

            {nextActivity && (
              <NextActivityCard 
                title={nextActivity.title}
                subtitle={nextActivity.type || 'Programação'}
                time={nextActivity.startTime || '--:--'}
                duration="--"
                isConfirmed={false}
                onClick={() => setActiveTab('agenda')}
              />
            )}

            <QuickActions 
              onB2BClick={() => setIsB2BModalOpen(true)}
              onStartupClick={() => setIsStartupModalOpen(true)}
              onMentoriaClick={() => setActiveTab('mentorias')}
              showMentoria={selectedProject?.settings?.enableMentoring}
              showB2B={selectedProject?.settings?.enableB2B}
              showStartup={selectedProject?.settings?.enableStartups}
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
            generateTicketPDF={generateTicketPDF}
            setShowCheckInModal={setIsCheckInModalOpen}
            setShowUpgradeModal={() => toast.info('Funcionalidade disponível em breve diretamente com a equipe.')}
            onRefresh={refetchReg}
          />
        );
      case 'agenda':
        return (
          <AgendaSection 
            myRegistration={registration}
            cursosSelecionados={registration?.cursosSelecionados || []}
            setIsSelfCheckInOpen={setIsCheckInModalOpen}
            navigate={navigate}
            selectedProject={selectedProject}
            allSessions={allSessions}
            activityCheckIns={activityCheckIns}
          />
        );
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
        return (
          <MentorshipSection 
            myMentorships={myMentorships}
            availableSlots={[]} 
            handleCancelMentoring={() => {}}
            handleBookMentoring={() => {}}
            handleJoinWaitlist={() => {}}
            setRatingModal={setRatingModal}
            setIsMentoriaModalOpen={setIsMentoriaModalOpen}
          />
        );
      case 'dados':
        return <ProfileForm />;
      case 'suporte':
        return <SupportSection navigate={navigate} />;
      case 'documentos':
        return <DocsSection documentos={[]} loadingDocs={false} />;
      case 'certificados':
        return <CertificatesSection certificados={[]} loadingCerts={false} fetchCertificados={() => {}} onDownload={() => {}} />;
      case 'equipe':
        return <DashboardEquipe batches={[]} />;
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
          isPro={Boolean(registration?.ticketType === 'pro' || registration?.ticketType === 'vip' || registration?.palestrasNoturnas)}
          notifications={notifications}
          onLogout={handleLogout}
          onNotificationRead={async (id) => { await handleMarkAsRead(id); }}
          onGuideClick={() => navigate('/guia')}
          onSupportClick={() => setActiveTab('suporte')}
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
        variant="orange"
      />

      {/* Global Modals */}
      {registration && isCheckInModalOpen && (
        <SelfCheckInModal 
          onClose={() => setIsCheckInModalOpen(false)}
          onScanSuccess={handleScanSuccess}
          registration={registration as any}
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
                        feedback: {
                            rating: val,
                            avaliacaoMentoria: val,
                            indicacaoMentor: ind,
                            comment: 'Avaliado via Dashboard',
                            avaliadoEm: new Date().toISOString()
                        }
                    });
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
            console.log('Scanned Stand Code:', code);
            toast.success('Stand validado!');
            setIsScanOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default DashboardParticipante;
