import { useState } from 'react';
import {
  Crown,
  Coffee,
  Users,
  Video,
  Gift,
  MessageCircle,
  Check,
  Star,
  ArrowRight,
  MapPin,
  Calendar,
  TrendingUp,
  Zap,
  BrainCircuit,
  Target,
  Megaphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { EdicaoAnteriorVideo } from '@/components/growth-experience/EdicaoAnteriorVideo';
import { WhatsAppButton } from '@/components/growth-experience/WhatsAppButton';
import { NewsletterSection } from '@/components/app/NewsletterSection';
import { EVENT_CONFIG } from '@/config/eventConfig';

const benefits = [
  {
    icon: Coffee,
    title: "Coffee com Palestrantes",
    description: "Café da manhã exclusivo com os speakers âncoras do evento"
  },
  {
    icon: Users,
    title: "2 Mentorias 1:1 Premium",
    description: "Sessões individuais com os mentores mais experientes"
  },
  {
    icon: MessageCircle,
    title: "Grupo VIP WhatsApp",
    description: "Networking exclusivo com os 30 participantes do programa"
  },
  {
    icon: Video,
    title: "Gravações 30 Dias",
    description: "Acesso a todas as gravações do evento por 30 dias"
  },
  {
    icon: Gift,
    title: "Kit Premium",
    description: "Kit exclusivo com produtos de alta qualidade"
  },
  {
    icon: Star,
    title: "Follow-up 3 Meses",
    description: "Acompanhamento estruturado após o evento"
  },
];

const schedule = [
  { time: "17:00", activity: "Credenciamento e Exposição de Marcas" },
  { time: "18:00", activity: "Palestra Magna: Jerônimo Freire" },
  { time: "19:00", activity: "Talk Show: Bastidores de Negócios" },
  { time: "20:30", activity: "Networking VIP & Coffee Break" },
  { time: "21:10", activity: "Palestra Magna: Vanylton Matias" },
  { time: "22:30", activity: "Encerramento e Networking Final" },
];

const TriumphSpeakers = [
  {
    name: "Jerônimo Freire",
    role: "Consultor e Mentor de Negócios",
    image: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/jeronimo-freire.jpeg?format=webp"
  },
  {
    name: "Leandro Batista",
    role: "CEO Fitness Exclusive",
    image: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/leandro-batista.jpeg"
  },
  {
    name: "Carolinne Castro",
    role: "Advogada Empresarial",
    image: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/carolinne-castro.jpeg?format=webp"
  },
  {
    name: "João Daniel",
    role: "CEO Cedan Rações",
    image: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/joao-daniel.png"
  },
  {
    name: "Vanylton Matias",
    role: "CEO do Grupo Núcleo",
    image: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/vanylton-matias.png"
  }
];

const PetrolinaSpeakers = [
  {
    name: "Caio Borges",
    role: "Especialista em Growth e IA",
    image: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/profiles/fff7192a-3479-4d82-b896-4b05fe081c6f-1774627071551.png"
  },
  {
    name: "Leandro Batista",
    role: "CEO Rede de Academias",
    image: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/leandro-batista.jpeg"
  }
];

export function GrowthExperience() {
  const navigate = useNavigate();
  const [showEventSelector, setShowEventSelector] = useState(false);

  const handleEventChoose = (slug: string) => {
    navigate(`/${slug}`, { state: { selectedTicket: 'vip' } });
  };
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-orange-500/10 text-orange-400 border-orange-500/30 px-4 py-1 text-sm font-bold uppercase tracking-widest">
              Imersão de Alto Impacto
            </Badge>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
              Domine <span className="text-orange-500">Growth</span>, Marketing, <br />
              Vendas e <span className="text-teal-400">IA Generativa</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-400 mb-12 leading-relaxed">
              Estratégias avançadas para empresas que buscam <span className="text-white font-bold">alavancar o crescimento</span> e acelerar a <span className="text-white font-bold">expansão de negócios</span> no interior.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-16 px-2">
              <div className="flex items-center gap-2 sm:gap-3 text-gray-300">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="font-medium text-sm sm:text-base">Growth Estrutural</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-gray-300">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-400">
                  <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="font-medium text-sm sm:text-base">Inteligência Artificial</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-gray-300">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="font-medium text-sm sm:text-base">Vendas Consultivas</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                className="bg-orange-500 hover:bg-orange-600 text-white font-black px-10 h-16 rounded-2xl text-lg shadow-xl shadow-orange-500/20 transition-all hover:scale-105"
              >
                <a href="#edicoes">
                  CONHECER AS EDIÇÕES 2026
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-dark-300 text-gray-300 hover:text-white px-10 h-16 rounded-2xl font-bold"
                asChild
              >
                <a href={`https://wa.me/${EVENT_CONFIG.whatsapp.number}?text=${encodeURIComponent(EVENT_CONFIG.whatsapp.message)}`} target="_blank" rel="noopener noreferrer">
                  Falar com consultor
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Edition Triunfo */}
      <section id="edicoes" className="py-20 bg-dark-200/50 border-y border-white/5 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24 bg-gradient-to-br from-orange-500/5 to-transparent p-8 lg:p-12 rounded-[2.5rem] border border-orange-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <Badge className="bg-orange-500 text-white font-black px-4 py-1 text-xs">VAGAS LIMITADAS</Badge>
            </div>
            <div className="space-y-8">
              <div>
                <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">EDIÇÃO PRINCIPAL</Badge>
                <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                  Growth Experience <br /><span className="text-orange-500">Triunfo-PE</span>
                </h2>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 text-gray-300 bg-dark-100 px-4 py-2 rounded-xl border border-dark-300">
                    <Calendar className="h-4 w-4 text-orange-400" />
                    <span className="font-bold">16 de Abril, 2026</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 bg-dark-100 px-4 py-2 rounded-xl border border-dark-300">
                    <MapPin className="h-4 w-4 text-orange-400" />
                    <span className="font-bold">Sertão do Pajeú</span>
                  </div>
                </div>
                <p className="text-lg text-gray-400 leading-relaxed mb-8">
                  A nossa edição flagship no coração da serra. Uma imersão exclusiva das <span className="text-white">17h às 23h</span>, focada em <span className="text-white">estratégias de escala para varejo, agro e serviços no interior</span>. Networking de altíssimo nível com empresários convidados.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-3 w-3 text-orange-400" />
                  </div>
                  <p className="text-gray-300"><span className="text-white font-bold">Mentoria 1:1</span> com profissionais</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-3 w-3 text-orange-400" />
                  </div>
                  <p className="text-gray-300"><span className="text-white font-bold">Circuitos de conhecimento:</span> Cursos, Oficinas e Palestras de IA focada em negócios</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-3 w-3 text-orange-400" />
                  </div>
                  <p className="text-gray-300"><span className="text-white font-bold">Exposição</span> de negócios e marcas</p>
                </div>
              </div>

              {/* Speakers Triunfo */}
              <div className="pt-6 border-t border-white/5">
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Speakers Confirmados</p>
                <div className="flex flex-wrap gap-6 mb-8">
                  {TriumphSpeakers.map((speaker, i) => (
                    <div key={i} className="flex items-center gap-3 bg-dark-100/50 p-2 pr-4 rounded-2xl border border-white/5">
                      <img
                        src={speaker.image}
                        alt={speaker.name}
                        className="w-12 h-12 rounded-xl object-cover border border-orange-500/20"
                      />
                      <div>
                        <p className="text-white font-bold text-sm leading-tight">{speaker.name}</p>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider">{speaker.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                asChild
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black px-6 sm:px-12 h-16 rounded-2xl text-base sm:text-lg transition-transform hover:scale-105"
              >
                <Link to="/triunfo">
                  QUERO PARTICIPAR EM TRIUNFO
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-[2rem] bg-dark-100 border border-dark-300 overflow-hidden relative group">
                <img
                  src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/caretas-triunfo/caretas-triunfo.jpeg"
                  alt="Experiência Triunfo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-white font-black text-2xl mb-1">Experiência Triunfo</p>
                  <p className="text-gray-400 text-sm italic">"Onde a estratégia encontra a execução no interior"</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl animate-pulse" />
            </div>
          </div>

          {/* Secondary Edition Petrolina */}
          <div className="grid lg:grid-cols-2 gap-16 items-center bg-gradient-to-br from-teal-500/5 to-transparent p-8 lg:p-12 rounded-[2.5rem] border border-teal-500/10">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-[4/5] rounded-[2rem] bg-dark-100 border border-dark-300 overflow-hidden relative group">
                <img
                  src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/caretas-triunfo/petrolina.jpeg"
                  alt="Experiência Petrolina"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-white font-black text-2xl mb-1">Experiência Petrolina</p>
                  <p className="text-gray-400 text-sm italic">"Inovação e Tech no Vale do São Francisco"</p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">EDIÇÃO VALE</Badge>
                <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                  Growth Experience <br /><span className="text-teal-400">Petrolina-PE</span>
                </h2>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 text-gray-300 bg-dark-100 px-4 py-2 rounded-xl border border-dark-300">
                    <Calendar className="h-4 w-4 text-teal-400" />
                    <span className="font-bold">30 de Abril, 2026</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 bg-dark-100 px-4 py-2 rounded-xl border border-dark-300">
                    <MapPin className="h-4 w-4 text-teal-400" />
                    <span className="font-bold">Vale do São Francisco</span>
                  </div>
                </div>
                <p className="text-lg text-gray-400 leading-relaxed mb-8">
                  Focado no ecossistema de <span className="text-white">tecnologia, agrotech e exportação</span>. Aprenda como aplicar Inteligência Artificial para ganhar eficiência global e escalar sua empresa além das fronteiras.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-3 w-3 text-teal-400" />
                  </div>
                  <p className="text-gray-300"><span className="text-white font-bold">Imersão em Growth, Marketing, Vendas e IA</span> para negócios</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-3 w-3 text-teal-400" />
                  </div>
                  <p className="text-gray-300"><span className="text-white font-bold">Networking B2B</span> com empresários de destaque</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-3 w-3 text-teal-400" />
                  </div>
                  <p className="text-gray-300"><span className="text-white font-bold">Mentoria Estratégica</span> focada em resultados e performance</p>
                </div>
              </div>

              {/* Speakers Petrolina */}
              <div className="pt-6 border-t border-white/5">
                <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-4">Speakers Confirmados</p>
                <div className="flex flex-wrap gap-6 mb-8">
                  {PetrolinaSpeakers.map((speaker, i) => (
                    <div key={i} className="flex items-center gap-3 bg-dark-100/50 p-2 pr-4 rounded-2xl border border-white/5">
                      <img
                        src={speaker.image}
                        alt={speaker.name}
                        className="w-12 h-12 rounded-xl object-cover border border-teal-500/20"
                      />
                      <div>
                        <p className="text-white font-bold text-sm leading-tight">{speaker.name}</p>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider">{speaker.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                asChild
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-black px-6 sm:px-12 h-16 rounded-2xl text-base sm:text-lg transition-transform hover:scale-105"
              >
                <Link to="/petrolina">
                  CONHECER EDIÇÃO PETROLINA
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section - 4 Pillars of Growth */}
      <section className="py-24 bg-dark relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">METODOLOGIA EXCLUSIVA</Badge>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">4 Pilares de <span className="text-orange-500">Expansão</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">Dominamos as frentes fundamentais que permitem a empresas tradicionais escalarem no mundo digital através de inteligência e processos.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Growth Strategy",
                desc: "Análise de funil, hacking de processos e experimentos baseados em dados para escala."
              },
              {
                icon: Megaphone,
                title: "Premium Marketing",
                desc: "Posicionamento estratégico para atrair clientes de alto valor e branding de autoridade."
              },
              {
                icon: Target,
                title: "Vendas Predictivas",
                desc: "Implementação de máquinas de vendas, CRM avançado e fechamento consultivo."
              },
              {
                icon: BrainCircuit,
                title: "Inteligência Artificial",
                desc: "Adoção de LLMs e automação inteligente para produtividade extrema e vantagem competitiva."
              }
            ].map((pillar, i) => (
              <div key={i} className="glass-card p-8 border-white/5 hover:border-orange-500/20 transition-all group hover:-translate-y-2 duration-300">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <pillar.icon className="h-7 w-7 text-orange-400 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{pillar.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 lg:py-32 bg-dark-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 text-balance">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              A ENTREGA
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              Acelerando seus <span className="text-teal-400">Resultados</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Muito além de um evento, uma jornada de transformação empresarial desenhada para líderes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="glass-card p-6">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-20 lg:py-28 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
                Programação
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Uma experiência exclusiva
              </h2>
              <p className="text-gray-400 mb-8">
                O Growth Experience inclui acesso VIP a todas as atividades do evento,
                além de momentos exclusivos projetados para maximizar seu aprendizado
                e networking.
              </p>

              <ul className="space-y-4">
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 mr-3 text-orange-400 flex-shrink-0" />
                  Acesso prioritário às salas
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 mr-3 text-orange-400 flex-shrink-0" />
                  Coffee breaks especiais
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 mr-3 text-orange-400 flex-shrink-0" />
                  Crachá dourado exclusivo
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 mr-3 text-orange-400 flex-shrink-0" />
                  Certificado especial assinado
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 mr-3 text-orange-400 flex-shrink-0" />
                  Desconto 50% edição 2027
                </li>
              </ul>
            </div>

            <div className="glass-card p-8">
              <h3 className="text-xl font-semibold text-white mb-6">
                Agenda VIP - Dia 1
              </h3>
              <div className="space-y-4">
                {schedule.map((item, i) => (
                  <div key={i} className="flex items-center">
                    <span className="text-orange-400 font-mono w-16">{item.time}</span>
                    <span className="text-gray-300">{item.activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Comparação
            </Badge>
            <h2 className="text-3xl font-bold text-white">
              Growth Experience vs Outros Passes
            </h2>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-dark-300">
                    <th className="text-left p-4 text-gray-400 font-medium whitespace-nowrap">Benefício</th>
                    <th className="text-center p-4 text-gray-400 font-medium whitespace-nowrap">Standard</th>
                    <th className="text-center p-4 text-gray-400 font-medium whitespace-nowrap">Pro</th>
                    <th className="text-center p-4 text-teal-400 font-medium whitespace-nowrap">VIP</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { benefit: "Acesso ao evento", std: "✓", pro: "✓", vip: "✓" },
                    { benefit: "Coffee breaks", std: "✓", pro: "✓", vip: "✓" },
                    { benefit: "Almoço", std: "—", pro: "✓", vip: "VIP" },
                    { benefit: "Mentorias", std: "1 (sorteio)", pro: "2", vip: "2 premium" },
                    { benefit: "Grupo VIP", std: "—", pro: "—", vip: "✓" },
                    { benefit: "Coffee com speakers", std: "—", pro: "—", vip: "✓" },
                    { benefit: "Follow-up", std: "—", pro: "—", vip: "3 meses" },
                    { benefit: "Gravações", std: "—", pro: "30 dias", vip: "30 dias" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-dark-300 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-gray-300 font-medium whitespace-nowrap">{row.benefit}</td>
                      <td className="p-4 text-center text-gray-500">{row.std}</td>
                      <td className="p-4 text-center text-gray-500">{row.pro}</td>
                      <td className="p-4 text-center text-teal-400 font-bold">{row.vip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Edição Anterior — Juazeiro do Norte 2025 */}
      <EdicaoAnteriorVideo showTriunfoTeaser={false} />

      {/* Expansion Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden bg-dark-200/50 border-y border-white/5">
        <div className="absolute top-0 left-0 w-full h-full bg-orange-500/5 blur-[120px] rounded-full -translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-card p-5 sm:p-10 lg:p-20 border-white/5 bg-gradient-to-br from-white/5 to-transparent flex flex-col lg:flex-row items-center gap-8 lg:gap-16 rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden">
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-6 bg-orange-500/10 text-orange-400 border-orange-500/30 px-6 py-2 uppercase font-black tracking-widest">
                Expansão & Parceria
              </Badge>
              <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white mb-6 uppercase tracking-tight leading-[1.2] px-1 sm:px-2">
                Leve este <span className="text-orange-500">Impacto</span> para sua cidade
              </h2>
              <p className="text-sm sm:text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl px-2 sm:px-4">
                Nossa missão é democratizar as estratégias de Growth e IA para o interior do país. Seja o parceiro que levará esta transformação para sua região em 2026/2027.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-10 text-left px-2 sm:px-4">
                {[
                  { title: "Metodologia Provada", desc: "Processo estruturado de escala para negócios regionais." },
                  { title: "Impacto Local Real", desc: "Transformação do ecossistema e networking de alto nível." },
                  { title: "Modelo de Parceria", desc: "Suporte total da nossa equipe na organização e curadoria." },
                  { title: "Novas Fronteiras", desc: "Oportunidade de posicionamento como líder regional." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4 group">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-brand-orange-coral/10 border border-brand-orange-coral/20 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-orange-coral group-hover:text-white transition-all">
                      <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-brand-orange-coral group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm sm:text-lg mb-0.5">{item.title}</h4>
                      <p className="text-[10px] sm:text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                asChild
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black px-6 sm:px-12 h-16 sm:h-18 rounded-2xl text-base sm:text-xl transition-all hover:scale-105 shadow-2xl shadow-orange-500/20"
              >
                <a
                  href="https://wa.me/5588988432310?text=Olá! Falamos da [Nome da Cidade]. Temos interesse em levar o Growth Experience para nossa região."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar com nosso Time de Expansão
                  <ArrowRight className="ml-3 h-5 w-5 sm:h-6 sm:w-6" />
                </a>
              </Button>
            </div>

            <div className="lg:w-2/5 relative">
              <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/10 group shadow-2xl">
                <img
                  src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/espaco/gxexperience-noite.png"
                  alt="Expansão Growth Experience"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10">
                  <Badge className="bg-orange-500 text-white mb-4">CIDADES 2026/27</Badge>
                  <p className="text-white font-black text-2xl uppercase leading-tight mb-2">Seja nosso próximo destino</p>
                  <p className="text-gray-400 text-sm">Parcerias para o Nordeste e além.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-teal-500/10" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-8">
            <Crown className="h-10 w-10 text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Garanta sua vaga VIP
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Apenas 30 vagas disponíveis. Não perca essa oportunidade única de
            imersão em growth com os melhores do mercado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
              onClick={() => setShowEventSelector(true)}
            >
              <Crown className="h-5 w-5 mr-2" />
              Quero ser VIP
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-dark-300 text-gray-300 hover:text-white"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Falar com consultor
            </Button>
          </div>

          <p className="text-gray-500 text-sm mt-6">
            Dúvidas? Ligue para {EVENT_CONFIG.whatsapp.display} ou envie email para {EVENT_CONFIG.email}
          </p>
        </div>
      </section>

      <WhatsAppButton />

      {/* Event Selection Modal */}
      <Dialog open={showEventSelector} onOpenChange={setShowEventSelector}>
        <DialogContent className="bg-dark-100 border-white/10 text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Onde você participará?</DialogTitle>
            <DialogDescription className="text-gray-400">
              Escolha a cidade da sua imersão Growth Experience 2026.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <button
              onClick={() => handleEventChoose('triunfo')}
              className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm sm:text-base">Triunfo-PE</h4>
                <p className="text-xs text-gray-400">16 de Abril - Edição Flagship</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-orange-500 opacity-0 group-hover:opacity-100 transition-all" />
            </button>

            <button
              onClick={() => handleEventChoose('petrolina')}
              className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm sm:text-base">Petrolina-PE</h4>
                <p className="text-xs text-gray-400">30 de Abril - Edição Vale</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-teal-500 opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GrowthExperience;
