import { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { newsletterService } from '@/lib/newsletterService';
import { toast } from 'sonner';
import { useProject } from '@/contexts/ProjectContext';

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
        source: 'Landing Page Section',
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
    } finally {
      // Return to idle after some time if success
      if (status === 'success') {
        setTimeout(() => setStatus('idle'), 5000);
      }
    }
  };

  if (status === 'success') {
    return (
      <section className="bg-dark-200/50 backdrop-blur-xl border border-white/5 py-24 px-4 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange-coral/5 to-teal-500/5 opacity-30" />
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-in zoom-in-95 duration-700">
          <div className="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-glow-teal/20">
             <CheckCircle2 className="h-12 w-12 text-teal-400" />
          </div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Você está <span className="text-teal-400">DENTRO!</span></h2>
          <p className="text-gray-400 text-lg font-medium max-w-2xl mx-auto mb-10">
            Sua inscrição na newsletter Master do Growth Experience foi confirmada. Prepare-se para receber conteúdos que vão hackear seu crescimento.
          </p>
          <Button 
             variant="ghost" 
             onClick={() => setStatus('idle')}
             className="text-teal-400 hover:text-white font-black text-xs uppercase tracking-widest"
          >
             Fazer outra inscrição
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-dark-200/50 backdrop-blur-xl border border-white/5 py-24 px-4 overflow-hidden relative group">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-orange-coral/10 rounded-full blur-[120px] -z-10 -translate-y-1/2 pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] -z-10 translate-y-1/2 pointer-events-none opacity-50" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content side */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-coral/10 border border-brand-orange-coral/20 text-brand-orange-coral font-black text-[10px] uppercase tracking-widest animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              CONTEÚDO EXCLUSIVO 2026
            </div>
            
            <h2 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-[0.95]">
              EXPANDA SUA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-coral to-brand-orange-intense">VISÃO DE CRESCIMENTO</span>
            </h2>
            
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              Receba insights semanais sobre IA aplicada a negócios, estratégias de Growth que escalaram as maiores empresas da região e convites exclusivos para mentorias fechadas.
            </p>

            <div className="space-y-4 pt-4">
               <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Selecione seus interesses principais:</p>
               <div className="flex flex-wrap gap-2">
                 {INTERESTS.map(interest => (
                   <Badge
                     key={interest.id}
                     onClick={() => toggleInterest(interest.id)}
                     className={`cursor-pointer px-4 py-2 rounded-xl border transition-all duration-300 font-extrabold text-[10px] uppercase tracking-widest ${
                       selectedInterests.includes(interest.id)
                         ? 'bg-brand-orange-coral text-white border-brand-orange-coral shadow-glow-orange/20'
                         : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20 hover:bg-white/10'
                     }`}
                   >
                     {interest.label}
                   </Badge>
                 ))}
               </div>
            </div>
          </div>

          {/* Form side */}
          <div className="glass-card p-8 sm:p-12 border-white/5 rounded-[3rem] relative shadow-2xl overflow-hidden group-hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Mail className="h-32 w-32 text-white" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] px-1">Seu Nome Completo</label>
                 <Input
                   placeholder="Como quer ser chamado?"
                   required
                   value={formData.name}
                   onChange={e => setFormData({ ...formData, name: e.target.value })}
                   className="h-14 bg-dark-100 border-white/5 focus:border-brand-orange-coral/50 rounded-2xl text-white font-bold transition-all px-6"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] px-1">Endereço de E-mail</label>
                 <Input
                   type="email"
                   placeholder="seu@melhoremail.com"
                   required
                   value={formData.email}
                   onChange={e => setFormData({ ...formData, email: e.target.value })}
                   className="h-14 bg-dark-100 border-white/5 focus:border-brand-orange-coral/50 rounded-2xl text-white font-bold transition-all px-6"
                 />
               </div>

               <div className="pt-4 flex flex-col items-center">
                 <Button
                   type="submit"
                   disabled={status === 'loading'}
                   className="w-full h-16 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-2xl shadow-glow-orange transition-all hover:scale-[1.02] active:scale-95 group/btn"
                 >
                   {status === 'loading' ? (
                     <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        PROCESSANDO...
                     </div>
                   ) : (
                     <div className="flex items-center gap-2">
                        GARANTIR MEU ACESSO MASTER
                        <Send className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                     </div>
                   )}
                 </Button>
                 
                 <p className="mt-6 text-[10px] text-gray-600 font-bold text-center uppercase tracking-widest leading-loose">
                   Ao assinar, você concorda em receber comunicações <br /> 
                   em conformidade com a nossa <a href="/privacidade" className="text-gray-400 hover:text-white underline underline-offset-4">Política de Privacidade</a>.
                 </p>
               </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
