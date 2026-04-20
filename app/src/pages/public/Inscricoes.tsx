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
import { getStorageUrl } from '@/lib/storage';
import { motion } from 'framer-motion';

const trustBadges = [
  "Pagamento seguro",
  "Cancelamento até 30 dias",
  "Certificado garantido",
  "Suporte 24/7",
];

const editions = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Growth Experience Triunfo - Pocket Edition (Noturno)',
    city: 'Triunfo-PE',
    date: '15 de Maio de 2026',
    description: 'A Maior Exposição de Negócios do Sertão do Pajeú. Imersão completa em Growth e IA.',
    price: 0,
    proPrice: 179.99,
    image: getStorageUrl('event-images', 'espaco/gxexperience-noite.png'),
    slug: 'growth-experience-triunfo',
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
    id: 'b2c3d4e5-f678-9012-bcde-f01234567890',
    name: 'GX Experience Petrolina',
    city: 'Petrolina-PE',
    date: '20 de Junho de 2026',
    description: 'Edição Vale - Imersão intensiva de Growth e IA no Vale do São Francisco.',
    price: 0,
    proPrice: 179.99,
    image: getStorageUrl('caretas-triunfo', 'petrolina.jpeg'),
    slug: 'ge-petrolina-pocket-edition-2026',
    color: 'coral',
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
        startDate: edition.slug === 'growth-experience-triunfo' ? '2026-05-15' : '2026-06-20',
        endDate: edition.slug === 'growth-experience-triunfo' ? '2026-05-15' : '2026-06-20',
        status: 'active',
        settings: {
          maxRegistrations: edition.slug === 'growth-experience-triunfo' ? 1500 : 500,
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
    <div className="bg-brand-grafite min-h-screen pt-24">
      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-grafite via-black/20 to-brand-grafite" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 px-6 py-2 rounded-full font-black tracking-widest text-[10px]">
              INSCRIÇÕES ABERTAS 2026
            </Badge>
            <h1 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
              GARANTA SEU LUGAR NA <br />
              <span className="text-brand-orange text-transparent bg-clip-text bg-[image:var(--brand-gradient)]">PRÓXIMA ESCALA</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
              Escolha a edição do Growth Experience 2026 e faça parte do maior movimento de negócios do interior.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center text-gray-500 gap-3 group">
                <Shield className="h-5 w-5 text-brand-orange group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Edition Cards */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {editions.map((edition) => (
              <div
                key={edition.id}
                className="group relative bg-white/5 border border-white/5 rounded-[3.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-brand-orange/30 shadow-2xl flex flex-col"
              >
                {/* Image Header */}
                <div className="relative h-80 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-grafite via-transparent to-transparent z-10" />
                  <img
                    src={edition.image}
                    alt={edition.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-40 group-hover:opacity-100"
                  />
                  <div className="absolute top-8 left-8 z-20">
                    <Badge className="bg-brand-orange text-white border-none px-6 py-1.5 font-black uppercase tracking-widest text-[10px]">
                      {edition.tag}
                    </Badge>
                  </div>
                  <div className="absolute bottom-8 left-8 z-20">
                    <div className="flex items-center gap-3 text-white font-black text-2xl uppercase tracking-tight mb-1">
                      <MapPin className="h-6 w-6 text-brand-orange" />
                      {edition.city}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 font-bold uppercase text-xs tracking-widest">
                      <Calendar className="h-4 w-4" />
                      {edition.date}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-10 flex flex-col flex-1">
                  <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter leading-none group-hover:text-brand-orange transition-colors">
                    {edition.name}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/10">
                      <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1.5">Ingresso Social</p>
                      <p className="text-3xl font-black text-white">Grátis</p>
                    </div>
                    <div className="p-5 rounded-3xl bg-brand-orange/10 border border-brand-orange/20">
                      <p className="text-[10px] uppercase font-bold text-brand-orange tracking-widest mb-1.5">Upgrade Pro</p>
                      <p className="text-3xl font-black text-brand-orange">R$ 179,99</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-12 flex-1">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Experiências Inclusas</p>
                    {edition.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-4 text-gray-400">
                        <Check className="h-5 w-5 text-brand-orange flex-shrink-0 mt-0.5" />
                        <span className="font-medium text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full h-16 rounded-2xl bg-white text-dark hover:bg-brand-orange hover:text-white font-black text-lg transition-all duration-300 group/btn shadow-xl shadow-white/5"
                    onClick={() => handleEditionSelect(edition)}
                    disabled={isLoadingProject === edition.id}
                  >
                    {isLoadingProject === edition.id ? (
                      <span className="flex items-center gap-3">
                        <Rocket className="h-6 w-6 animate-bounce" />
                        PREPARANDO...
                      </span>
                    ) : (
                      <>
                        <CreditCard className="h-6 w-6 mr-3 group-hover/btn:scale-110 transition-transform" />
                        QUERO MINHA VAGA
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--brand-gradient)] opacity-5 blur-[120px]" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 lg:px-8 text-center space-y-10">
          <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-tight">
            NÃO FIQUE DE FORA DO <br />
            <span className="text-brand-orange">MAIOR EVENTO DO ANO</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10">
                <Users className="h-5 w-5 text-brand-orange" />
                <span className="text-white font-bold text-sm uppercase">+3.500 Participantes</span>
             </div>
             <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10">
                <Star className="h-5 w-5 text-brand-orange" />
                <span className="text-white font-bold text-sm uppercase">Experiência Elite</span>
             </div>
          </div>
          <Button
            className="bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-dark px-12 h-20 rounded-3xl font-black text-xl transition-all shadow-2xl"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            VOLTAR AO TOPO E ESCOLHER
            <ArrowRight className="ml-3 h-6 w-6" />
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
