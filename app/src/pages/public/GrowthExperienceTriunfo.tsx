import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project, Session } from '@/types';
import {
  Building2,
  Mic2,
  TrendingUp,
  Zap,
  Trophy,
  CheckCircle,
  ArrowRight,
  QrCode
} from 'lucide-react';
import { QRScanner } from '@/components/app/QRScanner';
import { useRegistrations, useSessions, useCheckInsAtividades } from '@/hooks/useData';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { InscricaoModal } from '@/components/forms/InscricaoModal';
import { EmpresaIncentivadoraModal } from '@/components/forms/EmpresaIncentivadoraModal';
import { SEOHead } from '@/components/seo/SEOHead';
import { getPalestranteImage, getStorageUrl } from '@/lib/storage';
import { AppDownloadSection } from '@/components/app/AppDownloadSection';
import { InscricaoMultiStepModal } from '@/components/forms/InscricaoMultiStepModal';
import { SocialRegistrationSection } from '@/components/growth-experience/SocialRegistrationSection';
import { EdicaoAnteriorVideo } from '@/components/growth-experience/EdicaoAnteriorVideo';
import { HeroSectionRefined } from '@/components/growth-experience/HeroSectionRefined';
import { StatsSection } from '@/components/growth-experience/StatsSection';
import { PalestranteCardRefined } from '@/components/growth-experience/PalestranteCardRefined';
import { SectionShare } from '@/components/social/SectionShare';
import { SocialShare } from '@/components/social/SocialShare';
import { LotePromocionalPopUp } from '@/components/growth-experience/LotePromocionalPopUp';
import { useProject } from '@/contexts/ProjectContext';
import { ensureProject } from '@/lib/ensureProject';
import { CertificateService } from '@/lib/certificateService';
import { WhatsAppButton } from '@/components/growth-experience/WhatsAppButton';

// Speakers data is now derived from sessions in event_schedule




// Main Component
export function GrowthExperienceTriunfo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedProject, setSelectedProject } = useProject();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [modalInscricaoAberto, setModalInscricaoAberto] = useState(false);
  const [modalAberto, setModalAberto] = useState<'mentor' | 'mentor-cadastro' | 'startup' | 'b2b' | 'palestra' | 'empresa' | null>(null);
  const [scannerAberto, setScannerAberto] = useState(false);
  const { user } = useAuth();
  const { data: userRegistrations } = useRegistrations();
  const { create: registerSessionCheckIn } = useCheckInsAtividades();
  const { data: allSessions } = useSessions();

  // Derivar palestrantes das sessões (filtrando por tipo palestra)
  const palestrantesDinamicos = useMemo(() => {
    if (!allSessions || !currentProject) return [];
    
    return allSessions
      .filter(s => s.projectId === currentProject.id && (s.type === 'palestra' || s.type === 'talk'))
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
      .map((s: Session) => ({
        nome: s.speakers && s.speakers.length > 0 ? s.speakers[0] : s.speakerName || "Palestrante Convidado",
        role_title: s.speakerRole || "Convidado Especial",
        descricao: s.description || "Palestra exclusiva sobre tecnologia e negócios.",
        tema: s.title,
        horario: `${s.startTime} - ${s.endTime}`,
        foto: s.speakerImage || getPalestranteImage(s.speakers?.[0] || 'convidado')
      }));
  }, [allSessions, currentProject]);

  // initialized MUST be declared before initProject to avoid use-before-declaration
  const initialized = useRef(false);

  const handleScanSuccess = async (qrData: import('@/lib/qrUtils').QRData | null) => {
    setScannerAberto(false);

    if (!qrData) return;

    if (!user) {
      toast.error("Você precisa estar logado para confirmar presença.");
      return;
    }

    // Find user registration for this project
    const userReg = (userRegistrations || []).find(r => r.projectId === currentProject?.id);
    
    // Fallback: If not found in useRegistrations cache, or is empty, it could be a legacy user
    // We try to verify via the user email if we're in the right project context
    if (!userReg && user.email) {
      console.debug("[GrowthExperience] Checking registration for", user.email);
    }
    
    // If we still don't have userReg, but the user IS definitely this user, 
    // maybe check if they have ANY registration for this project and only show the error if truly null
    if (!userReg) {
      toast.error("Você não possui uma inscrição ativa para este evento. Por favor, realize sua inscrição.");
      return;
    }

    try {
      if (qrData.type === 'session') {
        const session = (allSessions || []).find(s => s.id === qrData.id);

        if (!currentProject) return;

        await registerSessionCheckIn({
          projectId: currentProject.id,
          registrationId: userReg.id,
          userId: user.id,
          sessionId: qrData.id,
          checkInAt: new Date().toISOString(),
          checkInType: 'qr'
        });

        // --- Automatic Certification Trigger ---
        if (session && currentProject) {
          if (user?.id && user?.name) {
            await CertificateService.checkAndIssueSessionCertificate(
              { id: user.id, name: user.name },
              currentProject,
              session,
              userReg.id
            );
          }
        }

        toast.success("Presença confirmada! Seu certificado já está disponível na sua galeria.");
      } else {
        toast.error("Este QR Code não é válido para confirmar presença em atividades.");
      }
    } catch (err) {
      console.error("Erro ao registrar check-in:", err);
      toast.error("Erro ao confirmar presença. Tente novamente.");
    }
  };

  // Garantir que o projeto exista no Supabase e selecioná-lo no contexto
  const initProject = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      const project = await ensureProject({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Growth Experience Triunfo-PE 2026',
        slug: 'growth-experience-triunfo',
        type: 'growth_experience',
        description: 'GX Growth Experience Triunfo – Noite de Palestras e Negócios. Programação especial das 17h às 23h em 16 de abril de 2026 no Espaço Parque. Palestras, talk shows e networking.',
        shortDescription: 'Edição Triunfo-PE',
        location: 'Espaço Parque',
        city: 'Triunfo',
        state: 'PE',
        startDate: '2026-04-16',
        endDate: '2026-04-16',
        status: 'active',
        primaryColor: '#FE4C38',
        secondaryColor: '#FF6B35',
        settings: {
          maxRegistrations: 300,
          maxMentors: 30,
          maxStartups: 20,
          maxCompanies: 6,
          enableB2B: false,
          enableMentoring: false,
          enableStartups: false,
          enableCheckIn: true,
          ticketPrices: {
            standard: 0,
            pro: 179.99,
            vip: 0,
          },
        },
      });

      if (project) {
        initialized.current = true;

        // Canonical project object with override values if needed
        const canonicalProject = {
          ...project,
          startDate: '2026-04-16',
          endDate: '2026-04-16',
          settings: {
            ...project.settings,
            maxRegistrations: 300
          }
        };

        setCurrentProject(canonicalProject);

        // Só atualiza se o ID for diferente para evitar loops de render
        if (selectedProject?.id !== canonicalProject.id) {
          setSelectedProject(canonicalProject);
        }
      }
    } catch (err) {
      console.error('[GrowthExperienceTriunfo] Erro init:', err);
    }
  }, [setSelectedProject, selectedProject?.id]);

  useEffect(() => {
    // Always attempt initialization for Triunfo ge-project
    initProject();
  }, [initProject]);

  // Sincronizar modais com a URL apenas uma vez no mount ou quando o parâmetro muda
  useEffect(() => {
    const formParam = searchParams.get('form');
    if (!formParam) return;

    if (formParam === 'inscricao') {
      setModalInscricaoAberto(true);
    } else if (['palestra', 'empresa'].includes(formParam)) {
      setModalAberto(formParam as 'palestra' | 'empresa');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('form')]); // Dependência específica para o valor do parâmetro

  const closeModals = () => {
    setModalInscricaoAberto(false);
    setModalAberto(null);
    // Limpar parâmetro da URL de forma suave
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('form');
    setSearchParams(newParams, { replace: true });
  };

  const handleOpenModal = (formName: string) => {
    if (formName === 'inscricao') {
      setModalInscricaoAberto(true);
    } else {
      setModalAberto(formName as 'palestra' | 'empresa');
    }
    const newParams = new URLSearchParams(searchParams);
    newParams.set('form', formName);
    setSearchParams(newParams, { replace: true });
  };

  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.growthsummit.site/triunfo';

  return (
    <div className="flex flex-col overflow-x-hidden">
      <SEOHead
        title="GX Growth Experience Triunfo | Noite de Palestras e Negócios"
        description="Uma noite inteira dedicada a palestras, talk shows e exposição de marcas para quem movimenta a economia do Sertão do Pajeú. 16 de abril, 17h às 23h."
        keywords="gx growth experience, triunfo pe, evento negócios, palestrantes, talk show, networking"
        url={pageUrl}
      />



      {/* Modais */}
      <InscricaoMultiStepModal isOpen={modalInscricaoAberto} onClose={closeModals} />
      <InscricaoModal isOpen={modalAberto === 'palestra'} onClose={closeModals} tipo="palestra" eventoNome="Growth Experience Triunfo-PE 2026" />
      <EmpresaIncentivadoraModal isOpen={modalAberto === 'empresa'} onClose={closeModals} />

      <LotePromocionalPopUp />

      {/* Hero Section Refinada */}
      <HeroSectionRefined
        project={currentProject || undefined}
        onCTAClick={() => handleOpenModal('inscricao')}
      />

      {/* Stats Section Refinada */}
      <StatsSection project={currentProject || undefined} />

      {/* Sobre o Evento */}
      <section id="sobre" className="py-16 sm:py-24 bg-dark-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-orange-coral/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-orange-coral/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
                O EVENTO
              </Badge>
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-[0.9] italic uppercase tracking-tighter"
              >
                Acelere seu Crescimento com quem <span className="text-brand-orange-coral">faz na prática</span>
              </motion.h2>
              <p className="text-xl text-gray-500 mb-8 leading-relaxed font-medium">
                No dia 16 de abril, Triunfo recebe uma noite inteira dedicada a palestras, talk shows e exposição de marcas. Um encontro estratégico para empreendedores e gestores que movimentam a economia do Sertão do Pajeú.
              </p>

              <div className="grid sm:grid-cols-2 gap-8 mb-8">
                {[
                  { icon: TrendingUp, title: 'Palestras Magnas', desc: '5 grandes nomes no palco principal' },
                  { icon: Zap, title: 'Networking VIP', desc: 'Conexões de alto nível com decisores' }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ x: 10 }}
                    className="flex gap-5 group p-4 rounded-3xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                  >
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center group-hover:bg-brand-orange-coral group-hover:scale-110 shadow-glow-sm transition-all duration-300">
                      <item.icon className="h-7 w-7 text-brand-orange-coral group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-white font-black text-lg uppercase italic tracking-tight mb-1 group-hover:text-brand-orange-coral transition-colors">{item.title}</h4>
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="relative group">
                <div className="absolute -inset-4 bg-brand-orange-coral/20 blur-2xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={getStorageUrl('event-images', 'espaco/gxexperience-noite.png')}
                  className="rounded-2xl shadow-2xl border border-white/10 relative z-10 w-full hover:scale-[1.02] transition-transform duration-500"
                  alt="Evento de Negócios"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 glass-card p-6 border-brand-orange-coral/30 max-w-xs shadow-glow-orange z-20 animate-float">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-brand-orange-coral rounded-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-brand-orange-coral font-black text-4xl tracking-tighter">6+</p>
                </div>
                <p className="text-white font-bold text-lg leading-tight">Empresas expositoras confirmadas</p>
                <div className="mt-2 h-1 w-12 bg-brand-orange-coral rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Edição Pocket: Juazeiro do Norte ── */}
      <EdicaoAnteriorVideo showTriunfoTeaser={true} />

      {/* Palestrantes */}
      <section id="palestrantes" className="py-16 sm:py-24 bg-dark-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-20 animate-fade-in-up gap-6 text-center md:text-left">
            <div>
              <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-5 py-1.5 font-black text-[10px] tracking-[0.2em] uppercase">
                KEYNOTES
              </Badge>
              <h2 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white mb-4 leading-[0.85] italic uppercase tracking-tighter">
                Protagonistas <br /> do <span className="text-brand-orange-coral">Sucesso</span>
              </h2>
            </div>
            <div className="bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
              <SectionShare sectionId="palestrantes" title="Palestras Magnas - Growth Experience" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {palestrantesDinamicos.length > 0 ? (
              palestrantesDinamicos.map((p, i: number) => (
                <PalestranteCardRefined
                  key={i}
                  nome={p.nome}
                  role_title={p.role_title}
                  descricao={p.descricao}
                  tema={p.tema}
                  horario={p.horario}
                  foto={p.foto}
                  destaque={true}
                  onInscricao={() => handleOpenModal('inscricao')}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-10">
                <p className="text-gray-500 italic">Palestrantes em breve...</p>
              </div>
            )}
          </div>

          <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Button
              size="lg"
              className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-12 py-8 text-xl rounded-2xl shadow-glow-orange hover:shadow-glow hover:scale-105 transition-all duration-300 h-auto"
              onClick={() => handleOpenModal('inscricao')}
            >
              <Mic2 className="h-6 w-6 mr-3" />
              Garantir Ingresso VIP
            </Button>
          </div>
        </div>
      </section>

      {/* Programação - Timeline Premium Dinâmica */}
      <section id="programacao" className="py-24 bg-dark relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-brand-orange-coral/5 to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24 animate-fade-in-up">
            <Badge className="mb-6 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-5 py-2 font-black text-[10px] uppercase tracking-[0.3em] rounded-full">
              EXPERIÊNCIA NOTURNA
            </Badge>
            <h2 className="text-5xl sm:text-8xl font-black text-white italic uppercase tracking-tighter mb-6 leading-none">
              Grade de <br /> <span className="text-brand-orange-coral">Programação</span>
            </h2>
            <div className="w-20 h-1.5 bg-brand-orange-coral mx-auto mb-6 rounded-full" />
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.25em] leading-relaxed max-w-lg mx-auto">
              UMA NOITE INTEIRA DE CONTEÚDO E NETWORKING NO CORAÇÃO DO SERTÃO DO PAJEÚ
            </p>
          </div>
          
          <div className="space-y-6">
            {(() => {
              const displaySessions = (allSessions || [])
                .filter(s => s.projectId === currentProject?.id)
                .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

              if (displaySessions.length === 0) {
                return (
                  <div className="text-center py-20 bg-dark-200/40 rounded-[2rem] border-2 border-dashed border-white/5">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm italic">
                      Programação em breve. Estamos preparando algo especial para você!
                    </p>
                  </div>
                );
              }

              return displaySessions.map((s) => (
                <motion.div 
                  key={s.id} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex gap-8 items-start group relative"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-32 text-brand-orange-coral font-black text-3xl italic tracking-tighter text-right pr-6 border-r-4 border-brand-orange-coral/20 group-hover:border-brand-orange-coral transition-all duration-500">
                      {s.startTime?.match(/(\d{2}:\d{2})/)?.[0] || '17:00'}
                    </div>
                    <div className="w-1 h-24 bg-gradient-to-b from-brand-orange-coral/20 to-transparent group-last:hidden" />
                  </div>
                  <div className="glass-card border-white/5 p-8 sm:p-10 rounded-[2.5rem] flex-1 hover:border-brand-orange-coral/40 hover:bg-white/[0.04] transition-all duration-500 group-hover:translate-x-3 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange-coral/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-orange-coral/10 transition-all" />
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
                       <h4 className="text-white font-black text-2xl italic uppercase group-hover:text-brand-orange-coral transition-colors leading-none">{s.title}</h4>
                       {s.type && <Badge className="bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/20 font-black text-[9px] tracking-[0.2em] uppercase px-3 py-1 w-fit">{s.type}</Badge>}
                     </div>
                     <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mb-6 leading-relaxed max-w-2xl relative z-10">{s.description}</p>
                     <div className="flex flex-wrap items-center gap-6 relative z-10">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                            <Building2 className="h-3.5 w-3.5 text-brand-orange-coral" />
                          </div>
                          <span className="text-white/60 font-black text-[10px] uppercase tracking-widest">{s.room || 'Auditório Principal'}</span>
                        </div>
                        {s.speakers && s.speakers.length > 0 && (
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                              <Mic2 className="h-3.5 w-3.5 text-brand-orange-coral" />
                            </div>
                            <span className="text-white/60 font-black text-[10px] uppercase tracking-widest">{s.speakers.join(', ')}</span>
                          </div>
                        )}
                     </div>
                  </div>
                </motion.div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* Seção Inovadora: Incentivo de Equipe */}
      <section className="py-16 sm:py-24 bg-dark-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-orange-coral/5 to-transparent pointer-events-none" />

        <div id="premio-empresa" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="animate-fade-in-up"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-brand-orange-coral/10 text-brand-orange-coral border border-brand-orange-coral/20 backdrop-blur-xl shadow-glow-sm">
                  <Trophy className="h-5 w-5 animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em]">Premiação Exclusiva</span>
                </div>
                <SectionShare sectionId="premio-empresa" title="Prêmio Empresa Incentivadora - Growth Experience" />
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-white mb-8 leading-[0.9] italic uppercase tracking-tighter">
                Garante o Futuro <br /> da sua <span className="text-brand-orange-coral">Equipe</span>
              </h2>
              <p className="text-xl text-gray-500 mb-10 leading-relaxed font-medium">
                Empresas que investem na capacitação de suas equipes são os verdadeiros motores do desenvolvimento local.
                Ao realizar a **Inscrição em Lote**, sua empresa garante descontos exclusivos e compete automaticamente ao prêmio de "Melhor Empresa Incentivadora ao Empreendedorismo".
              </p>

              <div className="space-y-4 mb-12">
                {[
                  { text: '30% de Desconto para grupos acima de 5 pessoas', icon: CheckCircle },
                  { text: 'Homenagem no Palco durante a premiação noturna', icon: CheckCircle },
                  { text: 'Selo Digital "Empresa Incentivadora" para suas redes', icon: CheckCircle }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-5 p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-brand-orange-coral/30 hover:bg-white/[0.04] transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-brand-orange-coral/10 group-hover:bg-brand-orange-coral transition-all">
                      <item.icon className="h-6 w-6 text-brand-orange-coral group-hover:text-white transition-transform" />
                    </div>
                    <p className="text-white/80 text-lg font-bold leading-snug group-hover:text-white transition-colors">{item.text}</p>
                  </motion.div>
                ))}
              </div>

              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-dark font-black px-12 py-8 rounded-[2rem] shadow-2xl hover:bg-brand-orange-coral hover:text-white transition-all duration-500 h-auto group text-lg"
                onClick={() => handleOpenModal('empresa')}
              >
                Inscrição em Lote / Equipe
                <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative lg:ml-12"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-orange-coral to-brand-orange-intense rounded-[3rem] blur-3xl opacity-20 animate-pulse" />
              <div className="aspect-square lg:aspect-[4/3] rounded-[2.5rem] overflow-hidden border-2 border-white/10 shadow-2xl relative group">
                <img
                  src={getStorageUrl('event-images', 'espaco/gxexperience-noite.png')}
                  className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110"
                  alt="Homenagem e Premiação"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Seção de Inscrição Social */}
      <SocialRegistrationSection onInscrever={() => handleOpenModal('inscricao')} />

      {/* Realização */}
      <section className="py-12 bg-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <h3 className="text-gray-500 uppercase tracking-[0.3em] text-[10px] font-black mb-6">Realização</h3>
            <div className="group transition-all duration-500 hover:scale-105">
              <img
                src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/logomarca-cbx-growth-ia.png"
                alt="CBX Growth I.A."
                className="h-16 sm:h-20 w-auto opacity-70 group-hover:opacity-100 transition-all filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Marcas Apoiadoras */}
      <section className="py-16 bg-dark-100 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-gray-500 uppercase tracking-[0.3em] text-xs font-black">Marcas que Apoiam o Regionalismo</h3>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 md:gap-24 px-4">
            <div className="group transition-all duration-500">
              <img
                src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/marcas-apoio/acmt.png"
                alt="ACMT"
                className="h-12 sm:h-16 md:h-20 w-auto grayscale brightness-200 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500 object-contain"
                loading="lazy"
              />
            </div>
            <div className="group transition-all duration-500">
              <img
                src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/marcas-apoio/sebrae.png"
                alt="SEBRAE"
                className="h-10 sm:h-14 md:h-16 w-auto grayscale brightness-200 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500 object-contain"
                loading="lazy"
              />
            </div>
            <div className="group transition-all duration-500">
              <img
                src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/marcas-apoio/sest-senat.png"
                alt="SEST SENAT"
                className="h-10 sm:h-14 md:h-16 w-auto grayscale brightness-200 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500 object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-dark relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white mb-6">
            Pronto para <span className="text-gradient">Transformar</span> seu Negócio?
          </h2>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-12 py-8 text-xl rounded-2xl shadow-glow-orange h-auto"
            onClick={() => setModalInscricaoAberto(true)}
          >
            INSCREVA-SE AGORA
          </Button>
        </div>
      </section>

      <AppDownloadSection />

      <section className="py-12 bg-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Compartilhe este evento:</p>
            <SocialShare
              url={pageUrl}
              title="Growth Experience Triunfo-PE 2026"
              description="A Maior Exposição de Negócios do Sertão do Pajeú"
            />
          </div>
        </div>
      </section>


      <WhatsAppButton />

      {/* Floating QR Check-in Button */}
      {user && (
        <button
          onClick={() => setScannerAberto(true)}
          className="fixed bottom-24 right-24 lg:bottom-8 lg:right-28 z-50 w-16 h-16 bg-white text-dark rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
        >
          <div className="absolute -top-12 right-0 bg-dark-200 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Confirmar Presença
          </div>
          <QrCode className="h-8 w-8 text-brand-orange-coral" />
        </button>
      )}

      {/* QR Scanner Component */}
      {scannerAberto && (
        <QRScanner
          onClose={() => setScannerAberto(false)}
          onSuccess={handleScanSuccess}
          title="Confirmar Presença na Sala"
        />
      )}
    </div>
  );
}

export default GrowthExperienceTriunfo;
