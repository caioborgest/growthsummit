import { useState } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Target,
  Handshake,
  Lightbulb,
  Briefcase,
  Rocket,
  Mic2,
  Building2,
  GraduationCap,
  UserPlus,
  CheckCircle,
  ArrowRight,
  Coffee,
  Download,
  Smartphone,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InscricaoModal } from '@/components/forms/InscricaoModal';
import { StartupFormModal } from '@/components/forms/StartupFormModal';
import { B2BFormModal } from '@/components/forms/B2BFormModal';
import { SocialShare } from '@/components/social/SocialShare';
import { SEOHead } from '@/components/seo/SEOHead';
import { getStandImage, getPalestranteImage, placeholderStand, placeholderPalestrante, getStorageUrl } from '@/lib/storage';

const palestrantes = [
  {
    nome: "Leandro Batista",
    cargo: "CEO, Fitness Exclusive",
    descricao: "Maior rede de academias do interior do Nordeste",
    tema: "Crescimento Exponencial em Mercado Competitivo: Estratégias de Escala"
  },
  {
    nome: "Vanylton Matias",
    cargo: "CEO, Grupo Núcleo",
    descricao: "Reconhecido em gestão e inovação a nível nacional",
    tema: "Inovação Corporativa: Como Empresas se Mantêm Competitivos"
  }
];

const trilhas = [
  {
    icon: TrendingUp,
    nome: "Growth Marketing",
    descricao: "Funil de vendas, métricas críticas e implementação prática"
  },
  {
    icon: Target,
    nome: "Marketing Digital",
    descricao: "Content + performance, community management e cases locais"
  },
  {
    icon: Handshake,
    nome: "Vendas B2B",
    descricao: "Prospecção inteligente, automação e negociação"
  },
  {
    icon: Lightbulb,
    nome: "Inteligência Artificial",
    descricao: "IA prática para operações, ChatGPT aplicado e automação"
  },
  {
    icon: Briefcase,
    nome: "Gestão Financeira",
    descricao: "Fluxo de caixa, precificação e reforma tributária 2026"
  },
  {
    icon: Users,
    nome: "Liderança",
    descricao: "Gestão de equipe, delegação efetiva e cultura PME"
  }
];

const cotas = [
  {
    nome: "DIAMANTE",
    espaco: "10m x 10m - Camarote Lateral Palco",
    ingressos: 15,
    beneficios: [
      "Posição de destaque ao lado do palco",
      "Logo em 4 posições premium",
      "Menção abertura + encerramento",
      "Apresentação 5 min no palco",
      "Banner roll-up (design grátis)",
      "QR Code único + analytics",
      "Relatório ROI completo"
    ],
    destaque: true,
    vagas: 2
  },
  {
    nome: "OURO",
    espaco: "5m x 12m - Camarote Lateral",
    ingressos: 10,
    beneficios: [
      "Posição de entrada privilegiada",
      "Logo em 3 posições",
      "Menção abertura + encerramento",
      "Demo/talk 5 min no palco",
      "QR Code único",
      "Relatório leads + impressões"
    ],
    vagas: 3
  },
  {
    nome: "PRATA PLUS",
    espaco: "5m x 6m - Fundo Superior",
    ingressos: 6,
    beneficios: [
      "Posição lateral circulação",
      "Logo em 2 posições",
      "Menção encerramento",
      "Redes sociais 5+ posts",
      "Relatório básico"
    ],
    vagas: 5
  },
  {
    nome: "PRATA",
    espaco: "5m x 3m - Térreo Lateral",
    ingressos: 6,
    beneficios: [
      "Posição lateral térreo",
      "Logo em 2 posições",
      "Menção encerramento",
      "Redes sociais 5+ posts",
      "Relatório básico"
    ],
    vagas: 13
  },
  {
    nome: "BRONZE",
    espaco: "3m x 1,5m - Superior",
    ingressos: 3,
    beneficios: [
      "Logo em programa impresso",
      "3+ menções redes sociais",
      "A3 com logo impresso",
      "Acesso relatório final PDF"
    ],
    vagas: 4
  }
];

const programacaoDiurna = [
  { horario: "08:00-08:30", atividade: "Credenciamento + Boas-vindas" },
  { horario: "08:30-09:00", atividade: "Abertura Oficial + Briefing" },
  { horario: "09:00-10:20", atividade: "Workshops Trilhas (Growth, Marketing, Vendas, IA)" },
  { horario: "10:20-10:40", atividade: "Intervalo + Networking + EXPO" },
  { horario: "10:40-12:00", atividade: "Cursos Aprofundados (Gestão, Marketing, Liderança, IA)" },
  { horario: "12:00-12:30", atividade: "Encerramento Turno Matinal" },
  { horario: "12:30-14:00", atividade: "Almoço + Networking" },
  { horario: "14:00-15:30", atividade: "Mentorias 1:1 de Negócios" },
  { horario: "15:30-17:00", atividade: "Arena Pitch + Prêmios" },
  { horario: "17:00-17:30", atividade: "Fórum de Vagas de Emprego" }
];

const programacaoNoturna = [
  { horario: "19:00-19:50", atividade: "Palestra: Leandro Batista (Fitness Exclusive)" },
  { horario: "20:00-20:20", atividade: "Premiação Arena Pitch" },
  { horario: "20:30-21:00", atividade: "Break + Networking" },
  { horario: "21:10-22:30", atividade: "Palestra: Vanylton Matias (Grupo Núcleo)" },
  { horario: "22:30-23:00", atividade: "Encerramento + Agradecimentos" }
];

const publico = [
  { tipo: "Donos de PMEs", quantidade: "2.000-3.000", perfil: "3-50 funcionários" },
  { tipo: "Gestores", quantidade: "1.000-1.500", perfil: "Marketing, Vendas, Operações" },
  { tipo: "Profissionais", quantidade: "1.500-2.000", perfil: "Analistas e especialistas" },
  { tipo: "Empreendedores", quantidade: "1.000-1.500", perfil: "Startups em crescimento" },
  { tipo: "Estudantes", quantidade: "1.000-1.500", perfil: "Técnicos e universitários" }
];

function InnerHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-brand-yellow flex items-center justify-center">
              <span className="text-dark-100 font-bold text-lg">GS</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-tight block">Growth Summit</span>
              <span className="text-brand-yellow text-xs block">Triunfo-PE</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#sobre" className="text-sm font-medium text-gray-300 hover:text-brand-yellow transition-colors">Sobre</a>
            <a href="#mentorias" className="text-sm font-medium text-gray-300 hover:text-brand-yellow transition-colors">Mentorias</a>
            <a href="#palestrantes" className="text-sm font-medium text-gray-300 hover:text-brand-yellow transition-colors">Palestrantes</a>
            <a href="#programacao" className="text-sm font-medium text-gray-300 hover:text-brand-yellow transition-colors">Programação</a>
            <a href="#expositores" className="text-sm font-medium text-gray-300 hover:text-brand-yellow transition-colors">Exposição</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="hidden sm:flex border-brand-yellow text-brand-yellow hover:bg-brand-yellow/10" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-dark-100 border-b border-white/10 px-4 py-4 space-y-4">
          <a href="#sobre" className="block text-gray-300 hover:text-brand-yellow">Sobre</a>
          <a href="#mentorias" className="block text-gray-300 hover:text-brand-yellow">Mentorias</a>
          <a href="#palestrantes" className="block text-gray-300 hover:text-brand-yellow">Palestrantes</a>
          <a href="#programacao" className="block text-gray-300 hover:text-brand-yellow">Programação</a>
          <a href="#expositores" className="block text-gray-300 hover:text-brand-yellow">Exposição</a>
          <Button variant="outline" className="w-full border-brand-yellow text-brand-yellow hover:bg-brand-yellow/10" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      )}
    </header>
  );
}

function InnerFooter() {
  return (
    <footer className="bg-dark-100 pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-brand-yellow flex items-center justify-center">
                <span className="text-dark-100 font-bold text-lg">GS</span>
              </div>
              <span className="text-white font-bold text-xl">Growth Experience Triunfo</span>
            </div>
            <p className="text-gray-400 max-w-sm mb-6">
              A maior exposição de negócios do Sertão do Pajeú. Transformando empresas locais através de conhecimento prático e conexões reais.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Acesso Rápido</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#sobre" className="hover:text-brand-yellow">Sobre o Evento</a></li>
              <li><a href="#programacao" className="hover:text-brand-yellow">Programação</a></li>
              <li><a href="#palestrantes" className="hover:text-brand-yellow">Palestrantes</a></li>
              <li><a href="#expositores" className="hover:text-brand-yellow">Exposição</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contato</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Espaço Parque, Triunfo-PE</li>
              <li>contato@growthsummit.com.br</li>
              <li>(88) 98843-2310</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
          <p>© 2026 Growth Summit Triunfo-PE. Patrocinado por SEBRAE.</p>
        </div>
      </div>
    </footer>
  );
}

export function GrowthExperienceTriunfo() {
  const [modalAberto, setModalAberto] = useState<'palestra' | 'mentor' | 'cursos' | 'startup' | 'b2b' | null>(null);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://growthsummit.com.br/growth-experience-triunfo';

  return (
    <div className="bg-dark min-h-screen">
      <SEOHead
        title="Growth Experience Triunfo-PE 2026"
        description="09/04/2026 - A Maior Exposição de Negócios do Sertão do Pajeú. Capacitação, networking e oportunidades para PMEs."
        keywords="growth experience, triunfo pe, evento negócios, sebrae, empreendedorismo"
        url={pageUrl}
      />

      <InnerHeader />

      <InscricaoModal isOpen={modalAberto === 'palestra'} onClose={() => setModalAberto(null)} tipo="palestra" eventoNome="Growth Experience Triunfo-PE 2026" />
      <InscricaoModal isOpen={modalAberto === 'mentor'} onClose={() => setModalAberto(null)} tipo="mentor" eventoNome="Growth Experience Triunfo-PE 2026" />
      <InscricaoModal isOpen={modalAberto === 'cursos'} onClose={() => setModalAberto(null)} tipo="cursos" eventoNome="Growth Experience Triunfo-PE 2026" />
      <StartupFormModal isOpen={modalAberto === 'startup'} onClose={() => setModalAberto(null)} />
      <B2BFormModal isOpen={modalAberto === 'b2b'} onClose={() => setModalAberto(null)} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Imagem de Fundo real */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
            alt="Fundo Hero"
            className="w-full h-full object-cover opacity-30 shadow-inner"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-dark/80 to-dark" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-brand-yellow/20 text-brand-yellow border-brand-yellow/30 text-lg px-6 py-2">
              PATROCÍNIO: SEBRAE
            </Badge>
            <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 tracking-tight">
              Growth Experience
              <span className="block text-brand-yellow mt-2">Triunfo-PE 2026</span>
            </h1>
            <p className="text-2xl sm:text-3xl text-gray-300 mb-8 font-light italic">
              "A Maior Exposição de Negócios do Sertão do Pajeú"
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="glass-card p-4 border-brand-yellow/20">
                <Calendar className="h-6 w-6 text-brand-yellow mx-auto mb-2" />
                <p className="text-white font-bold">09 Abr 2026</p>
              </div>
              <div className="glass-card p-4 border-brand-yellow/20">
                <MapPin className="h-6 w-6 text-brand-yellow mx-auto mb-2" />
                <p className="text-white font-bold">Espaço Parque</p>
              </div>
              <div className="glass-card p-4 border-brand-yellow/20">
                <Users className="h-6 w-6 text-brand-yellow mx-auto mb-2" />
                <p className="text-white font-bold">5.000 Visitantes</p>
              </div>
              <div className="glass-card p-4 border-brand-yellow/20">
                <Clock className="h-6 w-6 text-brand-yellow mx-auto mb-2" />
                <p className="text-white font-bold">08:00 - 23:00</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-brand-yellow hover:bg-brand-yellow/90 text-dark-100 font-bold px-10 py-7 text-lg rounded-full shadow-lg shadow-brand-yellow/20" onClick={() => setModalAberto('cursos')}>
                <Rocket className="h-5 w-5 mr-3" />
                Inscrição Gratuita
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-10 py-7 text-lg rounded-full backdrop-blur-sm" onClick={() => (window.location.href = '#patrocinios')}>
                <Building2 className="h-5 w-5 mr-3" />
                Seja Expositor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre o Evento */}
      <section id="sobre" className="py-24 bg-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-brand-yellow/10 text-brand-yellow">O Evento</Badge>
              <h2 className="text-4xl font-bold text-white mb-6">Acelere seu Crescimento com quem faz na prática</h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                O Growth Experience Triunfo é um divisor de águas para o empreendedorismo regional. Reunimos especialistas, tecnologia e capital em um único dia de imersão total.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-blue flex items-center justify-center">
                    <TrendingUp className="text-brand-yellow" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Capacitação</h4>
                    <p className="text-sm text-gray-400">Trilhas práticas de marketing e vendas.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-blue flex items-center justify-center">
                    <Handshake className="text-brand-yellow" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Rodada B2B</h4>
                    <p className="text-sm text-gray-400">Conexões diretas com grandes marcas.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=2070&auto=format&fit=crop" className="rounded-2xl shadow-2xl" alt="Evento" />
              <div className="absolute -bottom-6 -left-6 glass-card p-6 border-brand-yellow/30 max-w-xs">
                <p className="text-brand-yellow font-bold text-3xl mb-1">29</p>
                <p className="text-white text-sm">Empresas expositoras confirmadas para 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mentorias 1:1 Section */}
      <section id="mentorias" className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-yellow/5 skew-x-12 translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <img
                src="https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=2071&auto=format&fit=crop"
                alt="Mentoria"
                className="rounded-3xl shadow-2xl border-2 border-white/5"
              />
              <div className="absolute top-4 right-4 bg-brand-yellow text-dark-100 px-4 py-2 rounded-full font-bold text-sm">Vagas Limitadas</div>
            </div>
            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30">Destaque</Badge>
              <h2 className="text-4xl font-bold text-white mb-6">Mentorias Individuais 1:1</h2>
              <p className="text-xl text-gray-400 mb-8">
                Já imaginou ter 20 minutos exclusivos com CEOs e gestores que faturam milhões? No Triunfo Experience, isso é possível.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 mr-3 text-brand-yellow" />
                  Diagnóstico real do seu negócio
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 mr-3 text-brand-yellow" />
                  Plano de ação imediato
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 mr-3 text-brand-yellow" />
                  Networking de alto nível
                </li>
              </ul>
              <Button size="lg" className="bg-brand-blue hover:bg-brand-blue/90 text-white px-8 rounded-xl h-14" onClick={() => setModalAberto('mentor')}>
                <UserPlus className="h-5 w-5 mr-3" />
                Solicitar Mentoria Especializada
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Palestrantes */}
      <section id="palestrantes" className="py-24 bg-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-brand-yellow/10 text-brand-yellow">Keynotes</Badge>
            <h2 className="text-4xl font-bold text-white">Protagonistas do Success</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {palestrantes.map((p, i) => (
              <Card key={i} className="glass-card p-10 border-white/5 hover:border-brand-yellow/30 transition-all group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-40 h-40 rounded-full overflow-hidden mb-6 border-4 border-brand-blue group-hover:border-brand-yellow transition-colors">
                    <img src={getPalestranteImage(p.nome)} alt={p.nome} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = placeholderPalestrante; }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{p.nome}</h3>
                  <p className="text-brand-yellow font-medium mb-4">{p.cargo}</p>
                  <p className="text-gray-400 text-sm italic mb-6">"{p.descricao}"</p>
                  <div className="w-full pt-6 border-t border-white/5">
                    <p className="text-xs text-brand-yellow uppercase tracking-widest mb-2 font-bold">Talk Masterclass:</p>
                    <p className="text-white font-medium">{p.tema}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programação Principal */}
      <section id="programacao" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Agenda Growth Triunfo</h2>
            <div className="w-20 h-1 bg-brand-yellow mx-auto rounded-full" />
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Diurna */}
            <Card className="glass-card p-8 border-white/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-brand-yellow/10 flex items-center justify-center">
                  <Coffee className="text-brand-yellow h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Experiência Diurna</h3>
                  <p className="text-brand-yellow text-sm font-bold uppercase tracking-wider">08:00 - 17:30 • Acesso Gratuito</p>
                </div>
              </div>
              <div className="space-y-6">
                {programacaoDiurna.map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <span className="text-brand-yellow font-mono font-bold min-w-[100px] text-lg">{item.horario}</span>
                    <div className="flex-1 pb-4 border-b border-white/5 group-last:border-0">
                      <p className="text-gray-200 font-medium">{item.atividade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            {/* Noturna */}
            <Card className="glass-card p-8 border-brand-yellow/30 bg-brand-yellow/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-brand-yellow flex items-center justify-center">
                  <Mic2 className="text-dark-100 h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Imersão Noturna</h3>
                  <p className="text-brand-yellow text-sm font-bold uppercase tracking-wider">19:00 - 23:00 • Ingressos R$ 179,99</p>
                </div>
              </div>
              <div className="space-y-6">
                {programacaoNoturna.map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <span className="text-brand-yellow font-mono font-bold min-w-[100px] text-lg">{item.horario}</span>
                    <div className="flex-1 pb-4 border-b border-white/5 group-last:border-0">
                      <p className="text-gray-200 font-medium">{item.atividade}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-brand-yellow text-dark-100 rounded-2xl font-bold text-center">
                Vagas Limitadas: Open Bar + Networking Premium
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Exposição section stands */}
      <section id="expositores" className="py-24 bg-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-brand-blue text-white">Stands & Oportunidades</Badge>
            <h2 className="text-4xl font-bold text-white mb-6">Exposição de Negócios</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Visite os 29 stands das maiores empresas da região e gere novas parcerias.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {cotas.slice(0, 3).map((cota, i) => (
              <Card key={i} className={`overflow-hidden glass-card transition-all ${cota.destaque ? 'border-brand-yellow/50 ring-2 ring-brand-yellow/20' : 'border-white/5'}`}>
                <div className="h-56 relative">
                  <img src={getStandImage(cota.nome)} alt={cota.nome} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = placeholderStand; }} />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-brand-yellow text-dark-100 font-bold">{cota.nome}</Badge>
                  </div>
                </div>
                <div className="p-8">
                  <h4 className="text-xl font-bold text-white mb-4">{cota.espaco}</h4>
                  <ul className="space-y-3 mb-8">
                    {cota.beneficios.slice(0, 4).map((b, j) => (
                      <li key={j} className="flex items-start text-sm text-gray-400">
                        <CheckCircle className="h-4 w-4 mr-3 text-brand-yellow flex-shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-brand-blue hover:bg-brand-blue/80 text-white rounded-xl">Quero este Espaço</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sessão para Baixar App (PWA) */}
      <section className="py-24 relative overflow-hidden bg-brand-yellow">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <Smartphone className="absolute -top-10 -left-10 w-96 h-96 rotate-12" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-dark-100">
              <h2 className="text-4xl font-black mb-6 leading-tight">Leve o Evento no seu Bolso</h2>
              <p className="text-xl font-medium mb-8">Baixe nosso app e tenha acesso à programação em tempo real, mapa de stands e agendamento de mentorias.</p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-dark-100 text-white hover:bg-dark-200 px-8 py-6 h-auto text-lg rounded-2xl">
                  <Smartphone className="mr-3" />
                  Instalar App (PWA)
                </Button>
                <div className="flex items-center gap-2 text-dark-100 font-bold">
                  <Badge className="bg-dark-100 text-white">IOS & Android</Badge>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-64 h-[500px] border-[8px] border-dark-100 rounded-[3rem] bg-dark overflow-hidden shadow-2xl">
                <div className="p-6">
                  <div className="w-12 h-12 bg-brand-yellow rounded-xl mb-4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="h-20 bg-white/5 rounded-xl border border-white/10" />
                    <div className="h-20 bg-white/5 rounded-xl border border-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social and Logomarcas */}
      <section className="py-20 bg-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gray-500 font-bold uppercase tracking-widest mb-10 text-xs">Apoio Institucional e Marcas Parceiras</p>
            <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <img src={getStorageUrl('event-images', 'logos/sebrae.png')} alt="Sebrae" className="h-12 object-contain" />
              <img src={getStorageUrl('event-images', 'logos/prefeitura-triunfo.png')} alt="Prefeitura" className="h-10 object-contain" />
              <img src={getStorageUrl('event-images', 'logos/governo-pe.png')} alt="Governo PE" className="h-12 object-contain" />
              <img src={getStorageUrl('event-images', 'logos/parceiro-4.png')} alt="Parceiro" className="h-10 object-contain" />
            </div>
          </div>
          <div className="max-w-2xl mx-auto">
            <SocialShare url={pageUrl} title="Growth Experience Triunfo-PE 2026" />
          </div>
        </div>
      </section>

      <InnerFooter />
    </div>
  );
}
