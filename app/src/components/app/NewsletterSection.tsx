import { useState } from 'react';
import { Mail, Send, CheckCircle2, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { newsletterService } from '@/lib/newsletterService';
import { toast } from 'sonner';
import { useProject } from '@/contexts/ProjectContext';
import { motion, AnimatePresence } from 'framer-motion';

const INTERESTS = [
  { id: 'ia', label: 'IA & Inovação' },
  { id: 'growth', label: 'Growth Marketing' },
  { id: 'gestao', label: 'Gestão Exponencial' },
  { id: 'vendas', label: 'Vendas & Negociação' },
  { id: 'investimentos', label: 'Investimentos & M&A' },
];

export function NewsletterSection() {
  const { selectedProject } = useProject();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Preencha seu nome e e-mail corretamente');
      return;
    }

    setStatus('loading');
    try {
      await newsletterService.subscribe({
        name: formData.name,
        email: formData.email,
        interests: selectedInterests,
        source: 'Global Newsletter Section',
        project_id: selectedProject?.id
      });
      
      setStatus('success');
      toast.success('Inscrição confirmada! Verifique seu e-mail em breve.');
      setFormData({ name: '', email: '' });
      setSelectedInterests([]);
    } catch (error) {
      console.error('Newsletter error:', error);
      setStatus('error');
      toast.error('Ocorreu um erro ao processar sua inscrição. Tente novamente.');
    }
  };

  return (
    <section className="relative py-24 px-4 overflow-hidden bg-dark">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-brand-orange-coral/5 via-transparent to-teal-500/5 opacity-40 blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="max-w-4xl mx-auto text-center py-12"
            >
              <div className="relative inline-block mb-8">
                 <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full" />
                 <div className="relative w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center border border-teal-500/30 shadow-glow-teal/20">
                    <CheckCircle2 className="h-12 w-12 text-teal-400" />
                 </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-6">
                 Você está <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500 underline decoration-teal-500/30">DENTRO!</span>
              </h2>
              <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                Prepare-se. O conteúdo mais exclusivo do ecossistema <span className="text-white font-bold">Growth Experience 2026</span> será enviado para você em breve.
              </p>
              <Button 
                 variant="ghost" 
                 onClick={() => setStatus('idle')}
                 className="text-teal-400 hover:text-white font-black text-xs uppercase tracking-widest border border-teal-500/20 hover:border-teal-400 transition-all rounded-full px-8 h-12"
              >
                 Fazer outra inscrição
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
            >
              {/* Content Side */}
              <div className="space-y-10">
                <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-orange-coral/10 border border-brand-orange-coral/20 text-brand-orange-coral font-black text-[10px] uppercase tracking-widest shadow-glow-orange/5"
                  >
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    CONTEÚDO MASTER 2026
                  </motion.div>
                  
                  <h2 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.9] lg:leading-[0.85]">
                    ESTRATÉGIAS <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-coral via-brand-orange-intense to-orange-400">QUE ESCALAM.</span>
                  </h2>
                  
                  <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-medium max-w-xl">
                    Insights semanais sobre IA, Growth e Gestão Exponencial vindos diretamente do epicentro do Nordeste.
                  </p>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Personalize sua experiência</p>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                   </div>
                   
                   <div className="flex flex-wrap gap-2.5">
                     {INTERESTS.map((interest, idx) => (
                       <motion.div
                         key={interest.id}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.3 + (idx * 0.05) }}
                       >
                         <Badge
                           onClick={() => toggleInterest(interest.id)}
                           className={`cursor-pointer px-5 py-2.5 rounded-[1rem] border transition-all duration-300 font-extrabold text-[10px] uppercase tracking-widest ${
                             selectedInterests.includes(interest.id)
                               ? 'bg-brand-orange-coral text-white border-brand-orange-coral shadow-glow-orange/20 scale-105'
                               : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20 hover:bg-white/10'
                           }`}
                         >
                           {interest.id === selectedInterests[idx] && <Zap className="h-3 w-3 mr-1 fill-current" />}
                           {interest.label}
                         </Badge>
                       </motion.div>
                     ))}
                   </div>
                </div>

                <div className="flex items-center gap-12 font-black text-[10px] uppercase tracking-widest text-gray-600">
                   <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-teal-500" />
                      LGPD Compliant
                   </div>
                   <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-orange-400" />
                      Zero Spam
                   </div>
                </div>
              </div>

              {/* Form Side */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange-coral to-teal-500 rounded-[3.5rem] blur opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                <div className="relative glass-card p-8 sm:p-12 border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
                  <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] px-1 flex items-center gap-2">
                          <Zap className="h-3 w-3 text-brand-orange-coral" />
                          Seu Nome
                       </label>
                       <Input
                         placeholder="João Silva"
                         required
                         value={formData.name}
                         onChange={e => setFormData({ ...formData, name: e.target.value })}
                         className="h-16 bg-white/[0.03] border-white/5 focus:border-brand-orange-coral/50 rounded-2xl text-white font-bold transition-all px-6 text-lg placeholder:text-gray-700"
                       />
                     </div>

                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] px-1 flex items-center gap-2">
                          <Mail className="h-3 w-3 text-teal-400" />
                          Seu E-mail
                       </label>
                       <Input
                         type="email"
                         placeholder="exemplo@gmail.com"
                         required
                         value={formData.email}
                         onChange={e => setFormData({ ...formData, email: e.target.value })}
                         className="h-16 bg-white/[0.03] border-white/5 focus:border-brand-orange-coral/50 rounded-2xl text-white font-bold transition-all px-6 text-lg placeholder:text-gray-700"
                       />
                     </div>

                     <div className="pt-2 flex flex-col items-center">
                       <Button
                         type="submit"
                         disabled={status === 'loading'}
                         className="w-full h-18 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-2xl shadow-glow-orange transition-all hover:scale-[1.01] active:scale-[0.98] group/btn text-sm uppercase tracking-[0.2em]"
                       >
                         {status === 'loading' ? (
                           <div className="flex items-center gap-3">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              AUTENTICANDO...
                           </div>
                         ) : (
                           <div className="flex items-center gap-2">
                              GARANTIR ACESSO MASTER
                              <Send className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                           </div>
                         )}
                       </Button>
                       
                       <p className="mt-8 text-[9px] text-gray-600 font-bold text-center uppercase tracking-[0.2em] leading-loose max-w-xs">
                         Ao entrar, você concorda com nossos <br /> 
                         <a href="/termos" className="text-gray-400 hover:text-white underline underline-offset-4">Termos de Uso</a> & <a href="/privacidade" className="text-gray-400 hover:text-white underline underline-offset-4">Privacidade</a>.
                       </p>
                     </div>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
