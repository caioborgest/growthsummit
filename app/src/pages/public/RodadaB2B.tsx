import { 
  Handshake, 
  Building2, 
  Users, 
  TrendingUp,
  Check,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const benefits = [
  "120+ reuniões de 15 minutos",
  "Matching inteligente de empresas",
  "Ambiente profissional exclusivo",
  "Captura de leads integrada",
  "Follow-up pós-evento",
];

const howItWorks = [
  {
    step: 1,
    title: "Cadastre sua empresa",
    description: "Preencha seu perfil com informações sobre seu negócio e o que busca."
  },
  {
    step: 2,
    title: "Receba matches",
    description: "Nosso algoritmo identifica as melhores oportunidades para você."
  },
  {
    step: 3,
    title: "Agende reuniões",
    description: "Escolha os horários que funcionam melhor para sua agenda."
  },
  {
    step: 4,
    title: "Faça negócios",
    description: "Participe das reuniões no dia do evento e feche parcerias."
  },
];

const packages = [
  {
    name: "Âncora",
    price: 0,
    description: "Para empresas que buscam fornecedores",
    features: [
      "Até 8 reuniões",
      "Perfil no diretório",
      "Acesso ao evento",
      "Coffee breaks",
    ],
  },
  {
    name: "Fornecedora",
    price: 750,
    description: "Para empresas que oferecem soluções",
    features: [
      "Até 15 reuniões",
      "Perfil destacado",
      "Acesso ao evento",
      "Leads capturados",
      "Relatório pós-evento",
    ],
    popular: true,
  },
];

export function RodadaB2B() {
  return (
    <div className="bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Rodada de Negócios
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Rodada B2B
            </h1>
            <p className="text-xl text-gray-400">
              Conecte-se com empresas e feche negócios em reuniões de 15 minutos
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-teal-400">120+</p>
              <p className="text-gray-400 text-sm">Reuniões</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-teal-400">60+</p>
              <p className="text-gray-400 text-sm">Empresas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-teal-400">15min</p>
              <p className="text-gray-400 text-sm">Por reunião</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-teal-400">R$400k+</p>
              <p className="text-gray-400 text-sm">Negócios em 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
              Como Funciona
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Em 4 passos simples
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-400">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-28 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
                Benefícios
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Por que participar da Rodada B2B?
              </h2>
              <p className="text-gray-400 mb-8">
                A Rodada B2B do Growth Experience é uma oportunidade única de conectar 
                sua empresa com potenciais parceiros, fornecedores e clientes em 
                um ambiente profissional e focado em resultados.
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
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=450&fit=crop"
                  alt="Rodada B2B"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
              Pacotes
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Escolha seu perfil
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
                    Recomendado
                  </Badge>
                )}
                
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center mr-4">
                    {pkg.name === 'Âncora' ? (
                      <Building2 className="h-6 w-6 text-teal-400" />
                    ) : (
                      <TrendingUp className="h-6 w-6 text-teal-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                    <p className="text-gray-400 text-sm">{pkg.description}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    {pkg.price === 0 ? 'Grátis' : `R$ ${pkg.price}`}
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
            Pronto para fazer negócios?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Cadastre sua empresa e comece a conectar com potenciais parceiros
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              <Handshake className="h-5 w-5 mr-2" />
              Cadastrar empresa
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-dark-300 text-gray-300 hover:text-white"
            >
              <Users className="h-5 w-5 mr-2" />
              Ver empresas participantes
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
