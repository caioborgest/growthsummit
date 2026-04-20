import { motion } from 'framer-motion';
import { 
  Zap, 
  Target, 
  Users, 
  Rocket, 
  Cpu, 
  TrendingUp, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="bg-brand-grafite min-h-screen pt-24">
      {/* Hero Subpage */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-orange/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter">
              O MOVIMENTO <br />
              <span className="text-brand-orange">GROWTH EXPERIENCE</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed">
              Nascemos da necessidade de transformar o interior do Brasil em um polo de inovação, 
              conectando empresários a estratégias reais de crescimento e inteligência artificial.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">NOSSO MANIFESTO</h2>
              <div className="space-y-6 text-gray-400 text-lg leading-relaxed font-medium">
                <p>
                  Acreditamos que a distância dos grandes centros não deve ser uma barreira para 
                  o conhecimento de elite. O GX surgiu para quebrar o isolamento informacional 
                  dos empresários do sertão e do interior.
                </p>
                <p>
                  Não entregamos "palestras motivacionais". Entregamos ferramentas, frameworks 
                  e networking de alto nível para quem está no campo de batalha executando.
                </p>
                <p className="text-white font-bold">
                  Escalar faturamento, otimizar processos com IA e liderar com autoridade 
                  são os pilares do que construímos a cada edição.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Inovação Descentralizada', icon: Globe },
                { title: 'Conhecimento Prático', icon: Target },
                { title: 'Networking de Elite', icon: Users },
                { title: 'Impacto Regional', icon: TrendingUp },
              ].map((item, i) => (
                 <div key={i} className="bg-brand-grafite border border-white/5 p-8 rounded-[2rem] text-center hover:border-brand-orange/30 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                       {item.icon && <item.icon className="h-6 w-6 text-brand-orange" />}
                    </div>
                    <p className="text-white font-bold uppercase text-xs tracking-widest">{item.title}</p>
                 </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pilaras - Grid */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="text-center text-4xl font-black text-white uppercase tracking-tighter mb-20 line-clamp-1">NOSSOS PILARES ESTRATÉGICOS</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Growth Marketing', 
                desc: 'Estratégias de aquisição, retenção e escala baseadas em dados, não em achismos.',
                icon: TrendingUp
              },
              { 
                title: 'Inteligência Artificial', 
                desc: 'Implementação prática de IA para ganhar produtividade e reduzir custos operacionais.',
                icon: Cpu
              },
              { 
                title: 'Liderança & Vendas', 
                desc: 'Formação de times de alta performance e processos de vendas que convertem o ano todo.',
                icon: Rocket
              }
            ].map((pilar, i) => (
              <div key={i} className="glass-card p-10 border-white/5 hover:border-brand-orange/20 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-brand-orange/10 transition-all" />
                <p className="text-7xl font-black text-white/5 absolute top-4 right-8 select-none">0{i+1}</p>
                <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-8">
                  <pilar.icon className="h-7 w-7 text-brand-orange" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">{pilar.title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">{pilar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline/History (Simplified) */}
      <section className="py-24 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center space-y-16">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">COMO TUDO COMEÇOU</h2>
          <div className="max-w-3xl mx-auto space-y-12 relative text-left">
             <div className="absolute left-6 top-2 bottom-2 w-px bg-white/5 hidden sm:block" />
             {[
               { year: '2023', event: 'O Nascimento', desc: 'Fundação da CBX Growth e a idealização de um evento que falasse a língua do interior.' },
               { year: '2024', event: 'Primeira Edição', desc: 'Lançamento em Juazeiro do Norte com recorde de público e validação do modelo.' },
               { year: '2025', event: 'O Circuito', desc: 'Expansão para 4 cidades e consolidação da marca GX como referência regional.' },
               { year: '2026', event: 'A Nova Era', desc: 'O maior calendário da história, com foco em Inteligência Artificial e escala nacional.' }
             ].map((step, i) => (
               <div key={i} className="flex gap-8 items-start group">
                 <div className="w-12 h-12 rounded-full border-2 border-brand-orange bg-brand-grafite z-10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all">
                    <span className="text-white font-black text-xs">{step.year}</span>
                 </div>
                 <div className="space-y-2">
                   <h4 className="text-xl font-bold text-white group-hover:text-brand-orange transition-colors uppercase">{step.event}</h4>
                   <p className="text-gray-500 font-medium">{step.desc}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center bg-[image:var(--brand-gradient)] p-16 rounded-[3rem] shadow-2xl shadow-brand-orange/20">
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-8 leading-tight">
            FAÇA PARTE DA PRÓXIMA <br /> PÁGINA DESTA HISTÓRIA
          </h2>
          <Button asChild size="lg" className="bg-white text-dark hover:bg-black hover:text-white font-black px-12 h-16 rounded-2xl text-lg shadow-xl group transition-all">
            <Link to="/inscricoes">
              QUERO ME INSCREVER
              <Rocket className="ml-2 h-5 w-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

// Internal icons helper since Globe was missing in imports
function Globe({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
