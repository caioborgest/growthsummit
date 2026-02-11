import { 
  Rocket, 
  Users, 
  Check,
  ArrowRight,
  Building2,
  Presentation
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const benefits = [
  "Exposição para 700+ participantes",
  "Pitch para investidores",
  "Captura de leads integrada",
  "Mentorias exclusivas",
  "Networking com founders",
  "Visibilidade no evento",
];

const packages = [
  {
    name: "Expo",
    price: 1500,
    description: "Stand no corredor de exposição",
    features: [
      "Mesa e 2 cadeiras",
      "Tomada e internet",
      "2 ingressos evento",
      "Perfil no diretório",
      "Captura de leads",
    ],
  },
  {
    name: "Pitch",
    price: 2500,
    description: "Pitch de 5 min + Expo",
    features: [
      "Tudo do Expo",
      "Pitch de 5 minutos",
      "Acesso à sala de investidores",
      "4 ingressos evento",
      "Destaque no app",
      "Video do pitch",
    ],
    popular: true,
  },
];

export function Startups() {
  return (
    <div className="bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Startups
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Startup Expo & Pitch
            </h1>
            <p className="text-xl text-gray-400">
              Exponha sua startup, pitch para investidores e conecte-se com o ecossistema
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-teal-400">15</p>
              <p className="text-gray-400 text-sm">Startups</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-teal-400">700+</p>
              <p className="text-gray-400 text-sm">Participantes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-teal-400">10+</p>
              <p className="text-gray-400 text-sm">Investidores</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-teal-400">R$2M+</p>
              <p className="text-gray-400 text-sm">Captado em 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
                Benefícios
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Por que expor sua startup?
              </h2>
              <p className="text-gray-400 mb-8">
                O Startup Expo do Growth Summit é a oportunidade perfeita para 
                apresentar sua empresa para um público qualificado de investidores, 
                potenciais clientes e parceiros estratégicos.
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 mr-3 text-teal-400 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-teal-500/20 to-orange-500/20 border border-dark-300">
                <img
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=450&fit=crop"
                  alt="Startup Expo"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 lg:py-28 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Pacotes
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Escolha sua participação
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`glass-card p-8 ${pkg.popular ? 'border-teal-500/50' : ''}`}
              >
                {pkg.popular && (
                  <Badge className="mb-4 bg-teal-500 text-white">
                    Mais Popular
                  </Badge>
                )}
                
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center mr-4">
                    {pkg.name === 'Expo' ? (
                      <Building2 className="h-6 w-6 text-teal-400" />
                    ) : (
                      <Presentation className="h-6 w-6 text-teal-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                    <p className="text-gray-400 text-sm">{pkg.description}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    R$ {pkg.price.toLocaleString()}
                  </span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-300">
                      <Check className="h-4 w-4 mr-3 text-teal-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full ${
                    pkg.popular
                      ? 'bg-teal-500 hover:bg-teal-600 text-white'
                      : 'bg-dark-100 hover:bg-dark-300 text-white border border-dark-300'
                  }`}
                >
                  Quero participar
                  <ArrowRight className="ml-2 h-4 w-4" />
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
            Pronto para decolar?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Inscreva sua startup e faça parte do ecossistema de inovação do Nordeste
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Inscrever startup
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-dark-300 text-gray-300 hover:text-white"
            >
              <Users className="h-5 w-5 mr-2" />
              Ver startups participantes
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
