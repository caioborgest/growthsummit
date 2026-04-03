import { useState } from 'react';
import {
  Check,
  Star,
  Zap,
  ArrowRight,
  Shield,
  CreditCard,
  MapPin,
  Calendar,
  Rocket,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { EVENT_CONFIG } from '@/config/eventConfig';
import { InscricaoMultiStepModal } from '@/components/forms/InscricaoMultiStepModal';
import { useProject } from '@/contexts/ProjectContext';
import { ensureProject } from '@/lib/ensureProject';

const trustBadges = [
  "Pagamento seguro",
  "Cancelamento até 30 dias",
  "Certificado garantido",
  "Suporte 24/7",
];

const editions = [
  {
    name: 'Growth Experience Triunfo - Pocket Edition (Noturno)',
    city: 'Triunfo-PE',
    date: '16 de Abril de 2026',
    description: 'A Maior Exposição de Negócios do Sertão do Pajeú. Imersão completa em Growth e IA.',
    price: 0,
    proPrice: 179.99,
    image: 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/espaco/gxexperience-noite.png',
    slug: 'ge-triunfo-pocket-edition-noturno-2026',
    color: 'orange',
    tag: 'Edição Flagship',
    features: [
      'Cursos e Workshops Gratuitos',
      'Rodada de Negócios B2B',
      'Arena Pitch para Startups',
      'Palestras Noturnas (Upgrade Pro)'
    ]
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    name: 'Growth Experience Petrolina',
    city: 'Petrolina-PE',
    date: '30 de Abril de 2026',
    description: 'Edição Vale - Imersão intensiva de Growth e IA no Vale do São Francisco.',
    price: 0,
    proPrice: 179.99,
    image: 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/caretas-triunfo/petrolina.jpeg',
    slug: 'ge-petrolina-pocket-edition-2026',
    color: 'teal',
    tag: 'Edição Vale',
    features: [
      'Capacitação em Growth e IA',
      'Networking Regional de Alto Nível',
      'Night Experience com Especialistas',
      'Certificação Digital Inclusa'
    ]
  }
];

export function Inscricoes() {
  const { setSelectedProject } = useProject();
  const [modalInscricaoAberto, setModalInscricaoAberto] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState<string | null>(null);

  const handleEditionSelect = async (edition: typeof editions[0]) => {
    setIsLoadingProject(edition.id);
    try {
      const project = await ensureProject({
        id: edition.id,
        name: edition.name + ' 2026',
        slug: edition.slug,
        type: 'growth_experience',
        description: edition.description,
        shortDescription: edition.tag,
        location: edition.city,
        city: edition.city.split('-')[0],
        state: edition.city.split('-')[1],
        startDate: edition.slug === 'ge-triunfo-2026' ? '2026-04-16' : '2026-04-30',
        endDate: edition.slug === 'ge-triunfo-2026' ? '2026-04-16' : '2026-04-30',
        status: 'active',
        settings: {
          maxRegistrations: edition.slug === 'ge-triunfo-2026' ? 1500 : 500,
          enableB2B: true,
          enableMentoring: true,
          enableStartups: true,
          enableCheckIn: true,
          ticketPrices: {
            standard: edition.price,
            pro: edition.proPrice,
            vip: 0,
          },
        },
      });

      if (project) {
        logger.debug(`[Inscricoes] Iniciando modal para: ${project.name} (DB ID: ${project.id})`);
        setSelectedProject(project);
        setModalInscricaoAberto(true);
      }
    } finally {
      setIsLoadingProject(null);
    }
  };

  return (
    <div className="bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-12 sm:py-20 lg:py-28 overflow-hidden pt-[calc(var(--sat)+3rem)]">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-orange-coral/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-6 py-2">
              INSCRIÇÕES ABERTAS
            </Badge>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-6 uppercase tracking-tight">
              Garanta sua <span className="text-gradient">Vaga</span>
            </h1>
            <p className="text-xl text-gray-400">
              Escolha a edição do Growth Experience 2026 e faça parte do maior movimento de negócios do interior.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 border-y border-white/5 bg-dark-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center text-gray-400">
                <Shield className="h-4 w-4 mr-2 text-brand-orange-coral" />
                <span className="text-xs font-bold uppercase tracking-widest">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Edition Cards */}
      <section className="py-12 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {editions.map((edition) => (
              <div
                key={edition.id}
                className="group relative glass-card overflow-hidden transition-all duration-500 hover:-translate-y-2 border-white/5 hover:border-brand-orange-coral/30 shadow-2xl"
              >
                {/* Image Header */}
                <div className="relative h-64 sm:h-80 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent z-10" />
                  <img
                    src={edition.image}
                    alt={edition.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
                  />
                  <div className="absolute top-6 left-6 z-20">
                    <Badge className={`bg-${edition.color}-500 text-white border-none px-4 py-1 font-black`}>
                      {edition.tag}
                    </Badge>
                  </div>
                  <div className="absolute bottom-6 left-6 z-20">
                    <div className="flex items-center gap-2 text-white font-bold text-xl sm:text-2xl mb-1">
                      <MapPin className="h-5 w-5 text-brand-orange-coral" />
                      {edition.city}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 font-medium">
                      <Calendar className="h-4 w-4 text-brand-orange-coral" />
                      {edition.date}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-10 bg-dark-100/40 backdrop-blur-xl">
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-4 group-hover:text-brand-orange-coral transition-colors uppercase tracking-tight">
                    {edition.name}
                  </h3>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    {edition.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Ingresso Social</p>
                      <p className="text-2xl font-black text-white">Grátis</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-brand-orange-coral/10 border border-brand-orange-coral/20">
                      <p className="text-[10px] uppercase font-bold text-brand-orange-coral tracking-widest mb-1">Upgrade Pro</p>
                      <p className="text-2xl font-black text-brand-orange-coral">R$ 179,99</p>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-10">
                    {edition.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-300">
                        <Check className="h-4 w-4 mr-3 text-brand-orange-coral flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full h-14 sm:h-16 rounded-2xl bg-white hover:bg-brand-orange-coral text-dark hover:text-white font-black text-base sm:text-lg transition-all duration-300 group/btn"
                    onClick={() => handleEditionSelect(edition)}
                    disabled={isLoadingProject === edition.id}
                  >
                    {isLoadingProject === edition.id ? (
                      <span className="flex items-center gap-2">
                        <Rocket className="h-5 w-5 animate-bounce" />
                        Processando...
                      </span>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-3 group-hover/btn:scale-110 transition-transform" />
                        Iniciar Inscrição
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mini Stats/Features */}
      <section className="py-20 bg-dark-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: Users, label: 'Público Alvo', val: 'Empresários e Gestores' },
              { icon: Star, label: 'Experiência', val: 'Imersão de Alto Impacto' },
              { icon: Zap, label: 'Metodologia', val: 'Growth Hacker Practical' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center mb-4 border border-brand-orange-coral/20">
                  <stat.icon className="h-6 w-6 text-brand-orange-coral" />
                </div>
                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expansion Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden bg-dark-200/30">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-orange-coral/5 blur-[120px] rounded-full translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-card p-8 lg:p-16 border-white/5 bg-gradient-to-br from-white/5 to-transparent flex flex-col lg:flex-row items-center gap-12 rounded-[2.5rem]">
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-6 bg-orange-500/10 text-orange-400 border-orange-500/30 px-6 py-2 uppercase font-black tracking-widest">
                Expansão
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 uppercase tracking-tight leading-tight">
                Leve o <span className="text-gradient">Growth Experience</span> para sua cidade
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Quer transformar o ecossistema empresarial da sua região? Buscamos empresários parceiros, prefeituras e associações para levar nossa imersão de Growth e IA a novos horizontes.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-10 text-left">
                {[
                  { title: "Metodologia Provada", desc: "Escalamos centenas de empresas tradicionais." },
                  { title: "Impacto Econômico", desc: "Fomentamos a inovação e o networking local." },
                  { title: "Networking de Elite", desc: "Acesso a speakers e mentores de nível nacional." },
                  { title: "Expansão Rápida", desc: "Modelo testado e pronto para implementação local." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-orange-coral mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-bold">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                asChild
                className="bg-white hover:bg-brand-orange-coral text-dark hover:text-white font-black px-12 h-16 rounded-2xl text-lg transition-all hover:scale-105"
              >
                <a
                  href={`https://wa.me/${EVENT_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Temos interesse em discutir a expansão do Growth Experience para nossa cidade.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar com nosso Time de Expansão
                  <ArrowRight className="ml-3 h-5 w-5" />
                </a>
              </Button>
            </div>

            <div className="lg:w-1/3 relative">
              <div className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 group">
                <img
                  src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/espaco/growth-talk.png"
                  alt="Expansão Growth Experience"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-0 hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white font-black text-xl mb-1 uppercase">Sua Cidade pode ser a próxima</p>
                  <p className="text-brand-orange-coral text-sm font-bold">Edições em Aberto 2026/27</p>
                </div>
              </div>
              {/* Floating Element */}
              <div className="absolute -top-6 -right-6 p-6 glass-card border-brand-orange-coral/30 bg-brand-orange-coral/10 animate-bounce">
                <Rocket className="h-8 w-8 text-brand-orange-coral" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Summary */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30 font-black uppercase tracking-widest px-4 py-1">
              Dúvidas
            </Badge>
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">
              Informações <span className="text-gradient">Importantes</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Posso participar das duas edições?",
                a: "Sim! Cada edição tem uma abordagem focada no ecossistema local. Você pode se inscrever separadamente para ambas."
              },
              {
                q: "O que é o Ingresso Social?",
                a: "É o seu acesso gratuito às trilhas de capacitação diurnas. Basta se inscrever e levar 1kg de alimento no dia do evento."
              },
              {
                q: "Como funciona o upgrade Pro?",
                a: "O upgrade Pro libera o acesso ao Night Experience (Palestras Magnas) e happy hour. O pagamento é feito via WhatsApp após a inscrição."
              }
            ].map((item, i) => (
              <div key={i} className="glass-card p-8 border-white/5 hover:border-white/10 transition-all">
                <h3 className="text-white font-black mb-3 uppercase tracking-wide flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-orange-coral" />
                  {item.q}
                </h3>
                <p className="text-gray-400 leading-relaxed pl-4.5">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-orange-500/5" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 uppercase tracking-tighter">
            Não fique de fora do <span className="text-gradient">maior evento do ano</span>
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de empresários que estão transformando o interior através da inovação e growth.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="border-white/10 text-gray-300 hover:text-white hover:border-brand-orange-coral px-10 py-8 rounded-2xl font-black text-lg h-auto transition-all"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Escolher minha edição
            <ArrowRight className="ml-3 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Registration Modal */}
      <InscricaoMultiStepModal
        isOpen={modalInscricaoAberto}
        onClose={() => setModalInscricaoAberto(false)}
      />
    </div>
  );
}
