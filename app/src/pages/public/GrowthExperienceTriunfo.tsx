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
  Menu,
  X,
  Camera,
  DollarSign,
  Zap,
  ShoppingBag,
  Bot,
  Megaphone,
  FileText,
  Award,
  Star,
  Phone,
  Mail,
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
import { getStandImage, getPalestranteImage, placeholderPalestrante, getStorageUrl } from '@/lib/storage';
import { ProgramacaoTabs } from '@/components/growth-experience/ProgramacaoTabs';
import { InscricaoSection } from '@/components/growth-experience/InscricaoSection';
import { PatrocinioCard } from '@/components/growth-experience/PatrocinioCard';

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

const programacao = {
  manha: {
    bloco1: {
      horario: "08:30-10:00",
      titulo: "Bloco 1 - Fundamentos do Crescimento",
      salao: {
        capacidade: 80,
        titulo: "Mapa de Crescimento para MPEs do Sertão do Pajeú",
        tipo: "Palestra de Abertura",
        topicos: [
          "Principais desafios: gestão, vendas e caixa",
          "Oportunidades locais e tendências PE",
          "Como organizar prioridades com poucos recursos"
        ]
      },
      salas: [
        {
          numero: 1,
          capacidade: 20,
          titulo: "Gestão simples de caixa, estoque e preço",
          tipo: "Oficina de Gestão",
          topicos: [
            "Fluxo de caixa em planilha/app simples",
            "Definição de preço que gera lucro",
            "Erros comuns em estoque"
          ]
        },
        {
          numero: 2,
          capacidade: 20,
          titulo: "Posicionamento e ofertas para virar referência",
          tipo: "Workshop de Marketing",
          topicos: [
            "Definir nicho e proposta de valor",
            "Construção de ofertas (combo, recorrência)",
            "Casos práticos do interior"
          ]
        },
        {
          numero: 3,
          capacidade: 20,
          titulo: "Atendimento que vende: roteiro de abordagem",
          tipo: "Oficina de Vendas",
          topicos: [
            "Passos de uma conversa de vendas eficaz",
            "Como perguntar sem ser invasivo",
            "Técnicas simples de fechamento"
          ]
        }
      ]
    },
    circulacao1: {
      horario: "10:00-10:15",
      atividade: "Café + Networking + Visita aos Stands"
    },
    bloco2: {
      horario: "10:15-11:45",
      titulo: "Bloco 2 - Digital e WhatsApp",
      salao: {
        capacidade: 80,
        titulo: "Como usar o digital e WhatsApp para vender mais",
        tipo: "Palestra + Painel",
        topicos: [
          "Funil simples: atração → conversa → fechamento",
          "Painel com 2 empresários locais",
          "Estratégias práticas que funcionam"
        ]
      },
      salas: [
        {
          numero: 1,
          capacidade: 20,
          titulo: "Listas de transmissão e status que geram venda",
          tipo: "Oficina WhatsApp",
          topicos: [
            "Organizar listas (clientes, leads, VIP)",
            "Modelos de mensagens para ofertas",
            "Como não ser spam e vender todo dia"
          ]
        },
        {
          numero: 2,
          capacidade: 20,
          titulo: "Instagram e Reels para negócios locais",
          tipo: "Workshop Redes Sociais",
          topicos: [
            "Conteúdo que traz clientes para a porta",
            "Rotina semanal em 30 min/dia",
            "Como medir resultado (alcance, directs)"
          ]
        },
        {
          numero: 3,
          capacidade: 20,
          titulo: "Primeiros passos com IA no pequeno negócio",
          tipo: "Oficina IA Aplicada",
          topicos: [
            "IA no dia a dia das MPEs",
            "Criar posts, textos e respostas",
            "Demonstração com prompts prontos"
          ]
        }
      ]
    },
    encerramento: {
      horario: "11:45-12:00",
      atividade: "Recado geral + Chamada para trilhas da tarde"
    }
  },
  tarde: {
    bloco3: {
      horario: "14:00-15:30",
      titulo: "Bloco 3 - Planejamento Estratégico",
      salao: {
        capacidade: 80,
        titulo: "Do improviso ao plano: estratégia para 12 meses",
        tipo: "Palestra Estratégica",
        topicos: [
          "Por que MPE quebra por falta de planejamento",
          "Definindo metas: faturamento, margem, clientes",
          "Como tirar 3 prioridades claras"
        ]
      },
      salas: [
        {
          numero: 1,
          capacidade: 20,
          titulo: "Plano de ação em uma página",
          tipo: "Oficina de Planejamento",
          topicos: [
            "Canvas simples: metas, ações, prazos",
            "Como revisar o plano todo mês",
            "Cada participante sai com 1 plano pronto"
          ]
        },
        {
          numero: 2,
          capacidade: 20,
          titulo: "Vendendo para empresas e prefeituras",
          tipo: "Workshop B2B/B2G",
          topicos: [
            "Diferença entre B2C e B2B",
            "Como abordar grandes clientes",
            "Proposta simples e profissional"
          ]
        },
        {
          numero: 3,
          capacidade: 20,
          titulo: "Automatizando tarefas chatas com IA",
          tipo: "Oficina IA Produtividade",
          topicos: [
            "IA para contratos, planilhas, roteiros",
            "IA como assistente para dono de MPE",
            "Checklist de tarefas automatizáveis"
          ]
        }
      ]
    },
    circulacao2: {
      horario: "15:30-15:45",
      atividade: "Networking orientado + Conexões de negócio"
    },
    bloco4: {
      horario: "15:45-17:15",
      titulo: "Bloco 4 - Casos Reais de Sucesso",
      salao: {
        capacidade: 80,
        titulo: "Histórias de crescimento no Sertão",
        tipo: "Talk Show",
        topicos: [
          "3 empresários da região (comércio, serviços, agro)",
          "Perguntas guiadas sobre gestão e tecnologia",
          "Espaço para perguntas da plateia"
        ]
      },
      salas: [
        {
          numero: 1,
          capacidade: 20,
          titulo: "Do primeiro contato ao pós-venda",
          tipo: "Oficina Experiência do Cliente",
          topicos: [
            "Jornada do cliente em negócios locais",
            "Como pedir indicação sem ser chato",
            "Ferramentas de pesquisa de satisfação"
          ]
        },
        {
          numero: 2,
          capacidade: 20,
          titulo: "Organizando finanças para acessar crédito",
          tipo: "Workshop Finanças",
          topicos: [
            "Separar dinheiro da empresa e família",
            "Preparação para crédito (documentos)",
            "Quando faz sentido pegar crédito"
          ]
        },
        {
          numero: 3,
          capacidade: 20,
          titulo: "Transformando problemas em oportunidades",
          tipo: "Oficina Inovação",
          topicos: [
            "Mapeamento de dores locais",
            "Brainstorm de soluções e novos produtos",
            "Como testar uma ideia gastando pouco"
          ]
        }
      ]
    },
    encerramento: {
      horario: "17:15-17:30",
      atividade: "Síntese dos aprendizados + Chamado à ação"
    }
  }
};

const programacaoNoturna = [
  { horario: "19:00-19:50", atividade: "Palestra: Leandro Batista (Fitness Exclusive)" },
  { horario: "20:00-20:20", atividade: "Premiação Arena Pitch" },
  { horario: "20:30-21:00", atividade: "Break + Networking" },
  { horario: "21:10-22:30", atividade: "Palestra: Vanylton Matias (Grupo Núcleo)" },
  { horario: "22:30-23:00", atividade: "Encerramento + Agradecimentos" }
];

const circuitoExperiencias = [
  {
    icon: Briefcase,
    nome: "Espaço SEBRAE",
    subtitulo: "Consultório de Negócios",
    parceiro: "SEBRAE",
    formato: "2 mesas paralelas, atendimentos de 15 min",
    capacidade: "32 pessoas/hora",
    totalDia: "~250 atendimentos/dia",
    temas: ["MEI e formalização", "Gestão e marketing", "Vendas e crédito", "Orientações rápidas"],
    cor: "blue"
  },
  {
    icon: GraduationCap,
    nome: "Espaço SENAC",
    subtitulo: "Carreira e Profissão",
    parceiro: "SENAC",
    formato: "Atendimento 1:1 + minioficinas a cada 30 min",
    capacidade: "20-25 pessoas/hora",
    totalDia: "~160-200 participações/dia",
    temas: ["Escolha de cursos e trilhas", "Profissões em alta", "Posicionamento no mercado", "Itinerários formativos"],
    cor: "purple"
  },
  {
    icon: DollarSign,
    nome: "Espaço SICOOB",
    subtitulo: "Dinheiro e Cooperativismo",
    parceiro: "SICOOB",
    formato: "Balcão de orientação + minitalks de 15 min",
    capacidade: "10-15 atendimentos/hora + 20 nas talks",
    totalDia: "~200-250 participações/dia",
    temas: ["Conta PJ", "Crédito consciente", "Cooperativismo financeiro", "Educação financeira"],
    cor: "green"
  },
  {
    icon: Megaphone,
    nome: "Diagnóstico Marketing Digital",
    subtitulo: "Consultoria Express",
    parceiro: "Growth Summit",
    formato: "3 consultores, atendimentos de 10 min",
    capacidade: "18 atendimentos/hora",
    totalDia: "~140-150 atendimentos/dia",
    temas: ["Análise Instagram", "Google Meu Negócio", "WhatsApp Business", "Checklist 3 ações/7 dias"],
    cor: "orange"
  },
  {
    icon: Target,
    nome: "Clínica de Vendas",
    subtitulo: "Atendimento 1:1",
    parceiro: "Growth Summit",
    formato: "2 consultores, sessões de 10-15 min",
    capacidade: "16-20 atendimentos/hora",
    totalDia: "~120-150 participações/dia",
    temas: ["Script de abordagem", "Objeções", "Fechamento", "Pós-venda"],
    cor: "red"
  },
  {
    icon: FileText,
    nome: "Orientação Emprego",
    subtitulo: "Currículo e Entrevista",
    parceiro: "SENAC + Parceiros",
    formato: "2 mesas: currículo + entrevista, 10 min cada",
    capacidade: "12 atendimentos/hora",
    totalDia: "~90-100 participações/dia",
    temas: ["Análise de currículo", "Dicas de entrevista", "Postura profissional", "Recolocação"],
    cor: "indigo"
  },
  {
    icon: Camera,
    nome: "Totem Instagramável",
    subtitulo: "Growth Experience",
    parceiro: "Growth Summit",
    formato: "Cenário + ring light + staff",
    capacidade: "40-50 fotos/hora",
    totalDia: "~300-400 participações/dia",
    temas: ["Fotos profissionais", "QR para redes sociais", "Grupo exclusivo", "Download de materiais"],
    cor: "pink"
  },
  {
    icon: ShoppingBag,
    nome: "Degustações Locais",
    subtitulo: "Produtos do Sertão",
    parceiro: "Produtores Locais",
    formato: "3 mesas temáticas rotativas",
    capacidade: "180-240 pessoas/hora",
    totalDia: "~800-1.000 participações/dia",
    temas: ["Alimentos regionais", "Bebidas artesanais", "Artesanato local", "QR das marcas"],
    cor: "yellow"
  },
  {
    icon: Bot,
    nome: "IA na Prática para MPE",
    subtitulo: "Demos ao Vivo",
    parceiro: "Growth Summit",
    formato: "Mini-demos de 10 min, grupos de 10-15, a cada 20 min",
    capacidade: "30-45 pessoas/hora",
    totalDia: "~250-300 participações/dia",
    temas: ["Criar posts", "Resposta a clientes", "Descrição de produtos", "Script de cobrança"],
    cor: "cyan"
  },
  {
    icon: Award,
    nome: "Arena de Pitches",
    subtitulo: "Histórias de Negócio",
    parceiro: "SEBRAE + SENAC",
    formato: "Histórias de 5 min, rodadas a cada 30 min",
    capacidade: "30-50 pessoas por rodada",
    totalDia: "~250-400 participações (8-10 rodadas)",
    temas: ["Cases de sucesso", "Pitches de startups", "Histórias inspiradoras", "Networking aberto"],
    cor: "amber"
  }
];

const momentosAncora = {
  manha: [
    { horario: "9h00", atividade: "Abertura oficial + convite para o circuito", local: "Palco Central" },
    { horario: "10h30", atividade: "Minipalestra: Educação Financeira", local: "Espaço SICOOB" },
    { horario: "11h00", atividade: "Histórias de Negócio", local: "Arena de Pitches" }
  ],
  tarde: [
    { horario: "14h15", atividade: "Tira-dúvidas de MEI", local: "Espaço SEBRAE" },
    { horario: "15h30", atividade: "Talk: Profissões em alta no Sertão do Pajeú", local: "Espaço SENAC" },
    { horario: "16h30", atividade: "Sessão especial: IA + Vendas na prática", local: "Espaço IA + Clínica" }
  ]
};

// Header Component
function InnerHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-orange-coral to-brand-blue flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">GE</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-tight block">Growth Experience</span>
              <span className="text-brand-orange-coral text-xs block">Triunfo-PE 2026</span>
            </div>
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
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-orange-coral to-brand-blue flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">GE</span>
              </div>
              <span className="text-white font-bold text-xl">Growth Experience Triunfo</span>
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
  const [modalAberto, setModalAberto] = useState<'palestra' | 'mentor' | 'cursos' | 'startup' | 'b2b' | null>(null);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://growthsummit.com.br/growth-experience-triunfo';
  const backgroundImage = getStorageUrl('caretas-triunfo', 'caretas-triunfo.png');

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
      <InscricaoModal isOpen={modalAberto === 'palestra'} onClose={() => setModalAberto(null)} tipo="palestra" eventoNome="Growth Experience Triunfo-PE 2026" />
      <InscricaoModal isOpen={modalAberto === 'mentor'} onClose={() => setModalAberto(null)} tipo="mentor" eventoNome="Growth Experience Triunfo-PE 2026" />
      <InscricaoModal isOpen={modalAberto === 'cursos'} onClose={() => setModalAberto(null)} tipo="cursos" eventoNome="Growth Experience Triunfo-PE 2026" />
      <StartupFormModal isOpen={modalAberto === 'startup'} onClose={() => setModalAberto(null)} />
      <B2BFormModal isOpen={modalAberto === 'b2b'} onClose={() => setModalAberto(null)} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={backgroundImage}
            alt="Growth Experience Triunfo"
            className="w-full h-full object-cover opacity-20"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=2070&auto=format&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/90 to-dark" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-5xl mx-auto">
            <Badge className="mb-6 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 text-lg px-8 py-3 animate-pulse">
              PATROCÍNIO: SEBRAE
            </Badge>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
              Growth Experience
              <span className="block text-brand-orange-coral mt-2 bg-gradient-to-r from-brand-orange-coral to-yellow-500 bg-clip-text text-transparent">
                Triunfo-PE 2026
              </span>
            </h1>

            <p className="text-2xl sm:text-3xl lg:text-4xl text-gray-300 mb-12 font-light italic">
              "A Maior Exposição de Negócios do Sertão do Pajeú"
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
              <Card className="glass-card p-6 border-brand-orange-coral/20 hover:border-brand-orange-coral/50 transition-all">
                <Calendar className="h-8 w-8 text-brand-orange-coral mx-auto mb-3" />
                <p className="text-white font-bold text-lg">09 de Abril</p>
                <p className="text-gray-400 text-sm">2026</p>
              </Card>
              <Card className="glass-card p-6 border-brand-orange-coral/20 hover:border-brand-orange-coral/50 transition-all">
                <MapPin className="h-8 w-8 text-brand-orange-coral mx-auto mb-3" />
                <p className="text-white font-bold text-lg">Espaço Parque</p>
                <p className="text-gray-400 text-sm">Triunfo-PE</p>
              </Card>
              <Card className="glass-card p-6 border-brand-orange-coral/20 hover:border-brand-orange-coral/50 transition-all">
                <Users className="h-8 w-8 text-brand-orange-coral mx-auto mb-3" />
                <p className="text-white font-bold text-lg">2.000+</p>
                <p className="text-gray-400 text-sm">participantes</p>
              </Card>
              <Card className="glass-card p-6 border-brand-orange-coral/20 hover:border-brand-orange-coral/50 transition-all">
                <Clock className="h-8 w-8 text-brand-orange-coral mx-auto mb-3" />
                <p className="text-white font-bold text-lg">08:00-23:00</p>
                <p className="text-gray-400 text-sm">horário</p>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-dark-100 font-bold px-12 py-8 text-xl rounded-2xl shadow-2xl shadow-brand-orange-coral/30 hover:scale-105 transition-all group"
                onClick={() => setModalAberto('cursos')}
              >
                <Rocket className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
                Inscrição Gratuita
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-8 text-xl rounded-2xl backdrop-blur-sm hover:scale-105 transition-all"
                onClick={() => (window.location.href = '#patrocinios')}
              >
                <Building2 className="h-6 w-6 mr-3" />
                Seja Expositor
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-brand-orange-coral rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-brand-orange-coral rounded-full" />
          </div>
        </div>
      </section>

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
              <Card key={i} className="glass-card p-10 border-white/5 hover:border-brand-orange-coral/30 transition-all group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-48 h-48 rounded-full overflow-hidden mb-6 border-4 border-brand-blue group-hover:border-brand-orange-coral transition-colors shadow-xl">
                    <img
                      src={getPalestranteImage(p.nome)}
                      alt={p.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = placeholderPalestrante; }}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{p.nome}</h3>
                  <p className="text-brand-orange-coral font-semibold mb-3">{p.cargo}</p>
                  <p className="text-gray-400 text-sm italic mb-6">"{p.descricao}"</p>

                  <div className="w-full pt-6 border-t border-white/5">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-brand-orange-coral" />
                      <p className="text-gray-400 text-sm">{p.horario}</p>
                    </div>
                    <p className="text-xs text-brand-orange-coral uppercase tracking-widest mb-2 font-bold">
                      Talk Masterclass:
                    </p>
                    <p className="text-white font-medium leading-relaxed">{p.tema}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-dark-100 font-bold px-10 py-7 text-lg rounded-xl shadow-lg"
              onClick={() => setModalAberto('palestra')}
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

      {/* Programação */}
      <section id="programacao" className="py-24 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30">
              Programação Completa
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Um Dia Inteiro de Transformação
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Escolha sua trilha e aproveite ao máximo cada momento do evento
            </p>
          </div>

          <ProgramacaoTabs
            programacaoManha={programacao.manha}
            programacaoTarde={programacao.tarde}
            programacaoNoturna={programacaoNoturna}
            circuitoExperiencias={circuitoExperiencias}
            momentosAncora={momentosAncora}
          />
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
          onInscrever={() => setModalAberto('cursos')}
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
              onClick={() => setModalAberto('cursos')}
            >
              <Rocket className="h-6 w-6 mr-3" />
              Fazer Inscrição Gratuita
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-8 text-xl rounded-2xl backdrop-blur-sm hover:scale-105 transition-all"
              onClick={() => setModalAberto('palestra')}
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
    </div>
  );
}
