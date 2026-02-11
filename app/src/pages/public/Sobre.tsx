import { 
  Target, 
  Eye, 
  Heart, 
  TrendingUp, 
  Users, 
  Lightbulb,
  MapPin,
  Calendar,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const values = [
  {
    icon: Lightbulb,
    title: "Inovação",
    description: "Buscamos constantemente novas ideias e abordagens para impulsionar o crescimento."
  },
  {
    icon: Users,
    title: "Comunidade",
    description: "Acreditamos no poder da colaboração e do networking para transformar negócios."
  },
  {
    icon: TrendingUp,
    title: "Resultado",
    description: "Foco em métricas e resultados mensuráveis que geram impacto real."
  },
  {
    icon: Heart,
    title: "Propósito",
    description: "Comprometidos em elevar o ecossistema empreendedor do Nordeste."
  },
];

const highlights = [
  "2 dias de conteúdo intensivo",
  "10+ palestrantes renomados",
  "100+ mentorias individuais",
  "120+ reuniões B2B",
  "15 startups na Expo",
  "Networking de alta qualidade",
  "Workshops práticos",
  "Certificado de participação",
];

export function Sobre() {
  return (
    <div className="bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Sobre o Evento
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Growth Summit 2026
            </h1>
            <p className="text-xl text-gray-400">
              A maior conferência de Growth, Marketing, Vendas e IA do Nordeste, 
              reunindo os melhores especialistas e profissionais do mercado.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 border-y border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="glass-card p-8">
              <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Nossa Missão</h2>
              <p className="text-gray-400 leading-relaxed">
                Democratizar o acesso ao conhecimento de growth e inovação, conectando 
                profissionais, empreendedores e empresas do Nordeste brasileiro com as 
                melhores práticas e especialistas do mercado nacional.
              </p>
            </div>
            
            <div className="glass-card p-8">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-6">
                <Eye className="h-6 w-6 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Nossa Visão</h2>
              <p className="text-gray-400 leading-relaxed">
                Ser reconhecido como o principal evento de growth e inovação do Nordeste, 
                referência em qualidade de conteúdo, networking e geração de oportunidades 
                de negócio para toda a região.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
              Nossos Valores
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              O que nos guia
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="glass-card p-6 text-center hover:border-teal-500/30 transition-all">
                <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Info */}
      <section className="py-20 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
                O Evento
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Uma experiência completa de aprendizado e networking
              </h2>
              <p className="text-gray-400 mb-6">
                O Growth Summit 2026 acontece nos dias 21 e 22 de maio no Boulevard Hotel 
                em Juazeiro do Norte, Ceará. São dois dias intensos de conteúdo, conexões 
                e oportunidades de negócio.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center text-gray-300">
                  <Calendar className="h-5 w-5 mr-3 text-teal-400" />
                  21-22 de maio de 2026
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="h-5 w-5 mr-3 text-teal-400" />
                  Boulevard Hotel, Juazeiro do Norte
                </div>
              </div>
              
              <ul className="space-y-3">
                {highlights.map((item, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 mr-3 text-teal-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-teal-500/20 to-orange-500/20 border border-dark-300">
                <img
                  src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=450&fit=crop"
                  alt="Growth Summit"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Context */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
                  Localização
                </Badge>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Juazeiro do Norte, Ceará
                </h2>
                <p className="text-gray-400 mb-6">
                  Localizado no coração do Cariri cearense, Juazeiro do Norte é um polo 
                  de inovação e turismo com mais de 280 mil habitantes. A cidade oferece 
                  infraestrutura completa para receber eventos de grande porte.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-teal-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Boulevard Hotel</p>
                      <p className="text-gray-400 text-sm">
                        Av. Padre Cícero, 2000 - Centro<br />
                        Juazeiro do Norte - CE, 63010-000
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="aspect-video rounded-xl overflow-hidden bg-dark-100 border border-dark-300">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.1234567890123!2d-39.3156789!3d-7.2134567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMTInNDguNCJTIDM5wrAxOCc1Ni40Ilc!5e0!3m2!1spt-BR!2sbr!4v1234567890123"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '300px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Local do Evento"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
