import { useState } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Award,
  Briefcase,
  Lightbulb,
  Target,
  Rocket,
  CheckCircle,
  ArrowRight,
  Building2,
  GraduationCap,
  Handshake,
  Mic2,
  Coffee,
  Star,
  UserPlus
} from 'lucide-react';
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

export function GrowthExperienceTriunfo() {
  const [modalAberto, setModalAberto] = useState<'palestra' | 'mentor' | 'cursos' | 'startup' | 'b2b' | null>(null);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://growthsummit.com.br/growth-experience-triunfo';

  return (
    <div className="bg-dark min-h-screen">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Growth Experience Triunfo-PE 2026"
        description="09/04/2026 - A Maior Exposição de Negócios do Sertão do Pajeú. Capacitação, networking e oportunidades para PMEs. Palestras com Leandro Batista e Vanylton Matias. Inscrições abertas!"
        keywords="growth experience, triunfo pe, evento negócios, sebrae, empreendedorismo, pme, sertão do pajeú"
        url={pageUrl}
      />

      {/* Modais de Inscrição */}
      <InscricaoModal
        isOpen={modalAberto === 'palestra'}
        onClose={() => setModalAberto(null)}
        tipo="palestra"
        eventoNome="Growth Experience Triunfo-PE 2026"
      />
      <InscricaoModal
        isOpen={modalAberto === 'mentor'}
        onClose={() => setModalAberto(null)}
        tipo="mentor"
        eventoNome="Growth Experience Triunfo-PE 2026"
      />
      <InscricaoModal
        isOpen={modalAberto === 'cursos'}
        onClose={() => setModalAberto(null)}
        tipo="cursos"
        eventoNome="Growth Experience Triunfo-PE 2026"
      />
      <StartupFormModal
        isOpen={modalAberto === 'startup'}
        onClose={() => setModalAberto(null)}
      />
      <B2BFormModal
        isOpen={modalAberto === 'b2b'}
        onClose={() => setModalAberto(null)}
      />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-dark to-teal-500/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-orange-500/10 text-orange-400 border-orange-500/30 text-lg px-4 py-2">
              Patrocinado por SEBRAE
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6">
              Growth Experience
              <span className="block text-orange-400 mt-2">Triunfo-PE</span>
            </h1>

            <p className="text-2xl sm:text-3xl text-gray-300 mb-4 font-semibold">
              "A Maior Exposição de Negócios do Sertão do Pajeú"
            </p>

            <p className="text-xl text-gray-400 mb-8">
              Crescimento Sem Limites para Pequenas e Médias Empresas do Interior
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
              <div className="glass-card px-6 py-4">
                <Calendar className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Data</p>
                <p className="text-xl font-bold text-white">09 de Abril 2026</p>
              </div>

              <div className="glass-card px-6 py-4">
                <MapPin className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Local</p>
                <p className="text-xl font-bold text-white">Espaço Parque</p>
              </div>

              <div className="glass-card px-6 py-4">
                <Users className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Público</p>
                <p className="text-xl font-bold text-white">4.000-5.000</p>
              </div>

              <div className="glass-card px-6 py-4">
                <Clock className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Horário</p>
                <p className="text-xl font-bold text-white">08:00-23:00</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                onClick={() => setModalAberto('cursos')}
              >
                <Rocket className="h-5 w-5 mr-2" />
                Inscreva-se Gratuitamente
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'click_patrocinio', {
                      event_category: 'Growth Experience Triunfo',
                      event_label: 'Hero CTA',
                    });
                  }
                  window.location.href = '#patrocinios';
                }}
              >
                <Building2 className="h-5 w-5 mr-2" />
                Seja Patrocinador
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre o Evento */}
      <section className="py-20 lg:py-28 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Sobre o Evento
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Transformando o Ecossistema Empresarial do Pajeú
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Um evento híbrido de impacto que conecta empreendedores, gestores, profissionais
              e grandes marcas, gerando negócios, aprendizado e oportunidades NO MESMO DIA.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass-card p-6">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Capacitação Prática</h3>
              <p className="text-gray-400">
                4-6 trilhas simultâneas com workshops e cursos aprofundados em Growth, Marketing,
                Vendas, IA, Gestão e Liderança
              </p>
            </Card>

            <Card className="glass-card p-6">
              <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center mb-4">
                <Handshake className="h-6 w-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Networking & Negócios</h3>
              <p className="text-gray-400">
                50+ conexões B2B, mentorias 1:1 com especialistas e oportunidades de parcerias
                estratégicas
              </p>
            </Card>

            <Card className="glass-card p-6">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Oportunidades de Emprego</h3>
              <p className="text-gray-400">
                30-50 vagas divulgadas por empresas regionais, com possibilidade de entrevistas
                rápidas no local
              </p>
            </Card>

            <Card className="glass-card p-6">
              <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Arena Pitch</h3>
              <p className="text-gray-400">
                20 startups competindo por prêmios de até R$ 2.000 + mentorias por 3 meses
              </p>
            </Card>

            <Card className="glass-card p-6">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                <Mic2 className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Palestras Noturnas</h3>
              <p className="text-gray-400">
                Leandro Batista (Fitness Exclusive) e Vanylton Matias (Grupo Núcleo) ao vivo
              </p>
            </Card>

            <Card className="glass-card p-6">
              <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Exposição de Negócios</h3>
              <p className="text-gray-400">
                29 stands de empresas e marcas regionais para networking e oportunidades
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Palestrantes */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
              Palestrantes
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Aprenda com os Melhores
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {palestrantes.map((palestrante, i) => (
              <Card key={i} className="glass-card p-8">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-orange-500/30">
                    <img
                      src={getPalestranteImage(palestrante.nome)}
                      alt={palestrante.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = placeholderPalestrante;
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{palestrante.nome}</h3>
                    <p className="text-orange-400 font-semibold mb-1">{palestrante.cargo}</p>
                    <p className="text-gray-400 text-sm">{palestrante.descricao}</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-dark-200/50 rounded-lg border border-dark-300">
                  <p className="text-sm text-gray-400 mb-2">Tema da Palestra:</p>
                  <p className="text-white font-medium">{palestrante.tema}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trilhas de Conhecimento */}
      <section className="py-20 lg:py-28 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Trilhas de Conhecimento
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Workshops e Cursos Aprofundados
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Escolha entre 6 trilhas de capacitação prática para impulsionar seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trilhas.map((trilha, i) => (
              <Card key={i} className="glass-card p-6 hover:border-orange-500/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-teal-500/20 flex items-center justify-center mb-4">
                  <trilha.icon className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{trilha.nome}</h3>
                <p className="text-gray-400">{trilha.descricao}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programação */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
              Programação
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Agenda Completa do Evento
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Programação Diurna */}
            <Card className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <Coffee className="h-6 w-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Turno Diurno</h3>
                  <p className="text-teal-400 font-semibold">08:00 - 17:30 • GRATUITO</p>
                </div>
              </div>

              <div className="space-y-4">
                {programacaoDiurna.map((item, i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b border-dark-300 last:border-0">
                    <span className="text-orange-400 font-mono font-semibold min-w-[120px]">
                      {item.horario}
                    </span>
                    <span className="text-gray-300">{item.atividade}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Programação Noturna */}
            <Card className="glass-card p-8 border-orange-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Mic2 className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Turno Noturno</h3>
                  <p className="text-orange-400 font-semibold">19:00 - 23:00 • R$ 179,99</p>
                </div>
              </div>

              <div className="space-y-4">
                {programacaoNoturna.map((item, i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b border-dark-300 last:border-0">
                    <span className="text-orange-400 font-mono font-semibold min-w-[120px]">
                      {item.horario}
                    </span>
                    <span className="text-gray-300">{item.atividade}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                <p className="text-sm text-orange-400 font-semibold">
                  ⭐ Inclui acesso às palestras exclusivas + networking + open bar
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
      {/* Exposição de Negócios */}
      <section className="py-20 bg-dark relative overflow-hidden" id="expositores">
        {/* Background decorativo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500 via-transparent to-teal-500" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header da Seção */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-orange-500/20 to-teal-500/20 text-orange-400 border-orange-500/30 text-base px-4 py-2">
              Networking e Negócios
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-white">A Maior </span>
              <span className="bg-gradient-to-r from-orange-400 to-teal-400 bg-clip-text text-transparent">
                Exposição de Negócios
              </span>
            </h2>
            <p className="text-2xl sm:text-3xl text-gray-300 font-semibold mb-2">
              do Sertão do Pajeú
            </p>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Conecte-se com as principais empresas, startups e empreendedores da região
            </p>
          </div>

          {/* Stats da Exposição */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-6 w-6 text-orange-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">50+</p>
              <p className="text-gray-400 text-sm">Expositores</p>
            </div>
            <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-3">
                <Rocket className="h-6 w-6 text-teal-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">20</p>
              <p className="text-gray-400 text-sm">Startups</p>
            </div>
            <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                <Handshake className="h-6 w-6 text-orange-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">100+</p>
              <p className="text-gray-400 text-sm">Oportunidades B2B</p>
            </div>
            <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-teal-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">5.000+</p>
              <p className="text-gray-400 text-sm">Visitantes</p>
            </div>
          </div>

          {/* Patrocinadores Principais */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Patrocinadores Principais
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* SEBRAE */}
              <div className="glass-card p-6 flex items-center justify-center hover:scale-105 transition-all duration-300 hover:border-orange-500/50 group">
                <img
                  src={getStorageUrl('event-images', 'logos/sebrae.png')}
                  alt="SEBRAE"
                  className="max-h-20 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"%3E%3Crect fill="%23374151" width="200" height="80"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="16" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ESEBRAE%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Prefeitura de Triunfo */}
              <div className="glass-card p-6 flex items-center justify-center hover:scale-105 transition-all duration-300 hover:border-teal-500/50 group">
                <img
                  src={getStorageUrl('event-images', 'logos/prefeitura-triunfo.png')}
                  alt="Prefeitura de Triunfo"
                  className="max-h-20 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"%3E%3Crect fill="%23374151" width="200" height="80"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="12" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EPrefeitura%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Governo de Pernambuco */}
              <div className="glass-card p-6 flex items-center justify-center hover:scale-105 transition-all duration-300 hover:border-orange-500/50 group">
                <img
                  src={getStorageUrl('event-images', 'logos/governo-pe.png')}
                  alt="Governo de Pernambuco"
                  className="max-h-20 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"%3E%3Crect fill="%23374151" width="200" height="80"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="12" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EGoverno PE%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Parceiro 4 */}
              <div className="glass-card p-6 flex items-center justify-center hover:scale-105 transition-all duration-300 hover:border-teal-500/50 group">
                <img
                  src={getStorageUrl('event-images', 'logos/parceiro-4.png')}
                  alt="Parceiro"
                  className="max-h-20 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"%3E%3Crect fill="%23374151" width="200" height="80"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EParceiro%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            </div>
          </div>

          {/* CTA para Ser Expositor */}
          <div className="mt-16 text-center">
            <div className="glass-card p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Quer expor seu negócio?
              </h3>
              <p className="text-gray-400 mb-6">
                Garanta seu espaço na maior exposição de negócios do Sertão do Pajeú e conecte-se com milhares de potenciais clientes e parceiros.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/60 transition-all duration-300 hover:scale-105"
                  onClick={() => window.location.href = '#patrocinios'}
                >
                  <Building2 className="h-5 w-5 mr-2" />
                  Seja um Expositor
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-teal-500 text-teal-400 hover:bg-teal-500/20 hover:border-teal-400 px-8 py-6 text-lg font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  onClick={() => window.open('https://wa.me/5588988432310?text=Olá! Gostaria de informações sobre como ser expositor no Growth Experience Triunfo-PE', '_blank')}
                >
                  <Handshake className="h-5 w-5 mr-2" />
                  Falar com Organizador
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Público-Alvo */}
      <section className="py-20 lg:py-28 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Público-Alvo
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Para Quem é Este Evento?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publico.map((item, i) => (
              <Card key={i} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{item.tipo}</h3>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    {item.quantidade}
                  </Badge>
                </div>
                <p className="text-gray-400">{item.perfil}</p>
              </Card>
            ))}

            <Card className="glass-card p-6 lg:col-span-3 bg-gradient-to-r from-orange-500/10 to-teal-500/10 border-orange-500/30">
              <div className="text-center">
                <Users className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Meta Total: 4.000-5.000 Participantes
                </h3>
                <p className="text-gray-300">
                  O maior evento de capacitação e negócios do Sertão do Pajeú
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Cotas de Patrocínio */}
      <section id="patrocinios" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
              Patrocínios
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Seja Nosso Parceiro
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Conecte sua marca com milhares de empreendedores e gestores da região
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {cotas.map((cota, i) => (
              <Card
                key={i}
                className={`glass-card p-8 ${cota.destaque ? 'border-orange-500 lg:scale-105' : ''}`}
              >
                {cota.destaque && (
                  <Badge className="mb-4 bg-orange-500 text-white">
                    Mais Popular
                  </Badge>
                )}

                <h3 className="text-2xl font-bold text-white mb-4">{cota.nome}</h3>

                {/* Imagem do Stand */}
                <div className="mb-6 rounded-lg overflow-hidden border-2 border-dark-300 hover:border-orange-500/50 transition-colors">
                  <img
                    src={getStandImage(cota.nome)}
                    alt={`Stand ${cota.nome}`}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = placeholderStand;
                    }}
                  />
                </div>

                <div className="mb-6 p-4 bg-dark-200/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Espaço do Stand</p>
                  <p className="text-white font-semibold">{cota.espaco}</p>
                  <p className="text-sm text-teal-400 mt-2">
                    {cota.ingressos} ingressos palestra noite (R$ 179,99 cada)
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {cota.vagas} {cota.vagas === 1 ? 'espaço disponível' : 'espaços disponíveis'}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {cota.beneficios.map((beneficio, j) => (
                    <li key={j} className="flex items-start gap-2 text-gray-300">
                      <CheckCircle className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{beneficio}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${cota.destaque ? 'bg-orange-500 hover:bg-orange-600' : 'bg-dark-300 hover:bg-dark-400'}`}
                >
                  Quero Patrocinar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compartilhamento Social */}
      <section className="py-20 lg:py-28 bg-dark-200/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SocialShare
            url={pageUrl}
            title="Growth Experience Triunfo-PE 2026 - A Maior Exposição de Negócios do Sertão do Pajeú"
            description="09/04/2026 - Capacitação, networking e oportunidades para PMEs. Palestras com Leandro Batista e Vanylton Matias. Inscrições abertas!"
          />
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-teal-500/10" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-8">
            <Rocket className="h-10 w-10 text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Não Perca Esta Oportunidade
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Inscreva-se gratuitamente para o turno diurno ou garanta seu ingresso
            para as palestras noturnas exclusivas
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              size="lg"
              className="bg-teal-500 hover:bg-teal-600 text-white px-8"
              onClick={() => setModalAberto('cursos')}
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              Inscrição Gratuita (Diurno)
            </Button>
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
              onClick={() => setModalAberto('palestra')}
            >
              <Mic2 className="h-5 w-5 mr-2" />
              Ingresso Noturno - R$ 179,99
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-teal-500 text-teal-400 hover:bg-teal-500/10"
              onClick={() => setModalAberto('mentor')}
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Seja Mentor 1:1
            </Button>
          </div>

          <div className="glass-card p-6 max-w-2xl mx-auto">
            <p className="text-gray-300 mb-4">
              <strong className="text-white">Data:</strong> 09 de Abril de 2026 (quinta-feira)
            </p>
            <p className="text-gray-300 mb-4">
              <strong className="text-white">Local:</strong> Espaço Parque, Triunfo-PE
            </p>
            <p className="text-gray-300">
              <strong className="text-white">Patrocínio:</strong> SEBRAE
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
