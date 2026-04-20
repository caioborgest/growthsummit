import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Filter,
  Users,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

import { useProjects } from '@/hooks/useData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function EditionsPage() {
  const { data: projects, isLoading } = useProjects();

  const editions = (projects || []).map(p => ({
    id: p.id,
    status: p.status === 'completed' || p.status === 'concluded' ? 'concluded' : 
            p.status === 'planned' ? 'planned' : 'upcoming',
    city: `${p.city || ''}-${p.state || ''}`,
    date: p.startDate ? format(new Date(p.startDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'A definir',
    title: p.name,
    desc: p.shortDescription || p.description,
    image: (p.settings as any)?.banner || 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/espaco/growth-experience-capa.png',
    slug: p.slug
  }));

  const upcoming = editions.filter(e => e.status === 'upcoming');
  const past = editions.filter(e => e.status === 'concluded' || e.status === 'planned');

  return (
    <div className="bg-brand-grafite min-h-screen pt-24 pb-20">
      {/* Header Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center space-y-6">
          <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 px-4 py-1 font-black uppercase tracking-widest text-[10px]">
            CALENDÁRIO OFICIAL
          </Badge>
          <h1 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
            PRÓXIMAS DESTINAÇÕES <br />
            <span className="text-brand-orange text-transparent bg-clip-text bg-[image:var(--brand-gradient)]">BUSINESS</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            O GX percorre os principais polos do interior, levando conhecimento prático e networking de elite.
          </p>
        </div>
      </section>

      {/* Main Calendar Content */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="space-y-24">
          
          {/* UPCOMING EDITIONS */}
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <div className="h-px bg-white/5 flex-1" />
              <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Clock className="w-6 h-6 text-brand-orange" />
                Edições em Aberto
              </h2>
              <div className="h-px bg-white/5 flex-1" />
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {upcoming.map((edition) => (
                <motion.div
                  key={edition.id}
                  whileHover={{ y: -8 }}
                  className="bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden group flex flex-col h-full"
                >
                  <div className="h-72 relative overflow-hidden">
                    <img 
                      src={edition.image} 
                      alt={edition.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-grafite via-transparent to-transparent" />
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-brand-orange text-white">{edition.city}</Badge>
                    </div>
                  </div>
                  
                  <div className="p-10 flex flex-col flex-1 space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-brand-orange font-bold text-sm tracking-widest">
                        <Calendar className="w-4 h-4" />
                        {edition.date.toUpperCase()}
                      </div>
                      <h3 className="text-3xl font-black text-white leading-tight uppercase group-hover:text-brand-orange transition-colors">
                        {edition.title}
                      </h3>
                      <p className="text-gray-500 font-medium leading-relaxed">
                        {edition.desc}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-gray-600 uppercase mb-1">Status</p>
                        <p className="text-white font-bold text-sm">Inscrições Abertas</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-gray-600 uppercase mb-1">Vagas</p>
                        <p className="text-white font-bold text-sm">Últimas Unidades</p>
                      </div>
                    </div>

                    <Button asChild className="w-full bg-[image:var(--brand-gradient)] hover:brightness-110 text-white font-black py-8 rounded-2xl text-lg shadow-xl shadow-brand-orange/10 group/btn mt-auto">
                      <Link to={getEventLink(edition.slug)}>
                        GARANTIR INGRESSO
                        <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* PLANNED & PAST EDITIONS */}
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <div className="h-px bg-white/5 flex-1" />
              <h2 className="text-2xl font-black text-white/40 uppercase tracking-widest">Futuras & Realizadas</h2>
              <div className="h-px bg-white/5 flex-1" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {past.map((edition) => (
                <div 
                  key={edition.id}
                  className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] space-y-6 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-default"
                >
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="border-white/10 text-gray-500">{edition.city}</Badge>
                    {edition.status === 'concluded' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500/50" />
                    ) : (
                      <Clock className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-xs font-black text-gray-600 tracking-widest uppercase">{edition.date}</p>
                    <h4 className="text-xl font-bold text-white uppercase tracking-tight">{edition.title}</h4>
                    <p className="text-sm text-gray-500">{edition.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Suggest City Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="bg-[image:var(--brand-gradient)] p-1 lg:p-2 rounded-[4rem]">
            <div className="bg-brand-grafite rounded-[3.8rem] p-12 lg:p-24 text-center space-y-10">
              <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-tight">
                QUER O GX NA <span className="text-brand-orange">SUA CIDADE?</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
                Se você é um parceiro estratégico, líder associativo ou gestor público e deseja 
                fomentar o ecossistema local, fale com nosso time de expansão.
              </p>
              <Button asChild size="lg" className="bg-white text-dark hover:bg-brand-orange hover:text-white font-black px-12 h-16 rounded-2xl text-lg shadow-2xl">
                <Link to="/contato">Candidatar Minha Cidade</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
