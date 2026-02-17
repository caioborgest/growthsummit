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
  Mail,
  Zap,
  Rocket
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
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/logomarca-GX-fundoescuro.png"
              alt="Growth Experience"
              className="h-14 w-auto"
              onError={(e) => {
                e.currentTarget.src = 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth_experience.png';
              }}
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-6">
            <a href="#sobre" className="text-sm font-medium text-gray-300 hover:text-brand-orange-coral transition-colors">Sobre</a>
            <a href="#programacao" className="text-sm font-medium text-gray-300 hover:text-brand-orange-coral transition-colors">Programação</a>
            <a href="#palestrantes" className="text-sm font-medium text-gray-300 hover:text-brand-orange-coral transition-colors">Palestrantes</a>
            <a href="#inscricoes" className="text-sm font-medium text-gray-300 hover:text-brand-orange-coral transition-colors">Inscrições</a>
            <a href="#patrocinios" className="text-sm font-medium text-gray-300 hover:text-brand-orange-coral transition-colors">Seja Expositor</a>
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
        <div className="lg:hidden bg-dark-100 border-b border-white/10 px-4 py-4 space-y-4">
          <a href="#sobre" className="block text-gray-300 hover:text-brand-orange-coral" onClick={() => setIsMobileMenuOpen(false)}>Sobre</a>
          <a href="#programacao" className="block text-gray-300 hover:text-brand-orange-coral" onClick={() => setIsMobileMenuOpen(false)}>Programação</a>
          <a href="#palestrantes" className="block text-gray-300 hover:text-brand-orange-coral" onClick={() => setIsMobileMenuOpen(false)}>Palestrantes</a>
          <a href="#inscricoes" className="block text-gray-300 hover:text-brand-orange-coral" onClick={() => setIsMobileMenuOpen(false)}>Inscrições</a>
          <a href="#patrocinios" className="block text-gray-300 hover:text-brand-orange-coral" onClick={() => setIsMobileMenuOpen(false)}>Seja Expositor</a>
          <Button variant="outline" className="w-full border-brand-orange-coral text-brand-orange-coral hover:bg-brand-orange-coral/10" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
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
  const [modalAberto, setModalAberto] = useState<'mentor' | 'startup' | 'b2b' | 'palestra' | null>(null);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://growthsummit.com.br/growth-experience-triunfo';

  return (
    <div className="bg-dark min-h-screen">
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
      <InscricaoModal isOpen={modalAberto === 'mentor'} onClose={() => setModalAberto(null)} tipo="mentor" eventoNome="Growth Experience Triunfo-PE 2026" />
      <InscricaoModal isOpen={modalAberto === 'palestra'} onClose={() => setModalAberto(null)} tipo="palestra" eventoNome="Growth Experience Triunfo-PE 2026" />
      {/* Cursos e Palestras agora usam o MultiStep acima */}
      <StartupFormModal isOpen={modalAberto === 'startup'} onClose={() => setModalAberto(null)} />
      <B2BFormModal isOpen={modalAberto === 'b2b'} onClose={() => setModalAberto(null)} />

      {/* Hero Section Refinada */}
      <HeroSectionRefined onCTAClick={() => setModalInscricaoAberto(true)} />

      {/* Stats Section Refinada */}
      <StatsSection />

      {/* Sobre o Evento */}
      <section id="sobre" className="py-24 bg-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30">
                O Evento
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Acelere seu Crescimento com quem faz na prática
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                O Growth Experience Triunfo é um divisor de águas para o empreendedorismo regional. Reunimos especialistas, tecnologia e capital em um único dia de imersão total para transformar pequenas e médias empresas do Sertão do Pajeú.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-brand-blue flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-brand-orange-coral" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1 text-lg">Capacitação</h4>
                    <p className="text-sm text-gray-400">Trilhas práticas de marketing, vendas e IA</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-brand-blue flex items-center justify-center">
                    <Handshake className="h-7 w-7 text-brand-orange-coral" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1 text-lg">Rodada B2B</h4>
                    <p className="text-sm text-gray-400">Conexões diretas com grandes marcas</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-brand-blue flex items-center justify-center">
                    <Award className="h-7 w-7 text-brand-orange-coral" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1 text-lg">Arena Pitch</h4>
                    <p className="text-sm text-gray-400">Prêmios de até R$ 2.000 + mentorias</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-brand-blue flex items-center justify-center">
                    <Zap className="h-7 w-7 text-brand-orange-coral" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1 text-lg">10 Experiências</h4>
                    <p className="text-sm text-gray-400">Circuito contínuo de aprendizado</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=2070&auto=format&fit=crop"
                className="rounded-2xl shadow-2xl border-2 border-white/10"
                alt="Evento de Negócios"
              />
              <div className="absolute -bottom-6 -left-6 glass-card p-6 border-brand-orange-coral/30 max-w-xs shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="h-8 w-8 text-brand-orange-coral" />
                  <p className="text-brand-orange-coral font-bold text-4xl">29</p>
                </div>
                <p className="text-white font-semibold">Empresas expositoras confirmadas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Palestrantes */}
      <section id="palestrantes" className="py-24 bg-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30">
              Keynotes
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Protagonistas do Sucesso</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Aprenda com quem está transformando o mercado nacional
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
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

          <div className="text-center">
            <Button
              size="lg"
              className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-dark-100 font-bold px-10 py-7 text-lg rounded-xl shadow-lg"
              onClick={() => setModalInscricaoAberto(true)}
            >
              <Mic2 className="h-5 w-5 mr-3" />
              Garantir Ingresso - R$ 179,99
            </Button>
            <p className="text-gray-400 mt-4 text-sm">
              Acesso exclusivo às palestras noturnas + premiação + networking
            </p>
          </div>
        </div>
      </section>

      {/* Programação Completa */}
      <ProgramacaoCompleta onInscrever={() => setModalInscricaoAberto(true)} />

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
          icon={UserPlus}
          titulo="Mentorias Individuais 1:1"
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

        <InscricaoSection
          id="arena-pitch"
          icon={Award}
          titulo="Arena Pitch - Competição de Startups"
          subtitulo="Apresente sua startup e concorra a prêmios"
          descricao="20 startups selecionadas terão 5 minutos para apresentar seus pitches para investidores e empreendedores. As 3 melhores recebem premiação em dinheiro e mentorias."
          beneficios={[
            "Pitch de 5 minutos + 2 minutos de perguntas",
            "Avaliação por júri especializado",
            "Visibilidade para investidores e parceiros",
            "Networking com ecossistema de inovação",
            "Feedback detalhado dos jurados"
          ]}
          premios={[
            { posicao: "1º Lugar", premio: "R$ 2.000 + 3 meses de mentoria" },
            { posicao: "2º Lugar", premio: "R$ 1.500 + consultoria básica" },
            { posicao: "3º Lugar", premio: "R$ 700 + consultoria básica" }
          ]}
          gratuito
          vagasLimitadas
          horario="15:30 - 17:00"
          capacidade="20 startups selecionadas"
          onInscrever={() => setModalAberto('startup')}
          imagemUrl="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074&auto=format&fit=crop"
        />

        <InscricaoSection
          id="rodada-b2b"
          icon={Handshake}
          titulo="Rodada de Negócios B2B"
          subtitulo="Conexões estratégicas para seu negócio"
          descricao="Empresas regionais apresentam vagas de emprego e oportunidades de parceria. Ideal para quem busca fornecedores, clientes ou colaboradores qualificados."
          beneficios={[
            "Acesso a 30-50 vagas de emprego",
            "Networking com empresas da região",
            "Possibilidade de entrevistas no local",
            "Conexões B2B para parcerias",
            "Apresentação de portfólio empresarial"
          ]}
          gratuito
          horario="17:00 - 17:30"
          capacidade="Aberto a todos os participantes"
          onInscrever={() => setModalAberto('b2b')}
          imagemUrl="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2074&auto=format&fit=crop"
        />
      </div>

      {/* Patrocínios */}
      <section id="patrocinios" className="py-24 bg-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30">
              Oportunidades de Exposição
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Seja um Expositor
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Posicione sua marca na frente de mais de 2.000 empreendedores e gestores do Sertão do Pajeú
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
      <section className="py-24 bg-gradient-to-br from-brand-orange-coral/10 via-dark to-brand-blue/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNGgydjJoLTJ2LTJ6bTAgNGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Star className="h-16 w-16 text-brand-orange-coral mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Pronto para Transformar seu Negócio?
          </h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Não perca a oportunidade de participar do maior evento de negócios do Sertão do Pajeú.
            Inscreva-se agora e garanta sua vaga!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              size="lg"
              className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-dark-100 font-bold px-12 py-8 text-xl rounded-2xl shadow-2xl shadow-brand-orange-coral/30 hover:scale-105 transition-all"
              onClick={() => setModalInscricaoAberto(true)}
            >
              <Rocket className="h-6 w-6 mr-3" />
              Fazer Inscrição Gratuita
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-8 text-xl rounded-2xl backdrop-blur-sm hover:scale-105 transition-all"
              onClick={() => setModalInscricaoAberto(true)}
            >
              <Mic2 className="h-6 w-6 mr-3" />
              Palestras Noturnas - R$ 179,99
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-brand-orange-coral" />
              <span>Inscrição segura</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-brand-orange-coral" />
              <span>Confirmação imediata</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-brand-orange-coral" />
              <span>Suporte dedicado</span>
            </div>
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
