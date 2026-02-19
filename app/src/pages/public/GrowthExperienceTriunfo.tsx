import { useState } from 'react';
import {
  MapPin,
  TrendingUp,
  Handshake,
  Building2,
  GraduationCap,
  UserPlus,
  CheckCircle,
  Menu,
  X,
  Mic2,
  Award,
  Star,
  Phone,
  Target,
  Mail,
  Zap,
  Rocket,
  Trophy,
  ArrowRight,
  Sparkles
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
import { ProgramacaoCompleta } from '@/components/growth-experience/ProgramacaoCompleta';
import { HeroSectionRefined } from '@/components/growth-experience/HeroSectionRefined';
import { StatsSection } from '@/components/growth-experience/StatsSection';
import { PalestranteCardRefined } from '@/components/growth-experience/PalestranteCardRefined';
import { SectionShare } from '@/components/social/SectionShare';

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3 group transition-transform duration-300 hover:scale-[1.05]">
            <img
              src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/logomarca-GX-fundoescuro.png"
              alt="Growth Experience"
              className="h-14 w-auto drop-shadow-[0_0_8px_rgba(255,112,67,0.3)] transition-all group-hover:drop-shadow-[0_0_12px_rgba(255,112,67,0.5)]"
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
            <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-dark-100/95 backdrop-blur-md border-b border-white/10 px-4 py-8 space-y-6 animate-fade-in-up">
          <a href="#sobre" className="block text-lg font-bold text-gray-300 hover:text-brand-orange-coral transition-colors px-4 py-2 hover:bg-white/5 rounded-xl flex items-center justify-between group" onClick={() => setIsMobileMenuOpen(false)}>
            Sobre
            <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </a>
          <a href="#programacao" className="block text-lg font-bold text-gray-300 hover:text-brand-orange-coral transition-colors px-4 py-2 hover:bg-white/5 rounded-xl flex items-center justify-between group" onClick={() => setIsMobileMenuOpen(false)}>
            Programação
            <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </a>
          <a href="#palestrantes" className="block text-lg font-bold text-gray-300 hover:text-brand-orange-coral transition-colors px-4 py-2 hover:bg-white/5 rounded-xl flex items-center justify-between group" onClick={() => setIsMobileMenuOpen(false)}>
            Palestrantes
            <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </a>
          <a href="#inscricoes" className="block text-lg font-bold text-gray-300 hover:text-brand-orange-coral transition-colors px-4 py-2 hover:bg-white/5 rounded-xl flex items-center justify-between group" onClick={() => setIsMobileMenuOpen(false)}>
            Inscrições
            <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </a>
          <a href="#patrocinios" className="block text-lg font-bold text-gray-300 hover:text-brand-orange-coral transition-colors px-4 py-2 hover:bg-white/5 rounded-xl flex items-center justify-between group" onClick={() => setIsMobileMenuOpen(false)}>
            Seja Expositor
            <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </a>
          <div className="pt-4 px-4">
            <Button variant="outline" size="lg" className="w-full border-brand-orange-coral text-brand-orange-coral hover:bg-brand-orange-coral/10 h-14 text-lg font-bold rounded-xl" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

// Footer Component
function InnerFooter() {
  return (
    <footer className="bg-dark-100 pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <div className="mb-6">
              <img
                src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth_experience.png"
                alt="Growth Experience"
                className="h-12 w-auto"
                onError={(e) => {
                  e.currentTarget.src = 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/logomarca-GX-fundoescuro.png';
                }}
              />
            </div>
            <p className="text-gray-400 max-w-sm mb-6">
              A maior exposição de negócios do Sertão do Pajeú. Transformando empresas locais através de conhecimento prático e conexões reais.
            </p>
            <div className="flex items-center gap-2">
              <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30">
                Patrocínio: SEBRAE
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Acesso Rápido</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#sobre" className="hover:text-brand-orange-coral transition-colors">Sobre o Evento</a></li>
              <li><a href="#programacao" className="hover:text-brand-orange-coral transition-colors">Programação</a></li>
              <li><a href="#palestrantes" className="hover:text-brand-orange-coral transition-colors">Palestrantes</a></li>
              <li><a href="#inscricoes" className="hover:text-brand-orange-coral transition-colors">Inscrições</a></li>
              <li><a href="#patrocinios" className="hover:text-brand-orange-coral transition-colors">Seja Expositor</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Contato</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-orange-coral" />
                Espaço Parque, Triunfo-PE
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-orange-coral" />
                contato@growthsummit.site
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-orange-coral" />
                (88) 98843-2310
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
          <p>© 2026 Growth Experience Triunfo-PE. Realização: Growth Summit. Patrocínio: SEBRAE.</p>
        </div>
      </div>
    </footer>
  );
}

// Main Component
export function GrowthExperienceTriunfo() {
  const [modalInscricaoAberto, setModalInscricaoAberto] = useState(false);
  const [modalAberto, setModalAberto] = useState<'mentor' | 'mentor-cadastro' | 'startup' | 'b2b' | 'palestra' | 'empresa' | null>(null);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.growthsummit.site/growth-experience-triunfo';

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

      {/* Hero Section Refinada */}
      <HeroSectionRefined onCTAClick={() => setModalInscricaoAberto(true)} />

      {/* Stats Section Refinada */}
      <StatsSection />

      {/* Sobre o Evento */}
      <section id="sobre" className="py-24 bg-dark-100 relative overflow-hidden">
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
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
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
                  src="https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=2070&auto=format&fit=crop"
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

      {/* Palestrantes */}
      <section id="palestrantes" className="py-24 bg-dark-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between mb-16 animate-fade-in-up">
            <div className="text-left">
              <Badge className="mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
                KEYNOTES
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4">Protagonistas do <span className="text-gradient">Sucesso</span></h2>
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
      <ProgramacaoCompleta onInscrever={(tipo) => {
        if (tipo === 'mentoria') setModalAberto('mentor');
        else if (tipo === 'startup') setModalAberto('startup');
        else if (tipo === 'b2b') setModalAberto('b2b');
        else setModalInscricaoAberto(true);
      }} />

      {/* Seção Inovadora: Incentivo de Equipe */}
      <section className="py-24 bg-dark-100 relative overflow-hidden">
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
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
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
                className="bg-white text-dark font-black px-10 py-7 rounded-2xl shadow-xl hover:bg-brand-orange-coral hover:text-white transition-all duration-300 h-auto group"
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
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="glass-card p-10 border-orange-500/30 hover:bg-orange-500/10 transition-all group relative overflow-hidden animate-fade-in-up">
              <div className="flex items-center justify-between mb-8 group-hover:scale-110 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Rocket className="h-8 w-8 text-orange-400" />
                </div>
                <SectionShare sectionId="arena-pitch" title="Arena Pitch - Growth Experience" />
              </div>
              <h3 id="arena-pitch" className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                Arena Pitch
                <Badge className="bg-orange-500 text-white border-none animate-pulse">LIVE</Badge>
              </h3>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                Apresente sua startup para uma banca de tubarões.
              </p>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-8 rounded-2xl h-auto"
                onClick={() => setModalAberto('startup')}
              >
                CANDIDATAR MINHA STARTUP
              </Button>
            </Card>

            <Card className="glass-card p-10 border-teal-500/30 hover:bg-teal-500/10 transition-all group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
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
      <section id="patrocinios" className="py-24 bg-dark-200">
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
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6">
            Pronto para <span className="text-gradient">Transformar</span> seu Negócio?
          </h2>
          <Button
            size="lg"
            className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-12 py-8 text-xl rounded-2xl shadow-glow-orange h-auto"
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
