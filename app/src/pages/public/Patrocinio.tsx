import { 
  Gem, 
  TrendingUp, 
  Users, 
  Eye,
  Check,
  ArrowRight,
  Star,
  Award,
  Medal
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const sponsorshipLevels = [
  {
    name: "Diamante",
    price: "R$ 60.000",
    icon: Gem,
    color: "from-blue-400 to-blue-600",
    features: [
      "Naming rights do evento",
      "Palestra de 20 minutos",
      "Stand premium 6x4m",
      "10 ingressos VIP",
      "Logo em todos materiais",
      "Mailing list participantes",
      "Entrevista no palco",
      "Posts dedicados nas redes",
    ],
    slots: 1,
  },
  {
    name: "Ouro",
    price: "R$ 30.000",
    icon: Award,
    color: "from-yellow-400 to-yellow-600",
    features: [
      "Stand 4x3m",
      "6 ingressos VIP",
      "Logo em materiais principais",
      "Mencão nas palestras",
      "Posts nas redes sociais",
      "Banner no palco",
    ],
    slots: 3,
  },
  {
    name: "Prata",
    price: "R$ 15.000",
    icon: Medal,
    color: "from-gray-300 to-gray-500",
    features: [
      "Mesa de exposição",
      "4 ingressos",
      "Logo no site e app",
      "Mencão em posts",
      "Material no kit",
    ],
    slots: 5,
  },
  {
    name: "Bronze",
    price: "R$ 10.000",
    icon: Star,
    color: "from-orange-400 to-orange-600",
    features: [
      "2 ingressos",
      "Logo no site",
      "Mencão em posts",
    ],
    slots: 10,
  },
];

const benefits = [
  {
    icon: Eye,
    title: "Visibilidade",
    description: "Exposição para 700+ participantes qualificados"
  },
  {
    icon: Users,
    title: "Networking",
    description: "Conecte-se com decisores e líderes do mercado"
  },
  {
    icon: TrendingUp,
    title: "Geração de Leads",
    description: "Capture contatos de potenciais clientes"
  },
];

export function Patrocinio() {
  return (
    <div className="bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Patrocínio
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Seja Patrocinador
            </h1>
            <p className="text-xl text-gray-400">
              Conecte sua marca com o ecossistema de growth e inovação do Nordeste
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-teal-400">700+</p>
              <p className="text-gray-400 text-sm">Participantes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-teal-400">85%</p>
              <p className="text-gray-400 text-sm">Decisores</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-teal-400">15k+</p>
              <p className="text-gray-400 text-sm">Alcance digital</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-teal-400">50+</p>
              <p className="text-gray-400 text-sm">Empresas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
              Por que Patrocinar
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Benefícios exclusivos
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="glass-card p-8 text-center">
                <div className="w-16 h-16 rounded-xl bg-teal-500/20 flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-8 w-8 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 lg:py-28 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Cotas
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Escolha sua cota
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sponsorshipLevels.map((level) => (
              <div
                key={level.name}
                className="glass-card p-6 hover:border-teal-500/30 transition-all"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center mb-4`}>
                  <level.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1">{level.name}</h3>
                <p className="text-2xl font-bold text-teal-400 mb-4">{level.price}</p>
                
                <p className="text-gray-500 text-sm mb-4">
                  {level.slots} {level.slots === 1 ? 'vaga' : 'vagas'} disponíveis
                </p>
                
                <ul className="space-y-2 mb-6">
                  {level.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-300">
                      <Check className="h-4 w-4 mr-2 text-teal-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  variant="outline"
                  className="w-full border-dark-300 text-gray-300 hover:text-white hover:border-teal-500"
                >
                  Saiba mais
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-orange-500/10" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Vamos conversar?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Entre em contato para receber nosso media kit completo e 
            montar uma proposta personalizada para sua empresa.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Solicitar proposta
            </Button>
            <a 
              href="mailto:parcerias@growthsummit.com.br"
              className="text-gray-400 hover:text-teal-400 transition-colors"
            >
              parcerias@growthsummit.com.br
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
