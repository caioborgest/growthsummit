import { useState, useEffect, useCallback, useRef } from 'react';
import type { Project } from '@/types';
import {
  TrendingUp,
  Handshake,
  Building2,
  GraduationCap,
  Mic2,
  Award,
  Target,
  Zap,
  Rocket,
  Trophy,
  ArrowRight,
  Sparkles,
  CheckCircle,
  QrCode
} from 'lucide-react';
import { QRScanner } from '@/components/app/QRScanner';
import { useCheckIns, useRegistrations, useMentors, useSessions } from '@/hooks/useData';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { InscricaoModal } from '@/components/forms/InscricaoModal';
import { StartupFormModal } from '@/components/forms/StartupFormModal';
import { B2BFormModal } from '@/components/forms/B2BFormModal';
import { MentorFormModal } from '@/components/forms/MentorFormModal';
import { MentoriaMultiStepModal } from '@/components/forms/MentoriaMultiStepModal';
import { EmpresaIncentivadoraModal } from '@/components/forms/EmpresaIncentivadoraModal';
import { SEOHead } from '@/components/seo/SEOHead';
import { getPalestranteImage, getStandImage } from '@/lib/storage';
import { InscricaoSection } from '@/components/growth-experience/InscricaoSection';
import { AppDownloadSection } from '@/components/app/AppDownloadSection';
import { InscricaoMultiStepModal } from '@/components/forms/InscricaoMultiStepModal';
import { SocialRegistrationSection } from '@/components/growth-experience/SocialRegistrationSection';
import { ProgramacaoCircuitoSection } from '@/components/growth-experience/ProgramacaoCircuitoSection';
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

// Dados do evento
const palestrantes = [
  {
    nome: "Leandro Batista",
    cargo: "CEO, Fitness Exclusive",
    descricao: "CEO da rede de academias que mais cresce no interior do Nordeste",
    tema: "Crescimento Exponencial em Mercado Competitivo: Estratégias de Escala",
    horario: "19:00 - 19:50"
  },
  {
    nome: "Vanylton Matias",
    cargo: "CEO, Grupo Núcleo",
    descricao: "CEO de grupo empresarial multisetorial, reconhecido em gestão e inovação a nível nacional",
    tema: "Inovação Corporativa: Como Empresas se Mantêm Competitivos em Tempos de Transformação",
    horario: "21:10 - 22:30"
  }
];

const cotas = [
  {
    nome: "DIAMANTE",
    espaco: "10m x 10m - Camarote Lateral Palco",
    ingressos: 15,
    beneficios: [
      "Posição de destaque ao lado do palco",
      "Logo em 4 posições premium (rádios, jornal, cartazes, ads)",
      "Menção abertura + encerramento (MC)",
      "Apresentação 5 min no palco (slot garantido)",
      "Banner roll-up stand (design grátis)",
      "QR Code único stand (analytics real-time)",
      "Relatório ROI completo pós-evento"
    ],
    destaque: true,
    vagas: 2
  },
  {
    nome: "OURO",
    espaco: "5m x 12m - Camarote Lateral Palco",
    ingressos: 10,
    beneficios: [
      "Posição de entrada (primeira visualização)",
      "Logo em 3 posições (banner, entrada, programa)",
      "Menção abertura + encerramento (MC)",
      "Demo/talk 5 min no palco (opcional, agendado)",
      "QR Code único stand",
      "Relatório leads + impressões"
    ],
    vagas: 3
  },
  {
    nome: "PRATA PLUS",
    espaco: "5m x 6m - Fundo Superior",
    ingressos: 6,
    beneficios: [
      "Posição lateral (circulação natural)",
      "Logo em 2 posições (banner principal, programa)",
      "Menção encerramento (MC)",
      "Redes sociais 5+ posts (com tag)",
      "Relatório básico (leads, impressões)"
    ],
    vagas: 5
  },
  {
    nome: "PRATA",
    espaco: "5m x 3m - Térreo Lateral",
    ingressos: 6,
    beneficios: [
      "Posição lateral térreo",
      "Logo em 2 posições (banner principal, programa)",
      "Menção encerramento (MC)",
      "Redes sociais 5+ posts (com tag)",
      "Relatório básico (leads, impressões)"
    ],
    vagas: 13
  },
  {
    nome: "BRONZE",
    espaco: "3m x 1,5m - Superior",
    ingressos: 3,
    beneficios: [
      "Logo em programa impresso",
      "3+ menções redes sociais (com tag)",
      "A3 com logo (impresso)",
      "Acesso relatório final em PDF"
    ],
    vagas: 4
  }
];



// Main Component
export function GrowthExperienceTriunfo() {
  const { setSelectedProject } = useProject();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [modalInscricaoAberto, setModalInscricaoAberto] = useState(false);
  const [modalAberto, setModalAberto] = useState<'mentor' | 'mentor-cadastro' | 'startup' | 'b2b' | 'palestra' | 'empresa' | null>(null);
  const [scannerAberto, setScannerAberto] = useState(false);
  const { user } = useAuth();
  const { data: userRegistrations } = useRegistrations();
  const { create: registerCheckIn } = useCheckIns();
  const { data: allSessions } = useSessions();

  // initialized MUST be declared before initProject to avoid use-before-declaration
  const initialized = useRef(false);

  const handleScanSuccess = async (qrData: any) => {
    setScannerAberto(false);

    if (!user) {
      toast.error("Você precisa estar logado para confirmar presença.");
      return;
    }

    // Find user registration for this project
    const userReg = (userRegistrations || []).find(r => r.projectId === currentProject?.id);

    if (!userReg) {
      toast.error("Você não possui uma inscrição ativa para este evento.");
      return;
    }

    try {
      if (qrData.type === 'session') {
        const session = (allSessions || []).find(s => s.id === qrData.id);

        await registerCheckIn({
          projectId: currentProject?.id,
          registrationId: userReg.id,
          userId: user.id,
          sessionId: qrData.id,
          ticketNumber: userReg.ticketNumber,
          timestamp: new Date().toISOString(),
          location: 'Sala de Atividade',
          method: 'self_scan',
          checkInType: 'session'
        } as any);

        // --- Automatic Certification Trigger ---
        if (session && currentProject) {
          await CertificateService.checkAndIssueSessionCertificate(
            user as any,
            currentProject,
            session,
            userReg.id
          );
        }

        toast.success("Presença confirmada! Seu certificado já está disponível na sua galeria.");
      } else {
        toast.error("Este QR Code não é válido para confirmação de presença em atividades.");
      }
    } catch (err: any) {
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
        slug: 'ge-triunfo-2026',
        type: 'growth_experience',
        description: 'A Maior Exposição de Negócios do Sertão do Pajeú. Capacitação, networking, mentoria 1:1 e Arena Pitch para startups. Programação especial das 08:00 às 23:00 em 16 de abril de 2026 no Espaço Parque.',
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
          maxRegistrations: 1500,
          maxMentors: 30,
          maxStartups: 20,
          maxCompanies: 40,
          enableB2B: true,
          enableMentoring: true,
          enableStartups: true,
          enableCheckIn: true,
          ticketPrices: {
            standard: 0,
            pro: 179.99,
            vip: 0,
          },
        },
      });

      if (project) {
        const canonicalProject = {
          ...project,
          startDate: '2026-04-16',
          endDate: '2026-04-16',
          settings: {
            ...project.settings,
            maxRegistrations: 1500
          }
        };

        setCurrentProject(canonicalProject);
        setSelectedProject(canonicalProject);
      }
    } catch (err) {
      console.error('[GrowthExperienceTriunfo] Erro init:', err);
    }
  }, [setSelectedProject]);

  useEffect(() => {
    initProject();
  }, [initProject]);

  const { data: mentorsData, isLoading: mentorsLoading } = useMentors();
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.growthsummit.site/growth-experience-triunfo';

  const approvedMentors = (mentorsData || []).filter(m => m.status === 'approved');

  return (
    <div className="flex flex-col overflow-x-hidden">
      <SEOHead
        title="Growth Experience Triunfo-PE 2026 | 16 de Abril"
        description="A Maior Exposição de Negócios do Sertão do Pajeú. Capacitação, networking e oportunidades para PMEs. 16/04/2026 no Espaço Parque."
        keywords="growth experience, triunfo pe, evento negócios, sebrae, empreendedorismo, sertão do pajeú"
        url={pageUrl}
      />



      {/* Modais */}
      <InscricaoMultiStepModal isOpen={modalInscricaoAberto} onClose={() => setModalInscricaoAberto(false)} />
      <MentoriaMultiStepModal isOpen={modalAberto === 'mentor'} onClose={() => setModalAberto(null)} />
      <InscricaoModal isOpen={modalAberto === 'palestra'} onClose={() => setModalAberto(null)} tipo="palestra" eventoNome="Growth Experience Triunfo-PE 2026" />
      <MentorFormModal isOpen={modalAberto === 'mentor-cadastro'} onClose={() => setModalAberto(null)} />
      <StartupFormModal isOpen={modalAberto === 'startup'} onClose={() => setModalAberto(null)} />
      <B2BFormModal isOpen={modalAberto === 'b2b'} onClose={() => setModalAberto(null)} />
      <EmpresaIncentivadoraModal isOpen={modalAberto === 'empresa'} onClose={() => setModalAberto(null)} />

      <LotePromocionalPopUp />

      {/* Hero Section Refinada */}
      <HeroSectionRefined
        project={currentProject || undefined}
        onCTAClick={() => setModalInscricaoAberto(true)}
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
                O Growth Experience Triunfo é um divisor de águas para o empreendedorismo regional. Reunimos especialistas, tecnologia e capital em um único dia de imersão total para transformar pequenas e médias empresas do Sertão do Pajeú.
              </p>

              <div className="grid sm:grid-cols-2 gap-8 mb-8">
                {[
                  { icon: TrendingUp, title: 'Capacitação', desc: 'Trilhas práticas de marketing, vendas e IA' },
                  { icon: Handshake, title: 'Rodada B2B', desc: 'Conexões diretas com grandes marcas' },
                  { icon: Award, title: 'Arena Pitch', desc: 'Prêmios de até R$ 2.000 + mentorias' },
                  { icon: Zap, title: '10 Experiências', desc: 'Circuito contínuo de aprendizado' }
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
                  src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/espaco/gxexperience-noite.png"
                  className="rounded-2xl shadow-2xl border border-white/10 relative z-10 w-full hover:scale-[1.02] transition-transform duration-500"
                  alt="Evento de Negócios"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 glass-card p-6 border-brand-orange-coral/30 max-w-xs shadow-glow-orange z-20 animate-float">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-brand-orange-coral rounded-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-brand-orange-coral font-black text-4xl tracking-tighter">25+</p>
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

      {/* Mentores do Evento */}
      <section id="mentores" className="py-16 sm:py-24 bg-dark-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-brand-orange-coral/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge className="mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
              CONSELHORES ESTRATÉGICOS
            </Badge>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4">
              Mentores <span className="text-gradient">Confirmados</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Especialistas prontos para diagnosticar seu negócio e acelerar seus resultados.
            </p>
          </div>

          {!mentorsLoading && approvedMentors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 animate-fade-in-up">
              {approvedMentors.map((mentor) => (
                <div key={mentor.id} className="group relative glass-card p-6 border-white/5 hover:border-brand-orange-coral/30 transition-all duration-500 hover:-translate-y-2">
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 bg-dark-200">
                    <img
                      src={mentor.photo || 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth-summit_branco.v2.png'}
                      alt={mentor.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-orange-coral transition-colors">
                      {mentor.name}
                    </h3>
                    <p className="text-brand-orange-coral font-bold text-xs uppercase tracking-widest lines-clamp-1">
                      {mentor.position} @ {mentor.company}
                    </p>
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                      {mentor.bio}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {(mentor.specialties || []).slice(0, 2).map((spec, sIdx) => (
                      <Badge key={sIdx} variant="outline" className="bg-white/5 border-white/10 text-[10px] sm:text-[9px] uppercase tracking-wider text-gray-400">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  {/* Glow Hover */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity bg-brand-orange-gradient pointer-events-none" />
                </div>
              ))}
            </div>
          ) : mentorsLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange-coral"></div>
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl mb-16">
              <Sparkles className="h-10 w-10 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Novos mentores estão sendo aprovados...</p>
              <Button
                variant="link"
                className="text-brand-orange-coral mt-4 font-bold"
                onClick={() => setModalAberto('mentor-cadastro')}
              >
                Quero ser um mentor confirmado
              </Button>
            </div>
          )}

          <div className="text-center animate-fade-in-up">
            <Button
              size="lg"
              className="bg-brand-orange-coral/10 hover:bg-brand-orange-coral text-brand-orange-coral hover:text-white border border-brand-orange-coral/30 font-black px-12 py-8 text-lg rounded-2xl transition-all duration-300 h-auto"
              onClick={() => setModalAberto('mentor-cadastro')}
            >
              Candidatar-se como Mentor
            </Button>
          </div>
        </div>
      </section>

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
                onInscricao={() => setModalAberto('palestra')}
              />
            ))}
          </div>

          <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Button
              size="lg"
              className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-12 py-8 text-xl rounded-2xl shadow-glow-orange hover:shadow-glow hover:scale-105 transition-all duration-300 h-auto"
              onClick={() => setModalInscricaoAberto(true)}
            >
              <Mic2 className="h-6 w-6 mr-3" />
              Garantir Ingresso VIP
            </Button>
          </div>
        </div>
      </section>

      {/* Programação Completa */}
      {/* Programação - Circuito de Experiências */}
      <ProgramacaoCircuitoSection onInscricao={() => setModalInscricaoAberto(true)} />

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
                Sua Empresa merece ser <span className="text-gradient underline decoration-brand-orange-coral/30 underline-offset-8">Homenageada?</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Empresas que investem na capacitação de suas equipes são os verdadeiros motores do desenvolvimento local.
                Ao inscrever sua equipe para o *Night Experience*, sua empresa compete automaticamente ao prêmio de "Melhor Empresa Incentivadora ao Empreendedorismo".
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { text: 'Homenagem no Palco durante a premiação noturna', icon: CheckCircle },
                  { text: 'Selo Digital para uso em redes sociais e site', icon: CheckCircle },
                  { text: 'Networking VIP para os colaboradores', icon: CheckCircle }
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
                onClick={() => setModalAberto('empresa')}
              >
                Inscrever minha Equipe
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="relative animate-fade-in-up lg:ml-8" style={{ animationDelay: '0.3s' }}>
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient rounded-[2.5rem] blur opacity-20" />
              <div className="aspect-square lg:aspect-video rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl relative">
                <img
                  src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/espaco/gxexperience-noite.png"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  alt="Homenagem e Premiação"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Inscrição Social */}
      <SocialRegistrationSection onInscrever={() => setModalInscricaoAberto(true)} />

      {/* Seções de Inscrição */}
      <div id="inscricoes">
        <InscricaoSection
          id="cursos-workshops"
          icon={GraduationCap}
          titulo="Cursos e Workshops Gratuitos"
          subtitulo="Acesso limitado a todas as trilhas diurnas"
          descricao="Participe de workshops práticos e oficinas mão na massa com especialistas."
          beneficios={[
            "Acesso a todos os workshops e oficinas",
            "Certificado de participação digital",
            "Material didático exclusivo"
          ]}
          gratuito
          onInscrever={() => setModalInscricaoAberto(true)}
          imagemUrl="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/caretas-triunfo/caretas-triunfo.png"
        />

        <InscricaoSection
          id="mentorias"
          icon={Target}
          titulo="Solicitar Mentoria Individual"
          subtitulo="30 minutos exclusivos com especialistas"
          descricao="Sessões personalizadas com mentores especializados."
          beneficios={[
            "Sessão individual de 30 minutos",
            "Diagnóstico personalizado",
            "Plano de ação de 30 dias"
          ]}
          gratuito
          onInscrever={() => setModalAberto('mentor')}
          imagemUrl="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/palestrantes/caioborges-perfil.png"
        />
      </div>

      {/* Ecossistema e Negócios */}
      <section className="py-24 bg-dark relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <Card className="glass-card p-6 sm:p-10 border-orange-500/30 hover:bg-orange-500/10 transition-all group relative overflow-hidden animate-fade-in-up">
              <div className="flex items-center justify-between mb-8 group-hover:scale-110 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Rocket className="h-8 w-8 text-orange-400" />
                </div>
                <SectionShare sectionId="arena-pitch" title="Arena Pitch - Growth Experience" />
              </div>
              <h3 id="arena-pitch" className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                Expo StartUp
                <Badge className="bg-orange-500 text-white border-none animate-pulse">10 VAGAS</Badge>
              </h3>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                Apresente sua startup na <strong>Arena Pitch</strong>, tenha um espaço exclusivo de <strong>exposição</strong> e ganhe <strong>2 ingressos</strong> para as palestras noturnas.
              </p>
              <div className="mb-8">
                <span className="text-4xl font-black text-white">R$ 999,00</span>
                <p className="text-sm text-gray-400 mt-1">Pacote completo para startups</p>
              </div>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-8 rounded-2xl h-auto"
                onClick={() => setModalAberto('startup')}
              >
                GARANTIR EXPO STARTUP
              </Button>
            </Card>

            <Card className="glass-card p-6 sm:p-10 border-teal-500/30 hover:bg-teal-500/10 transition-all group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-8 group-hover:scale-110 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <Handshake className="h-8 w-8 text-teal-400" />
                </div>
                <SectionShare sectionId="rodada-negocios" title="Rodada de Negócios B2B - Growth Experience" />
              </div>
              <h3 id="rodada-negocios" className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                Rodada de Negócios B2B
                <Badge className="bg-teal-500 text-white border-none">PREMIUM</Badge>
              </h3>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                Conectamos grandes empresas com fornecedores qualificados.
              </p>
              <div className="mb-8">
                <span className="text-4xl font-black text-teal-400 uppercase">Gratuito</span>
                <p className="text-sm text-gray-400 mt-1">Sua empresa conectada com o mercado</p>
              </div>
              <Button
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-black py-8 rounded-2xl h-auto"
                onClick={() => setModalAberto('b2b')}
              >
                QUERO PARTICIPAR DA RODADA
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Patrocínios */}
      <section id="patrocinios" className="py-16 sm:py-24 bg-dark-200">
        <div id="expositores" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-16 animate-fade-in-up">
            <div className="text-left">
              <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
                OPORTUNIDADES DE EXPOSIÇÃO
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white">
                Sua Marca em <span className="text-gradient">Destaque</span>
              </h2>
            </div>
            <SectionShare sectionId="expositores" title="Seja um Expositor - Growth Experience" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {cotas.map((cota, idx) => (
              <PatrocinioCard
                key={idx}
                nome={cota.nome}
                espaco={cota.espaco}
                ingressos={cota.ingressos}
                beneficios={cota.beneficios}
                vagas={cota.vagas}
                destaque={cota.destaque}
                imagemUrl={getStandImage(cota.nome)}
                onContato={() => {
                  window.location.href = 'mailto:projetos@cbxgrowth.com.br?subject=Interesse em Cota ' + cota.nome;
                }}
              />
            ))}
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
          className="fixed bottom-24 right-6 z-50 w-16 h-16 bg-white text-dark rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
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
