import { motion } from 'framer-motion';
import { 
  Rocket, 
  Users, 
  Zap, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Star, 
  ArrowRight,
  Target,
  Trophy,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

import { useProjects, useSponsors } from '@/hooks/useData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function HomePage() {
  const { data: projects } = useProjects();
  const { data: sponsors } = useSponsors();

  // Filtrar apenas edições futuras de 2026 para a Home
  const upcomingEvents = (projects || [])
    .filter(p => (p.status === 'active' || p.status === 'published') && p.startDate?.includes('2026'))
    .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))
    .slice(0, 2); // Apenas os 2 próximos para manter o layout

  // Filtrar patrocinadores de destaque para a grid de logos
  const featuredSponsors = (sponsors || [])
    .filter(s => s.featured || s.isPublic)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  const getEventLink = (slug: string) => {
    if (slug.includes('triunfo')) return '/triunfo';
    if (slug.includes('petrolina')) return '/petrolina';
    return `/evento/${slug}`;
  };

  return (
    <div className="bg-brand-grafite min-h-screen overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[120px] animate-pulse delay-700" />
          <div className="absolute inset-0 bg-[url('https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/grid-layer.png')] opacity-[0.03]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center text-center max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants}>
              <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 px-4 py-1.5 rounded-full mb-8 font-black tracking-widest uppercase text-[10px]">
                O MAIOR CIRCUITO DE GROWTH DO NORDESTE
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-[1.1] mb-8 uppercase tracking-tighter"
            >
              ESCALANDO O <span className="text-transparent bg-clip-text bg-[image:var(--brand-gradient)]">INTERIOR</span> DO BRASIL
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed font-medium"
            >
              Uma jornada épica de Growth, Inteligência Artificial e Liderança. 
              Conectamos empresários a estratégias que dominam o mercado.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Button asChild size="lg" className="bg-[image:var(--brand-gradient)] hover:brightness-110 text-white font-black px-12 h-16 rounded-2xl text-lg shadow-2xl shadow-brand-orange/20 group">
                <Link to="/inscricoes">
                  GARANTIR MEU INGRESSO
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold px-10 h-16 rounded-2xl text-lg transition-all">
                <Link to="/sobre">SAIBA MAIS</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. O QUE É O GX */}
      <section className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                  MUITO MAIS QUE UM EVENTO, <br />
                  <span className="text-brand-orange">UM MOVIMENTO</span>
                </h2>
                <div className="w-20 h-1.5 bg-brand-orange rounded-full" />
              </div>
              
              <p className="text-lg text-gray-400 leading-relaxed font-medium">
                O GX não é apenas uma conferência. É um ambiente de elite projetado para empresários, 
                gestores e líderes que não se contentam com o básico. Nascemos para descentralizar 
                o conhecimento de ponta e levar o que há de mais moderno em escala empresarial para o interior.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                {[
                  { icon: Target, title: "Foco em Escala", desc: "Metodologias práticas de Growth Hacking." },
                  { icon: Globe, title: "Regionalismo", desc: "Focado nas dores e potências do sertão." }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center mb-4">
                      <item.icon className="h-6 w-6 text-brand-orange" />
                    </div>
                    <h4 className="text-white font-bold mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl"
            >
              <img 
                src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/espaco/growth-talk.png" 
                alt="GX Experience"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-grafite/80 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. PARA QUEM É O GX (Badges) */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-4">
              O AMBIENTE IDEAL PARA:
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['Empreendedores', 'C-Levels', 'Gestores de Marketing', 'Líderes de Vendas', 'Donos de Agência', 'Produtores Rurais Tech'].map((item) => (
                <Badge key={item} variant="outline" className="px-6 py-2 rounded-full border-white/10 text-gray-400 font-bold hover:border-brand-orange hover:text-white transition-all cursor-default">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. EDIÇÕES ANTERIORES (Stats) */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Participantes', val: '+3.500', icon: Users },
              { label: 'Mapeadas', val: '12 Cidades', icon: MapPin },
              { label: 'Negócios Gerados', val: '+R$ 5M', icon: Trophy },
              { label: 'Palestrantes', val: '+80', icon: Star },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/5 mb-6 group-hover:border-brand-orange/30 transition-colors">
                  <stat.icon className="h-8 w-8 text-brand-orange" />
                </div>
                <h3 className="text-4xl font-black text-white mb-2">{stat.val}</h3>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRÓXIMAS EDIÇÕES (Cards) */}
      <section className="py-24 lg:py-32 relative overflow-hidden" id="edicoes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="space-y-4">
              <Badge className="bg-brand-orange text-white border-none px-4 py-1.5 rounded-full font-black tracking-widest uppercase text-[10px]">
                CALENDÁRIO 2026
              </Badge>
              <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter">
                ESCOLHA SUA <span className="text-brand-orange">JORNADA</span>
              </h2>
            </div>
            <Button asChild variant="ghost" className="text-brand-orange font-bold uppercase tracking-widest hover:bg-brand-orange/10">
              <Link to="/edicoes">Ver todas as datas <ChevronRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {upcomingEvents.map((event) => (
              <motion.div 
                key={event.id}
                whileHover={{ y: -10 }}
                className="group relative h-[500px] rounded-[3rem] overflow-hidden border border-white/10"
              >
                <img 
                  src={(event.settings as any)?.banner || "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/espaco/growth-experience-capa.png"} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={event.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-grafite via-brand-grafite/40 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10">
                  <Badge className="bg-brand-orange mb-4 uppercase">{event.city} - {event.state}</Badge>
                  <h3 className="text-3xl font-black text-white mb-2 uppercase">
                    {event.startDate ? format(new Date(event.startDate), "dd 'DE' MMMM", { locale: ptBR }) : 'EM BREVE'}
                  </h3>
                  <p className="text-gray-300 font-medium mb-6 line-clamp-2">{event.shortDescription || event.description}</p>
                  <Button asChild className="w-full bg-white text-dark hover:bg-brand-orange hover:text-white font-black py-6 rounded-2xl shadow-2xl">
                    <Link to={getEventLink(event.slug)}>GARANTIR VAGA</Link>
                  </Button>
                </div>
              </motion.div>
            ))}

            {upcomingEvents.length === 0 && (
              <div className="md:col-span-2 py-20 text-center glass-card border-dashed border-white/10 rounded-[3rem]">
                <Calendar className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest">Nenhuma edição confirmada para o momento</p>
                <p className="text-gray-600 text-xs mt-1">Inscreva-se em nossa newsletter para receber novidades.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. POR QUE SER PARCEIRO (Institutional) */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-grafite border border-white/5 rounded-[4rem] p-12 lg:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[image:var(--brand-gradient)] opacity-[0.03] blur-[150px]" />
            <div className="relative z-10 grid lg:grid-cols-5 gap-16 items-center">
              <div className="lg:col-span-3 space-y-8 text-center lg:text-left">
                <h2 className="text-4xl sm:text-5xl font-black text-white uppercase leading-tight">
                  POSICIONE SUA MARCA NO <br />
                  <span className="text-brand-orange">CENTRO DO ECOSSISTEMA</span>
                </h2>
                <p className="text-lg text-gray-400 font-medium leading-relaxed">
                  Buscamos parceiros que queiram impactar o PIB regional. Ao se tornar um parceiro GX, 
                  sua empresa tem acesso direto aos decisores e movimentadores da economia local.
                </p>
                <Button asChild size="lg" className="bg-white text-dark hover:bg-brand-orange hover:text-white font-black px-12 h-16 rounded-2xl text-lg">
                  <Link to="/parceiros">QUERO SER PARCEIRO</Link>
                </Button>
              </div>
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {[
                  { label: "VDP", val: "R$ 500k+" },
                  { label: "Leads Qualificados", val: "200+" },
                  { label: "Networking", val: "C-Levels" },
                  { label: "Brand", val: "Posicionamento" }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[2rem] text-center">
                    <p className="text-2xl font-black text-white mb-1 uppercase tracking-tight">{item.val}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. GRID DE LOGOS (Trust) */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-12">EMPRESAS QUE CONFIAM NO MOVIMENTO</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
             {featuredSponsors.length > 0 ? (
               featuredSponsors.map((sponsor) => (
                 <img 
                    key={sponsor.id}
                    src={sponsor.logoUrl || sponsor.logo} 
                    className="h-10 md:h-12 w-auto object-contain max-w-[150px]" 
                    alt={sponsor.name} 
                 />
               ))
             ) : (
               <>
                 <img src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/logomarca-cbx-growth-ia.png" className="h-10 w-auto" alt="CBX Growth" />
                 <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse" />
                 <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse" />
               </>
             )}
          </div>
        </div>
      </section>

      {/* 8. DEPOIMENTOS (Placeholder) */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="bg-white/5 border border-white/5 p-12 lg:p-20 rounded-[3rem] text-center">
            <Star className="h-10 w-10 text-brand-orange mx-auto mb-8" />
            <p className="text-2xl text-white font-bold italic leading-relaxed mb-8">
              "O Growth Experience mudou nossa forma de enxergar o mercado. Em 6 meses, escalamos 
              nossa operação em 40% usando as metodologias aplicadas na imersão."
            </p>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/10 mb-4 overflow-hidden">
                <div className="flex items-center justify-center h-full text-white font-black">C</div>
              </div>
              <p className="text-white font-black uppercase text-sm tracking-widest">Caio Borges</p>
              <p className="text-gray-500 text-xs font-bold uppercase mt-1">CEO, CBX Growth</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA FINAL */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--brand-gradient)] opacity-10 blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter mb-8 leading-tight">
            ESTÁ PRONTO PARA <br />
            <span className="text-brand-orange">DOMINAR O MERCADO?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium">
            Junte-se à maior comunidade de Growth do Nordeste. As vagas são limitadas por edição.
          </p>
          <Button asChild size="lg" className="bg-[image:var(--brand-gradient)] hover:brightness-110 text-white font-black px-16 h-20 rounded-3xl text-xl shadow-2xl shadow-brand-orange/30 group">
            <Link to="/inscricoes">
              GARANTIR MINHA VAGA AGORA
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
