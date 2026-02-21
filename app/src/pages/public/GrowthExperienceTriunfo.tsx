import { useState } from 'react';
import {
  MapPin,
  TrendingUp,
  Handshake,
  Building2,
  GraduationCap,
  Menu,
  X,
  Mic2,
  Award,
  Phone,
  Target,
  Mail,
  Zap,
  Rocket,
  Trophy,
  ArrowRight,
  Sparkles,
  Instagram,
  Linkedin,
  Facebook,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InscricaoModal } from '@/components/forms/InscricaoModal';
import { StartupFormModal } from '@/components/forms/StartupFormModal';
import { B2BFormModal } from '@/components/forms/B2BFormModal';
import { MentorFormModal } from '@/components/forms/MentorFormModal';
import { MentoriaMultiStepModal } from '@/components/forms/MentoriaMultiStepModal';
import { EmpresaIncentivadoraModal } from '@/components/forms/EmpresaIncentivadoraModal';
import { SocialShare } from '@/components/social/SocialShare';
import { SEOHead } from '@/components/seo/SEOHead';
import { getStandImage, getPalestranteImage } from '@/lib/storage';
import { InscricaoSection } from '@/components/growth-experience/InscricaoSection';
import { PatrocinioCard } from '@/components/growth-experience/PatrocinioCard';
import { WhatsAppButton } from '@/components/growth-experience/WhatsAppButton';
import { AppDownloadSection } from '@/components/app/AppDownloadSection';
import { InscricaoMultiStepModal } from '@/components/forms/InscricaoMultiStepModal';
import { SocialRegistrationSection } from '@/components/growth-experience/SocialRegistrationSection';
import { ProgramacaoCircuitoSection } from '@/components/growth-experience/ProgramacaoCircuitoSection';
import { HeroSectionRefined } from '@/components/growth-experience/HeroSectionRefined';
import { StatsSection } from '@/components/growth-experience/StatsSection';
import { PalestranteCardRefined } from '@/components/growth-experience/PalestranteCardRefined';
import { SectionShare } from '@/components/social/SectionShare';
import { LotePromocionalPopUp } from '@/components/growth-experience/LotePromocionalPopUp';
import { useMentors } from '@/hooks/useData';

// Dados do evento
const palestrantes = [
  {
    nome: "Leandro Batista",
    cargo: "CEO, Fitness Exclusive",
    descricao: "Empreendedor que escalou a maior rede de academias do interior do Nordeste",
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

// Header Component
function InnerHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3 group transition-transform duration-300 hover:scale-[1.05]">
              <img
                src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/logomarca-GX-fundoescuro.png"
                alt="Growth Experience"
                className="h-10 sm:h-14 w-auto drop-shadow-[0_0_8px_rgba(255,112,67,0.3)] transition-all group-hover:drop-shadow-[0_0_12px_rgba(255,112,67,0.5)]"
                onError={(e) => {
                  e.currentTarget.src = 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth_experience.png';
                }}
              />
            </Link>

            <nav className="hidden lg:flex items-center space-x-8">
              {['Sobre', 'Programação', 'Palestrantes', 'Inscrições', 'Seja Expositor'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-brand-orange-coral transition-all duration-300 relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-orange-coral transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="outline" className="hidden sm:flex border-brand-orange-coral text-brand-orange-coral hover:bg-brand-orange-coral/10" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <button className="lg:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Mobile - Fora do header para evitar problemas de empilhamento */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[45] bg-dark backdrop-blur-2xl px-4 pt-24 pb-12 overflow-y-auto animate-in fade-in duration-300">
          <nav className="flex flex-col gap-2">
            {[
              { label: 'Sobre', href: '#sobre' },
              { label: 'Mentores', href: '#mentores' },
              { label: 'Programação', href: '#programacao' },
              { label: 'Palestrantes', href: '#palestrantes' },
              { label: 'Inscrições', href: '#inscricoes' },
              { label: 'Seja Expositor', href: '#patrocinios' }
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center justify-between text-2xl font-black text-gray-300 hover:text-white hover:bg-white/5 transition-all px-6 py-5 rounded-3xl group border border-transparent hover:border-white/5"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
                <ArrowRight className="h-6 w-6 text-brand-orange-coral opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </a>
            ))}
          </nav>

          <div className="mt-8 px-4 space-y-4">
            <Button variant="outline" size="lg" className="w-full border-brand-orange-coral text-brand-orange-coral hover:bg-brand-orange-coral/10 h-16 text-xl font-black rounded-2xl" asChild>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Entrar na Área do Aluno</Link>
            </Button>
            <div className="text-center pt-4">
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest text-[10px]">Growth Experience Triunfo 2026</p>
            </div>
          </div>
        </div>
      )}
    </>

  );
}

// Footer Component
function InnerFooter() {
  return (
    <footer className="bg-dark-100 border-t border-white/5 pt-20 pb-10 sm:pb-8 relative overflow-hidden">
      {/* Decoração de Fundo */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-orange-coral/5 rounded-full blur-[120px] -z-10 translate-y-1/2 translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand Session */}
          <div className="lg:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="mb-8">
              <img
                src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth_experience.png"
                alt="Growth Experience"
                className="h-12 w-auto animate-pulse-slow"
                onError={(e) => {
                  e.currentTarget.src = 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/logomarca-GX-fundoescuro.png';
                }}
              />
            </div>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8 max-w-sm">
              A maior exposição de negócios do Sertão do Pajeú. Transformando empresas locais através de conhecimento prático e conexões reais.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-brand-orange-coral hover:text-white hover:border-brand-orange-coral transition-all duration-300 group">
                <Instagram className="h-5 w-5 transition-transform group-hover:scale-110" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-brand-orange-coral hover:text-white hover:border-brand-orange-coral transition-all duration-300 group">
                <Linkedin className="h-5 w-5 transition-transform group-hover:scale-110" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-brand-orange-coral hover:text-white hover:border-brand-orange-coral transition-all duration-300 group">
                <Facebook className="h-5 w-5 transition-transform group-hover:scale-110" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-white font-bold text-lg mb-8 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-1/2 after:md:left-0 after:ml-[-15px] after:md:ml-0 after:w-[30px] after:h-[2px] after:bg-brand-orange-coral">
              Navegação
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="#sobre" className="text-gray-400 hover:text-brand-orange-coral transition-all flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-orange-coral scale-0 group-hover:scale-100 transition-transform" />
                  Sobre o Evento
                </a>
              </li>
              <li>
                <a href="#programacao" className="text-gray-400 hover:text-brand-orange-coral transition-all flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-orange-coral scale-0 group-hover:scale-100 transition-transform" />
                  Programação
                </a>
              </li>
              <li>
                <a href="#palestrantes" className="text-gray-400 hover:text-brand-orange-coral transition-all flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-orange-coral scale-0 group-hover:scale-100 transition-transform" />
                  Palestrantes
                </a>
              </li>
              <li>
                <a href="#inscricoes" className="text-gray-400 hover:text-brand-orange-coral transition-all flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-orange-coral scale-0 group-hover:scale-100 transition-transform" />
                  Inscrições
                </a>
              </li>
              <li>
                <a href="#patrocinios" className="text-gray-400 hover:text-brand-orange-coral transition-all flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-orange-coral scale-0 group-hover:scale-100 transition-transform" />
                  Seja Expositor
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-white font-bold text-lg mb-8 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-1/2 after:md:left-0 after:ml-[-15px] after:md:ml-0 after:w-[30px] after:h-[2px] after:bg-brand-orange-coral">
              Suporte & Contato
            </h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="mt-1 w-8 h-8 rounded-lg bg-brand-orange-coral/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-brand-orange-coral" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-1">Localização</p>
                  <p className="text-gray-400 text-sm">Espaço Parque, Triunfo-PE</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-8 h-8 rounded-lg bg-brand-orange-coral/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-brand-orange-coral" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-1">Email</p>
                  <p className="text-gray-400 text-sm break-all">contato@growthsummit.site</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-8 h-8 rounded-lg bg-brand-orange-coral/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-brand-orange-coral" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-1">WhatsApp</p>
                  <p className="text-gray-400 text-sm">(88) 98843-2310</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Realization */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-white font-bold text-lg mb-8 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-1/2 after:md:left-0 after:ml-[-15px] after:md:ml-0 after:w-[30px] after:h-[2px] after:bg-brand-orange-coral">
              Realização
            </h4>
            <div className="space-y-6 w-full">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Organização Principal</p>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <img src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/logomarca-GS-site.png" alt="Growth Summit" className="h-8 w-auto grayscale group-hover:grayscale-0 transition-all opacity-70" />
                  <span className="text-white font-bold tracking-tight">Growth Summit</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Patrocinador Master</p>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-3 py-1 text-xs">SEBRAE-PE</Badge>
                  <span className="text-white/60 text-xs">Agência Triunfo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <div className="order-2 md:order-1 flex flex-col items-center md:items-start gap-2">
            <p className="text-gray-500 text-xs sm:text-sm">
              © 2026 Growth Experience Triunfo-PE. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 text-[10px] sm:text-xs text-gray-600">
              <a href="#" className="hover:text-white transition-colors">Políticas de Privacidade</a>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            </div>
          </div>

          <div className="order-1 md:order-2 flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Sparkles className="h-3 w-3 text-brand-orange-coral" />
            <span className="text-gray-400 text-[10px] sm:text-xs">Desenvolvido por <span className="text-white font-bold">Growth Summit Tech</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Component
export function GrowthExperienceTriunfo() {
  const [modalInscricaoAberto, setModalInscricaoAberto] = useState(false);
  const [modalAberto, setModalAberto] = useState<'mentor' | 'mentor-cadastro' | 'startup' | 'b2b' | 'palestra' | 'empresa' | null>(null);
  const { data: mentorsData, isLoading: mentorsLoading } = useMentors();
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.growthsummit.site/growth-experience-triunfo';

  const approvedMentors = (mentorsData || []).filter(m => m.status === 'approved');

  return (
    <div className="bg-dark min-h-screen pt-20 flex flex-col">
      <SEOHead
        title="Growth Experience Triunfo-PE 2026 | 09 de Abril"
        description="A Maior Exposição de Negócios do Sertão do Pajeú. Capacitação, networking e oportunidades para PMEs. 09/04/2026 no Espaço Parque."
        keywords="growth experience, triunfo pe, evento negócios, sebrae, empreendedorismo, sertão do pajeú"
        url={pageUrl}
      />

      <InnerHeader />

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
      <HeroSectionRefined onCTAClick={() => setModalInscricaoAberto(true)} />

      {/* Stats Section Refinada */}
      <StatsSection />

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
                Quero ser um mentor confirmadado
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
                Ao inscrever sua equipe para o **Night Experience**, sua empresa compete automaticamente ao prêmio de **"Melhor Empresa Incentivadora ao Empreendedorismo"**.
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
                  src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  alt="Premiação Noturna"
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
          subtitulo="Acesso ilimitado a todas as trilhas diurnas"
          descricao="Participe de workshops práticos e oficinas mão na massa com especialistas."
          beneficios={[
            "Acesso a todos os workshops e oficinas",
            "Certificado de participação digital",
            "Material didático exclusivo"
          ]}
          gratuito
          onInscrever={() => setModalInscricaoAberto(true)}
          imagemUrl="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
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
          imagemUrl="https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=2071&auto=format&fit=crop"
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
                  window.location.href = 'mailto:contato@growthsummit.site?subject=Interesse em Cota ' + cota.nome;
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

      <InnerFooter />
      <WhatsAppButton />
    </div>
  );
}
