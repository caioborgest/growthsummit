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
import { ProgramacaoCompleta } from '@/components/growth-experience/ProgramacaoCompleta';
import { HeroSectionRefined } from '@/components/growth-experience/HeroSectionRefined';
import { StatsSection } from '@/components/growth-experience/StatsSection';
import { PalestranteCardRefined } from '@/components/growth-experience/PalestranteCardRefined';

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
        <div className="lg:hidden bg-dark-100/95 backdrop-blur-md border-b border-white/10 px-4 py-8 space-y-6 animate-fade-in">
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
                contato@growthsummit.com.br
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
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://growthsummit.com.br/growth-experience-triunfo';

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
      {/* Modais Específicos */}
      <MentoriaMultiStepModal isOpen={modalAberto === 'mentor'} onClose={() => setModalAberto(null)} />
      <InscricaoModal isOpen={modalAberto === 'palestra'} onClose={() => setModalAberto(null)} tipo="palestra" eventoNome="Growth Experience Triunfo-PE 2026" />
      {/* Cursos e Palestras agora usam o MultiStep acima */}
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
        {/* Decorative background elements */}
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
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge className="mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
              KEYNOTES
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4">Protagonistas do <span className="text-gradient">Sucesso</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Aprenda com quem está transformando o mercado nacional e escalando negócios reais.
            </p>
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
            <p className="text-gray-400 mt-6 text-sm flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-orange-coral" />
              Acesso exclusivo às palestras noturnas + premiação + networking de alto nível
            </p>
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-coral/10 text-brand-orange-coral border border-brand-orange-coral/20 mb-6 backdrop-blur-sm">
                <Trophy className="h-5 w-5 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Premiação Exclusiva</span>
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
              <div className="absolute -bottom-8 -right-8 glass-card p-8 border-brand-orange-coral/30 max-w-xs shadow-glow-orange animate-float">
                <blockquote className="text-white font-bold text-xl italic leading-tight mb-4">
                  "Investir no time é o melhor ROI que uma empresa pode ter."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-orange-coral flex items-center justify-center">
                    <Rocket className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Growth Summit 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seções de Inscrição */}
      <div id="inscricoes">
        <InscricaoSection
          id="cursos-workshops"
          icon={GraduationCap}
          titulo="Cursos e Workshops Gratuitos"
          subtitulo="Acesso ilimitado a todas as trilhas diurnas"
          descricao="Participe de workshops práticos e oficinas mão na massa com especialistas. Escolha entre gestão, marketing, vendas e IA aplicada ao seu negócio."
          beneficios={[
            "Acesso a todos os workshops e oficinas (manhã e tarde)",
            "Certificado de participação digital",
            "Material didático exclusivo para download",
            "Networking com outros empreendedores",
            "Acesso ao circuito de experiências",
            "Coffee break incluso"
          ]}
          gratuito
          horario="8h30 - 17h30"
          capacidade="Vagas limitadas por sala (20-80 pessoas)"
          destaque
          onInscrever={() => setModalInscricaoAberto(true)}
          imagemUrl="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
        />

        <InscricaoSection
          id="mentorias"
          icon={Target}
          titulo="Solicitar Mentoria Individual"
          subtitulo="30 minutos exclusivos com especialistas"
          descricao="Sessões personalizadas com mentores especializados em gestão, growth, marketing, vendas, financeiro, coaching, RH e IA. Receba um diagnóstico completo e um plano de ação de 30 dias."
          beneficios={[
            "Sessão individual de 30 minutos",
            "Diagnóstico personalizado do seu negócio",
            "Plano de ação de 30 dias com mentor",
            "Networking de alto nível",
            "Acesso prioritário a consultorias futuras"
          ]}
          gratuito
          vagasLimitadas
          horario="14:00 - 15:30"
          capacidade="15 mentorias simultâneas (agendamento prévio)"
          onInscrever={() => setModalAberto('mentor')}
          imagemUrl="https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=2071&auto=format&fit=crop"
        />
      </div>

      {/* Seção Especial: Seja um Mentor */}
      <section className="py-24 bg-gradient-to-r from-brand-orange-coral/20 to-brand-blue/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-12 border-white/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange-coral/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <Badge className="mb-4 bg-brand-orange-coral text-white">CHAMADA PARA MENTORES</Badge>
                <h2 className="text-4xl font-bold text-white mb-6">Seja um Mentor do Growth Experience</h2>
                <p className="text-xl text-gray-300 mb-8">
                  Sua experiência pode ser a chave para o sucesso de outro empreendedor. Compartilhe seu conhecimento e ajude a transformar o ecossistema local.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-gray-200">
                    <CheckCircle className="h-5 w-5 text-brand-orange-coral" />
                    <span>Reconhecimento como especialista</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-200">
                    <CheckCircle className="h-5 w-5 text-brand-orange-coral" />
                    <span>Networking VIP com palestrantes e speakers</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-200">
                    <CheckCircle className="h-5 w-5 text-brand-orange-coral" />
                    <span>Selo oficial de Mentor Growth Experience</span>
                  </li>
                </ul>
                <Button
                  size="lg"
                  className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-bold px-10 py-7 text-lg rounded-xl shadow-lg"
                  onClick={() => setModalAberto('mentor-cadastro')}
                >
                  <UserPlus className="h-5 w-5 mr-3" />
                  Quero ser Mentor
                </Button>
              </div>
              <div className="hidden lg:block">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                  alt="Mentoria"
                  className="rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecossistema e Negócios: Arena Pitch e B2B */}
      <section className="py-24 bg-dark relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1/2 bg-brand-orange-coral/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              Ecossistema <span className="text-gradient">&</span> Negócios
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Oportunidades exclusivas para startups e empresas estabelecidas que buscam o próximo nível.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Arena Pitch Card */}
            <Card className="glass-card p-10 border-orange-500/30 hover:bg-orange-500/10 transition-all group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Rocket className="h-32 w-32 text-orange-400 -rotate-12" />
              </div>

              <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                <Rocket className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                Arena Pitch
                <Badge className="bg-orange-500 text-white border-none animate-pulse">LIVE</Badge>
              </h3>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed relative z-10">
                Apresente sua startup para uma banca de tubarões e concorra a prêmios em dinheiro e mentorias. Oportunidade perfeita para startups em estágio de validação e tração.
              </p>
              <div className="p-6 bg-orange-500/10 rounded-2xl mb-8 border border-orange-500/20 backdrop-blur-sm">
                <p className="text-orange-400 font-black mb-4 uppercase text-xs tracking-[0.2em]">Premiação 2026:</p>
                <ul className="space-y-4">
                  {[
                    { label: '1º Lugar:', value: 'R$ 2.000 + 3m Mentoria', color: 'text-white font-bold' },
                    { label: '2º Lugar:', value: 'R$ 1.500', color: 'text-white/80' },
                    { label: '3º Lugar:', value: 'R$ 700', color: 'text-white/70' }
                  ].map((item, i) => (
                    <li key={i} className="flex items-center justify-between border-b border-orange-500/10 pb-2">
                      <span className="text-orange-100/50">{item.label}</span>
                      <span className={item.color}>{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-8 rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all h-auto"
                onClick={() => setModalAberto('startup')}
              >
                CANDIDATAR MINHA STARTUP
              </Button>
            </Card>

            {/* B2B Card */}
            <Card className="glass-card p-10 border-teal-500/30 hover:bg-teal-500/10 transition-all group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Handshake className="h-32 w-32 text-teal-400 rotate-12" />
              </div>

              <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-teal-500/20">
                <Handshake className="h-8 w-8 text-teal-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                Rodada de Negócios B2B
                <Badge className="bg-teal-500 text-white border-none">PREMIUM</Badge>
              </h3>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed relative z-10">
                Conectamos grandes empresas âncoras da região com fornecedores qualificados. Gere leads reais e feche parcerias estratégicas durante o evento.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-6 bg-teal-500/10 rounded-2xl border border-teal-500/20 backdrop-blur-sm group-hover:bg-teal-500/20 transition-colors">
                  <p className="text-teal-400 font-black text-3xl mb-1">40+</p>
                  <p className="text-white/70 text-xs font-bold uppercase">Empresas Participantes</p>
                </div>
                <div className="p-6 bg-teal-500/10 rounded-2xl border border-teal-500/20 backdrop-blur-sm group-hover:bg-teal-500/20 transition-colors">
                  <p className="text-teal-400 font-black text-3xl mb-1">R$ 500k+</p>
                  <p className="text-white/70 text-xs font-bold uppercase">Volume de Negócios</p>
                </div>
              </div>
              <Button
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-black py-8 rounded-2xl shadow-xl shadow-teal-500/20 hover:scale-[1.02] transition-all h-auto"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
              OPORTUNIDADES DE EXPOSIÇÃO
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6">
              Sua Marca em <span className="text-gradient">Destaque</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Posicione sua marca na frente de mais de 2.000 empreendedores e gestores do Sertão do Pajeú. Gere leads qualificados e feche negócios reais.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-5 w-5 text-brand-orange-coral" />
                <span>Stands personalizados</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-5 w-5 text-brand-orange-coral" />
                <span>Ingressos inclusos</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-5 w-5 text-brand-orange-coral" />
                <span>Relatórios de ROI</span>
              </div>
            </div>
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
                  window.location.href = 'mailto:contato@growthsummit.com.br?subject=Interesse em Cota ' + cota.nome;
                }}
              />
            ))}
          </div>

          <div className="text-center">
            <Card className="glass-card p-8 max-w-2xl mx-auto border-brand-orange-coral/30">
              <h3 className="text-2xl font-bold text-white mb-4">
                Quer uma proposta personalizada?
              </h3>
              <p className="text-gray-300 mb-6">
                Entre em contato conosco para discutir oportunidades customizadas de patrocínio e exposição.
              </p>
              <Button
                size="lg"
                className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-dark-100 font-bold"
                onClick={() => window.location.href = 'mailto:contato@growthsummit.com.br?subject=Proposta de Patrocínio Personalizada'}
              >
                <Mail className="h-5 w-5 mr-2" />
                Solicitar Proposta Comercial
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-dark relative overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-20 bg-hero-gradient blur-[80px] animate-pulse" />
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-orange-coral/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-brand-orange-coral/5 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in-up">
          <div className="w-24 h-24 bg-brand-orange-coral/20 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12 shadow-glow-orange border border-brand-orange-coral/30">
            <Star className="h-12 w-12 text-brand-orange-coral animate-pulse" />
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Pronto para <span className="text-gradient">Transformar</span> seu Negócio?
          </h2>
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
            Não perca a oportunidade de participar do maior evento de negócios do Sertão do Pajeú.
            As vagas são limitadas!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <Button
              size="lg"
              className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-12 py-8 text-xl rounded-2xl shadow-glow-orange hover:shadow-glow hover:scale-105 transition-all duration-300 h-auto group"
              onClick={() => setModalInscricaoAberto(true)}
            >
              <Rocket className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
              INSCREVA-SE GRÁTIS
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/20 text-white hover:bg-white/10 px-12 py-8 text-xl rounded-2xl backdrop-blur-md hover:scale-105 transition-all h-auto"
              onClick={() => setModalInscricaoAberto(true)}
            >
              <Mic2 className="h-6 w-6 mr-3" />
              NIGHT EXPERIENCE
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400 text-sm font-bold uppercase tracking-widest">
            {[
              'Inscrição segura', 'Confirmação imediata', 'Suporte dedicado'
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-brand-orange-coral" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* App Download Section */}
      <AppDownloadSection />

      {/* Social Share */}
      <section className="py-12 bg-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Compartilhe com sua rede:</p>
            <SocialShare
              url={pageUrl}
              title="Growth Experience Triunfo-PE 2026"
              description="A Maior Exposição de Negócios do Sertão do Pajeú - 09/04/2026"
            />
          </div>
        </div>
      </section>
      <InnerFooter />

      {/* WhatsApp Button - Proposta para Stand */}
      <WhatsAppButton />
    </div>
  );
}
