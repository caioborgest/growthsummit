import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { Project } from '@/types';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Handshake,
  Rocket,
  ArrowRight,
  QrCode,
  TrendingUp,
} from 'lucide-react';
import { QRScanner } from '@/components/app/QRScanner';
import { toast } from 'sonner';
import { CertificateService } from '@/lib/certificateService';
import type { QRData } from '@/lib/qrUtils';
import { useProjects, useRegistrations, useCheckInsAtividades } from '@/hooks/useData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { InscricaoModal } from '@/components/forms/InscricaoModal';
import { EmpresaIncentivadoraModal } from '@/components/forms/EmpresaIncentivadoraModal';
import { SEOHead } from '@/components/seo/SEOHead';
import { getPalestranteImage, getStandImage, getStorageUrl } from '@/lib/storage';
import { AppDownloadSection } from '@/components/app/AppDownloadSection';
import { InscricaoMultiStepModal } from '@/components/forms/InscricaoMultiStepModal';
import { HeroSectionRefined } from '@/components/growth-experience/HeroSectionRefined';
import { StatsSection } from '@/components/growth-experience/StatsSection';
import { PalestranteCardRefined } from '@/components/growth-experience/PalestranteCardRefined';
import { LotePromocionalPopUp } from '@/components/growth-experience/LotePromocionalPopUp';
import { useProject } from '@/contexts/ProjectContext';
import { PatrocinioCard } from '@/components/growth-experience/PatrocinioCard';
import { WhatsAppButton } from '@/components/growth-experience/WhatsAppButton';
import { EVENT_CONFIG } from '@/config/eventConfig';
import { PageLoader } from '@/components/ui/PageLoader';

export function DynamicEventPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { selectedProject, setSelectedProject } = useProject();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [modalInscricaoAberto, setModalInscricaoAberto] = useState(false);
  const [modalAberto, setModalAberto] = useState<'palestra' | 'empresa' | null>(null);
  const [scannerAberto, setScannerAberto] = useState(false);
  const { user } = useAuth();
  const { data: userRegistrations } = useRegistrations();
  const { create: registerSessionCheckIn } = useCheckInsAtividades();

  const handleScanSuccess = async (qrData: QRData | null) => {
    if (!qrData) {
        toast.error("QR Code inválido.");
        return;
    }
    setScannerAberto(false);

    if (!user) {
      toast.error("Você precisa estar logado para confirmar presença.");
      return;
    }

    // Encontrar inscrição do usuário para este projeto
    const userReg = (userRegistrations || []).find(r => r.projectId === currentProject?.id);

    if (!userReg) {
      toast.error("Você não possui uma inscrição ativa para este evento.");
      return;
    }

    try {
      if (qrData.type === 'session') {
        const session = { id: qrData.id, title: 'Atividade Escolhida' }; // Minimal session object for certificate

        if (!currentProject) return;

        console.debug("[GrowthExperience] Checking registration for", user.email);

        await registerSessionCheckIn({
          projectId: currentProject.id,
          registrationId: userReg.id,
          userId: user.id,
          sessionId: qrData.id,
          checkInAt: new Date().toISOString(),
          checkInType: 'qr'
        });

        // Trigger de certificado se necessário
        if (currentProject) {
          await CertificateService.checkAndIssueSessionCertificate(
            user,
            currentProject,
            session as any, // session is a partial mock here
            userReg.id
          );
        }

        toast.success("Presença confirmada! Seu certificado já está disponível.");
      } else {
        toast.error("QR Code inválido para esta atividade.");
      }
    } catch (err: any) {
      console.error("Erro ao registrar check-in:", err);
      toast.error("Erro ao confirmar presença.");
    }
  };
  // initialized is used internally for project setup if needed later

  // Encontrar o projeto pelo slug
  useEffect(() => {
    if (!projects || !slug) return;
    
    const project = projects.find(p => p.slug === slug);
    if (project && currentProject?.id !== project.id) {
        setCurrentProject(project);
        if (selectedProject?.id !== project.id) {
          setSelectedProject(project);
        }
    }
  }, [projects, slug, setSelectedProject, selectedProject?.id, currentProject?.id]);

  // Sincronizar modais com a URL
  useEffect(() => {
    const formParam = searchParams.get('form');
    if (!formParam) return;

    if (formParam === 'inscricao') {
        setModalInscricaoAberto(true);
    } else if (['palestra', 'empresa'].includes(formParam)) {
        setModalAberto(formParam as 'palestra' | 'empresa');
    }
  }, [searchParams]);

  const closeModals = () => {
    setModalInscricaoAberto(false);
    setModalAberto(null);
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

  if (loadingProjects) return <PageLoader />;
  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark text-white px-4 text-center">
        <div>
          <h1 className="text-4xl font-black mb-4">EVENTO NÃO ENCONTRADO</h1>
          <p className="text-gray-400 mb-8">O projeto "{slug}" não existe ou ainda não foi publicado.</p>
          <Button onClick={() => window.history.back()} className="bg-brand-orange-coral">Voltar</Button>
        </div>
      </div>
    );
  }

  const content = currentProject.settings?.publicContent;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="flex flex-col overflow-x-hidden">
      <SEOHead
        title={`${currentProject.name} | Growth Experience`}
        description={currentProject.description}
        url={pageUrl}
      />

      <InscricaoMultiStepModal isOpen={modalInscricaoAberto} onClose={closeModals} />
      <InscricaoModal isOpen={modalAberto === 'palestra'} onClose={closeModals} tipo="palestra" eventoNome={currentProject.name} />
      <EmpresaIncentivadoraModal isOpen={modalAberto === 'empresa'} onClose={closeModals} />

      <LotePromocionalPopUp />

      <HeroSectionRefined
        project={currentProject}
        onCTAClick={() => handleOpenModal('inscricao')}
      />

      <StatsSection project={currentProject} />

      {/* Sobre o Evento */}
      <section id="sobre" className="py-16 sm:py-24 bg-dark-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
                O EVENTO
              </Badge>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                {content?.aboutTitle || "Acelere seu Crescimento com quem faz na prática"}
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                {content?.aboutText || currentProject.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="flex gap-4">
                   <Calendar className="h-6 w-6 text-brand-orange-coral" />
                   <div>
                     <p className="text-white font-bold">Data & Horário</p>
                     <p className="text-sm text-gray-400">16 de Abril, das 17h às 23h</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <MapPin className="h-6 w-6 text-brand-orange-coral" />
                   <div>
                     <p className="text-white font-bold">Localização</p>
                     <p className="text-sm text-gray-400">{currentProject.location}, {currentProject.city}-{currentProject.state}</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src={getStorageUrl('event-images', 'espaco/gxexperience-noite.png')}
                className="rounded-2xl shadow-2xl border border-white/10 w-full"
                alt="Evento"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Palestrantes Dinâmicos */}
      {content?.palestrantes && content.palestrantes.length > 0 && (
        <section id="palestrantes" className="py-16 sm:py-24 bg-dark-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-16 text-center">Protagonistas do <span className="text-gradient">Sucesso</span></h2>
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {content.palestrantes.map((p, i) => (
                <PalestranteCardRefined
                  key={i}
                  nome={p.nome}
                  cargo={p.role_title}
                  descricao={p.descricao}
                  tema={p.tema}
                  horario={p.horario}
                  foto={getPalestranteImage(p.nome)}
                  onInscricao={() => handleOpenModal('palestra')}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Patrocínios Dinâmicos */}
      {content?.vagas && content.vagas.length > 0 && (
        <section id="patrocinios" className="py-16 sm:py-24 bg-dark-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-16 text-center">
              Sua Marca em <span className="text-gradient">Destaque</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.vagas.map((cota, idx) => (
                <PatrocinioCard
                  key={idx}
                  {...cota}
                  imagemUrl={getStandImage(cota.nome)}
                  onContato={() => {
                    const message = encodeURIComponent(`Olá! Tenho interesse na Cota ${cota.nome} para o evento ${currentProject.name}.`);
                    window.open(`https://wa.me/${EVENT_CONFIG.whatsapp.number}?text=${message}`, '_blank');
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mentorias VIP */}
      {currentProject.settings?.enableMentoring && (
        <section id="mentorias" className="py-16 sm:py-24 bg-dark-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
                EXCLUSIVO VIP
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">Mentorias <span className="text-gradient">Individuais</span></h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Acesse o conhecimento de grandes especialistas em sessões individuais de 25 minutos para destravar o seu negócio.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {/* Se houver mentores no content, renderizar aqui, senão mostrar placeholder premium */}
               <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-orange-coral/30 transition-all flex flex-col items-center text-center">
                 <div className="w-16 h-16 rounded-full bg-brand-orange-coral/10 flex items-center justify-center mb-6">
                   <Users className="h-8 w-8 text-brand-orange-coral" />
                 </div>
                 <h4 className="text-white font-bold text-xl mb-2">Mentores de Elite</h4>
                 <p className="text-gray-400 mb-6 font-medium leading-relaxed">Sessões práticas com quem já escalou negócios e domina o mercado.</p>
                 <Button onClick={() => handleOpenModal('inscricao')} className="w-full bg-brand-orange-coral hover:bg-brand-orange-intense">Garantir Ingresso VIP</Button>
               </div>
               <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-orange-coral/30 transition-all flex flex-col items-center text-center">
                 <div className="w-16 h-16 rounded-full bg-brand-orange-coral/10 flex items-center justify-center mb-6">
                   <Trophy className="h-8 w-8 text-brand-orange-coral" />
                 </div>
                 <h4 className="text-white font-bold text-xl mb-2">Foco em Resultados</h4>
                 <p className="text-gray-400 mb-6 font-medium leading-relaxed">Diagnóstico rápido e plano de ação imediato para os seus desafios.</p>
                 <Button onClick={() => handleOpenModal('inscricao')} variant="outline" className="w-full border-brand-orange-coral text-brand-orange-coral hover:bg-brand-orange-coral hover:text-white">Saiba Mais</Button>
               </div>
               <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-orange-coral/30 transition-all flex flex-col items-center text-center">
                 <div className="w-16 h-16 rounded-full bg-brand-orange-coral/10 flex items-center justify-center mb-6">
                   <Rocket className="h-8 w-8 text-brand-orange-coral" />
                 </div>
                 <h4 className="text-white font-bold text-xl mb-2">Escalabilidade</h4>
                 <p className="text-gray-400 mb-6 font-medium leading-relaxed">Estratégias validadas para levar sua empresa ao próximo nível.</p>
                 <Button onClick={() => handleOpenModal('inscricao')} variant="outline" className="w-full border-brand-orange-coral text-brand-orange-coral hover:bg-brand-orange-coral hover:text-white">Ver Agenda</Button>
               </div>
            </div>
          </div>
        </section>
      )}

      {/* Rodada de Negócios (B2B) */}
      {currentProject.settings?.enableB2B && (
        <section id="b2b" className="py-16 sm:py-24 bg-dark-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <img
                  src={getStorageUrl('event-images', 'espaco/gxexperience-noite.png')}
                  className="rounded-2xl shadow-2xl border border-white/10 w-full grayscale hover:grayscale-0 transition-all duration-700"
                  alt="Rodada de Negócios"
                />
              </div>
              <div className="order-1 lg:order-2">
                <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
                  NETWORKING ESTRATÉGICO
                </Badge>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
                  Rodada de Negócios <span className="text-gradient">B2B</span>
                </h2>
                <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                  Conecte sua empresa com grandes players do mercado em reuniões rápidas e objetivas para gerar novas parcerias e contratos.
                </p>
                <div className="space-y-4 mb-10">
                   <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                     <Handshake className="h-6 w-6 text-brand-orange-coral shrink-0" />
                     <p className="text-gray-300">Acesso a decisores e CEOs de grandes empresas regionais.</p>
                   </div>
                   <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                     <TrendingUp className="h-6 w-6 text-brand-orange-coral shrink-0" />
                     <p className="text-gray-300">Ambiente focado 100% em geração de novos negócios.</p>
                   </div>
                </div>
                <Button
                  size="lg"
                  className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-12 py-8 text-xl rounded-2xl shadow-glow-orange h-auto group"
                  onClick={() => handleOpenModal('inscricao')}
                >
                  Quero Participar
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Arena StartUp */}
      {currentProject.settings?.enableStartups && (
        <section id="arena" className="py-16 sm:py-24 bg-dark-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
              INOVAÇÃO
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">Arena <span className="text-gradient">StartUp</span></h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-16">
              O palco das ideias que transformam o futuro. Assista a pitches de impacto e conheça as soluções mais inovadoras do ecossistema.
            </p>
            
            <div className="bg-gradient-to-br from-brand-orange-coral/20 to-transparent p-1 rounded-3xl mb-12 max-w-4xl mx-auto">
              <div className="bg-dark-200 rounded-[1.4rem] p-12 border border-white/5 flex flex-col items-center">
                <Rocket className="h-16 w-16 text-brand-orange-coral mb-6 animate-bounce" />
                <h3 className="text-2xl font-bold text-white mb-4">Inscrições para Pitch abertas</h3>
                <p className="text-gray-400 mb-8 max-w-xl">
                  Sua startup pronta para o próximo nível? Inscreva-se para apresentar seu pitch para uma banca de investidores e mentores.
                </p>
                <Button 
                  onClick={() => handleOpenModal('inscricao')}
                  className="bg-white text-dark hover:bg-brand-orange-coral hover:text-white font-bold py-6 px-10 rounded-xl transition-all"
                >
                  Inscrever minha Startup
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <AppDownloadSection />
      <WhatsAppButton />

      {/* Floating QR Check-in Button */}
      {user && currentProject.settings?.enableCheckIn && (
        <button
          onClick={() => setScannerAberto(true)}
          className="fixed bottom-24 right-4 sm:right-8 z-50 w-16 h-16 bg-white text-dark rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border-2 border-brand-orange-coral/20"
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

export default DynamicEventPage;
