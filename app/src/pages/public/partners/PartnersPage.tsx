import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Target, 
  BarChart3, 
  Handshake, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Globe,
  PieChart,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useData } from '@/hooks/useData';
import { Partner } from '@/types';

const stats = [
  { label: 'Público Qualificado', val: '95%', icon: Target },
  { label: 'Tomadores de Decisão', val: '70%', icon: BarChart3 },
  { label: 'Cidades Impactadas', val: '12+', icon: Globe },
  { label: 'ROAS Médio do Parceiro', val: '4.5x', icon: TrendingUp },
];

const quotasStatic = [
  {
    name: 'Cota Exclusive',
    range: 'Master do Circuito',
    features: [
      'Naming Rights da Arena Principal',
      'Minidocumentário da Marca',
      '10 Ingressos VIP / 50 Standard',
      'Destaque no Header do Site',
      'Participação em Rodada de Negócios Exclusive'
    ],
    highlight: true
  },
  {
    name: 'Cota Business',
    range: 'Suporte Regional',
    features: [
      'Logo em toda comunicação Visual',
      'Stand na Área de Networking',
      '5 Ingressos Pro / 20 Standard',
      'Mídia em Vídeo nos Intervalos',
      'Mention nas Redes Sociais GX'
    ],
    highlight: false
  },
  {
    name: 'Cota Regional',
    range: 'Apoio Local',
    features: [
      'Logo em Painéis de Patrocínio',
      'Distribuição de Brindes',
      '3 Ingressos Standard',
      'Mention no Guia do Participante'
    ],
    highlight: false
  }
];

const OFFICIAL_PARTNERS = [
  { id: 'p1', name: "CBX Growth", logoUrl: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/logomarca-cbx-growth-ia.png", tier: "diamond" },
  { id: 'p2', name: "Fitness Exclusive", logoUrl: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/leandro-batista.jpeg", tier: "platinum" },
  { id: 'p3', name: "Cedan Rações", logoUrl: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/joao-daniel.png", tier: "gold" },
  { id: 'p4', name: "Grupo Núcleo", logoUrl: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/vanylton-matias.png", tier: "gold" }
];

export function PartnersPage() {
  const { data: partnersData, isLoading } = useData<Partner>([], 'partners', { 
    projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // Triunfo como pivot ou global
    filters: { active: true } 
  });

  const partners = (partnersData && partnersData.length > 0) ? partnersData : OFFICIAL_PARTNERS;

  const featuredPartners = partners.filter(p => (p as any).featured || p.tier === 'platinum' || p.tier === 'diamond');
  const regionalPartners = partners.filter(p => !(p as any).featured && p.tier !== 'platinum' && p.tier !== 'diamond');
  return (
    <div className="bg-brand-grafite min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-brand-orange/5 blur-[120px] rounded-full -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 text-center space-y-8">
          <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 px-6 py-2 rounded-full font-black tracking-[0.3em] uppercase text-[10px]">
            SEJA UM PLAYER GX
          </Badge>
          <h1 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter leading-tight max-w-5xl mx-auto">
            CONECTE SUA MARCA AO <br />
            <span className="text-brand-orange text-transparent bg-clip-text bg-[image:var(--brand-gradient)]">PIB DO INTERIOR</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            O GX reúne os maiores detentores de capital e decisão de cada polo regional. 
            Não é sobre exposição, é sobre relevância.
          </p>
          <div className="pt-4">
            <Button asChild size="lg" className="bg-white text-dark hover:bg-brand-orange hover:text-white font-black px-12 h-16 rounded-2xl text-lg shadow-2xl">
              <a href="https://wa.me/5587991444155?text=Olá, tenho interesse nas cotas de patrocínio do GX 2026." target="_blank" rel="noopener noreferrer">
                Receber Mídia Kit 2026
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-brand-grafite border border-white/10 p-8 rounded-[2.5rem] text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center mx-auto">
                  <stat.icon className="h-6 w-6 text-brand-orange" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-white">{stat.val}</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional / Why Partner */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative aspect-square rounded-[4rem] overflow-hidden border border-white/10">
              <img 
                src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/espaco/growth-experience-capa.png" 
                className="w-full h-full object-cover grayscale opacity-60" 
                alt="Networking Business" 
              />
              <div className="absolute inset-0 bg-brand-orange/10 backdrop-blur-[2px]" />
            </div>
            
            <div className="order-1 lg:order-2 space-y-8">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight">
                POR QUE SER UM <br /> <span className="text-brand-orange">PARCEIRO GX?</span>
              </h2>
              <div className="space-y-6">
                {[
                  { title: "Network de Alto Escalão", desc: "Acesso a grupos de empresários que faturam múltiplos 7 e 8 dígitos." },
                  { title: "Marketing de Experiência", desc: "Fuja do óbvio. Sua marca integrada à jornada de aprendizado do participante." },
                  { title: "Impacto no ESG Regional", desc: "Sua marca associada ao desenvolvimento econômico e educacional do interior." }
                ].map((item, i) => (
                   <div key={i} className="flex gap-6 group">
                      <div className="w-1.5 h-1.5 bg-brand-orange rounded-full mt-2.5 shrink-0 group-hover:scale-150 transition-transform" />
                      <div className="space-y-1">
                        <h4 className="text-white font-bold text-lg">{item.title}</h4>
                        <p className="text-gray-400 font-medium">{item.desc}</p>
                      </div>
                   </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quotas Section */}
      <section className="py-24 lg:py-32 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">COTAS DISPONÍVEIS</h2>
            <div className="w-24 h-1.5 bg-brand-orange mx-auto rounded-full" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {quotasStatic.map((quota, i) => (
              <div 
                key={i} 
                className={`p-10 rounded-[3rem] border flex flex-col h-full transition-all duration-500 hover:scale-[1.02] ${
                  quota.highlight 
                    ? 'bg-white/5 border-brand-orange/40 shadow-3xl shadow-brand-orange/10 ring-1 ring-brand-orange/20' 
                    : 'bg-brand-grafite border-white/5'
                }`}
              >
                <div className="space-y-2 mb-10 text-center lg:text-left">
                  {quota.highlight && <Badge className="bg-brand-orange text-white mb-2">MAIS RELEVANTE</Badge>}
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">{quota.name}</h3>
                  <p className="text-brand-orange font-bold text-sm tracking-widest uppercase">{quota.range}</p>
                </div>

                <ul className="space-y-5 flex-1">
                  {quota.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-400 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-12">
                   <Button asChild className={`w-full py-8 rounded-2xl font-black uppercase tracking-widest ${
                     quota.highlight 
                      ? 'bg-[image:var(--brand-gradient)] text-white' 
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                   }`}>
                     <Link to="/contato">Consultar Disponibilidade</Link>
                   </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Ecosystem / Logos */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center space-y-16">
          <h2 className="text-2xl font-black text-white/40 uppercase tracking-[0.4em]">NOSSO ECOSSISTEMA</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-12 w-12 text-brand-orange animate-spin opacity-20" />
            </div>
          ) : partners.length > 0 ? (
            <div className="flex flex-wrap justify-center items-center gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              {partners.map((partner, i) => (
                <motion.div 
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {partner.logoUrl ? (
                    <img 
                      src={partner.logoUrl} 
                      className="h-12 w-auto object-contain max-w-[160px]" 
                      alt={partner.name} 
                    />
                  ) : (
                    <div className="h-12 px-6 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-white font-black italic uppercase text-xs">
                      {partner.name}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale items-center">
               <img src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/logomarca-cbx-growth-ia.png" className="h-10 w-auto" alt="" />
               <div className="h-10 w-32 bg-white/10 rounded-lg" />
               <div className="h-10 w-24 bg-white/10 rounded-lg" />
            </div>
          )}
        </div>
      </section>

      {/* Contact Section Footer */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
           <div className="bg-brand-orange/10 border border-brand-orange/20 p-12 lg:p-20 rounded-[4rem] text-center space-y-8">
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-tight">
                SUA MARCA MERECE O <br /> <span className="text-brand-orange">PALCO PRINCIPAL</span>
              </h2>
              <p className="text-lg text-gray-400 font-medium">
                Agende uma call com nosso gestor de parcerias para entender como podemos estruturar 
                seu posicionamento em uma ou mais edições do circuito.
              </p>
              <Button asChild size="lg" className="bg-white text-dark hover:bg-black hover:text-white font-black px-12 h-16 rounded-2xl text-lg group transition-all">
                <Link to="/contato">
                  FALAR COM O COMERCIAL
                  <Handshake className="ml-2 w-6 h-6" />
                </Link>
              </Button>
           </div>
        </div>
      </section>
    </div>
  );
}
