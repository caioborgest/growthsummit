import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Project } from '@/types';
import {
  TrendingUp,
  Building2,
  Mic2,
  Zap,
  Trophy,
  ArrowRight,
  CheckCircle,
  QrCode,
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
import { getPalestranteImage, getStandImage, getStorageUrl } from '@/lib/storage';
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
import { PatrocinioCard } from '@/components/growth-experience/PatrocinioCard';
import { WhatsAppButton } from '@/components/growth-experience/WhatsAppButton';
import { EVENT_CONFIG } from '@/config/eventConfig';

// Dados do evento
const palestrantes = [
  {
    nome: "Jeronimo Freire",
    cargo: "Empresário, Consultor e Mentor de Negócios",
    descricao: "Especialista em gestão estratégica e expansão de negócios",
    tema: "Gestão e Liderança em Momentos Desafiadores",
    horario: "18:00 - 18:50"
  },
  {
    nome: "Leandro Batista",
    cargo: "CEO, Fitness Exclusive",
    descricao: "CEO da rede de academias que mais cresce no interior do Nordeste",
    tema: "Talk Show: Experiências e Bastidores de Negócios no Interior",
    horario: "19:00 - 19:50"
  },
  {
    nome: "João Daniel",
    cargo: "CEO, Cedan Rações",
    descricao: "CEO de uma das maiores indústrias de rações do Nordeste",
    tema: "Talk Show: Experiências e Bastidores de Negócios no Interior",
    horario: "19:00 - 19:50",
    foto: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/joao-daniel.png"
  },
  {
    nome: "Carolinne Castro",
    cargo: "Advogada Empresarial e Conselheira OAB",
    descricao: "Expert em liderança inteligente e redução de riscos jurídicos",
    tema: "Liderança Inteligente: Redução de Riscos e Engajamento",
    horario: "20:10 - 21:00"
  },
  {
    nome: "Vanylton Matias",
    cargo: "CEO, Grupo Núcleo",
    descricao: "Especialista em métodos de gestão para escalar negócios",
    tema: "Escalando Negócios com Equilíbrio e Humanidade",
    horario: "21:10 - 22:30",
    foto: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/vanylton-matias.png"
  }
];




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
        toast.error("Este QR Code não é válido para confirmação de presença em atividades.");
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
        name: 'Growth Experience Triunfo-PE 2026',
        slug: 'ge-triunfo-pocket-edition-noturno-2026',
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
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                Acelere seu Crescimento com quem <span className="text-gradient">faz na prática</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                No dia 16 de abril, Triunfo recebe uma noite inteira dedicada a palestras, talk shows e exposição de marcas. Um encontro estratégico para empreendedores e gestores que movimentam a economia do Sertão do Pajeú.
              </p>

              <div className="grid sm:grid-cols-2 gap-8 mb-8">
                {[
                  { icon: TrendingUp, title: 'Palestras Magnas', desc: '5 grandes nomes no palco principal' },
                  { icon: Zap, title: 'Networking VIP', desc: 'Conexões de alto nível com decisores' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center group-hover:bg-brand-orange-coral group-hover:scale-110 transition-all duration-300">
                      <item.icon className="h-6 w-6 text-brand-orange-coral group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1 group-hover:text-brand-orange-coral transition-colors">{item.title}</h4>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
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
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 animate-fade-in-up gap-6 text-center md:text-left">
            <div>
              <Badge className="mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
                KEYNOTES
              </Badge>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">Protagonistas do <span className="text-gradient">Sucesso</span></h2>
            </div>
            <SectionShare sectionId="palestrantes" title="Palestras Magnas - Growth Experience" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {palestrantes.map((p, i) => (
              <PalestranteCardRefined
                key={i}
                nome={p.nome}
                cargo={p.cargo}
                descricao={p.descricao}
                tema={p.tema}
                horario={p.horario}
                foto={getPalestranteImage(p.nome)}
                destaque={true}
                onInscricao={() => handleOpenModal('inscricao')}
              />
            ))}
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

      {/* Programação - Timeline Simples */}
      <section id="programacao" className="py-24 bg-dark relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
              PROGRAMAÇÃO NOTURNA
            </Badge>
            <h2 className="text-4xl font-bold text-white">Cronograma Oficial</h2>
          </div>

          <div className="space-y-8">
            {(() => {
              const displaySessions = (allSessions || []).filter(s => s.projectId === currentProject?.id);
              
              const sessionsToRender = displaySessions.length > 0 
                ? displaySessions
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map(s => ({
                    time: new Date(s.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
                    event: s.title,
                    desc: s.description
                  }))
                : [
                  { time: '17:00', event: 'Credenciamento e Exposição de Marcas', desc: 'Networking e conexões no Espaço Parque' },
                  { time: '18:00', event: 'Jerônimo Freire: Gestão e Liderança', desc: 'Liderança em momentos desafiadores' },
                  { time: '19:00', event: 'Talk Show: Leandro & João Daniel', desc: 'Bastidores de negócios que cresceram no interior' },
                  { time: '20:10', event: 'Dra. Carolinne Castro: Liderança Jurídica', desc: 'Redução de riscos e engajamento de equipes' },
                  { time: '21:10', event: 'Vanylton Matias: Gestão para Escalar', desc: 'Equilíbrio entre resultados e olhar humano' },
                  { time: '22:30', event: 'Networking e Encerramento', desc: 'Conexões finais e encerramento oficial (23h).' }
                ];

              return sessionsToRender.map((item, idx) => (
                <div key={idx} className="flex gap-6 items-start group">
                  <div className="flex flex-col items-center">
                    <div className="text-brand-orange-coral font-black text-xl italic">{item.time}</div>
                    <div className="w-px h-16 bg-white/10 group-last:hidden" />
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex-1 hover:border-brand-orange-coral/40 transition-all">
                    <h4 className="text-white font-bold text-lg mb-1 group-hover:text-brand-orange-coral transition-colors">{item.event}</h4>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
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
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-coral/10 text-brand-orange-coral border border-brand-orange-coral/20 backdrop-blur-sm">
                  <Trophy className="h-5 w-5 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Premiação Exclusiva</span>
                </div>
                <SectionShare sectionId="premio-empresa" title="Prêmio Empresa Incentivadora - Growth Experience" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
                Garante o Futuro da sua <span className="text-gradient underline decoration-brand-orange-coral/30 underline-offset-8">Equipe</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Empresas que investem na capacitação de suas equipes são os verdadeiros motores do desenvolvimento local.
                Ao realizar a **Inscrição em Lote**, sua empresa garante descontos exclusivos e compete automaticamente ao prêmio de "Melhor Empresa Incentivadora ao Empreendedorismo".
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { text: '30% de Desconto para grupos acima de 5 pessoas', icon: CheckCircle },
                  { text: 'Homenagem no Palco durante a premiação noturna', icon: CheckCircle },
                  { text: 'Selo Digital "Empresa Incentivadora" para suas redes', icon: CheckCircle }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                    <item.icon className="h-6 w-6 text-brand-orange-coral mt-0.5 group-hover:scale-110 transition-transform" />
                    <p className="text-gray-300 text-lg leading-snug">{item.text}</p>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-dark font-black px-10 py-7 rounded-2xl shadow-xl hover:bg-brand-orange-coral hover:text-white transition-all duration-300 h-auto group"
                onClick={() => handleOpenModal('empresa')}
              >
                Inscrição em Lote / Equipe
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="relative animate-fade-in-up lg:ml-8" style={{ animationDelay: '0.3s' }}>
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient rounded-[2.5rem] blur opacity-20" />
              <div className="aspect-square lg:aspect-video rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl relative">
                <img
                  src={getStorageUrl('event-images', 'espaco/gxexperience-noite.png')}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  alt="Homenagem e Premiação"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
              </div>
            </div>
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
